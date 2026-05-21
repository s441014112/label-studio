import logging

from core.translations import get_response_message
from drf_spectacular.extensions import OpenApiAuthenticationExtension
from rest_framework.authentication import TokenAuthentication
from rest_framework.exceptions import AuthenticationFailed

logger = logging.getLogger(__name__)


def _detect_lang(request):
    if request:
        return request.GET.get('lang') or request.META.get('HTTP_X_LANGUAGE') or (
            request.META.get('HTTP_ACCEPT_LANGUAGE', '').split(',')[0].split(';')[0].strip()
            if request.META.get('HTTP_ACCEPT_LANGUAGE') else None
        )
    return None


class TokenAuthenticationPhaseout(TokenAuthentication):
    """TokenAuthentication with features to help phase out legacy token auth

    Logs usage and triggers a 401 if legacy token auth is not enabled for the organization."""

    def authenticate(self, request):
        """Authenticate the request and log if successful."""
        from core.current_request import CurrentContext
        from core.feature_flags import flag_set

        auth_result = super().authenticate(request)

        # Update CurrentContext with authenticated user
        if auth_result is not None:
            user, _ = auth_result
            CurrentContext.set_user(user)

        JWT_ACCESS_TOKEN_ENABLED = flag_set('fflag__feature_develop__prompts__dia_1829_jwt_token_auth')
        if JWT_ACCESS_TOKEN_ENABLED and (auth_result is not None):
            user, _ = auth_result
            org = user.active_organization
            org_id = org.id if org else None

            # raise 401 if legacy API token auth disabled (i.e. this token is no longer valid)
            if org and (not org.jwt.legacy_api_tokens_enabled):
                raise AuthenticationFailed(
                    get_response_message('auth.legacy_token_disabled', language=_detect_lang(request))
                )

            logger.info(
                'Legacy token authentication used',
                extra={'user_id': user.id, 'organization_id': org_id, 'endpoint': request.path},
            )
        return auth_result


class JWTAuthScheme(OpenApiAuthenticationExtension):
    target_class = 'jwt_auth.auth.TokenAuthenticationPhaseout'
    name = 'Token'

    def get_security_definition(self, auto_schema):
        return {
            'type': 'apiKey',
            'name': 'Authorization',
            'in': 'header',
            'description': 'The token (or API key) must be passed as a request header. '
            'You can find your user token on the User Account page in Label Studio. Example: '
            '<br><pre><code class="language-bash">'
            'curl https://label-studio-host/api/projects -H "Authorization: Token [your-token]"'
            '</code></pre>',
            'x-fern-header': {
                'name': 'api_key',
                'env': 'LABEL_STUDIO_API_KEY',
                'prefix': 'Token ',
            },
        }
