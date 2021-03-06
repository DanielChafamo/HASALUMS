# Generated by Django 2.0.2 on 2018-09-14 18:18

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('ProfileDB', '0007_auto_20180826_1516'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='userprofile',
            name='firstname',
        ),
        migrations.RemoveField(
            model_name='userprofile',
            name='lastname',
        ),
        migrations.AddField(
            model_name='userprofile',
            name='current_job',
            field=models.TextField(max_length=500, null=True),
        ),
        migrations.AddField(
            model_name='userprofile',
            name='school',
            field=models.TextField(max_length=500, null=True),
        ),
        migrations.AddField(
            model_name='userprofile',
            name='year',
            field=models.TextField(max_length=500, null=True),
        ),
        migrations.AlterField(
            model_name='post',
            name='created_by',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='created', to=settings.AUTH_USER_MODEL),
        ),
    ]
