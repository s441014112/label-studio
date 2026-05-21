import logging

from core.translations import get_response_message
from drf_spectacular.utils import extend_schema
from rest_framework import generics
from rest_framework.exceptions import ValidationError
from rest_framework.permissions import IsAuthenticated

from users.product_tours.models import UserProductTour

from .serializers import UserProductTourSerializer

logger = logging.getLogger(__name__)


def _detect_lang(request):
    if request:
        return request.GET.get('lang') or request.META.get('HTTP_X_LANGUAGE') or (
            request.META.get('HTTP_ACCEPT_LANGUAGE', '').split(',')[0].split(';')[0].strip()
            if request.META.get('HTTP_ACCEPT_LANGUAGE') else None
        )
    return None


@extend_schema(exclude=True)
class ProductTourAPI(generics.RetrieveUpdateAPIView):
    permission_classes = (IsAuthenticated,)
    serializer_class = UserProductTourSerializer

    def get_tour_name(self):
        name = self.request.query_params.get('name')
        if not name:
            raise ValidationError(get_response_message('common.invalid_request', language=_detect_lang(self.request), detail='Name is required'))
        return name.replace('-', '_').lower()

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['name'] = self.get_tour_name()
        return context

    def get_object(self):
        name = self.get_tour_name()

        # TODO: add additional checks, e.g. user agent, role, etc.

        tour = UserProductTour.objects.filter(user=self.request.user, name=name).first()
        if not tour:
            logger.debug(f'Product tour {name} not found for user {self.request.user.id}. Creating new tour.')
            tour_serializer = self.get_serializer(data={'user': self.request.user.id, 'name': name})
            tour_serializer.is_valid(raise_exception=True)
            tour = tour_serializer.save()
        else:
            logger.debug(f'Product tour {name} requested for user {self.request.user.id}.')

        return tour
