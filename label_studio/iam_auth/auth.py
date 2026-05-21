import hashlib
import logging

import requests
from django.conf import settings
from django.contrib.auth import get_user_model, login
from django.core.cache import cache
from django.db import transaction
from rest_framework import authentication
from rest_framework.exceptions import AuthenticationFailed

from core.translations import get_response_message

logger = logging.getLogger(__name__)


def _detect_language_from_request(request):
    lang = None
    if request:
        lang = request.GET.get('lang') or request.META.get('HTTP_X_LANGUAGE') or (
            request.META.get('HTTP_ACCEPT_LANGUAGE', '').split(',')[0].split(';')[0].strip()
            if request.META.get('HTTP_ACCEPT_LANGUAGE') else None
        )
    return lang


class IAMAuthentication(authentication.BaseAuthentication):
    def authenticate(self, request):
        from iam_auth import is_iam_whitelisted

        lang = _detect_language_from_request(request)
        whitelisted = is_iam_whitelisted(request)

        auth_user_header = request.META.get('HTTP_TOKEN') or request.GET.get('token')
        auth_app_header = request.META.get('HTTP_DIGI_MIDDLEWARE_AUTH_APP') or request.GET.get('digi-middleware-auth-app')

        if not auth_user_header or not auth_app_header:
            if whitelisted:
                return None
            raise AuthenticationFailed(get_response_message('iam.auth.missing_credentials', language=lang))

        iam_data = _get_iam_data(auth_user_header, auth_app_header, lang)

        user_sid = iam_data.get('sid')
        if not user_sid:
            logger.error('IAM response missing sid: %s', iam_data)
            raise AuthenticationFailed(get_response_message('iam.auth.missing_sid', language=lang))

        with transaction.atomic():
            user, org = _sync_user_from_iam(iam_data)
            _ensure_organization_member(user, org)

        user.active_organization = org
        user.save(update_fields=['active_organization'])

        request.iam_data = iam_data

        return (user, None)


def _get_cache_key(token):
    token_hash = hashlib.sha256(token.encode()).hexdigest()
    return f'iam_auth:{token_hash}'


def _get_iam_data(token, app_id, lang=None):
    cache_key = _get_cache_key(token)
    cached = cache.get(cache_key)
    if cached is not None:
        logger.debug('IAM auth cache hit: key=%s', cache_key[:20])
        return cached

    iam_url = getattr(
        settings,
        'IAM_TOKEN_ANALYZE_URL',
        'https://iam-test.digiwincloud.com.cn/api/iam/v2/identity/token/analyze',
    )
    iam_timeout = getattr(settings, 'IAM_REQUEST_TIMEOUT', 10)
    cache_ttl = getattr(settings, 'IAM_AUTH_CACHE_TTL', 300)

    try:
        logger.info('IAM post request to %s', iam_url)
        resp = requests.post(
            iam_url,
            headers={
                'digi-middleware-auth-user': token,
                'digi-middleware-auth-app': app_id,
            },
            timeout=iam_timeout,
        )
    except requests.RequestException as e:
        logger.error('IAM auth request failed: %s', e)
        raise AuthenticationFailed(get_response_message('iam.auth.service_unavailable', language=lang))

    if resp.status_code == 401:
        logger.info('IAM auth returned HTTP 401, token expired')
        raise AuthenticationFailed(get_response_message('iam.auth.token_expired', language=lang))

    try:
        iam_data = resp.json()
    except ValueError:
        logger.error('IAM auth returned invalid JSON: %s', resp.text[:500])
        raise AuthenticationFailed(get_response_message('iam.auth.invalid_response', language=lang))

    if not iam_data.get('success', True):
        error_code = iam_data.get('errorCode', '')
        error_msg = iam_data.get('errorMessage', '')
        logger.info('IAM auth failed: code=%s, msg=%s', error_code, error_msg)
        if error_code == '20004':
            raise AuthenticationFailed(get_response_message('iam.auth.token_expired', language=lang))
        raise AuthenticationFailed(error_msg or get_response_message('iam.auth.failed', language=lang))

    if not resp.ok:
        logger.error('IAM auth unexpected HTTP %s: %s', resp.status_code, resp.text[:500])
        raise AuthenticationFailed(get_response_message('iam.auth.failed', language=lang))

    cache.set(cache_key, iam_data, timeout=cache_ttl)
    logger.info('IAM auth cached: key=%s, ttl=%ss', cache_key[:20], cache_ttl)
    return iam_data


def _sync_user_from_iam(iam_data):
    from core.feature_flags import flag_set
    from organizations.models import Organization
    User = get_user_model()
    user_sid = iam_data['sid']
    user_id_val = iam_data.get('id', '')
    user_name = iam_data.get('name', '')
    email = iam_data.get('email', '') or user_id_val
    telephone = iam_data.get('telephone', '')
    tenant_sid = iam_data.get('tenantSid') or 0
    tenant_id = iam_data.get('tenantId', '')
    tenant_name = iam_data.get('tenantName', '')
    jwt_enabled = flag_set('fflag__feature_develop__prompts__dia_1829_jwt_token_auth')

    org = Organization.objects.filter(tenant_sid=tenant_sid).first()

    if org:
        existing = User.objects.filter(user_sid=user_sid, active_organization_id=org.id).first()
        if existing:
            return existing, org

        user = User.objects.create_user(
            email=email,
            password=None,
            username=user_name or user_id_val or f'iam_{user_sid}',
            user_id=user_id_val,
            user_sid=user_sid,
            phone=telephone,
            is_active=True,
            active_organization=org,
        )
        logger.info('Created IAM user: user_sid=%s, username=%s, org=%s', user_sid, user.username, org.id)
        return user, org

    user = User.objects.create_user(
        email=email,
        password=None,
        username=user_name or user_id_val or f'iam_{user_sid}',
        user_id=user_id_val,
        user_sid=user_sid,
        phone=telephone,
        is_active=True,
    )
    logger.info('Created IAM user: user_sid=%s, username=%s', user_sid, user.username)

    org = Organization.objects.create(
        title=tenant_name or f'IAM 组织 {tenant_sid}',
        tenant_sid=tenant_sid,
        tenant_id=tenant_id,
        tenant_name=tenant_name,
        created_by=user,
    )
    logger.info('Created IAM organization: tenant_sid=%s, title=%s', tenant_sid, org.title)

    user.active_organization = org
    user.save(update_fields=['active_organization'])

    _ensure_jwt_settings_for_org(org, jwt_enabled)

    return user, org


def _ensure_jwt_settings_for_org(org, jwt_enabled):
    if not jwt_enabled:
        return
    org.jwt.api_tokens_enabled = True
    org.jwt.legacy_api_tokens_enabled = getattr(settings, 'LABEL_STUDIO_ENABLE_LEGACY_API_TOKEN', False)
    org.jwt.save()
    logger.info('Initialized JWT settings for IAM organization: org=%s', org.id)


def _ensure_organization_member(user, org):
    from organizations.models import OrganizationMember

    om, created = OrganizationMember.objects.get_or_create(
        user=user,
        organization=org,
    )
    if created:
        logger.info('Created OrganizationMember: user=%s, org=%s', user.id, org.id)
