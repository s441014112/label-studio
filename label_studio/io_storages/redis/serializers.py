"""This file and its contents are licensed under the Apache License 2.0. Please see the included NOTICE for copyright information and LICENSE for a copy of the license.
"""
import os

from core.translations import get_response_message
from io_storages.redis.models import RedisExportStorage, RedisImportStorage
from io_storages.serializers import ExportStorageSerializer, ImportStorageSerializer
from rest_framework import serializers
from rest_framework.exceptions import ValidationError


def _detect_language(serializer_self):
    request = serializer_self.context.get('request') if hasattr(serializer_self, 'context') else None
    if request:
        return request.GET.get('lang') or request.META.get('HTTP_X_LANGUAGE') or (
            request.META.get('HTTP_ACCEPT_LANGUAGE', '').split(',')[0].split(';')[0].strip()
            if request.META.get('HTTP_ACCEPT_LANGUAGE') else None
        )
    return None


class RedisImportStorageSerializer(ImportStorageSerializer):
    type = serializers.ReadOnlyField(default=os.path.basename(os.path.dirname(__file__)))

    class Meta:
        model = RedisImportStorage
        fields = '__all__'

    def to_representation(self, instance):
        result = super().to_representation(instance)
        result.pop('password')
        return result

    def validate(self, data):
        data = super(RedisImportStorageSerializer, self).validate(data)
        lang = _detect_language(self)

        storage = RedisImportStorage(**data)
        try:
            storage.validate_connection()
        except:  # noqa: E722
            raise ValidationError(get_response_message('storage.redis.cannot_connect', language=lang))
        return data


class RedisExportStorageSerializer(ExportStorageSerializer):
    type = serializers.ReadOnlyField(default=os.path.basename(os.path.dirname(__file__)))

    def to_representation(self, instance):
        result = super().to_representation(instance)
        result.pop('password')
        return result

    class Meta:
        model = RedisExportStorage
        fields = '__all__'
