// Importation des outils de React pour gérer les états et les effets
import { useState, useEffect } from "react";
// Importation de la connexion à la base de données
import { supabase } from "@/integrations/supabase/client";
// Importation des icônes d'interface (Disquette, Loader, Mise en page, Œil)
import { Save, Loader2, Layout, Eye, EyeOff } from "lucide-react";
// Importation de l'outil de notification (Toast)
import { useToast } from "@/hooks/use-toast";

// --- STRUCTURES DES DONNÉES (Types) ---

/** Liste des sections de la page d'accueil pouvant être activées/désactivées */
interface Sections {
  hero: boolean;          // Le grand slider en haut
  external_news: boolean; // Les actualités internationales (Reuters)
  internal_news: boolean; // Les actualités locales (Le Mag Axis24)
  journalists: boolean;   // Présentation de l'équipe
  tv: boolean;            // Section Vidéo/Émissions
  radio: boolean;         // Section Audio/Podcasts
  sports?: boolean;       // Section Sport
  jobs?: boolean;         // Section Emploi
}

/** Structure d'un titre de section (Titre + Petit texte en dessous) */
interface SectionTitle {
  title: string;
  subtitle: string;
}

/** Regroupement de tous les titres modifiables par l'administrateur */
interface SectionTitles {
  news: SectionTitle;
  journalists: SectionTitle;
  tv: SectionTitle;
  radio: SectionTitle;
  sports: SectionTitle;
  jobs: SectionTitle;
}

// Valeurs de texte par défaut
const defaultTitles: SectionTitles = {
  news: { title: "LE MAG AXIS24", subtitle: "Toute l'information décryptée pour vous." },
  sports: { title: "Axis 24 SPORTS", subtitle: "Toute l'actualité sportive en direct." },
  jobs: { title: "JOBS ET OFFRES D'EMPLOI", subtitle: "Découvrez nos offres d'emploi et opportunités de carrière." },
  journalists: { title: "NOS JOURNALISTES", subtitle: "Ces visages vous accompagnent dans le choix de l'information." },
  tv: { title: "TÉLÉVISION AXIS24", subtitle: "Retrouvez toutes nos émissions et reportages en vidéo." },
  radio: { title: "RADIO AXIS24", subtitle: "Écoutez nos émissions où que vous soyez." },
};

/**
 * Composant ADMIN SETTINGS (Configuration de l'Accueil).
 * Permet de masquer/afficher des blocs du site et de changer leurs titres.
 */
const AdminSettings = () => {
  // --- ÉTATS ---
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

  /**
   * Récupère les réglages actuels depuis la table 'site_settings'.
   */
  useEffect(() => {
    const fetchSettings = async () => {
      // On récupère deux clés précises : l'affichage des sections et les titres
      const { data } = await supabase
        .from("site_settings")
        .select("*")
        .in("key", ["homepage_sections", "section_titles"]);
      
      if (data) {
        // Chargement des sections (Vrai/Faux)
        const sectionsData = data.find(d => d.key === "homepage_sections");
        if (sectionsData) setSections(sectionsData.value as unknown as Sections);
        
        // Chargement des titres envoyés (on complète avec les par défaut si besoin)
        const titlesData = data.find(d => d.key === "section_titles");
        if (titlesData) setTitles({ ...defaultTitles, ...(titlesData.value as unknown as SectionTitles) });
      }
      setLoading(false);
    };
    fetchSettings();
  }, []);

  /** Interrupteur pour afficher/masquer une section */
  const handleToggle = (key: keyof Sections) => {
    setSections(prev => ({ ...prev, [key]: !prev[key] }));
  };

  /**
   * Enregistre les modifications en BDD.
   */
  const handleSave = async () => {
    setSaving(true);
    
    // 1. Sauvegarde des visibilités
    const { error: err1 } = await supabase
      .from("site_settings")
      .upsert({ key: "homepage_sections", value: sections as unknown as Record<string, unknown> });
      
    // 2. Sauvegarde des textes (titres/sous-titres)
    const { error: err2 } = await supabase
      .from("site_settings")
      .upsert({ key: "section_titles", value: titles as unknown as Record<string, unknown> });

    if (err1 || err2) {
      toast({ title: "Une erreur est survenue", description: (err1 || err2)?.message, variant: "destructive" });
    } else {
      toast({ title: "Configuration mise à jour !", description: "Les changements sont visibles sur l'accueil." });
    }
    setSaving(false);
  };

  if (loading) return <div className="flex justify-center p-20"><Loader2 className="animate-spin text-primary" size={40} /></div>;

  // Libellés lisibles pour l'interface admin
  const sectionLabels: Record<keyof Sections, string> = {
    hero: "Grande Bannière (Hero Slider)",
    external_news: "Actualités Internationales (Mondiales)",
    internal_news: "Le Mag Axis24 (Actualités Locales)",
    journalists: "Équipe Axis24 (Portraits)",
    tv: "Espace Télévision (Émissions)",
    radio: "Espace Radio (Lecteur Audio)",
    sports: "Axis24 Sports (Rubrique Sport)",
    jobs: "Emplois (Offres & Recrutements)",
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in duration-500">
      <div className="glass-card p-8 bg-white shadow-xl shadow-black/5 dark:bg-card">
        
        {/* --- PARTIE 1 : VISIBILITÉ DES SECTIONS --- */}
        <div className="flex items-center gap-3 border-b border-border pb-4 mb-6">
          <Layout className="text-primary" size={24} />
          <h3 className="text-xl font-display uppercase tracking-widest text-foreground">Visibilité sur l'Accueil</h3>
        </div>

        <p className="text-sm text-muted-foreground italic mb-6">Activez ou désactivez les blocs de la page principale selon vos besoins du moment.</p>

        <div className="space-y-4">
          {(Object.keys(sections) as Array<keyof Sections>).map((key) => (
            <div 
              key={key} 
              className={`flex items-center justify-between p-4 rounded-xl border transition-all cursor-pointer group ${
                sections[key] ? "bg-primary/5 border-primary/20 shadow-sm" : "bg-muted/30 border-border/50 opacity-50"
              }`}
              onClick={() => handleToggle(key)}
            >
              <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${sections[key] ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground"}`}>
                  {sections[key] ? <Eye size={18} /> : <EyeOff size={18} />}
                </div>
                <span className={`font-semibold tracking-tight ${sections[key] ? "text-foreground" : "text-muted-foreground"}`}>
                  {sectionLabels[key]}
                </span>
              </div>
              
              {/* Le bouton switch visuel */}
              <div className={`w-11 h-6 rounded-full relative transition-colors ${sections[key] ? "bg-primary" : "bg-muted"}`}>
                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm transition-all ${sections[key] ? "left-6" : "left-1"}`} />
              </div>
            </div>
          ))}
        </div>

        {/* --- PARTIE 2 : TEXTES PERSONNALISÉS --- */}
        <div className="pt-12 border-t border-border mt-10">
          <div className="flex items-center gap-3 pb-4 mb-6">
            <Layout className="text-secondary" size={24} />
            <h3 className="text-xl font-display uppercase tracking-widest text-foreground font-medium">Textes des Sections</h3>
          </div>
          <p className="text-sm text-muted-foreground italic mb-8">Personnalisez les Titres et Sous-titres affichés au-dessus de chaque rubrique.</p>

          <div className="grid gap-8">
            {(Object.keys(titles) as Array<keyof SectionTitles>).map((key) => (
              <div key={`title-${key}`} className="p-5 rounded-2xl border bg-muted/20 border-border/50 shadow-inner">
                <h4 className="font-bold tracking-widest text-primary uppercase mb-4 text-[11px] bg-white dark:bg-background inline-block px-3 py-1 rounded-full border border-border">
                  {sectionLabels[key as keyof Sections]?.split('(')[0] || key}
                </h4>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest block ml-1">Titre principal</label>
                    <input 
                      type="text" 
                      value={titles[key].title} 
                      onChange={(e) => setTitles(prev => ({ ...prev, [key]: { ...prev[key], title: e.target.value } }))}
                      className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-secondary/50 transition-all"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest block ml-1">Sous-titre / Slogan</label>
                    <input 
                      type="text" 
                      value={titles[key].subtitle} 
                      onChange={(e) => setTitles(prev => ({ ...prev, [key]: { ...prev[key], subtitle: e.target.value } }))}
                      className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-secondary/50 transition-all"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bouton de sauvegarde sticky-like en bas du composant */}
        <div className="pt-10">
          <button 
            onClick={handleSave} 
            disabled={saving}
            className="w-full btn-primary-glow py-5 rounded-xl font-bold uppercase tracking-widest flex items-center justify-center gap-3 disabled:opacity-50 text-white shadow-lg"
          >
            {saving ? <Loader2 className="animate-spin" size={22} /> : <Save size={22} />}
            Enregistrer la configuration globale
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminSettings;
