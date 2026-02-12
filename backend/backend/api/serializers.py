import re

from rest_framework import serializers

from backend.api.models.field_trip import FieldTrip


class FieldTripSerializer(serializers.ModelSerializer):
    class Meta:
        model = FieldTrip
        fields = '__all__'


class FieldTripPaymentSerializer(serializers.Serializer):
    student_first_name = serializers.CharField(required=True)
    student_last_name = serializers.CharField(required=True)
    parent_first_name = serializers.CharField(required=True)
    parent_last_name = serializers.CharField(required=True)
    activity_id = serializers.CharField(required=True)
    card_number = serializers.CharField(required=True)
    expiry_date = serializers.CharField(required=True)
    cvv = serializers.CharField(required=True)
    email = serializers.EmailField(required=True)
    school_id = serializers.CharField(required=True)

    @staticmethod
    def validate_card_number(value):
        """
        Check if the card number contains 16 digits
        """
        if (not len(value) == 16) or (not value.isdigit()):
            raise serializers.ValidationError("Invalid card number")
        return value

    @staticmethod
    def validate_cvv(value):
        """
        CVV must be 3 digits
        """
        if (not len(value) == 3) or (not value.isdigit()):
            raise serializers.ValidationError("Invalid CVV")
        return value

    @staticmethod
    def validate_expiry_date(value):
        """
        Expiry date string must follow format MM/YY
        """
        expiry_date_regex = re.compile(r"^(0[1-9]|1[0-2])/([0-9]{2})$")
        match = expiry_date_regex.match(value)

        if not match:
            raise serializers.ValidationError("Invalid expiry date")

        return value
