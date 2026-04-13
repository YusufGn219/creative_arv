from django.contrib import admin

from .models import Article, ArticleAuthor, ArticleTag


@admin.register(Article)
class ArticleAdmin(admin.ModelAdmin):
    list_display = ['title', 'author', 'category', 'is_published', 'is_approved', 'is_banned', 'created_at']
    list_filter = ['is_published', 'is_approved', 'is_banned']
    search_fields = ['title', 'author__username']
    prepopulated_fields = {'slug': ('title',)}


@admin.register(ArticleAuthor)
class ArticleAuthorAdmin(admin.ModelAdmin):
    list_display = ['article', 'user', 'role', 'joined_at']


@admin.register(ArticleTag)
class ArticleTagAdmin(admin.ModelAdmin):
    list_display = ['article', 'tag']
