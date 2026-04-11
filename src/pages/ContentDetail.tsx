// Importation des outils de React pour les effets et les états
import { useEffect, useState } from "react";
// Importation des outils de navigation pour récupérer l'ID dans l'URL (params)
import { useParams, useNavigate } from "react-router-dom";
// Importation de la connexion à Supabase
import { supabase } from "@/integrations/supabase/client";
import { motion, AnimatePresence } from "framer-motion";
// Importation des icônes d'interface
import { Calendar, Eye, ArrowLeft, Download, Headphones, Play, Share2 } from "lucide-react";
// Importation des composants globaux (Barre de navigation et Pied de page)
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
// Importation de l'outil de notification (Toast)
import { useToast } from "@/hooks/use-toast";

/** Structure d'un contenu récupéré en base de données */
interface Content {
  id: string;
  title: string;
  description: string | null;
  body: string | null;
  type: string;
  file_url: string | null;
  thumbnail_url: string | null;
  created_at: string;
  views_count: number;
  allow_download: boolean;
  categories: { name: string } | null;
}

/**
 * Composant CONTENT DETAIL (Page de lecture).
 * Affiche un article complet, une vidéo ou un podcast audio.
 */
const ContentDetail = () => {
  // On récupère l'identifiant (id) du contenu depuis l'adresse URL
  const { id } = useParams();
  const [content, setContent] = useState<Content | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeBanners, setActiveBanners] = useState<any[]>([]);
  const [currentAdIndex, setCurrentAdIndex] = useState(0);
  const navigate = useNavigate();
  const { toast } = useToast();

  /**
   * Récupère les données du contenu et augmente le compteur de vues.
   */
  useEffect(() => {
    // S'assure que la page s'ouvre toujours tout en haut (évite de devoir scroller)
    window.scrollTo(0, 0);
    
    const fetchContent = async () => {
      if (!id) return;
      
      // 1. Récupération des informations sur le contenu (et le nom de sa catégorie)
      const { data, error } = await supabase
        .from("content")
        .select("*, categories(name)")
        .eq("id", id)
        .single();
      
      if (data) {
        setContent(data as unknown as Content);
        // 2. Mise à jour automatique du nombre de vues dans la base de données
        await supabase.from("content").update({ views_count: (data.views_count || 0) + 1 }).eq("id", id);
      }
      setLoading(false);
    };

    const fetchAd = async () => {
      const { data } = await supabase.from("site_settings").select("value").eq("key", "ads_config").maybeSingle();
      if (data && data.value) {
        const val = data.value as any;
        let loadedBanners: any[] = [];
        if (val.banners && Array.isArray(val.banners)) {
           loadedBanners = val.banners.filter((b: any) => b.enabled !== false);
        } else if (val.banner && val.banner.enabled !== false) {
           loadedBanners = [val.banner];
        }
        if (loadedBanners.length > 0) {
           setActiveBanners(loadedBanners);
        }
      }
    };

    fetchContent();
    fetchAd();
  }, [id]);

  /**
   * Effet pour gérer le défilement automatique des publicités.
   */
  useEffect(() => {
    if (activeBanners.length <= 1) return;
    
    const interval = setInterval(() => {
      setCurrentAdIndex((prev) => (prev + 1) % activeBanners.length);
    }, 5000);
    
    return () => clearInterval(interval);
  }, [activeBanners.length]);

  const adBanner = activeBanners[currentAdIndex];

  /**
   * Copie l'adresse de la page dans le presse-papier pour partage.
   */
  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast({ title: "Lien copié !", description: "Vous pouvez maintenant le partager." });
  };

  // Affichage pendant le chargement
  if (loading) return <div className="min-h-screen bg-background flex items-center justify-center text-muted-foreground uppercase tracking-widest bg-white dark:bg-background">Chargement du contenu...</div>;
  
  // Cas où le contenu n'existe pas en BDD
  if (!content) return <div className="min-h-screen bg-background flex items-center justify-center text-muted-foreground">Oups, ce contenu n'existe plus.</div>;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-4 py-32 max-w-7xl animate-in fade-in duration-700">
        
        {/* Bouton retour avec animation */}
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-all mb-12 group uppercase text-xs font-bold tracking-widest"
        >
          <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
          Revenir en arrière
        </motion.button>

        <div className="max-w-4xl mx-auto">
          {/* --- EN-TÊTE DU CONTENU --- */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6 mb-12"
          >
            {/* Badges : Catégorie, Date et Vues */}
            <div className="flex flex-wrap items-center gap-4 text-[10px] font-bold uppercase tracking-widest text-primary">
              <span className="bg-primary/10 px-4 py-1.5 rounded-full border border-primary/20 shadow-sm">
                {content.categories?.name || "Actualité"}
              </span>
              <span className="text-muted-foreground flex items-center gap-1.5 bg-muted/30 px-3 py-1 rounded-full">
                <Calendar size={14} /> {new Date(content.created_at).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}
              </span>
              <span className="text-muted-foreground flex items-center gap-1.5 font-normal tracking-normal capitalize bg-muted/10 px-3 py-1 rounded-full">
                • {content.views_count.toLocaleString()} lectures
              </span>
            </div>
            
            {/* Le Titre principal */}
            <h1 className="font-display text-3xl md:text-5xl text-foreground font-extrabold leading-[1.1] tracking-tight drop-shadow-sm break-words max-w-full overflow-hidden">
              {content.title}
            </h1>
            
            {/* Le Sapeau (introduction) */}
            <p className="text-xl md:text-2xl text-muted-foreground leading-relaxed italic border-l-4 border-primary/40 pl-8 py-2 font-light break-words max-w-full text-justify [text-justify:inter-character]">
              {content.description}
            </p>
          </motion.div>

          {/* --- LECTEUR MÉDIA / IMAGE PRINCIPALE --- */}
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="relative rounded-[2rem] overflow-hidden glass-card shadow-2xl mb-16 aspect-video bg-muted border border-border shadow-primary/5"
          >
            {/* Si c'est une vidéo */}
            {content.type === "video" && content.file_url ? (
              <video src={content.file_url} controls className="w-full h-full object-contain bg-black rounded-[2rem]" />
            ) : 
            /* Si c'est un audio (Podcast) */
            content.type === "audio" && content.file_url ? (
              <div className="w-full h-full flex flex-col items-center justify-center p-8 bg-gradient-to-br from-primary/10 via-background to-secondary/10">
                <div className="w-28 h-28 rounded-full bg-primary/20 flex items-center justify-center mb-10 animate-pulse text-primary shadow-inner">
                  <Headphones size={56} />
                </div>
                <audio src={content.file_url} controls className="w-full max-w-md shadow-xl rounded-full" />
                <p className="mt-6 text-sm text-primary font-bold uppercase tracking-[0.3em] opacity-60">Audio en cours de lecture</p>
              </div>
            ) : 
            /* Si c'est une image ou contient une miniature */
            content.thumbnail_url || (content.type === "image" && content.file_url) ? (
              <img 
                src={content.type === "image" ? content.file_url! : content.thumbnail_url!} 
                alt={content.title} 
                className="w-full h-full object-cover transition-transform duration-700 hover:scale-[1.02]"
              />
            ) : 
            /* Par défaut (Logo Axis24) */
            (
              <div className="w-full h-full flex items-center justify-center text-muted-foreground font-display text-2xl uppercase tracking-[0.5em] opacity-20">
                AXIS24 MEDIA
              </div>
            )}
          </motion.div>

          {/* --- CORPS DE L'ARTICLE ET ACTIONS --- */}
          <div className="grid lg:grid-cols-[1fr,240px] gap-16">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="prose prose-invert prose-primary max-w-none prose-p:text-lg prose-p:leading-relaxed"
            >
              <div className="space-y-10 text-xl leading-[1.7] text-foreground/80 whitespace-pre-wrap break-words max-w-full overflow-hidden [word-break:break-word] text-justify [text-justify:inter-character]">
                {content.body || "Pas de texte supplémentaire pour cet élément."}
              </div>
            </motion.div>

            {/* Menu d'actions latéral */}
            <motion.aside
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 }}
              className="space-y-10 h-fit lg:sticky lg:top-36"
            >
              <div className="space-y-4">
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/60 mb-6 border-b border-border pb-2">Partage & Actions</p>
                
                {/* Bouton Partager */}
                <button 
                  onClick={handleShare}
                  className="w-full flex items-center justify-center gap-3 px-6 py-5 rounded-2xl border border-border bg-white dark:bg-card hover:bg-muted hover:border-primary/20 transition-all group shadow-sm"
                >
                  <Share2 size={18} className="text-primary group-hover:scale-110 transition-transform" />
                  <span className="text-xs font-bold uppercase tracking-widest">Partager l'URL</span>
                </button>

                {/* Bouton Télécharger (si autorisé) */}
                {content.allow_download && content.file_url && (
                  <a 
                    href={content.file_url} 
                    download 
                    className="w-full btn-primary-glow flex items-center justify-center gap-3 px-6 py-5 rounded-2xl shadow-xl shadow-primary/20 font-bold uppercase tracking-widest text-xs transition-all hover:scale-[1.02]"
                  >
                    <Download size={18} />
                    <span>Télécharger</span>
                  </a>
                )}
              </div>

              {/* Petit encart Publicitaire */}
              <div className="p-6 rounded-[2rem] bg-muted/40 border border-border/50 shadow-inner">
                <p className="text-[9px] font-bold uppercase tracking-widest text-primary mb-4 opacity-70">Publicité Partenaire</p>
                {activeBanners.length > 0 && adBanner ? (
                  <div className="relative aspect-square bg-background/50 rounded-2xl overflow-hidden border border-border hover:border-primary/50 transition-colors group">
                    <AnimatePresence mode="wait">
                      <motion.a 
                        key={adBanner.id || currentAdIndex}
                        href={adBanner.linkUrl || "#"} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.5, ease: "easeInOut" }}
                        className="absolute inset-0 block w-full h-full"
                      >
                        {adBanner.imageUrl ? (
                          <img src={adBanner.imageUrl} alt={adBanner.title || "Publicité"} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                        ) : (
                          <div className="w-full h-full flex flex-col items-center justify-center text-center p-4">
                            <span className="font-display text-primary font-bold text-lg uppercase">{adBanner.title || "Sponsor"}</span>
                            <span className="text-xs text-muted-foreground mt-2 line-clamp-3 px-2">{adBanner.description}</span>
                          </div>
                        )}
                      </motion.a>
                    </AnimatePresence>
                  </div>
                ) : (
                  <div className="aspect-square bg-background/50 rounded-2xl flex items-center justify-center text-[9px] text-muted-foreground uppercase text-center p-6 italic leading-relaxed border border-dashed border-border group hover:border-primary/20 transition-colors">
                    Espace publicitaire <br /> réservé à nos partenaires
                  </div>
                )}
              </div>
            </motion.aside>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ContentDetail;
