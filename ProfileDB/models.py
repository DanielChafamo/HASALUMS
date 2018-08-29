from django.db import models
from django.utils import timezone
from django.contrib.auth.models import User
from django.shortcuts import get_object_or_404
from django.db.models.signals import post_save
from django.dispatch import receiver

dan = get_object_or_404(User, username='danielchafamo')

class Post(models.Model): 
    title = models.CharField(max_length=200)
    text = models.TextField()
    destination = models.CharField(max_length=200)
    created_date = models.DateTimeField(default=timezone.now)
    published_date = models.DateTimeField(blank=True, null=True)
    created_by = models.ForeignKey(User, related_name="created", default=dan.pk, on_delete=models.CASCADE) 
    liked_by = models.ManyToManyField(User, related_name="liked")
    bookmarked_by = models.ManyToManyField(User, related_name="bookmarked")

    def publish(self):
        self.published_date = timezone.now()
        self.save()

    def __str__(self):
        return self.title

 
class UserProfile(models.Model):
    user = models.OneToOneField(User, related_name="profile", on_delete=models.CASCADE) 
    firstname = models.CharField(max_length=200, null=True)
    lastname = models.CharField(max_length=200, null=True)
    # picture = models.ImageField()
    email = models.EmailField(max_length=264, null=True)
    email_confirmed = models.BooleanField(default=False)
    location = models.TextField(max_length=500, null=True)
    contact_info = models.TextField(max_length=500, null=True)
    blurb = models.TextField(max_length=1000, null=True)

    def __str__(self):
        return "{}, {}".format(self.lastname, self.firstname)


@receiver(post_save, sender=User)
def create_user_profile(sender, instance, created, **kwargs):
    if created:
        UserProfile.objects.create(user=instance)

@receiver(post_save, sender=User)
def save_user_profile(sender, instance, **kwargs):
    instance.profile.save() 
     
