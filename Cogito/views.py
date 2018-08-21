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
  return SavePost(request, form)
    
@login_required(login_url='/login/')
def UpdatePost(request):
  post = get_object_or_404(Post, pk=request.POST['pid']) 
  form = PostForm(request.POST or None, instance=post)  
  return SavePost(request, form)

def RetrievePost(request):     
  category = request.META["PATH_INFO"][1:-1]
  if category == '':
    category = "Home" 

  form =  PostForm()
  posts = Post.objects.filter(destination=category.capitalize()).order_by('published_date') 
  created = posts.filter(created_by__username=request.user)
  liked = posts.filter(liked_by__username=request.user)
  bookmarked = posts.filter(bookmarked_by__username=request.user)
  
  context = {
      'form': form, 
      'posts': posts, 
      'liked': json.dumps([lpost.pk for lpost in liked]),
      'created': json.dumps([cpost.pk for cpost in created]),
      'bookmarked': json.dumps([bpost.pk for bpost in bookmarked]),
      'category': category,
      'categories': categories, 
      'site_struct': site_struct
    } 
  return render(request, 'Cogito/blog.html', context=context) 

@login_required(login_url='/login/')
def DeletePost(request):
  post = get_object_or_404(Post, pk=request.POST['pid'])  
  post.delete()
  return JsonResponse({'success': True, 'pid': request.POST['pid']})


# 
# Like, comment, bookmark views
# 

# @login_required(login_url='/login/')
def LogResponse(request):
  print(request.user.is_authenticated)
  if not request.user.is_authenticated:
    return JsonResponse({'success': False, 'redirect':'/login/'})
  if request.POST['type'] == 'like':
    post = get_object_or_404(Post, pk=request.POST['pid']) 
    user = get_object_or_404(User, username=request.user)   
    post.liked_by.add(user)
    return JsonResponse({'success': True, 'pid': request.POST['pid']}) 

  if request.POST['type'] == 'bookmark': 
    post = get_object_or_404(Post, pk=request.POST['pid']) 
    user = get_object_or_404(User, username=request.user)  
    post.bookmarked_by.add(user)
    return JsonResponse({'success': True, 'pid': request.POST['pid']}) 


# 
# Personal views
# 

@login_required(login_url='/login/')
def ProfilePage(request):
  posts = Post.objects.filter(bookmarked_by__username=request.user)
  created = posts.filter(created_by__username=request.user)
  liked = posts.filter(liked_by__username=request.user)
  bookmarked = posts.filter(bookmarked_by__username=request.user)
  context = { 
      'posts': posts,
      'liked': json.dumps([lpost.pk for lpost in liked]),
      'created': json.dumps([cpost.pk for cpost in created]),
      'bookmarked': json.dumps([bpost.pk for bpost in bookmarked]),
      'categories': categories, 
      'site_struct': site_struct
    } 
  return render(request, 'Cogito/profile.html', context=context) 


@login_required(login_url='/login/')
def ViewBookmarked(request):
  Post.objects.filter(bookmarked_by__pk=request.user)

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
                         'pid': post.pk})
  else:
    return JsonResponse({'success': False, 'error': 'Form invalid'})

