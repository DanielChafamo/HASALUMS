from django import forms
from django.contrib.auth.forms import UserCreationForm
from django.contrib.auth.models import User
from .models import Post
from .models import UserProfile

class PostForm(forms.ModelForm):

  class Meta:
    model = Post
    fields = ('title', 'text', 'destination',)


class SignUpForm(UserCreationForm):
  email = forms.EmailField(max_length=254, help_text='Please provide a valid .harvard.edu address')  

  class Meta:
    model = User 
    fields = ('first_name', 'last_name', 'username', 'password1', 'password2', 'email',  )


class UserForm(forms.ModelForm):

  class Meta:
    model = User  
    fields = ('first_name', 'last_name', 'username', )


class ProfileForm(forms.ModelForm):

  class Meta:
    model = UserProfile 
    fields = ('email', 'contact_info', 'blurb', "location", "current_job", "school", "year", "concentration")

    