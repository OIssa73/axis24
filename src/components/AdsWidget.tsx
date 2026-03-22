import { motion } from "framer-motion";
import { ExternalLink, Megaphone, Star } from "lucide-react";

const partners = [
  { name: "CRTV News", url: "https://www.crtv.cm", category: "Partenaire TV" },
  { name: "Cameroon Tribune", url: "https://www.cameroon-tribune.cm", category: "Presse Écrite" },
  { name: "Orange Cameroun", url: "https://www.orange.cm", category: "Sponsor" },
  { name: "Camtel", url: "https://www.camtel.cm", category: "Sponsor Officiel" },
];

const AdsWidget = () => {
  return (
    <section className="py-12 bg-muted/20 border-y border-border/50">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-start gap-12">
          {/* Main Ad Banner Area */}
          <div className="flex-1 w-full">
            <div className="flex items-center gap-3 mb-6">
              <Megaphone size={18} className="text-primary animate-bounce" />
              <h3 className="font-display text-xl uppercase tracking-widest text-foreground">ESPACE PUBLICITAIRE</h3>
            </div>
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="relative aspect-[21/9] md:aspect-[32/9] rounded-2xl overflow-hidden glass-card flex items-center justify-center border-dashed border-2 border-primary/20 bg-primary/5 group cursor-pointer"
            >
              <div className="text-center p-8 space-y-4">
                <p className="text-sm font-bold text-muted-foreground uppercase tracking-[0.3em] opacity-40 group-hover:opacity-100 transition-opacity">
                  VOTRE PUBLICITÉ ICI
                </p>
                <div className="flex items-center justify-center gap-2 text-primary font-display text-2xl md:text-3xl tracking-tighter">
                  AXIS<span className="font-bold">24</span> MEDIA HUB
                </div>
                <p className="text-xs text-muted-foreground/60 max-w-sm mx-auto">
                  Boostez votre visibilité avec notre audience régionale et internationale.
                </p>
              </div>
              <div className="absolute top-4 right-4 bg-primary/10 text-primary text-[8px] font-bold uppercase tracking-widest px-2 py-1 rounded border border-primary/20">
                Sponsorisé
              </div>
            </motion.div>
          </div>

          {/* Sidebar Partnerships */}
          <div className="w-full md:w-80 shrink-0">
            <div className="flex items-center gap-3 mb-6">
              <Star size={18} className="text-secondary" />
              <h3 className="font-display text-xl uppercase tracking-widest text-foreground">PARTENAIRES</h3>
            </div>
            
            <div className="grid gap-3">
              {partners.map((partner, i) => (
                <motion.a
                  key={partner.name}
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
                    <p className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">{partner.name}</p>
                  </div>
                  <ExternalLink size={14} className="text-muted-foreground group-hover:text-primary group-hover:translate-x-1 group-hover:-translate-y-1 transition-all" />
                </motion.a>
              ))}
            </div>
            
            <button className="w-full mt-6 py-3 rounded-lg border border-dashed border-muted-foreground/30 text-muted-foreground text-[10px] font-bold uppercase tracking-widest hover:border-primary/50 hover:text-primary transition-all">
              Devenir Partenaire
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AdsWidget;
