from django.contrib import admin
from django.urls import path, include, re_path
from django.conf import settings
from django.conf.urls.static import static
from django.views.generic import TemplateView
from chat import views

urlpatterns = [
    path('admin/', admin.site.urls),

    # Auth
    path('api/register/', views.RegisterView.as_view(), name='register'),
    path('api/login/', views.LoginView.as_view(), name='login'),


    # Chat API
    path('api/', include('chat.urls')),  # API endpoints
    
    # Chat UI
    path('chat/', include('chat.urls')),  # Enables /chat/faq/, /chat/welcome/, etc.
    
    # Serve the main page at the root
    path('', views.welcome_view, name='home'),
]

# Serve static and media files in development
if settings.DEBUG:
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
