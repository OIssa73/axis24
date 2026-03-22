import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import BackButton from "@/components/BackButton";
import { supabase } from "@/integrations/supabase/client";

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

const categoryColors: Record<string, string> = {
  Politique: "bg-primary/20 text-primary",
  Sport: "bg-green-500/20 text-green-400",
  Technologie: "bg-blue-500/20 text-blue-400",
  Culture: "bg-yellow-500/20 text-yellow-400",
  Économie: "bg-orange-500/20 text-orange-400",
  Santé: "bg-pink-500/20 text-pink-400",
};

const InfoImages = () => {
  const [active, setActive] = useState("Tout");
  const [items, setItems] = useState<ImageContent[]>([]);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<string[]>(["Tout"]);

  useEffect(() => {
    const fetchImages = async () => {
      const { data } = await supabase
        .from("content")
        .select("*, categories(name)")
        .eq("type", "image")
        .eq("is_published", true)
        .order("created_at", { ascending: false });
      if (data) {
        setItems(data as any);
        // Extract unique category names for filters
        const catNames = new Set<string>();
        data.forEach((item: any) => {
          if (item.categories?.name) catNames.add(item.categories.name);
        });
        setCategories(["Tout", ...Array.from(catNames)]);
      }
      setLoading(false);
    };
    fetchImages();
  }, []);

  const filtered = active === "Tout" ? items : items.filter((a) => a.categories?.name === active);
  const getTag = (item: ImageContent) => item.categories?.name || item.tags?.[0] || "Info";
  const getImage = (item: ImageContent) => item.file_url || item.thumbnail_url || "/placeholder.svg";

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-16">
        <BackButton />
        <section className="py-24 relative">
          <div className="absolute inset-0 bg-gradient-to-b from-background via-muted/10 to-background" />
          <div className="container mx-auto px-4 relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center mb-12"
            >
              <p className="text-primary font-semibold text-sm uppercase tracking-widest mb-2">
                L'info en images
              </p>
              <h1 className="section-heading text-foreground">INFOS EN IMAGES</h1>
              <p className="text-muted-foreground mt-4 max-w-2xl mx-auto">
                Retrouvez l'essentiel de l'actualité à travers des visuels percutants couvrant la politique, le sport, la technologie, la culture et bien plus.
              </p>
            </motion.div>

            {/* Category filters */}
            <div className="flex flex-wrap justify-center gap-2 mb-12">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActive(cat)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    active === cat
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted/30 text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {loading ? (
              <p className="text-center text-muted-foreground">Chargement...</p>
            ) : filtered.length === 0 ? (
              <p className="text-center text-muted-foreground">Aucun contenu pour le moment.</p>
            ) : (
              <AnimatePresence mode="wait">
                <motion.div
                  key={active}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                  className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6"
                >
                  {filtered.map((article, i) => (
                    <motion.article
                      key={article.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.08 }}
                      className="glass-card overflow-hidden group cursor-pointer hover:border-primary/30 transition-colors"
                    >
                      <div className="relative overflow-hidden aspect-[4/3]">
                        <img
                          src={getImage(article)}
                          alt={article.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          loading="lazy"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent" />
                        <span
                          className={`absolute top-3 left-3 text-xs px-2.5 py-1 rounded-full font-medium ${categoryColors[getTag(article)] || "bg-primary/20 text-primary"}`}
                        >
                          {getTag(article)}
                        </span>
                      </div>
                      <div className="p-5">
                        <p className="text-xs text-muted-foreground mb-2">
                          {new Date(article.created_at).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}
                        </p>
                        <h3 className="font-display text-lg text-foreground tracking-wide mb-2 line-clamp-2">
                          {article.title}
                        </h3>
                        <p className="text-muted-foreground text-sm leading-relaxed line-clamp-3">
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
