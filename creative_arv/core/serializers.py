from rest_framework import serializers
from .models import Tag, Category

class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ['id', 'name', 'slug', 'description']

class TagSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tag
        fields = ['id', 'name', 'slug']

''' 
model objelerini JSON formatına dönüştürmek için serializers kullanılır.
Bu serializers, Category ve Tag modelleri için basit bir şekilde tanımlanmıştır.
Her iki serializer da modelin tüm alanlarını içerecek şekilde yapılandırılmıştır.
Bu sayede API üzerinden bu modellerle ilgili verileri kolayca alabilir ve gönderilebilir.
'''