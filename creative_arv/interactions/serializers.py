from rest_framework import serializers
from django.contrib.contenttypes.models import ContentType
from .models import Comment
from users.serializers import UserSerializer

class CommentSerializer(serializers.ModelSerializer):
    author = UserSerializer(read_only=True)
    replies = serializers.SerializerMethodField()
    content_type_model = serializers.CharField(write_only=True)
    object_id = serializers.IntegerField(write_only=True)

    class Meta:
        model = Comment
        fields=[
            'id', 'author', 'parent', 'content_type_model', 'object_id',
            'body', 'is_deleted', 'replies', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'author', 'replies', 'created_at', 'updated_at']

        def get_replies(self, obj):
            if obj.replies.exists():
                return CommentSerializer(obj.replies.filter(is_deleted=False), many=True).data
            return []

        def create(self, validated_data):
            model_name = validated_data.pop('content_type_model')
            content_type = ContentType.objects.get(model=model_name)
            validated_data['content_type'] = content_type
            return Comment.objects.create(**validated_data)