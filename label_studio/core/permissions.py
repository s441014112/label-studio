"""This file and its contents are licensed under the Apache License 2.0. Please see the included NOTICE for copyright information and LICENSE for a copy of the license.
"""
import logging   # noqa: I001
from typing import Optional
#pydantic用来做数据结构校验
from pydantic import BaseModel, ConfigDict

#rules是Python 权限框架，专门管理谁能做什么
import rules

logger = logging.getLogger(__name__)

##
# 统一管理整个系统的所有权限 + 自动给所有权限绑定规则
#1.定义系统所有能用的权限（比如创建项目、删除任务、邀请成员…）
#2.把权限做成常量，避免到处乱写字符串
#3.自动给所有权限设置规则：必须登录才能使用
#4.给 API 接口做权限判断用的
##

#把系统所有权限写成固定字段，方便全局调用
class AllPermissions(BaseModel):
    model_config = ConfigDict(protected_namespaces=('__.*__', '_.*'))

    organizations_create: str = 'organizations.create'
    organizations_view: str = 'organizations.view'
    organizations_change: str = 'organizations.change'
    organizations_delete: str = 'organizations.delete'
    organizations_invite: str = 'organizations.invite'
    projects_create: str = 'projects.create'
    projects_view: str = 'projects.view'
    projects_change: str = 'projects.change'
    projects_delete: str = 'projects.delete'
    projects_reset_cache: str = 'projects.reset_cache'
    tasks_create: str = 'tasks.create'
    tasks_view: str = 'tasks.view'
    tasks_change: str = 'tasks.change'
    tasks_delete: str = 'tasks.delete'
    views_reset: str = 'views.reset'
    annotations_create: str = 'annotations.create'
    annotations_view: str = 'annotations.view'
    annotations_change: str = 'annotations.change'
    annotations_delete: str = 'annotations.delete'
    actions_perform: str = 'actions.perform'
    predictions_any: str = 'predictions.any'
    avatar_any: str = 'avatar.any'
    labels_create: str = 'labels.create'
    labels_view: str = 'labels.view'
    labels_change: str = 'labels.change'
    labels_delete: str = 'labels.delete'
    models_create: str = 'models.create'
    models_view: str = 'models.view'
    models_change: str = 'models.change'
    models_delete: str = 'models.delete'
    model_provider_connection_create: str = 'model_provider_connection.create'
    model_provider_connection_view: str = 'model_provider_connection.view'
    model_provider_connection_change: str = 'model_provider_connection.change'
    model_provider_connection_delete: str = 'model_provider_connection.delete'
    webhooks_view: str = 'webhooks.view'
    webhooks_change: str = 'webhooks.change'
    users_token_any: str = 'users.token.any'

    storages_view: str = 'storages.view'
    storages_change: str = 'storages.change'
    storages_sync: str = 'storages.sync'

    views_view: str = 'views.view'
    views_create: str = 'views.create'
    views_change: str = 'views.change'
    views_delete: str = 'views.delete'


all_permissions = AllPermissions()


#给 API 接口的每种请求方法绑定权限
class ViewClassPermission(BaseModel):
    GET: Optional[str] = None
    PATCH: Optional[str] = None
    PUT: Optional[str] = None
    DELETE: Optional[str] = None
    POST: Optional[str] = None

##
# 创建一个权限，并绑定规则
#   name：权限名，如 projects.view
#   pred：规则（比如必须登录）
#   已存在就跳过，避免重复创建
##
def make_perm(name, pred, overwrite=False):
    if rules.perm_exists(name):
        if overwrite:
            rules.remove_perm(name)
        else:
            return
    rules.add_perm(name, pred)

#遍历所有权限 → 给每个权限都设置一条规则：
# 原先rules.is_authenticated是必须登录才能使用
# 现调整为always_allow所有人都允许
for _, permission_name in all_permissions:
    make_perm(permission_name, rules.is_authenticated)
