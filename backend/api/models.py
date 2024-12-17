from django.db import models
from django.contrib.auth.models import User

from django_rest_passwordreset.signals import reset_password_token_created
from django.dispatch import receiver
from django.urls import reverse
from django.template.loader import render_to_string
from django.core.mail import EmailMultiAlternatives
from django.utils.html import strip_tags


class Profile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    photo_id = models.ImageField(upload_to='photos/', null=True, blank=True)

    def __str__(self):
        return f"{self.user.username}'s Profile"

class Note(models.Model):
    title = models.CharField(max_length=100)
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    author = models.ForeignKey(User, on_delete=models.CASCADE, related_name="notes")

    def __str__(self):
        return self.title


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
