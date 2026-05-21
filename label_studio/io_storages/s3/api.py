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
    ImportStorageSyncAPI,
    ImportStorageValidateAPI,
)
from io_storages.s3.models import S3ExportStorage, S3ImportStorage
from io_storages.s3.serializers import S3ExportStorageSerializer, S3ImportStorageSerializer

from .openapi_schema import (
    _s3_export_storage_schema,
    _s3_export_storage_schema_with_id,
    _s3_import_storage_schema,
    _s3_import_storage_schema_with_id,
)


@method_decorator(
    name='get',
    decorator=extend_schema(
        tags=['Storage: S3'],
        summary='List S3 import storage',
        description=_S('schema.action.list_get_a_list_of_all_s3_import_storage_connections._import'),
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
            'x-fern-sdk-group-name': ['import_storage', 's3'],
            'x-fern-sdk-method-name': 'list',
            'x-fern-audiences': ['public'],
        },
    ),
)
@method_decorator(
    name='post',
    decorator=extend_schema(
        tags=['Storage: S3'],
        summary='Create new S3 storage',
        description=_S('schema.action.create_s3_import'),
        request={
            'application/json': _s3_import_storage_schema,
        },
        extensions={
            'x-fern-sdk-group-name': ['import_storage', 's3'],
            'x-fern-sdk-method-name': 'create',
            'x-fern-audiences': ['public'],
        },
    ),
)
class S3ImportStorageListAPI(ImportStorageListAPI):
    queryset = S3ImportStorage.objects.all()
    serializer_class = S3ImportStorageSerializer


@method_decorator(
    name='get',
    decorator=extend_schema(
        tags=['Storage: S3'],
        summary='Get import storage',
        description=_S('schema.action.get_get_a_specific_s3_import_storage_connection._import'),
        request=None,
        extensions={
            'x-fern-sdk-group-name': ['import_storage', 's3'],
            'x-fern-sdk-method-name': 'get',
            'x-fern-audiences': ['public'],
        },
    ),
)
@method_decorator(
    name='patch',
    decorator=extend_schema(
        tags=['Storage: S3'],
        summary='Update import storage',
        description=_S('schema.action.update_update_a_specific_s3_import_storage_connection._import'),
        request={
            'application/json': _s3_import_storage_schema,
        },
        extensions={
            'x-fern-sdk-group-name': ['import_storage', 's3'],
            'x-fern-sdk-method-name': 'update',
            'x-fern-audiences': ['public'],
        },
    ),
)
@method_decorator(
    name='delete',
    decorator=extend_schema(
        tags=['Storage: S3'],
        summary='Delete import storage',
        description=_S('schema.action.delete_delete_a_specific_s3_import_storage_connection._import'),
        request=None,
        extensions={
            'x-fern-sdk-group-name': ['import_storage', 's3'],
            'x-fern-sdk-method-name': 'delete',
            'x-fern-audiences': ['public'],
        },
    ),
)
class S3ImportStorageDetailAPI(ImportStorageDetailAPI):
    queryset = S3ImportStorage.objects.all()
    serializer_class = S3ImportStorageSerializer


@method_decorator(
    name='post',
    decorator=extend_schema(
        tags=['Storage: S3'],
        summary='Sync import storage',
        description=_S('schema.action.sync_sync_tasks_from_an_s3_import_storage_connection._import'),
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
            'x-fern-sdk-group-name': ['import_storage', 's3'],
            'x-fern-sdk-method-name': 'sync',
            'x-fern-audiences': ['public'],
        },
    ),
)
class S3ImportStorageSyncAPI(ImportStorageSyncAPI):
    serializer_class = S3ImportStorageSerializer


@method_decorator(
    name='post',
    decorator=extend_schema(
        tags=['Storage: S3'],
        summary='Validate import storage',
        description=_S('schema.action.validate_validate_a_specific_s3_import_storage_connection._import'),
        request={
            'application/json': _s3_import_storage_schema_with_id,
        },
        responses={200: OpenApiResponse(description=_S('schema.resp.validation_successful'))},
        extensions={
            'x-fern-sdk-group-name': ['import_storage', 's3'],
            'x-fern-sdk-method-name': 'validate',
            'x-fern-audiences': ['public'],
        },
    ),
)
class S3ImportStorageValidateAPI(ImportStorageValidateAPI):
    serializer_class = S3ImportStorageSerializer


@method_decorator(
    name='post',
    decorator=extend_schema(
        tags=['Storage: S3'],
        summary='Validate export storage',
        description=_S('schema.action.validate_validate_a_specific_s3_export_storage_connection._export'),
        request={
            'application/json': _s3_export_storage_schema_with_id,
        },
        responses={200: OpenApiResponse(description=_S('schema.resp.validation_successful'))},
        extensions={
            'x-fern-sdk-group-name': ['export_storage', 's3'],
            'x-fern-sdk-method-name': 'validate',
            'x-fern-audiences': ['public'],
        },
    ),
)
class S3ExportStorageValidateAPI(ExportStorageValidateAPI):
    serializer_class = S3ExportStorageSerializer


@method_decorator(
    name='get',
    decorator=extend_schema(
        tags=['Storage: S3'],
        summary='Get all export storage',
        description=_S('schema.action.list_get_a_list_of_all_s3_export_storage_connections._export'),
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
            'x-fern-sdk-group-name': ['export_storage', 's3'],
            'x-fern-sdk-method-name': 'list',
            'x-fern-audiences': ['public'],
        },
    ),
)
@method_decorator(
    name='post',
    decorator=extend_schema(
        tags=['Storage: S3'],
        summary='Create export storage',
        description=_S('schema.action.create_create_a_new_s3_export_storage_connection_to_store_annotations._export'),
        request={
            'application/json': _s3_export_storage_schema,
        },
        extensions={
            'x-fern-sdk-group-name': ['export_storage', 's3'],
            'x-fern-sdk-method-name': 'create',
            'x-fern-audiences': ['public'],
        },
    ),
)
class S3ExportStorageListAPI(ExportStorageListAPI):
    queryset = S3ExportStorage.objects.all()
    serializer_class = S3ExportStorageSerializer


@method_decorator(
    name='get',
    decorator=extend_schema(
        tags=['Storage: S3'],
        summary='Get export storage',
        description=_S('schema.action.get_get_a_specific_s3_export_storage_connection._export'),
        request=None,
        extensions={
            'x-fern-sdk-group-name': ['export_storage', 's3'],
            'x-fern-sdk-method-name': 'get',
            'x-fern-audiences': ['public'],
        },
    ),
)
@method_decorator(
    name='patch',
    decorator=extend_schema(
        tags=['Storage: S3'],
        summary='Update export storage',
        description=_S('schema.action.update_update_a_specific_s3_export_storage_connection._export'),
        request={
            'application/json': _s3_export_storage_schema,
        },
        extensions={
            'x-fern-sdk-group-name': ['export_storage', 's3'],
            'x-fern-sdk-method-name': 'update',
            'x-fern-audiences': ['public'],
        },
    ),
)
@method_decorator(
    name='delete',
    decorator=extend_schema(
        tags=['Storage: S3'],
        summary='Delete export storage',
        description=_S('schema.action.delete_delete_a_specific_s3_export_storage_connection._export'),
        request=None,
        extensions={
            'x-fern-sdk-group-name': ['export_storage', 's3'],
            'x-fern-sdk-method-name': 'delete',
            'x-fern-audiences': ['public'],
        },
    ),
)
class S3ExportStorageDetailAPI(ExportStorageDetailAPI):
    queryset = S3ExportStorage.objects.all()
    serializer_class = S3ExportStorageSerializer


@method_decorator(
    name='post',
    decorator=extend_schema(
        tags=['Storage: S3'],
        summary='Sync export storage',
        description=_S('schema.action.sync_sync_tasks_from_an_s3_export_storage_connection._export'),
        request=None,
        extensions={
            'x-fern-sdk-group-name': ['export_storage', 's3'],
            'x-fern-sdk-method-name': 'sync',
            'x-fern-audiences': ['public'],
        },
    ),
)
class S3ExportStorageSyncAPI(ExportStorageSyncAPI):
    serializer_class = S3ExportStorageSerializer


class S3ImportStorageFormLayoutAPI(ImportStorageFormLayoutAPI):
    pass


class S3ExportStorageFormLayoutAPI(ExportStorageFormLayoutAPI):
    pass
