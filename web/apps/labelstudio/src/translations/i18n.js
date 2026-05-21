import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";
 
import { TRANSLATIONS_TC } from "./tc/translations";
import { TRANSLATIONS_EN } from "./en/translations";
import { TRANSLATIONS_ZH } from "./zh/translations";

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: {
        translation: TRANSLATIONS_EN,
      },
      tc: {
        translation: TRANSLATIONS_TC,
      },
      zh: {
        translation: TRANSLATIONS_ZH,
      },
    },
    fallbackLng: "en",
    react: {
      hashTransKey(defaultValue) {
        return defaultValue;
      },
      defaultTransParent: '', // a valid react element - required before react 16
      transEmptyNodeValue: '', // what to return for empty Trans
      transSupportBasicHtmlNodes: true, // allow <br/> and simple html elements in translations
      transKeepBasicHtmlNodesFor: ['br', 'strong', 'i'],
      transWrapTextNodes: ''
    },
  });


export default i18n;