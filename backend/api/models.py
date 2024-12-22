from django.db import models
from django.contrib.auth.models import User

from django_rest_passwordreset.signals import reset_password_token_created
from django.dispatch import receiver
from django.urls import reverse
from django.template.loader import render_to_string
from django.core.mail import EmailMultiAlternatives
from django.utils.html import strip_tags

class Note(models.Model):
    title = models.CharField(max_length=100)
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    author = models.ForeignKey(User, on_delete=models.CASCADE, related_name="notes")

    def __str__(self):
        return self.title

class ProductCategory(models.TextChoices): # <constant_name> = '<database_value>', '<human_readable_value>'
    RICE_AND_PASTA = 'Rice and Pasta', 'Rice and Pasta'
    PROCESSED_PROTEINS = 'Processed Proteins', 'Processed Proteins'
    CANNED_FOOD = 'Canned Food', 'Canned Food'
    DRINKS_AND_DESSERTS = 'Drinks and Desserts', 'Drinks and Desserts'
    MISCELLANEOUS = 'Miscellaneous', 'Miscellaneous'

class Inventory(models.Model):
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
        return f"{self.name} ({self.category}) - {self.quantity} in stock" # Check if necessary


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
