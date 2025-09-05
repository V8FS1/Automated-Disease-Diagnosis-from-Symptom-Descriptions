from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    ConversationViewSet, 
    PredictView, 
    predict_symptoms,
    chat_view, 
    welcome_view, 
    faq_view, 
    signin_view, 
    index_view, 
    topic_test_view, 
    LoginView,
    RegisterView,
    LogoutView,
    ConversationDetailView
)

router = DefaultRouter()
router.register(r'conversations', ConversationViewSet, basename='conversation')

urlpatterns = [
    # API endpoints. The /api/ prefix is handled in the project's root urls.py.
    path('', include(router.urls)),  # This handles routes like /api/conversations/
    
    # Single conversation retrieval endpoint
    path('conversations/<int:conversation_id>/', ConversationDetailView.as_view(), name='conversation_detail'),
    
    # This is the primary prediction endpoint called by the frontend.
    path('chat/predict/', PredictView.as_view(), name='predict_view'),  # Legacy endpoint
    path('api/chat/predict/', PredictView.as_view(), name='predict_symptoms'),  # New endpoint
    path('api/predict-symptoms/', predict_symptoms, name='predict_symptoms_function'),  # Alternative endpoint

    # UI patterns for rendering HTML pages.
    # These are matched when included from the root urls.py without the /api/ prefix.
    path('chat/', chat_view, name='chat'),
    path('chat.html', chat_view, name='chat_html'),
    path('welcome/', welcome_view, name='welcome'),
    path('welcome.html', welcome_view, name='welcome_html'),
    path('faq/', faq_view, name='faq'),
    path('signin/', signin_view, name='signin'),
    path('signin.html', signin_view, name='signin_html'),
    path('index/', index_view, name='index'),
    path('index.html', index_view, name='index_html'),
    path('topic-test/', topic_test_view, name='topic-test'),

    # Auth endpoints
    path('register/', RegisterView.as_view(), name='api_register'),
    path('login/', LoginView.as_view(), name='api_login'),
    path('logout/', LogoutView.as_view(), name='api_logout'),
]
