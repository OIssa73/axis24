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
  const [liveContent, setLiveContent] = useState<VideoContent | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchVideos = async () => {
      const { data } = await supabase
        .from("content")
        .select("*")
        .eq("type", "video")
        .eq("is_published", true)
        .order("created_at", { ascending: false });
      if (data) {
        const live = data.find((d) => d.is_live);
        if (live) setLiveContent(live);
        setReplays(data.filter((d) => !d.is_live));
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

        {/* Live TV Player */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="glass-card overflow-hidden max-w-4xl mx-auto mb-16"
        >
          <div className="relative aspect-video bg-muted flex items-center justify-center">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-secondary/10" />
            <div className="text-center z-10">
              <button className="w-20 h-20 rounded-full bg-primary/90 flex items-center justify-center text-primary-foreground hover:scale-105 transition-transform mb-4 mx-auto">
                <Play size={36} className="ml-1" />
              </button>
              <p className="text-foreground font-display text-xl tracking-wider">DIRECT TV</p>
            </div>
            <div className="absolute top-4 left-4 flex items-center gap-2 bg-primary/90 px-3 py-1 rounded text-primary-foreground text-xs font-semibold">
              <span className="w-2 h-2 rounded-full bg-primary-foreground animate-pulse" />
              LIVE
            </div>
          </div>
          <div className="p-4">
            <h3 className="font-display text-lg text-foreground tracking-wide">
              {liveContent?.title || "En attente de diffusion"}
            </h3>
            <p className="text-muted-foreground text-sm">
              {liveContent?.description || "Aucun programme en direct actuellement"}
            </p>
          </div>
        </motion.div>

        {/* Replays */}
        <h3 className="font-display text-2xl text-foreground tracking-wide mb-6">Replays</h3>
        {loading ? (
          <p className="text-muted-foreground text-center">Chargement...</p>
        ) : replays.length === 0 ? (
          <p className="text-muted-foreground text-center">Aucun replay disponible pour le moment.</p>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {replays.map((replay, i) => (
              <motion.div
                key={replay.id}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="glass-card overflow-hidden group cursor-pointer hover:border-primary/30 transition-colors"
              >
                <div className="aspect-video bg-muted flex items-center justify-center relative overflow-hidden">
                  {replay.thumbnail_url ? (
                    <img src={replay.thumbnail_url} alt={replay.title} className="w-full h-full object-cover" loading="lazy" />
                  ) : (
                    <Play size={36} className="text-muted-foreground" />
                  )}
                  <div className="absolute inset-0 bg-background/0 group-hover:bg-background/50 transition-colors flex items-center justify-center">
                    <Play size={36} className="text-primary-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </div>
                <div className="p-4">
                  <h4 className="font-semibold text-foreground text-sm">{replay.title}</h4>
                  <div className="flex items-center gap-3 text-muted-foreground text-xs mt-1">
                    <span className="flex items-center gap-1">
                      <Clock size={12} /> {new Date(replay.created_at).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}
                    </span>
                    <span className="flex items-center gap-1">
                      <Eye size={12} /> {replay.views_count || 0}
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
