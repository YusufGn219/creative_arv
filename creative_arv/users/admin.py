from django.contrib.auth.admin import UserAdmin
from .models import User, Role, UserRole
from django.contrib import admin

@admin.register(User)
class CustomUserAdmin(UserAdmin):
    list_display = ['username', 'email', 'bio', 'is_staff', 'is_active']
    search_fields = ['username', 'email']
    fieldsets = UserAdmin.fieldsets + (
        ('Ek Bilgiler', {'fields': ('bio', 'avatar_url')}),
    )

@admin.register(Role)
class RoleAdmin(admin.ModelAdmin):
    list_display = ['name', 'description']
    search_fields = ['name']

@admin.register(UserRole)
class UserRoleAdmin(admin.ModelAdmin):
    list_display = ['user', 'role']
    search_fields = ['user__username', 'role__name']