import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { TrendingUp, Globe, AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const NewsTicker = () => {
  const [headlines, setHeadlines] = useState<string[]>([]);

  useEffect(() => {
    const fetchHeadlines = async () => {
      const { data } = await supabase
        .from("content")
        .select("title")
        .eq("is_published", true)
        .order("created_at", { ascending: false })
        .limit(5);
      
      const internalHeadlines = data?.map(h => h.title) || [];
      const externalHeadlines = [
        "ADAMAOUA : De nouveaux projets de développement annoncés pour 2026",
        "SPORT : Les Lions Indomptables se préparent pour le prochain match",
        "ÉCONOMIE : Hausse des exportations dans la région du Nord",
        "CULTURE : Le festival NGAN-HA approche à grands pas"
      ];
      
      setHeadlines([...internalHeadlines, ...externalHeadlines]);
    };
    fetchHeadlines();
  }, []);

  if (headlines.length === 0) return null;

  return (
    <div className="bg-primary/90 backdrop-blur-md text-primary-foreground py-2 border-y border-white/10 overflow-hidden relative z-50">
      <div className="container mx-auto px-4 flex items-center gap-4">
        <div className="flex items-center gap-2 font-display text-[10px] uppercase tracking-[0.2em] shrink-0 bg-white/20 px-3 py-1 rounded-full whitespace-nowrap">
          <TrendingUp size={12} />
          Flash Infos
        </div>
        
        <div className="flex-1 overflow-hidden relative h-4">
          <motion.div
            animate={{ x: ["100%", "-100%"] }}
            transition={{
              duration: 30,
              repeat: Infinity,
              ease: "linear",
            }}
            className="absolute top-0 flex gap-12 items-center whitespace-nowrap"
          >
            {headlines.map((headline, i) => (
              <span key={i} className="text-[11px] font-medium tracking-wide flex items-center gap-4">
                <Globe size={10} className="text-secondary" />
                {headline}
                <span className="text-white/30">|</span>
              </span>
            ))}
            {/* Mirror for continuous loop */}
            {headlines.map((headline, i) => (
              <span key={`mirror-${i}`} className="text-[11px] font-medium tracking-wide flex items-center gap-4">
                <Globe size={10} className="text-secondary" />
                {headline}
                <span className="text-white/30">|</span>
              </span>
            ))}
          </motion.div>
        </div>
        
        <div className="hidden lg:flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-widest text-white/60 shrink-0 border-l border-white/20 pl-4">
          <AlertCircle size={10} />
          Direct • {new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
        </div>
      </div>
    </div>
  );
};

export default NewsTicker;
