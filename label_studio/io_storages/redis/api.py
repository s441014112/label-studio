"""This file and its contents are licensed under the Apache License 2.0. Please see the included NOTICE for copyright information and LICENSE for a copy of the license.
"""
from django.utils.decorators import method_decorator
from core.translations import TranslatableString as _S
from drf_spectacular.types import OpenApiTypes
from drf_spectacular.utils import OpenApiParameter, OpenApiResponse, extend_schema
from io_storages.api import (
    ExportStorageDetailAPI,
    ExportStorageFormLayoutAPI,
    ExportStorageListAPI,
    ExportStorageSyncAPI,
    ExportStorageValidateAPI,
    ImportStorageDetailAPI,
    ImportStorageFormLayoutAPI,
    ImportStorageListAPI,
    ImportStorageValidateAPI,
)
from io_storages.redis.models import RedisExportStorage, RedisImportStorage
from io_storages.redis.serializers import RedisExportStorageSerializer, RedisImportStorageSerializer

from .openapi_schema import (
    _redis_export_storage_schema,
    _redis_export_storage_schema_with_id,
    _redis_import_storage_schema,
    _redis_import_storage_schema_with_id,
)


@method_decorator(
    name='get',
    decorator=extend_schema(
        tags=['Storage: Redis'],
        summary='Get all import storage',
        description=_S('schema.action.list_get_a_list_of_all_redis_import_storage_connections._import'),
        parameters=[
            OpenApiParameter(
                name='project',
                type=OpenApiTypes.INT,
                location='query',
                description=_S('schema.param.project_filter'),
                required=True,
            ),
        ],
        request=None,
        extensions={
            'x-fern-sdk-group-name': ['import_storage', 'redis'],
            'x-fern-sdk-method-name': 'list',
            'x-fern-audiences': ['public'],
        },
    ),
)
@method_decorator(
    name='post',
    decorator=extend_schema(
        tags=['Storage: Redis'],
        summary='Create import storage',
        description=_S('schema.action.create_create_a_new_redis_import_storage_connection._import'),
        request={
            'application/json': _redis_import_storage_schema,
        },
        extensions={
            'x-fern-sdk-group-name': ['import_storage', 'redis'],
            'x-fern-sdk-method-name': 'create',
            'x-fern-audiences': ['public'],
        },
    ),
)
class RedisImportStorageListAPI(ImportStorageListAPI):
    queryset = RedisImportStorage.objects.all()
    serializer_class = RedisImportStorageSerializer


@method_decorator(
    name='get',
    decorator=extend_schema(
        tags=['Storage: Redis'],
        summary='Get import storage',
        description=_S('schema.action.get_get_a_specific_redis_import_storage_connection._import'),
        request=None,
        extensions={
            'x-fern-sdk-group-name': ['import_storage', 'redis'],
            'x-fern-sdk-method-name': 'get',
            'x-fern-audiences': ['public'],
        },
    ),
)
@method_decorator(
    name='patch',
    decorator=extend_schema(
        tags=['Storage: Redis'],
        summary='Update import storage',
        description=_S('schema.action.update_update_a_specific_redis_import_storage_connection._import'),
        request={
            'application/json': _redis_import_storage_schema,
        },
        extensions={
            'x-fern-sdk-group-name': ['import_storage', 'redis'],
            'x-fern-sdk-method-name': 'update',
            'x-fern-audiences': ['public'],
        },
    ),
)
@method_decorator(
    name='delete',
    decorator=extend_schema(
        tags=['Storage: Redis'],
        summary='Delete import storage',
        description=_S('schema.action.delete_delete_a_specific_redis_import_storage_connection._import'),
        request=None,
        extensions={
            'x-fern-sdk-group-name': ['import_storage', 'redis'],
            'x-fern-sdk-method-name': 'delete',
            'x-fern-audiences': ['public'],
        },
    ),
)
class RedisImportStorageDetailAPI(ImportStorageDetailAPI):
    queryset = RedisImportStorage.objects.all()
    serializer_class = RedisImportStorageSerializer


@method_decorator(
    name='post',
    decorator=extend_schema(
        tags=['Storage: Redis'],
        summary='Sync import storage',
        description=_S('schema.action.sync_sync_tasks_from_a_redis_import_storage_connection._import'),
        parameters=[
            OpenApiParameter(
                name='id',
                type=OpenApiTypes.INT,
                location='path',
                description=_S('schema.param.storage_id'),
            ),
        ],
        request=None,
        extensions={
            'x-fern-sdk-group-name': ['import_storage', 'redis'],
            'x-fern-sdk-method-name': 'sync',
            'x-fern-audiences': ['public'],
        },
    ),
)
class RedisImportStorageSyncAPI(ExportStorageSyncAPI):
    serializer_class = RedisImportStorageSerializer


@method_decorator(
    name='post',
    decorator=extend_schema(
        tags=['Storage: Redis'],
        summary='Sync export storage',
        description=_S('schema.action.sync_sync_tasks_from_a_redis_export_storage_connection._export'),
        request=None,
        extensions={
            'x-fern-sdk-group-name': ['export_storage', 'redis'],
            'x-fern-sdk-method-name': 'sync',
            'x-fern-audiences': ['public'],
        },
    ),
)
class RedisExportStorageSyncAPI(ExportStorageSyncAPI):
    serializer_class = RedisExportStorageSerializer


@method_decorator(
    name='post',
    decorator=extend_schema(
        tags=['Storage: Redis'],
        summary='Validate import storage',
        description=_S('schema.action.validate_validate_a_specific_redis_import_storage_connection._import'),
        request={
            'application/json': _redis_import_storage_schema_with_id,
        },
        responses={200: OpenApiResponse(description=_S('schema.resp.validation_successful'))},
        extensions={
            'x-fern-sdk-group-name': ['import_storage', 'redis'],
            'x-fern-sdk-method-name': 'validate',
            'x-fern-audiences': ['public'],
        },
    ),
)
class RedisImportStorageValidateAPI(ImportStorageValidateAPI):
    serializer_class = RedisImportStorageSerializer


@method_decorator(
    name='post',
    decorator=extend_schema(
        tags=['Storage: Redis'],
        summary='Validate export storage',
        description=_S('schema.action.validate_validate_a_specific_redis_export_storage_connection._export'),
        request={
            'application/json': _redis_export_storage_schema_with_id,
        },
        responses={200: OpenApiResponse(description=_S('schema.resp.validation_successful'))},
        extensions={
            'x-fern-sdk-group-name': ['export_storage', 'redis'],
            'x-fern-sdk-method-name': 'validate',
            'x-fern-audiences': ['public'],
        },
    ),
)
class RedisExportStorageValidateAPI(ExportStorageValidateAPI):
    serializer_class = RedisExportStorageSerializer


@method_decorator(
    name='get',
    decorator=extend_schema(
        tags=['Storage: Redis'],
        summary='Get all export storage',
        description=_S('schema.action.list_get_a_list_of_all_redis_export_storage_connections._export'),
        parameters=[
            OpenApiParameter(
                name='project',
                type=OpenApiTypes.INT,
                location='query',
                description=_S('schema.param.project_filter'),
                required=True,
            ),
        ],
        extensions={
            'x-fern-sdk-group-name': ['export_storage', 'redis'],
            'x-fern-sdk-method-name': 'list',
            'x-fern-audiences': ['public'],
        },
    ),
)
@method_decorator(
    name='post',
    decorator=extend_schema(
        tags=['Storage: Redis'],
        summary='Create export storage',
        description=_S('schema.action.create_create_a_new_redis_export_storage_connection_to_store_annotations._export'),
        request={
            'application/json': _redis_export_storage_schema,
        },
        extensions={
            'x-fern-sdk-group-name': ['export_storage', 'redis'],
            'x-fern-sdk-method-name': 'create',
            'x-fern-audiences': ['public'],
        },
    ),
)
class RedisExportStorageListAPI(ExportStorageListAPI):
    queryset = RedisExportStorage.objects.all()
    serializer_class = RedisExportStorageSerializer


@method_decorator(
    name='get',
    decorator=extend_schema(
        tags=['Storage: Redis'],
        summary='Get export storage',
        description=_S('schema.action.get_get_a_specific_redis_export_storage_connection._export'),
        request=None,
        extensions={
            'x-fern-sdk-group-name': ['export_storage', 'redis'],
            'x-fern-sdk-method-name': 'get',
            'x-fern-audiences': ['public'],
        },
    ),
)
@method_decorator(
    name='patch',
    decorator=extend_schema(
        tags=['Storage: Redis'],
        summary='Update export storage',
        description=_S('schema.action.update_update_a_specific_redis_export_storage_connection._export'),
        request={
            'application/json': _redis_export_storage_schema,
        },
        extensions={
            'x-fern-sdk-group-name': ['export_storage', 'redis'],
            'x-fern-sdk-method-name': 'update',
            'x-fern-audiences': ['public'],
        },
    ),
)
@method_decorator(
    name='delete',
    decorator=extend_schema(
        tags=['Storage: Redis'],
        summary='Delete export storage',
        description=_S('schema.action.delete_delete_a_specific_redis_export_storage_connection._export'),
        request=None,
        extensions={
            'x-fern-sdk-group-name': ['export_storage', 'redis'],
            'x-fern-sdk-method-name': 'delete',
            'x-fern-audiences': ['public'],
        },
    ),
)
class RedisExportStorageDetailAPI(ExportStorageDetailAPI):
    queryset = RedisExportStorage.objects.all()
    serializer_class = RedisExportStorageSerializer


class RedisImportStorageFormLayoutAPI(ImportStorageFormLayoutAPI):
    pass


class RedisExportStorageFormLayoutAPI(ExportStorageFormLayoutAPI):
    pass
