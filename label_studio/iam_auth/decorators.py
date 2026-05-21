from functools import wraps

from django.conf import settings
from django.shortcuts import redirect


def iam_login_required(view_func):

    @wraps(view_func)
    def _wrapped_view(request, *args, **kwargs):
        if request.user.is_authenticated:
            return view_func(request, *args, **kwargs)
        iam_login_url = getattr(settings, 'IAM_LOGIN_URL', '/user/login/')
        return redirect(iam_login_url)

    return _wrapped_view
