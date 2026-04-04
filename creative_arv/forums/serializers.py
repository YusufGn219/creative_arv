from rest_framework import serializers
from .models import Forum, ForumTag, Post
from users.serializers import UserSerializer
from core.serializers import CategorySerializer, TagSerializer


class PostReplySerializer(serializers.ModelSerializer):
    author = UserSerializer(read_only=True)

    class Meta:
        model = Post
        fields = [
            'id', 'author', 'title', 'slug', 'body',
            'is_edited', 'edited_at', 'created_at', 'updated_at'
        ]


class PostSerializer(serializers.ModelSerializer):
    author = UserSerializer(read_only=True)
    replies = PostReplySerializer(many=True, read_only=True)
    forum_id = serializers.IntegerField(write_only=True)
    parent_id = serializers.IntegerField(write_only=True, required=False, allow_null=True)

    class Meta:
        model = Post
        fields = [
            'id', 'forum_id', 'parent_id', 'author',
            'title', 'slug', 'body',
            'is_published', 'is_approved', 'is_banned', 'ban_reason',
            'is_edited', 'edited_at',
            'replies',
            'created_at', 'updated_at'
        ]
        read_only_fields = [
            'id', 'slug', 'author',
            'is_approved', 'is_banned', 'ban_reason',
            'is_edited', 'edited_at',
            'created_at', 'updated_at'
        ]


class ForumSerializer(serializers.ModelSerializer):
    created_by = UserSerializer(read_only=True)
    category = CategorySerializer(read_only=True)
    tags = TagSerializer(many=True, read_only=True, source='forum_tags')
    category_id = serializers.IntegerField(write_only=True, required=False, allow_null=True)
    tag_ids = serializers.ListField(
        child=serializers.IntegerField(), write_only=True, required=False
    )
    post_count = serializers.SerializerMethodField()

    class Meta:
        model = Forum
        fields = [
            'id', 'created_by', 'category', 'category_id',
            'title', 'slug', 'description',
            'is_published', 'is_approved', 'is_pinned',
            'is_banned', 'ban_reason',
            'tags', 'tag_ids',
            'post_count',
            'created_at', 'updated_at'
        ]
        read_only_fields = [
            'id', 'slug', 'created_by',
            'is_approved', 'is_pinned', 'is_banned', 'ban_reason',
            'created_at', 'updated_at'
        ]

    def get_post_count(self, obj):
        return obj.posts.filter(is_published=True, is_approved=True, is_banned=False).count()

    def create(self, validated_data):
        tag_ids = validated_data.pop('tag_ids', [])
        category_id = validated_data.pop('category_id', None)
        if category_id:
            validated_data['category_id'] = category_id
        forum = Forum.objects.create(**validated_data)
        for tag_id in tag_ids:
            ForumTag.objects.create(forum=forum, tag_id=tag_id)
        return forum