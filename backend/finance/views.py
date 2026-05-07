from collections import defaultdict

from django.db import transaction as db_transaction
from django.db.models import Count, Q
from django.shortcuts import get_object_or_404
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView

from core.response import api_response
from .models import (
    DEFAULT_ACCOUNT_NAME,
    DEFAULT_CATEGORY_NAME,
    Account,
    Budget,
    Category,
    Transaction,
    ensure_finance_defaults,
)
from .serializers import (
    AccountSerializer,
    AccountWriteSerializer,
    BudgetQuerySerializer,
    BudgetSerializer,
    BudgetWriteSerializer,
    CategorySerializer,
    CategoryWriteSerializer,
    ReportQuerySerializer,
    TransactionQuerySerializer,
    TransactionSerializer,
    TransactionWriteSerializer,
)


def get_month_options(user):
    transaction_months = {
        item.strftime('%Y-%m')
        for item in Transaction.objects.filter(user=user).values_list('date', flat=True)
    }
    budget_months = set(Budget.objects.filter(user=user).values_list('month', flat=True))
    return sorted(transaction_months | budget_months, reverse=True)


def merge_category_budgets(user, source_category, target_category):
    for budget in Budget.objects.filter(user=user, category=source_category).order_by('month'):
        existing_budget = Budget.objects.filter(
            user=user,
            category=target_category,
            month=budget.month,
        ).first()
        if existing_budget is None:
            budget.category = target_category
            budget.save(update_fields=['category', 'updated_at'])
            continue

        existing_budget.limit += budget.limit
        existing_budget.save(update_fields=['limit', 'updated_at'])
        budget.delete()


class TransactionListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        ensure_finance_defaults(request.user)

        query_serializer = TransactionQuerySerializer(data=request.query_params)
        if not query_serializer.is_valid():
            return api_response(
                success=False,
                status_code=status.HTTP_400_BAD_REQUEST,
                message='Validasi gagal.',
                data=query_serializer.errors,
            )

        filters = query_serializer.validated_data
        queryset = Transaction.objects.filter(user=request.user).select_related(
            'category',
            'account',
        )

        if filters['month']:
            year, month = filters['month'].split('-')
            queryset = queryset.filter(date__year=int(year), date__month=int(month))

        if filters['type'] != 'all':
            queryset = queryset.filter(type=filters['type'])

        if filters['category'] != 'all':
            queryset = queryset.filter(category__name=filters['category'])

        if filters['search']:
            queryset = queryset.filter(
                Q(description__icontains=filters['search'])
                | Q(category__name__icontains=filters['search'])
                | Q(account__name__icontains=filters['search'])
            )

        transactions = queryset.order_by('-date', '-created_at')
        return api_response(
            success=True,
            status_code=status.HTTP_200_OK,
            message='Data transaksi berhasil diambil.',
            data=TransactionSerializer(transactions, many=True).data,
        )

    def post(self, request):
        ensure_finance_defaults(request.user)

        serializer = TransactionWriteSerializer(
            data=request.data,
            context={'user': request.user},
        )
        if not serializer.is_valid():
            return api_response(
                success=False,
                status_code=status.HTTP_400_BAD_REQUEST,
                message='Validasi gagal.',
                data=serializer.errors,
            )

        transaction = serializer.save()
        return api_response(
            success=True,
            status_code=status.HTTP_201_CREATED,
            message='Transaksi berhasil ditambahkan.',
            data=TransactionSerializer(transaction).data,
        )


class TransactionDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def patch(self, request, transaction_id):
        ensure_finance_defaults(request.user)
        transaction = get_object_or_404(
            Transaction.objects.select_related('category', 'account'),
            user=request.user,
            id=transaction_id,
        )
        serializer = TransactionWriteSerializer(
            instance=transaction,
            data=request.data,
            partial=True,
            context={'user': request.user},
        )
        if not serializer.is_valid():
            return api_response(
                success=False,
                status_code=status.HTTP_400_BAD_REQUEST,
                message='Validasi gagal.',
                data=serializer.errors,
            )

        updated_transaction = serializer.save()
        return api_response(
            success=True,
            status_code=status.HTTP_200_OK,
            message='Transaksi berhasil diperbarui.',
            data=TransactionSerializer(updated_transaction).data,
        )

    def delete(self, request, transaction_id):
        transaction = get_object_or_404(Transaction, user=request.user, id=transaction_id)
        transaction.delete()
        return api_response(
            success=True,
            status_code=status.HTTP_200_OK,
            message='Transaksi berhasil dihapus.',
        )


class CategoryListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        ensure_finance_defaults(request.user)
        categories = Category.objects.filter(user=request.user).annotate(
            linked_transaction_count=Count('transactions'),
        )
        return api_response(
            success=True,
            status_code=status.HTTP_200_OK,
            message='Data kategori berhasil diambil.',
            data=CategorySerializer(categories, many=True).data,
        )

    def post(self, request):
        ensure_finance_defaults(request.user)
        serializer = CategoryWriteSerializer(
            data=request.data,
            context={'user': request.user},
        )
        if not serializer.is_valid():
            return api_response(
                success=False,
                status_code=status.HTTP_400_BAD_REQUEST,
                message='Validasi gagal.',
                data=serializer.errors,
            )

        category = serializer.save()
        return api_response(
            success=True,
            status_code=status.HTTP_201_CREATED,
            message='Kategori berhasil ditambahkan.',
            data=CategorySerializer(category).data,
        )


class CategoryDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def patch(self, request, category_id):
        ensure_finance_defaults(request.user)
        category = get_object_or_404(Category, user=request.user, id=category_id)
        serializer = CategoryWriteSerializer(
            instance=category,
            data=request.data,
            context={'user': request.user},
        )
        if not serializer.is_valid():
            return api_response(
                success=False,
                status_code=status.HTTP_400_BAD_REQUEST,
                message='Validasi gagal.',
                data=serializer.errors,
            )

        updated_category = serializer.save()
        return api_response(
            success=True,
            status_code=status.HTTP_200_OK,
            message='Kategori berhasil diperbarui.',
            data=CategorySerializer(updated_category).data,
        )

    def delete(self, request, category_id):
        fallback_category, _ = ensure_finance_defaults(request.user)
        category = get_object_or_404(Category, user=request.user, id=category_id)

        if category.name == DEFAULT_CATEGORY_NAME:
            return api_response(
                success=False,
                status_code=status.HTTP_400_BAD_REQUEST,
                message='Kategori default tidak bisa dihapus.',
            )

        with db_transaction.atomic():
            Transaction.objects.filter(user=request.user, category=category).update(
                category=fallback_category,
            )
            merge_category_budgets(request.user, category, fallback_category)
            category.delete()

        return api_response(
            success=True,
            status_code=status.HTTP_200_OK,
            message='Kategori berhasil dihapus.',
        )


class AccountListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        ensure_finance_defaults(request.user)
        accounts = Account.objects.filter(user=request.user).annotate(
            linked_transaction_count=Count('transactions'),
        )
        return api_response(
            success=True,
            status_code=status.HTTP_200_OK,
            message='Data akun berhasil diambil.',
            data=AccountSerializer(accounts, many=True).data,
        )

    def post(self, request):
        ensure_finance_defaults(request.user)
        serializer = AccountWriteSerializer(
            data=request.data,
            context={'user': request.user},
        )
        if not serializer.is_valid():
            return api_response(
                success=False,
                status_code=status.HTTP_400_BAD_REQUEST,
                message='Validasi gagal.',
                data=serializer.errors,
            )

        account = serializer.save()
        return api_response(
            success=True,
            status_code=status.HTTP_201_CREATED,
            message='Akun berhasil ditambahkan.',
            data=AccountSerializer(account).data,
        )


class AccountDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def patch(self, request, account_id):
        ensure_finance_defaults(request.user)
        account = get_object_or_404(Account, user=request.user, id=account_id)
        serializer = AccountWriteSerializer(
            instance=account,
            data=request.data,
            context={'user': request.user},
        )
        if not serializer.is_valid():
            return api_response(
                success=False,
                status_code=status.HTTP_400_BAD_REQUEST,
                message='Validasi gagal.',
                data=serializer.errors,
            )

        updated_account = serializer.save()
        return api_response(
            success=True,
            status_code=status.HTTP_200_OK,
            message='Akun berhasil diperbarui.',
            data=AccountSerializer(updated_account).data,
        )

    def delete(self, request, account_id):
        _, fallback_account = ensure_finance_defaults(request.user)
        account = get_object_or_404(Account, user=request.user, id=account_id)

        if account.name == DEFAULT_ACCOUNT_NAME:
            return api_response(
                success=False,
                status_code=status.HTTP_400_BAD_REQUEST,
                message='Akun default tidak bisa dihapus.',
            )

        Transaction.objects.filter(user=request.user, account=account).update(
            account=fallback_account,
        )
        account.delete()

        return api_response(
            success=True,
            status_code=status.HTTP_200_OK,
            message='Akun berhasil dihapus.',
        )


class BudgetListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        ensure_finance_defaults(request.user)

        query_serializer = BudgetQuerySerializer(data=request.query_params)
        if not query_serializer.is_valid():
            return api_response(
                success=False,
                status_code=status.HTTP_400_BAD_REQUEST,
                message='Validasi gagal.',
                data=query_serializer.errors,
            )

        queryset = Budget.objects.filter(user=request.user).select_related('category')
        month = query_serializer.validated_data['month']
        if month:
            queryset = queryset.filter(month=month)

        budgets = queryset.order_by('-month', 'category__name')
        return api_response(
            success=True,
            status_code=status.HTTP_200_OK,
            message='Data anggaran berhasil diambil.',
            data=BudgetSerializer(budgets, many=True).data,
        )

    def post(self, request):
        ensure_finance_defaults(request.user)
        serializer = BudgetWriteSerializer(
            data=request.data,
            context={'user': request.user},
        )
        if not serializer.is_valid():
            return api_response(
                success=False,
                status_code=status.HTTP_400_BAD_REQUEST,
                message='Validasi gagal.',
                data=serializer.errors,
            )

        budget = serializer.save()
        return api_response(
            success=True,
            status_code=status.HTTP_201_CREATED,
            message='Anggaran berhasil ditambahkan.',
            data=BudgetSerializer(budget).data,
        )


class BudgetDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def patch(self, request, budget_id):
        ensure_finance_defaults(request.user)
        budget = get_object_or_404(Budget.objects.select_related('category'), user=request.user, id=budget_id)
        serializer = BudgetWriteSerializer(
            instance=budget,
            data=request.data,
            context={'user': request.user},
        )
        if not serializer.is_valid():
            return api_response(
                success=False,
                status_code=status.HTTP_400_BAD_REQUEST,
                message='Validasi gagal.',
                data=serializer.errors,
            )

        updated_budget = serializer.save()
        return api_response(
            success=True,
            status_code=status.HTTP_200_OK,
            message='Anggaran berhasil diperbarui.',
            data=BudgetSerializer(updated_budget).data,
        )

    def delete(self, request, budget_id):
        budget = get_object_or_404(Budget, user=request.user, id=budget_id)
        budget.delete()
        return api_response(
            success=True,
            status_code=status.HTTP_200_OK,
            message='Anggaran berhasil dihapus.',
        )


class ReportView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        ensure_finance_defaults(request.user)

        query_serializer = ReportQuerySerializer(data=request.query_params)
        if not query_serializer.is_valid():
            return api_response(
                success=False,
                status_code=status.HTTP_400_BAD_REQUEST,
                message='Validasi gagal.',
                data=query_serializer.errors,
            )

        transactions = list(
            Transaction.objects.filter(user=request.user)
            .select_related('category', 'account')
            .order_by('-date', '-created_at')
        )
        budgets = list(
            Budget.objects.filter(user=request.user)
            .select_related('category')
            .order_by('-month', 'category__name')
        )

        month_options = sorted(
            {
                *(transaction.date.strftime('%Y-%m') for transaction in transactions),
                *(budget.month for budget in budgets),
            },
            reverse=True,
        )
        active_month = query_serializer.validated_data['month'] or (month_options[0] if month_options else '')

        selected_transactions = [
            transaction
            for transaction in transactions
            if transaction.date.strftime('%Y-%m') == active_month
        ]
        selected_budgets = [budget for budget in budgets if budget.month == active_month]

        income = sum(
            transaction.amount
            for transaction in selected_transactions
            if transaction.type == Transaction.TransactionType.INCOME
        )
        expenses = sum(
            transaction.amount
            for transaction in selected_transactions
            if transaction.type == Transaction.TransactionType.EXPENSE
        )
        net = income - expenses
        budget_total = sum(budget.limit for budget in selected_budgets)
        budget_usage = round((expenses / budget_total) * 100, 2) if budget_total else 0

        report_months = list(reversed(month_options[:6]))
        trend_data = []
        for month in report_months:
            month_transactions = [
                transaction
                for transaction in transactions
                if transaction.date.strftime('%Y-%m') == month
            ]
            trend_data.append(
                {
                    'month': month,
                    'income': sum(
                        item.amount
                        for item in month_transactions
                        if item.type == Transaction.TransactionType.INCOME
                    ),
                    'expenses': sum(
                        item.amount
                        for item in month_transactions
                        if item.type == Transaction.TransactionType.EXPENSE
                    ),
                    'budget': sum(item.limit for item in budgets if item.month == month),
                }
            )

        category_totals = defaultdict(int)
        for transaction in selected_transactions:
            if transaction.type == Transaction.TransactionType.EXPENSE:
                category_totals[transaction.category.name] += transaction.amount

        category_spend = sorted(
            [
                {
                    'category': category,
                    'total': total,
                    'share': round((total / expenses) * 100, 2) if expenses else 0,
                }
                for category, total in category_totals.items()
            ],
            key=lambda item: item['total'],
            reverse=True,
        )

        account_totals = defaultdict(lambda: {'income': 0, 'expenses': 0})
        for transaction in selected_transactions:
            account_data = account_totals[transaction.account.name]
            if transaction.type == Transaction.TransactionType.INCOME:
                account_data['income'] += transaction.amount
            else:
                account_data['expenses'] += transaction.amount

        account_performance = sorted(
            [
                {
                    'account': account,
                    'income': values['income'],
                    'expenses': values['expenses'],
                    'net': values['income'] - values['expenses'],
                }
                for account, values in account_totals.items()
            ],
            key=lambda item: item['net'],
            reverse=True,
        )

        spend_lookup = {item['category']: item['total'] for item in category_spend}
        budget_performance = [
            {
                'id': str(budget.id),
                'month': budget.month,
                'category': budget.category.name,
                'limit': budget.limit,
                'spent': spend_lookup.get(budget.category.name, 0),
                'remaining': budget.limit - spend_lookup.get(budget.category.name, 0),
                'progress': round(
                    (spend_lookup.get(budget.category.name, 0) / budget.limit) * 100,
                    2,
                )
                if budget.limit
                else 0,
            }
            for budget in selected_budgets
        ]

        return api_response(
            success=True,
            status_code=status.HTTP_200_OK,
            message='Laporan keuangan berhasil diambil.',
            data={
                'month': active_month,
                'month_options': month_options,
                'summary': {
                    'income': income,
                    'expenses': expenses,
                    'net': net,
                    'budget_total': budget_total,
                    'budget_usage': budget_usage,
                },
                'trend_data': trend_data,
                'category_spend': category_spend,
                'account_performance': account_performance,
                'budget_performance': budget_performance,
            },
        )
