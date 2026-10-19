
import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import esCommon from "./locales/es/common.json";
import enCommon from "./locales/en/common.json";

import esAuth from "./locales/es/auth.json";
import enAuth from "./locales/en/auth.json";

import esDocuments from "./locales/es/documents.json";
import enDocuments from "./locales/en/documents.json";

import esUsers from "./locales/es/users.json";
import enUsers from "./locales/en/users.json";

import esAccess from "./locales/es/access.json";
import enAccess from "./locales/en/access.json";

const savedLanguage = localStorage.getItem("sigsm-language");

i18n.use(initReactI18next).init({
  resources: {
    es: {
      common: esCommon,
      auth: esAuth,
      documents: esDocuments,
      users: esUsers,
      access: esAccess,
    },
    en: {
      common: enCommon,
      auth: enAuth,
      documents: enDocuments,
      users: enUsers,
       access: enAccess,
    },
  },

  lng: savedLanguage || "es",
  fallbackLng: "es",
  supportedLngs: ["es", "en"],

  defaultNS: "common",

  interpolation: {
    escapeValue: false,
  },
});

export default i18n;
