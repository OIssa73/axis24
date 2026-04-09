// Importation des outils de React pour gérer l'affichage et les effets
import { useEffect, useState } from "react";
// Importation de la connexion à la base de données
import { supabase } from "@/integrations/supabase/client";
// Importation des icônes pour les actions (Supprimer, Voir, Editer)
import { Trash2, Eye, EyeOff, Edit } from "lucide-react";
// Importation de l'outil pour afficher des notifications (Toast)
import { useToast } from "@/hooks/use-toast";
// Importation du formulaire de modification
import AdminEditForm from "./AdminEditForm";

// Structure d'un élément de contenu pour le code
interface ContentItem {
  id: string;
  title: string;
  type: string;
  is_published: boolean;
  views_count: number;
  created_at: string;
  tags?: string[] | null;
}

/**
 * Composant ADMIN CONTENT (Gestion des contenus).
 * Affiche la liste de tous les articles, vidéos, sons, etc. déposés sur le site.
 */
const AdminContent = () => {
  // États pour stocker la liste, le filtre de type, et l'ID de l'élément en cours d'édition
  const [content, setContent] = useState<ContentItem[]>([]);
  const [filterType, setFilterType] = useState("all");
  const [editingId, setEditingId] = useState<string | null>(null);
  const { toast } = useToast();

  /**
   * Fonction pour récupérer les contenus depuis la base de données.
   * Elle peut filtrer par type (audio, video, article, etc.).
   */
  const fetchContent = async () => {
    let query = supabase.from("content").select("*").order("created_at", { ascending: false });
    
    // Si un filtre est sélectionné (autre que "Tout")
    if (filterType !== "all") {
      query = query.eq("type", filterType);
    }
    
    const { data } = await query;
    if (data) setContent(data as ContentItem[]);
  };

  /**
   * On recharge la liste à chaque fois que l'utilisateur change le filtre.
   */
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { fetchContent(); }, [filterType]);

  /**
   * Change l'état de publication (Publié <-> Masqué).
   */
  const togglePublish = async (id: string, current: boolean) => {
    await supabase.from("content").update({ is_published: !current }).eq("id", id);
    fetchContent(); // On rafraîchit la liste
    toast({ title: current ? "Contenu masqué" : "Contenu publié" });
  };

  /**
   * Supprime définitivement un contenu de la base de données.
   */
  const deleteContent = async (id: string) => {
    if (!confirm("Voulez-vous vraiment supprimer ce contenu ?")) return;
    await supabase.from("content").delete().eq("id", id);
    fetchContent(); // On rafraîchit la liste
    toast({ title: "Contenu supprimé" });
  };

  // Si on est en train de modifier un contenu, on affiche le formulaire d'édition à la place de la liste
  if (editingId) {
    return <AdminEditForm contentId={editingId} onCancel={() => setEditingId(null)} onSuccess={() => { setEditingId(null); fetchContent(); }} />;
  }

  return (
    <div>
      {/* --- BARRE DE FILTRAGE --- */}
      <div className="flex flex-wrap gap-2 mb-6">
        {["all", "audio", "video", "article", "image", "job", "sport"].map((type) => (
          <button
            key={type}
            onClick={() => setFilterType(type)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              filterType === type
                ? "bg-primary text-primary-foreground"
                : "bg-muted/30 text-muted-foreground hover:bg-muted/50"
            }`}
          >
            {/* Traduction simple du type pour les boutons */}
            {type === "all" ? "Tout" : type.charAt(0).toUpperCase() + type.slice(1)}
          </button>
        ))}
      </div>

      {/* --- AFFICHAGE DE LA LISTE --- */}
      {content.length === 0 ? (
        <div className="glass-card p-10 text-center text-muted-foreground">
          Aucun contenu. Utilisez l'onglet "Uploader" pour ajouter du contenu.
        </div>
      ) : (
        <div className="space-y-3">
          {content.map((item) => (
            <div key={item.id} className="glass-card p-4 flex flex-col sm:flex-row items-center justify-between gap-4 overflow-hidden">
              <div className="flex-1 min-w-0 w-full">
                {/* Badge de couleur selon le type de contenu */}
                <div className="flex items-center gap-2 mb-1">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                    item.type === "job" ? "bg-orange-500/20 text-orange-400" :
                    item.type === "sport" ? "bg-red-500/20 text-red-500" :
                    item.type === "audio" ? "bg-primary/20 text-primary" :
                    item.type === "video" ? "bg-blue-500/20 text-blue-400" :
                    item.type === "article" ? "bg-green-500/20 text-green-400" :
                    "bg-yellow-500/20 text-yellow-400"
                  }`}>
                    {item.type}
                  </span>
                  {/* Petit badge "Brouillon" si non publié */}
                  {!item.is_published && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">Brouillon</span>
                  )}
                </div>
                {/* Titre et statistiques */}
                <p className="text-foreground font-medium break-words overflow-hidden max-w-full">{item.title}</p>
                <p className="text-xs text-muted-foreground">
                  {new Date(item.created_at).toLocaleDateString("fr-FR")} · {item.views_count} vues
                </p>
              </div>

              {/* --- ACTIONS POSSIBLES --- */}
              <div className="flex items-center gap-2">
                {/* Modifier */}
                <button
                  onClick={() => setEditingId(item.id)}
                  className="p-2 rounded-lg hover:bg-primary/10 transition-colors text-muted-foreground hover:text-primary"
                  title="Modifier"
                >
                  <Edit size={16} />
                </button>
                {/* Publier / Masquer */}
                <button
                  onClick={() => togglePublish(item.id, item.is_published)}
                  className="p-2 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
                  title={item.is_published ? "Masquer" : "Publier"}
                >
                  {item.is_published ? <Eye size={16} /> : <EyeOff size={16} />}
                </button>
                {/* Supprimer */}
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
