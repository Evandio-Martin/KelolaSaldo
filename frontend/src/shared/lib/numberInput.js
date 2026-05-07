import { readStoredLanguage } from "@/shared/hooks";

const NON_DIGIT_PATTERN = /\D/g;

const getGroupingSeparator = (language) =>
  language === "en" ? "," : ".";

export const sanitizeNumericInput = (value) =>
  String(value ?? "").replace(NON_DIGIT_PATTERN, "");

export const formatGroupedNumberInput = (
  value,
  language = readStoredLanguage(),
) => {
  const digits = sanitizeNumericInput(value);

  if (!digits) {
    return "";
  }

  return digits.replace(
    /\B(?=(\d{3})+(?!\d))/g,
    getGroupingSeparator(language),
  );
};

export const parseGroupedNumberInput = (value) => {
  const digits = sanitizeNumericInput(value);
  return digits ? Number(digits) : 0;
};