import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import languageDetector from 'i18next-browser-languagedetector';
import backend from "i18next-http-backend"

i18n
  .use(backend)
  .use(languageDetector)
  .use(initReactI18next)
  .init({
    fallbackLng: "en-GB",
    ns: ["translation"],
    defaultNS: "translation",
    interpolation: {
      escapeValue: false,
    },
    react:
      { useSuspense: true }
  });

export default i18n;