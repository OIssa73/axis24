// Importation des outils React pour les effets et les états
import { useEffect, useState } from "react";
// Importation de Framer Motion pour l'animation de défilement infini
import { motion } from "motion/react";
// Importation des icônes (Tendance, Globe, Alerte)
import { TrendingUp, Globe, AlertCircle } from "lucide-react";
// Importation de la connexion à la base de données
import { supabase } from "@/integrations/supabase/client";

/**
 * Composant NEWS TICKER (Bandeau défilant).
 * Affiche les derniers titres d'actualité en continu en haut de la page.
 * Il combine les titres de la base de données et des titres statiques.
 */
const NewsTicker = () => {
  // État pour stocker les titres à afficher
  const [headlines, setHeadlines] = useState<string[]>([]);

  /**
   * Récupère les derniers titres au chargement du composant.
   */
  useEffect(() => {
    const fetchHeadlines = async () => {
      // 1. Récupération des 5 derniers articles publiés sur Axis24
      const { data } = await supabase
        .from("content")
        .select("title")
        .eq("is_published", true)
        .order("created_at", { ascending: false })
        .limit(5);
      
      const internalHeadlines = data?.map(h => h.title) || [];
      
      // 2. Titres d'appoint (pour assurer un défilement constant même sans nouveaux articles)
      const externalHeadlines = [
        "ADAMAOUA : De nouveaux projets de développement annoncés pour 2026",
        "SPORT : Les Lions Indomptables se préparent pour le prochain match",
        "ÉCONOMIE : Hausse des exportations dans la région du Nord",
        "CULTURE : Le festival NGAN-HA approche à grands pas"
      ];
      
      // On fusionne tout dans la liste finale
      setHeadlines([...internalHeadlines, ...externalHeadlines]);
    };
    fetchHeadlines();
  }, []);

  // Si aucun titre n'est disponible, on n'affiche pas la barre
  if (headlines.length === 0) return null;

  return (
    <div className="bg-primary/95 backdrop-blur-md text-primary-foreground py-2.5 border-y border-white/10 overflow-hidden relative z-50 shadow-lg">
      <div className="container mx-auto px-4 flex items-center gap-6">
        
        {/* --- ÉTIQUETTE FIXE --- */}
        <div className="flex items-center gap-2 font-display text-[10px] uppercase font-bold tracking-[0.3em] shrink-0 bg-white/20 px-4 py-1.5 rounded-full whitespace-nowrap shadow-inner">
          <TrendingUp size={12} className="animate-pulse" />
          Flash Infos
        </div>
        
        {/* --- ZONE DE DÉFILEMENT --- */}
        <div className="flex-1 overflow-hidden relative h-5">
          <motion.div
            // Animation : On déplace le bloc de droite (100%) à gauche (-100%)
            animate={{ x: ["50%", "-100%"] }}
            transition={{
              duration: 40, // Vitesse de défilement (plus c'est haut, plus c'est lent)
              repeat: Infinity,
              ease: "linear",
            }}
            className="absolute top-0 flex gap-12 items-center whitespace-nowrap"
          >
            {/* Affichage des titres */}
            {headlines.map((headline, i) => (
              <span key={i} className="text-[11px] font-bold tracking-wide flex items-center gap-4 uppercase">
                <Globe size={12} className="text-secondary animate-spin-slow" />
                {headline}
                <span className="text-white/20 select-none">•</span>
              </span>
            ))}
            
            {/* DOUBLURE DU CONTENU : Essentiel pour que l'animation boucle sans saut visuel */}
            {headlines.map((headline, i) => (
              <span key={`mirror-${i}`} className="text-[11px] font-bold tracking-wide flex items-center gap-4 uppercase">
                <Globe size={12} className="text-secondary animate-spin-slow" />
                {headline}
                <span className="text-white/20 select-none">•</span>
              </span>
            ))}
          </motion.div>
        </div>
        
        {/* --- HEURE EN DIRECT (Visible uniquement sur PC) --- */}
        <div className="hidden lg:flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-white/70 shrink-0 border-l border-white/20 pl-6">
          <AlertCircle size={12} className="text-secondary" />
          DIRECT • {new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
        </div>

      </div>
    </div>
  );
};

export default NewsTicker;
