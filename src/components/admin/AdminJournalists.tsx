import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Plus, Trash2, Upload, User, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Progress } from "@/components/ui/progress";

interface Journalist {
  id: string;
  name: string;
  image_url: string;
  created_at: string;
}

const AdminJournalists = () => {
  const [journalists, setJournalists] = useState<Journalist[]>([]);
  const [name, setName] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const { toast } = useToast();

  const fetchJournalists = async () => {
    try {
      const { data, error } = await supabase.from("journalists").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      if (data) setJournalists(data as Journalist[]);
    } catch (error: any) {
      toast({ title: "Erreur de chargement", description: error.message, variant: "destructive" });
    }
  };

  useEffect(() => { fetchJournalists(); }, []);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !file) return;

    setUploading(true);
    setProgress(10);

    try {
      const fileExt = file.name.split('.').pop();
      const filePath = `journalists/${Math.random()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("media")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      setProgress(60);
      const { data: { publicUrl } } = supabase.storage.from("media").getPublicUrl(filePath);

      const { error } = await supabase.from("journalists").insert({
        name,
        image_url: publicUrl,
      });

      if (error) throw error;

      toast({ title: "Journaliste ajouté", description: `${name} fait maintenant partie de l'équipe.` });
      setName("");
      setFile(null);
      fetchJournalists();
    } catch (error: any) {
      toast({ title: "Erreur", description: error.message, variant: "destructive" });
    } finally {
      setProgress(100);
      setTimeout(() => {
        setUploading(false);
        setProgress(0);
      }, 500);
    }
  };

  const deleteJournalist = async (id: string) => {
    try {
      const { error } = await supabase.from("journalists").delete().eq("id", id);
      if (error) throw error;
      toast({ title: "Supprimé", description: "Le journaliste a été retiré de l'équipe." });
      fetchJournalists();
    } catch (error: any) {
      toast({ title: "Erreur", description: error.message, variant: "destructive" });
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="glass-card p-6 bg-white shadow-xl shadow-black/5 dark:bg-card">
        <h3 className="text-xl font-display uppercase tracking-widest text-primary mb-6 flex items-center gap-2">
          <User size={20} /> Ajouter un Journaliste
        </h3>
        
        <form onSubmit={handleUpload} className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block">Nom complet</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ex: Jean Dupont"
                  className="w-full bg-muted border border-border rounded-lg pl-10 pr-4 py-3 text-foreground focus:ring-2 focus:ring-primary/50 outline-none transition-all"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block">Photo de profil</label>
              <div className="relative border-2 border-dashed border-border/50 rounded-xl p-3 hover:border-primary/50 transition-all group min-h-[50px] flex items-center justify-center">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                  className="absolute inset-0 opacity-0 cursor-pointer z-10"
                  required
                />
                <div className="flex items-center gap-3 text-muted-foreground group-hover:text-primary transition-colors">
                  <Upload size={18} />
                  <span className="text-sm font-medium truncate max-w-[200px]">{file ? file.name : "Choisir une image"}</span>
                </div>
              </div>
            </div>
          </div>

          {uploading && (
            <div className="space-y-2">
              <Progress value={progress} className="h-1.5" />
              <p className="text-[10px] text-center text-muted-foreground animate-pulse tracking-widest uppercase">Téléversement en cours...</p>
            </div>
          )}

          <button 
            type="submit" 
            disabled={uploading}
            className="w-full btn-primary-glow h-14 rounded-xl font-bold uppercase tracking-widest flex items-center justify-center gap-3 disabled:opacity-50 text-white shadow-lg"
          >
            {uploading ? <Loader2 className="animate-spin" size={20} /> : <Plus size={20} />}
            Ajouter à l'équipe
          </button>
        </form>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {journalists.map((j) => (
          <div key={j.id} className="glass-card p-4 flex items-center gap-4 group hover:border-primary/30 transition-all bg-white dark:bg-card">
            <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-primary/20 bg-muted shrink-0 shadow-inner">
              <img src={j.image_url} alt={j.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-semibold text-foreground truncate">{j.name}</h4>
              <p className="text-[10px] text-muted-foreground uppercase tracking-tighter">Équipe Axis24</p>
            </div>
            <button
              onClick={() => deleteJournalist(j.id)}
              className="p-2 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
              title="Supprimer"
            >
              <Trash2 size={16} />
            </button>
          </div>
        ))}
        
        {journalists.length === 0 && !uploading && (
          <div className="col-span-full py-20 text-center text-muted-foreground glass-card border-dashed bg-muted/5">
            <User className="mx-auto mb-4 opacity-20" size={48} />
            <p className="text-sm uppercase tracking-widest font-medium">Aucun journaliste enregistré</p>
            <p className="text-xs opacity-60 mt-1">Utilisez le formulaire ci-dessus pour commencer.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminJournalists;
