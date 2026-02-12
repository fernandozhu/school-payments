from django.urls import path
from backend.api.views import FieldTripView

urlpatterns = [
    path(route='fieldtrip', view=FieldTripView.as_view(), name='fieldtrip'),
]
