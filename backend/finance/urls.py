from django.urls import path

from . import views


urlpatterns = [
    path('transactions', views.TransactionListView.as_view(), name='finance-transactions'),
    path(
        'transactions/<uuid:transaction_id>',
        views.TransactionDetailView.as_view(),
        name='finance-transaction-detail',
    ),
    path('categories', views.CategoryListView.as_view(), name='finance-categories'),
    path(
        'categories/<uuid:category_id>',
        views.CategoryDetailView.as_view(),
        name='finance-category-detail',
    ),
    path('accounts', views.AccountListView.as_view(), name='finance-accounts'),
    path(
        'accounts/<uuid:account_id>',
        views.AccountDetailView.as_view(),
        name='finance-account-detail',
    ),
    path('budgets', views.BudgetListView.as_view(), name='finance-budgets'),
    path(
        'budgets/<uuid:budget_id>',
        views.BudgetDetailView.as_view(),
        name='finance-budget-detail',
    ),
    path('reports', views.ReportView.as_view(), name='finance-reports'),
]