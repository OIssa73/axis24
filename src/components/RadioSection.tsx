// Importation des outils React pour les états, les effets et les références (audio)
import { useState, useEffect, useRef } from "react";
// Importation de Framer Motion pour les animations fluides
import { motion, AnimatePresence } from "framer-motion";
// Importation des icônes (Lecture, Pause, Casque, Volume, etc.)
import { Play, Pause, Headphones, Clock, Volume2, Eye, Info, Radio } from "lucide-react";
// Importation de la connexion à la base de données
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";
// Importation de l'outil de traduction
import { useLanguage } from "@/context/LanguageContext";

/** Structure d'un Podcast (contenu audio) récupéré en BDD */
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

/** Propriétés personnalisables du composant */
interface Props {
  title?: string;
  subtitle?: string;
}

/**
 * Composant RADIO SECTION.
 * Gère le direct audio et la liste des podcasts à la demande.
 * Inclus un mini-lecteur intégré.
 */
const RadioSection = ({ title = "RADIO AXIS24", subtitle = "Écoutez nos émissions où que vous soyez." }: Props) => {
  // --- ÉTATS ---
  const [podcasts, setPodcasts] = useState<PodcastContent[]>([]); // Liste des épisodes
  const [loading, setLoading] = useState(true);
  const [currentAudio, setCurrentAudio] = useState<PodcastContent | null>(null); // Podcast actuellement chargé dans le lecteur
  const [isPlaying, setIsPlaying] = useState(false); // État de lecture (lecture/pause)
  const [activeTab, setActiveTab] = useState("Tous"); // Filtre de catégorie
  const { t } = useLanguage();

  /**
   * Récupère la liste des podcasts publiés.
   */
  useEffect(() => {
    const fetchPodcasts = async () => {
      const { data } = await supabase
        .from("content")
        .select("*, categories(name)")
        .eq("type", "audio")
        .eq("is_published", true)
        .order("created_at", { ascending: false });
      
      if (data) {
        setPodcasts(data as unknown as PodcastContent[]);
        // S'il n'y a rien de sélectionné, on charge le premier podcast par défaut
        if (data.length > 0 && !currentAudio) {
          setCurrentAudio(data[0] as unknown as PodcastContent);
        }
      }
      setLoading(false);
    };
    fetchPodcasts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Détermination des catégories disponibles pour les filtres
  const categories = ["Tous", ...Array.from(new Set(podcasts.map(p => p.categories?.name || "Général")))];

  // Filtrage local selon l'onglet actif
  const filteredPodcasts = activeTab === "Tous" 
    ? podcasts 
    : podcasts.filter(p => (p.categories?.name || "Général") === activeTab);

  /**
   * Gère le clic sur un podcast pour le lancer ou le mettre en pause.
   */
  const handlePlayPodcast = (podcast: PodcastContent) => {
    if (currentAudio?.id === podcast.id) {
      // Si on clique sur le même, on fait switch lecture/pause
      setIsPlaying(!isPlaying);
    } else {
      // Si on clique sur un nouveau, on le charge et on lance la lecture
      setCurrentAudio(podcast);
      setIsPlaying(true);
    }
  };

  return (
    <section id="radio" className="py-12 relative overflow-hidden bg-background">
      {/* Effet visuel flou en arrière-plan (masqué sur mobile pour les perfs) */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] -z-10 translate-x-1/2 -translate-y-1/2 hidden md:block" />

      <div className="container mx-auto px-4 relative z-10">
        {/* --- EN-TÊTE --- */}
        <motion.div
           initial={{ opacity: 0, y: 20 }}
           whileInView={{ opacity: 1, y: 0 }}
           viewport={{ once: true }}
           className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-widest mb-4 border border-primary/20">
            <Radio size={12} /> Radio & Podcasts
          </div>
          <h2 className="section-heading text-foreground uppercase">{t(title)}</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto mt-4 font-medium opacity-80">{t(subtitle)}</p>
        </motion.div>

        {/* --- LECTEUR PRINCIPAL (Le gros bloc en haut) --- */}
        <div className="glass-card p-8 md:p-10 max-w-3xl mx-auto mb-20 border-primary/20 bg-primary/5 backdrop-blur-3xl shadow-2xl shadow-primary/5 rounded-[2.5rem]">
          <div className="flex flex-col md:flex-row items-center gap-8">
            {/* Bouton Play/Pause massif */}
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="w-20 h-20 rounded-full bg-primary flex items-center justify-center text-primary-foreground hover:scale-110 transition-transform shrink-0 shadow-2xl shadow-primary/30"
            >
              {isPlaying ? <Pause size={32} /> : <Play size={32} className="ml-1" />}
            </button>

            <div className="flex-1 min-w-0 w-full overflow-hidden text-center md:text-left">
              <span className="text-primary text-[10px] uppercase font-bold tracking-[0.4em] mb-2 block opacity-70 w-full truncate">
                {currentAudio?.categories?.name || (isPlaying ? "En cours de diffusion" : "Prêt pour l'écoute")}
              </span>
              <h3 className="font-display text-2xl md:text-3xl text-foreground tracking-tight truncate font-bold mb-1 w-full">
                {currentAudio?.title || "Sélectionnez un podcast"}
              </h3>
              <p className="text-xs text-muted-foreground truncate italic opacity-60 w-full">
                {currentAudio?.description || "Parcourez notre collection ci-dessous"}
              </p>
              
              {/* L'élément audio de navigateur caché qui gère le flux son */}
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

            {/* Animation d'ondes sonores (purement visuel) */}
            <div className="hidden md:flex items-center gap-1.5 h-8">
               {[1, 2, 3, 4, 3, 2, 1].map((h, i) => (
                 <div 
                   key={i} 
                   className={`w-1.5 bg-primary/40 rounded-full transition-all duration-300 ${isPlaying ? "animate-pulse" : "h-2"}`} 
                   style={{ height: isPlaying ? `${h * 15}px` : "8px", animationDelay: `${i * 0.1}s` }}
                 />
               ))}
            </div>
          </div>
        </div>

        {/* --- ONGLETS DE FILTRAGE --- */}
        {categories.length > 1 && (
          <div className="flex flex-wrap justify-center gap-3 mb-16">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveTab(cat)}
                className={`px-6 py-2.5 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all ${
                  activeTab === cat 
                  ? "bg-primary text-primary-foreground shadow-xl shadow-primary/20 scale-105" 
                  : "bg-muted/50 text-muted-foreground hover:bg-primary/10 hover:text-primary"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        )}

        {/* --- LISTE DES PODCASTS --- */}
        {loading ? (
          // Chargement (Squelettes)
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-28 rounded-3xl bg-muted animate-pulse" />
            ))}
          </div>
        ) : filteredPodcasts.length === 0 ? (
          <p className="text-muted-foreground text-center py-20 italic">Aucun contenu trouvé pour cette thématique.</p>
        ) : (
          <AnimatePresence mode="wait">
            <motion.div 
              key={activeTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8"
            >
              {filteredPodcasts.map((pod, i) => (
                <motion.div
                  key={pod.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.05 }}
                  className={`glass-card p-5 group transition-all duration-500 relative overflow-hidden rounded-[2rem] cursor-pointer ${
                    currentAudio?.id === pod.id ? "border-primary/50 bg-primary/5 shadow-xl shadow-primary/5" : "hover:border-primary/20 hover:bg-muted/30"
                  }`}
                  onClick={() => handlePlayPodcast(pod)}
                >
                  <div className="flex items-center gap-5 relative z-10">
                    {/* Miniature de l'épisode */}
                    <div className="w-16 h-16 rounded-2xl overflow-hidden shrink-0 relative flex items-center justify-center bg-muted border border-border/50">
                      {pod.thumbnail_url ? (
                        <img src={pod.thumbnail_url} alt={pod.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                      ) : (
                        <Headphones size={24} className="text-primary/20" />
                      )}
                      {/* Icône Play contextuelle sur la miniature */}
                      <div className={`absolute inset-0 flex items-center justify-center transition-all duration-300 ${currentAudio?.id === pod.id && isPlaying ? "bg-primary/60 opacity-100" : "bg-black/30 opacity-0 group-hover:opacity-100"}`}>
                        {currentAudio?.id === pod.id && isPlaying ? <Pause size={20} className="text-white" /> : <Play size={20} className="text-white fill-current ml-1" />}
                      </div>
                    </div>
                    
                    {/* Détails de l'épisode */}
                    <div className="flex-1 min-w-0">
                      <h4 className="font-display font-bold tracking-wide text-foreground truncate group-hover:text-primary transition-colors text-base mb-1">{pod.title}</h4>
                      <p className="text-[10px] text-muted-foreground line-clamp-1 opacity-70 mb-3">{pod.description}</p>
                      
                      {/* Statistiques (Lectures et Date) */}
                      <div className="flex items-center gap-4 text-[9px] text-muted-foreground font-bold uppercase tracking-[0.1em]">
                        <span className="flex items-center gap-1.5 text-primary/80">
                          <Eye size={12} /> {pod.views_count?.toLocaleString() || 0}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <Clock size={12} /> {new Date(pod.created_at).toLocaleDateString("fr-FR")}
                        </span>
                      </div>
                    </div>
                    
                    {/* Bouton d'information (aller sur la page détaillée) */}
                    <Link 
                      to={`/content/${pod.id}`}
                      onClick={(e) => e.stopPropagation()}
                      className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-primary/20 text-muted-foreground hover:text-primary transition-all shrink-0 border border-border/50"
                    >
                      <Info size={18} />
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
