import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Play, Clock, Eye } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface VideoContent {
  id: string;
  title: string;
  description: string | null;
  thumbnail_url: string | null;
  file_url: string | null;
  is_live: boolean | null;
  views_count: number | null;
  created_at: string;
}

const TVSection = () => {
  const [replays, setReplays] = useState<VideoContent[]>([]);
  const [loading, setLoading] = useState(true);
  const [playingId, setPlayingId] = useState<string | null>(null);

  useEffect(() => {
    const fetchVideos = async () => {
      const { data } = await supabase
        .from("content")
        .select("*")
        .eq("type", "video")
        .eq("is_published", true)
        .order("created_at", { ascending: false });
      if (data) {
        setReplays(data);
      }
      setLoading(false);
    };
    fetchVideos();
  }, []);

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

        {/* Replays */}
        <h3 className="font-display text-2xl text-foreground tracking-wide mb-6">Contenus Vidéo</h3>
        {loading ? (
          <p className="text-muted-foreground text-center">Chargement...</p>
        ) : replays.length === 0 ? (
          <p className="text-muted-foreground text-center">Aucun contenu disponible pour le moment.</p>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {replays.map((replay, i) => (
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
                    <video 
                      src={replay.file_url || ""} 
                      controls 
                      autoPlay 
                      className="w-full h-full object-contain bg-black"
                    />
                  ) : (
                    <>
                      {replay.thumbnail_url ? (
                        <img src={replay.thumbnail_url} alt={replay.title} className="w-full h-full object-cover" loading="lazy" />
                      ) : (
                        <Play size={36} className="text-muted-foreground" />
                      )}
                      <div 
                        className="absolute inset-0 bg-background/0 group-hover:bg-background/50 transition-colors flex items-center justify-center cursor-pointer"
                        onClick={() => setPlayingId(replay.id)}
                      >
                        <Play size={48} className="text-primary-foreground opacity-0 group-hover:opacity-100 transition-opacity drop-shadow-lg" />
                      </div>
                    </>
                  )}
                </div>
                <div className="p-4">
                  <h4 className="font-semibold text-foreground text-sm line-clamp-1">{replay.title}</h4>
                  <p className="text-muted-foreground text-xs mt-1 line-clamp-2">{replay.description}</p>
                  <div className="flex items-center gap-3 text-muted-foreground text-[10px] mt-3 uppercase tracking-tighter">
                    <span className="flex items-center gap-1">
                      <Clock size={10} /> {new Date(replay.created_at).toLocaleDateString("fr-FR")}
                    </span>
                    <span className="flex items-center gap-1">
                      <Eye size={10} /> {replay.views_count || 0} vues
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default TVSection;
