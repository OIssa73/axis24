// Importation des outils React de base
import { useState, useEffect } from "react";
// Importation des outils d'animation
import { motion } from "framer-motion";
// Importation des icônes (Trophée, Calendrier, Flèche)
import { Calendar, Trophy, ChevronRight } from "lucide-react";
// Importation de la connexion à la base de données
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";
import { useLanguage } from "@/context/LanguageContext";

// Structure d'un Article de sport dans le code
interface Article {
  id: string;
  title: string;
  description: string | null;
  thumbnail_url: string | null;
  created_at: string;
  categories?: { name: string } | null;
  tags?: string[] | null;
}

// Paramètres personnalisables pour cette section
interface Props {
  title?: string;
  subtitle?: string;
}

/**
 * Composant SPORTS SECTION (Section des Sports).
 * Il filtre et affiche les actualités sportives du site.
 */
const SportsSection = ({ title = "Axis 24 SPORTS", subtitle = "Toute l'actualité sportive en direct." }: Props) => {
  // États pour stocker les articles de sport et savoir si on charge encore
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const { t, language } = useLanguage();

  /**
   * Fonction qui va chercher les articles dans la base de données.
   * On récupère une liste large, puis on filtre seulement ceux qui concernent le sport.
   */
  useEffect(() => {
    const fetchArticles = async () => {
      const { data } = await supabase
        .from("content") // Dans la table des contenus
        .select("*, categories(name)") // On prend tout + le nom de la catégorie
        .in("type", ["article", "video", "image", "sport"]) // On accepte plusieurs types techniques
        .eq("is_published", true) // Uniquement ceux publiés
        .order("created_at", { ascending: false }); // Du plus récent au plus ancien
        
      if (data) {
        // --- LOGIQUE DE FILTRAGE ---
        // On ne garde que ceux qui sont dans une catégorie "Sport" ou qui ont le type natif "sport"
        const sportsArticles = (data as unknown as Article[]).filter(
          a => a.categories?.name === "Sport" || a.categories?.name === "Sports" || (a as unknown as { type: string }).type === "sport"
        );
        setArticles(sportsArticles);
      }
      setLoading(false); // Chargement terminé
    };
    fetchArticles();
  }, []);

  return (
    <section id="sports" className="py-12 bg-background relative overflow-hidden">
      <div className="container mx-auto px-4 relative z-10">
        
        {/* --- EN-TÊTE DE LA SECTION --- */}
        <motion.div
           initial={{ opacity: 0, y: 20 }}
           whileInView={{ opacity: 1, y: 0 }}
           viewport={{ once: true }}
           className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-widest mb-4">
            <Trophy size={12} /> SPORTS
          </div>
          <h2 className="section-heading text-foreground uppercase">{t(title)}</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto mt-4">
            {t(subtitle)}
          </p>
        </motion.div>

        {/* --- GRILLE D'AFFICHAGE DES ARTICLES DE SPORT --- */}
        {loading ? (
          // Affichage du squelette de chargement
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map(i => (
              <div key={i} className="aspect-[4/5] rounded-2xl bg-muted animate-pulse" />
            ))}
          </div>
        ) : articles.length === 0 ? (
          // Message si aucune actualité sportive n'est trouvée
          <p className="text-muted-foreground text-center py-20">
            {t("Aucun contenu sportif.")}
          </p>
        ) : (
          // Grille des cartes sports
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* On limite l'affichage à 6 articles sur l'accueil */}
            {articles.slice(0, 6).map((article, i) => (
              <motion.article
                key={article.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.05 }}
                className="group flex flex-col bg-muted/20 rounded-3xl overflow-hidden border border-border/50 hover:border-primary/30 hover:bg-background transition-all"
              >
                {/* Photo de l'article */}
                <Link to={`/content/${article.id}`} className="aspect-[16/10] overflow-hidden relative">
                  {article.thumbnail_url ? (
                    <img 
                      src={article.thumbnail_url} 
                      alt={article.title} 
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                    />
                  ) : (
                    <div className="w-full h-full bg-primary/5 flex items-center justify-center">
                      <Trophy size={40} className="text-primary/20" />
                    </div>
                  )}
                  {/* Badge de catégorie */}
                  <div className="absolute top-4 left-4">
                    <span className="bg-primary/90 backdrop-blur-md text-white px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider">
                      {article.categories?.name || "Sport"}
                    </span>
                  </div>
                </Link>
                
                {/* Informations sur l'article */}
                <div className="p-6 flex-1 flex flex-col">
                  {/* Date de l'évènement ou de l'article */}
                  <div className="flex items-center gap-3 text-[10px] text-muted-foreground mb-4 font-bold uppercase tracking-widest">
                    <Calendar size={12} className="text-primary" />
                    {new Date(article.created_at).toLocaleDateString(language === "en" ? "en-US" : "fr-FR")}
                  </div>
                  
                  {/* Titre du sujet sportif */}
                  <h3 className="font-display text-xl leading-tight text-foreground group-hover:text-primary transition-colors line-clamp-2 mb-3">
                    {article.title}
                  </h3>
                  
                  {/* Description courte */}
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-6 flex-1">
                    {article.description}
                  </p>
                  
                  {/* Lien cliquable pour lire l'article complet */}
                  <Link 
                    to={`/content/${article.id}`} 
                    className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-primary group-hover:gap-3 transition-all"
                  >
                    {t("read_more")} <ChevronRight size={14} />
                  </Link>
                </div>
              </motion.article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default SportsSection;
