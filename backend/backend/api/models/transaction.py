from django.db import models

from backend.api.models.field_trip import FieldTrip
from backend.api.models.student import Student


class Transaction(models.Model):
    id = models.CharField(max_length=100, primary_key=True, null=False)
    date = models.DateTimeField()
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    student = models.ForeignKey(Student, related_name='transactions', on_delete=models.PROTECT)
    activity = models.ForeignKey(FieldTrip, related_name='activities', on_delete=models.PROTECT)
