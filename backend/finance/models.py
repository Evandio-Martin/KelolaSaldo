import uuid

from django.conf import settings
from django.core.validators import MinValueValidator, RegexValidator
from django.db import models


DEFAULT_CATEGORY_NAME = 'Lain-lain'
DEFAULT_ACCOUNT_NAME = 'Tunai'


class Category(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='finance_categories',
    )
    name = models.CharField(max_length=100)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'finance_categories'
        ordering = ['name']
        constraints = [
            models.UniqueConstraint(
                fields=['user', 'name'],
                name='finance_category_user_name_uniq',
            )
        ]

    def __str__(self):
        return f'{self.user_id}:{self.name}'


class Account(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='finance_accounts',
    )
    name = models.CharField(max_length=100)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'finance_accounts'
        ordering = ['name']
        constraints = [
            models.UniqueConstraint(
                fields=['user', 'name'],
                name='finance_account_user_name_uniq',
            )
        ]

    def __str__(self):
        return f'{self.user_id}:{self.name}'


class Transaction(models.Model):
    class TransactionType(models.TextChoices):
        INCOME = 'income', 'Income'
        EXPENSE = 'expense', 'Expense'

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='finance_transactions',
    )
    description = models.CharField(max_length=255)
    category = models.ForeignKey(
        Category,
        on_delete=models.PROTECT,
        related_name='transactions',
    )
    account = models.ForeignKey(
        Account,
        on_delete=models.PROTECT,
        related_name='transactions',
    )
    date = models.DateField()
    type = models.CharField(max_length=10, choices=TransactionType.choices)
    amount = models.BigIntegerField(validators=[MinValueValidator(1)])
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'finance_transactions'
        ordering = ['-date', '-created_at']
        indexes = [
            models.Index(fields=['user', 'date']),
            models.Index(fields=['user', 'type']),
        ]

    def __str__(self):
        return f'{self.user_id}:{self.description}'


class Budget(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='finance_budgets',
    )
    month = models.CharField(
        max_length=7,
        validators=[
            RegexValidator(
                regex=r'^\d{4}-\d{2}$',
                message='Format bulan harus YYYY-MM.',
            )
        ],
    )
    category = models.ForeignKey(
        Category,
        on_delete=models.PROTECT,
        related_name='budgets',
    )
    limit = models.BigIntegerField(validators=[MinValueValidator(1)])
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'finance_budgets'
        ordering = ['-month', 'category__name']
        constraints = [
            models.UniqueConstraint(
                fields=['user', 'month', 'category'],
                name='finance_budget_user_month_category_uniq',
            )
        ]

    def __str__(self):
        return f'{self.user_id}:{self.month}:{self.category.name}'


def ensure_finance_defaults(user):
    fallback_category, _ = Category.objects.get_or_create(
        user=user,
        name=DEFAULT_CATEGORY_NAME,
    )
    fallback_account, _ = Account.objects.get_or_create(
        user=user,
        name=DEFAULT_ACCOUNT_NAME,
    )
    return fallback_category, fallback_account
