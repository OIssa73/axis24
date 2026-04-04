import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Plus, Trash2, Edit2, Check, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Category {
  id: string;
  name: string;
  slug: string;
  type: string;
  created_at: string;
}

const AdminCategories = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [name, setName] = useState("");
  const [type, setType] = useState("radio");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const { toast } = useToast();

  const fetchCategories = async () => {
    const { data } = await supabase.from("categories").select("*").order("type").order("name");
    if (data) setCategories(data as Category[]);
  };

  useEffect(() => { fetchCategories(); }, []);

  const slugify = (text: string) =>
    text.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

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

    toast({ title: "Catégorie ajoutée" });
    setName("");
    fetchCategories();
  };

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

    toast({ title: "Catégorie mise à jour" });
    setEditingId(null);
    fetchCategories();
  };

  const deleteCategory = async (id: string) => {
    const { error } = await supabase.from("categories").delete().eq("id", id);
    if (error) {
      toast({ title: "Erreur", description: "Impossible de supprimer une catégorie utilisée.", variant: "destructive" });
    } else {
      toast({ title: "Catégorie supprimée" });
      fetchCategories();
    }
  };

  const typeLabels: Record<string, string> = {
    radio: "Radio",
    tv: "Télévision",
    article: "Articles",
    image: "Images",
    job: "Jobs",
    sport: "Sports",
  };

  const grouped = categories.reduce((acc, cat) => {
    if (!acc[cat.type]) acc[cat.type] = [];
    acc[cat.type].push(cat);
    return acc;
  }, {} as Record<string, Category[]>);

  return (
    <div className="space-y-6">
      <form onSubmit={addCategory} className="glass-card p-6 flex flex-col sm:flex-row gap-3">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Nom de la catégorie"
          className="flex-1 bg-muted border border-border rounded-lg px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
        />
        <select
          value={type}
          onChange={(e) => setType(e.target.value)}
          className="bg-muted border border-border rounded-lg px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
        >
          <option value="radio">Radio</option>
          <option value="tv">Télévision</option>
          <option value="article">Articles</option>
          <option value="image">Images</option>
          <option value="job">Jobs et Offres d'emploi</option>
          <option value="sport">Sports</option>
        </select>
        <button type="submit" className="btn-primary-glow flex items-center gap-2 whitespace-nowrap">
          <Plus size={16} /> Ajouter
        </button>
      </form>

      {Object.entries(grouped).map(([type, cats]) => (
        <div key={type}>
          <h3 className="font-display text-lg text-foreground tracking-wider mb-3">
            {typeLabels[type] || type}
          </h3>
          <div className="space-y-2">
            {cats.map((cat) => (
              <div key={cat.id} className="glass-card p-4 flex items-center justify-between gap-4">
                <div className="flex-1">
                  {editingId === cat.id ? (
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="flex-1 bg-background border border-primary/30 rounded px-2 py-1 text-sm text-foreground focus:shadow-[0_0_10px_rgba(var(--primary),0.3)] transition-all"
                        autoFocus
                      />
                      <button onClick={() => updateCategory(cat.id)} className="text-primary hover:text-primary/70 transition-colors">
                        <Check size={18} />
                      </button>
                      <button onClick={() => setEditingId(null)} className="text-muted-foreground hover:text-foreground">
                        <X size={18} />
                      </button>
                    </div>
                  ) : (
                    <>
                      <p className="text-foreground font-medium">{cat.name}</p>
                      <p className="text-xs text-muted-foreground">/{cat.slug}</p>
                    </>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  {editingId !== cat.id && (
                    <button
                      onClick={() => { setEditingId(cat.id); setEditName(cat.name); }}
                      className="p-2 rounded-lg hover:bg-primary/10 transition-colors text-muted-foreground hover:text-primary"
                      title="Modifier"
                    >
                      <Edit2 size={16} />
                    </button>
                  )}
                  <button
                    onClick={() => deleteCategory(cat.id)}
                    className="p-2 rounded-lg hover:bg-destructive/10 transition-colors text-muted-foreground hover:text-destructive"
                    title="Supprimer"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}

      {categories.length === 0 && (
        <div className="glass-card p-10 text-center text-muted-foreground">
          Aucune catégorie créée.
        </div>
      )}
    </div>
  );
};

export default AdminCategories;
