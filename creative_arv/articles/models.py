from django.db import models
from django.utils.text import slugify
from users.models import User
from core.models import Category, Tag


class Article(models.Model):
    author = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='articles')
    category = models.ForeignKey(Category, on_delete=models.SET_NULL, null=True, blank=True, related_name='articles')
    title = models.CharField(max_length=255)
    slug = models.SlugField(max_length=280, unique=True, blank=True)
    description = models.TextField(blank=True)
    content = models.JSONField(default=dict)  # TipTap çıktısı
    is_published = models.BooleanField(default=False)
    is_approved = models.BooleanField(default=False)
    is_banned = models.BooleanField(default=False)
    ban_reason = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.title)
        super().save(*args, **kwargs)

    def __str__(self):
        return self.title


class ArticleAuthor(models.Model):
    ROLE_CHOICES = [
        ('writer', 'Writer'),
        ('editor', 'Editor'),
        ('contributor', 'Contributor'),
    ]
    article = models.ForeignKey(Article, on_delete=models.CASCADE, related_name='article_authors')
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='authored_articles')
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='writer')
    joined_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('article', 'user')

    def __str__(self):
        return f"{self.user.username} - {self.article.title} ({self.role})"


class ArticleTag(models.Model):
    article = models.ForeignKey(Article, on_delete=models.CASCADE, related_name='article_tags')
    tag = models.ForeignKey(Tag, on_delete=models.CASCADE, related_name='article_tags')

    class Meta:
        unique_together = ('article', 'tag')

    def __str__(self):
        return f"{self.article.title} - {self.tag.name}"