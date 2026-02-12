from django.urls import path
from backend.api.views import FieldTripView, FieldTripPaymentView

urlpatterns = [
    path(route='fieldtrip', view=FieldTripView.as_view(), name='fieldtrip'),
    path(route='payment', view=FieldTripPaymentView.as_view(), name='payment'),
]
