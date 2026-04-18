/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useState, ReactNode } from "react";

// On définit les langues supportées par le site : Français et Anglais
type Language = "fr" | "en";

// Structure qui contient tous les mots traduits du site
interface Translations {
  [key: string]: {
    [K in Language]: string;
  };
}

// Dictionnaire de traduction (clé de traduction : { fr: "version française", en: "version anglaise" })
const translations: Translations = {
  accueil: { fr: "Accueil", en: "Home" },
  radio: { fr: "Radio", en: "Radio" },
  television: { fr: "Télévision", en: "TV" },
  actualites: { fr: "Actualités", en: "News" },
  images: { fr: "Infos en images", en: "Pic News" },
  contact: { fr: "Contact", en: "Contact" },
  direct: { fr: "Direct", en: "Live" },
  journalistes: { fr: "NOS JOURNALISTES", en: "OUR JOURNALISTS" },
  equipe: { fr: "L'Équipe", en: "The Team" },
  hero_subtitle: { fr: "Radio & Télévision — L'information en continu, où que vous soyez.", en: "Radio & TV — Non-stop information, wherever you are." },
  radio_live: { fr: "Radio & Podcasts", en: "Radio & Podcasts" },
  tv_live: { fr: "TV en direct", en: "Live TV" },
  infos_images: { fr: "Infos en images", en: "News in Pictures" },
  le_mag: { fr: "LE MAG AXIS24", en: "AXIS24 MAG" },
  news_desc: { fr: "Toute l'information décryptée pour vous.", en: "All the information decrypted for you." },
  read_more: { fr: "Lire la suite", en: "Read more" },
  view_all: { fr: "Voir tous les articles", en: "View all articles" },
  plus: { fr: "Plus", en: "More" },
  sports: { fr: "Sports", en: "Sports" },
  emploi: { fr: "Jobs & Emploi", en: "Jobs" },
  espace_pub: { fr: "Espace Publicitaire", en: "Advertising Space" },
  partenaires: { fr: "Partenaires", en: "Partners" },
  devenir_partenaire: { fr: "Devenir Partenaire", en: "Become a Partner" },
  "LE MAG AXIS24": { fr: "LE MAG AXIS24", en: "AXIS24 MAG" },
  "Toute l'information décryptée pour vous.": { fr: "Toute l'information décryptée pour vous.", en: "All the information decrypted for you." },
  "Axis 24 SPORTS": { fr: "Axis 24 SPORTS", en: "AXIS 24 SPORTS" },
  "Toute l'actualité sportive en direct.": { fr: "Toute l'actualité sportive en direct.", en: "All sports news live." },
  "JOBS ET OFFRES D'EMPLOI": { fr: "JOBS ET OFFRES D'EMPLOI", en: "JOBS AND CAREER OFFERS" },
  "Découvrez nos offres d'emploi et opportunités de carrière.": { fr: "Découvrez nos offres d'emploi et opportunités de carrière.", en: "Discover our job offers and career opportunities." },
  "NOS JOURNALISTES": { fr: "NOS JOURNALISTES", en: "OUR JOURNALISTS" },
  "Ces visages vous accompagnent dans le choix de l'information.": { fr: "Ces visages vous accompagnent dans le choix de l'information.", en: "These faces guide you through your news choices." },
  "TÉLÉVISION AXIS24": { fr: "TÉLÉVISION AXIS24", en: "AXIS24 TELEVISION" },
  "Retrouvez toutes nos émissions et reportages en vidéo.": { fr: "Retrouvez toutes nos émissions et reportages en vidéo.", en: "Find all our shows and video reports." },
  "RADIO AXIS24": { fr: "RADIO AXIS24", en: "AXIS24 RADIO" },
  "Écoutez nos émissions où que vous soyez.": { fr: "Écoutez nos émissions où que vous soyez.", en: "Listen to our shows wherever you are." },
  "Faites défiler pour voir toute l'équipe": { fr: "Faites défiler pour voir toute l'équipe", en: "Scroll to see the full team" },
  "Aucun contenu sportif.": { fr: "Aucun contenu sportif.", en: "No sports content." },
  "Emploi": { fr: "Emploi", en: "Jobs" },
  "Aucune offre d'emploi pour le moment.": { fr: "Aucune offre d'emploi pour le moment.", en: "No job offers at the moment." },
  "POSTULER": { fr: "POSTULER", en: "APPLY" },
  "© 2026 AXIS24 Media Groupe. Tous droits réservés.": { fr: "© 2026 AXIS24 Media Groupe. Tous droits réservés.", en: "© 2026 AXIS24 Media Groupe. All rights reserved." },
};

// Interface décrivant les fonctions que le système de langue met à disposition de tout le site
interface LanguageContextType {
  language: Language; // La langue actuelle ("fr" ou "en")
  setLanguage: (lang: Language) => void; // Fonction pour changer la langue
  t: (key: string) => string; // Fonction "t" pour traduire un mot via sa clé
}

// Création du "contexte" (le canal de diffusion de l'information de langue)
const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

/**
 * Le Fournisseur de Langue (LanguageProvider).
 * Il entoure toute l'application pour que chaque bouton ou texte puisse savoir 
 * s'il doit s'afficher en Français ou en Anglais.
 */
export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  // On initialise la langue en regardant si un cookie de traduction existe déjà
  const [language, setLanguage] = useState<Language>(() => {
    try {
      const match = document.cookie.match(/googtrans=\/fr\/(en|fr)/);
      if (match) return match[1] as Language;
    } catch (e) { /* ignore */ }
    return "fr"; // Par défaut, le site est en Français
  });

  /**
   * Effet qui se déclenche quand on change la langue.
   * Il communique avec l'outil de traduction externe (Google Translate) pour
   * traduire les textes qui ne sont pas dans notre dictionnaire local.
   */
  React.useEffect(() => {
    if (language === "fr") return; // Si c'est en français, on ne fait rien de spécial

    const triggerTranslate = () => {
      try {
        // On cherche le sélecteur caché de Google Translate et on simule un clic
        const select = document.querySelector('.goog-te-combo') as HTMLSelectElement | null;
        if (select) {
          select.dispatchEvent(new Event('change'));
        }
      } catch (e) { /* ignore */ }
    };

    // On attend un court instant que la page soit prête avant de déclencher la traduction
    setTimeout(triggerTranslate, 500);

  }, [language]);

  /**
   * La fonction magique "t" (translate).
   * Si vous lui donnez "accueil", elle renverra "Accueil" en FR ou "Home" en EN.
   */
  const t = (key: string) => {
    return translations[key]?.[language] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

/**
 * Crochet (Hook) personnalisé pour utiliser facilement la langue dans n'importe quel composant.
 */
export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) throw new Error("useLanguage must be used within a LanguageProvider");
  return context;
};
