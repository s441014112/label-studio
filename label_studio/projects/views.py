"""This file and its contents are licensed under the Apache License 2.0. Please see the included NOTICE for copyright information and LICENSE for a copy of the license.
"""
import logging

from django.shortcuts import render
from iam_auth.decorators import iam_login_required

logger = logging.getLogger(__name__)


@iam_login_required
def project_list(request):
    return render(request, 'projects/list.html')


@iam_login_required
def project_settings(request, pk, sub_path):
    return render(request, 'projects/settings.html')
