import { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { useLanguage } from "@/shared/hooks";
import {
  formatGroupedNumberInput,
  parseGroupedNumberInput,
} from "@/shared/lib";

const formatTransactionFormValues = (values, language) => ({
  ...values,
  amount: formatGroupedNumberInput(values.amount, language),
});

const createValidationMessage = (form, copy) => {
  if (!form.description.trim()) {
    return copy.descriptionRequired;
  }

  if (!form.category.trim()) {
    return copy.categoryRequired;
  }

  if (!form.account.trim()) {
    return copy.accountRequired;
  }

  if (!form.date) {
    return copy.dateRequired;
  }

  const normalizedAmount = parseGroupedNumberInput(form.amount);

  if (!Number.isFinite(normalizedAmount) || normalizedAmount <= 0) {
    return copy.amountRequired;
  }

  return "";
};

export const TransactionForm = ({
  initialValues,
  mode,
  onSubmit,
  onCancel,
  categoryOptions,
  accountOptions,
}) => {
  const { language } = useLanguage();
  const isEnglish = language === "en";
  const copy = isEnglish
    ? {
        descriptionRequired: "Description is required.",
        categoryRequired: "Category is required.",
        accountRequired: "Account is required.",
        dateRequired: "Date is required.",
        amountRequired: "Amount must be greater than zero.",
        editTitle: "Edit transaction",
        createTitle: "New transaction",
        editDescription: "Update the transaction details and save your changes.",
        createDescription: "Capture income and expenses as they happen.",
        cancel: "Cancel",
        description: "Description",
        descriptionPlaceholder: "Salary, groceries, rent, transfer",
        amount: "Amount",
        amountPlaceholder: "1,000,000",
        type: "Type",
        expense: "Expense",
        income: "Income",
        category: "Category",
        categoryPlaceholder: "Food, salary, transport, and more",
        account: "Account",
        accountPlaceholder: "Main account, savings, cash",
        date: "Date",
        saveChanges: "Save changes",
        addTransaction: "Add transaction",
        closeEditor: "Close editor",
      }
    : {
        descriptionRequired: "Deskripsi wajib diisi.",
        categoryRequired: "Kategori wajib diisi.",
        accountRequired: "Akun wajib diisi.",
        dateRequired: "Tanggal wajib diisi.",
        amountRequired: "Nominal harus lebih besar dari nol.",
        editTitle: "Ubah transaksi",
        createTitle: "Transaksi baru",
        editDescription: "Perbarui detail transaksi lalu simpan perubahan Anda.",
        createDescription: "Catat pemasukan dan pengeluaran saat terjadi.",
        cancel: "Batal",
        description: "Deskripsi",
        descriptionPlaceholder: "Gaji bulanan, belanja, cicilan, dan lain-lain",
        amount: "Nominal",
        amountPlaceholder: "1.000.000",
        type: "Jenis",
        expense: "Pengeluaran",
        income: "Pemasukan",
        category: "Kategori",
        categoryPlaceholder: "Makanan, gaji, transportasi, dan lain-lain",
        account: "Akun",
        accountPlaceholder: "Rekening utama, tabungan, tunai",
        date: "Tanggal",
        saveChanges: "Simpan perubahan",
        addTransaction: "Tambah transaksi",
        closeEditor: "Tutup editor",
      };

  const [form, setForm] = useState(() =>
    formatTransactionFormValues(initialValues, language),
  );
  const [validationMessage, setValidationMessage] = useState("");

  useEffect(() => {
    setForm(formatTransactionFormValues(initialValues, language));
    setValidationMessage("");
  }, [initialValues, language]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    const nextValue =
      name === "amount" ? formatGroupedNumberInput(value, language) : value;

    setForm((currentForm) => ({
      ...currentForm,
      [name]: nextValue,
    }));

    if (validationMessage) {
      setValidationMessage("");
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    const nextValidationMessage = createValidationMessage(form, copy);

    if (nextValidationMessage) {
      setValidationMessage(nextValidationMessage);
      return;
    }

    onSubmit({
      ...form,
      amount: parseGroupedNumberInput(form.amount),
    });
  };

  const isEditing = mode === "edit";

  return (
    <section className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm dark:border-neutral-800 dark:bg-neutral-950">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">
            {isEditing ? copy.editTitle : copy.createTitle}
          </h2>
          <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
            {isEditing ? copy.editDescription : copy.createDescription}
          </p>
        </div>

        {isEditing && (
          <button
            type="button"
            onClick={onCancel}
            className="rounded-xl border border-neutral-300 px-4 py-2 text-sm font-medium transition hover:bg-neutral-100 dark:border-neutral-700 dark:hover:bg-neutral-900"
          >
            {copy.cancel}
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit} className="mt-6 grid gap-4 md:grid-cols-2">
        <label className="md:col-span-2 flex flex-col gap-2 text-sm font-medium text-neutral-600 dark:text-neutral-300">
          {copy.description}
          <input
            name="description"
            value={form.description}
            onChange={handleChange}
            placeholder={copy.descriptionPlaceholder}
            className="rounded-xl border border-neutral-300 bg-white px-4 py-2.5 text-sm text-neutral-900 outline-none transition focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100"
          />
        </label>

        <label className="flex flex-col gap-2 text-sm font-medium text-neutral-600 dark:text-neutral-300">
          {copy.amount}
          <input
            name="amount"
            type="text"
            inputMode="numeric"
            value={form.amount}
            onChange={handleChange}
            placeholder={copy.amountPlaceholder}
            className="rounded-xl border border-neutral-300 bg-white px-4 py-2.5 text-sm text-neutral-900 outline-none transition focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100"
          />
        </label>

        <label className="flex flex-col gap-2 text-sm font-medium text-neutral-600 dark:text-neutral-300">
          {copy.type}
          <select
            name="type"
            value={form.type}
            onChange={handleChange}
            className="rounded-xl border border-neutral-300 bg-white px-4 py-2.5 text-sm text-neutral-900 outline-none transition focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100"
          >
            <option value="expense">{copy.expense}</option>
            <option value="income">{copy.income}</option>
          </select>
        </label>

        <label className="flex flex-col gap-2 text-sm font-medium text-neutral-600 dark:text-neutral-300">
          {copy.category}
          <>
            <input
              name="category"
              value={form.category}
              onChange={handleChange}
              placeholder={copy.categoryPlaceholder}
              list="transaction-category-options"
              className="rounded-xl border border-neutral-300 bg-white px-4 py-2.5 text-sm text-neutral-900 outline-none transition focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100"
            />
            <datalist id="transaction-category-options">
              {categoryOptions.map((category) => (
                <option key={category} value={category} />
              ))}
            </datalist>
          </>
        </label>

        <label className="flex flex-col gap-2 text-sm font-medium text-neutral-600 dark:text-neutral-300">
          {copy.account}
          <>
            <input
              name="account"
              value={form.account}
              onChange={handleChange}
              placeholder={copy.accountPlaceholder}
              list="transaction-account-options"
              className="rounded-xl border border-neutral-300 bg-white px-4 py-2.5 text-sm text-neutral-900 outline-none transition focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100"
            />
            <datalist id="transaction-account-options">
              {accountOptions.map((account) => (
                <option key={account} value={account} />
              ))}
            </datalist>
          </>
        </label>

        <label className="md:col-span-2 flex flex-col gap-2 text-sm font-medium text-neutral-600 dark:text-neutral-300">
          {copy.date}
          <input
            name="date"
            type="date"
            value={form.date}
            onChange={handleChange}
            className="rounded-xl border border-neutral-300 bg-white px-4 py-2.5 text-sm text-neutral-900 outline-none transition focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100"
          />
        </label>

        {validationMessage && (
          <p className="md:col-span-2 text-sm font-medium text-rose-600 dark:text-rose-400">
            {validationMessage}
          </p>
        )}

        <div className="md:col-span-2 flex flex-wrap items-center gap-3 pt-2">
          <button
            type="submit"
            className="rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-violet-700"
          >
            {isEditing ? copy.saveChanges : copy.addTransaction}
          </button>

          {isEditing && (
            <button
              type="button"
              onClick={onCancel}
              className="rounded-xl border border-neutral-300 px-4 py-2.5 text-sm font-medium transition hover:bg-neutral-100 dark:border-neutral-700 dark:hover:bg-neutral-900"
            >
              {copy.closeEditor}
            </button>
          )}
        </div>
      </form>
    </section>
  );
};

TransactionForm.propTypes = {
  initialValues: PropTypes.shape({
    description: PropTypes.string.isRequired,
    category: PropTypes.string.isRequired,
    account: PropTypes.string.isRequired,
    date: PropTypes.string.isRequired,
    type: PropTypes.oneOf(["income", "expense"]).isRequired,
    amount: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  }).isRequired,
  mode: PropTypes.oneOf(["create", "edit"]).isRequired,
  onSubmit: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
  categoryOptions: PropTypes.arrayOf(PropTypes.string).isRequired,
  accountOptions: PropTypes.arrayOf(PropTypes.string).isRequired,
};