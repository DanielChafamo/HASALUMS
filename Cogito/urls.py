
from django.conf.urls import url
from Cogito import views

from django.conf import settings
from django.contrib.staticfiles.views import serve as serve_static
from django.views.decorators.cache import never_cache
from django.conf.urls.static import static
from django.contrib.auth import views as auth_views


app_name = 'Cogito'

auth_url_patterns = [  
  url(r'^login/$', auth_views.login, name='login'), 
  url(r'^logout/$', auth_views.logout, {'next_page': '/'}, name='logout'), 
  # url(r'^signup/$', auth_views.signup, name='login'), 
  url(r'^profile/$', views.ProfilePage, name='profile'),  
] 

curd_url_patterns = [
  url(r'^$', views.RetrievePost, name="home"),
  url(r'^ajax/create_post/$', views.CreatePost, name='CreatePost'),
  url(r'^ajax/update_post/$', views.UpdatePost, name='UpdatePost'), 
  url(r'^ajax/delete_post/$', views.DeletePost, name='DeletePost'),
  url(r'^ajax/log_response/$', views.LogResponse, name='LogResponse'),
]

blog_url_patterns = [url(r'^{}/$'.format(category), views.RetrievePost, name=category)
                    for category in views.categories]

urlpatterns = auth_url_patterns + curd_url_patterns + blog_url_patterns 

if settings.DEBUG:
  urlpatterns = static(settings.STATIC_URL, view=never_cache(serve_static)) + urlpatterns

