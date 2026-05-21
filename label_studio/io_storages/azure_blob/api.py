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
from io_storages.azure_blob.models import AzureBlobExportStorage, AzureBlobImportStorage
from io_storages.azure_blob.serializers import AzureBlobExportStorageSerializer, AzureBlobImportStorageSerializer

from .openapi_schema import (
    _azure_blob_export_storage_schema,
    _azure_blob_export_storage_schema_with_id,
    _azure_blob_import_storage_schema,
    _azure_blob_import_storage_schema_with_id,
)


@method_decorator(
    name='get',
    decorator=extend_schema(
        tags=['Storage: Azure'],
        summary='Get all import storage',
        description=_S('schema.action.list_azure_blob_import'),
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
            'x-fern-sdk-group-name': ['import_storage', 'azure'],
            'x-fern-sdk-method-name': 'list',
            'x-fern-audiences': ['public'],
        },
    ),
)
@method_decorator(
    name='post',
    decorator=extend_schema(
        tags=['Storage: Azure'],
        summary='Create new storage',
        description=_S('schema.action.create_azure_blob_import'),
        request={
            'application/json': _azure_blob_import_storage_schema,
        },
        extensions={
            'x-fern-sdk-group-name': ['import_storage', 'azure'],
            'x-fern-sdk-method-name': 'create',
            'x-fern-audiences': ['public'],
        },
    ),
)
class AzureBlobImportStorageListAPI(ImportStorageListAPI):
    queryset = AzureBlobImportStorage.objects.all()
    serializer_class = AzureBlobImportStorageSerializer


@method_decorator(
    name='get',
    decorator=extend_schema(
        tags=['Storage: Azure'],
        summary='Get import storage',
        description=_S('schema.action.get_azure_blob_import'),
        request=None,
        extensions={
            'x-fern-sdk-group-name': ['import_storage', 'azure'],
            'x-fern-sdk-method-name': 'get',
            'x-fern-audiences': ['public'],
        },
    ),
)
@method_decorator(
    name='patch',
    decorator=extend_schema(
        tags=['Storage: Azure'],
        summary='Update import storage',
        description=_S('schema.action.update_azure_blob_import'),
        request={
            'application/json': _azure_blob_import_storage_schema,
        },
        extensions={
            'x-fern-sdk-group-name': ['import_storage', 'azure'],
            'x-fern-sdk-method-name': 'update',
            'x-fern-audiences': ['public'],
        },
    ),
)
@method_decorator(
    name='delete',
    decorator=extend_schema(
        tags=['Storage: Azure'],
        summary='Delete import storage',
        description=_S('schema.action.delete_azure_blob_import'),
        request=None,
        extensions={
            'x-fern-sdk-group-name': ['import_storage', 'azure'],
            'x-fern-sdk-method-name': 'delete',
            'x-fern-audiences': ['public'],
        },
    ),
)
class AzureBlobImportStorageDetailAPI(ImportStorageDetailAPI):
    queryset = AzureBlobImportStorage.objects.all()
    serializer_class = AzureBlobImportStorageSerializer


@method_decorator(
    name='post',
    decorator=extend_schema(
        tags=['Storage: Azure'],
        summary='Sync import storage',
        description=_S('schema.action.sync_azure_blob_import'),
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
            'x-fern-sdk-group-name': ['import_storage', 'azure'],
            'x-fern-sdk-method-name': 'sync',
            'x-fern-audiences': ['public'],
        },
    ),
)
class AzureBlobImportStorageSyncAPI(ImportStorageSyncAPI):
    serializer_class = AzureBlobImportStorageSerializer


@method_decorator(
    name='post',
    decorator=extend_schema(
        tags=['Storage: Azure'],
        summary='Sync export storage',
        description=_S('schema.action.sync_azure_blob_export'),
        request=None,
        extensions={
            'x-fern-sdk-group-name': ['export_storage', 'azure'],
            'x-fern-sdk-method-name': 'sync',
            'x-fern-audiences': ['public'],
        },
    ),
)
class AzureBlobExportStorageSyncAPI(ExportStorageSyncAPI):
    serializer_class = AzureBlobExportStorageSerializer


@method_decorator(
    name='post',
    decorator=extend_schema(
        tags=['Storage: Azure'],
        summary='Validate import storage',
        description=_S('schema.action.validate_azure_blob_import'),
        request={
            'application/json': _azure_blob_import_storage_schema_with_id,
        },
        responses={200: OpenApiResponse(description=_S('schema.resp.validation_successful'))},
        extensions={
            'x-fern-sdk-group-name': ['import_storage', 'azure'],
            'x-fern-sdk-method-name': 'validate',
            'x-fern-audiences': ['public'],
        },
    ),
)
class AzureBlobImportStorageValidateAPI(ImportStorageValidateAPI):
    serializer_class = AzureBlobImportStorageSerializer


@method_decorator(
    name='post',
    decorator=extend_schema(
        tags=['Storage: Azure'],
        summary='Validate export storage',
        description=_S('schema.action.validate_azure_blob_export'),
        request={
            'application/json': _azure_blob_export_storage_schema_with_id,
        },
        responses={200: OpenApiResponse(description=_S('schema.resp.validation_successful'))},
        extensions={
            'x-fern-sdk-group-name': ['export_storage', 'azure'],
            'x-fern-sdk-method-name': 'validate',
            'x-fern-audiences': ['public'],
        },
    ),
)
class AzureBlobExportStorageValidateAPI(ExportStorageValidateAPI):
    serializer_class = AzureBlobExportStorageSerializer


@method_decorator(
    name='get',
    decorator=extend_schema(
        tags=['Storage: Azure'],
        summary='Get all export storage',
        description=_S('schema.action.list_azure_blob_export'),
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
            'x-fern-sdk-group-name': ['export_storage', 'azure'],
            'x-fern-sdk-method-name': 'list',
            'x-fern-audiences': ['public'],
        },
    ),
)
@method_decorator(
    name='post',
    decorator=extend_schema(
        tags=['Storage: Azure'],
        summary='Create export storage',
        description=_S('schema.action.create_azure_blob_export'),
        request={
            'application/json': _azure_blob_export_storage_schema,
        },
        extensions={
            'x-fern-sdk-group-name': ['export_storage', 'azure'],
            'x-fern-sdk-method-name': 'create',
            'x-fern-audiences': ['public'],
        },
    ),
)
class AzureBlobExportStorageListAPI(ExportStorageListAPI):
    queryset = AzureBlobExportStorage.objects.all()
    serializer_class = AzureBlobExportStorageSerializer


@method_decorator(
    name='get',
    decorator=extend_schema(
        tags=['Storage: Azure'],
        summary='Get export storage',
        description=_S('schema.action.get_azure_blob_export'),
        request=None,
        extensions={
            'x-fern-sdk-group-name': ['export_storage', 'azure'],
            'x-fern-sdk-method-name': 'get',
            'x-fern-audiences': ['public'],
        },
    ),
)
@method_decorator(
    name='patch',
    decorator=extend_schema(
        tags=['Storage: Azure'],
        summary='Update export storage',
        description=_S('schema.action.update_azure_blob_export'),
        request={
            'application/json': _azure_blob_export_storage_schema,
        },
        extensions={
            'x-fern-sdk-group-name': ['export_storage', 'azure'],
            'x-fern-sdk-method-name': 'update',
            'x-fern-audiences': ['public'],
        },
    ),
)
@method_decorator(
    name='delete',
    decorator=extend_schema(
        tags=['Storage: Azure'],
        summary='Delete export storage',
        description=_S('schema.action.delete_azure_blob_export'),
        request=None,
        extensions={
            'x-fern-sdk-group-name': ['export_storage', 'azure'],
            'x-fern-sdk-method-name': 'delete',
            'x-fern-audiences': ['public'],
        },
    ),
)
class AzureBlobExportStorageDetailAPI(ExportStorageDetailAPI):
    queryset = AzureBlobExportStorage.objects.all()
    serializer_class = AzureBlobExportStorageSerializer


class AzureBlobImportStorageFormLayoutAPI(ImportStorageFormLayoutAPI):
    pass


class AzureBlobExportStorageFormLayoutAPI(ExportStorageFormLayoutAPI):
    pass
