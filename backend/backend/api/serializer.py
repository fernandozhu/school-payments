from rest_framework import serializers

from backend.api.models.field_trip import FieldTrip


class FieldTripSerializer(serializers.ModelSerializer):
    class Meta:
        model = FieldTrip
        fields = '__all__'
