from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from .views import RegisterView, MeView, UserDetailView
from django.urls import path

urlpatterns = [
    #Auth
    #Kullanıcı kaydı, girişi ve token yenileme işlemleri için kullanılan endpointler
    path('auth/register/', RegisterView.as_view(), name='register'),
    path('auth/login/', TokenObtainPairView.as_view(), name='login'),
    path('auth/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),

    #User
    #Kullanıcı bilgilerini görüntüleme ve güncelleme işlemleri için kullanılan endpointler
    path('users/me/', MeView.as_view(), name='me'),
    path('users/<str:username>/', UserDetailView.as_view(), name='user_detail'),


]