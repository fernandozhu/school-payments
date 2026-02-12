from django.utils import timezone

from rest_framework.exceptions import ValidationError
from rest_framework import generics

from backend.api.models.field_trip import FieldTrip, FieldTripRegistration
from backend.api.models.school import School
from backend.api.serializers import FieldTripSerializer, FieldTripPaymentSerializer
from backend.api.models.student import Student
from backend.api.models.parent import Parent
from backend.api.models.transaction import Transaction
from backend.legacy_api import LegacyPaymentProcessor


# Create your views here.

class FieldTripView(generics.ListAPIView):
    queryset = FieldTrip.objects.all()
    serializer_class = FieldTripSerializer


class FieldTripPaymentView(generics.CreateAPIView):
    queryset = FieldTrip.objects.all()
    serializer_class = FieldTripPaymentSerializer

    def perform_create(self, serializer):
        schools = School.objects.filter(pk=serializer.validated_data['school_id'])
        field_trips = FieldTrip.objects.filter(pk=serializer.validated_data['field_trip_id'])

        if not schools.exists():
            raise ValidationError("School does not exist")

        if not field_trips.exists():
            raise ValidationError("Field trip does not exist")

        school: School = schools.first()
        field_trip: FieldTrip = field_trips.first()

        parent, _ = Parent.objects.get_or_create(
            first_name=serializer.validated_data['parent_first_name'],
            last_name=serializer.validated_data['parent_last_name'],
            email=serializer.validated_data['email'],
        )

        student, _ = Student.objects.get_or_create(
            first_name=serializer.validated_data['student_first_name'],
            last_name=serializer.validated_data['student_last_name'],
            parent=parent,
            school=school
        )

        activity_registration, _ = FieldTripRegistration.objects.get_or_create(
            student=student,
            field_trip=field_trip,
        )

        payment_data = {
            "student_name": student.__str__(),
            "parent_name": parent.__str__(),
            "amount": field_trip.cost,
            "card_number": serializer.validated_data['card_number'],
            "expiry_date": serializer.validated_data['expiry_date'],
            "cvv": serializer.validated_data['cvv'],
            "school_id": school.id,
            "activity_id": field_trip.id,
        }

        legacy_payment_processor = LegacyPaymentProcessor()
        response = legacy_payment_processor.process_payment(payment_data)

        if not response.success:
            raise ValidationError(response.error_message)

        transaction = Transaction()
        transaction.id = response.transaction_id
        transaction.student = student
        transaction.activity = field_trip
        transaction.amount = payment_data['amount']
        transaction.date = timezone.localtime(timezone.now())
        transaction.save()
