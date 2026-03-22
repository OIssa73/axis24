import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Upload } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface Category {
  id: string;
  name: string;
  slug: string;
  type: string;
}

const AdminUpload = () => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState<"audio" | "video" | "article" | "image">("audio");
  const [categoryId, setCategoryId] = useState("");
  const [tags, setTags] = useState("");
  const [body, setBody] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [thumbnail, setThumbnail] = useState<File | null>(null);
  const [progress, setProgress] = useState(0);
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    const fetchCategories = async () => {
      const { data } = await supabase.from("categories").select("*");
      if (data) setCategories(data as Category[]);
    };
    fetchCategories();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, setFileFn: (f: File | null) => void) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      const maxSize = 50 * 1024 * 1024; // 50MB
      if (selectedFile.size > maxSize) {
        toast({
          title: "Fichier trop volumineux",
          description: "La limite de votre plan Supabase est de 50 Mo. Ce fichier ( " + (selectedFile.size / (1024 * 1024)).toFixed(1) + " Mo) ne pourra pas être envoyé.",
          variant: "destructive",
        });
        e.target.value = ""; // Clear input
        return;
      }
      setFileFn(selectedFile);
    }
  };

  const uploadFile = async (file: File, path: string) => {
    const interval = setInterval(() => {
      setProgress((prev) => (prev < 95 ? prev + 5 : prev));
    }, 400);

    try {
      const { data, error } = await supabase.storage.from("media").upload(path, file);
      clearInterval(interval);
      if (error) throw error;
      setProgress(100);
      const { data: urlData } = supabase.storage.from("media").getPublicUrl(data.path);
      return urlData.publicUrl;
    } catch (err) {
      clearInterval(interval);
      throw err;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setProgress(5);

    try {
      let fileUrl = "";
      let thumbnailUrl = "";

      if (file) {
        const ext = file.name.split(".").pop();
        const path = `${type}/${Date.now()}.${ext}`;
        fileUrl = await uploadFile(file, path);
      }

      if (thumbnail) {
        const ext = thumbnail.name.split(".").pop();
        const path = `thumbnails/${Date.now()}.${ext}`;
        thumbnailUrl = await uploadFile(thumbnail, path);
      }

      const { data: { user } } = await supabase.auth.getUser();

      const { error } = await supabase.from("content").insert({
        title,
        description,
        type,
        category_id: categoryId || null,
        file_url: fileUrl || null,
        thumbnail_url: thumbnailUrl || null,
        body: body || null,
        tags: tags ? tags.split(",").map((t) => t.trim()) : [],
        created_by: user?.id,
      });

      if (error) throw error;

      toast({ title: "Publication réussie !", description: "Votre contenu est maintenant en ligne." });
      setTitle("");
      setDescription("");
      setBody("");
      setTags("");
      setFile(null);
      setThumbnail(null);
      setProgress(0);
    } catch (err: any) {
      setProgress(0);
      toast({ title: "Échec de l'envoi", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const filteredCategories = categories.filter((c) => {
    if (type === "audio") return c.type === "radio";
    if (type === "video") return c.type === "tv";
    if (type === "article") return c.type === "article";
    if (type === "image") return c.type === "image";
    return true;
  });

  return (
    <form onSubmit={handleSubmit} className="glass-card p-6 max-w-2xl space-y-5">
      <div>
        <label className="text-sm text-muted-foreground mb-1 block">Type de contenu</label>
        <select
          value={type}
          onChange={(e) => setType(e.target.value as any)}
          className="w-full bg-muted border border-border rounded-lg px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
        >
          <option value="audio">Audio (Podcast / Émission radio)</option>
          <option value="video">Vidéo (Émission TV / Replay)</option>
          <option value="article">Article</option>
          <option value="image">Image / Infographie</option>
        </select>
      </div>

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

      {type === "article" && (
        <div>
          <label className="text-sm text-muted-foreground mb-1 block">Contenu de l'article</label>
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={8}
            className="w-full bg-muted border border-border rounded-lg px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
            placeholder="Rédigez votre article ici..."
          />
        </div>
      )}

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

      <div>
        <label className="text-sm text-muted-foreground mb-1 block">Tags (séparés par des virgules)</label>
        <input
          type="text"
          value={tags}
          onChange={(e) => setTags(e.target.value)}
          className="w-full bg-muted border border-border rounded-lg px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
          placeholder="politique, afrique, sport"
        />
      </div>

      {(type === "audio" || type === "video" || type === "image") && (
        <div className="glass-card p-6">
          <label className="text-sm text-muted-foreground mb-1 block">
            Fichier {type === "audio" ? "audio" : type === "video" ? "vidéo" : "image"} <span className="text-primary font-bold">(Max 50Mo)</span>
          </label>
          <input
            type="file"
            accept={type === "audio" ? "audio/*" : type === "video" ? "video/*" : "image/*"}
            onChange={(e) => handleFileChange(e, setFile)}
            className="w-full bg-muted border border-border rounded-lg px-4 py-3 text-foreground file:mr-4 file:rounded-lg file:border-0 file:bg-primary/20 file:text-primary file:px-4 file:py-1 file:text-sm file:font-medium cursor-pointer"
          />
        </div>
      )}

      <div className="glass-card p-6">
        <label className="text-sm text-muted-foreground mb-1 block">Miniature <span className="text-xs text-muted-foreground/60">(optionnel - max 5Mo)</span></label>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => handleFileChange(e, setThumbnail)}
          className="w-full bg-muted border border-border rounded-lg px-4 py-3 text-foreground file:mr-4 file:rounded-lg file:border-0 file:bg-primary/20 file:text-primary file:px-4 file:py-1 file:text-sm file:font-medium cursor-pointer"
        />
      </div>

      {loading && (
        <div className="space-y-3 bg-primary/5 p-4 rounded-xl border border-primary/20 shadow-inner">
          <div className="flex justify-between text-sm font-semibold text-primary">
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              Transfert en cours...
            </span>
            <span>{progress}%</span>
          </div>
          <Progress value={progress} className="h-3 bg-muted" />
          <p className="text-[10px] text-muted-foreground text-center uppercase tracking-tighter opacity-70">Veuillez ne pas quitter cette page</p>
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="btn-primary-glow w-full flex items-center justify-center gap-2 disabled:opacity-50"
      >
        <Upload size={16} />
        {loading ? "Upload en cours..." : "Publier le contenu"}
      </button>
    </form>
  );
};

export default AdminUpload;
