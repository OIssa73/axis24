// Importation des outils de React pour gérer les formulaires et les effets
import { useState, useEffect } from "react";
// Importation de la connexion à la base de données
import { supabase } from "@/integrations/supabase/client";
// Importation des icônes d'action (Plus, Supprimer, Upload, Utilisateur, Loader, Modifier)
import { Plus, Trash2, Upload, User, Loader2, Edit2 } from "lucide-react";
// Importation de l'outil de notification (Toast)
import { useToast } from "@/hooks/use-toast";
// Importation du composant de barre de progression
import { Progress } from "@/components/ui/progress";
// Importation du recadreur d'image (pour avoir des photos de profil propres)
import ImageCropper from "./ImageCropper";

// Structure d'un Journaliste dans le code
interface Journalist {
  id: string;
  name: string;
  bio?: string;
  image_url: string;
  created_at: string;
}

/**
 * Composant ADMIN JOURNALISTS (Gestion de l'équipe).
 * Permet d'ajouter des membres à l'équipe Axis24 avec photo et bio.
 */
const AdminJournalists = () => {
  // --- ÉTATS ---
  const [journalists, setJournalists] = useState<Journalist[]>([]);
  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [file, setFile] = useState<File | null>(null); // Photo recadrée prête à être envoyée
  const [editingId, setEditingId] = useState<string | null>(null); // ID si on est en mode modification
  const [cropImageSrc, setCropImageSrc] = useState<string | null>(null); // Source de l'image à recadrer
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const { toast } = useToast();

  /**
   * Récupère la liste des journalistes et leurs biographies.
   * Note : Les bios sont stockées dans 'site_settings' pour plus de flexibilité.
   */
  const fetchJournalists = async () => {
    try {
      // 1. On récupère les journalistes (Nom + Photo)
      const { data: journalistsData, error: jError } = await supabase.from("journalists").select("*").order("created_at", { ascending: false });
      if (jError) throw jError;
      
      // 2. On récupère les bios dans les réglages du site
      const { data: settingsData } = await supabase
        .from("site_settings")
        .select("value")
        .eq("key", "journalists_bios")
        .maybeSingle();
      
      const bios = (settingsData?.value || {}) as Record<string, string>;

      if (journalistsData) {
        // 3. On fusionne les infos pour chaque journaliste
        const merged = journalistsData.map(j => ({
          ...j,
          bio: bios[j.id] || ""
        }));
        setJournalists(merged as Journalist[]);
      }
    } catch (error: any) {
      toast({ title: "Erreur de chargement", description: error.message, variant: "destructive" });
    }
  };

  /**
   * Chargement initial.
   */
  useEffect(() => { fetchJournalists(); }, []);

  /**
   * Déclenché quand l'utilisateur choisit une photo. 
   * Ouvre l'outil de recadrage au lieu de l'envoyer directement.
   */
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const reader = new FileReader();
      reader.addEventListener("load", () => {
        setCropImageSrc(reader.result?.toString() || ""); // On passe l'image au recadreur
      });
      reader.readAsDataURL(e.target.files[0]);
      e.target.value = ""; // Reset de l'input pour pouvoir choisir la même image plus tard
    }
  };

  /**
   * Reçoit l'image une fois qu'elle a été recadrée.
   */
  const handleCropSubmit = (croppedBlob: Blob) => {
    const croppedFile = new File([croppedBlob], `cropped-${Date.now()}.jpg`, { type: "image/jpeg" });
    setFile(croppedFile); // Le fichier est maintenant prêt pour l'upload
    setCropImageSrc(null); // On ferme le recadreur
  };

  /**
   * Enregistre le journaliste (Création ou Modification).
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;
    
    // Si c'est un nouveau, la photo est obligatoire
    if (!editingId && !file) {
      toast({ title: "Photo manquante", description: "Veuillez choisir une photo pour le journaliste.", variant: "destructive" });
      return;
    }

    setUploading(true);
    setProgress(10);

    try {
      let publicUrl = editingId ? journalists.find(j => j.id === editingId)?.image_url : "";

      // 1. Si une nouvelle photo a été choisie, on l'envoie sur le serveur
      if (file) {
        const fileExt = file.name.split('.').pop();
        const filePath = `journalists/${Math.random()}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from("media")
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        setProgress(60);
        const { data } = supabase.storage.from("media").getPublicUrl(filePath);
        publicUrl = data.publicUrl;
      }

      // 2. Mise à jour ou insertion dans la table 'journalists'
      let newId = editingId;
      if (editingId) {
        const { error } = await supabase.from("journalists").update({
          name,
          image_url: publicUrl,
        }).eq("id", editingId);
        if (error) throw error;
      } else {
        const { data, error } = await supabase.from("journalists").insert({
          name,
          image_url: publicUrl,
        }).select("id").single();
        if (error) throw error;
        newId = data.id;
      }

      // 3. Mise à jour de la biographie dans 'site_settings'
      const { data: settingsData } = await supabase
        .from("site_settings")
        .select("value")
        .eq("key", "journalists_bios")
        .maybeSingle();
      
      const currentBios = (settingsData?.value || {}) as Record<string, string>;
      const updatedBios = { ...currentBios, [newId!]: bio };

      await supabase
        .from("site_settings")
        .upsert({ key: "journalists_bios", value: updatedBios as any });

      toast({ 
        title: editingId ? "Journaliste modifié" : "Journaliste ajouté !", 
        description: editingId ? "Les modifications ont été prises en compte." : `${name} a rejoint l'équipe.` 
      });

      // 4. Nettoyage du formulaire
      cancelEdit();
      fetchJournalists();
    } catch (error: any) {
      toast({ title: "Erreur", description: error.message || "Une erreur est survenue.", variant: "destructive" });
    } finally {
      setProgress(100);
      setTimeout(() => {
        setUploading(false);
        setProgress(0);
      }, 500);
    }
  };

  /**
   * Retire un journaliste de l'équipe.
   */
  const deleteJournalist = async (id: string) => {
    if (!confirm("Supprimer ce journaliste de l'équipe ?")) return;
    try {
      const { error } = await supabase.from("journalists").delete().eq("id", id);
      if (error) throw error;
      
      // On retire aussi sa bio
      const { data: settingsData } = await supabase.from("site_settings").select("value").eq("key", "journalists_bios").maybeSingle();
      if (settingsData?.value) {
        const bios = settingsData.value as Record<string, string>;
        delete bios[id];
        await supabase.from("site_settings").upsert({ key: "journalists_bios", value: bios as any });
      }

      toast({ title: "Journaliste retiré", description: "L'équipe a été mise à jour." });
      fetchJournalists();
    } catch (error: any) {
      toast({ title: "Erreur", description: error.message, variant: "destructive" });
    }
  };

  /**
   * Active le mode modification pour un journaliste précis.
   */
  const startEdit = (j: Journalist) => {
    setName(j.name);
    setBio(j.bio || "");
    setEditingId(j.id);
    setFile(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const cancelEdit = () => {
    setName("");
    setBio("");
    setEditingId(null);
    setFile(null);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      
      {/* Fenêtre de recadrage d'image (apparaît si on choisit un fichier) */}
      {cropImageSrc && (
        <ImageCropper 
          imageSrc={cropImageSrc} 
          onCropSubmit={handleCropSubmit} 
          onCancel={() => setCropImageSrc(null)} 
        />
      )}
      
      {/* --- FORMULAIRE --- */}
      <div className="glass-card p-6 bg-white shadow-xl shadow-black/5 dark:bg-card">
        <h3 className="text-xl font-display uppercase tracking-widest text-primary mb-6 flex items-center gap-2">
          <User size={20} /> {editingId ? "Modifier les informations" : "Ajouter un nouveau membre"}
        </h3>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Nom */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block">Nom et Prénom</label>
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

            {/* Bio */}
            <div className="space-y-2 md:col-span-2">
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block">Biographie / Poste occupé</label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Ex: Rédacteur en chef, expert en géopolitique..."
                rows={3}
                className="w-full bg-muted border border-border rounded-lg px-4 py-3 text-foreground focus:ring-2 focus:ring-primary/50 outline-none transition-all resize-none"
              />
            </div>

            {/* Photo */}
            <div className="space-y-2 md:col-span-2">
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block">
                Photo de profil (Format 3:4 recommandé) 
                {editingId && <span className="text-secondary ml-2 lowercase font-normal italic">(Laissez vide pour garder l'ancienne photo)</span>}
              </label>
              <div className="relative border-2 border-dashed border-border/50 rounded-xl p-3 hover:border-primary/50 transition-all group min-h-[50px] flex items-center justify-center">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="absolute inset-0 opacity-0 cursor-pointer z-10"
                />
                <div className="flex items-center gap-3 text-muted-foreground group-hover:text-primary transition-colors">
                  <Upload size={18} />
                  <span className="text-sm font-medium truncate max-w-[200px]">{file ? "Photo sélectionnée" : "Choisir et recadrer une photo"}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Barre de progression pendant l'envoi */}
          {uploading && (
            <div className="space-y-2">
              <Progress value={progress} className="h-1.5" />
              <p className="text-[10px] text-center text-muted-foreground animate-pulse tracking-widest uppercase">Synchronisation avec le serveur...</p>
            </div>
          )}

          <div className="flex gap-4">
            {editingId && (
              <button 
                type="button" 
                onClick={cancelEdit}
                className="w-1/3 px-4 py-3 rounded-xl border border-border text-foreground hover:bg-muted font-bold uppercase tracking-widest transition-colors"
              >
                Annuler
              </button>
            )}
            <button 
              type="submit" 
              disabled={uploading}
              className="flex-1 btn-primary-glow h-14 rounded-xl font-bold uppercase tracking-widest flex items-center justify-center gap-3 disabled:opacity-50 text-white shadow-lg"
            >
              {uploading ? <Loader2 className="animate-spin" size={20} /> : <Plus size={20} />}
              {editingId ? "Mettre à jour" : "Valider l'inscription"}
            </button>
          </div>
        </form>
      </div>

      {/* --- LISTE DES JOURNALISTES ACTUELS --- */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {journalists.map((j) => (
          <div key={j.id} className="glass-card p-4 flex items-center gap-4 group hover:border-primary/30 transition-all bg-white dark:bg-card">
            <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-primary/20 bg-muted shrink-0 shadow-inner">
              <img src={j.image_url} alt={j.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-normal tracking-wide text-foreground truncate">{j.name}</h4>
              <p className="text-[10px] text-muted-foreground uppercase tracking-tighter">Équipe de rédaction Axis24</p>
            </div>
            <div className="flex gap-1">
              <button
                onClick={() => startEdit(j)}
                className="p-2 rounded-lg hover:bg-primary/10 text-muted-foreground hover:text-primary transition-colors"
                title="Modifier"
              >
                <Edit2 size={16} />
              </button>
              <button
                onClick={() => deleteJournalist(j.id)}
                className="p-2 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                title="Supprimer de l'équipe"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}
        
        {/* Affichage si l'équipe est vide */}
        {journalists.length === 0 && !uploading && (
          <div className="col-span-full py-20 text-center text-muted-foreground glass-card border-dashed bg-muted/5 opacity-60">
            <User className="mx-auto mb-4 opacity-20" size={48} />
            <p className="text-sm uppercase tracking-widest font-medium italic">Aucun journaliste enregistré pour le moment.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminJournalists;
