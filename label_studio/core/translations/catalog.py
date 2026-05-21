import os
import threading
from django.conf import settings
from django.utils.translation import get_language as django_get_language
from django.utils.translation import activate as django_activate

_thread_locals = threading.local()

DEFAULT_LANGUAGE = 'zh_hans'

MESSAGE_CATALOGS = {}

def _load_catalogs():
    global MESSAGE_CATALOGS
    if MESSAGE_CATALOGS:
        return
    base_dir = os.path.dirname(os.path.abspath(__file__))
    for lang_code, _ in settings.LANGUAGES:
        safe_name = lang_code.replace('-', '_')
        catalog_file = os.path.join(base_dir, f'{safe_name}.py')
        if os.path.exists(catalog_file):
            module_name = f'core.translations.{safe_name}'
            try:
                from django.utils.module_loading import import_string
                MESSAGE_CATALOGS[lang_code] = import_string(f'{module_name}.MESSAGES')
            except (ImportError, ModuleNotFoundError):
                _import_catalog_direct(catalog_file, lang_code)
        else:
            MESSAGE_CATALOGS[lang_code] = {}


def _import_catalog_direct(filepath, lang_code):
    import importlib.util
    spec = importlib.util.spec_from_file_location(f'translations_{lang_code}', filepath)
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    MESSAGE_CATALOGS[lang_code] = getattr(module, 'MESSAGES', {})


def get_language():
    lang = getattr(_thread_locals, 'language', None)
    if lang is None:
        lang = django_get_language()
    if lang:
        lang = lang.lower().replace('_', '-')
        if lang == 'zh-cn':
            lang = 'zh-hans'
        elif lang == 'zh-tw' or lang == 'zh-hk':
            lang = 'zh-hant'
    supported = [code for code, _ in settings.LANGUAGES]
    if lang not in supported:
        lang = DEFAULT_LANGUAGE
    return lang


def activate(language):
    _thread_locals.language = language
    django_lang = language
    if language == 'zh-hans':
        django_lang = 'zh-hans'
    elif language == 'zh-hant':
        django_lang = 'zh-hant'
    django_activate(django_lang)


def _normalize_lang(language):
    if not language:
        return DEFAULT_LANGUAGE
    language = language.lower().replace('_', '-')
    if language in ('zh-cn', 'zh-sg'):
        return 'zh-hans'
    if language in ('zh-tw', 'zh-hk', 'zh-mo'):
        return 'zh-hant'
    if language == 'zh':
        return 'zh-hans'
    supported = [code for code, _ in settings.LANGUAGES]
    if language in supported:
        return language
    return DEFAULT_LANGUAGE


def gettext(key, language=None, **kwargs):
    if language is None:
        language = get_language()
    else:
        language = _normalize_lang(language)
    _load_catalogs()
    catalog = MESSAGE_CATALOGS.get(language, {})
    message = catalog.get(key, MESSAGE_CATALOGS.get(DEFAULT_LANGUAGE, {}).get(key, key))
    if kwargs:
        try:
            message = message.format(**kwargs)
        except (KeyError, ValueError):
            pass
    return message


def get_response_message(key, language=None, **kwargs):
    return gettext(key, language, **kwargs)
