import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Trash2, Eye, EyeOff, Edit } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import AdminEditForm from "./AdminEditForm";

interface ContentItem {
  id: string;
  title: string;
  type: string;
  is_published: boolean;
  views_count: number;
  created_at: string;
}

const AdminContent = () => {
  const [content, setContent] = useState<ContentItem[]>([]);
  const [filterType, setFilterType] = useState("all");
  const [editingId, setEditingId] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchContent = async () => {
    let query = supabase.from("content").select("*").order("created_at", { ascending: false });
    if (filterType !== "all") query = query.eq("type", filterType);
    const { data } = await query;
    if (data) setContent(data as ContentItem[]);
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { fetchContent(); }, [filterType]);

  const togglePublish = async (id: string, current: boolean) => {
    await supabase.from("content").update({ is_published: !current }).eq("id", id);
    fetchContent();
    toast({ title: current ? "Contenu masqué" : "Contenu publié" });
  };

  const deleteContent = async (id: string) => {
    if (!confirm("Voulez-vous vraiment supprimer ce contenu ?")) return;
    await supabase.from("content").delete().eq("id", id);
    fetchContent();
    toast({ title: "Contenu supprimé" });
  };

  if (editingId) {
    return <AdminEditForm contentId={editingId} onCancel={() => setEditingId(null)} onSuccess={() => { setEditingId(null); fetchContent(); }} />;
  }

  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-6">
        {["all", "audio", "video", "article", "image"].map((type) => (
          <button
            key={type}
            onClick={() => setFilterType(type)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              filterType === type
                ? "bg-primary text-primary-foreground"
                : "bg-muted/30 text-muted-foreground hover:bg-muted/50"
            }`}
          >
            {type === "all" ? "Tout" : type.charAt(0).toUpperCase() + type.slice(1)}
          </button>
        ))}
      </div>

      {content.length === 0 ? (
        <div className="glass-card p-10 text-center text-muted-foreground">
          Aucun contenu. Utilisez l'onglet "Uploader" pour ajouter du contenu.
        </div>
      ) : (
        <div className="space-y-3">
          {content.map((item) => (
            <div key={item.id} className="glass-card p-4 flex items-center justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                    item.type === "audio" ? "bg-primary/20 text-primary" :
                    item.type === "video" ? "bg-blue-500/20 text-blue-400" :
                    item.type === "article" ? "bg-green-500/20 text-green-400" :
                    "bg-yellow-500/20 text-yellow-400"
                  }`}>
                    {item.type}
                  </span>
                  {!item.is_published && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">Brouillon</span>
                  )}
                </div>
                <p className="text-foreground font-medium truncate">{item.title}</p>
                <p className="text-xs text-muted-foreground">
                  {new Date(item.created_at).toLocaleDateString("fr-FR")} · {item.views_count} vues
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setEditingId(item.id)}
                  className="p-2 rounded-lg hover:bg-primary/10 transition-colors text-muted-foreground hover:text-primary"
                  title="Modifier"
                >
                  <Edit size={16} />
                </button>
                <button
                  onClick={() => togglePublish(item.id, item.is_published)}
                  className="p-2 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
                  title={item.is_published ? "Masquer" : "Publier"}
                >
                  {item.is_published ? <Eye size={16} /> : <EyeOff size={16} />}
                </button>
                <button
                  onClick={() => deleteContent(item.id)}
                  className="p-2 rounded-lg hover:bg-destructive/10 transition-colors text-muted-foreground hover:text-destructive"
                  title="Supprimer"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminContent;
