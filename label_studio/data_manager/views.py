"""This file and its contents are licensed under the Apache License 2.0. Please see the included NOTICE for copyright information and LICENSE for a copy of the license.
"""
from core.version import get_short_version
from django.shortcuts import render
from iam_auth.decorators import iam_login_required


@iam_login_required
def task_page(request, pk):
    # 传给前端页面的数据
    # version: 把 Label Studio 版本号带给前端
    response = {'version': get_short_version()}
    # 渲染 base.html 这个前端模板
    # 并把版本号传给模板
    return render(request, 'base.html', response)
