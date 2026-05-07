import { create } from "zustand";
import { v4 as uuidv4 } from "uuid";
import { toast } from "sonner";
import { isMockAuthEnabled } from "@/entities/auth/api/mock-auth.api";
import { getUserFromToken } from "@/shared/lib/jwtDecode";
import { tokenService } from "@/shared/lib/tokenService";
import { financeApi } from "../api/finance.api";
import { readStoredLanguage } from "@/shared/hooks";

const FINANCE_STORAGE_KEY = "money-tracker-finance";
const LEGACY_FINANCE_STORAGE_KEY = FINANCE_STORAGE_KEY;
const LEGACY_TRANSACTIONS_STORAGE_KEY = "money-tracker-transactions";
const FALLBACK_CATEGORY = "Lain-lain";
const FALLBACK_ACCOUNT = "Tunai";
const GUEST_FINANCE_SCOPE = "guest";
const isRemoteFinanceEnabled = Boolean(import.meta.env.VITE_API_BASE_URL) && !isMockAuthEnabled;

const getActiveFinanceScope = () => {
  const token = tokenService.getAccessToken() || tokenService.getRefreshToken();
  const user = getUserFromToken(token);

  return user?.id || GUEST_FINANCE_SCOPE;
};

const getFinanceStorageKey = () =>
  `${FINANCE_STORAGE_KEY}:${getActiveFinanceScope()}`;

const seedTransactions = [
  {
    id: "txn-001",
    date: "2026-05-01",
    description: "Gaji Bulanan",
    category: "Gaji",
    account: "Rekening Utama",
    type: "income",
    amount: 8500000,
  },
  {
    id: "txn-002",
    date: "2026-05-02",
    description: "Sewa Kontrakan",
    category: "Tempat Tinggal",
    account: "Rekening Utama",
    type: "expense",
    amount: 2400000,
  },
  {
    id: "txn-003",
    date: "2026-05-03",
    description: "Belanja Bulanan",
    category: "Makanan",
    account: "Rekening Utama",
    type: "expense",
    amount: 685000,
  },
  {
    id: "txn-004",
    date: "2026-05-04",
    description: "Proyek Landing Page",
    category: "Pekerjaan Sampingan",
    account: "Dana Tabungan",
    type: "income",
    amount: 2250000,
  },
  {
    id: "txn-005",
    date: "2026-05-05",
    description: "Tagihan Listrik",
    category: "Tagihan",
    account: "Rekening Utama",
    type: "expense",
    amount: 315000,
  },
  {
    id: "txn-006",
    date: "2026-05-06",
    description: "Isi Bensin",
    category: "Transportasi",
    account: "Rekening Utama",
    type: "expense",
    amount: 180000,
  },
  {
    id: "txn-007",
    date: "2026-05-08",
    description: "Transfer Dana Darurat",
    category: "Tabungan",
    account: "Dana Tabungan",
    type: "expense",
    amount: 1000000,
  },
  {
    id: "txn-008",
    date: "2026-05-10",
    description: "Kopi dan Camilan",
    category: "Makanan",
    account: "Rekening Utama",
    type: "expense",
    amount: 45000,
  },
  {
    id: "txn-009",
    date: "2026-05-12",
    description: "Langganan Streaming",
    category: "Hiburan",
    account: "Rekening Utama",
    type: "expense",
    amount: 129000,
  },
  {
    id: "txn-010",
    date: "2026-04-29",
    description: "Gaji Bulanan",
    category: "Gaji",
    account: "Rekening Utama",
    type: "income",
    amount: 8350000,
  },
  {
    id: "txn-011",
    date: "2026-04-30",
    description: "Belanja Bulanan",
    category: "Makanan",
    account: "Rekening Utama",
    type: "expense",
    amount: 620000,
  },
  {
    id: "txn-012",
    date: "2026-04-24",
    description: "Retainer Klien",
    category: "Pekerjaan Sampingan",
    account: "Dana Tabungan",
    type: "income",
    amount: 1750000,
  },
];

const CATEGORY_MIGRATIONS = {
  Salary: "Gaji",
  Housing: "Tempat Tinggal",
  Food: "Makanan",
  Freelance: "Pekerjaan Sampingan",
  Utilities: "Tagihan",
  Transport: "Transportasi",
  Savings: "Tabungan",
  Entertainment: "Hiburan",
  Uncategorized: FALLBACK_CATEGORY,
};

const ACCOUNT_MIGRATIONS = {
  "Main Wallet": "Rekening Utama",
  "Savings Vault": "Dana Tabungan",
  "Cash Wallet": FALLBACK_ACCOUNT,
};

const DESCRIPTION_MIGRATIONS = {
  "Primary Salary": "Gaji Bulanan",
  "Apartment Rent": "Sewa Kontrakan",
  Groceries: "Belanja Bulanan",
  "Freelance Landing Page": "Proyek Landing Page",
  "Electricity Bill": "Tagihan Listrik",
  Fuel: "Isi Bensin",
  "Emergency Fund Transfer": "Transfer Dana Darurat",
  "Coffee and Snacks": "Kopi dan Camilan",
  "Streaming Subscriptions": "Langganan Streaming",
  "Client Retainer": "Retainer Klien",
};

const SEEDED_TRANSACTION_MIGRATIONS = Object.fromEntries(
  seedTransactions.map((transaction) => [transaction.id, transaction]),
);

const slugify = (value) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

const createNamedItems = (names, prefix) =>
  [...new Set(names)]
    .filter(Boolean)
    .sort((left, right) => left.localeCompare(right))
    .map((name, index) => ({
      id: `${prefix}-${slugify(name)}-${index}`,
      name,
    }));

const seedCategories = createNamedItems(
  [...seedTransactions.map((item) => item.category), FALLBACK_CATEGORY],
  "category",
);

const seedAccounts = createNamedItems(
  [...seedTransactions.map((item) => item.account), FALLBACK_ACCOUNT],
  "account",
);

const seedBudgets = [
  { id: "budget-001", month: "2026-05", category: "Tempat Tinggal", limit: 2500000 },
  { id: "budget-002", month: "2026-05", category: "Makanan", limit: 1200000 },
  { id: "budget-003", month: "2026-05", category: "Transportasi", limit: 500000 },
  { id: "budget-004", month: "2026-05", category: "Tagihan", limit: 700000 },
  { id: "budget-005", month: "2026-05", category: "Hiburan", limit: 400000 },
  { id: "budget-006", month: "2026-05", category: "Tabungan", limit: 1500000 },
  { id: "budget-007", month: "2026-04", category: "Makanan", limit: 1100000 },
  { id: "budget-008", month: "2026-04", category: "Tempat Tinggal", limit: 2500000 },
  { id: "budget-009", month: "2026-04", category: "Transportasi", limit: 450000 },
];

const SEEDED_BUDGET_MIGRATIONS = Object.fromEntries(
  seedBudgets.map((budget) => [budget.id, budget]),
);

const seedFinanceState = {
  transactions: seedTransactions,
  categories: seedCategories,
  accounts: seedAccounts,
  budgets: seedBudgets,
};

const getFinanceCopy = () =>
  readStoredLanguage() === "en"
    ? {
        transactionAdded: "Transaction added.",
        transactionUpdated: "Transaction updated.",
        transactionDeleted: "Transaction deleted.",
        categoryNameRequired: "Category name is required.",
        categoryExists: "That category already exists.",
        categoryAdded: "Category added.",
        categoryUpdated: "Category updated.",
        categoryDeleted: "Category deleted.",
        accountNameRequired: "Account name is required.",
        accountExists: "That account already exists.",
        accountAdded: "Account added.",
        accountUpdated: "Account updated.",
        accountDeleted: "Account deleted.",
        budgetExists: "A budget already exists for that month and category.",
        budgetAdded: "Budget added.",
        budgetUpdated: "Budget updated.",
        budgetDeleted: "Budget deleted.",
        financeLoadFailed: "Failed to load finance data.",
        financeSyncFailed: "Failed to sync finance data.",
      }
    : {
        transactionAdded: "Transaksi berhasil ditambahkan.",
        transactionUpdated: "Transaksi berhasil diperbarui.",
        transactionDeleted: "Transaksi berhasil dihapus.",
        categoryNameRequired: "Nama kategori wajib diisi.",
        categoryExists: "Kategori tersebut sudah ada.",
        categoryAdded: "Kategori berhasil ditambahkan.",
        categoryUpdated: "Kategori berhasil diperbarui.",
        categoryDeleted: "Kategori berhasil dihapus.",
        accountNameRequired: "Nama akun wajib diisi.",
        accountExists: "Akun tersebut sudah ada.",
        accountAdded: "Akun berhasil ditambahkan.",
        accountUpdated: "Akun berhasil diperbarui.",
        accountDeleted: "Akun berhasil dihapus.",
        budgetExists: "Anggaran untuk bulan dan kategori tersebut sudah ada.",
        budgetAdded: "Anggaran berhasil ditambahkan.",
        budgetUpdated: "Anggaran berhasil diperbarui.",
        budgetDeleted: "Anggaran berhasil dihapus.",
        financeLoadFailed: "Gagal memuat data keuangan.",
        financeSyncFailed: "Gagal menyinkronkan data keuangan.",
      };

const translateValue = (value, dictionary) => dictionary[value] || value;

const migrateTransactions = (transactions) =>
  transactions.map((transaction) => {
    const seededTransaction = SEEDED_TRANSACTION_MIGRATIONS[transaction.id];

    if (seededTransaction) {
      return seededTransaction;
    }

    return {
      ...transaction,
      description: translateValue(transaction.description, DESCRIPTION_MIGRATIONS),
      category: translateValue(transaction.category, CATEGORY_MIGRATIONS),
      account: translateValue(transaction.account, ACCOUNT_MIGRATIONS),
    };
  });

const migrateBudgets = (budgets) =>
  budgets.map((budget) => {
    const seededBudget = SEEDED_BUDGET_MIGRATIONS[budget.id];

    if (seededBudget) {
      return seededBudget;
    }

    return {
      ...budget,
      category: translateValue(budget.category, CATEGORY_MIGRATIONS),
    };
  });

const migrateFinanceState = (state) => {
  const transactions = migrateTransactions(state.transactions || []);
  const budgets = migrateBudgets(state.budgets || []);

  return {
    transactions,
    categories: createNamedItems(
      [
        ...(state.categories || []).map((item) =>
          translateValue(item.name, CATEGORY_MIGRATIONS),
        ),
        ...transactions.map((item) => item.category),
        ...budgets.map((item) => item.category),
        FALLBACK_CATEGORY,
      ],
      "category",
    ),
    accounts: createNamedItems(
      [
        ...(state.accounts || []).map((item) =>
          translateValue(item.name, ACCOUNT_MIGRATIONS),
        ),
        ...transactions.map((item) => item.account),
        FALLBACK_ACCOUNT,
      ],
      "account",
    ),
    budgets,
  };
};

const hasBrowserStorage = () => typeof window !== "undefined";

const sortNamedItems = (items) =>
  [...items].sort((left, right) => left.name.localeCompare(right.name));

const getLatestMonth = (transactions, budgets = []) => {
  const monthCandidates = [
    ...transactions.map((item) => item.date.slice(0, 7)),
    ...budgets.map((item) => item.month),
  ].filter(Boolean);

  return monthCandidates.sort((left, right) => right.localeCompare(left))[0] ?? "";
};

const getDefaultFilters = ({ transactions, budgets }) => ({
  month: getLatestMonth(transactions, budgets),
  type: "all",
  category: "all",
  search: "",
});

const normalizeTransactionInput = (transaction) => ({
  description: transaction.description.trim(),
  category: transaction.category.trim(),
  account: transaction.account.trim(),
  date: transaction.date,
  type: transaction.type,
  amount: Number(transaction.amount),
});

const normalizeBudgetInput = (budget) => ({
  month: budget.month,
  category: budget.category.trim(),
  limit: Number(budget.limit),
});

const ensureNamedItem = (items, name, prefix) => {
  const trimmedName = name.trim();

  if (!trimmedName) {
    return items;
  }

  if (items.some((item) => item.name === trimmedName)) {
    return items;
  }

  return sortNamedItems([
    ...items,
    {
      id: `${prefix}-${uuidv4()}`,
      name: trimmedName,
    },
  ]);
};

const ensureBaseEntities = (state) => ({
  ...state,
  categories: ensureNamedItem(state.categories, FALLBACK_CATEGORY, "category"),
  accounts: ensureNamedItem(state.accounts, FALLBACK_ACCOUNT, "account"),
});

const deriveEntitiesFromTransactions = (state) => {
  const categories = state.transactions.reduce(
    (currentItems, transaction) =>
      ensureNamedItem(currentItems, transaction.category, "category"),
    state.categories,
  );
  const accounts = state.transactions.reduce(
    (currentItems, transaction) =>
      ensureNamedItem(currentItems, transaction.account, "account"),
    state.accounts,
  );

  return {
    ...state,
    categories,
    accounts,
  };
};

const persistFinanceState = (state) => {
  const normalizedState = ensureBaseEntities(
    deriveEntitiesFromTransactions(migrateFinanceState(state)),
  );

  if (hasBrowserStorage()) {
    window.localStorage.setItem(
      getFinanceStorageKey(),
      JSON.stringify(normalizedState),
    );
  }

  return normalizedState;
};

const readLegacyTransactions = () => {
  if (!hasBrowserStorage()) {
    return null;
  }

  const serializedTransactions = window.localStorage.getItem(
    LEGACY_TRANSACTIONS_STORAGE_KEY,
  );

  if (!serializedTransactions) {
    return null;
  }

  try {
    const parsedTransactions = JSON.parse(serializedTransactions);
    return Array.isArray(parsedTransactions) ? parsedTransactions : null;
  } catch {
    return null;
  }
};

const readFinanceState = () => {
  if (!hasBrowserStorage()) {
    return seedFinanceState;
  }

  const serializedState = window.localStorage.getItem(getFinanceStorageKey());

  if (serializedState) {
    try {
      const parsedState = JSON.parse(serializedState);

      if (
        parsedState &&
        Array.isArray(parsedState.transactions) &&
        Array.isArray(parsedState.categories) &&
        Array.isArray(parsedState.accounts) &&
        Array.isArray(parsedState.budgets)
      ) {
        return persistFinanceState(parsedState);
      }
    } catch {
      return persistFinanceState(seedFinanceState);
    }
  }

  if (getActiveFinanceScope() === GUEST_FINANCE_SCOPE) {
    const legacyState = window.localStorage.getItem(LEGACY_FINANCE_STORAGE_KEY);

    if (legacyState) {
      try {
        const parsedLegacyState = JSON.parse(legacyState);

        if (
          parsedLegacyState &&
          Array.isArray(parsedLegacyState.transactions) &&
          Array.isArray(parsedLegacyState.categories) &&
          Array.isArray(parsedLegacyState.accounts) &&
          Array.isArray(parsedLegacyState.budgets)
        ) {
          return persistFinanceState(parsedLegacyState);
        }
      } catch {
        return persistFinanceState(seedFinanceState);
      }
    }
  }

  const legacyTransactions = readLegacyTransactions();

  if (legacyTransactions) {
    return persistFinanceState({
      transactions: legacyTransactions,
      categories: createNamedItems(
        [...legacyTransactions.map((item) => item.category), FALLBACK_CATEGORY],
        "category",
      ),
      accounts: createNamedItems(
        [...legacyTransactions.map((item) => item.account), FALLBACK_ACCOUNT],
        "account",
      ),
      budgets: seedBudgets,
    });
  }

  return persistFinanceState(seedFinanceState);
};

const updateFiltersAfterMutation = (filters, transactions, budgets, monthHint) => {
  const nextFilters = { ...filters };
  const latestMonth = getLatestMonth(transactions, budgets);

  if (monthHint) {
    nextFilters.month = monthHint;
  }

  if (
    nextFilters.month &&
    !transactions.some((transaction) =>
      transaction.date.startsWith(nextFilters.month),
    ) &&
    !budgets.some((budget) => budget.month === nextFilters.month)
  ) {
    nextFilters.month = latestMonth;
  }

  if (!transactions.length && !budgets.length) {
    nextFilters.month = "";
  }

  return nextFilters;
};

const renameInTransactions = (transactions, key, fromName, toName) =>
  transactions.map((transaction) =>
    transaction[key] === fromName
      ? { ...transaction, [key]: toName }
      : transaction,
  );

const renameInBudgets = (budgets, fromName, toName) =>
  budgets.map((budget) =>
    budget.category === fromName ? { ...budget, category: toName } : budget,
  );

const createEmptyFinanceState = () => ({
  transactions: [],
  categories: [],
  accounts: [],
  budgets: [],
});

const normalizeRemoteFinanceState = (state) => ({
  transactions: [...(state.transactions || [])].sort(
    (left, right) => right.date.localeCompare(left.date),
  ),
  categories: sortNamedItems([...(state.categories || [])]),
  accounts: sortNamedItems([...(state.accounts || [])]),
  budgets: [...(state.budgets || [])].sort(
    (left, right) =>
      right.month.localeCompare(left.month) ||
      left.category.localeCompare(right.category),
  ),
});

const getErrorMessage = (error, fallbackMessage) =>
  error.response?.data?.message || fallbackMessage;

const fetchRemoteFinanceSnapshot = async () => {
  const [transactions, categories, accounts, budgets] = await Promise.all([
    financeApi.getTransactions(),
    financeApi.getCategories(),
    financeApi.getAccounts(),
    financeApi.getBudgets(),
  ]);

  return normalizeRemoteFinanceState({
    transactions,
    categories,
    accounts,
    budgets,
  });
};

const getInitialFinanceState = () =>
  isRemoteFinanceEnabled ? createEmptyFinanceState() : readFinanceState();

const initialFinanceState = getInitialFinanceState();

export const defaultFinanceFilters = getDefaultFilters(initialFinanceState);

export const useFinanceStore = create((set, get) => ({
  ...initialFinanceState,
  filters: defaultFinanceFilters,
  isLoading: false,
  isInitialized: !isRemoteFinanceEnabled,
  storageScopeKey: getFinanceStorageKey(),
  error: null,

  initializeFinance: async () => {
    if (!isRemoteFinanceEnabled) {
      const storageScopeKey = getFinanceStorageKey();

      if (get().isInitialized && get().storageScopeKey === storageScopeKey) {
        set({ isInitialized: true, error: null });
        return;
      }

      const nextState = readFinanceState();

      set({
        ...nextState,
        filters: getDefaultFilters(nextState),
        isLoading: false,
        isInitialized: true,
        storageScopeKey,
        error: null,
      });
      return;
    }

    if (get().isLoading || get().isInitialized) {
      return;
    }

    await get().refreshFinance();
  },

  refreshFinance: async (monthHint) => {
    if (!isRemoteFinanceEnabled) {
      set({ isInitialized: true, error: null });
      return;
    }

    set({ isLoading: true, error: null });

    try {
      const snapshot = await fetchRemoteFinanceSnapshot();

      set((state) => ({
        ...snapshot,
        filters: updateFiltersAfterMutation(
          state.filters,
          snapshot.transactions,
          snapshot.budgets,
          monthHint,
        ),
        isLoading: false,
        isInitialized: true,
        error: null,
      }));
    } catch (error) {
      const copy = getFinanceCopy();
      const message = getErrorMessage(error, copy.financeLoadFailed);

      set({ isLoading: false, isInitialized: true, error: message });
      throw error;
    }
  },

  resetFinance: () => {
    const nextState = getInitialFinanceState();
    set({
      ...nextState,
      filters: getDefaultFilters(nextState),
      isLoading: false,
      isInitialized: !isRemoteFinanceEnabled,
      storageScopeKey: getFinanceStorageKey(),
      error: null,
    });
  },

  setFilter: (key, value) =>
    set((state) => ({
      filters: {
        ...state.filters,
        [key]: value,
      },
    })),

  resetFilters: () =>
    set((state) => ({ filters: getDefaultFilters(state) })),

  addTransaction: async (transactionInput) => {
    if (!isRemoteFinanceEnabled) {
      set((state) => {
        const copy = getFinanceCopy();
        const nextTransaction = {
          id: uuidv4(),
          ...normalizeTransactionInput(transactionInput),
        };
        const nextState = persistFinanceState({
          ...state,
          transactions: [...state.transactions, nextTransaction],
          categories: ensureNamedItem(
            state.categories,
            nextTransaction.category,
            "category",
          ),
          accounts: ensureNamedItem(state.accounts, nextTransaction.account, "account"),
        });

        toast.success(copy.transactionAdded);

        return {
          ...nextState,
          filters: updateFiltersAfterMutation(
            state.filters,
            nextState.transactions,
            nextState.budgets,
            nextTransaction.date.slice(0, 7),
          ),
        };
      });
      return;
    }

    const copy = getFinanceCopy();

    try {
      const payload = normalizeTransactionInput(transactionInput);
      const response = await financeApi.addTransaction(payload);
      toast.success(response.message || copy.transactionAdded);
      await get().refreshFinance(payload.date.slice(0, 7));
      return response.data;
    } catch (error) {
      const message = getErrorMessage(error, copy.financeSyncFailed);
      set({ error: message });
      toast.error(message);
      throw error;
    }
  },

  updateTransaction: async (transactionId, transactionInput) => {
    if (!isRemoteFinanceEnabled) {
      set((state) => {
        const copy = getFinanceCopy();
        const updatedTransaction = normalizeTransactionInput(transactionInput);
        const nextState = persistFinanceState({
          ...state,
          transactions: state.transactions.map((transaction) =>
            transaction.id === transactionId
              ? { ...transaction, ...updatedTransaction }
              : transaction,
          ),
          categories: ensureNamedItem(
            state.categories,
            updatedTransaction.category,
            "category",
          ),
          accounts: ensureNamedItem(
            state.accounts,
            updatedTransaction.account,
            "account",
          ),
        });

        toast.success(copy.transactionUpdated);

        return {
          ...nextState,
          filters: updateFiltersAfterMutation(
            state.filters,
            nextState.transactions,
            nextState.budgets,
            updatedTransaction.date.slice(0, 7),
          ),
        };
      });
      return;
    }

    const copy = getFinanceCopy();

    try {
      const payload = normalizeTransactionInput(transactionInput);
      const response = await financeApi.updateTransaction(transactionId, payload);
      toast.success(response.message || copy.transactionUpdated);
      await get().refreshFinance(payload.date.slice(0, 7));
      return response.data;
    } catch (error) {
      const message = getErrorMessage(error, copy.financeSyncFailed);
      set({ error: message });
      toast.error(message);
      throw error;
    }
  },

  deleteTransaction: async (transactionId) => {
    if (!isRemoteFinanceEnabled) {
      set((state) => {
        const copy = getFinanceCopy();
        const nextState = persistFinanceState({
          ...state,
          transactions: state.transactions.filter(
            (transaction) => transaction.id !== transactionId,
          ),
        });

        toast.success(copy.transactionDeleted);

        return {
          ...nextState,
          filters: updateFiltersAfterMutation(
            state.filters,
            nextState.transactions,
            nextState.budgets,
          ),
        };
      });
      return;
    }

    const copy = getFinanceCopy();

    try {
      const response = await financeApi.deleteTransaction(transactionId);
      toast.success(response.message || copy.transactionDeleted);
      await get().refreshFinance();
    } catch (error) {
      const message = getErrorMessage(error, copy.financeSyncFailed);
      set({ error: message });
      toast.error(message);
      throw error;
    }
  },

  addCategory: async (name) => {
    if (!isRemoteFinanceEnabled) {
      set((state) => {
        const copy = getFinanceCopy();
        const trimmedName = name.trim();

        if (!trimmedName) {
          toast.error(copy.categoryNameRequired);
          return state;
        }

        if (state.categories.some((item) => item.name === trimmedName)) {
          toast.error(copy.categoryExists);
          return state;
        }

        const nextState = persistFinanceState({
          ...state,
          categories: ensureNamedItem(state.categories, trimmedName, "category"),
        });

        toast.success(copy.categoryAdded);
        return nextState;
      });
      return;
    }

    const copy = getFinanceCopy();
    const trimmedName = name.trim();

    if (!trimmedName) {
      toast.error(copy.categoryNameRequired);
      return;
    }

    try {
      const response = await financeApi.addCategory(trimmedName);
      toast.success(response.message || copy.categoryAdded);
      await get().refreshFinance();
      return response.data;
    } catch (error) {
      const message = getErrorMessage(error, copy.financeSyncFailed);
      set({ error: message });
      toast.error(message);
      throw error;
    }
  },

  updateCategory: async (categoryId, nextName) => {
    if (!isRemoteFinanceEnabled) {
      set((state) => {
        const copy = getFinanceCopy();
        const trimmedName = nextName.trim();
        const currentCategory = state.categories.find((item) => item.id === categoryId);

        if (!currentCategory) {
          return state;
        }

        if (!trimmedName) {
          toast.error(copy.categoryNameRequired);
          return state;
        }

        if (
          state.categories.some(
            (item) => item.name === trimmedName && item.id !== categoryId,
          )
        ) {
          toast.error(copy.categoryExists);
          return state;
        }

        const nextState = persistFinanceState({
          ...state,
          categories: sortNamedItems(
            state.categories.map((item) =>
              item.id === categoryId ? { ...item, name: trimmedName } : item,
            ),
          ),
          transactions: renameInTransactions(
            state.transactions,
            "category",
            currentCategory.name,
            trimmedName,
          ),
          budgets: renameInBudgets(state.budgets, currentCategory.name, trimmedName),
        });

        toast.success(copy.categoryUpdated);
        return nextState;
      });
      return;
    }

    const copy = getFinanceCopy();
    const trimmedName = nextName.trim();

    if (!trimmedName) {
      toast.error(copy.categoryNameRequired);
      return;
    }

    try {
      const response = await financeApi.updateCategory(categoryId, trimmedName);
      toast.success(response.message || copy.categoryUpdated);
      await get().refreshFinance();
      return response.data;
    } catch (error) {
      const message = getErrorMessage(error, copy.financeSyncFailed);
      set({ error: message });
      toast.error(message);
      throw error;
    }
  },

  deleteCategory: async (categoryId) => {
    if (!isRemoteFinanceEnabled) {
      set((state) => {
        const copy = getFinanceCopy();
        const category = state.categories.find((item) => item.id === categoryId);

        if (!category || category.name === FALLBACK_CATEGORY) {
          return state;
        }

        const nextState = persistFinanceState({
          ...state,
          categories: state.categories.filter((item) => item.id !== categoryId),
          transactions: renameInTransactions(
            state.transactions,
            "category",
            category.name,
            FALLBACK_CATEGORY,
          ),
          budgets: renameInBudgets(state.budgets, category.name, FALLBACK_CATEGORY),
        });

        toast.success(copy.categoryDeleted);
        return nextState;
      });
      return;
    }

    const copy = getFinanceCopy();

    try {
      const response = await financeApi.deleteCategory(categoryId);
      toast.success(response.message || copy.categoryDeleted);
      await get().refreshFinance();
    } catch (error) {
      const message = getErrorMessage(error, copy.financeSyncFailed);
      set({ error: message });
      toast.error(message);
      throw error;
    }
  },

  addAccount: async (name) => {
    if (!isRemoteFinanceEnabled) {
      set((state) => {
        const copy = getFinanceCopy();
        const trimmedName = name.trim();

        if (!trimmedName) {
          toast.error(copy.accountNameRequired);
          return state;
        }

        if (state.accounts.some((item) => item.name === trimmedName)) {
          toast.error(copy.accountExists);
          return state;
        }

        const nextState = persistFinanceState({
          ...state,
          accounts: ensureNamedItem(state.accounts, trimmedName, "account"),
        });

        toast.success(copy.accountAdded);
        return nextState;
      });
      return;
    }

    const copy = getFinanceCopy();
    const trimmedName = name.trim();

    if (!trimmedName) {
      toast.error(copy.accountNameRequired);
      return;
    }

    try {
      const response = await financeApi.addAccount(trimmedName);
      toast.success(response.message || copy.accountAdded);
      await get().refreshFinance();
      return response.data;
    } catch (error) {
      const message = getErrorMessage(error, copy.financeSyncFailed);
      set({ error: message });
      toast.error(message);
      throw error;
    }
  },

  updateAccount: async (accountId, nextName) => {
    if (!isRemoteFinanceEnabled) {
      set((state) => {
        const copy = getFinanceCopy();
        const trimmedName = nextName.trim();
        const currentAccount = state.accounts.find((item) => item.id === accountId);

        if (!currentAccount) {
          return state;
        }

        if (!trimmedName) {
          toast.error(copy.accountNameRequired);
          return state;
        }

        if (
          state.accounts.some(
            (item) => item.name === trimmedName && item.id !== accountId,
          )
        ) {
          toast.error(copy.accountExists);
          return state;
        }

        const nextState = persistFinanceState({
          ...state,
          accounts: sortNamedItems(
            state.accounts.map((item) =>
              item.id === accountId ? { ...item, name: trimmedName } : item,
            ),
          ),
          transactions: renameInTransactions(
            state.transactions,
            "account",
            currentAccount.name,
            trimmedName,
          ),
        });

        toast.success(copy.accountUpdated);
        return nextState;
      });
      return;
    }

    const copy = getFinanceCopy();
    const trimmedName = nextName.trim();

    if (!trimmedName) {
      toast.error(copy.accountNameRequired);
      return;
    }

    try {
      const response = await financeApi.updateAccount(accountId, trimmedName);
      toast.success(response.message || copy.accountUpdated);
      await get().refreshFinance();
      return response.data;
    } catch (error) {
      const message = getErrorMessage(error, copy.financeSyncFailed);
      set({ error: message });
      toast.error(message);
      throw error;
    }
  },

  deleteAccount: async (accountId) => {
    if (!isRemoteFinanceEnabled) {
      set((state) => {
        const copy = getFinanceCopy();
        const account = state.accounts.find((item) => item.id === accountId);

        if (!account || account.name === FALLBACK_ACCOUNT) {
          return state;
        }

        const nextState = persistFinanceState({
          ...state,
          accounts: state.accounts.filter((item) => item.id !== accountId),
          transactions: renameInTransactions(
            state.transactions,
            "account",
            account.name,
            FALLBACK_ACCOUNT,
          ),
        });

        toast.success(copy.accountDeleted);
        return nextState;
      });
      return;
    }

    const copy = getFinanceCopy();

    try {
      const response = await financeApi.deleteAccount(accountId);
      toast.success(response.message || copy.accountDeleted);
      await get().refreshFinance();
    } catch (error) {
      const message = getErrorMessage(error, copy.financeSyncFailed);
      set({ error: message });
      toast.error(message);
      throw error;
    }
  },

  addBudget: async (budgetInput) => {
    if (!isRemoteFinanceEnabled) {
      set((state) => {
        const copy = getFinanceCopy();
        const nextBudget = {
          id: uuidv4(),
          ...normalizeBudgetInput(budgetInput),
        };

        if (
          state.budgets.some(
            (budget) =>
              budget.month === nextBudget.month &&
              budget.category === nextBudget.category,
          )
        ) {
          toast.error(copy.budgetExists);
          return state;
        }

        const nextState = persistFinanceState({
          ...state,
          budgets: [...state.budgets, nextBudget],
          categories: ensureNamedItem(
            state.categories,
            nextBudget.category,
            "category",
          ),
        });

        toast.success(copy.budgetAdded);

        return {
          ...nextState,
          filters: updateFiltersAfterMutation(
            state.filters,
            nextState.transactions,
            nextState.budgets,
            nextBudget.month,
          ),
        };
      });
      return;
    }

    const copy = getFinanceCopy();

    try {
      const payload = normalizeBudgetInput(budgetInput);
      const response = await financeApi.addBudget(payload);
      toast.success(response.message || copy.budgetAdded);
      await get().refreshFinance(payload.month);
      return response.data;
    } catch (error) {
      const message = getErrorMessage(error, copy.financeSyncFailed);
      set({ error: message });
      toast.error(message);
      throw error;
    }
  },

  updateBudget: async (budgetId, budgetInput) => {
    if (!isRemoteFinanceEnabled) {
      set((state) => {
        const copy = getFinanceCopy();
        const normalizedBudget = normalizeBudgetInput(budgetInput);

        if (
          state.budgets.some(
            (budget) =>
              budget.id !== budgetId &&
              budget.month === normalizedBudget.month &&
              budget.category === normalizedBudget.category,
          )
        ) {
          toast.error(copy.budgetExists);
          return state;
        }

        const nextState = persistFinanceState({
          ...state,
          budgets: state.budgets.map((budget) =>
            budget.id === budgetId ? { ...budget, ...normalizedBudget } : budget,
          ),
          categories: ensureNamedItem(
            state.categories,
            normalizedBudget.category,
            "category",
          ),
        });

        toast.success(copy.budgetUpdated);

        return {
          ...nextState,
          filters: updateFiltersAfterMutation(
            state.filters,
            nextState.transactions,
            nextState.budgets,
            normalizedBudget.month,
          ),
        };
      });
      return;
    }

    const copy = getFinanceCopy();

    try {
      const payload = normalizeBudgetInput(budgetInput);
      const response = await financeApi.updateBudget(budgetId, payload);
      toast.success(response.message || copy.budgetUpdated);
      await get().refreshFinance(payload.month);
      return response.data;
    } catch (error) {
      const message = getErrorMessage(error, copy.financeSyncFailed);
      set({ error: message });
      toast.error(message);
      throw error;
    }
  },

  deleteBudget: async (budgetId) => {
    if (!isRemoteFinanceEnabled) {
      set((state) => {
        const copy = getFinanceCopy();
        const nextState = persistFinanceState({
          ...state,
          budgets: state.budgets.filter((budget) => budget.id !== budgetId),
        });

        toast.success(copy.budgetDeleted);

        return {
          ...nextState,
          filters: updateFiltersAfterMutation(
            state.filters,
            nextState.transactions,
            nextState.budgets,
          ),
        };
      });
      return;
    }

    const copy = getFinanceCopy();

    try {
      const response = await financeApi.deleteBudget(budgetId);
      toast.success(response.message || copy.budgetDeleted);
      await get().refreshFinance();
    } catch (error) {
      const message = getErrorMessage(error, copy.financeSyncFailed);
      set({ error: message });
      toast.error(message);
      throw error;
    }
  },
}));