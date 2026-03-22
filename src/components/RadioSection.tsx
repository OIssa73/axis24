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
  const [currentAudio, setCurrentAudio] = useState<AudioContent | null>(null);
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
        setPodcasts(data);
        if (data.length > 0) setCurrentAudio(data[0]);
      }
      setLoading(false);
    };
    fetchAudio();
  }, []);

  const togglePlay = (pod: AudioContent) => {
    if (currentAudio?.id === pod.id) {
      setIsPlaying(!isPlaying);
    } else {
      setCurrentAudio(pod);
      setIsPlaying(true);
    }
  };

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

        {/* Player Principal (Audio Aktuel) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="glass-card p-6 md:p-8 max-w-2xl mx-auto mb-16 border-primary/20"
        >
          <div className="flex items-center gap-6">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="w-16 h-16 rounded-full bg-primary flex items-center justify-center text-primary-foreground hover:scale-105 transition-transform shrink-0 shadow-lg shadow-primary/20"
            >
              {isPlaying ? <Pause size={28} /> : <Play size={28} className="ml-1" />}
            </button>

            <div className="flex-1 min-w-0">
              <span className="text-primary text-[10px] uppercase font-bold tracking-widest mb-1 block">
                {isPlaying ? "En lecture" : "Lecteur Audio"}
              </span>
              <h3 className="font-display text-xl text-foreground tracking-wide truncate">
                {currentAudio?.title || "AXIS24 Podcasts"}
              </h3>
              <p className="text-muted-foreground text-sm truncate">
                {currentAudio?.description || "Sélectionnez un podcast ci-dessous"}
              </p>
              
              {/* Invisible Audio Element */}
              {currentAudio?.file_url && (
                <audio
                  src={currentAudio.file_url}
                  autoPlay={isPlaying}
                  ref={(el) => {
                    if (el) {
                      if (isPlaying) el.play().catch(() => setIsPlaying(false));
                      else el.pause();
                    }
                  }}
                  onEnded={() => setIsPlaying(false)}
                />
              )}
            </div>

            <div className="hidden sm:flex items-center gap-3 text-muted-foreground">
              <Volume2 size={20} className="cursor-pointer hover:text-foreground transition-colors" />
            </div>
          </div>
        </motion.div>

        {/* Podcasts List */}
        <div>
          <h3 className="font-display text-2xl text-foreground tracking-wide mb-6 flex items-center gap-2">
            <Headphones size={22} className="text-primary" />
            Dernières Émissions
          </h3>
          {loading ? (
            <p className="text-muted-foreground text-center">Chargement...</p>
          ) : podcasts.length === 0 ? (
            <p className="text-muted-foreground text-center">Aucun contenu disponible pour le moment.</p>
          ) : (
            <div className="grid sm:grid-cols-2 gap-4">
              {podcasts.map((pod, i) => (
                <motion.div
                  key={pod.id}
                  initial={{ opacity: 0, y: 15 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className={`glass-card p-5 flex items-center gap-4 group transition-all duration-300 ${
                    currentAudio?.id === pod.id ? "border-primary/50 bg-primary/5" : "hover:border-primary/30"
                  }`}
                >
                  <button 
                    onClick={() => togglePlay(pod)}
                    className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors shrink-0 ${
                      currentAudio?.id === pod.id && isPlaying 
                        ? "bg-primary text-primary-foreground" 
                        : "bg-muted text-foreground group-hover:bg-primary group-hover:text-primary-foreground"
                    }`}
                  >
                    {currentAudio?.id === pod.id && isPlaying ? <Pause size={16} /> : <Play size={16} className="ml-0.5" />}
                  </button>
                  <div className="flex-1 min-w-0">
                    <p className={`font-semibold truncate ${currentAudio?.id === pod.id ? "text-primary" : "text-foreground"}`}>
                      {pod.title}
                    </p>
                    <p className="text-muted-foreground text-sm truncate">{pod.description || "Audio"}</p>
                  </div>
                  {pod.file_url && (
                    <a href={pod.file_url} download className="p-2 hover:bg-muted rounded-full transition-colors">
                      <Download size={16} className="text-muted-foreground hover:text-foreground cursor-pointer shrink-0" />
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
