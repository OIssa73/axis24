import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
import { Calendar, Eye, ArrowLeft, Download, Headphones, Play, Share2 } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useToast } from "@/hooks/use-toast";

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

const ContentDetail = () => {
  const { id } = useParams();
  const [content, setContent] = useState<Content | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const fetchContent = async () => {
      if (!id) return;
      
      const { data, error } = await supabase
        .from("content")
        .select("*, categories(name)")
        .eq("id", id)
        .single();
      
      if (data) {
        setContent(data as unknown as Content);
        // Increment views
        await supabase.from("content").update({ views_count: (data.views_count || 0) + 1 }).eq("id", id);
      }
      setLoading(false);
    };
    fetchContent();
  }, [id]);

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast({ title: "Lien copié !", description: "Vous pouvez maintenant le partager." });
  };

  if (loading) return <div className="min-h-screen bg-background flex items-center justify-center text-muted-foreground uppercase tracking-widest">Chargement...</div>;
  if (!content) return <div className="min-h-screen bg-background flex items-center justify-center text-muted-foreground">Contenu non trouvé.</div>;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-4 py-32">
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors mb-12 group"
        >
          <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
          Retour
        </motion.button>

        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6 mb-12"
          >
            <div className="flex flex-wrap items-center gap-4 text-xs font-bold uppercase tracking-widest text-primary">
              <span className="bg-primary/10 px-3 py-1 rounded-full border border-primary/20">
                {content.categories?.name || "Général"}
              </span>
              <span className="text-muted-foreground flex items-center gap-1.5">
                <Calendar size={14} /> {new Date(content.created_at).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}
              </span>
              <span className="text-muted-foreground flex items-center gap-1.5 font-normal tracking-normal capitalize">
                • {content.views_count} vues
              </span>
            </div>
            
            <h1 className="font-display text-4xl md:text-6xl text-foreground leading-[1.1] tracking-tight">
              {content.title}
            </h1>
            
            <p className="text-xl text-muted-foreground leading-relaxed italic border-l-4 border-primary/30 pl-6">
              {content.description}
            </p>
          </motion.div>

          {/* Media Player / Main Image */}
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="relative rounded-2xl overflow-hidden glass-card shadow-2xl mb-16 aspect-video bg-muted border-primary/10"
          >
            {content.type === "video" && content.file_url ? (
              <video src={content.file_url} controls className="w-full h-full object-contain bg-black" />
            ) : content.type === "audio" && content.file_url ? (
              <div className="w-full h-full flex flex-col items-center justify-center p-8 bg-gradient-to-br from-muted/50 to-background">
                <div className="w-24 h-24 rounded-full bg-primary/20 flex items-center justify-center mb-8 animate-pulse text-primary">
                  <Headphones size={48} />
                </div>
                <audio src={content.file_url} controls className="w-full max-w-md" />
              </div>
            ) : content.thumbnail_url || (content.type === "image" && content.file_url) ? (
              <img 
                src={content.type === "image" ? content.file_url! : content.thumbnail_url!} 
                alt={content.title} 
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-muted-foreground font-display text-2xl uppercase tracking-widest opacity-20">
                AXIS24 MEDIA
              </div>
            )}
          </motion.div>

          {/* Content Body */}
          <div className="grid lg:grid-cols-[1fr,200px] gap-16">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="prose prose-invert prose-primary max-w-none"
            >
              <div className="space-y-8 text-lg leading-relaxed text-foreground/90 whitespace-pre-wrap">
                {content.body || "Aucun contenu textuel supplémentaire."}
              </div>
            </motion.div>

            {/* Sidebar Actions */}
            <motion.aside
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 }}
              className="space-y-8 h-fit lg:sticky lg:top-32"
            >
              <div className="space-y-4">
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-4">Actions</p>
                <button 
                  onClick={handleShare}
                  className="w-full flex items-center justify-center gap-3 px-6 py-4 rounded-xl border border-border hover:bg-muted hover:border-primary/30 transition-all group"
                >
                  <Share2 size={18} className="text-primary group-hover:scale-110 transition-transform" />
                  <span className="text-sm font-semibold">Partager</span>
                </button>

                {content.allow_download && content.file_url && (
                  <a 
                    href={content.file_url} 
                    download 
                    className="w-full btn-primary-glow flex items-center justify-center gap-3 px-6 py-4 rounded-xl shadow-lg shadow-primary/20"
                  >
                    <Download size={18} />
                    <span className="text-sm font-bold">Télécharger</span>
                  </a>
                )}
              </div>

              <div className="p-6 rounded-2xl bg-muted/30 border border-border/50">
                <p className="text-[10px] font-bold uppercase tracking-widest text-primary mb-2">Publicité</p>
                <div className="aspect-square bg-muted rounded-lg flex items-center justify-center text-[10px] text-muted-foreground uppercase text-center p-4">
                  Votre espace publicité ici
                </div>
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
