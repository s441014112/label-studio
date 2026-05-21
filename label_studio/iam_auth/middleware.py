import logging
import time

from django.conf import settings
from django.http import JsonResponse
from django.shortcuts import redirect
from rest_framework import status

logger = logging.getLogger(__name__)


class IAMAuthenticationMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        from iam_auth import is_iam_whitelisted

        auth_user_header = request.META.get('HTTP_TOKEN') or request.GET.get('token')
        auth_app_header = request.META.get('HTTP_DIGI_MIDDLEWARE_AUTH_APP') or request.GET.get('digi-middleware-auth-app')

        if not auth_user_header or not auth_app_header:
            return self.get_response(request)

        from iam_auth.auth import IAMAuthentication

        try:
            result = IAMAuthentication().authenticate(request)
            if result:
                user = result[0]
                user.backend = 'django.contrib.auth.backends.ModelBackend'
                from django.contrib.auth import login as auth_login

                auth_login(request, user)
                request.session['last_login'] = time.time()
        except Exception as e:
            if is_iam_whitelisted(request):
                logger.info('IAM auth failed on whitelisted path: %s, path: %s', e, request.path)
                return self.get_response(request)
            logger.warning('IAM middleware authentication failed: %s，path: %s', e, request.path)
            iam_login_url = getattr(settings, 'IAM_LOGIN_URL', '/user/login/')
            return redirect(iam_login_url)

        return self.get_response(request)
