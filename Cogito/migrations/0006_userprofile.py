# Generated by Django 2.0.2 on 2018-08-25 15:54

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ('Cogito', '0005_auto_20180820_0720'),
    ]

    operations = [
        migrations.CreateModel(
            name='UserProfile',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('firstname', models.CharField(max_length=200, null=True)),
                ('lastname', models.CharField(max_length=200, null=True)),
                ('email', models.EmailField(max_length=264, null=True)),
                ('email_confirmed', models.BooleanField(default=False)),
                ('location', models.TextField(max_length=500, null=True)),
                ('contact_info', models.TextField(max_length=500, null=True)),
                ('blurb', models.TextField(max_length=1000, null=True)),
                ('user', models.OneToOneField(on_delete=django.db.models.deletion.CASCADE, to=settings.AUTH_USER_MODEL)),
            ],
        ),
    ]
