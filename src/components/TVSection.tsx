// Importation des outils React de base
import { useState, useEffect } from "react";
// Importation des outils d'animation
import { motion, AnimatePresence } from "framer-motion";
// Importation des icônes (Lecture, Horloge, Oeil, Croix, Info, Moniteur)
import { Play, Clock, Eye, X, Info, MonitorPlay } from "lucide-react";
// Importation de la connexion à la base de données
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";
import { useLanguage } from "@/context/LanguageContext";

// Structure d'une Vidéo dans le code
interface VideoContent {
  id: string;
  title: string;
  description: string | null;
  file_url: string | null;
  thumbnail_url: string | null;
  is_live: boolean;
  views_count: number;
  created_at: string;
  categories?: { name: string } | null; // Nom de la catégorie associée
}

// Paramètres personnalisables
interface Props {
  title?: string;
  subtitle?: string;
}

/**
 * Composant TV SECTION (Section Télévision).
 * Permet de regarder les replays et les émissions en vidéo.
 */
const TVSection = ({ title = "TÉLÉVISION AXIS24", subtitle = "Retrouvez toutes nos émissions et reportages en vidéo." }: Props) => {
  // États pour stocker les vidéos, le chargement, et la vidéo en cours de lecture
  const [replays, setReplays] = useState<VideoContent[]>([]);
  const [loading, setLoading] = useState(true);
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("Tous");
  const { t } = useLanguage();

  /**
   * Fonction qui récupère les vidéos depuis la base de données.
   */
  useEffect(() => {
    const fetchVideos = async () => {
      const { data } = await supabase
        .from("content")
        .select("*, categories(name)")
        .eq("type", "video") // Uniquement les contenus de type "video"
        .eq("is_published", true) // Uniquement ceux qui sont publiés
        .order("created_at", { ascending: false });
      
      if (data) {
        setReplays(data as unknown as VideoContent[]);
      }
      setLoading(false);
    };
    fetchVideos();
  }, []);

  // Liste des catégories pour le filtrage
  const categories = ["Tous", ...Array.from(new Set(replays.map(r => r.categories?.name || "Général")))];

  // Filtrage des vidéos selon la catégorie sélectionnée
  const filteredVideos = activeTab === "Tous" 
    ? replays 
    : replays.filter(r => (r.categories?.name || "Général") === activeTab);

  return (
    <section id="television" className="py-12 bg-muted/10">
      <div className="container mx-auto px-4">
        
        {/* --- EN-TÊTE DE LA SECTION --- */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary/10 text-secondary text-[10px] font-bold uppercase tracking-widest mb-4">
            <MonitorPlay size={12} /> Streaming & Replay
          </div>
          <h2 className="section-heading text-foreground uppercase">
            {t(title)}
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto mt-4">{t(subtitle)}</p>
        </motion.div>

        {/* --- ONGLETS DE CATÉGORIES (Vidéos) --- */}
        {categories.length > 1 && (
          <div className="flex flex-wrap justify-center gap-2 mb-12">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveTab(cat)}
                className={`px-5 py-2 rounded-full text-xs font-bold uppercase tracking-widest transition-all ${
                  activeTab === cat 
                  ? "bg-secondary text-white shadow-lg shadow-secondary/20 scale-105" 
                  : "bg-background text-muted-foreground hover:bg-secondary/10 hover:text-secondary border border-border/50"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        )}

        {/* --- GRILLE DES VIDÉOS --- */}
        {loading ? (
          // Affichage du chargement
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="aspect-video rounded-2xl bg-muted animate-pulse" />
            ))}
          </div>
        ) : filteredVideos.length === 0 ? (
          <p className="text-muted-foreground text-center py-20">Aucune vidéo dans cette catégorie.</p>
        ) : (
          <AnimatePresence mode="wait">
            <motion.div 
              key={activeTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {filteredVideos.map((replay, i) => (
                <motion.div
                  key={replay.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.05 }}
                  className="glass-card overflow-hidden group hover:border-secondary/30 transition-all flex flex-col"
                >
                  {/* --- LECTEUR VIDÉO --- */}
                  <div className="aspect-video bg-black flex items-center justify-center relative overflow-hidden">
                    {/* Si on a cliqué sur lecture, on affiche la vidéo, sinon l'image d'aperçu */}
                    {playingId === replay.id ? (
                      <div className="relative w-full h-full group/player">
                        <video 
                          src={replay.file_url || ""} 
                          controls 
                          autoPlay 
                          className="w-full h-full object-contain"
                        />
                        {/* Bouton pour fermer la lecture et revenir à l'aperçu */}
                        <button 
                          onClick={(e) => { e.stopPropagation(); setPlayingId(null); }}
                          className="absolute top-2 right-2 p-1.5 bg-background/80 hover:bg-secondary hover:text-white text-foreground rounded-full transition-all z-20 shadow-lg"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    ) : (
                      <>
                        {/* Image d'aperçu (Thumbnail) */}
                        {replay.thumbnail_url ? (
                          <img src={replay.thumbnail_url} alt={replay.title} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-muted/20">
                            <Play size={48} className="text-muted-foreground/30" />
                          </div>
                        )}
                        {/* Bouton Play au survol */}
                        <div 
                          className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-all flex items-center justify-center cursor-pointer"
                          onClick={() => setPlayingId(replay.id)}
                        >
                          <div className="w-14 h-14 rounded-full bg-secondary/90 flex items-center justify-center opacity-0 group-hover:opacity-100 scale-75 group-hover:scale-100 transition-all duration-300">
                            <Play size={24} className="text-white fill-current ml-1" />
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                  
                  {/* --- INFORMATIONS VIDÉO --- */}
                  <div className="p-5 flex-1 flex flex-col">
                    <h4 className="font-normal tracking-wide text-foreground line-clamp-1 group-hover:text-secondary transition-colors text-lg mb-2">{replay.title}</h4>
                    <p className="text-xs text-muted-foreground line-clamp-2 mb-4 flex-1">{replay.description}</p>
                    
                    {/* Statistiques (Vues et Date) */}
                    <div className="flex items-center justify-between pt-4 border-t border-border/40">
                      <div className="flex items-center gap-3 text-[10px] text-muted-foreground font-bold uppercase tracking-widest">
                        <span className="flex items-center gap-1.5">
                          <Eye size={12} className="text-secondary" /> {replay.views_count || 0}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <Clock size={12} className="text-secondary" /> {new Date(replay.created_at).toLocaleDateString("fr-FR")}
                        </span>
                      </div>
                      <Link to={`/content/${replay.id}`} className="p-2 rounded-full hover:bg-secondary/10 text-muted-foreground hover:text-secondary transition-all">
                        <Info size={18} />
                      </Link>
                    </div>
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

export default TVSection;
