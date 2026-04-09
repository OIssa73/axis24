// Importation des outils de React pour gérer l'affichage et les états
import { useState, useEffect } from "react";
// Importation de la connexion à la base de données
import { supabase } from "@/integrations/supabase/client";
// Importation des icônes d'action (Ajouter, Supprimer, Editer, Valider, Annuler)
import { Plus, Trash2, Edit2, Check, X } from "lucide-react";
// Importation de l'outil de notification (Toast)
import { useToast } from "@/hooks/use-toast";

// Structure d'une Catégorie dans le code
interface Category {
  id: string;
  name: string; // Nom affiché (ex: Football)
  slug: string; // Nom pour l'URL (ex: football)
  type: string; // Type de média associé (radio, tv, article...)
  created_at: string;
}

/**
 * Composant ADMIN CATEGORIES (Gestion des catégories).
 * Permet de créer, modifier ou supprimer les thèmes du site (Sport, Politique, Recrutement...).
 */
const AdminCategories = () => {
  // États pour la liste, le nouveau nom, le type choisi, et l'édition en cours
  const [categories, setCategories] = useState<Category[]>([]);
  const [name, setName] = useState(""); // Champ de création
  const [type, setType] = useState("radio"); // Type par défaut
  const [editingId, setEditingId] = useState<string | null>(null); // ID de la catégorie qu'on modifie
  const [editName, setEditName] = useState(""); // Nouveau nom temporaire pendant l'édition
  const { toast } = useToast();

  /**
   * Récupère toutes les catégories existantes depuis Supabase.
   */
  const fetchCategories = async () => {
    const { data } = await supabase.from("categories").select("*").order("type").order("name");
    if (data) setCategories(data as Category[]);
  };

  /**
   * Chargement initial au lancement du composant.
   */
  useEffect(() => { fetchCategories(); }, []);

  /**
   * Transforme un nom en "slug" (forme simplifiée pour les URL).
   * Ex: "Actualités Nationales" -> "actualites-nationales"
   */
  const slugify = (text: string) =>
    text.toLowerCase()
      .normalize("NFD") // Sépare les accents des lettres
      .replace(/[\u0300-\u036f]/g, "") // Supprime les accents
      .replace(/[^a-z0-9]+/g, "-") // Remplace tout ce qui n'est pas lettre ou chiffre par un tiret
      .replace(/(^-|-$)/g, ""); // Supprime les tirets au début et à la fin

  /**
   * Enregistre une nouvelle catégorie dans la base de données.
   */
  const addCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const { error } = await supabase.from("categories").insert({
      name: name.trim(),
      slug: slugify(name.trim()),
      type,
    });

    if (error) {
      toast({ title: "Erreur", description: error.message, variant: "destructive" });
      return;
    }

    toast({ title: "Catégorie ajoutée avec succès !" });
    setName(""); // Vide le champ
    fetchCategories(); // Rafraîchit la liste
  };

  /**
   * Valide la modification du nom d'une catégorie.
   */
  const updateCategory = async (id: string) => {
    if (!editName.trim()) return;
    const { error } = await supabase
      .from("categories")
      .update({ name: editName.trim(), slug: slugify(editName.trim()) })
      .eq("id", id);

    if (error) {
      toast({ title: "Erreur", description: error.message, variant: "destructive" });
      return;
    }

    toast({ title: "Catégorie mise à jour !" });
    setEditingId(null);
    fetchCategories();
  };

  /**
   * Supprime une catégorie.
   * Attention : Supabase peut refuser si des articles utilisent cette catégorie.
   */
  const deleteCategory = async (id: string) => {
    if (!confirm("Voulez-vous vraiment supprimer cette catégorie ?")) return;
    const { error } = await supabase.from("categories").delete().eq("id", id);
    if (error) {
      toast({ title: "Erreur", description: "Impossible de supprimer : cette catégorie est probablement déjà utilisée par des contenus.", variant: "destructive" });
    } else {
      toast({ title: "Catégorie supprimée" });
      fetchCategories();
    }
  };

  // Noms lisibles pour les types techniques
  const typeLabels: Record<string, string> = {
    radio: "Radio",
    tv: "Télévision",
    article: "Articles",
    image: "Images",
    job: "Jobs & Emplois",
    sport: "Actualités Sports",
  };

  // On regroupe les catégories par leur type pour un affichage plus clair
  const grouped = categories.reduce((acc, cat) => {
    if (!acc[cat.type]) acc[cat.type] = [];
    acc[cat.type].push(cat);
    return acc;
  }, {} as Record<string, Category[]>);

  return (
    <div className="space-y-6">
      
      {/* --- FORMULAIRE D'AJOUT --- */}
      <form onSubmit={addCategory} className="glass-card p-6 flex flex-col sm:flex-row gap-3">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Nom de la nouvelle catégorie (ex: Politique)"
          className="flex-1 bg-muted border border-border rounded-lg px-4 py-3 text-foreground focus:ring-2 focus:ring-primary/50"
        />
        <select
          value={type}
          onChange={(e) => setType(e.target.value)}
          className="bg-muted border border-border rounded-lg px-4 py-3 text-foreground"
        >
          <option value="radio">Radio</option>
          <option value="tv">Télévision</option>
          <option value="article">Articles</option>
          <option value="image">Images</option>
          <option value="job">Jobs et Offres d'emploi</option>
          <option value="sport">Sports</option>
        </select>
        <button type="submit" className="btn-primary-glow flex items-center justify-center gap-2 whitespace-nowrap">
          <Plus size={16} /> Créer la catégorie
        </button>
      </form>

      {/* --- AFFICHAGE PAR GROUPES --- */}
      {Object.entries(grouped).map(([catType, cats]) => (
        <div key={catType} className="space-y-3">
          <h3 className="font-display text-lg text-primary tracking-widest uppercase border-b border-primary/20 pb-2">
            Section : {typeLabels[catType] || catType}
          </h3>
          <div className="grid gap-2">
            {cats.map((cat) => (
              <div key={cat.id} className="glass-card p-4 flex items-center justify-between gap-4 hover:border-primary/20 transition-all">
                <div className="flex-1">
                  {editingId === cat.id ? (
                    // Mode Édition (Modification du nom)
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="flex-1 bg-background border border-primary/30 rounded px-2 py-1 text-sm text-foreground focus:shadow-[0_0_10px_rgba(var(--primary),0.3)] transition-all"
                        autoFocus
                      />
                      <button onClick={() => updateCategory(cat.id)} className="text-primary hover:text-primary/70 transition-colors" title="Valider">
                        <Check size={18} />
                      </button>
                      <button onClick={() => setEditingId(null)} className="text-muted-foreground hover:text-foreground" title="Annuler">
                        <X size={18} />
                      </button>
                    </div>
                  ) : (
                    // Mode Lecture (Affichage normal)
                    <>
                      <p className="text-foreground font-medium">{cat.name}</p>
                      <p className="text-[10px] text-muted-foreground uppercase tracking-widest">URL : /{cat.slug}</p>
                    </>
                  )}
                </div>
                
                {/* Actions (Editer / Supprimer) */}
                <div className="flex items-center gap-1">
                  {editingId !== cat.id && (
                    <button
                      onClick={() => { setEditingId(cat.id); setEditName(cat.name); }}
                      className="p-2 rounded-lg hover:bg-primary/10 transition-colors text-muted-foreground hover:text-primary"
                      title="Modifier le nom"
                    >
                      <Edit2 size={16} />
                    </button>
                  )}
                  <button
                    onClick={() => deleteCategory(cat.id)}
                    className="p-2 rounded-lg hover:bg-destructive/10 transition-colors text-muted-foreground hover:text-destructive"
                    title="Supprimer la catégorie"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* Message si aucune catégorie n'existe */}
      {categories.length === 0 && (
        <div className="glass-card p-10 text-center text-muted-foreground italic">
          Aucune catégorie n'a encore été créée pour le moment.
        </div>
      )}
    </div>
  );
};

export default AdminCategories;
