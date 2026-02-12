from django.contrib import admin
from django.contrib.admin.sites import AlreadyRegistered

# Register your models here.
from backend.api.models.field_trip import FieldTrip, FieldTripRegistration
from backend.api.models.student import Student
from backend.api.models.school import School
from backend.api.models.transaction import Transaction

try:
    admin.site.register(FieldTrip)
except AlreadyRegistered:
    pass
try:
    admin.site.register(FieldTripRegistration)
except AlreadyRegistered:
    pass

try:
    admin.site.register(Student)
except AlreadyRegistered:
    pass

try:
    admin.site.register(Student)
except AlreadyRegistered:
    pass

try:
    admin.site.register(School)
except AlreadyRegistered:
    pass

try:
    admin.site.register(Transaction)
except AlreadyRegistered:
    pass
