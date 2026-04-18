import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
// Importation de Framer Motion pour les animations de liste
import { motion, AnimatePresence } from "framer-motion";
// Importation des composants globaux
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import BackButton from "@/components/BackButton"; // Bouton de retour universel
// Importation de la connexion Supabase
import { supabase } from "@/integrations/supabase/client";

/** Structure d'un élément image récupéré en BDD */
interface ImageContent {
  id: string;
  title: string;
  description: string | null;
  tags: string[] | null;
  thumbnail_url: string | null;
  file_url: string | null;
  created_at: string;
  categories?: { name: string } | null;
}

/** Couleurs de badges par défaut pour les catégories */
const categoryColors: Record<string, string> = {
  Politique: "bg-primary/20 text-primary",
  Sport: "bg-primary/20 text-primary",
  Technologie: "bg-primary/20 text-primary",
  Culture: "bg-primary/20 text-primary",
  Économie: "bg-primary/20 text-primary",
  Santé: "bg-primary/20 text-primary",
};

/**
 * Composant INFO IMAGES.
 * Affiche une galerie de photos d'actualité filtrable par thématique.
 */
const InfoImages = () => {
  // --- ÉTATS ---
  const [active, setActive] = useState("Tout"); // Filtre de catégorie sélectionné
  const [items, setItems] = useState<ImageContent[]>([]); // Liste des images
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<string[]>(["Tout"]); // Liste des catégories disponibles
  const navigate = useNavigate();

  /**
   * Récupère toutes les images publiées.
   */
  useEffect(() => {
    const fetchImages = async () => {
      const { data } = await supabase
        .from("content")
        .select("*, categories(name)")
        .eq("type", "image")
        .eq("is_published", true)
        .order("created_at", { ascending: false });
      
      if (data) {
        setItems(data as unknown as ImageContent[]);
        
        // Extraction dynamique des catégories présentes dans les données pour créer les filtres
        const catNames = new Set<string>();
        (data as unknown as ImageContent[]).forEach((item) => {
          if (item.categories?.name) catNames.add(item.categories.name);
        });
        setCategories(["Tout", ...Array.from(catNames)]);
      }
      setLoading(false);
    };
    fetchImages();
  }, []);

  // Filtrage local en fonction de la catégorie active
  const filtered = active === "Tout" ? items : items.filter((a) => a.categories?.name === active);
  
  // Fonctions utilitaires pour le rendu
  const getTag = (item: ImageContent) => item.categories?.name || item.tags?.[0] || "Info";
  const getImage = (item: ImageContent) => item.file_url || item.thumbnail_url || "/placeholder.svg";

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-16">
        <BackButton />
        
        <section className="py-24 relative overflow-hidden">
          {/* Arrière-plan stylisé */}
          <div className="absolute inset-0 bg-gradient-to-b from-background via-muted/5 to-background" />
          
          <div className="container mx-auto px-4 relative z-10">
            {/* --- EN-TÊTE DE SECTION --- */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center mb-16"
            >
              <p className="text-primary font-bold text-xs uppercase tracking-[0.4em] mb-4">
                Le regard de la rédaction
              </p>
              <h1 className="section-heading text-foreground font-display text-3xl md:text-5xl uppercase tracking-widest">L'INFO EN IMAGES</h1>
              <p className="text-muted-foreground mt-4 max-w-2xl mx-auto italic">
                Découvrez l'essentiel de l'actualité à travers nos plus beaux clichés et reportages photographiques.
              </p>
            </motion.div>

            {/* --- BARRE DE FILTRES --- */}
            <div className="flex flex-wrap justify-center gap-3 mb-16 px-4">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActive(cat)}
                  className={`px-6 py-2.5 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all ${
                    active === cat
                      ? "bg-primary text-white shadow-lg shadow-primary/20 scale-105"
                      : "bg-muted/30 text-muted-foreground hover:bg-muted font-medium"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* --- GRILLE D'IMAGES --- */}
            {loading ? (
              <p className="text-center text-muted-foreground uppercase tracking-widest text-xs animate-pulse">Chargement de la galerie...</p>
            ) : filtered.length === 0 ? (
              <p className="text-center text-muted-foreground italic">Aucune image disponible dans cette catégorie.</p>
            ) : (
              <AnimatePresence mode="wait">
                <motion.div
                  key={active}
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.02 }}
                  transition={{ duration: 0.4 }}
                  className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8"
                >
                  {filtered.map((article, i) => (
                    <motion.article
                      key={article.id}
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                      onClick={() => navigate(`/content/${article.id}`)}
                      className="glass-card overflow-hidden group cursor-pointer hover:border-primary/40 border-border/50 transition-all shadow-xl shadow-black/5"
                    >
                      {/* Zone Média */}
                      <div className="relative overflow-hidden aspect-[4/3]">
                        <img
                          src={getImage(article)}
                          alt={article.title}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                          loading="lazy"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/10 to-transparent opacity-60" />
                        {/* Badge catégorie */}
                        <span
                          className={`absolute top-4 left-4 text-[9px] px-3 py-1.5 rounded-full font-bold uppercase tracking-widest shadow-lg ${categoryColors[getTag(article)] || "bg-primary/20 text-primary border border-primary/10"}`}
                        >
                          {getTag(article)}
                        </span>
                      </div>

                      {/* Zone Texte */}
                      <div className="p-6">
                        <p className="text-[10px] text-primary/60 font-bold uppercase tracking-[0.2em] mb-3">
                          {new Date(article.created_at).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}
                        </p>
                        <h3 className="font-display text-xl text-foreground tracking-wide mb-3 line-clamp-2 leading-tight group-hover:text-primary transition-colors">
                          {article.title}
                        </h3>
                        <p className="text-muted-foreground text-sm leading-relaxed line-clamp-3 opacity-80">
                          {article.description}
                        </p>
                      </div>
                    </motion.article>
                  ))}
                </motion.div>
              </AnimatePresence>
            )}
          </div>
        </section>
      </div>
      <Footer />
    </div>
  );
};

export default InfoImages;
