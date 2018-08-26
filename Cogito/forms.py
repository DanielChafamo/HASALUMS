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
    # widgets = {
    #   'first_name': forms.TextInput(attrs={'placeholder': 'First Name'}),
    #   'last_name': forms.TextInput(attrs={'placeholder': 'Last Name'}),
    #   'username': forms.TextInput(attrs={'placeholder': 'Username'}),
    #   'password1': forms.TextInput(attrs={'placeholder': 'Password'}),
    #   'password2': forms.TextInput(attrs={'placeholder': 'Confirm Password'}),
    #   'email': forms.TextInput(attrs={'placeholder': 'Email Address'}),  
    # }


class UserForm(forms.ModelForm):

  class Meta:
    model = UserProfile 
    fields = ('firstname', 'lastname', 'email', )


class ProfileForm(forms.ModelForm):

  class Meta:
    model = UserProfile 
    fields = ('location', 'contact_info', 'blurb', )

    