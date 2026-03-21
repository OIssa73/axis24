import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Play, Pause, SkipForward, Volume2, Download, Headphones } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface AudioContent {
  id: string;
  title: string;
  description: string | null;
  tags: string[] | null;
  file_url: string | null;
  is_live: boolean | null;
  created_at: string;
}

const RadioSection = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [podcasts, setPodcasts] = useState<AudioContent[]>([]);
  const [liveContent, setLiveContent] = useState<AudioContent | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAudio = async () => {
      const { data } = await supabase
        .from("content")
        .select("*")
        .eq("type", "audio")
        .eq("is_published", true)
        .order("created_at", { ascending: false });
      if (data) {
        const live = data.find((d) => d.is_live);
        if (live) setLiveContent(live);
        setPodcasts(data.filter((d) => !d.is_live));
      }
      setLoading(false);
    };
    fetchAudio();
  }, []);

  return (
    <section id="radio" className="py-24 relative">
      <div className="absolute inset-0 bg-gradient-to-b from-background via-muted/20 to-background" />
      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <p className="text-primary font-semibold text-sm uppercase tracking-widest mb-2">Streaming audio</p>
          <h2 className="section-heading text-foreground">
            RADIO AXIS<span className="text-primary">24</span>
          </h2>
        </motion.div>

        {/* Live Player */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="glass-card p-6 md:p-8 max-w-2xl mx-auto mb-16"
        >
          <div className="flex items-center gap-3 mb-6">
            <span className="w-3 h-3 rounded-full bg-primary animate-pulse" />
            <span className="text-primary font-semibold text-sm uppercase tracking-wider">En direct</span>
          </div>

          <div className="flex items-center gap-6">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="w-16 h-16 rounded-full bg-primary flex items-center justify-center text-primary-foreground hover:scale-105 transition-transform shrink-0"
            >
              {isPlaying ? <Pause size={28} /> : <Play size={28} className="ml-1" />}
            </button>

            <div className="flex-1 min-w-0">
              <h3 className="font-display text-xl text-foreground tracking-wide">
                {liveContent?.title || "Radio AXIS24"}
              </h3>
              <p className="text-muted-foreground text-sm">
                {liveContent?.description || "En attente de diffusion"}
              </p>
              <div className="mt-3 h-1 rounded-full bg-muted overflow-hidden">
                <div className="h-full w-1/3 rounded-full bg-primary transition-all" />
              </div>
            </div>

            <div className="hidden sm:flex items-center gap-3 text-muted-foreground">
              <SkipForward size={20} className="cursor-pointer hover:text-foreground transition-colors" />
              <Volume2 size={20} className="cursor-pointer hover:text-foreground transition-colors" />
            </div>
          </div>
        </motion.div>

        {/* Podcasts */}
        <div>
          <h3 className="font-display text-2xl text-foreground tracking-wide mb-6 flex items-center gap-2">
            <Headphones size={22} className="text-primary" />
            Podcasts & Émissions
          </h3>
          {loading ? (
            <p className="text-muted-foreground text-center">Chargement...</p>
          ) : podcasts.length === 0 ? (
            <p className="text-muted-foreground text-center">Aucun podcast disponible pour le moment.</p>
          ) : (
            <div className="grid sm:grid-cols-2 gap-4">
              {podcasts.map((pod, i) => (
                <motion.div
                  key={pod.id}
                  initial={{ opacity: 0, y: 15 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="glass-card p-5 flex items-center gap-4 group hover:border-primary/30 transition-colors"
                >
                  <button className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-foreground group-hover:bg-primary group-hover:text-primary-foreground transition-colors shrink-0">
                    <Play size={16} className="ml-0.5" />
                  </button>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-foreground truncate">{pod.title}</p>
                    <p className="text-muted-foreground text-sm">{pod.description || "Émission audio"}</p>
                  </div>
                  <span className="text-xs px-2 py-1 rounded bg-muted text-muted-foreground">
                    {pod.tags?.[0] || "Audio"}
                  </span>
                  {pod.file_url && (
                    <a href={pod.file_url} download>
                      <Download size={16} className="text-muted-foreground hover:text-foreground cursor-pointer transition-colors shrink-0" />
                    </a>
                  )}
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default RadioSection;
