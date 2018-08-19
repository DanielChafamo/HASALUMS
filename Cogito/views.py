from django.shortcuts import render, get_object_or_404
from django.http import JsonResponse
from django.contrib.auth.decorators import login_required
from django.contrib.auth.models import User
from django.http import JsonResponse
from django.utils import timezone
from .forms import PostForm 
from .models import Post
import json
import os


BASE_DIR = os.path.dirname(os.path.dirname(__file__))
REPOSITORY_ROOT = os.path.dirname(BASE_DIR)
STATIC_ROOT = os.path.join(REPOSITORY_ROOT, 'DeliberateLiving/Cogito/static/')


site_struct = \
  [
    ("Home", [
        "home" ]),
    ("Musings",[
        "cultural", 
        "philosophical", 
        "religious", 
        "social" ]), 
    ("Journal", [
        "daily", 
        "prayer" ]), 
    ("Self", [
        "plan", 
        "identity", 
        "retro" ]),  
    ("Stolen", [
        "quotes", 
        "others" ]),
  ]

categories = []
for direc in site_struct:
  categories += direc[1]
 

# 
#   CURD views
# 

@login_required(login_url='/login/')
def CreatePost(request):
  form = PostForm(request.POST)  
  SavePost(request, form)
    
@login_required(login_url='/login/')
def UpdatePost(request):
  post = get_object_or_404(Post, pk=request.POST['pid']) 
  form = PostForm(request.POST or None, instance=post)  
  SavePost(request, form)

def RetrievePost(request):     
  category = request.META["PATH_INFO"][1:-1]
  if category == '':
    category = "Home" 
  form =  PostForm()
  posts = Post.objects.filter(published_date__lte=timezone.now(), 
                              destination=category.capitalize()).order_by('published_date') 
  context = {
      'form': form, 
      'posts': posts, 
      'categories': categories, 
      'site_struct': site_struct
    } 
  return render(request, 'Cogito/blog_base.html', context=context) 

@login_required(login_url='/login/')
def DeletePost(request):
  post = get_object_or_404(Post, pk=request.POST['pid'])  
  post.delete()
  return JsonResponse({'success': True, 'pid': request.POST['pid']})


# 
# Like, comment, bookmark views
# 

@login_required(login_url='/login/')
def LogResponse(request):
  pass

def RetrievePost(request):     
  category = request.META["PATH_INFO"][1:-1]
  if category == '':
    category = "Home" 
  form =  PostForm()
  posts = Post.objects.filter(published_date__lte=timezone.now(), 
                              destination=category.capitalize()).order_by('published_date') 
  context = \
    {
      'form': form, 
      'posts': posts, 
      'categories': categories, 
      'site_struct': site_struct
    } 
  return render(request, 'Cogito/blog_base.html', context=context) 


# 
# Helpers
# 
 
def SavePost(request, form):
  if form.is_valid():
    post = form.save(commit=False) 
    post.published_date = timezone.now() 
    post.created_by = request.user
    post.save()
    return JsonResponse({'success': True,
                         'title': post.title, 
                         'text': post.text, 
                         'destination': post.destination,
                         'pid': post.pid})
  else:
    return JsonResponse({'success': False, 'error': 'Form invalid'})

