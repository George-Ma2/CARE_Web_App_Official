from django.db import models
from django.contrib.auth.models import User
from django_rest_passwordreset.signals import reset_password_token_created
from django.dispatch import receiver
from django.urls import reverse
from django.template.loader import render_to_string
from django.core.mail import EmailMultiAlternatives
from django.utils.html import strip_tags
from django.db.models.signals import post_save



class ProductCategory(models.TextChoices): 
    RICE_AND_PASTA = 'Rice and Pasta', 'Rice and Pasta'
    PROCESSED_PROTEINS = 'Processed Proteins', 'Processed Proteins'
    CANNED_FOOD = 'Canned Food', 'Canned Food'
    DRINKS_AND_DESSERTS = 'Drinks and Desserts', 'Drinks and Desserts'
    MISCELLANEOUS = 'Miscellaneous', 'Miscellaneous'

class Inventory(models.Model):
    id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=255)
    quantity = models.PositiveIntegerField()
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
    ORDERED = 'Ordered', 'Ordered'
    OUTOFSTOCK = 'Out of Stock', 'Out of Stock'

class CarePackage(models.Model):
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True, null=True)
    items = models.ManyToManyField(Inventory, through='CarePackageItem')
    quantity = models.PositiveIntegerField()
    initial_quantity = models.PositiveIntegerField()  
    delivery_date = models.DateField(blank=True, null=True)
    status = models.CharField(
        max_length=50,
        choices=CarePackageStatus.choices,
        default=CarePackageStatus.CREATED
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def save(self, *args, **kwargs):
        if self.initial_quantity is None: 
            self.initial_quantity = self.quantity
        super().save(*args, **kwargs)

    def __str__(self):
        return f"Care Package: {self.name}"


class CarePackageItem(models.Model):
    care_package = models.ForeignKey(CarePackage, related_name='care_package_items', on_delete=models.CASCADE)
    product = models.ForeignKey(Inventory, on_delete=models.CASCADE)
    quantity = models.PositiveIntegerField()

    def __str__(self):
        return f"{self.product.name} x {self.quantity}"



class OrderHistory(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='order_histories')
    package = models.ForeignKey('CarePackage', on_delete=models.CASCADE, related_name='order_histories')
    order_date = models.DateTimeField(auto_now_add=True)
    status = models.CharField(
        max_length=50,
        choices=CarePackageStatus.choices,
        default=CarePackageStatus.ORDERED
    )

    def __str__(self):
        return f"Order by {self.user.username} for package {self.package.name} - Status: {self.status}"


@receiver(post_save, sender=OrderHistory)
def send_order_confirmation_email(sender, instance, created, **kwargs):
    if created: 
        user = instance.user
        package = CarePackage.objects.filter(id=instance.package_id).first()

        if not package:
            return  

        # Fetch package details
        package_description = package.description
        delivery_date = package.delivery_date

        # Fetch products in the package
        package_items = CarePackageItem.objects.filter(care_package_id=package.id)
        product_names = [Inventory.objects.get(id=item.product_id).name for item in package_items]

        context = {
            "full_name": user.first_name + ' ' + user.last_name,
            "email": user.email,
            "order_id": instance.id,
            "order_date": instance.order_date.strftime("%B %d, %Y"),  
            "status": instance.status,
            "package_description": package_description,
            "delivery_date": delivery_date.strftime("%B %d, %Y"),
            "product_names": product_names,
            }


        # Render email content
        email_html_message = render_to_string("backend/order_confirmation_email.html", context=context)
        plain_message = strip_tags(email_html_message)

        # Send the email
        msg = EmailMultiAlternatives(
            subject=f"Order Confirmation - Order #{instance.id}",
            body=plain_message,
            from_email="sender@example.com",
            to=[user.email],
        )

        print ("Sending to email:", user.email)
        msg.attach_alternative(email_html_message, "text/html")
        msg.send()
