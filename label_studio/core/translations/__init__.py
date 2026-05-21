from .catalog import gettext, get_language, activate, get_response_message


class TranslatableString:
    def __init__(self, key, **kwargs):
        self.key = key
        self.kwargs = kwargs

    def __str__(self):
        return gettext(self.key, **self.kwargs) if self.kwargs else gettext(self.key)

    def __repr__(self):
        return str(self)

    def __add__(self, other):
        return str(self) + other

    def __radd__(self, other):
        return other + str(self)
