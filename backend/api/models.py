from django.db import models
from django.contrib.auth.models import User

class Note(models.Model):
    title = models.CharField(max_length=100)
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    author = models.ForeignKey(User, on_delete=models.CASCADE, related_name="notes")

    def __str__(self):
        return self.title

# Product Inventory Model
class Product(models.Model):
    #id = models.CharField(max_length=50, unique=True)
    name = models.CharField(max_length=100)
    category = models.CharField(max_length=100)
    qty_on_hand = models.IntegerField()
    qty_delivered = models.IntegerField()
    qty_on_change = models.IntegerField()
    exp_date = models.DateField()
    created_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name="products")

    def __str__(self):
        return self.name