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

  const groupedPodcasts = podcasts.reduce((acc, pod) => {
    const catName = pod.categories?.name || "Général";
    if (!acc[catName]) acc[catName] = [];
    acc[catName].push(pod);
    return acc;
  }, {} as Record<string, PodcastContent[]>);

  return (
    <section id="radio" className="py-24 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-[500px) h-[500px] bg-primary/5 rounded-full blur-[120px] -z-10 translate-x-1/2 -translate-y-1/2" />
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

        {/* Global Player Principal */}
        <div className="glass-card p-6 md:p-8 max-w-2xl mx-auto mb-20 border-primary/20">
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

        {/* Categories Groups */}
        <div className="space-y-24">
          {Object.entries(groupedPodcasts).map(([categoryName, catPods]) => (
            <div key={categoryName} className="space-y-8">
              <div className="flex items-center gap-4">
                <h3 className="font-display text-2xl text-foreground tracking-wide uppercase px-4 border-l-4 border-secondary">
                  {categoryName}
                </h3>
                <div className="h-px flex-1 bg-border/50" />
              </div>

              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {catPods.map((pod, i) => (
                  <motion.div
                    key={pod.id}
                    initial={{ opacity: 0, y: 15 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    className={`glass-card p-5 group transition-all duration-300 cursor-pointer overflow-hidden relative ${
                      currentAudio?.id === pod.id ? "border-primary/50 bg-primary/5" : "hover:border-primary/30"
                    }`}
                    onClick={() => handlePlayPodcast(pod)}
                  >
                    <div className="flex items-center gap-4 relative z-10">
                      <div className="w-14 h-14 rounded-xl overflow-hidden shrink-0 relative flex items-center justify-center bg-muted">
                        {pod.thumbnail_url ? (
                          <img src={pod.thumbnail_url} alt={pod.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                        ) : (
                          <Headphones size={24} className="text-muted-foreground/40" />
                        )}
                        <div className={`absolute inset-0 flex items-center justify-center transition-opacity ${currentAudio?.id === pod.id && isPlaying ? "bg-primary/40 opacity-100" : "bg-black/20 opacity-0 group-hover:opacity-100"}`}>
                          {currentAudio?.id === pod.id && isPlaying ? <Pause size={20} className="text-white" /> : <Play size={20} className="text-white fill-current ml-0.5" />}
                        </div>
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <h4 className={`font-semibold truncate mb-1 ${currentAudio?.id === pod.id ? "text-primary" : "text-foreground group-hover:text-primary transition-colors"}`}>
                          {pod.title}
                        </h4>
                        <div className="flex items-center gap-2 text-[10px] text-muted-foreground font-medium uppercase tracking-tight">
                          <span className="flex items-center gap-1">
                            <Clock size={10} /> {pod.duration || "---"}
                          </span>
                          <span>•</span>
                          <span>{new Date(pod.created_at).toLocaleDateString("fr-FR")}</span>
                        </div>
                      </div>

                      {pod.file_url && (
                        <a 
                          href={pod.file_url} 
                          download 
                          onClick={(e) => e.stopPropagation()} 
                          className="p-2 hover:bg-muted rounded-full transition-colors shrink-0"
                          title="Télécharger"
                        >
                          <Download size={16} className="text-muted-foreground hover:text-foreground" />
                        </a>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default RadioSection;
