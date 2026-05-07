import { readStoredLanguage } from "@/shared/hooks/LanguageContext";

const formatterByLanguage = {
  id: {
    currency: new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }),
    monthYear: new Intl.DateTimeFormat("id-ID", {
      month: "long",
      year: "numeric",
    }),
    shortMonthYear: new Intl.DateTimeFormat("id-ID", {
      month: "short",
      year: "numeric",
    }),
    date: new Intl.DateTimeFormat("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    }),
  },
  en: {
    currency: new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }),
    monthYear: new Intl.DateTimeFormat("en-US", {
      month: "long",
      year: "numeric",
    }),
    shortMonthYear: new Intl.DateTimeFormat("en-US", {
      month: "short",
      year: "numeric",
    }),
    date: new Intl.DateTimeFormat("en-US", {
      day: "numeric",
      month: "short",
      year: "numeric",
    }),
  },
};

const getLanguageKey = (language) => (language === "en" ? "en" : "id");
const getFormatterSet = (language) =>
  formatterByLanguage[getLanguageKey(language || readStoredLanguage())];

const createMonthDate = (monthValue) => {
  const [year, month] = monthValue.split("-").map(Number);
  return new Date(year, month - 1, 1);
};

export const formatCurrencyId = (amount = 0, language) =>
  getFormatterSet(language).currency.format(Number(amount) || 0);

export const formatMonthYearId = (
  monthValue,
  fallbackLabel = "Bulan ini",
  language,
) => {
  if (!monthValue) {
    return fallbackLabel;
  }

  return getFormatterSet(language).monthYear.format(createMonthDate(monthValue));
};

export const formatShortMonthYearId = (monthValue, language) => {
  if (!monthValue) {
    return "";
  }

  return getFormatterSet(language).shortMonthYear.format(createMonthDate(monthValue));
};

export const formatDateId = (dateValue, language) => {
  if (!dateValue) {
    return "";
  }

  return getFormatterSet(language).date.format(new Date(`${dateValue}T00:00:00`));
};