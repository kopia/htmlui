import i18n from "i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import { initReactI18next } from "react-i18next";
import { namespaces, resources, supportedLanguages } from "../locales";

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    ns: namespaces,
    defaultNS: "common",
    keySeparator: false,
    supportedLngs: supportedLanguages,
    fallbackLng: "en",
    load: "currentOnly",
    interpolation: { escapeValue: false },
    detection: {
      order: ["localStorage", "navigator"],
      caches: ["localStorage"],
      lookupLocalStorage: "kopia-language",
      convertDetectedLanguage: (language) => (language.toLowerCase().startsWith("pt") ? "pt-BR" : language),
    },
  });

export default i18n;
