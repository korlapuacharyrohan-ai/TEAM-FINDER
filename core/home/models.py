from django.db import models

# Create your models here.
class Student(models.Model):
     name = models.CharField(max_length=100)
     age = models.IntegerField()
     email = models.EmailField()
     address = models.TextField(null=False , blank=False)

class Car(models.Model):
     carname = models.CharField(max_length = 100)
     speed = models.IntegerField(default = 100)

     def __str__(self):
         return f"{self.carname} ({self.speed} km/h)"
