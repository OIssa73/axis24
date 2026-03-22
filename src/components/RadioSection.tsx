import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Pause, Headphones, Clock, Volume2, Eye, Info, Radio } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";

interface PodcastContent {
  id: string;
  title: string;
  description: string;
  file_url: string;
  thumbnail_url: string | null;
  created_at: string;
  duration?: string;
  views_count?: number;
  categories?: { name: string } | null;
}

const RadioSection = () => {
  const [podcasts, setPodcasts] = useState<PodcastContent[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentAudio, setCurrentAudio] = useState<PodcastContent | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeTab, setActiveTab] = useState("Tous");

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

  const categories = ["Tous", ...Array.from(new Set(podcasts.map(p => p.categories?.name || "Général")))];

  const filteredPodcasts = activeTab === "Tous" 
    ? podcasts 
    : podcasts.filter(p => (p.categories?.name || "Général") === activeTab);

  const handlePlayPodcast = (podcast: PodcastContent) => {
    if (currentAudio?.id === podcast.id) {
      setIsPlaying(!isPlaying);
    } else {
      setCurrentAudio(podcast);
      setIsPlaying(true);
    }
  };

  return (
    <section id="radio" className="py-24 relative overflow-hidden bg-background">
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] -z-10 translate-x-1/2 -translate-y-1/2" />

      <div className="container mx-auto px-4 relative z-10">
        <motion.div
           initial={{ opacity: 0, y: 20 }}
           whileInView={{ opacity: 1, y: 0 }}
           viewport={{ once: true }}
           className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-widest mb-4">
            <Radio size={12} /> Radio & Podcasts
          </div>
          <h2 className="section-heading text-foreground">RADIO AXIS<span className="text-secondary">24</span></h2>
          <p className="text-muted-foreground max-w-2xl mx-auto mt-4">Écoutez nos émissions où que vous soyez.</p>
        </motion.div>

        {/* Global Player Principal (Static) */}
        <div className="glass-card p-6 md:p-8 max-w-2xl mx-auto mb-16 border-primary/20 bg-primary/5 backdrop-blur-xl">
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
              <p className="text-xs text-muted-foreground truncate">
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
              <Volume2 size={20} className="cursor-pointer hover:text-foreground transition-all" />
            </div>
          </div>
        </div>

        {/* Categories Tabs */}
        {categories.length > 1 && (
          <div className="flex flex-wrap justify-center gap-2 mb-12">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveTab(cat)}
                className={`px-5 py-2 rounded-full text-xs font-bold uppercase tracking-widest transition-all ${
                  activeTab === cat 
                  ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20 scale-105" 
                  : "bg-muted text-muted-foreground hover:bg-primary/10 hover:text-primary"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        )}

        {loading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-24 rounded-2xl bg-muted animate-pulse" />
            ))}
          </div>
        ) : filteredPodcasts.length === 0 ? (
          <p className="text-muted-foreground text-center py-20">Aucun podcast dans cette catégorie.</p>
        ) : (
          <AnimatePresence mode="wait">
            <motion.div 
              key={activeTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {filteredPodcasts.map((pod, i) => (
                <motion.div
                  key={pod.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.05 }}
                  className={`glass-card p-4 group transition-all duration-300 relative overflow-hidden ${
                    currentAudio?.id === pod.id ? "border-primary/50 bg-primary/5" : "hover:border-primary/30"
                  }`}
                  onClick={() => handlePlayPodcast(pod)}
                >
                  <div className="flex items-center gap-4 relative z-10">
                    <div className="w-12 h-12 rounded-xl overflow-hidden shrink-0 relative flex items-center justify-center bg-muted">
                      {pod.thumbnail_url ? (
                        <img src={pod.thumbnail_url} alt={pod.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                      ) : (
                        <Headphones size={20} className="text-muted-foreground/40" />
                      )}
                      <div className={`absolute inset-0 flex items-center justify-center transition-opacity ${currentAudio?.id === pod.id && isPlaying ? "bg-primary/40 opacity-100" : "bg-black/20 opacity-0 group-hover:opacity-100"}`}>
                        {currentAudio?.id === pod.id && isPlaying ? <Pause size={16} className="text-white" /> : <Play size={16} className="text-white fill-current ml-0.5" />}
                      </div>
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-foreground truncate group-hover:text-primary transition-colors text-sm">{pod.title}</h4>
                      <p className="text-[10px] text-muted-foreground line-clamp-1 mt-0.5">{pod.description}</p>
                      <div className="flex items-center gap-3 mt-2 text-[9px] text-muted-foreground font-bold uppercase tracking-wider">
                        <span className="flex items-center gap-1">
                          <Eye size={10} className="text-primary" /> {pod.views_count || 0}
                        </span>
                        <span>{new Date(pod.created_at).toLocaleDateString("fr-FR")}</span>
                      </div>
                    </div>
                    
                    <Link 
                      to={`/content/${pod.id}`}
                      onClick={(e) => e.stopPropagation()}
                      className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-primary/10 text-muted-foreground hover:text-primary transition-all shrink-0"
                    >
                      <Info size={16} />
                    </Link>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </AnimatePresence>
        )}
      </div>
    </section>
  );
};

export default RadioSection;
