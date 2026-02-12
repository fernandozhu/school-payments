from django.db import models

class Parent(models.Model):
    first_name = models.CharField(max_length=255)
    last_name = models.CharField(max_length=255)
    email = models.EmailField()

    def __str__(self):
        return "{} {}".format(self.first_name, self.last_name)
