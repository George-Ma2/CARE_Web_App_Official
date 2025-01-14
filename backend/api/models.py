from django.db import models
from django.contrib.auth.models import User

from django_rest_passwordreset.signals import reset_password_token_created
from django.dispatch import receiver
from django.urls import reverse
from django.template.loader import render_to_string
from django.core.mail import EmailMultiAlternatives
from django.utils.html import strip_tags
from django.db import models
import json


class ProductCategory(models.TextChoices): # <constant_name> = '<database_value>', '<human_readable_value>'
    RICE_AND_PASTA = 'Rice and Pasta', 'Rice and Pasta'
    PROCESSED_PROTEINS = 'Processed Proteins', 'Processed Proteins'
    CANNED_FOOD = 'Canned Food', 'Canned Food'
    DRINKS_AND_DESSERTS = 'Drinks and Desserts', 'Drinks and Desserts'
    MISCELLANEOUS = 'Miscellaneous', 'Miscellaneous'

class Inventory(models.Model):
    id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=255)
    quantity = models.PositiveIntegerField()
    # quantity_delivered = models.PositiveIntegerField()
    # quantity_on_change = models.IntegerField()
    category = models.CharField(
        max_length=50,
        choices=ProductCategory.choices,
        default=ProductCategory.MISCELLANEOUS
    )
    expiration_date = models.DateField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.name} ({self.category}) - {self.quantity} in stock"
    
    def reserve_stock(self, quantity):
        """Reserve stock by decreasing the available quantity."""
        if quantity > self.quantity:
            raise ValueError("Not enough stock to reserve.")
        self.quantity -= quantity
        self.save()

    def return_stock(self, quantity):
        """Return stock to inventory if a care package is cancelled."""
        self.quantity += quantity
        self.save()


class Profile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    photo_id = models.BinaryField(null=True, blank=True)

    def __str__(self):
        return f"{self.user.username}'s Profile"


@receiver(reset_password_token_created)
def password_reset_token_created(reset_password_token, *args, **kwargs):
    sitelink = "http://localhost:5173/"
    token = "{}".format(reset_password_token.key)
    full_link = str(sitelink)+str("password_reset/")+str(token)

    print (full_link)
    print (token)

    context = {
        "full_link": full_link,
        "email_address": reset_password_token.user.email
    }

    email_html_message = render_to_string("backend/email.html", context=context)
    plain_message = strip_tags(email_html_message)

    msg = EmailMultiAlternatives(
        subject="Password Reset for {title}".format(title=reset_password_token.user.email),
        body=plain_message,
        from_email="sender@example.com",
        to=[reset_password_token.user.email]
    )

    msg.attach_alternative(email_html_message, "text/html")
    msg.send()


from django.db.models.signals import post_save
from django.dispatch import receiver

@receiver(post_save, sender=User)
def create_user_profile(sender, instance, **kwargs):
    if not hasattr(instance, 'profile'):
        Profile.objects.create(user=instance)

@receiver(post_save, sender=User)
def save_user_profile(sender, instance, **kwargs):
    instance.profile.save()

class CarePackageStatus(models.TextChoices): # <constant_name> = '<database_value>', '<human_readable_value>'
    CREATED = 'Created', 'Created',
    PICKED_UP = 'Picked Up', 'Picked Up',
    CANCELLED = 'Cancelled', 'Cancelled'

class CarePackage(models.Model):
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True, null=True)
    items = models.ManyToManyField(Inventory, through='CarePackageItem')
    quantity = models.IntegerField(default=1)
    status = models.CharField(
        max_length=50,
        choices=CarePackageStatus.choices,
        default=CarePackageStatus.CREATED
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Care Package: {self.name}"


class CarePackageItem(models.Model):
    care_package = models.ForeignKey(CarePackage, related_name='care_package_items', on_delete=models.CASCADE)
    product = models.ForeignKey(Inventory, on_delete=models.CASCADE)
    quantity = models.PositiveIntegerField(default=1)

    def __str__(self):
        return f"{self.product.name} x {self.quantity}"


# class CarePackagePickup(models.Model):
#     care_package = models.ForeignKey(CarePackage, related_name='pickups', on_delete=models.CASCADE)
#     user = models.ForeignKey(User, related_name='pickups', on_delete=models.SET_NULL, null=True)
#     picked_up_at = models.DateTimeField(auto_now_add=True)
#     picked_up_location = models.CharField(max_length=255, blank=True, null=True)
#     status = models.CharField(max_length=50, choices=[('PICKED_UP', 'Picked Up'), ('CANCELLED', 'Cancelled')], default='PICKED_UP')

#     def cancel_pickup(self):
#         """Handles the cancellation of a pickup and replenishes inventory."""
#         if self.status == 'PICKED_UP':
#             self.status = 'CANCELLED'
#             self.save()

#             # Replenish inventory
#             for item in self.care_package.items.all():
#                 item.product.quantity += item.quantity
#                 item.product.save()

#     def __str__(self):
#         return f"Care Package {self.care_package.name} picked up by {self.user.username if self.user else 'Unknown'}"

