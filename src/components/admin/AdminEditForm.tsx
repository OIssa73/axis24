// Importation des outils de React pour gérer les formulaires et les effets
import { useState, useEffect } from "react";
// Importation de la connexion à la base de données
import { supabase } from "@/integrations/supabase/client";
// Importation de l'outil de notification (Toast)
import { useToast } from "@/hooks/use-toast";
// Importation des icônes d'action (Enregistrer, Fermer, Charger)
import { Save, X, Upload } from "lucide-react";
// Importation du composant de barre de progression
import { Progress } from "@/components/ui/progress";
import ImageCropper from "./ImageCropper";
import { getWatermarkConfig, applyWatermarkToImage } from "@/utils/watermarkUtils";
import type { WatermarkConfig } from "./AdminWatermark";

// Structure d'une Catégorie
interface Category {
  id: string;
  name: string;
  type: string;
}

// Paramètres reçus par le composant
interface AdminEditFormProps {
  contentId: string; // ID du contenu à modifier
  onCancel: () => void; // Fonction pour annuler
  onSuccess: () => void; // Fonction en cas de succès
}

/**
 * Composant ADMIN EDIT FORM (Formulaire de modification).
 * Permet de changer le titre, la catégorie ou les fichiers d'un contenu déjà existant.
 */
const AdminEditForm = ({ contentId, onCancel, onSuccess }: AdminEditFormProps) => {
  // --- ÉTATS DES DONNÉES (Champs du formulaire) ---
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState<"audio" | "video" | "article" | "image" | "job" | "sport">("audio");
  const [categoryId, setCategoryId] = useState("");
  const [tags, setTags] = useState("");
  const [body, setBody] = useState(""); // Texte long
  const [allowDownload, setAllowDownload] = useState(true);
  const [thumbnailUrl, setThumbnailUrl] = useState(""); // URL de l'image actuelle
  const [fileUrl, setFileUrl] = useState(""); // URL du fichier actuel
  const [removeOldFile, setRemoveOldFile] = useState(false); // Si on veut supprimer l'ancien fichier
  const [removeOldThumbnail, setRemoveOldThumbnail] = useState(false); // Si on veut supprimer l'ancienne miniature
  
  // --- ÉTATS POUR LES NOUVEAUX FICHIERS (Si l'utilisateur veut remplacer l'ancien) ---
  const [newFile, setNewFile] = useState<File | null>(null);
  const [newThumbnail, setNewThumbnail] = useState<File | null>(null);
  const [cropImageSrc, setCropImageSrc] = useState<string | null>(null); // Pour le recadrage
  const [cropTarget, setCropTarget] = useState<"file" | "thumbnail" | null>(null); // Savoir quoi recadrer
  
  // --- ÉTATS DE CHARGEMENT ET RÉUSSITE ---
  const [progress, setProgress] = useState(0);
  const [loading, setLoading] = useState(true); // Chargement des données au début
  const [saving, setSaving] = useState(false); // Pendant l'enregistrement
  const [categories, setCategories] = useState<Category[]>([]);
  
  // Nouveaux états pour le filigrane
  const [watermarkConfig, setWatermarkConfig] = useState<WatermarkConfig | null>(null);
  const [applyWatermark, setApplyWatermark] = useState(true);

  const { toast } = useToast();

  /**
   * Au démarrage, on va chercher les infos actuelles du contenu dans la BDD.
   */
  useEffect(() => {
    const fetchData = async () => {
      // 1. Récupérer toutes les catégories pour le menu déroulant
      const { data: catData } = await supabase.from("categories").select("*");
      if (catData) setCategories(catData as Category[]);

      // 2. Récupérer les détails précis du contenu à modifier
      const { data: contentData } = await supabase
        .from("content")
        .select("*")
        .eq("id", contentId)
        .single();
      
      if (contentData) {
        setTitle(contentData.title);
        setDescription(contentData.description || "");
        setType(contentData.type as "audio" | "video" | "article" | "image" | "job" | "sport");
        setCategoryId(contentData.category_id || "");
        setTags(contentData.tags?.join(", ") || "");
        setBody(contentData.body || "");
        setAllowDownload(contentData.allow_download ?? true);
        setThumbnailUrl(contentData.thumbnail_url || "");
        setFileUrl(contentData.file_url || "");
      }
      
      // 3. Récupérer la conf du watermark
      const config = await getWatermarkConfig();
      setWatermarkConfig(config);
      setApplyWatermark(config ? true : false);

      setLoading(false); // Les données sont prêtes
    };
    fetchData();
  }, [contentId]);

  /**
   * Gère la sélection d'un nouveau fichier (avec limite de 50 Mo).
   */
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, setFileFn: (f: File | null) => void) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      const maxSize = 50 * 1024 * 1024;
      if (selectedFile.size > maxSize) {
        toast({ title: "Fichier trop volumineux", description: "Le maximum autorisé est de 50 Mo.", variant: "destructive" });
        e.target.value = "";
        return;
      }
      
      // Si c'est une image (miniature OU fichier principal de type image), on utilise le recadreur
      if (selectedFile.type.startsWith("image/") && (setFileFn === setNewThumbnail || setFileFn === setNewFile)) {
        const reader = new FileReader();
        reader.addEventListener("load", () => {
          setCropTarget(setFileFn === setNewThumbnail ? "thumbnail" : "file");
          setCropImageSrc(reader.result?.toString() || "");
        });
        reader.readAsDataURL(selectedFile);
        e.target.value = "";
      } else {
        setFileFn(selectedFile);
      }
    }
  };

  /**
   * Action appelée après le recadrage
   */
  const handleCropSubmit = (croppedBlob: Blob) => {
    const croppedFile = new File([croppedBlob], `${cropTarget}-${Date.now()}.jpg`, { type: "image/jpeg" });
    if (cropTarget === "thumbnail") {
      setNewThumbnail(croppedFile);
    } else {
      setNewFile(croppedFile);
    }
    setCropImageSrc(null);
    setCropTarget(null);
  };

  /**
   * Envoie un fichier vers le stockage Supabase.
   */
  const uploadFile = async (file: File, path: string) => {
    const { data, error } = await supabase.storage.from("media").upload(path, file);
    if (error) throw error;
    const { data: urlData } = supabase.storage.from("media").getPublicUrl(data.path);
    return urlData.publicUrl;
  };

  /**
   * Enregistre les modifications.
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setProgress(10);

    try {
      let finalFileUrl = removeOldFile ? "" : fileUrl; // On le vide si demandé
      let finalThumbnailUrl = removeOldThumbnail ? "" : thumbnailUrl; // On le vide si demandé

      // Si un nouveau fichier principal a été choisi, on l'envoie
      if (newFile) {
        let fileToUpload = newFile;
        // Si c'est une image pure et qu'on veut le filigrane
        if (type === "image" && applyWatermark && watermarkConfig && newFile.type.startsWith("image/")) {
           fileToUpload = await applyWatermarkToImage(newFile, watermarkConfig);
        }
        const ext = fileToUpload.name.split(".").pop();
        const path = `${type}/${Date.now()}.${ext}`;
        finalFileUrl = await uploadFile(fileToUpload, path);
        setProgress(50);
      }

      // Si une nouvelle miniature a été choisie, on l'envoie
      if (newThumbnail) {
        let thumbnailToUpload = newThumbnail;
        // Si on veut appliquer le filigrane sur la miniature
        if (applyWatermark && watermarkConfig && newThumbnail.type.startsWith("image/")) {
           thumbnailToUpload = await applyWatermarkToImage(newThumbnail, watermarkConfig);
        }
        const ext = thumbnailToUpload.name.split(".").pop();
        const path = `thumbnails/${Date.now()}.${ext}`;
        finalThumbnailUrl = await uploadFile(thumbnailToUpload, path);
        setProgress(80);
      }

      // MISE À JOUR DANS LA BASE DE DONNÉES
      const { error } = await supabase
        .from("content")
        .update({
          title,
          description,
          type,
          category_id: categoryId || null,
          file_url: finalFileUrl || null,
          thumbnail_url: finalThumbnailUrl || null,
          body: body || null,
          tags: tags ? tags.split(",").map((t) => t.trim()) : [],
          allow_download: allowDownload,
          updated_at: new Date().toISOString(), // On note l'heure de modification
        })
        .eq("id", contentId); // Uniquement pour cet élément

      if (error) throw error;

      toast({ title: "Modifications enregistrées avec succès !" });
      onSuccess(); // Ferme le formulaire et rafraîchit la liste
    } catch (err: unknown) {
      toast({ title: "Erreur lors de l'enregistrement", description: (err as Error).message, variant: "destructive" });
    } finally {
      setSaving(false);
      setProgress(0);
    }
  };

  // On attend que les données soient chargées avant d'afficher le formulaire
  if (loading) return <div className="p-10 text-center text-muted-foreground animate-pulse font-bold">Récupération des informations...</div>;

  // Filtrage des catégories selon le type choisi
  const filteredCategories = categories.filter((c) => {
    if (type === "audio") return c.type === "radio";
    if (type === "video") return c.type === "tv";
    if (type === "article") return c.type === "article";
    if (type === "image") return c.type === "image";
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Fenêtre de recadrage d'image (apparaît si on choisit un fichier) */}
      {cropImageSrc && (
        <ImageCropper 
          imageSrc={cropImageSrc} 
          onCropSubmit={handleCropSubmit} 
          onCancel={() => { setCropImageSrc(null); setCropTarget(null); }} 
        />
      )}
      
      {/* En-tête de la modification */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold uppercase tracking-widest text-primary">Modification du contenu</h3>
        <button onClick={onCancel} className="p-2 hover:bg-muted rounded-full transition-colors">
          <X size={20} />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="glass-card p-6 space-y-5">
        {/* Titre */}
        <div>
          <label className="text-sm text-muted-foreground mb-1 block">Titre du contenu</label>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full bg-muted border border-border rounded-lg px-4 py-3 text-foreground focus:ring-2 focus:ring-primary/50"
          />
        </div>

        {/* Résumé */}
        <div>
          <label className="text-sm text-muted-foreground mb-1 block">Résumé / Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="w-full bg-muted border border-border rounded-lg px-4 py-3 text-foreground focus:ring-2 focus:ring-primary/50 resize-none"
          />
        </div>

        {/* Texte complet (Articles et Jobs) */}
        {(type === "article" || type === "job") && (
          <div>
            <label className="text-sm text-muted-foreground mb-1 block">Contenu complet de l'article</label>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={10}
              className="w-full bg-muted border border-border rounded-lg px-4 py-3 text-foreground focus:ring-2 focus:ring-primary/50 resize-none border-primary/20"
            />
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          {/* Catégorie */}
          <div>
            <label className="text-sm text-muted-foreground mb-1 block">Catégorie</label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="w-full bg-muted border border-border rounded-lg px-4 py-3 text-foreground"
            >
              <option value="">Sans catégorie</option>
              {filteredCategories.map((cat) => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>
          {/* Type */}
          <div>
            <label className="text-sm text-muted-foreground mb-1 block">Type de média</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as "audio" | "video" | "article" | "image" | "job" | "sport")}
              className="w-full bg-muted border border-border rounded-lg px-4 py-3 text-foreground"
            >
              <option value="audio">Audio</option>
              <option value="video">Vidéo</option>
              <option value="article">Article</option>
              <option value="image">Image</option>
              <option value="job">Offre d'emploi</option>
              <option value="sport">Contenu Sportif</option>
            </select>
          </div>
        </div>

        {/* Étiquettes */}
        <div>
          <label className="text-sm text-muted-foreground mb-1 block">Tags (politique, sport...)</label>
          <input
            type="text"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            className="w-full bg-muted border border-border rounded-lg px-4 py-3 text-foreground"
          />
        </div>

        {/* --- MISE À JOUR DES MÉDIAS (Partie sensible) --- */}
        <div className="space-y-4 pt-4 border-t border-border/50">
          <p className="text-sm font-semibold uppercase tracking-widest text-primary">Gestion des fichiers</p>
          
          <div className="grid sm:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs text-muted-foreground">Changer le fichier principal</label>
              <input
                type="file"
                onChange={(e) => handleFileChange(e, setNewFile)}
                className="text-xs block w-full file:mr-2 file:py-1 file:px-2 file:rounded-md file:border-0 file:bg-primary/20 file:text-primary"
              />
              {newFile && newFile.type.startsWith("image/") && (
                <div className="mt-2 relative w-full aspect-video bg-black/5 rounded-lg overflow-hidden border border-border flex items-center justify-center">
                  <div className="relative inline-flex max-w-full h-full">
                    <img src={URL.createObjectURL(newFile)} alt="Aperçu" className="max-w-full max-h-full object-contain" />
                    
                    {/* APERÇU FILIGRANE */}
                    {applyWatermark && watermarkConfig?.logoUrl && (
                      <img 
                        src={watermarkConfig.logoUrl} 
                        alt="Watermark" 
                        className="absolute pointer-events-none drop-shadow-md"
                        style={{
                          width: `${watermarkConfig.size}%`,
                          opacity: watermarkConfig.opacity / 100,
                          top: watermarkConfig.position.includes('top') ? `${watermarkConfig.marginY ?? 3}%` : 'auto',
                          bottom: watermarkConfig.position.includes('bottom') ? `${watermarkConfig.marginY ?? 3}%` : 'auto',
                          left: watermarkConfig.position.includes('left') ? `${watermarkConfig.marginX ?? 3}%` : 'auto',
                          right: watermarkConfig.position.includes('right') ? `${watermarkConfig.marginX ?? 3}%` : 'auto',
                        }}
                      />
                    )}
                  </div>

                  <button type="button" onClick={() => setNewFile(null)} className="absolute top-2 right-2 bg-black/60 text-white p-1.5 rounded text-[10px] hover:bg-black z-20">X</button>
                </div>
              )}

              {newFile && newFile.type.startsWith("image/") && watermarkConfig && (
                <div className="mt-3 flex items-center gap-3 p-3 bg-primary/10 rounded-lg">
                  <input type="checkbox" id="applyWatermarkEdit" checked={applyWatermark} onChange={e => setApplyWatermark(e.target.checked)} className="accent-primary w-4 h-4 cursor-pointer" />
                  <label htmlFor="applyWatermarkEdit" className="text-[11px] font-bold uppercase tracking-widest text-primary cursor-pointer w-full select-none">Incruster le logo (Aperçu)</label>
                </div>
              )}

              {fileUrl && !newFile && !removeOldFile && (
                <div className="flex items-center justify-between bg-muted/50 p-2 rounded-lg mt-2 border border-border">
                  <p className="text-[10px] text-primary/70 truncate italic">Fichier actuel : {fileUrl.split('/').pop()}</p>
                  <button type="button" onClick={() => setRemoveOldFile(true)} className="text-destructive hover:bg-destructive/10 p-1 rounded text-xs font-bold transition-colors">Supprimer</button>
                </div>
              )}
              {removeOldFile && !newFile && (
                 <p className="text-[10px] text-destructive italic mt-2 animate-pulse">L'ancien fichier sera supprimé lors de l'enregistrement.</p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-xs text-muted-foreground">Changer la miniature</label>
              
              {newThumbnail && (
                <div className="mb-2 relative w-32 h-24 rounded-lg overflow-hidden border border-border flex items-center justify-center bg-black/5">
                  <div className="relative inline-flex max-w-full h-full">
                    <img src={URL.createObjectURL(newThumbnail)} alt="Aperçu" className="w-full h-full object-cover" />
                    
                    {/* APERÇU FILIGRANE SUR LA MINIATURE */}
                    {applyWatermark && watermarkConfig?.logoUrl && (
                      <img 
                        src={watermarkConfig.logoUrl} 
                        alt="Watermark" 
                        className="absolute pointer-events-none drop-shadow-md"
                        style={{
                          width: `${watermarkConfig.size}%`,
                          opacity: watermarkConfig.opacity / 100,
                          top: watermarkConfig.position.includes('top') ? `${watermarkConfig.marginY ?? 3}%` : 'auto',
                          bottom: watermarkConfig.position.includes('bottom') ? `${watermarkConfig.marginY ?? 3}%` : 'auto',
                          left: watermarkConfig.position.includes('left') ? `${watermarkConfig.marginX ?? 3}%` : 'auto',
                          right: watermarkConfig.position.includes('right') ? `${watermarkConfig.marginX ?? 3}%` : 'auto',
                        }}
                      />
                    )}
                  </div>
                  <button type="button" onClick={() => setNewThumbnail(null)} className="absolute top-1 right-1 bg-black/50 text-white p-1 rounded hover:bg-black z-20">X</button>
                </div>
              )}
              
              <input
                type="file"
                onChange={(e) => { handleFileChange(e, setNewThumbnail); setRemoveOldThumbnail(false); }}
                className="text-xs block w-full file:mr-2 file:py-1 file:px-2 file:rounded-md file:border-0 file:bg-primary/20 file:text-primary mb-2"
              />
              
              {thumbnailUrl && !newThumbnail && !removeOldThumbnail && (
                 <div className="relative inline-block mt-2">
                   <img src={thumbnailUrl} className="h-20 w-32 object-cover rounded-md border border-border shadow-sm" alt="Aperçu actuel" />
                   <button type="button" onClick={() => setRemoveOldThumbnail(true)} className="absolute -top-2 -right-2 bg-destructive/90 text-white p-1 rounded-full hover:bg-destructive shadow-md z-10 transition-transform hover:scale-110">
                      <X size={14} />
                   </button>
                 </div>
              )}
              {removeOldThumbnail && !newThumbnail && (
                 <p className="text-[10px] text-destructive italic mt-2 animate-pulse">L'ancienne miniature sera supprimée lors de l'enregistrement.</p>
              )}
            </div>
          </div>
        </div>

        {/* Option de téléchargement */}
        <div className="flex items-center gap-3 p-4 glass-card bg-primary/5 border-primary/20 cursor-pointer" onClick={() => setAllowDownload(!allowDownload)}>
          <input
            type="checkbox"
            id="allowDownloadEdit"
            checked={allowDownload}
            onChange={(e) => setAllowDownload(e.target.checked)}
            className="w-5 h-5 accent-primary cursor-pointer"
          />
          <label htmlFor="allowDownloadEdit" className="text-sm font-medium text-foreground cursor-pointer">
            Autoriser les visiteurs à télécharger ce contenu
          </label>
        </div>

        {/* Barre de progression pendant l'enregistrement (si nouveaux fichiers) */}
        {saving && (
          <div className="space-y-2 bg-primary/5 p-3 rounded-lg border border-primary/10">
            <div className="flex justify-between text-[10px] font-bold text-primary uppercase">
              <span>Synchronisation en cours...</span>
              <span>{progress}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        ) }

        {/* Boutons d'action finaux */}
        <div className="flex gap-4 pt-4 border-t border-border/50">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 px-4 py-3 rounded-xl border border-border hover:bg-muted transition-all text-sm font-bold uppercase tracking-widest"
          >
            Annuler
          </button>
          <button
            type="submit"
            disabled={saving}
            className="flex-1 btn-primary-glow flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <Save size={18} />
            {saving ? "Enregistrement..." : "Appliquer les modifications"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AdminEditForm;
