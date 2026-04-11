// Importation des outils de React pour gérer l'affichage et le chargement des données
import { useState, useEffect } from "react";
// Importation des outils d'animation (Framer Motion)
import { motion, AnimatePresence } from "framer-motion";
// Importation des icônes (Calendrier, Journal, Flèche)
import { Calendar, Newspaper, ChevronRight } from "lucide-react";
// Importation de la connexion à la base de données
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";
import { useLanguage } from "@/context/LanguageContext";

// Structure d'un Article dans le code
interface Article {
  id: string;
  title: string;
  description: string | null;
  thumbnail_url: string | null;
  created_at: string;
  content_type: string;
  category_id: string | null;
  categories?: { name: string } | null; // Nom de la catégorie associée
  tags?: string[] | null; // Étiquettes (mots-clés)
}

// Paramètres que l'on peut passer à ce composant
interface Props {
  title?: string;
  subtitle?: string;
}

/**
 * Composant NEWS SECTION (Section des actualités).
 * Il s'occupe de récupérer les articles du "Mag" et de les afficher.
 */
const NewsSection = ({ title = "LE MAG AXIS24", subtitle = "Toute l'information décryptée pour vous." }: Props) => {
  // États pour stocker les articles, l'état de chargement et l'onglet actif (catégorie)
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("Tous");
  const { t, language } = useLanguage();

  /**
   * Fonction qui va chercher les articles dans la base de données Supabase.
   * Elle se déclenche une seule fois à l'ouverture de la section.
   */
  useEffect(() => {
    const fetchArticles = async () => {
      const { data } = await supabase
        .from("content") // On regarde dans la table "content"
        .select("*, categories(name)") // On prend tout, + le nom de la catégorie
        .eq("type", "article") // Uniquement les contenus de type "article"
        .eq("is_published", true) // Uniquement ceux qui sont publiés
        .order("created_at", { ascending: false }); // Du plus récent au plus ancien
      
      if (data) {
        // --- FILTRAGE DE SÉCURITÉ ---
        // On exclut les articles qui sont marqués "job" ou "sport" car ils ont leurs propres sections
        const newsArticles = (data as any[]).filter(
          a => !(a.tags && (a.tags.includes("job") || a.tags.includes("sport")))
        );
        setArticles(newsArticles as unknown as Article[]);
      }
      setLoading(false); // Le chargement est fini
    };
    fetchArticles();
  }, []);

  // On crée la liste des catégories disponibles pour les boutons de filtrage
  const categories = [language === "fr" ? "Tous" : "All", ...Array.from(new Set(articles.map(a => a.categories?.name || "Général")))];

  // On filtre les articles affichés selon l'onglet (catégorie) sur lequel l'utilisateur a cliqué
  const filteredArticles = (activeTab === "Tous" || activeTab === "All")
    ? articles 
    : articles.filter(a => (a.categories?.name || "Général") === activeTab);

  return (
    <section id="news" className="py-12 bg-background relative overflow-hidden">
      <div className="container mx-auto px-4 relative z-10">
        
        {/* --- EN-TÊTE DE LA SECTION --- */}
        <motion.div
           initial={{ opacity: 0, y: 20 }}
           whileInView={{ opacity: 1, y: 0 }}
           viewport={{ once: true }}
           className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-widest mb-4">
            <Newspaper size={12} /> {t("actualites")}
          </div>
          <h2 className="section-heading text-foreground uppercase">{t(title)}</h2>
          <p className="text-muted-foreground text-sm max-w-2xl mx-auto mt-4">{t(subtitle)}</p>
        </motion.div>

        {/* --- BARRE DE FILTRAGE PAR CATÉGORIES (Onglets) --- */}
        {categories.length > 1 && (
          <div className="flex flex-wrap justify-center gap-2 mb-12">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveTab(cat)}
                className={`px-5 py-2 rounded-full text-xs font-bold uppercase tracking-widest transition-all ${
                  activeTab === cat 
                  ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20 scale-105" 
                  : "bg-muted text-muted-foreground hover:bg-primary/10 hover:text-primary"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        )}

        {loading ? (
          // Squelette de chargement (rectangles gris qui bougent)
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map(i => (
              <div key={i} className="aspect-[4/5] rounded-2xl bg-muted animate-pulse" />
            ))}
          </div>
        ) : filteredArticles.length === 0 ? (
          <p className="text-muted-foreground text-center py-20">Aucun article dans cette catégorie.</p>
        ) : (
          <AnimatePresence mode="wait">
            <motion.div 
              key={activeTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8"
            >
              {/* On n'affiche que les 6 premiers articles sur l'accueil */}
              {filteredArticles.slice(0, 6).map((article, i) => (
                <motion.article
                  key={article.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.05 }}
                  className="group flex flex-col bg-muted/20 rounded-3xl overflow-hidden border border-border/50 hover:border-primary/30 hover:bg-background transition-all"
                >
                  {/* Image de l'article */}
                  <Link to={`/content/${article.id}`} className="aspect-[16/10] overflow-hidden relative">
                    {article.thumbnail_url ? (
                      <img 
                        src={article.thumbnail_url} 
                        alt={article.title} 
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                      />
                    ) : (
                      <div className="w-full h-full bg-primary/5 flex items-center justify-center">
                        <Newspaper size={40} className="text-primary/20" />
                      </div>
                    )}
                    {/* Badge de catégorie sur l'image */}
                    <div className="absolute top-4 left-4">
                      <span className="bg-primary/90 backdrop-blur-md text-white px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider">
                        {article.categories?.name || "Infos"}
                      </span>
                    </div>
                  </Link>
                  
                  {/* Détails de l'article (Titre, Date, Description) */}
                  <div className="p-6 flex-1 flex flex-col">
                    <div className="flex items-center gap-3 text-[10px] text-muted-foreground mb-4 font-bold uppercase tracking-widest">
                      <Calendar size={12} className="text-primary" />
                      {new Date(article.created_at).toLocaleDateString(language === "en" ? "en-US" : "fr-FR")}
                    </div>
                    
                    <h3 className="font-display text-xl leading-tight text-foreground group-hover:text-primary transition-colors line-clamp-2 mb-3">
                      {article.title}
                    </h3>
                    
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-6 flex-1 text-justify md:[text-justify:inter-character] break-words min-w-0 w-full overflow-hidden">
                      {article.description}
                    </p>
                    
                    {/* Lien "Lire la suite" */}
                    <Link 
                      to={`/content/${article.id}`} 
                      className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-primary group-hover:gap-3 transition-all"
                    >
                      {t("read_more")} <ChevronRight size={14} />
                    </Link>
                  </div>
                </motion.article>
              ))}
            </motion.div>
          </AnimatePresence>
        )}
        
        {/* Bouton "Voir tout" si il y a plus de 6 articles */}
        {filteredArticles.length > 6 && (
           <div className="mt-16 text-center">
             <Link to="/actualites" className="btn-primary-glow px-8 py-3 rounded-full text-xs font-bold uppercase tracking-[0.2em]">
               {t("view_all")}
             </Link>
           </div>
        )}
      </div>
    </section>
  );
};

export default NewsSection;
