import { useEffect, useMemo, useState } from "react";
import { Pencil, PiggyBank, Plus, Tags, Trash2, Wallet } from "lucide-react";
import { useFinanceStore } from "@/entities/finance";
import { useLanguage } from "@/shared/hooks";
import {
  formatCurrencyId,
  formatGroupedNumberInput,
  formatMonthYearId,
  parseGroupedNumberInput,
} from "@/shared/lib";
import { Seo } from "@/shared/ui/Seo";

const createBudgetDraft = (month, category) => ({
  month,
  category,
  limit: "",
});

export const BudgetPlannerWidget = () => {
  const {
    transactions,
    categories,
    accounts,
    budgets,
    filters,
    setFilter,
    addBudget,
    updateBudget,
    deleteBudget,
    addCategory,
    updateCategory,
    deleteCategory,
    addAccount,
    updateAccount,
    deleteAccount,
  } = useFinanceStore();
  const { language } = useLanguage();
  const isEnglish = language === "en";
  const monthOptions = useMemo(
    () =>
      [...new Set([
        ...transactions.map((item) => item.date.slice(0, 7)),
        ...budgets.map((item) => item.month),
      ])].sort((left, right) => right.localeCompare(left)),
    [transactions, budgets],
  );
  const categoryNames = useMemo(
    () => categories.map((item) => item.name),
    [categories],
  );
  const firstCategoryName = categoryNames[0] || "";
  const activeMonth = filters.month || monthOptions[0] || "";

  const [editingBudgetId, setEditingBudgetId] = useState(null);
  const [budgetDraft, setBudgetDraft] = useState(() =>
    createBudgetDraft(activeMonth, firstCategoryName),
  );
  const [categoryDraft, setCategoryDraft] = useState("");
  const [accountDraft, setAccountDraft] = useState("");
  const [editingCategoryId, setEditingCategoryId] = useState(null);
  const [editingCategoryValue, setEditingCategoryValue] = useState("");
  const [editingAccountId, setEditingAccountId] = useState(null);
  const [editingAccountValue, setEditingAccountValue] = useState("");

  useEffect(() => {
    if (editingBudgetId) {
      return;
    }

    setBudgetDraft((currentDraft) => {
      const nextCategory = categoryNames.includes(currentDraft.category)
        ? currentDraft.category
        : firstCategoryName;

      if (
        currentDraft.month === activeMonth &&
        currentDraft.category === nextCategory
      ) {
        return currentDraft;
      }

      return {
        ...currentDraft,
        month: activeMonth,
        category: nextCategory,
      };
    });
  }, [activeMonth, categoryNames, editingBudgetId, firstCategoryName]);

  const selectedMonthBudgets = budgets
    .filter((budget) => budget.month === activeMonth)
    .sort((left, right) => left.category.localeCompare(right.category));

  const expenseByCategory = transactions
    .filter(
      (transaction) =>
        transaction.type === "expense" && transaction.date.startsWith(activeMonth),
    )
    .reduce((groups, transaction) => {
      groups[transaction.category] =
        (groups[transaction.category] || 0) + transaction.amount;
      return groups;
    }, {});

  const totalBudget = selectedMonthBudgets.reduce(
    (sum, budget) => sum + budget.limit,
    0,
  );
  const totalSpent = Object.values(expenseByCategory).reduce(
    (sum, amount) => sum + amount,
    0,
  );
  const remainingBudget = totalBudget - totalSpent;

  const copy = isEnglish
    ? {
        seoTitle: "Budgets",
        seoDescription:
          "Manage category budgets, spending limits, accounts, and finance labels in KelolaSaldo.",
        pageTitle: "Budgets",
        pageDescription:
          "Set monthly spending limits, tidy your finance structure, and keep each category aligned with the plan.",
        month: "Month",
        currentMonth: "This month",
        plannedTotal: "Planned total",
        spentSoFar: "Spent so far",
        remaining: "Remaining budget",
        plannerTitle: "Budget planner",
        plannerDescription: "Create and adjust monthly spending targets by category.",
        category: "Category",
        monthlyLimit: "Monthly limit",
        monthlyLimitPlaceholder: "1,000,000",
        addBudget: "Add budget",
        saveBudget: "Save budget",
        cancel: "Cancel",
        performanceTitle: "Budget performance",
        performanceDescription: "Track how each category is performing against its monthly limit.",
        spentOfLimit: (spent, limit) => `${formatCurrencyId(spent, language)} spent of ${formatCurrencyId(limit, language)}`,
        edit: "Edit",
        delete: "Delete",
        emptyPerformance: (monthLabel) => `Add your first budget for ${monthLabel} to start tracking performance.`,
        categoriesTitle: "Categories",
        categoriesDescription: "Keep the ledger organized with a clear category structure.",
        addCategoryPlaceholder: "Add category",
        add: "Add",
        save: "Save",
        linkedTransactions: (count) => `${count} linked transaction${count === 1 ? "" : "s"}`,
        accountsTitle: "Accounts",
        accountsDescription: "Separate accounts, wallets, and savings buckets for clearer cash tracking.",
        addAccountPlaceholder: "Add account",
        deleteBudget: (category, monthLabel) => `Delete the ${category} budget for ${monthLabel}?`,
        deleteCategory: (name) => `Delete the ${name} category? Linked transactions will be moved to the default category.`,
        deleteAccount: (name) => `Delete the ${name} account? Linked transactions will be moved to the default cash account.`,
      }
    : {
        seoTitle: "Anggaran",
        seoDescription:
          "Kelola anggaran kategori, batas belanja, akun, dan label keuangan di KelolaSaldo.",
        pageTitle: "Anggaran",
        pageDescription:
          "Atur batas belanja bulanan, rapikan struktur keuangan, dan pastikan setiap kategori tetap sesuai rencana.",
        month: "Bulan",
        currentMonth: "Bulan ini",
        plannedTotal: "Total rencana",
        spentSoFar: "Sudah terpakai",
        remaining: "Sisa anggaran",
        plannerTitle: "Perencana anggaran",
        plannerDescription: "Buat dan sesuaikan target belanja bulanan per kategori.",
        category: "Kategori",
        monthlyLimit: "Batas bulanan",
        monthlyLimitPlaceholder: "1.000.000",
        addBudget: "Tambah anggaran",
        saveBudget: "Simpan anggaran",
        cancel: "Batal",
        performanceTitle: "Performa anggaran",
        performanceDescription: "Pantau performa setiap kategori terhadap batas anggaran bulanannya.",
        spentOfLimit: (spent, limit) => `${formatCurrencyId(spent, language)} dari ${formatCurrencyId(limit, language)} terpakai`,
        edit: "Ubah",
        delete: "Hapus",
        emptyPerformance: (monthLabel) => `Tambahkan anggaran pertama untuk ${monthLabel} agar performanya mulai terlihat.`,
        categoriesTitle: "Kategori",
        categoriesDescription: "Rapikan buku transaksi dengan struktur kategori yang jelas.",
        addCategoryPlaceholder: "Tambah kategori",
        add: "Tambah",
        save: "Simpan",
        linkedTransactions: (count) => `${count} transaksi terkait`,
        accountsTitle: "Akun",
        accountsDescription: "Pisahkan rekening, dompet, dan tabungan untuk memantau arus kas dengan lebih rapi.",
        addAccountPlaceholder: "Tambah akun",
        deleteBudget: (category, monthLabel) => `Hapus anggaran ${category} untuk ${monthLabel}?`,
        deleteCategory: (name) => `Hapus kategori ${name}? Transaksi yang terkait akan dipindahkan ke Lain-lain.`,
        deleteAccount: (name) => `Hapus akun ${name}? Transaksi yang terkait akan dipindahkan ke Tunai.`,
      };

  const handleBudgetSubmit = async (event) => {
    event.preventDefault();

    const normalizedLimit = parseGroupedNumberInput(budgetDraft.limit);

    if (!budgetDraft.month || !budgetDraft.category || !normalizedLimit) {
      return;
    }

    try {
      if (editingBudgetId) {
        await updateBudget(editingBudgetId, {
          month: budgetDraft.month,
          category: budgetDraft.category,
          limit: normalizedLimit,
        });
        setEditingBudgetId(null);
      } else {
        await addBudget({
          month: budgetDraft.month,
          category: budgetDraft.category,
          limit: normalizedLimit,
        });
      }

      setBudgetDraft(createBudgetDraft(activeMonth, firstCategoryName));
    } catch {
      // Store-level toasts already communicate the failure.
    }
  };

  const handleBudgetEdit = (budget) => {
    setEditingBudgetId(budget.id);
    setBudgetDraft({
      month: budget.month,
      category: budget.category,
      limit: formatGroupedNumberInput(budget.limit, language),
    });
    setFilter("month", budget.month);
  };

  const handleBudgetDelete = async (budget) => {
    if (
      !window.confirm(
        copy.deleteBudget(
          budget.category,
          formatMonthYearId(budget.month, copy.currentMonth, language),
        ),
      )
    ) {
      return;
    }

    try {
      await deleteBudget(budget.id);

      if (editingBudgetId === budget.id) {
        setEditingBudgetId(null);
        setBudgetDraft(createBudgetDraft(activeMonth, firstCategoryName));
      }
    } catch {
      // Store-level toasts already communicate the failure.
    }
  };

  const handleCategoryCreate = async () => {
    try {
      await addCategory(categoryDraft);
      setCategoryDraft("");
    } catch {
      // Store-level toasts already communicate the failure.
    }
  };

  const handleCategoryUpdate = async (categoryId) => {
    try {
      await updateCategory(categoryId, editingCategoryValue);
      setEditingCategoryId(null);
      setEditingCategoryValue("");
    } catch {
      // Store-level toasts already communicate the failure.
    }
  };

  const handleCategoryDelete = async (category) => {
    if (
      !window.confirm(copy.deleteCategory(category.name))
    ) {
      return;
    }

    try {
      await deleteCategory(category.id);

      if (editingCategoryId === category.id) {
        setEditingCategoryId(null);
        setEditingCategoryValue("");
      }
    } catch {
      // Store-level toasts already communicate the failure.
    }
  };

  const handleAccountCreate = async () => {
    try {
      await addAccount(accountDraft);
      setAccountDraft("");
    } catch {
      // Store-level toasts already communicate the failure.
    }
  };

  const handleAccountUpdate = async (accountId) => {
    try {
      await updateAccount(accountId, editingAccountValue);
      setEditingAccountId(null);
      setEditingAccountValue("");
    } catch {
      // Store-level toasts already communicate the failure.
    }
  };

  const handleAccountDelete = async (account) => {
    if (
      !window.confirm(copy.deleteAccount(account.name))
    ) {
      return;
    }

    try {
      await deleteAccount(account.id);

      if (editingAccountId === account.id) {
        setEditingAccountId(null);
        setEditingAccountValue("");
      }
    } catch {
      // Store-level toasts already communicate the failure.
    }
  };

  return (
    <div className="min-w-0 space-y-6 overflow-x-hidden">
      <Seo
        title={copy.seoTitle}
        description={copy.seoDescription}
        canonical="/budgets"
        noIndex
      />

      <section className="min-w-0 rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm dark:border-neutral-800 dark:bg-neutral-950">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{copy.pageTitle}</h1>
            <p className="mt-2 max-w-2xl text-sm text-neutral-600 dark:text-neutral-400">
              {copy.pageDescription}
            </p>
          </div>

          <label className="flex flex-col gap-2 text-sm font-medium text-neutral-600 dark:text-neutral-300">
            {copy.month}
            <select
              value={activeMonth}
              onChange={(event) => setFilter("month", event.target.value)}
              className="rounded-xl border border-neutral-300 bg-white px-4 py-2.5 text-sm text-neutral-900 outline-none transition focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100"
            >
              {monthOptions.map((month) => (
                <option key={month} value={month}>
                  {formatMonthYearId(month, copy.currentMonth, language)}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <article className="rounded-2xl border border-neutral-200 bg-neutral-50 p-5 dark:border-neutral-800 dark:bg-neutral-900">
            <p className="text-sm text-neutral-500 dark:text-neutral-400">{copy.plannedTotal}</p>
            <p className="mt-3 text-3xl font-semibold text-violet-600 dark:text-violet-300">
              {formatCurrencyId(totalBudget, language)}
            </p>
          </article>
          <article className="rounded-2xl border border-neutral-200 bg-neutral-50 p-5 dark:border-neutral-800 dark:bg-neutral-900">
            <p className="text-sm text-neutral-500 dark:text-neutral-400">{copy.spentSoFar}</p>
            <p className="mt-3 text-3xl font-semibold text-rose-600 dark:text-rose-400">
              {formatCurrencyId(totalSpent, language)}
            </p>
          </article>
          <article className="rounded-2xl border border-neutral-200 bg-neutral-50 p-5 dark:border-neutral-800 dark:bg-neutral-900">
            <p className="text-sm text-neutral-500 dark:text-neutral-400">{copy.remaining}</p>
            <p className={`mt-3 text-3xl font-semibold ${remainingBudget >= 0 ? "text-fuchsia-600 dark:text-fuchsia-300" : "text-amber-600 dark:text-amber-400"}`}>
              {formatCurrencyId(remainingBudget, language)}
            </p>
          </article>
        </div>
      </section>

      <section className="min-w-0 grid gap-4 xl:grid-cols-[0.88fr_1.12fr]">
        <article className="min-w-0 rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm dark:border-neutral-800 dark:bg-neutral-950">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-2xl font-semibold tracking-tight">{copy.plannerTitle}</h2>
              <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
                {copy.plannerDescription}
              </p>
            </div>
            <PiggyBank className="text-neutral-400" size={20} />
          </div>

          <form onSubmit={handleBudgetSubmit} className="mt-6 grid gap-4 md:grid-cols-2">
            <label className="flex flex-col gap-2 text-sm font-medium text-neutral-600 dark:text-neutral-300">
              {copy.month}
              <select
                value={budgetDraft.month}
                onChange={(event) =>
                  setBudgetDraft((currentDraft) => ({
                    ...currentDraft,
                    month: event.target.value,
                  }))
                }
                className="rounded-xl border border-neutral-300 bg-white px-4 py-2.5 text-sm text-neutral-900 outline-none transition focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100"
              >
                {monthOptions.map((month) => (
                  <option key={month} value={month}>
                    {formatMonthYearId(month, copy.currentMonth, language)}
                  </option>
                ))}
              </select>
            </label>

            <label className="flex flex-col gap-2 text-sm font-medium text-neutral-600 dark:text-neutral-300">
              {copy.category}
              <select
                value={budgetDraft.category}
                onChange={(event) =>
                  setBudgetDraft((currentDraft) => ({
                    ...currentDraft,
                    category: event.target.value,
                  }))
                }
                className="rounded-xl border border-neutral-300 bg-white px-4 py-2.5 text-sm text-neutral-900 outline-none transition focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100"
              >
                {categoryNames.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </label>

            <label className="md:col-span-2 flex flex-col gap-2 text-sm font-medium text-neutral-600 dark:text-neutral-300">
              {copy.monthlyLimit}
              <input
                type="text"
                inputMode="numeric"
                value={budgetDraft.limit}
                onChange={(event) =>
                  setBudgetDraft((currentDraft) => ({
                    ...currentDraft,
                    limit: formatGroupedNumberInput(event.target.value, language),
                  }))
                }
                placeholder={copy.monthlyLimitPlaceholder}
                className="rounded-xl border border-neutral-300 bg-white px-4 py-2.5 text-sm text-neutral-900 outline-none transition focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100"
              />
            </label>

            <div className="md:col-span-2 flex flex-wrap gap-3">
              <button
                type="submit"
                className="rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-violet-700"
              >
                {editingBudgetId ? copy.saveBudget : copy.addBudget}
              </button>

              {editingBudgetId && (
                <button
                  type="button"
                  onClick={() => {
                    setEditingBudgetId(null);
                    setBudgetDraft(createBudgetDraft(activeMonth, firstCategoryName));
                  }}
                  className="rounded-xl border border-neutral-300 px-4 py-2.5 text-sm font-medium transition hover:bg-neutral-100 dark:border-neutral-700 dark:hover:bg-neutral-900"
                >
                  {copy.cancel}
                </button>
              )}
            </div>
          </form>
        </article>

        <article className="min-w-0 rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm dark:border-neutral-800 dark:bg-neutral-950">
          <h2 className="text-2xl font-semibold tracking-tight">{copy.performanceTitle}</h2>
          <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
            {copy.performanceDescription}
          </p>

          <div className="mt-6 space-y-4">
            {selectedMonthBudgets.map((budget) => {
              const spent = expenseByCategory[budget.category] || 0;
              const progress = budget.limit === 0 ? 0 : (spent / budget.limit) * 100;

              return (
                <div
                  key={budget.id}
                  className="rounded-2xl border border-neutral-200 p-4 dark:border-neutral-800"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="break-words font-semibold">{budget.category}</p>
                      <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
                        {copy.spentOfLimit(spent, budget.limit)}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => handleBudgetEdit(budget)}
                        className="inline-flex items-center gap-1 rounded-lg border border-neutral-300 px-3 py-1.5 text-xs font-medium transition hover:bg-neutral-100 dark:border-neutral-700 dark:hover:bg-neutral-900"
                      >
                        <Pencil size={13} />
                        {copy.edit}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleBudgetDelete(budget)}
                        className="inline-flex items-center gap-1 rounded-lg border border-rose-200 px-3 py-1.5 text-xs font-medium text-rose-600 transition hover:bg-rose-50 dark:border-rose-900/70 dark:text-rose-400 dark:hover:bg-rose-950/40"
                      >
                        <Trash2 size={13} />
                        {copy.delete}
                      </button>
                    </div>
                  </div>

                  <div className="mt-4 h-2 rounded-full bg-neutral-100 dark:bg-neutral-900">
                    <div
                      className="h-2 rounded-full bg-violet-500"
                      style={{ width: `${Math.min(Math.max(progress, 5), 100)}%` }}
                    />
                  </div>
                </div>
              );
            })}

            {selectedMonthBudgets.length === 0 && (
              <div className="rounded-2xl bg-neutral-100 p-5 text-sm text-neutral-500 dark:bg-neutral-900 dark:text-neutral-400">
                {copy.emptyPerformance(
                  formatMonthYearId(activeMonth, copy.currentMonth.toLowerCase(), language),
                )}
              </div>
            )}
          </div>
        </article>
      </section>

      <section className="min-w-0 grid gap-4 xl:grid-cols-2">
        <article className="min-w-0 rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm dark:border-neutral-800 dark:bg-neutral-950">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-2xl font-semibold tracking-tight">{copy.categoriesTitle}</h2>
              <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
                {copy.categoriesDescription}
              </p>
            </div>
            <Tags className="text-neutral-400" size={20} />
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <input
              value={categoryDraft}
              onChange={(event) => setCategoryDraft(event.target.value)}
              placeholder={copy.addCategoryPlaceholder}
              className="flex-1 rounded-xl border border-neutral-300 bg-white px-4 py-2.5 text-sm text-neutral-900 outline-none transition focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100"
            />
            <button
              type="button"
              onClick={handleCategoryCreate}
              className="inline-flex items-center gap-2 rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-violet-700"
            >
              <Plus size={16} />
              {copy.add}
            </button>
          </div>

          <div className="mt-6 space-y-3">
            {categories.map((category) => {
              const linkedTransactions = transactions.filter(
                (transaction) => transaction.category === category.name,
              ).length;

              return (
                <div
                  key={category.id}
                  className="rounded-2xl border border-neutral-200 p-4 dark:border-neutral-800"
                >
                  {editingCategoryId === category.id ? (
                    <div className="flex flex-col gap-3 sm:flex-row">
                      <input
                        value={editingCategoryValue}
                        onChange={(event) => setEditingCategoryValue(event.target.value)}
                        className="flex-1 rounded-xl border border-neutral-300 bg-white px-4 py-2.5 text-sm text-neutral-900 outline-none transition focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100"
                      />
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => handleCategoryUpdate(category.id)}
                          className="rounded-xl bg-violet-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-violet-700"
                        >
                          {copy.save}
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setEditingCategoryId(null);
                            setEditingCategoryValue("");
                          }}
                          className="rounded-xl border border-neutral-300 px-4 py-2 text-sm font-medium transition hover:bg-neutral-100 dark:border-neutral-700 dark:hover:bg-neutral-900"
                        >
                          {copy.cancel}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div className="min-w-0">
                        <p className="break-words font-semibold">{category.name}</p>
                        <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
                          {copy.linkedTransactions(linkedTransactions)}
                        </p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setEditingCategoryId(category.id);
                            setEditingCategoryValue(category.name);
                          }}
                          className="inline-flex items-center gap-1 rounded-lg border border-neutral-300 px-3 py-1.5 text-xs font-medium transition hover:bg-neutral-100 dark:border-neutral-700 dark:hover:bg-neutral-900"
                        >
                          <Pencil size={13} />
                          {copy.edit}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleCategoryDelete(category)}
                          className="inline-flex items-center gap-1 rounded-lg border border-rose-200 px-3 py-1.5 text-xs font-medium text-rose-600 transition hover:bg-rose-50 dark:border-rose-900/70 dark:text-rose-400 dark:hover:bg-rose-950/40"
                        >
                          <Trash2 size={13} />
                          {copy.delete}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </article>

        <article className="min-w-0 rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm dark:border-neutral-800 dark:bg-neutral-950">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-2xl font-semibold tracking-tight">{copy.accountsTitle}</h2>
              <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
                {copy.accountsDescription}
              </p>
            </div>
            <Wallet className="text-neutral-400" size={20} />
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <input
              value={accountDraft}
              onChange={(event) => setAccountDraft(event.target.value)}
              placeholder={copy.addAccountPlaceholder}
              className="flex-1 rounded-xl border border-neutral-300 bg-white px-4 py-2.5 text-sm text-neutral-900 outline-none transition focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100"
            />
            <button
              type="button"
              onClick={handleAccountCreate}
              className="inline-flex items-center gap-2 rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-violet-700"
            >
              <Plus size={16} />
              {copy.add}
            </button>
          </div>

          <div className="mt-6 space-y-3">
            {accounts.map((account) => {
              const linkedTransactions = transactions.filter(
                (transaction) => transaction.account === account.name,
              ).length;

              return (
                <div
                  key={account.id}
                  className="rounded-2xl border border-neutral-200 p-4 dark:border-neutral-800"
                >
                  {editingAccountId === account.id ? (
                    <div className="flex flex-col gap-3 sm:flex-row">
                      <input
                        value={editingAccountValue}
                        onChange={(event) => setEditingAccountValue(event.target.value)}
                        className="flex-1 rounded-xl border border-neutral-300 bg-white px-4 py-2.5 text-sm text-neutral-900 outline-none transition focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100"
                      />
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => handleAccountUpdate(account.id)}
                          className="rounded-xl bg-violet-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-violet-700"
                        >
                          {copy.save}
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setEditingAccountId(null);
                            setEditingAccountValue("");
                          }}
                          className="rounded-xl border border-neutral-300 px-4 py-2 text-sm font-medium transition hover:bg-neutral-100 dark:border-neutral-700 dark:hover:bg-neutral-900"
                        >
                          {copy.cancel}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div className="min-w-0">
                        <p className="break-words font-semibold">{account.name}</p>
                        <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
                          {copy.linkedTransactions(linkedTransactions)}
                        </p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setEditingAccountId(account.id);
                            setEditingAccountValue(account.name);
                          }}
                          className="inline-flex items-center gap-1 rounded-lg border border-neutral-300 px-3 py-1.5 text-xs font-medium transition hover:bg-neutral-100 dark:border-neutral-700 dark:hover:bg-neutral-900"
                        >
                          <Pencil size={13} />
                          {copy.edit}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleAccountDelete(account)}
                          className="inline-flex items-center gap-1 rounded-lg border border-rose-200 px-3 py-1.5 text-xs font-medium text-rose-600 transition hover:bg-rose-50 dark:border-rose-900/70 dark:text-rose-400 dark:hover:bg-rose-950/40"
                        >
                          <Trash2 size={13} />
                          {copy.delete}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </article>
      </section>
    </div>
  );
};