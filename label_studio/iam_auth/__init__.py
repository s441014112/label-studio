import re

from django.conf import settings


def _compile_pattern(pattern):
    escaped = re.escape(pattern)
    regex = escaped.replace(r'\*', r'[^/]+')
    return re.compile(r'^' + regex)


def is_iam_whitelisted(request):
    whitelist = getattr(settings, 'IAM_AUTH_WHITELIST', [])
    path = request.path
    for pattern in whitelist:
        if '*' in pattern:
            compiled = _compile_pattern(pattern)
            if compiled.match(path):
                return True
        elif path.startswith(pattern):
            return True
    return False
