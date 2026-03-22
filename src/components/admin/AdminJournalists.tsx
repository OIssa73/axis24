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
    const { data } = await supabase.from("journalists").select("*").order("created_at", { ascending: false });
    if (data) setJournalists(data as Journalist[]);
  };

  useEffect(() => { fetchJournalists(); }, []);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !file) return;

    setUploading(true);
    setProgress(10);

    const fileExt = file.name.split('.').pop();
    const filePath = `journalists/${Math.random()}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from("media")
      .upload(filePath, file);

    if (uploadError) {
      toast({ title: "Erreur d'upload", description: uploadError.message, variant: "destructive" });
      setUploading(false);
      return;
    }

    setProgress(60);
    const { data: { publicUrl } } = supabase.storage.from("media").getPublicUrl(filePath);

    const { error } = await supabase.from("journalists").insert({
      name,
      image_url: publicUrl,
    });

    if (error) {
      toast({ title: "Erreur", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Journaliste ajouté", description: `${name} fait maintenant partie de l'équipe.` });
      setName("");
      setFile(null);
      fetchJournalists();
    }
    
    setProgress(100);
    setTimeout(() => {
      setUploading(false);
      setProgress(0);
    }, 500);
  };

  const deleteJournalist = async (id: string) => {
    const { error } = await supabase.from("journalists").delete().eq("id", id);
    if (error) {
      toast({ title: "Erreur", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Supprimé", description: "Le journaliste a été retiré de l'équipe." });
      fetchJournalists();
    }
  };

  return (
    <div className="space-y-8">
      <form onSubmit={handleUpload} className="glass-card p-6 space-y-4 max-w-xl mx-auto">
        <h3 className="text-lg font-display uppercase tracking-widest text-primary mb-2">Ajouter un Journaliste</h3>
        
        <div className="space-y-4">
          <div>
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1.5 block">Nom complet</label>
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

          <div>
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1.5 block">Photo de profil</label>
            <div className="relative border-2 border-dashed border-border/50 rounded-xl p-4 hover:border-primary/50 transition-all group">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                className="absolute inset-0 opacity-0 cursor-pointer"
                required
              />
              <div className="flex flex-col items-center gap-2 text-muted-foreground group-hover:text-primary transition-colors">
                <Upload size={24} />
                <span className="text-sm font-medium">{file ? file.name : "Cliquez pour choisir une image"}</span>
              </div>
            </div>
          </div>

          {uploading && (
            <div className="space-y-2">
              <Progress value={progress} className="h-1.5" />
              <p className="text-[10px] text-center text-muted-foreground animate-pulse">Enregistrement en cours...</p>
            </div>
          )}

          <button 
            type="submit" 
            disabled={uploading}
            className="w-full btn-primary-glow py-3 rounded-lg font-bold uppercase tracking-widest flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {uploading ? <Loader2 className="animate-spin" size={18} /> : <Plus size={18} />}
            Ajouter à l'équipe
          </button>
        </div>
      </form>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {journalists.map((j) => (
          <div key={j.id} className="glass-card p-4 flex items-center gap-4 group hover:border-primary/30 transition-all">
            <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-primary/20 bg-muted shrink-0">
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
        
        {journalists.length === 0 && (
          <div className="col-span-full py-12 text-center text-muted-foreground glass-card border-dashed">
            Aucun journaliste enregistré pour le moment.
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminJournalists;
