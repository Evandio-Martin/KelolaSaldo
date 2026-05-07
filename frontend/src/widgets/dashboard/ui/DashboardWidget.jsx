import {
  ArrowDownRight,
  ArrowUpRight,
  PiggyBank,
  Wallet,
  ReceiptText,
} from "lucide-react";
import { Link } from "react-router";
import { useAuthStore } from "@/entities/auth";
import { useFinanceStore } from "@/entities/finance";
import { useLanguage } from "@/shared/hooks";
import { formatCurrencyId, formatDateId, formatMonthYearId } from "@/shared/lib";
import { Seo } from "@/shared/ui/Seo";

export const DashboardWidget = () => {
  const { user } = useAuthStore();
  const { transactions, filters, setFilter } = useFinanceStore();
  const { language } = useLanguage();
  const isEnglish = language === "en";

  const monthOptions = [...new Set(transactions.map((item) => item.date.slice(0, 7)))].sort(
    (left, right) => right.localeCompare(left),
  );

  const monthTransactions = transactions.filter((item) =>
    item.date.startsWith(filters.month),
  );

  const income = monthTransactions
    .filter((item) => item.type === "income")
    .reduce((sum, item) => sum + item.amount, 0);

  const expenses = monthTransactions
    .filter((item) => item.type === "expense")
    .reduce((sum, item) => sum + item.amount, 0);

  const balance = income - expenses;
  const savingsRate = income === 0 ? 0 : Math.max(0, (balance / income) * 100);

  const recentTransactions = [...monthTransactions]
    .sort((left, right) => right.date.localeCompare(left.date))
    .slice(0, 5);
  const activeAccounts = new Set(monthTransactions.map((item) => item.account)).size;
  const incomeCount = monthTransactions.filter((item) => item.type === "income").length;
  const expenseCount = monthTransactions.filter((item) => item.type === "expense").length;

  const spendingByCategory = Object.entries(
    monthTransactions
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
  const topCategory = spendingByCategory[0];

  const copy = isEnglish
    ? {
        seoTitle: "Overview",
        seoDescription:
          "Track balances, category spending, and recent activity from the KelolaSaldo dashboard.",
        badge: "Monthly snapshot",
        pageTitle: `Balance overview${user ? ` for ${user.nickname || user.name}` : ""}`,
        pageDescription:
          "Review your current balance, see where money is going, and stay on top of the latest account activity.",
        month: "Month",
        periodFallback: "This period",
        manageTransactions: "Manage transactions",
        netBalance: "Net balance",
        income: "Income",
        expenses: "Expenses",
        savingsRate: "Savings rate",
        balanceDetail: `${formatCurrencyId(income, language)} in - ${formatCurrencyId(expenses, language)} out`,
        incomeDetail: `${incomeCount} income entr${incomeCount === 1 ? "y" : "ies"} this month`,
        expenseDetail: `${expenseCount} expense entr${expenseCount === 1 ? "y" : "ies"} this month`,
        savingsDetail: "Share of income kept after expenses",
        recentTransactions: "Recent transactions",
        recentSubtitle: `Latest activity for ${formatMonthYearId(filters.month, "this period", language)}`,
        categorySpend: "Spending by category",
        categorySpendDescription: "Breakdown of the main expense categories for the selected month.",
        emptyCategorySpend: "Add an expense to start tracking category breakdowns.",
        topCategory: "Top category",
        topCategoryEmpty: "No expenses yet",
        topCategoryHint: "Add your first expense to reveal insights.",
        activeAccounts: "Active accounts",
        monthTransactions: `${monthTransactions.length} transaction${monthTransactions.length === 1 ? "" : "s"} recorded this month`,
      }
    : {
        seoTitle: "Ringkasan",
        seoDescription:
          "Pantau saldo, pengeluaran per kategori, dan aktivitas terbaru dari dashboard KelolaSaldo.",
        badge: "Ringkasan bulanan",
        pageTitle: `Ringkasan saldo${user ? ` untuk ${user.nickname || user.name}` : ""}`,
        pageDescription:
          "Lihat saldo saat ini, cek ke mana uang Anda bergerak, dan pantau aktivitas terbaru dari semua akun yang aktif.",
        month: "Bulan",
        periodFallback: "Periode ini",
        manageTransactions: "Kelola transaksi",
        netBalance: "Saldo bersih",
        income: "Pemasukan",
        expenses: "Pengeluaran",
        savingsRate: "Rasio menabung",
        balanceDetail: `${formatCurrencyId(income, language)} masuk - ${formatCurrencyId(expenses, language)} keluar`,
        incomeDetail: `${incomeCount} pemasukan bulan ini`,
        expenseDetail: `${expenseCount} pengeluaran bulan ini`,
        savingsDetail: "Porsi pemasukan yang masih tersisa setelah pengeluaran",
        recentTransactions: "Transaksi terbaru",
        recentSubtitle: `Aktivitas terbaru untuk ${formatMonthYearId(filters.month, "periode ini", language)}`,
        categorySpend: "Pengeluaran per kategori",
        categorySpendDescription: "Sebaran pengeluaran utama pada bulan terpilih.",
        emptyCategorySpend: "Tambahkan pengeluaran agar rincian kategori mulai terlihat.",
        topCategory: "Kategori terbesar",
        topCategoryEmpty: "Belum ada pengeluaran",
        topCategoryHint: "Tambahkan pengeluaran pertama untuk memunculkan insight.",
        activeAccounts: "Akun aktif",
        monthTransactions: `${monthTransactions.length} transaksi tercatat bulan ini`,
      };

  const summaryCards = [
    {
      label: copy.netBalance,
      value: formatCurrencyId(balance, language),
      tone: "text-violet-600 dark:text-violet-300",
      icon: Wallet,
      detail: copy.balanceDetail,
    },
    {
      label: copy.income,
      value: formatCurrencyId(income, language),
      tone: "text-violet-600 dark:text-violet-300",
      icon: ArrowUpRight,
      detail: copy.incomeDetail,
    },
    {
      label: copy.expenses,
      value: formatCurrencyId(expenses, language),
      tone: "text-rose-600 dark:text-rose-400",
      icon: ArrowDownRight,
      detail: copy.expenseDetail,
    },
    {
      label: copy.savingsRate,
      value: `${Math.round(savingsRate)}%`,
      tone: "text-fuchsia-600 dark:text-fuchsia-300",
      icon: PiggyBank,
      detail: copy.savingsDetail,
    },
  ];

  return (
    <div className="space-y-6">
      <Seo
        title={copy.seoTitle}
        description={copy.seoDescription}
        canonical="/"
        noIndex
      />
      <div className="flex flex-col gap-4 rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm dark:border-neutral-800 dark:bg-neutral-950 md:flex-row md:items-end md:justify-between">
        <div className="space-y-3">
          <span className="inline-flex w-fit items-center rounded-full bg-fuchsia-50 px-3 py-1 text-xs font-semibold tracking-wide text-fuchsia-700 uppercase dark:bg-fuchsia-500/15 dark:text-fuchsia-200">
            {copy.badge}
          </span>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              {copy.pageTitle}
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-neutral-600 dark:text-neutral-400">
              {copy.pageDescription}
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-3 sm:items-end">
          <label className="flex flex-col gap-2 text-sm font-medium text-neutral-600 dark:text-neutral-300">
            {copy.month}
            <select
              value={filters.month}
              onChange={(event) => setFilter("month", event.target.value)}
              className="rounded-xl border border-neutral-300 bg-white px-4 py-2.5 text-sm text-neutral-900 outline-none transition focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100"
            >
              {monthOptions.map((month) => (
                <option key={month} value={month}>
                  {formatMonthYearId(month, copy.periodFallback, language)}
                </option>
              ))}
            </select>
          </label>

          <Link
            to="/transactions"
            className="inline-flex items-center justify-center rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-violet-700"
          >
            {copy.manageTransactions}
          </Link>
        </div>
      </div>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {summaryCards.map((card) => (
          <article
            key={card.label}
            className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm dark:border-neutral-800 dark:bg-neutral-950"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm text-neutral-500 dark:text-neutral-400">{card.label}</p>
                <p className={`mt-3 text-3xl font-semibold ${card.tone}`}>{card.value}</p>
              </div>
              <div className="rounded-xl bg-neutral-100 p-3 dark:bg-neutral-900">
                <card.icon size={18} />
              </div>
            </div>
            <p className="mt-4 text-sm text-neutral-500 dark:text-neutral-400">{card.detail}</p>
          </article>
        ))}
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.35fr_0.95fr]">
        <article className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm dark:border-neutral-800 dark:bg-neutral-950">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-semibold">{copy.recentTransactions}</h2>
              <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
                {copy.recentSubtitle}
              </p>
            </div>
            <ReceiptText className="text-neutral-400" size={20} />
          </div>

          <div className="mt-5 space-y-3">
            {recentTransactions.map((transaction) => {
              const isIncome = transaction.type === "income";

              return (
                <div
                  key={transaction.id}
                  className="flex items-center justify-between rounded-2xl border border-neutral-200 px-4 py-3 dark:border-neutral-800"
                >
                  <div>
                    <p className="font-medium">{transaction.description}</p>
                    <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
                      {transaction.category} · {transaction.account} · {formatDateId(transaction.date, language)}
                    </p>
                  </div>
                  <p
                    className={`text-sm font-semibold ${
                      isIncome
                        ? "text-violet-600 dark:text-violet-300"
                        : "text-rose-600 dark:text-rose-400"
                    }`}
                  >
                    {isIncome ? "+" : "-"}
                    {formatCurrencyId(transaction.amount, language)}
                  </p>
                </div>
              );
            })}
          </div>
        </article>

        <article className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm dark:border-neutral-800 dark:bg-neutral-950">
          <h2 className="text-xl font-semibold">{copy.categorySpend}</h2>
          <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
            {copy.categorySpendDescription}
          </p>

          <div className="mt-5 space-y-4">
            {spendingByCategory.map((item) => (
              <div key={item.category}>
                <div className="mb-2 flex items-center justify-between text-sm">
                  <span className="font-medium">{item.category}</span>
                  <span className="text-neutral-500 dark:text-neutral-400">
                    {formatCurrencyId(item.total, language)}
                  </span>
                </div>
                <div className="h-2 rounded-full bg-neutral-100 dark:bg-neutral-800">
                  <div
                    className="h-2 rounded-full bg-violet-500"
                    style={{ width: `${Math.max(item.share, 8)}%` }}
                  />
                </div>
              </div>
            ))}

            {spendingByCategory.length === 0 && (
              <div className="rounded-2xl bg-neutral-100 p-4 text-sm text-neutral-500 dark:bg-neutral-900 dark:text-neutral-400">
                {copy.emptyCategorySpend}
              </div>
            )}
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl bg-neutral-100 p-4 dark:bg-neutral-900">
              <p className="text-sm text-neutral-500 dark:text-neutral-400">{copy.topCategory}</p>
              <p className="mt-2 text-lg font-semibold text-neutral-900 dark:text-neutral-100">
                {topCategory ? topCategory.category : copy.topCategoryEmpty}
              </p>
              <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
                {topCategory
                  ? formatCurrencyId(topCategory.total, language)
                  : copy.topCategoryHint}
              </p>
            </div>

            <div className="rounded-2xl bg-neutral-100 p-4 dark:bg-neutral-900">
              <p className="text-sm text-neutral-500 dark:text-neutral-400">{copy.activeAccounts}</p>
              <p className="mt-2 text-lg font-semibold text-neutral-900 dark:text-neutral-100">
                {activeAccounts}
              </p>
              <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
                {copy.monthTransactions}
              </p>
            </div>
          </div>
        </article>
      </section>

    </div>
  );
};
