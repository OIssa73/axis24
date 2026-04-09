// Importation des outils React de base
import { useState, useEffect } from "react";
// Importation de tous les composants qui forment les différentes sections de la page d'accueil
import Navbar from "@/components/Navbar"; // Menu de navigation
import HeroSection from "@/components/HeroSection"; // Section de bienvenue (Bannière)
import RecentSection from "@/components/RecentSection"; // Section des dernières actus
import ExternalNewsWidget from "@/components/ExternalNewsWidget"; // Actualités externes (Radio France, etc.)
import NewsSection from "@/components/NewsSection"; // Nos actualités (Articles)
import JournalistsSection from "@/components/JournalistsSection"; // Présentation des journalistes
import TVSection from "@/components/TVSection"; // Section Vidéo / TV
import RadioSection from "@/components/RadioSection"; // Section Radio
import SportsSection from "@/components/SportsSection"; // Section Sports
import JobsSection from "@/components/JobsSection"; // Section Offres d'emploi
import AdsWidget from "@/components/AdsWidget"; // Widget publicitaire
import Footer from "@/components/Footer"; // Pied de page
// Importation de la connexion à la base de données
import { supabase } from "@/integrations/supabase/client";

// Définition des interrupteurs pour activer/désactiver des sections
interface Sections {
  hero: boolean;
  external_news: boolean;
  internal_news: boolean;
  journalists: boolean;
  tv: boolean;
  radio: boolean;
  sports?: boolean;
  jobs?: boolean;
}

// Structure pour un titre et un sous-titre de section
interface SectionTitle {
  title: string;
  subtitle: string;
}

// Liste de tous les titres de sections modifiables
interface SectionTitles {
  news: SectionTitle;
  journalists: SectionTitle;
  tv: SectionTitle;
  radio: SectionTitle;
  sports: SectionTitle;
  jobs: SectionTitle;
}

// Titres par défaut (si rien n'est configuré dans la base de données)
const defaultTitles: SectionTitles = {
  news: { title: "LE MAG AXIS24", subtitle: "Toute l'information décryptée pour vous." },
  sports: { title: "Axis 24 SPORTS", subtitle: "Toute l'actualité sportive en direct." },
  jobs: { title: "JOBS ET OFFRES D'EMPLOI", subtitle: "Découvrez nos offres d'emploi et opportunités de carrière." },
  journalists: { title: "NOS JOURNALISTES", subtitle: "Ces visages vous accompagnent dans le choix de l'information." },
  tv: { title: "TÉLÉVISION AXIS24", subtitle: "Retrouvez toutes nos émissions et reportages en vidéo." },
  radio: { title: "RADIO AXIS24", subtitle: "Écoutez nos émissions où que vous soyez." },
};

/**
 * Composant INDEX (Page d'Accueil).
 * C'est ici que l'on assemble tous les morceaux du site.
 */
const Index = () => {
  // États pour stocker quelles sections afficher
  const [sections, setSections] = useState<Sections>({
    hero: true,
    external_news: true,
    internal_news: true,
    journalists: true,
    tv: true,
    radio: true,
    sports: true,
    jobs: true,
  });
  
  // État pour stocker les titres personnalisés
  const [titles, setTitles] = useState<SectionTitles>(defaultTitles);
  // État pour savoir si on est encore en train de charger les réglages
  const [loadingSettings, setLoadingSettings] = useState(true);

  // Au chargement de la page, on va chercher les réglages dans la base de données
  useEffect(() => {
    const fetchSettings = async () => {
      const { data } = await supabase
        .from("site_settings")
        .select("*")
        .in("key", ["homepage_sections", "section_titles"]);
      
      if (data) {
        // On récupère l'interrupteur des sections
        const sectionsData = data.find(d => d.key === "homepage_sections");
        if (sectionsData) setSections(sectionsData.value as unknown as Sections);
        
        // On récupère les titres personnalisés
        const titlesData = data.find(d => d.key === "section_titles");
        if (titlesData) setTitles({ ...defaultTitles, ...(titlesData.value as unknown as SectionTitles) });
      }
      setLoadingSettings(false); // Chargement terminé
    };
    fetchSettings();
  }, []);

  // Si on charge encore, on affiche un petit rond qui tourne
  if (loadingSettings) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center">
        <Navbar />
        <div className="w-8 h-8 rounded-full border-4 border-primary/30 border-t-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      
      {/* Petit espace vide pour compenser le menu qui est fixé en haut */}
      <div className="h-16" />

      {/* On affiche chaque section SEULEMENT si son interrupteur est sur "vrai" (true) */}
      {sections.hero && <HeroSection />}
      
      {/* Ajout des Récents en première ligne juste en dessous de la bannière (toujours actif pour les nouveautés) */}
      <RecentSection />
      
      {sections.external_news && <ExternalNewsWidget />}
      
      {/* Widget publicitaire (toujours visible) */}
      <AdsWidget />
      
      {sections.internal_news && <NewsSection title={titles.news.title} subtitle={titles.news.subtitle} />}
      
      {sections.journalists && <JournalistsSection title={titles.journalists.title} subtitle={titles.journalists.subtitle} />}
      
      {sections.tv && <TVSection title={titles.tv.title} subtitle={titles.tv.subtitle} />}

      {sections.sports !== false && <SportsSection title={titles.sports.title} subtitle={titles.sports.subtitle} />}

      {sections.jobs !== false && <JobsSection title={titles.jobs.title} subtitle={titles.jobs.subtitle} />}
      
      {sections.radio && <RadioSection title={titles.radio.title} subtitle={titles.radio.subtitle} />}
      
      <Footer />
    </div>
  );
};

export default Index;
