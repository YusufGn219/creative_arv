from django.utils import timezone
from rest_framework import viewsets, permissions
from .models import Article, ArticleRead
from .serializers import ArticleSerializer


class ArticleViewSet(viewsets.ModelViewSet):
    serializer_class = ArticleSerializer
    lookup_field = 'slug'

    def get_queryset(self):
        qs = Article.objects.filter(is_banned=False)
        params = self.request.query_params
        if author := params.get('author'):
            qs = qs.filter(author__username=author)
        if category := params.get('category__slug'):
            qs = qs.filter(category__slug=category)
        if tag := params.get('tags__slug'):
            qs = qs.filter(article_tags__tag__slug=tag)
        return qs.distinct()

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [permissions.AllowAny()]
        return [permissions.IsAuthenticated()]

    def perform_create(self, serializer):
        serializer.save(author=self.request.user, is_approved=True)

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