import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import Dari from "./Dari.json";
import Pashto from "./Pashto.json";
import English from "./English.json";

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: English },
    ps: { translation: Pashto },
    fa: { translation: Dari },
  },
  lng: "fa",
  fallbackLng: "fa",
  interpolation: { escapeValue: false },
});

export default i18n;
