import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import ExternalNewsWidget from "@/components/ExternalNewsWidget";
import NewsSection from "@/components/NewsSection";
import JournalistsSection from "@/components/JournalistsSection";
import TVSection from "@/components/TVSection";
import RadioSection from "@/components/RadioSection";
import Footer from "@/components/Footer";
import { supabase } from "@/integrations/supabase/client";

interface Sections {
  hero: boolean;
  external_news: boolean;
  internal_news: boolean;
  journalists: boolean;
  tv: boolean;
  radio: boolean;
}

const Index = () => {
  const [sections, setSections] = useState<Sections>({
    hero: true,
    external_news: true,
    internal_news: true,
    journalists: true,
    tv: true,
    radio: true,
  });

  useEffect(() => {
    const fetchSettings = async () => {
      const { data } = await supabase
        .from("site_settings")
        .select("*")
        .eq("key", "homepage_sections")
        .single();
      
      if (data) {
        setSections(data.value as Sections);
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
      
      {sections.internal_news && <NewsSection />}
      
      {sections.journalists && <JournalistsSection />}
      
      {sections.tv && <TVSection />}
      
      {sections.radio && <RadioSection />}
      
      <Footer />
    </div>
  );
};

export default Index;
