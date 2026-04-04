from .models import Forum, Post, ForumTag
from django.contrib import admin

@admin.register(Forum)
class ForumAdmin(admin.ModelAdmin):
    list_display = ['title', 'created_by', 'category', 'is_published', 'is_approved', 'is_pinned', 'is_banned', 'created_at']
    list_filter = ['is_published', 'is_approved', 'is_pinned', 'is_banned']
    search_fields = ['title', 'created_by__username']
    prepopulated_fields = {'slug': ('title',)}
    readonly_fields = ['created_at', 'updated_at']


@admin.register(ForumTag)
class ForumTagAdmin(admin.ModelAdmin):
    list_display = ['forum', 'tag']
    search_fields = ['forum__title', 'tag__name']


@admin.register(Post)
class PostAdmin(admin.ModelAdmin):
    list_display = ['title', 'author', 'forum', 'is_published', 'is_approved', 'is_banned', 'is_edited', 'created_at']
    list_filter = ['is_published', 'is_approved', 'is_banned', 'is_edited']
    search_fields = ['title', 'author__username', 'body']
    prepopulated_fields = {'slug': ('title',)}
    readonly_fields = ['is_edited', 'edited_at', 'created_at', 'updated_at']
