import { axiosInstance } from "@/shared/api";

const getEnvelope = async (request) => {
  const response = await request;
  return response.data;
};

const getData = async (request) => {
  const response = await request;
  return response.data.data;
};

export const financeApi = {
  getTransactions: async (params = {}) =>
    getData(axiosInstance.get("/finance/transactions", { params })),

  addTransaction: async (payload) =>
    getEnvelope(axiosInstance.post("/finance/transactions", payload)),

  updateTransaction: async (transactionId, payload) =>
    getEnvelope(axiosInstance.patch(`/finance/transactions/${transactionId}`, payload)),

  deleteTransaction: async (transactionId) =>
    getEnvelope(axiosInstance.delete(`/finance/transactions/${transactionId}`)),

  getCategories: async () => getData(axiosInstance.get("/finance/categories")),

  addCategory: async (name) =>
    getEnvelope(axiosInstance.post("/finance/categories", { name })),

  updateCategory: async (categoryId, name) =>
    getEnvelope(axiosInstance.patch(`/finance/categories/${categoryId}`, { name })),

  deleteCategory: async (categoryId) =>
    getEnvelope(axiosInstance.delete(`/finance/categories/${categoryId}`)),

  getAccounts: async () => getData(axiosInstance.get("/finance/accounts")),

  addAccount: async (name) =>
    getEnvelope(axiosInstance.post("/finance/accounts", { name })),

  updateAccount: async (accountId, name) =>
    getEnvelope(axiosInstance.patch(`/finance/accounts/${accountId}`, { name })),

  deleteAccount: async (accountId) =>
    getEnvelope(axiosInstance.delete(`/finance/accounts/${accountId}`)),

  getBudgets: async (params = {}) =>
    getData(axiosInstance.get("/finance/budgets", { params })),

  addBudget: async (payload) =>
    getEnvelope(axiosInstance.post("/finance/budgets", payload)),

  updateBudget: async (budgetId, payload) =>
    getEnvelope(axiosInstance.patch(`/finance/budgets/${budgetId}`, payload)),

  deleteBudget: async (budgetId) =>
    getEnvelope(axiosInstance.delete(`/finance/budgets/${budgetId}`)),

  getReports: async (params = {}) =>
    getData(axiosInstance.get("/finance/reports", { params })),
};