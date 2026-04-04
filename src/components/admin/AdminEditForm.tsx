import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Save, X, Upload } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface Category {
  id: string;
  name: string;
  type: string;
}

interface AdminEditFormProps {
  contentId: string;
  onCancel: () => void;
  onSuccess: () => void;
}

const AdminEditForm = ({ contentId, onCancel, onSuccess }: AdminEditFormProps) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState<"audio" | "video" | "article" | "image" | "job" | "sport">("audio");
  const [categoryId, setCategoryId] = useState("");
  const [tags, setTags] = useState("");
  const [body, setBody] = useState("");
  const [allowDownload, setAllowDownload] = useState(true);
  const [thumbnailUrl, setThumbnailUrl] = useState("");
  const [fileUrl, setFileUrl] = useState("");
  
  const [newFile, setNewFile] = useState<File | null>(null);
  const [newThumbnail, setNewThumbnail] = useState<File | null>(null);
  
  const [progress, setProgress] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    const fetchData = async () => {
      const { data: catData } = await supabase.from("categories").select("*");
      if (catData) setCategories(catData as Category[]);

      const { data: contentData, error } = await supabase
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
      setLoading(false);
    };
    fetchData();
  }, [contentId]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, setFileFn: (f: File | null) => void) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      const maxSize = 50 * 1024 * 1024; // 50MB
      if (selectedFile.size > maxSize) {
        toast({ title: "Fichier trop volumineux", description: "Max 50Mo autorisé.", variant: "destructive" });
        e.target.value = "";
        return;
      }
      setFileFn(selectedFile);
    }
  };

  const uploadFile = async (file: File, path: string) => {
    const { data, error } = await supabase.storage.from("media").upload(path, file);
    if (error) throw error;
    const { data: urlData } = supabase.storage.from("media").getPublicUrl(data.path);
    return urlData.publicUrl;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setProgress(10);

    try {
      let finalFileUrl = fileUrl;
      let finalThumbnailUrl = thumbnailUrl;

      if (newFile) {
        const ext = newFile.name.split(".").pop();
        const path = `${type}/${Date.now()}.${ext}`;
        finalFileUrl = await uploadFile(newFile, path);
        setProgress(50);
      }

      if (newThumbnail) {
        const ext = newThumbnail.name.split(".").pop();
        const path = `thumbnails/${Date.now()}.${ext}`;
        finalThumbnailUrl = await uploadFile(newThumbnail, path);
        setProgress(80);
      }

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
          updated_at: new Date().toISOString(),
        })
        .eq("id", contentId);

      if (error) throw error;

      toast({ title: "Modifications enregistrées !" });
      onSuccess();
    } catch (err: unknown) {
      toast({ title: "Erreur", description: err instanceof Error ? err.message : "Erreur inconnue", variant: "destructive" });
    } finally {
      setSaving(false);
      setProgress(0);
    }
  };

  if (loading) return <div className="p-10 text-center">Chargement des données...</div>;

  const filteredCategories = categories.filter((c) => {
    if (type === "audio") return c.type === "radio";
    if (type === "video") return c.type === "tv";
    if (type === "article") return c.type === "article";
    if (type === "image") return c.type === "image";
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Modifier : {title}</h3>
        <button onClick={onCancel} className="p-2 hover:bg-muted rounded-full">
          <X size={20} />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="glass-card p-6 space-y-5">
        <div>
          <label className="text-sm text-muted-foreground mb-1 block">Titre</label>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full bg-muted border border-border rounded-lg px-4 py-3 text-foreground"
          />
        </div>

        <div>
          <label className="text-sm text-muted-foreground mb-1 block">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="w-full bg-muted border border-border rounded-lg px-4 py-3 text-foreground resize-none"
          />
        </div>

        {(type === "article" || type === "job") && (
          <div>
            <label className="text-sm text-muted-foreground mb-1 block">Corps de l'article</label>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={10}
              className="w-full bg-muted border border-border rounded-lg px-4 py-3 text-foreground resize-none"
            />
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
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
          <div>
            <label className="text-sm text-muted-foreground mb-1 block">Type</label>
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

        <div>
          <label className="text-sm text-muted-foreground mb-1 block">Tags (séparés par des virgules)</label>
          <input
            type="text"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            className="w-full bg-muted border border-border rounded-lg px-4 py-3 text-foreground"
          />
        </div>

        {/* Media Update Section */}
        <div className="space-y-4 pt-4 border-t border-border">
          <p className="text-sm font-semibold uppercase tracking-widest text-primary">Médias</p>
          
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs text-muted-foreground">Fichier Principal (Optionnel)</label>
              <input
                type="file"
                onChange={(e) => handleFileChange(e, setNewFile)}
                className="text-xs"
              />
              {fileUrl && !newFile && <p className="text-[10px] text-primary truncate">Actuel : {fileUrl.split('/').pop()}</p>}
            </div>

            <div className="space-y-2">
              <label className="text-xs text-muted-foreground">Nouvelle Miniature (Optionnel)</label>
              <input
                type="file"
                onChange={(e) => handleFileChange(e, setNewThumbnail)}
                className="text-xs"
              />
              {thumbnailUrl && !newThumbnail && <img src={thumbnailUrl} className="h-10 w-20 object-cover rounded" />}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 p-4 glass-card bg-primary/5 border-primary/20">
          <input
            type="checkbox"
            id="allowDownloadEdit"
            checked={allowDownload}
            onChange={(e) => setAllowDownload(e.target.checked)}
            className="w-5 h-5 accent-primary"
          />
          <label htmlFor="allowDownloadEdit" className="text-sm font-medium text-foreground">
            Autoriser le téléchargement
          </label>
        </div>

        {saving && (
          <div className="space-y-2">
            <Progress value={progress} className="h-2" />
            <p className="text-[10px] text-center text-primary animate-pulse">Enregistrement...</p>
          </div>
        ) }

        <div className="flex gap-3 pt-4">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 px-4 py-3 rounded-lg border border-border hover:bg-muted transition-colors text-sm"
          >
            Annuler
          </button>
          <button
            type="submit"
            disabled={saving}
            className="flex-1 btn-primary-glow flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <Save size={18} />
            Enregistrer les modifications
          </button>
        </div>
      </form>
    </div>
  );
};

export default AdminEditForm;
