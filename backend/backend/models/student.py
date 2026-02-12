from django.db import models

from backend.models.parent import Parent
from backend.models.school import School


class Student(models.Model):
    first_name = models.CharField(max_length=255)
    last_name = models.CharField(max_length=255)
    parent = models.ForeignKey(Parent, related_name='children', on_delete=models.PROTECT)
    school = models.ForeignKey(School, related_name='students', on_delete=models.CASCADE)

    def __str__(self):
        return "{} {}".format(self.first_name, self.last_name)
