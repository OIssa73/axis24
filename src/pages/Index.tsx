import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import ExternalNewsWidget from "@/components/ExternalNewsWidget";
import NewsSection from "@/components/NewsSection";
import JournalistsSection from "@/components/JournalistsSection";
import TVSection from "@/components/TVSection";
import RadioSection from "@/components/RadioSection";
import SportsSection from "@/components/SportsSection";
import JobsSection from "@/components/JobsSection";
import AdsWidget from "@/components/AdsWidget";
import Footer from "@/components/Footer";
import { supabase } from "@/integrations/supabase/client";

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

interface SectionTitle {
  title: string;
  subtitle: string;
}

interface SectionTitles {
  news: SectionTitle;
  journalists: SectionTitle;
  tv: SectionTitle;
  radio: SectionTitle;
  sports: SectionTitle;
  jobs: SectionTitle;
}

const defaultTitles: SectionTitles = {
  news: { title: "LE MAG AXIS24", subtitle: "Toute l'information décryptée pour vous." },
  sports: { title: "Axis 24 SPORTS", subtitle: "Toute l'actualité sportive en direct." },
  jobs: { title: "JOBS ET OFFRES D'EMPLOI", subtitle: "Découvrez nos offres d'emploi et opportunités de carrière." },
  journalists: { title: "NOS JOURNALISTES", subtitle: "Ces visages vous accompagnent dans le choix de l'information." },
  tv: { title: "TÉLÉVISION AXIS24", subtitle: "Retrouvez toutes nos émissions et reportages en vidéo." },
  radio: { title: "RADIO AXIS24", subtitle: "Écoutez nos émissions où que vous soyez." },
};

const Index = () => {
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
  const [titles, setTitles] = useState<SectionTitles>(defaultTitles);

  useEffect(() => {
    const fetchSettings = async () => {
      const { data } = await supabase
        .from("site_settings")
        .select("*")
        .in("key", ["homepage_sections", "section_titles"]);
      
      if (data) {
        const sectionsData = data.find(d => d.key === "homepage_sections");
        if (sectionsData) setSections(sectionsData.value as unknown as Sections);
        
        const titlesData = data.find(d => d.key === "section_titles");
        if (titlesData) setTitles({ ...defaultTitles, ...(titlesData.value as unknown as SectionTitles) });
      }
    };
    fetchSettings();
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      
      {/* Spacer for fixed Navbar */}
      <div className="h-16" />

      {sections.hero && <HeroSection />}
      
      {sections.external_news && <ExternalNewsWidget />}
      
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
