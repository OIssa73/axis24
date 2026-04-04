import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ExternalLink, Megaphone, Star, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface Partner {
  id: string;
  name: string;
  url: string;
  category: string;
  enabled: boolean;
}

interface AdsConfig {
  banner: {
    enabled: boolean;
    imageUrl: string;
    linkUrl: string;
    title: string;
    description: string;
  };
  partners: Partner[];
  showCta: boolean;
}

const defaultAdsConfig: AdsConfig = {
  banner: {
    enabled: true,
    imageUrl: "",
    linkUrl: "",
    title: "VOTRE PUBLICITÉ ICI",
    description: "Boostez votre visibilité avec notre audience régionale et internationale."
  },
  partners: [
    { id: "1", name: "CRTV News", url: "https://www.crtv.cm", category: "Partenaire TV", enabled: true },
    { id: "2", name: "Cameroon Tribune", url: "https://www.cameroon-tribune.cm", category: "Presse Écrite", enabled: true },
    { id: "3", name: "Orange Cameroun", url: "https://www.orange.cm", category: "Sponsor", enabled: true },
    { id: "4", name: "Camtel", url: "https://www.camtel.cm", category: "Sponsor Officiel", enabled: true },
  ],
  showCta: true
};

const AdsWidget = () => {
  const [config, setConfig] = useState<AdsConfig>(defaultAdsConfig);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchConfig = async () => {
      const { data } = await supabase
        .from("site_settings")
        .select("value")
        .eq("key", "ads_config")
        .maybeSingle();

      if (data && data.value) {
        setConfig(data.value as unknown as AdsConfig);
      }
      setLoading(false);
    };
    
    fetchConfig();

    const channel = supabase
      .channel("ads_config_changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "site_settings",
          filter: "key=eq.ads_config",
        },
        (payload) => {
          if (payload.new && "value" in payload.new) {
            setConfig(payload.new.value as unknown as AdsConfig);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  if (!loading && !config.banner.enabled && config.partners.length === 0) return null;

  return (
    <section className="py-12 bg-muted/20 border-y border-border/50 relative">
      {loading && (
        <div className="absolute inset-0 bg-background/50 backdrop-blur-sm z-10 flex items-center justify-center">
           <Loader2 className="animate-spin text-primary" />
        </div>
      )}
      
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-start gap-12">
          
          {config.banner.enabled && (
            <div className="flex-1 w-full flex flex-col justify-center min-h-[300px]">
              <div className="flex items-center gap-3 mb-6">
                <Megaphone size={18} className="text-primary animate-bounce" />
                <h3 className="font-display text-xl uppercase tracking-widest text-foreground">ESPACE PUBLICITAIRE</h3>
              </div>
              
              {config.banner.imageUrl ? (
                <motion.a 
                  href={config.banner.linkUrl || "#"}
                  target={config.banner.linkUrl ? "_blank" : "_self"}
                  rel="noopener noreferrer"
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  className="block relative aspect-[21/9] md:aspect-[32/9] rounded-2xl overflow-hidden glass-card border border-border/50 group shadow-lg flex-1"
                >
                  <img 
                    src={config.banner.imageUrl} 
                    alt="Publicité" 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 bg-muted" 
                  />
                  <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-md text-white text-[8px] font-bold uppercase tracking-widest px-2 py-1 rounded border border-white/10">
                    Sponsorisé
                  </div>
                </motion.a>
              ) : (
                <motion.a 
                  href={config.banner.linkUrl || "#"}
                  target={config.banner.linkUrl ? "_blank" : "_self"}
                  rel="noopener noreferrer"
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  className="block relative aspect-[21/9] md:aspect-[32/9] rounded-2xl overflow-hidden glass-card flex items-center justify-center border-dashed border-2 border-primary/20 bg-primary/5 hover:bg-primary/10 transition-colors group cursor-pointer flex-1"
                >
                  <div className="text-center p-8 space-y-4">
                    <p className="text-sm font-bold text-muted-foreground uppercase tracking-[0.3em] opacity-40 group-hover:opacity-100 transition-opacity">
                      {config.banner.title}
                    </p>
                    <div className="flex items-center justify-center gap-2 text-primary font-display text-2xl md:text-3xl tracking-tighter">
                      AXIS<span className="font-bold">24</span> MEDIA HUB
                    </div>
                    <p className="text-xs text-muted-foreground/60 max-w-sm mx-auto">
                      {config.banner.description}
                    </p>
                  </div>
                  <div className="absolute top-4 right-4 bg-primary/10 text-primary text-[8px] font-bold uppercase tracking-widest px-2 py-1 rounded border border-primary/20">
                    Sponsorisé
                  </div>
                </motion.a>
              )}
            </div>
          )}

          <div className="w-full md:w-80 shrink-0">
            <div className="flex items-center gap-3 mb-6">
              <Star size={18} className="text-secondary" />
              <h3 className="font-display text-xl uppercase tracking-widest text-foreground">PARTENAIRES</h3>
            </div>
            
            <div className="grid gap-3">
              {config.partners.filter(p => p.enabled).map((partner, i) => (
                <motion.a
                  key={partner.id}
                  href={partner.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="flex items-center justify-between p-4 rounded-xl glass-card border-border/40 hover:border-primary/40 hover:bg-primary/5 transition-all group"
                >
                  <div>
                    <p className="text-[10px] font-bold text-primary uppercase tracking-widest mb-1">{partner.category}</p>
                    <p className="text-sm font-normal tracking-wide text-foreground group-hover:text-primary transition-colors">{partner.name}</p>
                  </div>
                  <ExternalLink size={14} className="text-muted-foreground group-hover:text-primary group-hover:translate-x-1 group-hover:-translate-y-1 transition-all" />
                </motion.a>
              ))}
            </div>
            
            {config.showCta && (
              <button className="w-full mt-6 py-3 rounded-lg border border-dashed border-muted-foreground/30 text-muted-foreground text-[10px] font-bold uppercase tracking-widest hover:border-primary/50 hover:text-primary transition-all">
                Devenir Partenaire
              </button>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default AdsWidget;
