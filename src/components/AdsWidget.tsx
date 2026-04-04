import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ExternalLink, Megaphone, Star, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface Partner {
  id: string;
  name: string;
  url: string;
  category: string;
  enabled: boolean;
}

export interface AdBanner {
  id: string;
  enabled: boolean;
  imageUrl: string;
  linkUrl: string;
  title: string;
  description: string;
}

interface AdsConfig {
  banners: AdBanner[];
  partners: Partner[];
  showCta: boolean;
}

const defaultAdsConfig: AdsConfig = {
  banners: [],
  partners: [],
  showCta: true
};

const AdsWidget = () => {
  const [config, setConfig] = useState<AdsConfig>(defaultAdsConfig);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const fetchConfig = async () => {
      const { data } = await supabase
        .from("site_settings")
        .select("value")
        .eq("key", "ads_config")
        .maybeSingle();

      if (data && data.value) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const val = data.value as any;
        
        let loadedBanners: AdBanner[] = [];
        if (val.banners && Array.isArray(val.banners)) {
          loadedBanners = val.banners;
        } else if (val.banner) {
          loadedBanners = [{ ...val.banner, id: "legacy-1", enabled: val.banner.enabled !== false }];
        }

        const partners = (val.partners || []).map((p: any) => ({ ...p, enabled: p.enabled !== false }));
        setConfig({ banners: loadedBanners, partners, showCta: val.showCta !== false });
      }
      setLoading(false);
    };
    
    fetchConfig();

    const channel = supabase
      .channel("ads_config_changes")
      .on("postgres_changes", { event: "*", schema: "public", table: "site_settings", filter: "key=eq.ads_config" },
        (payload) => {
          if (payload.new && "value" in payload.new) {
            const val = payload.new.value as any;
            const banners = Array.isArray(val.banners) ? val.banners : (val.banner ? [val.banner] : []);
            setConfig({ banners, partners: val.partners || [], showCta: val.showCta !== false });
          }
        }
      ).subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  // Auto-rotation logic
  const activeBanners = config.banners.filter(b => b.enabled);
  
  useEffect(() => {
    if (activeBanners.length <= 1) return;
    
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % activeBanners.length);
    }, 5000); // 5 seconds ad rotation
    
    return () => clearInterval(interval);
  }, [activeBanners.length]);

  if (!loading && activeBanners.length === 0 && config.partners.filter(p => p.enabled).length === 0) return null;

  const currentBanner = activeBanners[currentIndex];

  return (
    <section className="py-12 bg-muted/20 border-y border-border/50 relative overflow-hidden">
      {loading && (
        <div className="absolute inset-0 bg-background/50 backdrop-blur-sm z-10 flex items-center justify-center">
           <Loader2 className="animate-spin text-primary" />
        </div>
      )}
      
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-start gap-12">
          
          {/* ZONE BANNIERE CARROUSEL */}
          <div className="flex-1 w-full flex flex-col justify-center min-h-[300px]">
            <div className="flex items-center gap-3 mb-6">
              <Megaphone size={18} className="text-primary animate-bounce" />
              <h3 className="font-display text-xl uppercase tracking-widest text-foreground">ESPACE PUBLICITAIRE</h3>
            </div>
            
            {activeBanners.length > 0 ? (
              <div className="relative aspect-[21/9] md:aspect-[32/9] rounded-2xl overflow-hidden glass-card shadow-lg flex-1 group">
                <AnimatePresence mode="wait">
                  <motion.a 
                    key={currentBanner?.id}
                    href={currentBanner?.linkUrl || "#"}
                    target={currentBanner?.linkUrl ? "_blank" : "_self"}
                    rel="noopener noreferrer"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.5, ease: "easeInOut" }}
                    className="absolute inset-0 block w-full h-full"
                  >
                    {currentBanner?.imageUrl ? (
                      <img 
                        src={currentBanner.imageUrl} 
                        alt="Publicité" 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 bg-muted" 
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center text-center p-8 border-dashed border-2 border-primary/20 bg-primary/5 hover:bg-primary/10 transition-colors cursor-pointer">
                        <p className="text-sm font-bold text-muted-foreground uppercase tracking-[0.3em] opacity-40 group-hover:opacity-100 transition-opacity">
                          {currentBanner?.title || "ESPACE SPONSORISÉ"}
                        </p>
                        <div className="flex items-center justify-center gap-2 text-primary font-display text-2xl md:text-3xl tracking-tighter my-4">
                          AXIS<span className="font-bold">24</span> MEDIA HUB
                        </div>
                        <p className="text-xs text-muted-foreground/60 max-w-sm mx-auto">
                          {currentBanner?.description}
                        </p>
                      </div>
                    )}
                  </motion.a>
                </AnimatePresence>
                
                <div className="absolute top-4 left-4 z-10 bg-black/60 backdrop-blur-md text-white text-[8px] font-bold uppercase tracking-widest px-2 py-1 rounded border border-white/10">
                  Sponsorisé
                </div>
                
                {/* Pagination Dots */}
                {activeBanners.length > 1 && (
                  <div className="absolute bottom-4 left-0 right-0 z-10 flex justify-center gap-2">
                    {activeBanners.map((_, idx) => (
                      <button
                        key={idx}
                        onClick={() => setCurrentIndex(idx)}
                        className={`w-2 h-2 rounded-full transition-all ${
                          currentIndex === idx ? "bg-primary w-6" : "bg-black/30 w-2 hover:bg-primary/50"
                        }`}
                      />
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="aspect-[21/9] md:aspect-[32/9] rounded-2xl flex items-center justify-center border-dashed border border-border bg-muted/10">
                 <p className="text-muted-foreground/50 text-sm font-bold uppercase tracking-widest">Espace disponible</p>
              </div>
            )}
          </div>

          {/* ZONE PARTENAIRES (Reste Inchangée) */}
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
