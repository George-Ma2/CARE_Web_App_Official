# Generated by Django 5.1.4 on 2025-01-13 17:52

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0004_delete_package'),
    ]

    operations = [
        migrations.AlterField(
            model_name='inventory',
            name='id',
            field=models.AutoField(primary_key=True, serialize=False),
        ),
    ]
