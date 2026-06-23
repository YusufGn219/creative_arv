from django.shortcuts import render
from rest_framework import generics, permissions
from django.contrib.contenttypes.models import ContentType
from .models import Comment
from .serializers import CommentSerializer

class CommentListCreateView(generics.ListCreateAPIView):
    serializer_class = CommentSerializer

    def get_permissions(self):
        if self.request.method == 'GET':
            return [permissions.AllowAny()]
        return [permissions.IsAuthenticated()]
    
    def get_queryset(self):
        queryset = Comment.objects.filter(is_deleted=False, parent=None)
        content_type_param = self.request.query_params.get('content_type')
        object_id = self.request.query_params.get('object_id')
        if content_type_param and object_id:
            app_label, model = content_type_param.split('.')
            ct = ContentType.objects.get(app_label=app_label, model=model)
            queryset = queryset.filter(content_type=ct, object_id=object_id)
        return queryset
    
    def perform_create(self, serializer):
        serializer.save(author=self.request.user)

class CommentDeleteView(generics.DestroyAPIView):
    serializer_class = CommentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Comment.objects.filter(author=self.request.user)

    def perform_destroy(self, instance):
        instance.is_deleted = True
        instance.body = "Bu yorum silinmiştir."
        instance.save()

class CommentUpdateView(generics.UpdateAPIView):
    serializer_class = CommentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Comment.objects.filter(author=self.request.user)
    
