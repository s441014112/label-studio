from core.translations import TranslatableString as _S

# Common S3 storage schema properties following OpenAPI 3.0 specification

_common_s3_storage_schema_properties = {
    'title': {'type': 'string', 'description': _S('schema.common.storage_title'), 'maxLength': 2048},
    'description': {'type': 'string', 'description': _S('schema.common.storage_description')},
    'project': {'type': 'integer', 'description': _S('schema.common.project_id')},
    'bucket': {'type': 'string', 'description': _S('schema.storage.s3.bucket_desc')},
    'prefix': {'type': 'string', 'description': _S('schema.storage.s3.prefix_desc')},
    'aws_access_key_id': {'type': 'string', 'description': _S('schema.storage.s3.aws_access_key_desc')},
    'aws_secret_access_key': {'type': 'string', 'description': _S('schema.storage.s3.aws_secret_key_desc')},
    'aws_session_token': {'type': 'string', 'description': _S('schema.storage.s3.aws_session_token_desc')},
    'aws_sse_kms_key_id': {'type': 'string', 'description': _S('schema.storage.s3.aws_sse_kms_key_id_desc')},
    'region_name': {'type': 'string', 'description': _S('schema.storage.s3.region_desc')},
    's3_endpoint': {'type': 'string', 'description': _S('schema.storage.s3.endpoint_desc')},
}

# S3 import storage schema
_s3_import_storage_schema = {
    'type': 'object',
    'properties': {
        'regex_filter': {
            'type': 'string',
            'description': _S('schema.storage.s3.regex_filter_desc'),
        },
        'use_blob_urls': {
            'type': 'boolean',
            'description': _S('schema.storage.s3.use_blob_urls_desc'),
            'default': False,
        },
        'presign': {'type': 'boolean', 'description': _S('schema.storage.s3.presign_desc'), 'default': True},
        'presign_ttl': {'type': 'integer', 'description': _S('schema.storage.s3.presign_ttl_desc'), 'default': 1},
        'recursive_scan': {'type': 'boolean', 'description': _S('schema.storage.s3.recursive_scan_desc')},
        **_common_s3_storage_schema_properties,
    },
    'required': [],
}

# S3 import storage schema with ID
_s3_import_storage_schema_with_id = {
    'type': 'object',
    'properties': {
        'id': {'type': 'integer', 'description': _S('schema.common.storage_id')},
        **_s3_import_storage_schema['properties'],
    },
    'required': [],
}

# S3 export storage schema
_s3_export_storage_schema = {
    'type': 'object',
    'properties': {
        'can_delete_objects': {'type': 'boolean', 'description': _S('schema.storage.s3.can_delete_objects_desc'), 'default': False},
        **_common_s3_storage_schema_properties,
    },
    'required': [],
}

# S3 export storage schema with ID
_s3_export_storage_schema_with_id = {
    'type': 'object',
    'properties': {
        'id': {'type': 'integer', 'description': _S('schema.common.storage_id')},
        **_s3_export_storage_schema['properties'],
    },
    'required': [],
}
