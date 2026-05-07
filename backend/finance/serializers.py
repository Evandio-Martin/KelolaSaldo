from datetime import datetime

from rest_framework import serializers

from .models import Account, Budget, Category, Transaction


def validate_month_value(value):
    try:
        datetime.strptime(value, '%Y-%m')
    except ValueError as exc:
        raise serializers.ValidationError('Format bulan harus YYYY-MM.') from exc
    return value


def normalize_required_name(value, field_label):
    normalized = value.strip()
    if not normalized:
        raise serializers.ValidationError(f'{field_label} wajib diisi.')
    return normalized


class CategorySerializer(serializers.ModelSerializer):
    linked_transaction_count = serializers.SerializerMethodField()

    class Meta:
        model = Category
        fields = ['id', 'name', 'linked_transaction_count', 'created_at', 'updated_at']

    def get_linked_transaction_count(self, obj):
        return getattr(obj, 'linked_transaction_count', obj.transactions.count())


class CategoryWriteSerializer(serializers.Serializer):
    name = serializers.CharField(max_length=100)

    def validate_name(self, value):
        name = normalize_required_name(value, 'Nama kategori')
        user = self.context['user']
        queryset = Category.objects.filter(user=user, name=name)
        if self.instance is not None:
            queryset = queryset.exclude(id=self.instance.id)
        if queryset.exists():
            raise serializers.ValidationError('Kategori tersebut sudah ada.')
        return name

    def create(self, validated_data):
        return Category.objects.create(user=self.context['user'], **validated_data)

    def update(self, instance, validated_data):
        instance.name = validated_data['name']
        instance.save()
        return instance


class AccountSerializer(serializers.ModelSerializer):
    linked_transaction_count = serializers.SerializerMethodField()

    class Meta:
        model = Account
        fields = ['id', 'name', 'linked_transaction_count', 'created_at', 'updated_at']

    def get_linked_transaction_count(self, obj):
        return getattr(obj, 'linked_transaction_count', obj.transactions.count())


class AccountWriteSerializer(serializers.Serializer):
    name = serializers.CharField(max_length=100)

    def validate_name(self, value):
        name = normalize_required_name(value, 'Nama akun')
        user = self.context['user']
        queryset = Account.objects.filter(user=user, name=name)
        if self.instance is not None:
            queryset = queryset.exclude(id=self.instance.id)
        if queryset.exists():
            raise serializers.ValidationError('Akun tersebut sudah ada.')
        return name

    def create(self, validated_data):
        return Account.objects.create(user=self.context['user'], **validated_data)

    def update(self, instance, validated_data):
        instance.name = validated_data['name']
        instance.save()
        return instance


class TransactionSerializer(serializers.ModelSerializer):
    category = serializers.CharField(source='category.name')
    account = serializers.CharField(source='account.name')

    class Meta:
        model = Transaction
        fields = [
            'id',
            'description',
            'category',
            'account',
            'date',
            'type',
            'amount',
            'created_at',
            'updated_at',
        ]


class TransactionWriteSerializer(serializers.Serializer):
    description = serializers.CharField(max_length=255)
    category = serializers.CharField(max_length=100)
    account = serializers.CharField(max_length=100)
    date = serializers.DateField()
    type = serializers.ChoiceField(choices=Transaction.TransactionType.choices)
    amount = serializers.IntegerField(min_value=1)

    def validate_description(self, value):
        return normalize_required_name(value, 'Deskripsi')

    def validate_category(self, value):
        return normalize_required_name(value, 'Nama kategori')

    def validate_account(self, value):
        return normalize_required_name(value, 'Nama akun')

    def _resolve_entities(self, validated_data):
        user = self.context['user']
        category_name = validated_data.pop('category')
        account_name = validated_data.pop('account')
        category, _ = Category.objects.get_or_create(user=user, name=category_name)
        account, _ = Account.objects.get_or_create(user=user, name=account_name)
        return category, account

    def create(self, validated_data):
        category, account = self._resolve_entities(validated_data)
        return Transaction.objects.create(
            user=self.context['user'],
            category=category,
            account=account,
            **validated_data,
        )

    def update(self, instance, validated_data):
        category_value = validated_data.pop('category', instance.category.name)
        account_value = validated_data.pop('account', instance.account.name)
        category, _ = Category.objects.get_or_create(
            user=self.context['user'],
            name=category_value,
        )
        account, _ = Account.objects.get_or_create(
            user=self.context['user'],
            name=account_value,
        )
        instance.description = validated_data.get('description', instance.description)
        instance.category = category
        instance.account = account
        instance.date = validated_data.get('date', instance.date)
        instance.type = validated_data.get('type', instance.type)
        instance.amount = validated_data.get('amount', instance.amount)
        instance.save()
        return instance


class BudgetSerializer(serializers.ModelSerializer):
    category = serializers.CharField(source='category.name')

    class Meta:
        model = Budget
        fields = ['id', 'month', 'category', 'limit', 'created_at', 'updated_at']


class BudgetWriteSerializer(serializers.Serializer):
    month = serializers.CharField(max_length=7)
    category = serializers.CharField(max_length=100)
    limit = serializers.IntegerField(min_value=1)

    def validate_month(self, value):
        return validate_month_value(value)

    def validate_category(self, value):
        return normalize_required_name(value, 'Nama kategori')

    def validate(self, attrs):
        user = self.context['user']
        category_name = attrs['category']
        queryset = Budget.objects.filter(
            user=user,
            month=attrs['month'],
            category__name=category_name,
        )
        if self.instance is not None:
            queryset = queryset.exclude(id=self.instance.id)
        if queryset.exists():
            raise serializers.ValidationError(
                'Anggaran untuk bulan dan kategori tersebut sudah ada.',
            )
        return attrs

    def create(self, validated_data):
        category, _ = Category.objects.get_or_create(
            user=self.context['user'],
            name=validated_data.pop('category'),
        )
        return Budget.objects.create(
            user=self.context['user'],
            category=category,
            **validated_data,
        )

    def update(self, instance, validated_data):
        category_name = validated_data.pop('category', instance.category.name)
        category, _ = Category.objects.get_or_create(
            user=self.context['user'],
            name=category_name,
        )
        instance.month = validated_data.get('month', instance.month)
        instance.category = category
        instance.limit = validated_data.get('limit', instance.limit)
        instance.save()
        return instance


class TransactionQuerySerializer(serializers.Serializer):
    month = serializers.CharField(required=False, allow_blank=True, default='')
    type = serializers.ChoiceField(
        choices=['all', *Transaction.TransactionType.values],
        required=False,
        default='all',
    )
    category = serializers.CharField(required=False, allow_blank=True, default='all')
    search = serializers.CharField(required=False, allow_blank=True, default='')

    def validate_month(self, value):
        if not value:
            return ''
        return validate_month_value(value)

    def validate_category(self, value):
        normalized = value.strip()
        return normalized or 'all'

    def validate_search(self, value):
        return value.strip()


class BudgetQuerySerializer(serializers.Serializer):
    month = serializers.CharField(required=False, allow_blank=True, default='')

    def validate_month(self, value):
        if not value:
            return ''
        return validate_month_value(value)


class ReportQuerySerializer(BudgetQuerySerializer):
    pass
