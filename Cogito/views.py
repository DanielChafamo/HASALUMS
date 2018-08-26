from django.shortcuts import render, get_object_or_404, redirect
from django.http import JsonResponse
from django.contrib.auth.decorators import login_required
from django.contrib.auth.models import User
from django.http import JsonResponse
from django.utils import timezone
from django.contrib.sites.shortcuts import get_current_site 
from django.utils.encoding import force_bytes, force_text
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode 
from django.template.loader import render_to_string
from django.contrib.auth import login 
from .forms import SignUpForm, PostForm
from .tokens import account_activation_token 
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
# Auth views
# 

def SignUp(request):
  if request.method == 'POST':

    form = SignUpForm(request.POST)
    if form.is_valid():
      user = form.save(commit=False)
      user.is_active = False
      user.save()
      current_site = get_current_site(request)
      subject = 'Activate Your DL Account'
      message = render_to_string('registration/account_activation_email.html', {
        'user': user,
        'domain': current_site.domain,
        'uid': urlsafe_base64_encode(force_bytes(user.pk)).decode(),
        'token': account_activation_token.make_token(user),
      })
      user.email_user(subject, message)
      return redirect('Cogito:AccountActivationSent')
  else:
    form = SignUpForm()
  return render(request, 'registration/signup.html', context={'form': form})


def Activate(request, uidb64, token):
    try:
        uid = force_text(urlsafe_base64_decode(uidb64))
        user = User.objects.get(pk=uid)
    except (TypeError, ValueError, OverflowError, User.DoesNotExist):
        user = None

    if user is not None and account_activation_token.check_token(user, token):
        user.is_active = True
        user.profile.email_confirmed = True
        user.save()
        login(request, user)
        return redirect('Cogito:home')
    else:
        return render(request, 'registration/account_activation_invalid.html')


def AccountActivationSent(request):
  return render(request, 'registration/account_activation_sent.html')

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

