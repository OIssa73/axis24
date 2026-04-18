import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Save, Info, Loader2 } from "lucide-react";

const AdminAbout = () => {
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const fetchContent = async () => {
      const { data } = await supabase
        .from("site_settings")
        .select("value")
        .eq("key", "about_page_content")
        .maybeSingle();

      if (data && data.value) {
        setContent(data.value as string);
      }
      setLoading(false);
    };

    fetchContent();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from("site_settings")
        .upsert({
          key: "about_page_content",
          value: content
        });

      if (error) throw error;
      toast({ title: "Contenu mis à jour", description: "La page À Propos a été modifiée avec succès."});
    } catch (error: unknown) {
      toast({ title: "Erreur", description: (error as Error).message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-8 text-center animate-pulse text-muted-foreground">Chargement des données...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <Info className="text-primary w-6 h-6" />
        <div>
          <h2 className="text-xl font-display uppercase tracking-widest text-foreground">Gestion de la page À Propos</h2>
          <p className="text-sm text-muted-foreground">Modifiez le texte de présentation et la ligne éditoriale du média.</p>
        </div>
      </div>

      <div className="glass-card p-6 space-y-4">
        <div className="p-4 bg-primary/10 rounded-xl text-sm text-primary mb-6 border border-primary/20">
          <strong className="font-bold uppercase">Guide d'édition :</strong> Utilisez <code>##</code> pour un Titre principal, <code>###</code> pour un Sous-titre, et <code>*</code> au début d'une ligne pour créer une liste à puces. Laissez une ligne vide pour faire un paragraphe.
        </div>

        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={20}
          className="w-full bg-muted border border-border rounded-xl p-6 text-foreground font-mono text-sm focus:ring-2 focus:ring-primary/50 outline-none resize-y"
          placeholder="Rédigez ici le contenu de la page À propos..."
        />

        <div className="flex justify-end pt-4 border-t border-border/50">
          <button
            onClick={handleSave}
            disabled={saving}
            className="btn-primary-glow px-6 py-3 rounded-xl font-bold uppercase tracking-widest flex items-center gap-3 disabled:opacity-50"
          >
            {saving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
            {saving ? "Sauvegarde..." : "Publier les changements"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminAbout;
