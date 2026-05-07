import { ArrowDownRight, ArrowUpRight, BarChart3, PiggyBank, Wallet } from "lucide-react";
import { useFinanceStore } from "@/entities/finance";
import { useLanguage } from "@/shared/hooks";
import {
  formatCurrencyId,
  formatMonthYearId,
  formatShortMonthYearId,
} from "@/shared/lib";
import { Seo } from "@/shared/ui/Seo";

export const ReportsWidget = () => {
  const { transactions, budgets, filters, setFilter } = useFinanceStore();
  const { language } = useLanguage();
  const isEnglish = language === "en";

  const monthOptions = [...new Set([
    ...transactions.map((item) => item.date.slice(0, 7)),
    ...budgets.map((item) => item.month),
  ])].sort((left, right) => right.localeCompare(left));
  const activeMonth = filters.month || monthOptions[0] || "";

  const selectedTransactions = transactions.filter((item) =>
    item.date.startsWith(activeMonth),
  );
  const selectedBudgets = budgets.filter((item) => item.month === activeMonth);

  const income = selectedTransactions
    .filter((item) => item.type === "income")
    .reduce((sum, item) => sum + item.amount, 0);
  const expenses = selectedTransactions
    .filter((item) => item.type === "expense")
    .reduce((sum, item) => sum + item.amount, 0);
  const net = income - expenses;
  const budgetTotal = selectedBudgets.reduce((sum, item) => sum + item.limit, 0);
  const budgetUsage = budgetTotal === 0 ? 0 : (expenses / budgetTotal) * 100;

  const reportMonths = monthOptions.slice(0, 6).reverse();
  const trendData = reportMonths.map((month) => {
    const monthTransactions = transactions.filter((item) =>
      item.date.startsWith(month),
    );

    return {
      month,
      income: monthTransactions
        .filter((item) => item.type === "income")
        .reduce((sum, item) => sum + item.amount, 0),
      expenses: monthTransactions
        .filter((item) => item.type === "expense")
        .reduce((sum, item) => sum + item.amount, 0),
      budget: budgets
        .filter((item) => item.month === month)
        .reduce((sum, item) => sum + item.limit, 0),
    };
  });
  const chartMax = Math.max(
    ...trendData.flatMap((item) => [item.income, item.expenses, item.budget]),
    1,
  );

  const categorySpend = Object.entries(
    selectedTransactions
      .filter((item) => item.type === "expense")
      .reduce((groups, item) => {
        groups[item.category] = (groups[item.category] || 0) + item.amount;
        return groups;
      }, {}),
  )
    .sort((left, right) => right[1] - left[1])
    .map(([category, total]) => ({
      category,
      total,
      share: expenses === 0 ? 0 : (total / expenses) * 100,
    }));

  const accountPerformance = Object.entries(
    selectedTransactions.reduce((groups, transaction) => {
      if (!groups[transaction.account]) {
        groups[transaction.account] = { income: 0, expenses: 0 };
      }

      if (transaction.type === "income") {
        groups[transaction.account].income += transaction.amount;
      } else {
        groups[transaction.account].expenses += transaction.amount;
      }

      return groups;
    }, {}),
  )
    .map(([account, values]) => ({
      account,
      income: values.income,
      expenses: values.expenses,
      net: values.income - values.expenses,
    }))
    .sort((left, right) => right.net - left.net);

  const budgetPerformance = selectedBudgets.map((budget) => {
    const spent = categorySpend.find((item) => item.category === budget.category)?.total || 0;

    return {
      ...budget,
      spent,
      remaining: budget.limit - spent,
      progress: budget.limit === 0 ? 0 : (spent / budget.limit) * 100,
    };
  });

  const copy = isEnglish
    ? {
        seoTitle: "Reports",
        seoDescription:
          "Review monthly cash flow, category performance, and budget usage in KelolaSaldo.",
        pageTitle: "Reports",
        pageDescription:
          "Review monthly cash flow, category performance, and movement across accounts from one compact reporting view.",
        month: "Month",
        currentMonth: "This month",
        income: "Income",
        expenses: "Expenses",
        netCashFlow: "Net cash flow",
        budgetUsed: "Budget used",
        cashFlowTrend: "Cash flow trend",
        cashFlowTrendDescription: "Six-month comparison of income, expenses, and budget.",
        budgetStatus: "Budget status",
        budgetStatusDescription: (monthLabel) => `Performance for ${monthLabel}.`,
        emptyBudgetStatus: "Create budgets to compare actual spending against your targets.",
        categorySpend: "Spending by category",
        categorySpendDescription: "Expense distribution by category for the selected month.",
        emptyCategorySpend: (monthLabel) => `No expense activity yet for ${monthLabel}.`,
        accountActivity: "Account activity",
        accountActivityDescription: "Income, expenses, and net cash flow by account.",
        emptyAccountActivity: "Account activity will appear here after transactions are recorded.",
        budgetLabel: "Budget",
      }
    : {
        seoTitle: "Laporan",
        seoDescription:
          "Tinjau arus kas bulanan, performa kategori, dan pemakaian anggaran di KelolaSaldo.",
        pageTitle: "Laporan",
        pageDescription:
          "Tinjau arus kas bulanan, performa kategori, dan pergerakan setiap akun dari satu ruang laporan yang ringkas.",
        month: "Bulan",
        currentMonth: "Bulan ini",
        income: "Pemasukan",
        expenses: "Pengeluaran",
        netCashFlow: "Arus kas bersih",
        budgetUsed: "Anggaran terpakai",
        cashFlowTrend: "Tren arus kas",
        cashFlowTrendDescription: "Perbandingan enam bulan untuk pemasukan, pengeluaran, dan anggaran.",
        budgetStatus: "Status anggaran",
        budgetStatusDescription: (monthLabel) => `Performa untuk ${monthLabel}.`,
        emptyBudgetStatus: "Buat anggaran untuk membandingkan realisasi dengan target Anda.",
        categorySpend: "Pengeluaran per kategori",
        categorySpendDescription: "Distribusi pengeluaran per kategori pada bulan terpilih.",
        emptyCategorySpend: (monthLabel) => `Belum ada pengeluaran untuk ${monthLabel}.`,
        accountActivity: "Aktivitas akun",
        accountActivityDescription: "Pemasukan, pengeluaran, dan selisih arus kas per akun.",
        emptyAccountActivity: "Aktivitas akun akan muncul setelah transaksi tercatat.",
        budgetLabel: "Anggaran",
      };

  return (
    <div className="space-y-6">
      <Seo
        title={copy.seoTitle}
        description={copy.seoDescription}
        canonical="/reports"
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

        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <article className="rounded-2xl border border-neutral-200 bg-neutral-50 p-5 dark:border-neutral-800 dark:bg-neutral-900">
            <p className="text-sm text-neutral-500 dark:text-neutral-400">{copy.income}</p>
            <p className="mt-3 text-3xl font-semibold text-violet-600 dark:text-violet-300">{formatCurrencyId(income, language)}</p>
          </article>
          <article className="rounded-2xl border border-neutral-200 bg-neutral-50 p-5 dark:border-neutral-800 dark:bg-neutral-900">
            <p className="text-sm text-neutral-500 dark:text-neutral-400">{copy.expenses}</p>
            <p className="mt-3 text-3xl font-semibold text-rose-600 dark:text-rose-400">{formatCurrencyId(expenses, language)}</p>
          </article>
          <article className="rounded-2xl border border-neutral-200 bg-neutral-50 p-5 dark:border-neutral-800 dark:bg-neutral-900">
            <p className="text-sm text-neutral-500 dark:text-neutral-400">{copy.netCashFlow}</p>
            <p className={`mt-3 text-3xl font-semibold ${net >= 0 ? "text-fuchsia-600 dark:text-fuchsia-300" : "text-amber-600 dark:text-amber-400"}`}>{formatCurrencyId(net, language)}</p>
          </article>
          <article className="rounded-2xl border border-neutral-200 bg-neutral-50 p-5 dark:border-neutral-800 dark:bg-neutral-900">
            <p className="text-sm text-neutral-500 dark:text-neutral-400">{copy.budgetUsed}</p>
            <p className="mt-3 text-3xl font-semibold text-amber-600 dark:text-amber-400">{Math.round(budgetUsage)}%</p>
          </article>
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
        <article className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm dark:border-neutral-800 dark:bg-neutral-950">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-2xl font-semibold tracking-tight">{copy.cashFlowTrend}</h2>
              <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
                {copy.cashFlowTrendDescription}
              </p>
            </div>
            <BarChart3 className="text-neutral-400" size={20} />
          </div>

          <div className="mt-8 flex h-72 items-end gap-4">
            {trendData.map((item) => (
              <div key={item.month} className="flex flex-1 flex-col items-center gap-3">
                <div className="flex h-56 w-full items-end justify-center gap-2">
                  <div
                    className="w-5 rounded-t-xl bg-violet-500"
                    style={{ height: `${Math.max((item.income / chartMax) * 100, 4)}%` }}
                    title={`${copy.income} ${formatCurrencyId(item.income, language)}`}
                  />
                  <div
                    className="w-5 rounded-t-xl bg-rose-500"
                    style={{ height: `${Math.max((item.expenses / chartMax) * 100, 4)}%` }}
                    title={`${copy.expenses} ${formatCurrencyId(item.expenses, language)}`}
                  />
                  <div
                    className="w-5 rounded-t-xl bg-fuchsia-500"
                    style={{ height: `${Math.max((item.budget / chartMax) * 100, 4)}%` }}
                    title={`${copy.budgetLabel} ${formatCurrencyId(item.budget, language)}`}
                  />
                </div>
                <p className="text-xs font-medium text-neutral-500 dark:text-neutral-400">
                  {formatShortMonthYearId(item.month, language)}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-5 flex flex-wrap gap-4 text-sm text-neutral-500 dark:text-neutral-400">
            <span className="inline-flex items-center gap-2"><span className="h-3 w-3 rounded-full bg-violet-500" />{copy.income}</span>
            <span className="inline-flex items-center gap-2"><span className="h-3 w-3 rounded-full bg-rose-500" />{copy.expenses}</span>
            <span className="inline-flex items-center gap-2"><span className="h-3 w-3 rounded-full bg-fuchsia-500" />{copy.budgetLabel}</span>
          </div>
        </article>

        <article className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm dark:border-neutral-800 dark:bg-neutral-950">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-2xl font-semibold tracking-tight">{copy.budgetStatus}</h2>
              <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
                {copy.budgetStatusDescription(
                  formatMonthYearId(activeMonth, copy.currentMonth.toLowerCase(), language),
                )}
              </p>
            </div>
            <PiggyBank className="text-neutral-400" size={20} />
          </div>

          <div className="mt-6 space-y-4">
            {budgetPerformance.map((budget) => (
              <div key={budget.id}>
                <div className="mb-2 flex items-center justify-between text-sm">
                  <span className="font-medium">{budget.category}</span>
                  <span className="text-neutral-500 dark:text-neutral-400">
                    {formatCurrencyId(budget.spent, language)} / {formatCurrencyId(budget.limit, language)}
                  </span>
                </div>
                <div className="h-2 rounded-full bg-neutral-100 dark:bg-neutral-900">
                  <div
                    className="h-2 rounded-full bg-violet-500"
                    style={{ width: `${Math.min(Math.max(budget.progress, 5), 100)}%` }}
                  />
                </div>
              </div>
            ))}

            {budgetPerformance.length === 0 && (
              <div className="rounded-2xl bg-neutral-100 p-5 text-sm text-neutral-500 dark:bg-neutral-900 dark:text-neutral-400">
                {copy.emptyBudgetStatus}
              </div>
            )}
          </div>
        </article>
      </section>

      <section className="grid gap-4 xl:grid-cols-[0.9fr_1.1fr]">
        <article className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm dark:border-neutral-800 dark:bg-neutral-950">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-2xl font-semibold tracking-tight">{copy.categorySpend}</h2>
              <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
                {copy.categorySpendDescription}
              </p>
            </div>
            <ArrowDownRight className="text-neutral-400" size={20} />
          </div>

          <div className="mt-6 space-y-4">
            {categorySpend.map((item) => (
              <div key={item.category}>
                <div className="mb-2 flex items-center justify-between text-sm">
                  <span className="font-medium">{item.category}</span>
                  <span className="text-neutral-500 dark:text-neutral-400">{formatCurrencyId(item.total, language)}</span>
                </div>
                <div className="h-2 rounded-full bg-neutral-100 dark:bg-neutral-900">
                  <div
                    className="h-2 rounded-full bg-violet-500"
                    style={{ width: `${Math.max(item.share, 5)}%` }}
                  />
                </div>
              </div>
            ))}

            {categorySpend.length === 0 && (
              <div className="rounded-2xl bg-neutral-100 p-5 text-sm text-neutral-500 dark:bg-neutral-900 dark:text-neutral-400">
                {copy.emptyCategorySpend(
                  formatMonthYearId(activeMonth, copy.currentMonth.toLowerCase(), language),
                )}
              </div>
            )}
          </div>
        </article>

        <article className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm dark:border-neutral-800 dark:bg-neutral-950">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-2xl font-semibold tracking-tight">{copy.accountActivity}</h2>
              <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
                {copy.accountActivityDescription}
              </p>
            </div>
            <Wallet className="text-neutral-400" size={20} />
          </div>

          <div className="mt-6 space-y-4">
            {accountPerformance.map((account) => (
              <div
                key={account.account}
                className="rounded-2xl border border-neutral-200 p-4 dark:border-neutral-800"
              >
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="font-semibold">{account.account}</p>
                    <div className="mt-2 flex flex-wrap gap-4 text-sm">
                      <span className="inline-flex items-center gap-1 text-violet-600 dark:text-violet-300">
                        <ArrowUpRight size={14} />
                        {formatCurrencyId(account.income, language)}
                      </span>
                      <span className="inline-flex items-center gap-1 text-rose-600 dark:text-rose-400">
                        <ArrowDownRight size={14} />
                        {formatCurrencyId(account.expenses, language)}
                      </span>
                    </div>
                  </div>
                  <p className={`text-lg font-semibold ${account.net >= 0 ? "text-fuchsia-600 dark:text-fuchsia-300" : "text-amber-600 dark:text-amber-400"}`}>
                    {formatCurrencyId(account.net, language)}
                  </p>
                </div>
              </div>
            ))}

            {accountPerformance.length === 0 && (
              <div className="rounded-2xl bg-neutral-100 p-5 text-sm text-neutral-500 dark:bg-neutral-900 dark:text-neutral-400">
                {copy.emptyAccountActivity}
              </div>
            )}
          </div>
        </article>
      </section>
    </div>
  );
};