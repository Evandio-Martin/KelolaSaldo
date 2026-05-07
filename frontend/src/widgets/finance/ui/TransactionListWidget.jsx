import { useState } from "react";
import { Search, RotateCcw, Funnel, Pencil, Trash2 } from "lucide-react";
import { useFinanceStore } from "@/entities/finance";
import { TransactionForm } from "@/features/finance";
import { useLanguage } from "@/shared/hooks";
import { formatCurrencyId, formatDateId, formatMonthYearId } from "@/shared/lib";
import { Seo } from "@/shared/ui/Seo";

const createDraftTransaction = (monthHint) => {
  const fallbackDate = new Date().toISOString().slice(0, 10);

  return {
    description: "",
    category: "",
    account: "",
    date: monthHint ? `${monthHint}-15` : fallbackDate,
    type: "expense",
    amount: "",
  };
};

export const TransactionListWidget = () => {
  const {
    transactions,
    categories,
    accounts,
    filters,
    setFilter,
    resetFilters,
    addTransaction,
    updateTransaction,
    deleteTransaction,
  } = useFinanceStore();
  const { language } = useLanguage();
  const isEnglish = language === "en";
  const [editingTransactionId, setEditingTransactionId] = useState(null);
  const [createDefaults, setCreateDefaults] = useState(() =>
    createDraftTransaction(filters.month),
  );

  const monthOptions = [...new Set(transactions.map((item) => item.date.slice(0, 7)))].sort(
    (left, right) => right.localeCompare(left),
  );
  const categoryOptions = categories.map((item) => item.name);
  const accountOptions = accounts.map((item) => item.name);
  const editingTransaction =
    transactions.find((item) => item.id === editingTransactionId) ?? null;

  const normalizedSearch = filters.search.trim().toLowerCase();
  const visibleTransactions = [...transactions]
    .filter((item) => !filters.month || item.date.startsWith(filters.month))
    .filter((item) => filters.type === "all" || item.type === filters.type)
    .filter(
      (item) =>
        filters.category === "all" || item.category === filters.category,
    )
    .filter((item) => {
      if (!normalizedSearch) {
        return true;
      }

      const haystack = [
        item.description,
        item.category,
        item.account,
        item.date,
      ]
        .join(" ")
        .toLowerCase();

      return haystack.includes(normalizedSearch);
    })
    .sort((left, right) => right.date.localeCompare(left.date));

  const visibleIncome = visibleTransactions
    .filter((item) => item.type === "income")
    .reduce((sum, item) => sum + item.amount, 0);
  const visibleExpenses = visibleTransactions
    .filter((item) => item.type === "expense")
    .reduce((sum, item) => sum + item.amount, 0);
  const visibleNet = visibleIncome - visibleExpenses;

  const copy = isEnglish
    ? {
        seoTitle: "Transactions",
        seoDescription:
          "Create, edit, and organize income and expense transactions in KelolaSaldo.",
        pageTitle: "Transactions",
        pageDescription:
          "Keep every income entry, expense, and balance movement organized with fast filters and a live ledger.",
        filterTitle: "Filters",
        filterDescription:
          "Focus on a month, category, transaction type, or specific keyword.",
        month: "Month",
        monthFallback: "All periods",
        noMonths: "No months yet",
        type: "Type",
        allTransactions: "All transactions",
        income: "Income",
        expense: "Expense",
        category: "Category",
        allCategories: "All categories",
        search: "Search",
        searchPlaceholder: "Description or account",
        resetFilters: "Reset filters",
        finishEditing: "Finish editing",
        visibleIncome: "Visible income",
        visibleExpenses: "Visible expenses",
        visibleNet: "Visible net",
        ledgerTitle: "Ledger",
        ledgerCount: `${visibleTransactions.length} matching transaction${visibleTransactions.length === 1 ? "" : "s"}`,
        description: "Description",
        account: "Account",
        date: "Date",
        amount: "Amount",
        actions: "Actions",
        edit: "Edit",
        delete: "Delete",
        emptyTransactions: "No transactions yet. Add your first transaction to get started.",
        emptyFilters: "No transactions match the current filters.",
        deleteConfirm: (description) => `Delete ${description}? This action cannot be undone.`,
      }
    : {
        seoTitle: "Transaksi",
        seoDescription:
          "Buat, ubah, dan rapikan transaksi pemasukan serta pengeluaran di KelolaSaldo.",
        pageTitle: "Transaksi",
        pageDescription:
          "Rapikan setiap pemasukan, pengeluaran, dan perpindahan saldo dengan filter cepat serta daftar transaksi yang selalu diperbarui.",
        filterTitle: "Filter",
        filterDescription:
          "Fokus pada bulan, kategori, jenis transaksi, atau kata kunci tertentu.",
        month: "Bulan",
        monthFallback: "Semua periode",
        noMonths: "Belum ada bulan",
        type: "Jenis",
        allTransactions: "Semua transaksi",
        income: "Pemasukan",
        expense: "Pengeluaran",
        category: "Kategori",
        allCategories: "Semua kategori",
        search: "Cari",
        searchPlaceholder: "Deskripsi atau akun",
        resetFilters: "Reset filter",
        finishEditing: "Selesai mengedit",
        visibleIncome: "Pemasukan terfilter",
        visibleExpenses: "Pengeluaran terfilter",
        visibleNet: "Saldo terfilter",
        ledgerTitle: "Daftar transaksi",
        ledgerCount: `${visibleTransactions.length} transaksi sesuai filter`,
        description: "Deskripsi",
        account: "Akun",
        date: "Tanggal",
        amount: "Nominal",
        actions: "Aksi",
        edit: "Ubah",
        delete: "Hapus",
        emptyTransactions: "Belum ada transaksi. Tambahkan transaksi pertama untuk memulai.",
        emptyFilters: "Tidak ada transaksi yang cocok dengan filter saat ini.",
        deleteConfirm: (description) => `Hapus ${description}? Tindakan ini tidak bisa dibatalkan.`,
      };

  const handleCreateTransaction = async (transaction) => {
    try {
      await addTransaction(transaction);
      setEditingTransactionId(null);
      setCreateDefaults(createDraftTransaction(transaction.date.slice(0, 7)));
    } catch {
      // Store-level toasts already communicate the failure.
    }
  };

  const handleUpdateTransaction = async (transaction) => {
    if (!editingTransactionId) {
      return;
    }

    try {
      await updateTransaction(editingTransactionId, transaction);
      setEditingTransactionId(null);
    } catch {
      // Store-level toasts already communicate the failure.
    }
  };

  const handleEditTransaction = (transaction) => {
    setEditingTransactionId(transaction.id);
  };

  const handleCancelEdit = () => {
    setEditingTransactionId(null);
  };

  const handleDeleteTransaction = async (transaction) => {
    const isConfirmed = window.confirm(
      copy.deleteConfirm(transaction.description),
    );

    if (!isConfirmed) {
      return;
    }

    try {
      await deleteTransaction(transaction.id);

      if (editingTransactionId === transaction.id) {
        setEditingTransactionId(null);
      }
    } catch {
      // Store-level toasts already communicate the failure.
    }
  };

  return (
    <div className="space-y-6">
      <Seo
        title={copy.seoTitle}
        description={copy.seoDescription}
        canonical="/transactions"
        noIndex
      />

      <section className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm dark:border-neutral-800 dark:bg-neutral-950">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{copy.pageTitle}</h1>
            <p className="mt-2 max-w-2xl text-sm text-neutral-600 dark:text-neutral-400">
              {copy.pageDescription}
            </p>
          </div>
        </div>

        <div className="mt-6 grid gap-4 xl:grid-cols-[0.92fr_1.08fr]">
          <TransactionForm
            initialValues={
              editingTransaction
                ? {
                    ...editingTransaction,
                    amount: String(editingTransaction.amount),
                  }
                : createDefaults
            }
            mode={editingTransaction ? "edit" : "create"}
            onSubmit={editingTransaction ? handleUpdateTransaction : handleCreateTransaction}
            onCancel={handleCancelEdit}
            categoryOptions={categoryOptions}
            accountOptions={accountOptions}
          />

          <section className="rounded-3xl border border-neutral-200 bg-neutral-50 p-6 dark:border-neutral-800 dark:bg-neutral-900/40">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="text-2xl font-semibold tracking-tight">{copy.filterTitle}</h2>
                <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
                  {copy.filterDescription}
                </p>
              </div>
              <Funnel size={18} className="text-neutral-400" />
            </div>

            <div className="mt-6 grid gap-3 md:grid-cols-2">
              <label className="flex flex-col gap-2 text-sm font-medium text-neutral-600 dark:text-neutral-300">
                {copy.month}
                <select
                  value={filters.month}
                  onChange={(event) => setFilter("month", event.target.value)}
                  className="rounded-xl border border-neutral-300 bg-white px-4 py-2.5 text-sm text-neutral-900 outline-none transition focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-100"
                >
                  {monthOptions.length === 0 ? (
                    <option value="">{copy.noMonths}</option>
                  ) : (
                    monthOptions.map((month) => (
                      <option key={month} value={month}>
                        {formatMonthYearId(month, copy.monthFallback, language)}
                      </option>
                    ))
                  )}
                </select>
              </label>

              <label className="flex flex-col gap-2 text-sm font-medium text-neutral-600 dark:text-neutral-300">
                {copy.type}
                <select
                  value={filters.type}
                  onChange={(event) => setFilter("type", event.target.value)}
                  className="rounded-xl border border-neutral-300 bg-white px-4 py-2.5 text-sm text-neutral-900 outline-none transition focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-100"
                >
                  <option value="all">{copy.allTransactions}</option>
                  <option value="income">{copy.income}</option>
                  <option value="expense">{copy.expense}</option>
                </select>
              </label>

              <label className="flex flex-col gap-2 text-sm font-medium text-neutral-600 dark:text-neutral-300">
                {copy.category}
                <select
                  value={filters.category}
                  onChange={(event) => setFilter("category", event.target.value)}
                  className="rounded-xl border border-neutral-300 bg-white px-4 py-2.5 text-sm text-neutral-900 outline-none transition focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-100"
                >
                  <option value="all">{copy.allCategories}</option>
                  {categoryOptions.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </label>

              <label className="flex flex-col gap-2 text-sm font-medium text-neutral-600 dark:text-neutral-300">
                {copy.search}
                <div className="flex items-center gap-2 rounded-xl border border-neutral-300 bg-white px-4 py-2.5 focus-within:border-violet-500 focus-within:ring-2 focus-within:ring-violet-500/20 dark:border-neutral-700 dark:bg-neutral-950">
                  <Search size={16} className="text-neutral-400" />
                  <input
                    value={filters.search}
                    onChange={(event) => setFilter("search", event.target.value)}
                    placeholder={copy.searchPlaceholder}
                    className="w-full bg-transparent text-sm text-neutral-900 outline-none placeholder:text-neutral-400 dark:text-neutral-100"
                  />
                </div>
              </label>
            </div>

            <div className="mt-5 flex flex-wrap gap-3">
              <button
                onClick={resetFilters}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-neutral-300 px-4 py-2.5 text-sm font-medium transition hover:bg-white dark:border-neutral-700 dark:hover:bg-neutral-950"
              >
                <RotateCcw size={16} />
                {copy.resetFilters}
              </button>

              {editingTransaction && (
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-neutral-300 px-4 py-2.5 text-sm font-medium transition hover:bg-white dark:border-neutral-700 dark:hover:bg-neutral-950"
                >
                  {copy.finishEditing}
                </button>
              )}
            </div>
          </section>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <article className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm dark:border-neutral-800 dark:bg-neutral-950">
          <p className="text-sm text-neutral-500 dark:text-neutral-400">{copy.visibleIncome}</p>
          <p className="mt-3 text-3xl font-semibold text-violet-600 dark:text-violet-300">
            {formatCurrencyId(visibleIncome, language)}
          </p>
        </article>

        <article className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm dark:border-neutral-800 dark:bg-neutral-950">
          <p className="text-sm text-neutral-500 dark:text-neutral-400">{copy.visibleExpenses}</p>
          <p className="mt-3 text-3xl font-semibold text-rose-600 dark:text-rose-400">
            {formatCurrencyId(visibleExpenses, language)}
          </p>
        </article>

        <article className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm dark:border-neutral-800 dark:bg-neutral-950">
          <p className="text-sm text-neutral-500 dark:text-neutral-400">{copy.visibleNet}</p>
          <p className="mt-3 text-3xl font-semibold text-fuchsia-600 dark:text-fuchsia-300">
            {formatCurrencyId(visibleNet, language)}
          </p>
        </article>
      </section>

      <section className="rounded-2xl border border-neutral-200 bg-white shadow-sm dark:border-neutral-800 dark:bg-neutral-950">
        <div className="flex items-center justify-between border-b border-neutral-200 px-5 py-4 dark:border-neutral-800">
          <div>
            <h2 className="text-xl font-semibold">{copy.ledgerTitle}</h2>
            <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
              {copy.ledgerCount}
            </p>
          </div>
          <Funnel size={18} className="text-neutral-400" />
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-neutral-50 text-neutral-500 dark:bg-neutral-900 dark:text-neutral-400">
              <tr>
                <th className="px-5 py-3 font-medium">{copy.description}</th>
                <th className="px-5 py-3 font-medium">{copy.category}</th>
                <th className="px-5 py-3 font-medium">{copy.account}</th>
                <th className="px-5 py-3 font-medium">{copy.date}</th>
                <th className="px-5 py-3 font-medium">{copy.type}</th>
                <th className="px-5 py-3 font-medium text-right">{copy.amount}</th>
                <th className="px-5 py-3 font-medium text-right">{copy.actions}</th>
              </tr>
            </thead>
            <tbody>
              {visibleTransactions.map((transaction) => {
                const isIncome = transaction.type === "income";

                return (
                  <tr
                    key={transaction.id}
                    className="border-t border-neutral-200 dark:border-neutral-800"
                  >
                    <td className="px-5 py-4 font-medium">{transaction.description}</td>
                    <td className="px-5 py-4 text-neutral-600 dark:text-neutral-300">
                      {transaction.category}
                    </td>
                    <td className="px-5 py-4 text-neutral-600 dark:text-neutral-300">
                      {transaction.account}
                    </td>
                    <td className="px-5 py-4 text-neutral-600 dark:text-neutral-300">
                      {formatDateId(transaction.date, language)}
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
                          isIncome
                            ? "bg-violet-50 text-violet-700 dark:bg-violet-500/15 dark:text-violet-200"
                            : "bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300"
                        }`}
                      >
                        {isIncome ? copy.income : copy.expense}
                      </span>
                    </td>
                    <td
                      className={`px-5 py-4 text-right font-semibold ${
                        isIncome
                          ? "text-violet-600 dark:text-violet-300"
                          : "text-rose-600 dark:text-rose-400"
                      }`}
                    >
                      {isIncome ? "+" : "-"}
                      {formatCurrencyId(transaction.amount, language)}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => handleEditTransaction(transaction)}
                          className="inline-flex items-center gap-1 rounded-lg border border-neutral-300 px-3 py-1.5 text-xs font-medium transition hover:bg-neutral-100 dark:border-neutral-700 dark:hover:bg-neutral-900"
                        >
                          <Pencil size={13} />
                          {copy.edit}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteTransaction(transaction)}
                          className="inline-flex items-center gap-1 rounded-lg border border-rose-200 px-3 py-1.5 text-xs font-medium text-rose-600 transition hover:bg-rose-50 dark:border-rose-900/70 dark:text-rose-400 dark:hover:bg-rose-950/40"
                        >
                          <Trash2 size={13} />
                          {copy.delete}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {visibleTransactions.length === 0 && (
          <div className="border-t border-neutral-200 px-5 py-10 text-center text-sm text-neutral-500 dark:border-neutral-800 dark:text-neutral-400">
            {transactions.length === 0
              ? copy.emptyTransactions
              : copy.emptyFilters}
          </div>
        )}
      </section>
    </div>
  );
};