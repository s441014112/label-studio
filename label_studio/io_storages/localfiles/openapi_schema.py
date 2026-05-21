from core.translations import TranslatableString as _S

# Common local files storage schema properties following OpenAPI 3.0 specification

_common_storage_schema_properties = {
    'title': {'type': 'string', 'description': _S('schema.common.storage_title'), 'maxLength': 2048},
    'description': {'type': 'string', 'description': _S('schema.common.storage_description')},
    'project': {'type': 'integer', 'description': _S('schema.common.project_id')},
    'path': {'type': 'string', 'description': _S('schema.storage.localfiles.path_desc')},
    'regex_filter': {'type': 'string', 'description': _S('schema.storage.localfiles.regex_filter_desc')},
    'use_blob_urls': {
        'type': 'boolean',
        'description': _S('schema.storage.localfiles.use_blob_urls_desc'),
        'default': False,
    },
}

# Local files import storage schema
_local_files_import_storage_schema = {
    'type': 'object',
    'properties': _common_storage_schema_properties,
    'required': [],
}

# Local files import storage schema with ID
_local_files_import_storage_schema_with_id = {
    'type': 'object',
    'properties': {
        'id': {'type': 'integer', 'description': _S('schema.common.storage_id')},
        **_local_files_import_storage_schema['properties'],
    },
    'required': [],
}

# Local files export storage schema
_local_files_export_storage_schema = {
    'type': 'object',
    'properties': _common_storage_schema_properties,
    'required': [],
}

# Local files export storage schema with ID
_local_files_export_storage_schema_with_id = {
    'type': 'object',
    'properties': {
        'id': {'type': 'integer', 'description': _S('schema.common.storage_id')},
        **_local_files_export_storage_schema['properties'],
    },
    'required': [],
}
