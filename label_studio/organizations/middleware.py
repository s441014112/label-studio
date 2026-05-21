"""This file and its contents are licensed under the Apache License 2.0. Please see the included NOTICE for copyright information and LICENSE for a copy of the license.
"""
import logging

# Label Studio 的自定义中间件（Middleware）所有请求进来、出去，都会先经过这里，统一处理一遍
#强制给用户设置「默认组织」，保证系统启动后一定有组织可用，防止报错！
#1.找到系统里第一个组织
#2.如果登录用户没有设置活跃组织 → 自动给他绑定第一个组织
#3.把组织 ID 写入全局 session，保证全系统都能读到

## 导入 组织模型（Organization = 公司/团队/ workspace）
from organizations.models import Organization

logger = logging.getLogger(__name__)

# 自定义中间件：DummyGetSessionMiddleware
# 作用：自动给用户设置默认组织
class DummyGetSessionMiddleware:
    # Django 中间件固定写法：初始化
    def __init__(self, get_response):
        self.get_response = get_response

    # 每次请求都会执行这里！
    def __call__(self, request):
        # 拿数据库里【第一个组织】
        org = Organization.objects.first()
        # 获取当前请求的用户
        user = request.user
        # 如果：用户存在 + 已登录 + 没有 active_organization（活跃组织）
        if user and user.is_authenticated and user.active_organization is None:
            # 自动把第一个组织设置成他的活跃组织
            user.active_organization = org
            # 把组织ID写入 session（会话），让全局都能知道当前在哪个组织
            user.save(update_fields=['active_organization'])
        # 把组织ID写入 session（会话），让全局都能知道当前在哪个组织
        if org is not None:
            request.session['organization_pk'] = org.id
        response = self.get_response(request)
        return response
