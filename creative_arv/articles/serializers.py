from rest_framework import serializers
from .models import Article, ArticleAuthor, ArticleTag
from users.serializers import UserSerializer
from core.serializers import CategorySerializer, TagSerializer


class ArticleSerializer(serializers.ModelSerializer):
    author = UserSerializer(read_only=True)
    category = CategorySerializer(read_only=True)
    tags = TagSerializer(many=True, read_only=True, source='article_tags')
    category_id = serializers.IntegerField(write_only=True, required=False, allow_null=True)
    tag_ids = serializers.ListField(
        child=serializers.IntegerField(), write_only=True, required=False
    )

    class Meta:
        model = Article
        fields = [
            'id', 'author', 'category', 'category_id',
            'title', 'slug', 'description', 'content',
            'is_published', 'is_approved', 'is_banned',
            'tags', 'tag_ids', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'slug', 'author', 'is_approved', 'is_banned', 'created_at', 'updated_at']

    def create(self, validated_data):
        tag_ids = validated_data.pop('tag_ids', [])
        category_id = validated_data.pop('category_id', None)
        if category_id:
            validated_data['category_id'] = category_id
        article = Article.objects.create(**validated_data)
        for tag_id in tag_ids:
            ArticleTag.objects.create(article=article, tag_id=tag_id)
        return article