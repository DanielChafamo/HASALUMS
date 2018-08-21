from django.db import models
from django.utils import timezone
from django.contrib.auth.models import User
from django.shortcuts import get_object_or_404

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

 