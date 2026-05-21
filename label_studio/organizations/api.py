"""This file and its contents are licensed under the Apache License 2.0. Please see the included NOTICE for copyright information and LICENSE for a copy of the license.
"""
import logging

from core.feature_flags import flag_set
from core.mixins import GetParentObjectMixin
from core.translations import get_response_message, TranslatableString as _S
from core.utils.common import load_func
from django.conf import settings
from django.urls import reverse
from django.utils.decorators import method_decorator
from django.utils.functional import cached_property
from drf_spectacular.types import OpenApiTypes
from drf_spectacular.utils import OpenApiParameter, OpenApiResponse, extend_schema

from organizations.models import Organization, OrganizationMember
from organizations.serializers import (
    OrganizationIdSerializer,
    OrganizationInviteSerializer,
    OrganizationMemberListParamsSerializer,
    OrganizationMemberListSerializer,
    OrganizationMemberSerializer,
    OrganizationSerializer,
)
from projects.models import Project
from rest_framework import generics, status
from rest_framework.exceptions import NotFound, PermissionDenied
from rest_framework.generics import get_object_or_404
from rest_framework.pagination import PageNumberPagination
from rest_framework.parsers import FormParser, JSONParser, MultiPartParser
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.settings import api_settings
from rest_framework.views import APIView
from tasks.models import Annotation
from users.models import User

from label_studio.core.permissions import ViewClassPermission, all_permissions
from label_studio.core.utils.params import bool_from_request

logger = logging.getLogger(__name__)


def _detect_lang(request):
    if request:
        return request.GET.get('lang') or request.META.get('HTTP_X_LANGUAGE') or (
            request.META.get('HTTP_ACCEPT_LANGUAGE', '').split(',')[0].split(';')[0].strip()
            if request.META.get('HTTP_ACCEPT_LANGUAGE') else None
        )
    return None

HasObjectPermission = load_func(settings.MEMBER_PERM)


@method_decorator(
    name='get',
    decorator=extend_schema(
        tags=['Organizations'],
        summary='List your organizations',
        description="""
        Return a list of the organizations you've created or that you have access to.
        """,
        extensions={
            'x-fern-sdk-group-name': 'organizations',
            'x-fern-sdk-method-name': 'list',
            'x-fern-audiences': ['public'],
        },
    ),
)
class OrganizationListAPI(generics.ListCreateAPIView):
    queryset = Organization.objects.all()
    parser_classes = (JSONParser, FormParser, MultiPartParser)
    permission_required = ViewClassPermission(
        GET=all_permissions.organizations_view,
        PUT=all_permissions.organizations_change,
        POST=all_permissions.organizations_create,
        PATCH=all_permissions.organizations_change,
        DELETE=all_permissions.organizations_change,
    )
    serializer_class = OrganizationIdSerializer

    def filter_queryset(self, queryset):
        return queryset.filter(
            organizationmember__in=self.request.user.om_through.filter(deleted_at__isnull=True)
        ).distinct()

    def get(self, request, *args, **kwargs):
        return super(OrganizationListAPI, self).get(request, *args, **kwargs)

    @extend_schema(exclude=True)
    def post(self, request, *args, **kwargs):
        return super(OrganizationListAPI, self).post(request, *args, **kwargs)


class OrganizationMemberListPagination(PageNumberPagination):
    page_size = 20
    page_size_query_param = 'page_size'

    def get_page_size(self, request):
        # emulate "unlimited" page_size
        if (
            self.page_size_query_param in request.query_params
            and request.query_params[self.page_size_query_param] == '-1'
        ):
            return 1000000
        return super().get_page_size(request)


@method_decorator(
    name='get',
    decorator=extend_schema(
        tags=['Organizations'],
        summary='Get organization members list',
        description=_S('schema.action.list_org_members'),
        parameters=[
            OpenApiParameter(
                name='contributed_to_projects',
                type=OpenApiTypes.BOOL,
                location='query',
                description=_S('schema.param.include_projects'),
            ),
        ],
        extensions={
            'x-fern-sdk-group-name': ['organizations', 'members'],
            'x-fern-sdk-method-name': 'list',
            'x-fern-audiences': ['public'],
            'x-fern-pagination': {
                'offset': '$request.page',
                'results': '$response.results',
            },
        },
    ),
)
class OrganizationMemberListAPI(generics.ListAPIView):
    parser_classes = (JSONParser, FormParser, MultiPartParser)
    permission_required = ViewClassPermission(
        GET=all_permissions.organizations_view,
        PUT=all_permissions.organizations_change,
        PATCH=all_permissions.organizations_change,
        DELETE=all_permissions.organizations_change,
    )
    serializer_class = OrganizationMemberListSerializer
    pagination_class = OrganizationMemberListPagination

    @cached_property
    def paginated_members(self):
        return self.paginate_queryset(self.filter_queryset(self.get_queryset()))

    def _get_created_projects_map(self):
        members = self.paginated_members
        user_ids = [member.user_id for member in members]
        projects = (
            Project.objects.filter(created_by_id__in=user_ids, organization=self.request.user.active_organization)
            .values('created_by_id', 'id', 'title')
            .distinct()
        )
        projects_map = {}
        for project in projects:
            projects_map.setdefault(project['created_by_id'], []).append(
                {
                    'id': project['id'],
                    'title': project['title'],
                }
            )
        return projects_map

    def _get_contributed_to_projects_map(self):
        members = self.paginated_members
        user_ids = [member.user_id for member in members]
        org_project_ids = Project.objects.filter(organization=self.request.user.active_organization).values_list(
            'id', flat=True
        )
        annotations = (
            Annotation.objects.filter(completed_by__in=list(user_ids), project__in=list(org_project_ids))
            .values('completed_by', 'project_id')
            .distinct()
        )
        project_ids = [annotation['project_id'] for annotation in annotations]
        projects_map = Project.objects.in_bulk(id_list=project_ids, field_name='id')

        contributed_to_projects_map = {}
        for annotation in annotations:
            project = projects_map[annotation['project_id']]
            contributed_to_projects_map.setdefault(annotation['completed_by'], []).append(
                {
                    'id': project.id,
                    'title': project.title,
                }
            )
        return contributed_to_projects_map

    def get_serializer_context(self):
        context = super().get_serializer_context()
        contributed_to_projects = bool_from_request(self.request.GET, 'contributed_to_projects', False)
        return {
            'contributed_to_projects': contributed_to_projects,
            'created_projects_map': self._get_created_projects_map() if contributed_to_projects else None,
            'contributed_to_projects_map': self._get_contributed_to_projects_map()
            if contributed_to_projects
            else None,
            **context,
        }

    def get_queryset(self):
        org = generics.get_object_or_404(self.request.user.organizations, pk=self.kwargs[self.lookup_field])
        if flag_set('fix_backend_dev_3134_exclude_deactivated_users', self.request.user):
            serializer = OrganizationMemberListParamsSerializer(data=self.request.GET)
            serializer.is_valid(raise_exception=True)
            active = serializer.validated_data.get('active')

            # return only active users (exclude DISABLED and NOT_ACTIVATED)
            if active:
                return org.active_members.prefetch_related('user__om_through').order_by('user__username')

            # organization page to show all members
            return org.members.prefetch_related('user__om_through').order_by('user__username')
        else:
            return org.members.prefetch_related('user__om_through').order_by('user__username')

    def list(self, request, *args, **kwargs):
        page = self.paginated_members   # Using cached property to avoid multiple queries
        serializer = self.get_serializer(page, many=True)
        return self.get_paginated_response(serializer.data)


@method_decorator(
    name='get',
    decorator=extend_schema(
        tags=['Organizations'],
        summary='Get organization member details',
        description=_S('schema.action.get_org_member'),
        parameters=[
            OpenApiParameter(
                name='user_pk',
                type=OpenApiTypes.INT,
                location='path',
                description=_S('schema.param.user_id'),
            ),
            OpenApiParameter(
                name='contributed_to_projects',
                type=OpenApiTypes.BOOL,
                location='query',
                description=_S('schema.param.include_projects'),
            ),
        ],
        responses={200: OrganizationMemberSerializer()},
        extensions={
            'x-fern-sdk-group-name': ['organizations', 'members'],
            'x-fern-sdk-method-name': 'get',
            'x-fern-audiences': ['public'],
        },
    ),
)
@method_decorator(
    name='delete',
    decorator=extend_schema(
        tags=['Organizations'],
        summary='Soft delete an organization member',
        description=_S('schema.action.delete_org_member'),
        parameters=[
            OpenApiParameter(
                name='user_pk',
                type=OpenApiTypes.INT,
                location='path',
                description=_S('schema.param.user_id'),
            ),
        ],
        responses={
            204: OpenApiResponse(description=_S('schema.resp.member_deleted')),
            405: OpenApiResponse(description=_S('schema.org.cannot_delete_self')),
            404: OpenApiResponse(description=_S('schema.org.member_not_found')),
            403: OpenApiResponse(description=_S('schema.org.cannot_delete_cross_org')),
        },
        extensions={
            'x-fern-sdk-group-name': ['organizations', 'members'],
            'x-fern-sdk-method-name': 'delete',
            'x-fern-audiences': ['public'],
        },
    ),
)
class OrganizationMemberDetailAPI(GetParentObjectMixin, generics.RetrieveDestroyAPIView):
    permission_required = ViewClassPermission(
        GET=all_permissions.organizations_view,
        DELETE=all_permissions.organizations_change,
    )
    parent_queryset = Organization.objects.all()
    parser_classes = (JSONParser, FormParser, MultiPartParser)
    serializer_class = OrganizationMemberSerializer
    http_method_names = ['delete', 'get']

    #DRF（Django REST Framework）视图的动态权限控制
    @property
    def permission_classes(self):
        # 如果请求方法是 DELETE（删除）
        if self.request.method == 'DELETE':
            # 只允许【IAM认证 + 对象权限】
            return [IsAuthenticated, HasObjectPermission]
        # 其他请求（GET/POST/PUT）走系统默认权限
        return api_settings.DEFAULT_PERMISSION_CLASSES

    def get_queryset(self):
        return OrganizationMember.objects.filter(organization=self.parent_object).select_related('user')

    def get_serializer_context(self):
        return {
            **super().get_serializer_context(),
            'organization': self.parent_object,
            'contributed_to_projects': bool_from_request(self.request.GET, 'contributed_to_projects', False),
        }

    def get(self, request, pk, user_pk):
        queryset = self.get_queryset()
        member = get_object_or_404(queryset, user=user_pk)
        self.check_object_permissions(request, member)
        serializer = self.get_serializer(member)
        return Response(serializer.data)

    def delete(self, request, pk=None, user_pk=None):
        org = self.parent_object
        if org != request.user.active_organization:
            raise PermissionDenied(get_response_message('organization.cannot_delete_members_cross_org', language=_detect_lang(request)))

        user = get_object_or_404(User, pk=user_pk)
        member = get_object_or_404(OrganizationMember, user=user, organization=org)
        if member.deleted_at is not None:
            raise NotFound(get_response_message('organization.member_not_found', language=_detect_lang(request)))

        if member.user_id == request.user.id:
            return Response({'detail': get_response_message('organization.cannot_soft_delete_self', language=_detect_lang(request))}, status=status.HTTP_405_METHOD_NOT_ALLOWED)

        member.soft_delete()
        return Response(status=204)  # 204 No Content is a common HTTP status for successful delete requests


@method_decorator(
    name='get',
    decorator=extend_schema(
        tags=['Organizations'],
        summary='Get organization settings',
        description=_S('schema.action.get_org_settings'),
        extensions={
            'x-fern-sdk-group-name': 'organizations',
            'x-fern-sdk-method-name': 'get',
            'x-fern-audiences': ['public'],
        },
    ),
)
@method_decorator(
    name='patch',
    decorator=extend_schema(
        tags=['Organizations'],
        summary='Update organization settings',
        description=_S('schema.action.update_org_settings'),
        extensions={
            'x-fern-sdk-group-name': 'organizations',
            'x-fern-sdk-method-name': 'update',
            'x-fern-audiences': ['public'],
        },
    ),
)
class OrganizationAPI(generics.RetrieveUpdateAPIView):

    parser_classes = (JSONParser, FormParser, MultiPartParser)
    queryset = Organization.objects.all()
    permission_required = all_permissions.organizations_change
    serializer_class = OrganizationSerializer

    redirect_route = 'organizations-dashboard'
    redirect_kwarg = 'pk'

    def get(self, request, *args, **kwargs):
        return super(OrganizationAPI, self).get(request, *args, **kwargs)

    def patch(self, request, *args, **kwargs):
        return super(OrganizationAPI, self).patch(request, *args, **kwargs)

    @extend_schema(exclude=True)
    def put(self, request, *args, **kwargs):
        return super(OrganizationAPI, self).put(request, *args, **kwargs)


@method_decorator(
    name='get',
    decorator=extend_schema(
        tags=['Invites'],
        summary='Get organization invite link',
        description=_S('schema.action.get_org_invite'),
        responses={200: OrganizationInviteSerializer()},
        extensions={
            'x-fern-sdk-group-name': 'organizations',
            'x-fern-sdk-method-name': 'get_invite',
            'x-fern-audiences': ['public'],
        },
    ),
)
class OrganizationInviteAPI(generics.RetrieveAPIView):
    parser_classes = (JSONParser,)
    queryset = Organization.objects.all()
    permission_required = all_permissions.organizations_invite

    def get(self, request, *args, **kwargs):
        org = request.user.active_organization
        invite_url = '{}?token={}'.format(reverse('user-signup'), org.token)
        if hasattr(settings, 'FORCE_SCRIPT_NAME') and settings.FORCE_SCRIPT_NAME:
            invite_url = invite_url.replace(settings.FORCE_SCRIPT_NAME, '', 1)
        serializer = OrganizationInviteSerializer(data={'invite_url': invite_url, 'token': org.token})
        serializer.is_valid()
        return Response(serializer.data, status=200)


@method_decorator(
    name='post',
    decorator=extend_schema(
        tags=['Invites'],
        summary='Reset organization token',
        description=_S('schema.action.reset_org_token'),
        responses={200: OrganizationInviteSerializer()},
        extensions={
            'x-fern-sdk-group-name': 'organizations',
            'x-fern-sdk-method-name': 'reset_token',
            'x-fern-audiences': ['public'],
        },
    ),
)
class OrganizationResetTokenAPI(APIView):
    permission_required = all_permissions.organizations_invite
    parser_classes = (JSONParser,)

    def post(self, request, *args, **kwargs):
        org = request.user.active_organization
        org.reset_token()
        logger.debug(f'New token for organization {org.pk} is {org.token}')
        invite_url = '{}?token={}'.format(reverse('user-signup'), org.token)
        serializer = OrganizationInviteSerializer(data={'invite_url': invite_url, 'token': org.token})
        serializer.is_valid()
        return Response(serializer.data, status=201)
