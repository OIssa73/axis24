import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { Info, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

const About = () => {
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Valeur par défaut
  const defaultContent = `
## À propos de AXIS24 MEDIA GROUPE

AXIS24 MEDIA GROUPE est un média digital indépendant dédié à l’information locale, sociale et accessible au Cameroun.

Notre objectif est de rapprocher l’information des citoyens en proposant des contenus clairs, fiables et directement utiles au quotidien. Nous mettons en lumière l’actualité locale, les initiatives, les opportunités et les réalités sociales souvent peu visibles dans les médias traditionnels.

### Notre mission
Rendre l’information locale accessible à tous, en valorisant les réalités du terrain et en facilitant la compréhension des enjeux actuels.

### À qui nous nous adressons
Nous nous adressons principalement aux jeunes, aux professionnels, aux entrepreneurs et à toute personne souhaitant rester informée de manière simple, rapide et pertinente.

### Nos valeurs
* Fiabilité de l’information
* Clarté et accessibilité
* Proximité avec les réalités locales
* Engagement pour une information utile

AXIS24 MEDIA GROUPE s’inscrit dans une dynamique moderne de diffusion de l’information, adaptée aux usages numériques et aux besoins des nouvelles générations.
<hr/>

## Ligne éditoriale

### Positionnement
AXIS24 MEDIA GROUPE est un média orienté vers l’information locale, sociale et pratique, avec une approche accessible et moderne.

### Thématiques principales
* Actualités locales
* Société
* Opportunités (emploi, formations, événements)
* Initiatives et projets
* Culture et tendances

### Types de contenus
Nous produisons :
* Articles d’actualité
* Brèves informatives
* Interviews
* Reportages
* Contenus explicatifs (décryptage)

### Style éditorial
Notre ligne éditoriale repose sur un style :
* Clair
* Direct
* Accessible
* Informatif
Nous privilégions une écriture simple, compréhensible par tous, tout en maintenant un niveau de rigueur dans le traitement de l’information.

### Engagement éditorial
Nous nous engageons à :
* Vérifier les informations avant publication
* Éviter les contenus trompeurs ou non vérifiés
* Mettre en avant des sujets utiles et concrets
* Respecter une neutralité dans le traitement de l’information
  `;

  useEffect(() => {
    const fetchContent = async () => {
      const { data } = await supabase
        .from("site_settings")
        .select("value")
        .eq("key", "about_page_content")
        .maybeSingle();

      if (data && data.value) {
        setContent(data.value as string);
      } else {
        setContent(defaultContent);
      }
      setLoading(false);
    };

    window.scrollTo(0, 0); // On s'assure d'être en haut de la page
    fetchContent();
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Navbar />
      
      <main className="flex-1 container mx-auto px-4 py-32 max-w-4xl">
        {/* Bouton retour */}
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-all mb-8 group uppercase text-xs font-bold tracking-widest"
        >
          <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
          Revenir en arrière
        </motion.button>
        
        <motion.div
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           className="text-center mb-16"
        >
          <div className="inline-flex items-center justify-center p-4 rounded-full bg-primary/10 mb-6">
            <Info className="w-8 h-8 text-primary" />
          </div>
          <h1 className="font-display text-4xl md:text-5xl font-bold uppercase tracking-widest mb-6">À Propos & Ligne Éditoriale</h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto italic text-justify [text-justify:inter-character]">
            Découvrez qui nous sommes et notre engagement quotidien pour une information claire, locale et pertinente.
          </p>
        </motion.div>

        {loading ? (
          <div className="animate-pulse space-y-6">
            <div className="h-4 bg-muted rounded w-3/4"></div>
            <div className="h-4 bg-muted rounded w-1/2"></div>
            <div className="h-4 bg-muted rounded w-full"></div>
            <div className="h-4 bg-muted rounded w-5/6"></div>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="prose prose-invert prose-primary max-w-none 
              prose-headings:font-display prose-headings:uppercase prose-headings:tracking-widest 
              prose-h2:text-3xl prose-h2:text-primary prose-h2:mt-16 prose-h2:mb-8 prose-h2:border-b prose-h2:border-border prose-h2:pb-4
              prose-h3:text-xl prose-h3:text-secondary prose-h3:mt-8
              prose-p:text-lg prose-p:leading-relaxed prose-p:text-muted-foreground prose-p:text-justify prose-p:[text-justify:inter-character]
              prose-ul:text-foreground prose-li:marker:text-primary prose-li:my-2
              glass-card p-6 md:p-12 rounded-3xl"
          >
            {/* Rendu basique du markdown. Dans un contexte de prod, on utiliserait ReactMarkdown, mais on injecte tel quel ou on fait des replace basiques pour les balises simples pour coller au besoin métier sans ajout lourd de libs. */}
            <div 
               dangerouslySetInnerHTML={{ __html: content
                .replace(/^### (.*$)/gim, '<h3>$1</h3>')
                .replace(/^## (.*$)/gim, '<h2>$1</h2>')
                .replace(/^\* (.*$)/gim, '<li>$1</li>')
                .replace(/\n\n/gim, '<br/>')
                // Basic list wrapping
                .replace(/(<li>.*?<\/li>)/s, '<ul>$1</ul>')
              }} 
            />
          </motion.div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default About;
