"""This file and its contents are licensed under the Apache License 2.0. Please see the included NOTICE for copyright information and LICENSE for a copy of the license.
"""
import io
import json
import logging
import os
from wsgiref.util import FileWrapper

import pandas as pd
import requests
from core import utils
from core.feature_flags import all_flags, flag_set, get_feature_file_path
from core.label_config import generate_time_series_json
from core.translations import gettext, get_response_message, activate as i18n_activate
from core.utils.common import collect_versions
from core.utils.io import find_file
from django.conf import settings
from django.contrib.auth import logout
from django.http import HttpResponse, HttpResponseForbidden, JsonResponse
from django.shortcuts import redirect, render, reverse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from drf_spectacular.utils import extend_schema
from rest_framework.response import Response
from rest_framework.status import HTTP_200_OK
from rest_framework.views import APIView

logger = logging.getLogger(__name__)

# Label Studio 的系统总控制器
#首页跳转、登录控制、版本查看、健康检查、前端示例数据、静态文件处理、功能开关

_PARAGRAPH_SAMPLE = None


def _detect_language(request):
    lang = request.GET.get('lang') or request.META.get('HTTP_X_LANGUAGE') or (
        request.META.get('HTTP_ACCEPT_LANGUAGE', '').split(',')[0].split(';')[0].strip() if request.META.get('HTTP_ACCEPT_LANGUAGE') else None
    )
    if lang:
        i18n_activate(lang)
    return lang


#系统首页 / 登录入口
def main(request):
    user = request.user
    iam_login_url = getattr(settings, 'IAM_LOGIN_URL', '/user/login/')
    # 如果用户已登录
    if user.is_authenticated:
        # 没有活跃组织 → 强制登出，跳登录页
        if user.active_organization is None and 'organization_pk' not in request.session:
            logout(request)
            return redirect(iam_login_url)

        # 已登录 → 跳 项目列表页 or 简化主页
        # business mode access
        if flag_set('fflag_all_feat_dia_1777_ls_homepage_short', user):
            return render(request, 'home/home.html')
        else:
            return redirect(reverse('projects:project-index'))
    return redirect(iam_login_url)

#查看系统版本，返回 Label Studio 系统的版本信息（支持网页 / 接口两种格式）
def version_page(request):
    """Get platform version"""
    # update the latest version from pypi response
    # from label_studio.core.utils.common import check_for_the_latest_version
    # check_for_the_latest_version(print_message=False)
    # 判断当前访问路径是不是 /version/，如果是，说明用户在浏览器访问网页
    http_page = request.path == '/version/'
    #获取系统所有版本信息，网页访问时强制刷新版本
    result = collect_versions(force=http_page)

    #如果访问的是 /version/ → 返回网页格式
    # html / json response
    if request.path == '/version/':
        #只有超级管理员（superuser） 才能看到
        # other settings from backend
        if not getattr(settings, 'CLOUD_INSTANCE', False) and request.user.is_superuser:
            result['settings'] = {
                key: str(getattr(settings, key))
                for key in dir(settings)
                if not key.startswith('_') and not hasattr(getattr(settings, key), '__call__')
            }
        #把版本信息转成漂亮格式化的 JSON
        result = json.dumps(result, indent=2, ensure_ascii=False)
        return HttpResponse('<pre>' + result + '</pre>')
    else:
        return JsonResponse(result)

#服务健康检查
def health(request):
    """System health info"""
    _detect_language(request)
    logger.debug('Got /health request.')
    return JsonResponse({'status': 'UP', 'message': get_response_message('health.status_up')})

#指标评估的空页面
def metrics(request):
    """Empty page for metrics evaluation"""
    return HttpResponse('')

#500 响应测试
class TriggerAPIError(APIView):
    """500 response for testing"""

    authentication_classes = ()
    permission_classes = ()

    @extend_schema(exclude=True)
    def get(self, request):
        raise Exception('test')

#获取最后一个编辑器文件
def editor_files(request):
    """Get last editor files"""
    response = utils.common.find_editor_files()
    return HttpResponse(json.dumps(response), status=200)

#为预览生成时间序列示例
def samples_time_series(request):
    """Generate time series example for preview"""
    time_column = request.GET.get('time', '')
    value_columns = request.GET.get('values', '').split(',')
    time_format = request.GET.get('tf')

    # separator processing
    separator = request.GET.get('sep', ',')
    separator = separator.replace('\\t', '\t')
    aliases = {'dot': '.', 'comma': ',', 'tab': '\t', 'space': ' '}
    if separator in aliases:
        separator = aliases[separator]

    # check headless or not
    header = True
    if all(n.isdigit() for n in [time_column] + value_columns):
        header = False

    # generate all columns for headless csv
    if not header:
        max_column_n = max([int(v) for v in value_columns] + [0])
        value_columns = range(1, max_column_n + 1)

    ts = generate_time_series_json(time_column, value_columns, time_format)
    csv_data = pd.DataFrame.from_dict(ts).to_csv(index=False, header=header, sep=separator).encode('utf-8')

    # generate response data as file
    filename = 'time-series.csv'
    response = HttpResponse(csv_data, content_type='application/csv')
    response['Content-Disposition'] = f'attachment; filename="{filename}"'
    response['filename'] = filename
    return response

#为预览生成段落示例
def samples_paragraphs(request):
    """Generate paragraphs example for preview"""
    global _PARAGRAPH_SAMPLE

    if _PARAGRAPH_SAMPLE is None:
        with open(find_file('paragraphs.json'), encoding='utf-8') as f:
            _PARAGRAPH_SAMPLE = json.load(f)
    name_key = request.GET.get('nameKey', 'author')
    text_key = request.GET.get('textKey', 'text')

    result = []
    for line in _PARAGRAPH_SAMPLE:
        result.append({name_key: line['author'], text_key: line['text']})

    return HttpResponse(json.dumps(result), content_type='application/json')

#从 github 原始 liveContent. json 获取实时提示以避免缓存和客户端 CORS 问题
# 线上翻译文档 待解决
def heidi_tips(request):
    """Fetch live tips from github raw liveContent.json to avoid caching and client side CORS issues"""
    url = 'https://raw.githubusercontent.com/HumanSignal/label-studio/refs/heads/develop/web/apps/labelstudio/src/components/HeidiTips/liveContent.json'

    response = None
    try:
        response = requests.get(
            url,
            headers={'Cache-Control': 'no-cache', 'Content-Type': 'application/json', 'Accept': 'application/json'},
            timeout=5,
        )
        # Raise an exception for bad status codes to avoid caching
        response.raise_for_status()
    # Catch all exceptions and return either the status code if there was a response, or default to 404 if there are network issues
    # This is done this way to catch thrown exceptions from the request itself which will occur for air-gapped environments
    except Exception:
        # Any other HTTP error will return the error code, and other errors like connection/timeout errors will be a 404
        content = {}
        status_code = 404
        if response is not None:
            content['detail'] = response.reason
            status_code = response.status_code
        return HttpResponse(json.dumps(content), content_type='application/json', status=status_code)

    return HttpResponse(response.content, content_type='application/json')

#加载任何文件，替换 {{HOSTNAME}}=> 设置. HOSTNAME，将其作为 http 响应发送
def static_file_with_host_resolver(path_on_disk, content_type):
    """Load any file, replace {{HOSTNAME}} => settings.HOSTNAME, send it as http response"""
    path_on_disk = os.path.join(settings.STATIC_ROOT, path_on_disk)

    def serve_file(request):
        with open(path_on_disk, 'r') as f:
            body = f.read()
            body = body.replace('{{HOSTNAME}}', settings.HOSTNAME)

            out = io.StringIO()
            out.write(body)
            out.seek(0)

            wrapper = FileWrapper(out)
            response = HttpResponse(wrapper, content_type=content_type)
            response['Content-Length'] = len(body)
            return response

    return serve_file

#功能开关，返回当前用户可使用的功能特性。
def feature_flags(request):
    user = request.user
    if not user.is_authenticated:
        return HttpResponseForbidden()

    flags = all_flags(request.user)
    flags['$system'] = {
        'FEATURE_FLAGS_DEFAULT_VALUE': settings.FEATURE_FLAGS_DEFAULT_VALUE,
        'FEATURE_FLAGS_FROM_FILE': settings.FEATURE_FLAGS_FROM_FILE,
        'FEATURE_FLAGS_FILE': get_feature_file_path(),
        'VERSION_EDITION': settings.VERSION_EDITION,
        'CLOUD_INSTANCE': settings.CLOUD_INSTANCE if hasattr(settings, 'CLOUD_INSTANCE') else None,
    }

    return HttpResponse('<pre>' + json.dumps(flags, indent=4) + '</pre>', status=200)


@csrf_exempt
@require_http_methods(['POST', 'GET'])
def collect_metrics(request):
    """Lightweight endpoint to collect usage metrics from the frontend only when COLLECT_ANALYTICS is enabled"""
    return HttpResponse(status=204)


class LanguageAPI(APIView):
    """Multi-language support API — list available languages and switch language"""

    authentication_classes = ()
    permission_classes = ()

    @extend_schema(
        tags=['System'],
        summary='Get available languages',
        description='Returns the list of supported languages and the currently active language',
    )
    def get(self, request):
        _detect_language(request)
        from core.translations import get_language as i18n_get_language
        from core.translations.catalog import MESSAGE_CATALOGS, _load_catalogs
        _load_catalogs()
        current_lang = i18n_get_language()
        languages = []
        for code, name in settings.LANGUAGES:
            languages.append({
                'code': code,
                'name': name,
                'active': code == current_lang,
            })
        return Response({
            'status': 'ok',
            'current_language': current_lang,
            'languages': languages,
        })

    @extend_schema(
        tags=['System'],
        summary='Switch language',
        description='Set the active language for the current session',
    )
    def post(self, request):
        lang = request.data.get('language') or request.GET.get('lang')
        if lang:
            i18n_activate(lang)
        from core.translations import get_language as i18n_get_language
        current_lang = i18n_get_language()
        return Response({
            'status': 'ok',
            'current_language': current_lang,
            'message': get_response_message('common.operation_success'),
        })
