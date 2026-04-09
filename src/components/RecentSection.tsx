import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Calendar, Play, FileText, ChevronRight, Newspaper, Headphones, Trophy, Briefcase, Eye } from "lucide-react";
import { motion } from "framer-motion";
import { useLanguage } from "@/context/LanguageContext";

interface RecentItem {
  id: string;
  title: string;
  thumbnail_url: string | null;
  type: string;
  created_at: string;
  categories: { name: string } | null;
}

const RecentSection = () => {
  const [items, setItems] = useState<RecentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { t } = useLanguage();

  useEffect(() => {
    const fetchRecent = async () => {
      const { data } = await supabase
        .from("content")
        .select("id, title, thumbnail_url, type, created_at, categories(name)")
        .eq("is_published", true)
        .order("created_at", { ascending: false })
        .limit(4);

      if (data) setItems(data as unknown as RecentItem[]);
      setLoading(false);
    };

    fetchRecent();
  }, []);

  const getIconForType = (type: string) => {
    switch (type) {
      case "video": return <Play size={16} className="text-blue-400" />;
      case "audio": return <Headphones size={16} className="text-primary" />;
      case "job": return <Briefcase size={16} className="text-orange-400" />;
      case "sport": return <Trophy size={16} className="text-red-400" />;
      default: return <FileText size={16} className="text-green-400" />;
    }
  };

  if (loading || items.length === 0) return null;

  return (
    <section className="py-12 bg-muted/10 border-b border-border/50">
      <div className="container mx-auto px-4">
        
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary relative">
              <span className="w-2 h-2 rounded-full bg-primary absolute top-0 right-0 animate-pulse" />
              <Newspaper size={20} />
            </div>
            <div>
              <h2 className="text-xl font-display uppercase tracking-widest text-foreground">À la Une</h2>
              <p className="text-xs text-muted-foreground uppercase tracking-wider">Les dernières publications</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {items.map((item, idx) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
            >
              <Link 
                to={`/content/${item.id}`}
                className="group block relative overflow-hidden rounded-2xl glass-card border border-border/50 hover:border-primary/50 transition-all aspect-square sm:aspect-auto sm:h-64 h-64"
              >
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent z-10" />
                
                {item.thumbnail_url ? (
                  <img src={item.thumbnail_url} alt={item.title} className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                ) : (
                  <div className="absolute inset-0 bg-secondary/20 flex items-center justify-center">
                     <Eye className="opacity-20 w-1/3 h-1/3 text-primary" />
                  </div>
                )}
                
                <div className="absolute inset-0 p-5 flex flex-col justify-between z-20">
                  <div className="flex items-center justify-between">
                    <span className="bg-primary/90 backdrop-blur-md text-white text-[9px] font-bold uppercase tracking-widest px-3 py-1 rounded-full">
                      {item.categories?.name || "Information"}
                    </span>
                    <div className="w-8 h-8 rounded-full bg-black/50 backdrop-blur-md flex items-center justify-center border border-white/10 group-hover:bg-primary/50 transition-colors">
                      {getIconForType(item.type)}
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-[10px] text-white/70 uppercase tracking-widest font-bold">
                      <Calendar size={12} />
                      {new Date(item.created_at).toLocaleDateString("fr-FR")}
                    </div>
                    <h3 className="text-white font-display text-lg leading-tight line-clamp-3 group-hover:text-primary transition-colors">
                      {item.title}
                    </h3>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default RecentSection;
