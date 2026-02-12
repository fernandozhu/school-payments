import uuid
from django.db import models

from backend.api.models.school import School
from backend.api.models.student import Student


class FieldTrip(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    location = models.CharField(max_length=255)
    cost = models.FloatField()
    date = models.DateTimeField()


class FieldTripRegistration(models.Model):
    field_trip = models.ForeignKey(FieldTrip, on_delete=models.CASCADE)
    student = models.ForeignKey(Student, on_delete=models.CASCADE)
