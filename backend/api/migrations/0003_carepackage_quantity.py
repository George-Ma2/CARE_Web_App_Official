# Generated by Django 5.1.4 on 2025-01-10 23:35

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0002_carepackage_carepackageitem_carepackage_items'),
    ]

    operations = [
        migrations.AddField(
            model_name='carepackage',
            name='quantity',
            field=models.IntegerField(default=1),
        ),
    ]
