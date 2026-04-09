// Importation de Framer Motion pour les animations fluides
import { motion } from "framer-motion";
// Importation des icônes (Monde, Horloge, Flèche, Journal)
import { Globe, Clock, ArrowUpRight, Newspaper } from "lucide-react";

/**
 * Données statiques représentant des actualités de sources partenaires.
 * En production, ces données pourraient provenir d'un flux RSS ou d'une API de presse.
 */
const externalNews = [
  {
    id: 1,
    source: "France 24",
    title: "Sommet de l'Union Africaine : Les enjeux de la sécurité régionale",
    teaser: "Les chefs d'État se réunissent pour discuter des défis sécuritaires et économiques du continent...",
    image: "https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?auto=format&fit=crop&q=80&w=400",
    url: "https://www.france24.com/fr/afrique/",
    time: "Il y a 15 min"
  },
  {
    id: 2,
    source: "BBC News Afrique",
    title: "Innovation Tech : Le Cameroun en pointe sur les solutions solaires",
    teaser: "De nouvelles startups camerounaises transforment l'accès à l'énergie dans les zones rurale...",
    image: "https://images.unsplash.com/photo-1509391366360-fe5bb62697b1?auto=format&fit=crop&q=80&w=400",
    url: "https://www.bbc.com/afrique",
    time: "Il y a 1h"
  },
  {
    id: 3,
    source: "Cameroon Tribune",
    title: "Adamaoua : Relance des grands chantiers routiers",
    teaser: "Le ministre des Travaux Publics annonce le début des travaux sur l'axe structurant de la région...",
    image: "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&q=80&w=400",
    url: "https://www.cameroon-tribune.cm",
    time: "Il y a 3h"
  },
  {
    id: 4,
    source: "Africa News",
    title: "Culture : Le retour des trésors royaux au pays",
    teaser: "Une cérémonie historique marque la restitution d'objets d'art traditionnels aux autorités locales...",
    image: "https://images.unsplash.com/photo-1523891707565-1eb4c0350794?auto=format&fit=crop&q=80&w=400",
    url: "https://fr.africanews.com",
    time: "Il y a 5h"
  }
];

/**
 * Composant EXTERNAL NEWS WIDGET.
 * Une section qui propose des articles de grands médias nationaux et internationaux
 * pour compléter l'offre d'information d'Axis24.
 */
const ExternalNewsWidget = () => {
  return (
    <section className="py-16 bg-muted/30">
      <div className="container mx-auto px-4">
        
        {/* --- EN-TÊTE DU WIDGET --- */}
        <div className="flex items-center justify-between mb-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary border border-primary/20">
              <Newspaper size={20} />
            </div>
            <div>
              <h2 className="font-display text-2xl uppercase tracking-widest text-foreground font-bold">Infos à Chaud</h2>
              <p className="text-secondary text-[10px] font-bold uppercase tracking-[0.2em] opacity-80">Curation Internationale & Locale</p>
            </div>
          </div>
          {/* Témoin visuel de mise à jour */}
          <div className="hidden sm:flex items-center gap-2 text-xs font-semibold text-muted-foreground opacity-60 italic">
            <Globe size={14} className="animate-spin-slow text-primary" />
            Flux en direct
          </div>
        </div>

        {/* --- GRILLE DES ARTICLES EXTERNES --- */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {externalNews.map((news, i) => (
            <motion.a
              key={news.id}
              href={news.url}
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="group bg-background border border-border/50 rounded-2xl overflow-hidden hover:border-primary/40 hover:shadow-2xl hover:shadow-primary/5 transition-all flex flex-col h-full shadow-lg"
            >
              {/* Image de la source externe */}
              <div className="aspect-[4/3] overflow-hidden relative">
                <img 
                  src={news.image} 
                  alt={news.title} 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 opacity-90 group-hover:opacity-100" 
                />
                {/* Badge de la source (ex: BBC, France 24) */}
                <div className="absolute top-4 left-4 bg-primary/90 backdrop-blur-md text-white text-[9px] font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-lg">
                  {news.source}
                </div>
              </div>
              
              <div className="p-6 flex-1 flex flex-col">
                {/* Temps écoulé depuis la publication */}
                <div className="flex items-center gap-2 text-[10px] text-primary/80 mb-3 font-bold uppercase tracking-wider">
                  <Clock size={12} />
                  {news.time}
                </div>
                {/* Titre cliquable qui ramène vers le site partenaire */}
                <h3 className="font-display text-lg font-bold tracking-tight text-foreground leading-snug group-hover:text-primary transition-colors line-clamp-2 mb-3">
                  {news.title}
                </h3>
                <p className="text-xs text-muted-foreground line-clamp-3 mb-6 flex-1 italic leading-relaxed prose opacity-80">
                  {news.teaser}
                </p>
                {/* Appel à l'action */}
                <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-primary group-hover:gap-4 transition-all mt-auto pt-4 border-t border-border/40">
                  Lire l'article complet
                  <ArrowUpRight size={14} className="group-hover:-translate-y-1 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </motion.a>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ExternalNewsWidget;
