import { createContext, useContext, useEffect, useState } from "react";
import PropTypes from "prop-types";

const LanguageContext = createContext(null);

const LANGUAGE_STORAGE_KEY = "app-language";
const DEFAULT_LANGUAGE = "id";
const SUPPORTED_LANGUAGES = ["id", "en"];

export const readStoredLanguage = () => {
  if (typeof window === "undefined") {
    return DEFAULT_LANGUAGE;
  }

  const storedLanguage = window.localStorage.getItem(LANGUAGE_STORAGE_KEY);

  return SUPPORTED_LANGUAGES.includes(storedLanguage)
    ? storedLanguage
    : DEFAULT_LANGUAGE;
};

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState(readStoredLanguage);

  useEffect(() => {
    window.localStorage.setItem(LANGUAGE_STORAGE_KEY, language);
    document.documentElement.setAttribute("lang", language);
  }, [language]);

  return (
    <LanguageContext.Provider value={{ language, setLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
};

LanguageProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);

  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }

  return context;
};