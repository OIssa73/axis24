import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Play, Clock, Eye, X, Info } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";

interface VideoContent {
  id: string;
  title: string;
  description: string | null;
  file_url: string | null;
  thumbnail_url: string | null;
  is_live: boolean;
  views_count: number;
  created_at: string;
  categories?: { name: string } | null;
}

const TVSection = () => {
  const [replays, setReplays] = useState<VideoContent[]>([]);
  const [loading, setLoading] = useState(true);
  const [playingId, setPlayingId] = useState<string | null>(null);

  useEffect(() => {
    const fetchVideos = async () => {
      const { data } = await supabase
        .from("content")
        .select("*, categories(name)")
        .eq("type", "video")
        .eq("is_published", true)
        .order("created_at", { ascending: false });
      if (data) {
        setReplays(data as any);
      }
      setLoading(false);
    };
    fetchVideos();
  }, []);

  const groupedReplays = replays.reduce((acc, replay) => {
    const catName = replay.categories?.name || "Général";
    if (!acc[catName]) acc[catName] = [];
    acc[catName].push(replay);
    return acc;
  }, {} as Record<string, VideoContent[]>);

  return (
    <section id="television" className="py-24">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <p className="text-secondary font-semibold text-sm uppercase tracking-widest mb-2">Streaming vidéo</p>
          <h2 className="section-heading text-foreground">
            TÉLÉVISION AXIS<span className="text-primary">24</span>
          </h2>
        </motion.div>

        {loading ? (
          <p className="text-muted-foreground text-center">Chargement...</p>
        ) : replays.length === 0 ? (
          <p className="text-muted-foreground text-center">Aucun contenu disponible pour le moment.</p>
        ) : (
          <div className="space-y-24">
            {Object.entries(groupedReplays).map(([categoryName, catVideos]) => (
              <div key={categoryName} className="space-y-8">
                <div className="flex items-center gap-4">
                  <h3 className="font-display text-2xl text-foreground tracking-wide uppercase px-4 border-l-4 border-primary">
                    {categoryName}
                  </h3>
                  <div className="h-px flex-1 bg-border/50" />
                </div>

                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {catVideos.map((replay, i) => (
                    <motion.div
                      key={replay.id}
                      initial={{ opacity: 0, y: 15 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.1 }}
                      className="glass-card overflow-hidden group hover:border-primary/30 transition-colors"
                    >
                      <div className="aspect-video bg-muted flex items-center justify-center relative overflow-hidden">
                        {playingId === replay.id ? (
                          <div className="relative w-full h-full group/player overflow-hidden">
                            <video 
                              src={replay.file_url || ""} 
                              controls 
                              autoPlay 
                              className="w-full h-full object-contain bg-black"
                            />
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                setPlayingId(null);
                              }}
                              className="absolute top-2 right-2 p-1.5 bg-background/80 hover:bg-primary hover:text-primary-foreground text-foreground rounded-full transition-all z-20 shadow-lg border border-border/50"
                              title="Fermer la vidéo"
                            >
                              <X size={16} />
                            </button>
                          </div>
                        ) : (
                          <>
                            {replay.thumbnail_url ? (
                              <img src={replay.thumbnail_url} alt={replay.title} className="w-full h-full object-cover" loading="lazy" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center bg-muted/50">
                                <Play size={48} className="text-muted-foreground/30" />
                              </div>
                            )}
                            <div 
                              className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all flex items-center justify-center cursor-pointer"
                              onClick={() => setPlayingId(replay.id)}
                            >
                              <div className="w-14 h-14 rounded-full bg-primary/90 flex items-center justify-center opacity-0 group-hover:opacity-100 scale-75 group-hover:scale-100 transition-all duration-300">
                                <Play size={24} className="text-white fill-current ml-1" />
                              </div>
                            </div>
                          </>
                        )}
                      </div>
                      <div className="p-4">
                        <h4 className="font-semibold text-foreground line-clamp-1 group-hover:text-primary transition-colors">{replay.title}</h4>
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{replay.description}</p>
                        
                        <div className="flex items-center justify-between mt-4 pt-4 border-t border-border/50">
                          <div className="flex items-center gap-3 text-[10px] text-muted-foreground font-medium uppercase tracking-wider">
                            <span className="flex items-center gap-1.5">
                              <Eye size={12} /> {replay.views_count || 0}
                            </span>
                            <span className="flex items-center gap-1.5">
                              <Clock size={12} /> {new Date(replay.created_at).toLocaleDateString("fr-FR")}
                            </span>
                          </div>
                          <Link to={`/content/${replay.id}`} className="text-primary hover:text-primary/80 transition-colors">
                            <Info size={16} />
                          </Link>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default TVSection;
