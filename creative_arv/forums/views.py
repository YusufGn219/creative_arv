from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import viewsets, permissions, filters
from .serializers import PostSerializer, ForumSerializer
from django.shortcuts import render
from .models import Forum, Post


class ForumViewSet(viewsets.ModelViewSet):
    serializer_class = ForumSerializer
    lookup_field = 'slug'
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ['category__slug', 'is_pinned']
    search_fields = ['title', 'description']

    def get_queryset(self):
        return Forum.objects.filter(
            is_published=True,
            is_approved=True,
            is_banned=False
        )

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [permissions.AllowAny()]
        return [permissions.IsAuthenticated()]
    
    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)

class PostViewSet(viewsets.ModelViewSet):
    serializer_class = PostSerializer
    lookup_field = 'slug'
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ['forum__slug', 'parent']
    search_fields = ['title', 'body']

    def get_queryset(self):
        return Post.objects.filter(
            is_published=True,
            is_approved=True,
            is_banned=False
        )
    
    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [permissions.AllowAny()]
        return [permissions.IsAuthenticated()]

    def perform_create(self, serializer):
        serializer.save(author=self.request.user)