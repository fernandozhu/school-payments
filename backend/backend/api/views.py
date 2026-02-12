from django.shortcuts import render
from rest_framework import generics

from backend.api.models.field_trip import FieldTrip
from backend.api.serializer import FieldTripSerializer

# Create your views here.

class FieldTripView(generics.ListAPIView):
    queryset = FieldTrip.objects.all()
    serializer_class = FieldTripSerializer
