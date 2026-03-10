from .serializers import UserSerializer, RegisterSerializer
from rest_framework import generics, permissions
from rest_framework.response import Response
from django.shortcuts import render
from .models import User

class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny]
    #Yeni kullanıcı kaydı için kullanılan view
    #Giriş yapmamış kullanıcıların erişimine izin verir

class MeView(generics.RetrieveUpdateAPIView):
    queryset = User.objects.all()
    serializer_class = RegisterSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user
    #Kullanıcı bilgilerini görüntüleme ve güncelleme için kullanılan view
    #Sadece giriş yapmış kullanıcıların erişimine izin verir

class UserDetailView(generics.RetrieveAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [permissions.AllowAny]
    lookup_field = 'username'
    #Belirli bir kullanıcının detaylarını görüntülemek için kullanılan view
    #Giriş yapmamış kullanıcıların erişimine izin verir

