from django.contrib import admin
from .models import Comment

@admin.register(Comment)
class CommentAdmin(admin.ModelAdmin):
    list_display = ['author', 'content_type', 'object_id', 'is_deleted', 'created_at']
    list_filter = ['is_deleted', 'content_type']
    search_fields = ['author__username', 'body']