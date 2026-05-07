from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User, BlacklistedToken


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    list_display = ['username', 'name', 'nickname', 'is_staff', 'is_active', 'created_at']
    list_filter = ['is_staff', 'is_active', 'is_superuser']
    search_fields = ['username', 'name', 'nickname']
    ordering = ['-created_at']
    fieldsets = (
        (None, {'fields': ('username', 'password')}),
        ('Informasi Pribadi', {'fields': ('name', 'nickname')}),
        ('Permissions', {'fields': ('is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions')}),
        ('Timestamps', {'fields': ('created_at', 'updated_at', 'last_login')}),
    )
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('username', 'name', 'nickname', 'password1', 'password2'),
        }),
    )
    readonly_fields = ['created_at', 'updated_at', 'last_login']


@admin.register(BlacklistedToken)
class BlacklistedTokenAdmin(admin.ModelAdmin):
    list_display = ['id', 'token_preview', 'blacklisted_at']
    list_filter = ['blacklisted_at']
    search_fields = ['token']
    ordering = ['-blacklisted_at']
    readonly_fields = ['token', 'blacklisted_at']
    
    def token_preview(self, obj):
        return f"{obj.token[:50]}..." if len(obj.token) > 50 else obj.token
    token_preview.short_description = 'Token Preview'
