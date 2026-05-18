import React, { createContext, useContext, useEffect, useState } from "react";

const LanguageContext = createContext({ lang: "fr", setLang: () => {}, t: (obj) => obj });

export const LanguageProvider = ({ children }) => {
  const [lang, setLang] = useState(() => {
    const saved = typeof window !== "undefined" ? localStorage.getItem("ps_lang") : null;
    return saved === "en" || saved === "fr" ? saved : "fr";
  });

  useEffect(() => {
    localStorage.setItem("ps_lang", lang);
    document.documentElement.lang = lang;
  }, [lang]);

  const t = (obj) => {
    if (obj == null) return "";
    if (typeof obj === "string") return obj;
    return obj[lang] ?? obj.fr ?? "";
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLang = () => useContext(LanguageContext);
