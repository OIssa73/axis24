import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { Users, ChevronRight, X } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

interface Journalist {
  id: string;
  name: string;
  image_url: string;
  bio?: string;
}

interface Props {
  title?: string;
  subtitle?: string;
}

const JournalistsSection = ({ title = "NOS JOURNALISTES", subtitle = "Ces visages vous accompagnent dans le choix de l'information." }: Props) => {
  const [journalists, setJournalists] = useState<Journalist[]>([]);
  const [selected, setSelected] = useState<Journalist | null>(null);
  const { t } = useLanguage();

  useEffect(() => {
    const fetchJournalistsData = async () => {
      const { data: journalistsData } = await supabase.from("journalists").select("*").order("created_at", { ascending: false });
      
      const { data: settingsData } = await supabase
        .from("site_settings")
        .select("value")
        .eq("key", "journalists_bios")
        .maybeSingle();
      
      const bios = (settingsData?.value || {}) as Record<string, string>;

      if (journalistsData) {
        const merged = journalistsData.map(j => ({
          ...j,
          bio: bios[j.id] || ""
        }));
        setJournalists(merged as Journalist[]);
      }
    };
    fetchJournalistsData();
  }, []);

  if (journalists.length === 0) return null;

  return (
    <section className="py-12 bg-background overflow-hidden" id="journalists">
      <div className="container mx-auto px-4">
        <div className="flex items-end justify-between mb-12">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-widest mb-4">
              <Users size={12} /> {t("equipe")}
            </div>
            <h2 className="section-heading text-foreground uppercase">{t(title)}</h2>
          </div>
          <div className="hidden sm:flex items-center gap-2 text-muted-foreground/50 italic text-xs">
            {t("Faites défiler pour voir toute l'équipe")} <ChevronRight size={14} />
          </div>
        </div>

        <div className="relative">
          <div className="flex gap-8 overflow-x-auto pb-8 snap-x no-scrollbar">
            {journalists.map((j) => (
              <motion.div
                key={j.id}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                className="flex-none w-64 snap-center group cursor-pointer"
                onClick={() => setSelected(j)}
              >
                <div className="relative aspect-[3/4] rounded-3xl overflow-hidden mb-4 border border-border/50 group-hover:border-primary/50 transition-all duration-500 shadow-lg group-hover:shadow-primary/10">
                  <img 
                    src={j.image_url} 
                    alt={j.name} 
                    className="w-full h-full object-cover grayscale group-hover:grayscale-0 group-hover:scale-110 transition-all duration-700" 
                  />
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent p-6 flex flex-col justify-end h-1/2">
                    <p className="text-white font-display text-lg tracking-wide transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                      {j.name}
                    </p>
                    <p className="text-primary text-[10px] font-bold uppercase tracking-[0.2em] opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100">
                      Axis24 News
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
          
          <div className="absolute left-0 top-0 bottom-8 w-12 bg-gradient-to-r from-background to-transparent pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-8 w-12 bg-gradient-to-l from-background to-transparent pointer-events-none" />
        </div>
      </div>

      <AnimatePresence>
        {selected && (
          <div 
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
            onClick={() => setSelected(null)}
          >
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="relative max-w-2xl w-full bg-background rounded-3xl overflow-hidden shadow-2xl border border-border"
            >
              <button 
                onClick={() => setSelected(null)} 
                className="absolute top-4 right-4 p-2 bg-black/50 hover:bg-black text-white rounded-full z-10 transition-colors"
                aria-label="Fermer"
              >
                <X size={20} />
              </button>
              <div className="flex flex-col relative w-full h-[85vh] max-h-[850px] overflow-hidden bg-black">
                <img 
                  src={selected.image_url} 
                  alt={selected.name} 
                  className="w-full h-full object-cover object-top" 
                />
                
                {/* Dégradé sombre pour faire ressortir le texte blanc en dessous */}
                <div className="absolute inset-0 top-1/3 bg-gradient-to-t from-black/95 via-black/60 to-transparent pointer-events-none" />
                
                <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10 flex flex-col justify-end z-10">
                  <h2 className="text-3xl md:text-4xl lg:text-5xl font-display text-foreground leading-tight uppercase">
                    {selected.name}
                  </h2>
                  <p className="text-primary font-bold uppercase tracking-[0.3em] mt-2 text-sm">
                    Journaliste Axis24
                  </p>
                  <p className="text-white/90 whitespace-pre-line leading-relaxed text-sm md:text-base drop-shadow-md">
                    {selected.bio || "Membre incontournable de l'équipe rédactionnelle d'Axis24 Media Groupe. Apporte son expertise et son regard aiguisé sur l'actualité en continu."}
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
};

export default JournalistsSection;
