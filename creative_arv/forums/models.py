from django.db import models
from django.utils.text import slugify
from django.utils import timezone
from users.models import User
from core.models import Category, Tag


class Forum(models.Model):
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='forums')
    category = models.ForeignKey(Category, on_delete=models.SET_NULL, null=True, blank=True, related_name='forums')
    title = models.CharField(max_length=255, unique=True)
    slug = models.SlugField(max_length=280, unique=True, blank=True)
    description = models.TextField(blank=True)
    is_published = models.BooleanField(default=False)
    is_approved = models.BooleanField(default=False)
    is_pinned = models.BooleanField(default=False)
    is_banned = models.BooleanField(default=False)
    ban_reason = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-is_pinned', '-created_at']

    def save(self, *args, **kwargs):
        if not self.slug:
            base_slug = slugify(self.title)
            slug = base_slug
            counter = 1
            while Forum.objects.filter(slug=slug).exclude(pk=self.pk).exists():
                slug = f"{base_slug}-{counter}"
                counter += 1
            self.slug = slug
        super().save(*args, **kwargs)

    def __str__(self):
        return self.title


class ForumTag(models.Model):
    forum = models.ForeignKey(Forum, on_delete=models.CASCADE, related_name='forum_tags')
    tag = models.ForeignKey(Tag, on_delete=models.CASCADE, related_name='forum_tags')

    class Meta:
        unique_together = ('forum', 'tag')

    def __str__(self):
        return f"{self.forum.title} - {self.tag.name}"


class Post(models.Model):
    forum = models.ForeignKey(Forum, on_delete=models.CASCADE, related_name='posts')
    author = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='posts')
    article = models.ForeignKey('articles.Article', on_delete=models.SET_NULL, null=True, blank=True, related_name='posts')
    parent = models.ForeignKey('self', on_delete=models.CASCADE, null=True, blank=True, related_name='replies')
    title = models.CharField(max_length=255, blank=True)
    slug = models.SlugField(max_length=280, unique=True, blank=True)
    body = models.TextField()
    is_published = models.BooleanField(default=False)
    is_approved = models.BooleanField(default=False)
    is_banned = models.BooleanField(default=False)
    ban_reason = models.TextField(blank=True, null=True)
    is_edited = models.BooleanField(default=False)
    edited_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['created_at']

    def save(self, *args, **kwargs):
        if self.pk:
            self.is_edited = True
            self.edited_at = timezone.now()
        if not self.slug:
            base = slugify(self.title) if self.title else 'post'
            slug = base
            counter = 1
            while Post.objects.filter(slug=slug).exclude(pk=self.pk).exists():
                slug = f"{base}-{counter}"
                counter += 1
            self.slug = slug
        super().save(*args, **kwargs)

    def __str__(self):
        return self.title or f"Reply #{self.pk}"