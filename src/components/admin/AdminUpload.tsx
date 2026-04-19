// Importation des outils de React pour gérer les formulaires et les effets
import { useState, useEffect } from "react";
// Importation de la connexion à la base de données
import { supabase } from "@/integrations/supabase/client";
// Importation de l'outil de notification (Toast)
import { useToast } from "@/hooks/use-toast";
// Importation de l'icône d'upload
import { Upload } from "lucide-react";
// Importation du composant de barre de progression
import { Progress } from "@/components/ui/progress";
import ImageCropper from "./ImageCropper";
import { getWatermarkConfig, applyWatermarkToImage } from "@/utils/watermarkUtils";
import type { WatermarkConfig } from "./AdminWatermark";

// Structure d'une Catégorie dans le code
interface Category {
  id: string;
  name: string;
  slug: string;
  type: string;
}

/**
 * Composant ADMIN UPLOAD (Formulaire d'ajout de contenu).
 * C'est ici que l'administrateur envoie de nouveaux articles, vidéos ou sons.
 */
const AdminUpload = () => {
  // --- ÉTATS DU FORMULAIRE ---
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  // Type de contenu par défaut : audio
  const [type, setType] = useState<"audio" | "video" | "article" | "image" | "job" | "sport">("audio");
  const [categoryId, setCategoryId] = useState("");
  const [tags, setTags] = useState("");
  const [body, setBody] = useState(""); // Texte complet pour les articles
  const [file, setFile] = useState<File | null>(null); // Fichier principal (mp3, mp4, img)
  const [thumbnail, setThumbnail] = useState<File | null>(null); // Image miniature
  const [progress, setProgress] = useState(0); // Barre de progression (0 à 100)
  const [allowDownload, setAllowDownload] = useState(true);
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [cropImageSrc, setCropImageSrc] = useState<string | null>(null); // Pour le recadreur
  const [cropTarget, setCropTarget] = useState<"file" | "thumbnail" | null>(null);
  
  // Nouveaux états pour le filigrane
  const [watermarkConfig, setWatermarkConfig] = useState<WatermarkConfig | null>(null);
  const [applyWatermark, setApplyWatermark] = useState(true);

  const { toast } = useToast();

  /**
   * On charge la liste des catégories dès l'ouverture du formulaire.
   */
  useEffect(() => {
    const fetchCategories = async () => {
      const { data } = await supabase.from("categories").select("*");
      if (data) setCategories(data as Category[]);
    };
    const fetchWatermark = async () => {
      const config = await getWatermarkConfig();
      setWatermarkConfig(config);
      setApplyWatermark(config ? true : false);
    };
    fetchCategories();
    fetchWatermark();
  }, []);

  /**
   * Gère la sélection d'un fichier et vérifie sa taille.
   * Supabase (version gratuite) limite les fichiers à 50 Mo.
   */
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, setFileFn: (f: File | null) => void) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      const maxSize = 50 * 1024 * 1024; // 50 Mo
      if (selectedFile.size > maxSize) {
        toast({
          title: "Fichier trop volumineux",
          description: "La limite de votre plan Supabase est de 50 Mo. Ce fichier ( " + (selectedFile.size / (1024 * 1024)).toFixed(1) + " Mo) ne pourra pas être envoyé.",
          variant: "destructive",
        });
        e.target.value = ""; // On vide le champ pour forcer un autre choix
        return;
      }
      
      // Si c'est une image (et pour la miniature ou le fichier principal), on utilise le cropper
      if (selectedFile.type.startsWith("image/") && (setFileFn === setThumbnail || setFileFn === setFile)) {
        const reader = new FileReader();
        reader.addEventListener("load", () => {
          setCropTarget(setFileFn === setThumbnail ? "thumbnail" : "file");
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
   * Validation de l'image recadrée
   */
  const handleCropSubmit = (croppedBlob: Blob) => {
    const croppedFile = new File([croppedBlob], `${cropTarget}-${Date.now()}.jpg`, { type: "image/jpeg" });
    if (cropTarget === "thumbnail") {
      setThumbnail(croppedFile);
    } else {
      setFile(croppedFile);
    }
    setCropImageSrc(null);
    setCropTarget(null);
  };

  /**
   * Fonction qui envoie réellement le fichier dans le "Storage" (stockage) de Supabase.
   */
  const uploadFile = async (file: File, path: string) => {
    // Simulation d'une progression visuelle
    const interval = setInterval(() => {
      setProgress((prev) => (prev < 95 ? prev + 5 : prev));
    }, 400);

    try {
      // Envoi du fichier dans le dossier 'media'
      const { data, error } = await supabase.storage.from("media").upload(path, file);
      clearInterval(interval);
      if (error) throw error;
      setProgress(100);
      // Récupération de l'adresse URL publique du fichier envoyé
      const { data: urlData } = supabase.storage.from("media").getPublicUrl(data.path);
      return urlData.publicUrl;
    } catch (err) {
      clearInterval(interval);
      throw err;
    }
  };

  /**
   * Action déclenchée quand on clique sur "Publier le contenu".
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setProgress(5);

    try {
      let fileUrl = "";
      let thumbnailUrl = "";

      // 1. On envoie le fichier principal si il y en a un
      if (file) {
        let fileToUpload = file;
        // Application du filigrane si c'est une publication d'image pure (pas thumbnail)
        if (type === "image" && applyWatermark && watermarkConfig && file.type.startsWith("image/")) {
           fileToUpload = await applyWatermarkToImage(file, watermarkConfig);
        }
        const ext = fileToUpload.name.split(".").pop();
        const path = `${type}/${Date.now()}.${ext}`;
        fileUrl = await uploadFile(fileToUpload, path);
      }

      // 2. On envoie la miniature si il y en a une
      if (thumbnail) {
        let thumbnailToUpload = thumbnail;
        if (applyWatermark && watermarkConfig && thumbnail.type.startsWith("image/")) {
           thumbnailToUpload = await applyWatermarkToImage(thumbnail, watermarkConfig);
        }
        const ext = thumbnailToUpload.name.split(".").pop();
        const path = `thumbnails/${Date.now()}.${ext}`;
        thumbnailUrl = await uploadFile(thumbnailToUpload, path);
      }

      // 3. On récupère l'identifiant de la personne connectée (l'admin)
      const { data: { user } } = await supabase.auth.getUser();

      // 4. On enregistre toutes les infos dans la table "content" de la BDD
      const { error } = await supabase.from("content").insert({
        title,
        description,
        type,
        category_id: categoryId || null,
        file_url: fileUrl || null,
        thumbnail_url: thumbnailUrl || null,
        body: body || null,
        tags: tags ? tags.split(",").map((t) => t.trim()) : [],
        allow_download: allowDownload,
        created_by: user?.id,
        is_published: true, // Publié directement par défaut
      });

      if (error) throw error;

      // 5. Message de succès et remise à zéro du formulaire
      toast({ title: "Publication réussie !", description: "Votre contenu est maintenant en ligne." });
      setTitle("");
      setDescription("");
      setBody("");
      setTags("");
      setFile(null);
      setThumbnail(null);
      setAllowDownload(true);
      setProgress(0);
    } catch (err: unknown) {
      setProgress(0);
      console.error("Erreur Upload:", err);
      toast({ 
        title: "Échec de l'envoi", 
        description: (err as Error).message || "Une erreur est survenue lors de l'enregistrement.", 
        variant: "destructive" 
      });
    } finally {
      setLoading(false);
    }
  };

  // Filtrage des catégories selon le type de contenu choisi
  const filteredCategories = categories.filter((c) => {
    if (type === "audio") return c.type === "radio";
    if (type === "video") return c.type === "tv";
    if (type === "article") return c.type === "article";
    if (type === "image") return c.type === "image";
    if (type === "sport") return c.type === "sport";
    if (type === "job") return c.type === "job";
    return true;
  });

  return (
    <>
    {cropImageSrc && (
      <ImageCropper 
        imageSrc={cropImageSrc} 
        onCropSubmit={handleCropSubmit} 
        onCancel={() => { setCropImageSrc(null); setCropTarget(null); }} 
      />
    )}
    
    <form onSubmit={handleSubmit} className="glass-card p-6 max-w-2xl space-y-5">
      
      {/* Sélecteur du Type de Contenu */}
      <div>
        <label className="text-sm text-muted-foreground mb-1 block">Type de contenu</label>
        <select
          value={type}
          onChange={(e) => setType(e.target.value as "audio" | "video" | "article" | "image" | "job" | "sport")}
          className="w-full bg-muted border border-border rounded-lg px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
        >
          <option value="audio">Audio (Podcast / Émission radio)</option>
          <option value="video">Vidéo (Émission TV / Replay)</option>
          <option value="article">Article</option>
          <option value="image">Image / Infographie</option>
          <option value="job">Offre d'emploi</option>
          <option value="sport">Contenu Sportif</option>
        </select>
      </div>

      {/* Titre */}
      <div>
        <label className="text-sm text-muted-foreground mb-1 block">Titre</label>
        <input
          type="text"
          required
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full bg-muted border border-border rounded-lg px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
          placeholder="Titre du contenu"
        />
      </div>

      {/* Résumé / Description courte */}
      <div>
        <label className="text-sm text-muted-foreground mb-1 block">Description</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          className="w-full bg-muted border border-border rounded-lg px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
          placeholder="Description courte"
        />
      </div>

      {/* Zone de texte longue (Uniquement pour les articles, sports et jobs) */}
      {(type === "article" || type === "job" || type === "sport") && (
        <div>
          <label className="text-sm text-muted-foreground mb-1 block">Contenu complet</label>
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={8}
            className="w-full bg-muted border border-border rounded-lg px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
            placeholder="Rédigez votre texte ici..."
          />
        </div>
      )}

      {/* Sélection de la Catégorie */}
      <div>
        <label className="text-sm text-muted-foreground mb-1 block">Catégorie</label>
        <select
          value={categoryId}
          onChange={(e) => setCategoryId(e.target.value)}
          className="w-full bg-muted border border-border rounded-lg px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
        >
          <option value="">Sans catégorie</option>
          {filteredCategories.map((cat) => (
            <option key={cat.id} value={cat.id}>{cat.name}</option>
          ))}
        </select>
      </div>

      {/* Tags (Étiquettes) */}
      <div>
        <label className="text-sm text-muted-foreground mb-1 block">Tags (séparés par des virgules)</label>
        <input
          type="text"
          value={tags}
          onChange={(e) => setTags(e.target.value)}
          className="w-full bg-muted border border-border rounded-lg px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
          placeholder="ex: politique, afrique, direct"
        />
      </div>

      {/* Sélection du Fichier Principal (Audio/Vidéo/Image) */}
      {(type === "audio" || type === "video" || type === "image" || type === "article" || type === "sport" || type === "job") && (
        <div className="glass-card p-6">
          <label className="text-sm text-muted-foreground mb-1 block">
            Fichier principal {type === "audio" ? "(audio)" : type === "video" ? "(vidéo)" : "(image)"} <span className="text-primary font-bold">(Max 50Mo)</span>
          </label>
          
          {file && file.type.startsWith("image/") && (
            <div className="mb-4">
              <div className="relative w-full aspect-video bg-black/5 rounded-lg overflow-hidden border border-border flex items-center justify-center">
                <div className="relative inline-flex max-w-full h-full">
                  <img src={URL.createObjectURL(file)} alt="Aperçu" className="max-w-full max-h-full object-contain" />
                  
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

                <button type="button" onClick={() => setFile(null)} className="absolute top-2 right-2 bg-black/60 text-white p-1.5 rounded hover:bg-black z-20">X</button>
              </div>

              {watermarkConfig && (
                <div className="mt-3 flex items-center gap-3 p-3 bg-primary/10 rounded-lg">
                  <input type="checkbox" id="applyWatermark" checked={applyWatermark} onChange={e => setApplyWatermark(e.target.checked)} className="accent-primary w-4 h-4 cursor-pointer" />
                  <label htmlFor="applyWatermark" className="text-[11px] font-bold uppercase tracking-widest text-primary cursor-pointer w-full select-none">Appliquer le logo en filigrane (Aperçu ci-dessus)</label>
                </div>
              )}
            </div>
          )}

          <input
            type="file"
            accept={type === "audio" ? "audio/*" : type === "video" ? "video/*" : "image/*"}
            onChange={(e) => handleFileChange(e, setFile)}
            className="w-full bg-muted border border-border rounded-lg px-4 py-3 text-foreground file:mr-4 file:rounded-lg file:border-0 file:bg-primary/20 file:text-primary file:px-4 file:py-1 file:text-sm file:font-medium cursor-pointer"
          />
        </div>
      )}

      {/* Option de téléchargement */}
      <div className="flex items-center gap-3 p-4 glass-card bg-primary/5 border-primary/20">
        <input
          type="checkbox"
          id="allowDownload"
          checked={allowDownload}
          onChange={(e) => setAllowDownload(e.target.checked)}
          className="w-5 h-5 rounded border-gray-300 text-primary focus:ring-primary accent-primary cursor-pointer"
        />
        <label htmlFor="allowDownload" className="text-sm font-medium text-foreground cursor-pointer">
          Autoriser le téléchargement par les visiteurs
        </label>
      </div>

      {/* Miniature (Optionnelle) */}
      <div className="glass-card p-6">
        <label className="text-sm text-muted-foreground mb-1 block">Image de couverture <span className="text-xs text-muted-foreground/60">(optionnel - max 5Mo)</span></label>
        
        {thumbnail && (
          <div className="mb-4 relative w-32 h-24 rounded-lg overflow-hidden border border-border">
            <img src={URL.createObjectURL(thumbnail)} alt="Aperçu" className="w-full h-full object-cover" />
            <button type="button" onClick={() => setThumbnail(null)} className="absolute top-1 right-1 bg-black/50 text-white p-1 rounded hover:bg-black">X</button>
          </div>
        )}
        
        <input
          type="file"
          accept="image/*"
          onChange={(e) => handleFileChange(e, setThumbnail)}
          className="w-full bg-muted border border-border rounded-lg px-4 py-3 text-foreground file:mr-4 file:rounded-lg file:border-0 file:bg-primary/20 file:text-primary file:px-4 file:py-1 file:text-sm file:font-medium cursor-pointer"
        />
      </div>

      {/* Barre de progression pendant l'upload */}
      {loading && (
        <div className="space-y-3 bg-primary/5 p-4 rounded-xl border border-primary/20 shadow-inner">
          <div className="flex justify-between text-sm font-semibold text-primary">
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              Transfert en cours vers le serveur...
            </span>
            <span>{progress}%</span>
          </div>
          <Progress value={progress} className="h-3 bg-muted" />
          <p className="text-[10px] text-muted-foreground text-center uppercase tracking-tighter opacity-70">Veuillez ne pas quitter cette page</p>
        </div>
      )}

      {/* Bouton Final */}
      <button
        type="submit"
        disabled={loading}
        className="btn-primary-glow w-full flex items-center justify-center gap-2 disabled:opacity-50"
      >
        <Upload size={16} />
        {loading ? "Chargement..." : "Publier maintenant"}
      </button>
    </form>
    </>
  );
};

export default AdminUpload;
