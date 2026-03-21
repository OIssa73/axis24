import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Calendar } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface Article {
  id: string;
  title: string;
  description: string | null;
  tags: string[] | null;
  created_at: string;
  thumbnail_url: string | null;
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
        .select("*")
        .eq("type", "article")
        .eq("is_published", true)
        .order("created_at", { ascending: false })
        .limit(4);
      if (data) setArticles(data);
      setLoading(false);
    };
    fetchArticles();
  }, []);

  if (loading) {
    return (
      <section id="actualites" className="py-24">
        <div className="container mx-auto px-4 text-center text-muted-foreground">Chargement...</div>
      </section>
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

  const featured = articles[0];
  const rest = articles.slice(1);
  const getTag = (article: Article) => article.tags?.[0] || "Actualité";

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

        <div className="grid lg:grid-cols-2 gap-6">
          <motion.article
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="glass-card p-6 md:p-8 flex flex-col justify-between group cursor-pointer hover:border-primary/30 transition-colors"
          >
            <div>
              <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${categoryColors[getTag(featured)] || "bg-primary/20 text-primary"}`}>
                {getTag(featured)}
              </span>
              <h3 className="font-display text-2xl md:text-3xl text-foreground tracking-wide mt-4 mb-3">
                {featured.title}
              </h3>
              <p className="text-muted-foreground leading-relaxed">{featured.description}</p>
            </div>
            <div className="flex items-center justify-between mt-6">
              <span className="text-muted-foreground text-sm flex items-center gap-1.5">
                <Calendar size={14} /> {new Date(featured.created_at).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}
              </span>
              <span className="text-primary flex items-center gap-1 text-sm font-medium group-hover:gap-2 transition-all">
                Lire la suite <ArrowRight size={14} />
              </span>
            </div>
          </motion.article>

          <div className="flex flex-col gap-4">
            {rest.map((article, i) => (
              <motion.article
                key={article.id}
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="glass-card p-5 group cursor-pointer hover:border-primary/30 transition-colors"
              >
                <div className="flex items-start gap-4">
                  <div className="flex-1 min-w-0">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${categoryColors[getTag(article)] || "bg-primary/20 text-primary"}`}>
                      {getTag(article)}
                    </span>
                    <h4 className="font-semibold text-foreground mt-2 line-clamp-2">{article.title}</h4>
                    <p className="text-muted-foreground text-sm mt-1 line-clamp-1">{article.description}</p>
                  </div>
                  <ArrowRight size={18} className="text-muted-foreground group-hover:text-primary transition-colors mt-2 shrink-0" />
                </div>
              </motion.article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default NewsSection;
