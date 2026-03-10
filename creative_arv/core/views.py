from .serializers import CategorySerializer, TagSerializer
from rest_framework.permissions import AllowAny
from django.shortcuts import render
from rest_framework import viewsets
from .models import Category, Tag


class CategoryViewSet(viewsets.ModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [AllowAny]
    lookup_field = 'slug'  



class TagViewSet(viewsets.ModelViewSet):
    queryset = Tag.objects.all()
    serializer_class = TagSerializer
    permission_classes = [AllowAny]
    lookup_field = 'slug'  

