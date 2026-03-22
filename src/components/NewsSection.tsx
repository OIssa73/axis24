import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Calendar, ArrowRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";

interface Article {
  id: string;
  title: string;
  description: string | null;
  tags: string[] | null;
  created_at: string;
  thumbnail_url: string | null;
  categories?: { name: string } | null;
}

const categoryColors: Record<string, string> = {
  Politique: "bg-primary/20 text-primary",
  Média: "bg-secondary/20 text-secondary",
  Sport: "bg-green-500/20 text-green-400",
  Technologie: "bg-blue-500/20 text-blue-400",
  Culture: "bg-yellow-500/20 text-yellow-400",
  Économie: "bg-orange-500/20 text-orange-400",
  Santé: "bg-pink-500/20 text-pink-400",
};

const NewsSection = () => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchArticles = async () => {
      const { data } = await supabase
        .from("content")
        .select("*, categories(name)")
        .eq("type", "article")
        .eq("is_published", true)
        .order("created_at", { ascending: false })
        .limit(10);
      if (data) setArticles(data as any);
      setLoading(false);
    };
    fetchArticles();
  }, []);

  if (loading) {
    return (
      <div className="py-24 text-center text-muted-foreground uppercase tracking-widest animate-pulse">
        Chargement des actualités...
      </div>
    );
  }

  if (articles.length === 0) {
    return (
      <section id="actualites" className="py-24">
        <div className="container mx-auto px-4 text-center">
          <p className="text-primary font-semibold text-sm uppercase tracking-widest mb-2">Restez informé</p>
          <h2 className="section-heading text-foreground">ACTUALITÉS</h2>
          <p className="text-muted-foreground mt-8">Aucune actualité pour le moment.</p>
        </div>
      </section>
    );
  }

  const groupedArticles = articles.reduce((acc, article) => {
    const catName = article.categories?.name || "Général";
    if (!acc[catName]) acc[catName] = [];
    acc[catName].push(article);
    return acc;
  }, {} as Record<string, Article[]>);

  return (
    <section id="actualites" className="py-24 relative">
      <div className="absolute inset-0 bg-gradient-to-b from-background via-muted/10 to-background" />
      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <p className="text-primary font-semibold text-sm uppercase tracking-widest mb-2">Restez informé</p>
          <h2 className="section-heading text-foreground">ACTUALITÉS</h2>
        </motion.div>

        <div className="space-y-20">
          {Object.entries(groupedArticles).map(([categoryName, catArticles]) => (
            <div key={categoryName} className="space-y-8">
              <div className="flex items-center gap-4 mb-8">
                <h3 className="font-display text-2xl md:text-3xl text-foreground tracking-wider uppercase">
                  {categoryName}
                </h3>
                <div className="h-[2px] flex-1 bg-gradient-to-r from-primary/50 to-transparent" />
              </div>

              <div className="grid lg:grid-cols-2 gap-6">
                {/* Feature the first article in the category group if it exists */}
                {catArticles.length > 0 && (
                  <Link to={`/content/${catArticles[0].id}`}>
                    <motion.article
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      className="glass-card p-6 md:p-8 h-full flex flex-col justify-between group cursor-pointer hover:border-primary/50 transition-all hover:shadow-2xl hover:shadow-primary/10"
                    >
                      <div>
                        <h3 className="font-display text-2xl text-foreground tracking-wide mb-3 group-hover:text-primary transition-colors">
                          {catArticles[0].title}
                        </h3>
                        <p className="text-muted-foreground leading-relaxed line-clamp-3">{catArticles[0].description}</p>
                      </div>
                      <div className="flex items-center justify-between mt-6">
                        <span className="text-muted-foreground text-sm flex items-center gap-1.5 font-medium">
                          <Calendar size={14} /> {new Date(catArticles[0].created_at).toLocaleDateString("fr-FR", { day: "numeric", month: "long" })}
                        </span>
                        <span className="text-primary flex items-center gap-1 text-sm font-bold group-hover:gap-2 transition-all">
                          Lire la suite <ArrowRight size={14} />
                        </span>
                      </div>
                    </motion.article>
                  </Link>
                )}

                <div className="flex flex-col gap-4">
                  {catArticles.slice(1).map((article, i) => (
                    <Link key={article.id} to={`/content/${article.id}`}>
                      <motion.article
                        initial={{ opacity: 0, x: 20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: i * 0.1 }}
                        className="glass-card p-5 group cursor-pointer hover:border-primary/50 transition-all"
                      >
                        <div className="flex items-start gap-4">
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-foreground mt-1 line-clamp-2 group-hover:text-primary transition-colors">{article.title}</h4>
                            <p className="text-muted-foreground text-xs mt-1 line-clamp-1 italic">{article.description}</p>
                          </div>
                          <ArrowRight size={18} className="text-muted-foreground group-hover:text-primary transition-all mt-2 shrink-0 group-hover:translate-x-1" />
                        </div>
                      </motion.article>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default NewsSection;
