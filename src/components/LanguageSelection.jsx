import React from "react";
import Form from "react-bootstrap/Form";
import { use } from "react";
import { useTranslation } from "react-i18next";
import { UIPreferencesContext } from "../contexts/UIPreferencesContext";
import { languages } from "../locales";

export function LanguageSelection() {
  const { t } = useTranslation();
  const { language, setLanguage } = use(UIPreferencesContext);

  return (
    <Form.Select
      aria-label={t("navigation:language")}
      title={t("navigation:selectLanguage")}
      value={language || "en"}
      onChange={(event) => setLanguage(event.target.value)}
      size="sm"
    >
      {languages.map((item) => (
        <option key={item.locale} value={item.locale}>
          {item.label}
        </option>
      ))}
    </Form.Select>
  );
}
