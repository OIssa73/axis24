import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Play, Pause, SkipForward, Volume2, Download, Headphones, Clock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface PodcastContent {
  id: string;
  title: string;
  description: string | null;
  file_url: string | null;
  thumbnail_url: string | null;
  duration: string | null;
  created_at: string;
  categories?: { name: string } | null;
}

const RadioSection = () => {
  const [podcasts, setPodcasts] = useState<PodcastContent[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentAudio, setCurrentAudio] = useState<PodcastContent | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    const fetchPodcasts = async () => {
      const { data } = await supabase
        .from("content")
        .select("*, categories(name)")
        .eq("type", "audio")
        .eq("is_published", true)
        .order("created_at", { ascending: false });
      if (data) {
        setPodcasts(data as any);
        if (data.length > 0 && !currentAudio) {
          setCurrentAudio(data[0] as any);
        }
      }
      setLoading(false);
    };
    fetchPodcasts();
  }, []);

  const handlePlayPodcast = (podcast: PodcastContent) => {
    if (currentAudio?.id === podcast.id) {
      setIsPlaying(!isPlaying);
    } else {
      setCurrentAudio(podcast);
      setIsPlaying(true);
    }
  };

  return (
    <section id="radio" className="py-24 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] -z-10 translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-secondary/5 rounded-full blur-[100px] -z-10 -translate-x-1/2 translate-y-1/2" />

      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <p className="text-primary font-semibold text-sm uppercase tracking-widest mb-2 font-display">Audio & Podcasts</p>
          <h2 className="section-heading text-foreground">RADIO AXIS<span className="text-secondary">24</span></h2>
        </motion.div>

        <div className="glass-card p-6 md:p-8 max-w-2xl mx-auto mb-16 border-primary/20">
          <div className="flex items-center gap-6">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="w-16 h-16 rounded-full bg-primary flex items-center justify-center text-primary-foreground hover:scale-105 transition-transform shrink-0 shadow-lg shadow-primary/20"
            >
              {isPlaying ? <Pause size={28} /> : <Play size={28} className="ml-1" />}
            </button>

            <div className="flex-1 min-w-0">
              <span className="text-primary text-[10px] uppercase font-bold tracking-widest mb-1 block">
                {currentAudio?.categories?.name || (isPlaying ? "En lecture" : "Lecteur Audio")}
              </span>
              <h3 className="font-display text-xl text-foreground tracking-wide truncate">
                {currentAudio?.title || "AXIS24 Podcasts"}
              </h3>
              <p className="text-muted-foreground text-sm truncate">
                {currentAudio?.description || "Sélectionnez un podcast ci-dessous"}
              </p>
              
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
        </div>

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
                  onClick={() => handlePlayPodcast(pod)}
                >
                  <button 
                    onClick={(e) => { e.stopPropagation(); handlePlayPodcast(pod); }}
                    className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors shrink-0 ${
                      currentAudio?.id === pod.id && isPlaying 
                        ? "bg-primary text-primary-foreground" 
                        : "bg-muted text-foreground group-hover:bg-primary group-hover:text-primary-foreground"
                    }`}
                  >
                    {currentAudio?.id === pod.id && isPlaying ? <Pause size={16} /> : <Play size={16} className="ml-0.5" />}
                  </button>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      {pod.categories?.name && (
                        <span className="text-[10px] text-primary font-bold uppercase tracking-tighter">
                          {pod.categories.name}
                        </span>
                      )}
                      <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                        <Clock size={10} /> {pod.duration || "---"}
                      </span>
                    </div>
                    <p className={`font-semibold truncate ${currentAudio?.id === pod.id ? "text-primary" : "text-foreground"}`}>
                      {pod.title}
                    </p>
                    <p className="text-muted-foreground text-sm truncate">{pod.description || "Audio"}</p>
                  </div>
                  {pod.file_url && (
                    <a href={pod.file_url} download onClick={(e) => e.stopPropagation()} className="p-2 hover:bg-muted rounded-full transition-colors">
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
