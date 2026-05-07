import uuid
from django.db import models
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from django.utils import timezone
from .enums import Role


class UserManager(BaseUserManager):
    def create_user(self, username, name, password=None, **extra_fields):
        if not username:
            raise ValueError('Username harus diisi.')
        if not name:
            raise ValueError('Nama harus diisi.')
        user = self.model(username=username, name=name, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, username, name, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        return self.create_user(username, name, password, **extra_fields)



class User(AbstractBaseUser, PermissionsMixin):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=100)
    nickname = models.CharField(max_length=50, blank=True, null=True)
    username = models.CharField(max_length=50, unique=True)
    role = models.CharField(max_length=20, choices=Role.choices, default=Role.USER)
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    USERNAME_FIELD = 'username'
    REQUIRED_FIELDS = ['name']

    objects = UserManager()

    class Meta:
        db_table = 'users'

    def __str__(self):
        return self.username


class BlacklistedToken(models.Model):
    token = models.TextField(unique=True)
    blacklisted_at = models.DateTimeField(default=timezone.now)

    class Meta:
        db_table = 'blacklisted_tokens'
        indexes = [
            models.Index(fields=['token']),
        ]

    def __str__(self):
        return f"Blacklisted token at {self.blacklisted_at}"
