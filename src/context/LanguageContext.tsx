import React, { createContext, useContext, useState, ReactNode } from "react";

type Language = "fr" | "en";

interface Translations {
  [key: string]: {
    [K in Language]: string;
  };
}

const translations: Translations = {
  accueil: { fr: "Accueil", en: "Home" },
  radio: { fr: "Radio", en: "Radio" },
  television: { fr: "Télévision", en: "TV" },
  actualites: { fr: "Actualités", en: "News" },
  images: { fr: "Infos en images", en: "Pic News" },
  contact: { fr: "Contact", en: "Contact" },
  direct: { fr: "EN DIRECT", en: "LIVE" },
  journalistes: { fr: "NOS JOURNALISTES", en: "OUR JOURNALISTS" },
  equipe: { fr: "L'Équipe", en: "The Team" },
  hero_subtitle: { fr: "Radio & Télévision — L'information en continu, où que vous soyez.", en: "Radio & TV — Non-stop information, wherever you are." },
  radio_live: { fr: "Radio en direct", en: "Live Radio" },
  tv_live: { fr: "TV en direct", en: "Live TV" },
  infos_images: { fr: "Infos en images", en: "News in Pictures" },
  le_mag: { fr: "LE MAG AXIS24", en: "AXIS24 MAG" },
  news_desc: { fr: "Toute l'information décryptée pour vous.", en: "All the information decrypted for you." },
  read_more: { fr: "Lire la suite", en: "Read more" },
  view_all: { fr: "Voir tous les articles", en: "View all articles" },
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguage] = useState<Language>("fr");

  const t = (key: string) => {
    return translations[key]?.[language] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) throw new Error("useLanguage must be used within a LanguageProvider");
  return context;
};
