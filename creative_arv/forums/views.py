from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import viewsets, permissions, filters
from .serializers import PostSerializer, ForumSerializer
from .models import Forum, Post


class ForumViewSet(viewsets.ModelViewSet):
    serializer_class = ForumSerializer
    lookup_field = 'slug'
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['category__slug', 'is_pinned']
    search_fields = ['title', 'description']
    ordering_fields = ['created_at', 'updated_at']

    def get_queryset(self):
        return Forum.objects.filter(is_banned=False)

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [permissions.AllowAny()]
        return [permissions.IsAuthenticated()]

    def perform_create(self, serializer):
        # Dev ortamında auto-approve — sprint 03 scope
        serializer.save(
            created_by=self.request.user,
            is_published=True,
            is_approved=True,
        )


class PostViewSet(viewsets.ModelViewSet):
    serializer_class = PostSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['forum__slug', 'forum', 'author__username', 'parent', 'forum__category__slug']
    search_fields = ['title', 'body']
    ordering_fields = ['created_at', 'updated_at']

    def get_queryset(self):
        return Post.objects.filter(is_banned=False)

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [permissions.AllowAny()]
        return [permissions.IsAuthenticated()]

    def perform_create(self, serializer):
        # Dev ortamında auto-approve — sprint 03 scope
        serializer.save(
            author=self.request.user,
            is_published=True,
            is_approved=True,
        )
