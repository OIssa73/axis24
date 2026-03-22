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
}

const AdminSettings = () => {
  const [sections, setSections] = useState<Sections>({
    hero: true,
    external_news: true,
    internal_news: true,
    journalists: true,
    tv: true,
    radio: true,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

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
      setLoading(false);
    };
    fetchSettings();
  }, []);

  const handleToggle = (key: keyof Sections) => {
    setSections(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSave = async () => {
    setSaving(true);
    const { error } = await supabase
      .from("site_settings")
      .upsert({ key: "homepage_sections", value: sections });

    if (error) {
      toast({ title: "Erreur", description: error.message, variant: "destructive" });
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
