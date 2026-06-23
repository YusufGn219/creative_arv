from django.utils import timezone
from rest_framework import viewsets, permissions
from .models import Article, ArticleRead
from .serializers import ArticleSerializer


class ArticleViewSet(viewsets.ModelViewSet):
    serializer_class = ArticleSerializer
    lookup_field = 'slug'

    def get_queryset(self):
        return Article.objects.filter(
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

    def retrieve(self, request, *args, **kwargs):
        response = super().retrieve(request, *args, **kwargs)
        article = self.get_object()
        today = timezone.now().date()
        user = request.user if request.user.is_authenticated else None
        ip = request.META.get('REMOTE_ADDR')

        if user:
            already_read = ArticleRead.objects.filter(
                article=article, user=user, read_at__date=today
            ).exists()
        else:
            already_read = ArticleRead.objects.filter(
                article=article, user=None, ip_address=ip, read_at__date=today
            ).exists()

        if not already_read:
            ArticleRead.objects.create(article=article, user=user, ip_address=ip)

        return response