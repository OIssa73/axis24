import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Upload } from "lucide-react";

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

  const uploadFile = async (file: File, path: string) => {
    const { data, error } = await supabase.storage.from("media").upload(path, file);
    if (error) throw error;
    const { data: urlData } = supabase.storage.from("media").getPublicUrl(data.path);
    return urlData.publicUrl;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

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

      toast({ title: "Contenu ajouté avec succès !" });
      setTitle("");
      setDescription("");
      setBody("");
      setTags("");
      setFile(null);
      setThumbnail(null);
    } catch (err: any) {
      toast({ title: "Erreur", description: err.message, variant: "destructive" });
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
        <div>
          <label className="text-sm text-muted-foreground mb-1 block">
            Fichier {type === "audio" ? "audio" : type === "video" ? "vidéo" : "image"}
          </label>
          <input
            type="file"
            accept={type === "audio" ? "audio/*" : type === "video" ? "video/*" : "image/*"}
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            className="w-full bg-muted border border-border rounded-lg px-4 py-3 text-foreground file:mr-4 file:rounded-lg file:border-0 file:bg-primary/20 file:text-primary file:px-4 file:py-1 file:text-sm file:font-medium"
          />
        </div>
      )}

      <div>
        <label className="text-sm text-muted-foreground mb-1 block">Miniature (optionnel)</label>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setThumbnail(e.target.files?.[0] || null)}
          className="w-full bg-muted border border-border rounded-lg px-4 py-3 text-foreground file:mr-4 file:rounded-lg file:border-0 file:bg-primary/20 file:text-primary file:px-4 file:py-1 file:text-sm file:font-medium"
        />
      </div>

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
