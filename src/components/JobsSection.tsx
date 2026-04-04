import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Calendar, Briefcase, ChevronRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";
import { useLanguage } from "@/context/LanguageContext";

interface JobArticle {
  id: string;
  title: string;
  description: string | null;
  thumbnail_url: string | null;
  created_at: string;
  category_id: string | null;
  categories?: { name: string } | null;
}

interface Props {
  title?: string;
  subtitle?: string;
}

const JobsSection = ({ title = "JOBS ET OFFRES D'EMPLOI", subtitle = "Découvrez nos offres d'emploi et opportunités de carrière." }: Props) => {
  const [jobs, setJobs] = useState<JobArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const { t, language } = useLanguage();

  useEffect(() => {
    const fetchJobs = async () => {
      const { data } = await supabase
        .from("content")
        .select("*, categories(name)")
        .eq("type", "article") // Nous utilisons désormais le conteneur 'article'
        .contains("tags", ["job"]) // Et nous filtrons par le tag job
        .eq("is_published", true)
        .order("created_at", { ascending: false });
      if (data) {
        setJobs(data as unknown as JobArticle[]);
      }
      setLoading(false);
    };
    fetchJobs();
  }, []);

  return (
    <section id="jobs" className="py-12 bg-background relative overflow-hidden">
      <div className="container mx-auto px-4 relative z-10">
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

        {loading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map(i => (
              <div key={i} className="aspect-[4/5] rounded-2xl bg-muted animate-pulse" />
            ))}
          </div>
        ) : jobs.length === 0 ? (
          <p className="text-muted-foreground text-center py-20">
            {t("Aucune offre d'emploi pour le moment.")}
          </p>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {jobs.slice(0, 6).map((job, i) => (
              <motion.article
                key={job.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.05 }}
                className="group flex flex-col bg-muted/20 rounded-3xl overflow-hidden border border-border/50 hover:border-primary/30 hover:bg-background transition-all"
              >
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
                  <div className="absolute top-4 left-4">
                    <span className="bg-primary/90 backdrop-blur-md text-white px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider">
                      {job.categories?.name || "Emploi"}
                    </span>
                  </div>
                </Link>
                
                <div className="p-6 flex-1 flex flex-col">
                  <div className="flex items-center gap-3 text-[10px] text-muted-foreground mb-4 font-bold uppercase tracking-widest">
                    <Calendar size={12} className="text-primary" />
                    {new Date(job.created_at).toLocaleDateString(language === "en" ? "en-US" : "fr-FR")}
                  </div>
                  
                  <h3 className="font-display text-xl leading-tight text-foreground group-hover:text-primary transition-colors line-clamp-2 mb-3">
                    {job.title}
                  </h3>
                  
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-6 flex-1">
                    {job.description}
                  </p>
                  
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
