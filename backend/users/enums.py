from django.db import models

class Role(models.TextChoices):
    USER = 'USER', 'User'
    ADMIN = 'ADMIN', 'Admin'
    SUPERADMIN = 'SUPERADMIN', 'Superadmin'
