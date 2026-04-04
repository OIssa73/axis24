import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Save, Loader2, Layout, Eye, EyeOff } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

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

const AdminSettings = () => {
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
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

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
      setLoading(false);
    };
    fetchSettings();
  }, []);

  const handleToggle = (key: keyof Sections) => {
    setSections(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSave = async () => {
    setSaving(true);
    const { error: err1 } = await supabase
      .from("site_settings")
      .upsert({ key: "homepage_sections", value: sections as unknown as Record<string, boolean> });
      
    const { error: err2 } = await supabase
      .from("site_settings")
      .upsert({ key: "section_titles", value: titles as unknown as Record<string, any> });

    if (err1 || err2) {
      toast({ title: "Erreur", description: (err1 || err2)?.message, variant: "destructive" });
    } else {
      toast({ title: "Paramètres enregistrés", description: "L'affichage de la page d'accueil a été mis à jour." });
    }
    setSaving(false);
  };

  if (loading) return <div className="flex justify-center p-20"><Loader2 className="animate-spin text-primary" size={40} /></div>;

  const sectionLabels: Record<keyof Sections, string> = {
    hero: "Bannière principale (Hero Slider)",
    external_news: "Infos à Chaud (Internationales)",
    internal_news: "Le Mag Axis24 (Actualités)",
    journalists: "Équipe Axis24 (Journalistes)",
    tv: "Espace Télévision (Replays)",
    radio: "Espace Radio (Podcasts)",
    sports: "Axis24 Sports (Contenus sportifs)",
    jobs: "Jobs & Carrières (Offres d'emploi)",
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="glass-card p-8 space-y-8">
        <div className="flex items-center gap-3 border-b border-border pb-4">
          <Layout className="text-primary" size={24} />
          <h3 className="text-xl font-display uppercase tracking-widest text-foreground">Configuration de l'Accueil</h3>
        </div>

        <p className="text-sm text-muted-foreground italic">Cochez les sections que vous souhaitez afficher sur la page d'accueil du site.</p>

        <div className="space-y-4">
          {(Object.keys(sections) as Array<keyof Sections>).map((key) => (
            <div 
              key={key} 
              className={`flex items-center justify-between p-4 rounded-xl border transition-all cursor-pointer ${
                sections[key] ? "bg-primary/5 border-primary/20 shadow-sm shadow-primary/5" : "bg-muted/30 border-border/50 opacity-60"
              }`}
              onClick={() => handleToggle(key)}
            >
              <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${sections[key] ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground"}`}>
                  {sections[key] ? <Eye size={18} /> : <EyeOff size={18} />}
                </div>
                <span className={`font-semibold ${sections[key] ? "text-foreground" : "text-muted-foreground"}`}>
                  {sectionLabels[key]}
                </span>
              </div>
              
              <div className={`w-12 h-6 rounded-full relative transition-colors ${sections[key] ? "bg-primary" : "bg-muted"}`}>
                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${sections[key] ? "left-7" : "left-1"}`} />
              </div>
            </div>
          ))}
        </div>

        {/* Dynamic Titles Configuration */}
        <div className="pt-8 border-t border-border">
          <div className="flex items-center gap-3 pb-4">
            <Layout className="text-secondary" size={24} />
            <h3 className="text-xl font-display uppercase tracking-widest text-foreground">Personnalisation des Textes d'Accueil</h3>
          </div>
          <p className="text-sm text-muted-foreground italic mb-6">Modifiez les titres et sous-titres encadrant vos sections sur la page principale.</p>

          <div className="grid gap-6">
            {(Object.keys(titles) as Array<keyof SectionTitles>).map((key) => (
              <div key={`title-${key}`} className="p-4 rounded-xl border bg-muted/20 border-border/50">
                <h4 className="font-normal tracking-wide text-primary capitalize mb-3 text-sm">{sectionLabels[key as keyof Sections] || key}</h4>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="text-xs text-muted-foreground block mb-1">Titre principal</label>
                    <input 
                      type="text" 
                      value={titles[key].title} 
                      onChange={(e) => setTitles(prev => ({ ...prev, [key]: { ...prev[key], title: e.target.value } }))}
                      className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-secondary/50"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground block mb-1">Sous-titre / Description</label>
                    <input 
                      type="text" 
                      value={titles[key].subtitle} 
                      onChange={(e) => setTitles(prev => ({ ...prev, [key]: { ...prev[key], subtitle: e.target.value } }))}
                      className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-secondary/50"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="pt-6">
          <button 
            onClick={handleSave} 
            disabled={saving}
            className="w-full btn-primary-glow py-4 rounded-xl font-bold uppercase tracking-widest flex items-center justify-center gap-3 disabled:opacity-50"
          >
            {saving ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
            Enregistrer les modifications
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminSettings;
