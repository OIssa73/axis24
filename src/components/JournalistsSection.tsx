import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { Users, ChevronLeft, ChevronRight } from "lucide-react";

interface Journalist {
  id: string;
  name: string;
  image_url: string;
}

const JournalistsSection = () => {
  const [journalists, setJournalists] = useState<Journalist[]>([]);

  useEffect(() => {
    const fetchJournalists = async () => {
      const { data } = await supabase.from("journalists").select("*").order("created_at", { ascending: false });
      if (data) setJournalists(data as Journalist[]);
    };
    fetchJournalists();
  }, []);

  if (journalists.length === 0) return null;

  return (
    <section className="py-20 bg-background overflow-hidden">
      <div className="container mx-auto px-4">
        <div className="flex items-end justify-between mb-12">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-widest mb-4">
              <Users size={12} /> L'Équipe
            </div>
            <h2 className="section-heading text-foreground">NOS <span className="text-primary">JOURNALISTES</span></h2>
          </div>
          <div className="hidden sm:flex items-center gap-2 text-muted-foreground/50 italic text-xs">
            Faites défiler pour voir toute l'équipe <ChevronRight size={14} />
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
                className="flex-none w-64 snap-center group"
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
          
          {/* Fades for scroll indication */}
          <div className="absolute left-0 top-0 bottom-8 w-12 bg-gradient-to-r from-background to-transparent pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-8 w-12 bg-gradient-to-l from-background to-transparent pointer-events-none" />
        </div>
      </div>
    </section>
  );
};

export default JournalistsSection;
