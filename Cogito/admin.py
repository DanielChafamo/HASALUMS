from django.contrib import admin 
from .models import Post



class PostAdmin(admin.ModelAdmin):
  list_display = ('title', 'destination', 'published_date', 'created_by', 'likes', ) 


admin.site.register(Post, PostAdmin) 