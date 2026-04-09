// Importation des outils de React pour gérer les états et le chargement
import { useEffect, useState } from "react";
// Importation de la connexion à la base de données
import { supabase } from "@/integrations/supabase/client";
// Importation des icônes pour chaque type de contenu (Audio, Vidéo, Article, Image, Vues, Downloads...)
import { FileAudio, FileVideo, Newspaper, Images, Eye, Download, Users, Megaphone } from "lucide-react";

/** Structure des statistiques affichées sur le tableau de bord */
interface Stats {
  audioCount: number;
  videoCount: number;
  articleCount: number;
  imageCount: number;
  totalViews: number;
  totalDownloads: number;
  activeAdsCount: number; // Nombre de bannières publicitaires actives
}

/**
 * Composant ADMIN STATS.
 * Affiche les chiffres clés de la plateforme (quantité de contenu et popularité).
 */
const AdminStats = () => {
  // --- ÉTATS ---
  const [stats, setStats] = useState<Stats>({
    audioCount: 0, videoCount: 0, articleCount: 0, imageCount: 0,
    totalViews: 0, totalDownloads: 0, activeAdsCount: 0,
  });

  /**
   * Calcule les statistiques en interrogeant la base de données.
   */
  useEffect(() => {
    const fetchStats = async () => {
      // 1. On récupère toutes les lignes de la table 'content' (uniquement les colonnes nécessaires pour économiser la bande passante)
      const { data: content } = await supabase.from("content").select("type, views_count, downloads_count");
      
      // 2. On récupère la configuration des publicités pour compter celles qui sont activées
      let adsCount = 0;
      const { data: adsData } = await supabase
        .from("site_settings")
        .select("value")
        .eq("key", "ads_config")
        .maybeSingle();

      if (adsData && adsData.value) {
        const val: any = adsData.value;
        // On récupère la liste des bannières (format moderne ou ancien)
        const banners = Array.isArray(val.banners) ? val.banners : (val.banner ? [val.banner] : []);
        // On ne compte que celles qui sont marquées comme "enabled" (activées)
        adsCount = banners.filter((b: any) => b.enabled !== false).length;
      }

      // 3. Calculs et mise à jour de l'état
      setStats({
        // Comptage par filtrage du type de contenu
        audioCount: content ? content.filter((c) => c.type === "audio").length : 0,
        videoCount: content ? content.filter((c) => c.type === "video").length : 0,
        articleCount: content ? content.filter((c) => c.type === "article").length : 0,
        imageCount: content ? content.filter((c) => c.type === "image").length : 0,
        // Somme des compteurs (Vues et Téléchargements)
        totalViews: content ? content.reduce((sum, c) => sum + (c.views_count || 0), 0) : 0,
        totalDownloads: content ? content.reduce((sum, c) => sum + (c.downloads_count || 0), 0) : 0,
        activeAdsCount: adsCount,
      });
    };

    fetchStats();
  }, []);

  // Liste des cartes à afficher (facilite la boucle de rendu ci-dessous)
  const cards = [
    { label: "Audios", value: stats.audioCount, icon: FileAudio, color: "text-primary" },
    { label: "Vidéos", value: stats.videoCount, icon: FileVideo, color: "text-blue-400" },
    { label: "Articles", value: stats.articleCount, icon: Newspaper, color: "text-green-400" },
    { label: "Images", value: stats.imageCount, icon: Images, color: "text-yellow-400" },
    { label: "Annonceurs", value: stats.activeAdsCount, icon: Megaphone, color: "text-red-500" },
    { label: "Vues totales", value: stats.totalViews, icon: Eye, color: "text-purple-400" },
    { label: "Téléchargements", value: stats.totalDownloads, icon: Download, color: "text-orange-400" },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {cards.map((card) => (
        <div key={card.label} className="glass-card p-5 group hover:border-primary/20 transition-all bg-white dark:bg-card">
          <div className="flex items-center gap-3 mb-3">
            <div className={`w-10 h-10 rounded-lg bg-muted flex items-center justify-center transition-colors group-hover:bg-muted/80 ${card.color}`}>
              <card.icon size={20} />
            </div>
          </div>
          {/* Affichage du chiffre avec une police stylisée */}
          <p className="font-display text-3xl text-foreground font-bold tracking-tighter">
            {card.value.toLocaleString()} 
          </p>
          <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold opacity-60">{card.label}</p>
        </div>
      ))}
    </div>
  );
};

export default AdminStats;
