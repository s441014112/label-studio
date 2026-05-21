from core.utils.common import temporary_disconnect_all_signals
from django.conf import settings
from django.db import transaction
from organizations.models import Organization, OrganizationMember
from projects.models import Project


def create_organization(title, created_by, legacy_api_tokens_enabled=False, **kwargs):
    from core.feature_flags import flag_set

    JWT_ACCESS_TOKEN_ENABLED = flag_set('fflag__feature_develop__prompts__dia_1829_jwt_token_auth')

    # 数据库原子操作：要么全部成功，要么全部失败
    with transaction.atomic():
        # 1. 创建组织
        org = Organization.objects.create(title=title, created_by=created_by, **kwargs)
        # 2. 创建人自动加入组织（成为管理员）
        OrganizationMember.objects.create(user=created_by, organization=org)
        # 如果开启了 JWT 功能
        if JWT_ACCESS_TOKEN_ENABLED:
            # set auth tokens to new system for new users, unless specified otherwise
            # 给组织开启 API Token 权限
            org.jwt.api_tokens_enabled = True
            org.jwt.legacy_api_tokens_enabled = (
                legacy_api_tokens_enabled or settings.LABEL_STUDIO_ENABLE_LEGACY_API_TOKEN
            )
            org.jwt.save()
        return org


def destroy_organization(org):
    # 临时断开所有数据库信号（防止触发多余逻辑）
    with temporary_disconnect_all_signals():
        # 1. 删除该组织下所有项目
        Project.objects.filter(organization=org).delete()
        # 2. 如果有 SSO 认证，删除它
        if hasattr(org, 'saml'):
            org.saml.delete()
        # 3. 最后删除组织本身
        org.delete()
