import React, { createContext, useContext, useState, ReactNode } from "react";

type Language = "fr" | "en" | "zh" | "ar" | "es" | "ru";

interface Translations {
  [key: string]: {
    [K in Language]: string;
  };
}

const translations: Translations = {
  accueil: { fr: "Accueil", en: "Home", zh: "首页", ar: "الصفحة الرئيسية", es: "Inicio", ru: "Главная" },
  radio: { fr: "Radio", en: "Radio", zh: "广播", ar: "راديو", es: "Radio", ru: "Радио" },
  television: { fr: "Télévision", en: "TV", zh: "电视", ar: "تلفزيون", es: "Televisión", ru: "Телевидение" },
  actualites: { fr: "Actualités", en: "News", zh: "新闻", ar: "أخبار", es: "Noticias", ru: "Новости" },
  images: { fr: "Infos en images", en: "Pic News", zh: "图片新闻", ar: "أخبار بالصور", es: "Noticias en fotos", ru: "Новости в фото" },
  contact: { fr: "Contact", en: "Contact", zh: "联系我们", ar: "اتصل بنا", es: "Contacto", ru: "Контакт" },
  direct: { fr: "EN DIRECT", en: "LIVE", zh: "直播", ar: "مباشر", es: "EN VIVO", ru: "ПРЯМОЙ ЭФИР" },
  journalistes: { fr: "NOS JOURNALISTES", en: "OUR JOURNALISTS", zh: "我们的记者", ar: "صحفيونا", es: "NUESTROS PERIODISTAS", ru: "НАШИ ЖУРНАЛИСТЫ" },
  equipe: { fr: "L'Équipe", en: "The Team", zh: "团队", ar: "الفريق", es: "El Equipo", ru: "Команда" },
  hero_subtitle: { fr: "Radio & Télévision — L'information en continu, où que vous soyez.", en: "Radio & TV — Non-stop information, wherever you are.", zh: "广播与电视 — 无论您在哪里，信息不断。", ar: "راديو وتلفزيون — معلومات لا تتوقف، أينما كنت.", es: "Radio y TV — Información continua, estés donde estés.", ru: "Радио и ТВ — Информация нон-стоп, где бы вы ни были." },
  radio_live: { fr: "Radio en direct", en: "Live Radio", zh: "现场广播", ar: "راديو مباشر", es: "Radio en vivo", ru: "Живое радио" },
  tv_live: { fr: "TV en direct", en: "Live TV", zh: "现场电视", ar: "تلفزيon مباشر", es: "TV en vivo", ru: "Живое ТВ" },
  infos_images: { fr: "Infos en images", en: "News in Pictures", zh: "图片新闻", ar: "أخبار بالصور", es: "Noticias en imágenes", ru: "Новости в картинках" },
  le_mag: { fr: "LE MAG AXIS24", en: "AXIS24 MAG", zh: "AXIS24 杂志", ar: "مجلة AXIS24", es: "EL MAG AXIS24", ru: "МАГ AXIS24" },
  news_desc: { fr: "Toute l'information décryptée pour vous.", en: "All the information decrypted for you.", zh: "为您解读的所有信息。", ar: "كل المعلومات مفككة من أجلك.", es: "Toda la información analizada para ti.", ru: "Вся информация расшифрована для вас." },
  read_more: { fr: "Lire la suite", en: "Read more", zh: "阅读更多", ar: "اقرأ المزيد", es: "Leer más", ru: "Читать далее" },
  view_all: { fr: "Voir tous les articles", en: "View all articles", zh: "查看所有文章", ar: "عرض جميع المقالات", es: "Ver todos los artículos", ru: "Посмотреть все статьи" },
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
