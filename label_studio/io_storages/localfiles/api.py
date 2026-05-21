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
from io_storages.localfiles.models import LocalFilesExportStorage, LocalFilesImportStorage
from io_storages.localfiles.serializers import LocalFilesExportStorageSerializer, LocalFilesImportStorageSerializer

from .openapi_schema import (
    _local_files_export_storage_schema,
    _local_files_export_storage_schema_with_id,
    _local_files_import_storage_schema,
    _local_files_import_storage_schema_with_id,
)


@method_decorator(
    name='get',
    decorator=extend_schema(
        tags=['Storage: Local'],
        summary='Get all import storage',
        description=_S('schema.action.list_localfiles_import'),
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
            'x-fern-sdk-group-name': ['import_storage', 'local'],
            'x-fern-sdk-method-name': 'list',
            'x-fern-audiences': ['public'],
        },
    ),
)
@method_decorator(
    name='post',
    decorator=extend_schema(
        tags=['Storage: Local'],
        summary='Create import storage',
        description=_S('schema.action.create_localfiles_import'),
        request={
            'application/json': _local_files_import_storage_schema,
        },
        extensions={
            'x-fern-sdk-group-name': ['import_storage', 'local'],
            'x-fern-sdk-method-name': 'create',
            'x-fern-audiences': ['public'],
        },
    ),
)
class LocalFilesImportStorageListAPI(ImportStorageListAPI):
    queryset = LocalFilesImportStorage.objects.all()
    serializer_class = LocalFilesImportStorageSerializer


@method_decorator(
    name='get',
    decorator=extend_schema(
        tags=['Storage: Local'],
        summary='Get import storage',
        description=_S('schema.action.get_localfiles_import'),
        request=None,
        extensions={
            'x-fern-sdk-group-name': ['import_storage', 'local'],
            'x-fern-sdk-method-name': 'get',
            'x-fern-audiences': ['public'],
        },
    ),
)
@method_decorator(
    name='patch',
    decorator=extend_schema(
        tags=['Storage: Local'],
        summary='Update import storage',
        description=_S('schema.action.update_localfiles_import'),
        request={
            'application/json': _local_files_import_storage_schema,
        },
        extensions={
            'x-fern-sdk-group-name': ['import_storage', 'local'],
            'x-fern-sdk-method-name': 'update',
            'x-fern-audiences': ['public'],
        },
    ),
)
@method_decorator(
    name='delete',
    decorator=extend_schema(
        tags=['Storage: Local'],
        summary='Delete import storage',
        description=_S('schema.action.delete_localfiles_import'),
        request=None,
        extensions={
            'x-fern-sdk-group-name': ['import_storage', 'local'],
            'x-fern-sdk-method-name': 'delete',
            'x-fern-audiences': ['public'],
        },
    ),
)
class LocalFilesImportStorageDetailAPI(ImportStorageDetailAPI):
    queryset = LocalFilesImportStorage.objects.all()
    serializer_class = LocalFilesImportStorageSerializer


@method_decorator(
    name='post',
    decorator=extend_schema(
        tags=['Storage: Local'],
        summary='Sync import storage',
        description=_S('schema.action.sync_localfiles_import'),
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
            'x-fern-sdk-group-name': ['import_storage', 'local'],
            'x-fern-sdk-method-name': 'sync',
            'x-fern-audiences': ['public'],
        },
    ),
)
class LocalFilesImportStorageSyncAPI(ImportStorageSyncAPI):
    serializer_class = LocalFilesImportStorageSerializer


@method_decorator(
    name='post',
    decorator=extend_schema(
        tags=['Storage: Local'],
        summary='Sync export storage',
        description=_S('schema.action.sync_localfiles_export'),
        request=None,
        extensions={
            'x-fern-sdk-group-name': ['export_storage', 'local'],
            'x-fern-sdk-method-name': 'sync',
            'x-fern-audiences': ['public'],
        },
    ),
)
class LocalFilesExportStorageSyncAPI(ExportStorageSyncAPI):
    serializer_class = LocalFilesExportStorageSerializer


@method_decorator(
    name='post',
    decorator=extend_schema(
        tags=['Storage: Local'],
        summary='Validate import storage',
        description=_S('schema.action.validate_localfiles_import'),
        request={
            'application/json': _local_files_import_storage_schema_with_id,
        },
        responses={200: OpenApiResponse(description=_S('schema.resp.validation_successful'))},
        extensions={
            'x-fern-sdk-group-name': ['import_storage', 'local'],
            'x-fern-sdk-method-name': 'validate',
            'x-fern-audiences': ['public'],
        },
    ),
)
class LocalFilesImportStorageValidateAPI(ImportStorageValidateAPI):
    serializer_class = LocalFilesImportStorageSerializer


@method_decorator(
    name='post',
    decorator=extend_schema(
        tags=['Storage: Local'],
        summary='Validate export storage',
        description=_S('schema.action.validate_localfiles_export'),
        request={
            'application/json': _local_files_export_storage_schema_with_id,
        },
        responses={200: OpenApiResponse(description=_S('schema.resp.validation_successful'))},
        extensions={
            'x-fern-sdk-group-name': ['export_storage', 'local'],
            'x-fern-sdk-method-name': 'validate',
            'x-fern-audiences': ['public'],
        },
    ),
)
class LocalFilesExportStorageValidateAPI(ExportStorageValidateAPI):
    serializer_class = LocalFilesExportStorageSerializer


@method_decorator(
    name='get',
    decorator=extend_schema(
        tags=['Storage: Local'],
        summary='Get all export storage',
        description=_S('schema.action.list_localfiles_export'),
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
            'x-fern-sdk-group-name': ['export_storage', 'local'],
            'x-fern-sdk-method-name': 'list',
            'x-fern-audiences': ['public'],
        },
    ),
)
@method_decorator(
    name='post',
    decorator=extend_schema(
        tags=['Storage: Local'],
        summary='Create export storage',
        description=_S('schema.action.create_localfiles_export'),
        request={
            'application/json': _local_files_export_storage_schema,
        },
        extensions={
            'x-fern-sdk-group-name': ['export_storage', 'local'],
            'x-fern-sdk-method-name': 'create',
            'x-fern-audiences': ['public'],
        },
    ),
)
class LocalFilesExportStorageListAPI(ExportStorageListAPI):
    queryset = LocalFilesExportStorage.objects.all()
    serializer_class = LocalFilesExportStorageSerializer


@method_decorator(
    name='get',
    decorator=extend_schema(
        tags=['Storage: Local'],
        summary='Get export storage',
        description=_S('schema.action.get_localfiles_export'),
        request=None,
        extensions={
            'x-fern-sdk-group-name': ['export_storage', 'local'],
            'x-fern-sdk-method-name': 'get',
            'x-fern-audiences': ['public'],
        },
    ),
)
@method_decorator(
    name='patch',
    decorator=extend_schema(
        tags=['Storage: Local'],
        summary='Update export storage',
        description=_S('schema.action.update_localfiles_export'),
        request={
            'application/json': _local_files_export_storage_schema,
        },
        extensions={
            'x-fern-sdk-group-name': ['export_storage', 'local'],
            'x-fern-sdk-method-name': 'update',
            'x-fern-audiences': ['public'],
        },
    ),
)
@method_decorator(
    name='delete',
    decorator=extend_schema(
        tags=['Storage: Local'],
        summary='Delete export storage',
        description=_S('schema.action.delete_localfiles_export'),
        request=None,
        extensions={
            'x-fern-sdk-group-name': ['export_storage', 'local'],
            'x-fern-sdk-method-name': 'delete',
            'x-fern-audiences': ['public'],
        },
    ),
)
class LocalFilesExportStorageDetailAPI(ExportStorageDetailAPI):
    queryset = LocalFilesExportStorage.objects.all()
    serializer_class = LocalFilesExportStorageSerializer


class LocalFilesImportStorageFormLayoutAPI(ImportStorageFormLayoutAPI):
    pass


class LocalFilesExportStorageFormLayoutAPI(ExportStorageFormLayoutAPI):
    pass
