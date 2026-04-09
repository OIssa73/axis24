// Importation des outils de React pour gérer l'affichage et le chargement des données
import { useState, useEffect } from "react";
// Importation des outils d'animation (Framer Motion)
import { motion, AnimatePresence } from "framer-motion";
// Importation des icônes (Calendrier, Mallette, Flèche)
import { Calendar, Briefcase, ChevronRight } from "lucide-react";
// Importation de la connexion à la base de données Supabase
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";
import { useLanguage } from "@/context/LanguageContext";

// Structure d'une Offre d'Emploi dans le code
interface JobArticle {
  id: string;
  title: string;
  description: string | null;
  thumbnail_url: string | null;
  created_at: string;
  category_id: string | null;
  categories?: { name: string } | null; // Nom de la catégorie associée (ex: "CDI", "Stage")
}

// Paramètres que l'on peut passer à ce composant (Titre et Sous-titre personnalisables)
interface Props {
  title?: string;
  subtitle?: string;
}

/**
 * Composant JOBS SECTION (Section des offres d'emploi).
 * Il s'occupe de récupérer les contenus marqués comme "job" et de les afficher proprement.
 */
const JobsSection = ({ title = "JOBS ET OFFRES D'EMPLOI", subtitle = "Découvrez nos offres d'emploi et opportunités de carrière." }: Props) => {
  // États pour stocker les offres d'emploi et l'indicateur de chargement
  const [jobs, setJobs] = useState<JobArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const { t, language } = useLanguage(); // Outil de traduction et détection de la langue

  /**
   * Fonction qui va chercher les offres d'emploi dans la base de données.
   * Elle se déclenche une seule fois à l'affichage de la section.
   */
  useEffect(() => {
    const fetchJobs = async () => {
      const { data } = await supabase
        .from("content") // On regarde dans la table "content" (contenus)
        .select("*, categories(name)") // On prend tout, + le nom de la catégorie
        .eq("type", "job") // On ne veut QUE les contenus de type "job"
        .eq("is_published", true) // Uniquement ceux qui sont publiés officiellement
        .order("created_at", { ascending: false }); // Du plus récent au plus ancien
      
      if (data) {
        setJobs(data as unknown as JobArticle[]); // On enregistre les données reçues
      }
      setLoading(false); // On arrête l'animation de chargement
    };
    fetchJobs();
  }, []);

  return (
    <section id="jobs" className="py-12 bg-background relative overflow-hidden">
      <div className="container mx-auto px-4 relative z-10">
        
        {/* --- EN-TÊTE DE LA SECTION --- */}
        <motion.div
           initial={{ opacity: 0, y: 20 }}
           whileInView={{ opacity: 1, y: 0 }}
           viewport={{ once: true }}
           className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-widest mb-4">
            <Briefcase size={12} /> {t("Emploi")}
          </div>
          <h2 className="section-heading text-foreground uppercase">{t(title)}</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto mt-4">
            {t(subtitle)}
          </p>
        </motion.div>

        {/* --- ZONE D'AFFICHAGE DES JOBS --- */}
        {loading ? (
          // Affichage de rectangles "squelettes" pendant que les données arrivent
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map(i => (
              <div key={i} className="aspect-[4/5] rounded-2xl bg-muted animate-pulse" />
            ))}
          </div>
        ) : jobs.length === 0 ? (
          // Message si aucune offre n'est disponible
          <p className="text-muted-foreground text-center py-20">
            {t("Aucune offre d'emploi pour le moment.")}
          </p>
        ) : (
          // Grille affichant les cartes d'emploi
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* On affiche un maximum de 6 offres sur la page d'accueil */}
            {jobs.slice(0, 6).map((job, i) => (
              <motion.article
                key={job.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.05 }}
                className="group flex flex-col bg-muted/20 rounded-3xl overflow-hidden border border-border/50 hover:border-primary/30 hover:bg-background transition-all"
              >
                {/* Image d'illustration de l'offre */}
                <Link to={`/content/${job.id}`} className="aspect-[16/10] overflow-hidden relative">
                  {job.thumbnail_url ? (
                    <img 
                      src={job.thumbnail_url} 
                      alt={job.title} 
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                    />
                  ) : (
                    <div className="w-full h-full bg-primary/5 flex items-center justify-center">
                      <Briefcase size={40} className="text-primary/20" />
                    </div>
                  )}
                  {/* Petit badge montrant la catégorie sur l'image */}
                  <div className="absolute top-4 left-4">
                    <span className="bg-primary/90 backdrop-blur-md text-white px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider">
                      {job.categories?.name || "Emploi"}
                    </span>
                  </div>
                </Link>
                
                {/* Détails de l'offre d'emploi */}
                <div className="p-6 flex-1 flex flex-col">
                  {/* Date de publication */}
                  <div className="flex items-center gap-3 text-[10px] text-muted-foreground mb-4 font-bold uppercase tracking-widest">
                    <Calendar size={12} className="text-primary" />
                    {new Date(job.created_at).toLocaleDateString(language === "en" ? "en-US" : "fr-FR")}
                  </div>
                  
                  {/* Titre de l'emploi (ex: Développeur Web) */}
                  <h3 className="font-display text-xl leading-tight text-foreground group-hover:text-primary transition-colors line-clamp-2 mb-3">
                    {job.title}
                  </h3>
                  
                  {/* Court résumé du poste */}
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-6 flex-1">
                    {job.description}
                  </p>
                  
                  {/* Bouton cliquable pour aller voir les détails et postuler */}
                  <Link 
                    to={`/content/${job.id}`} 
                    className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-primary group-hover:gap-3 transition-all"
                  >
                    {t("POSTULER")} <ChevronRight size={14} />
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

export default JobsSection;
