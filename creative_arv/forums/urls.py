from rest_framework.routers import DefaultRouter
from .views import ForumViewSet, PostViewSet

router = DefaultRouter()
router.register('forums', ForumViewSet, basename='forum')
router.register('posts', PostViewSet, basename='post')

urlpatterns = router.urls