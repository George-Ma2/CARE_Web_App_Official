# Generated by Django 5.1.4 on 2025-01-24 18:23

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0002_carepackage_initial_quantity_and_more'),
    ]

    operations = [
        migrations.AlterField(
            model_name='carepackage',
            name='initial_quantity',
            field=models.PositiveIntegerField(default=1),
        ),
    ]
