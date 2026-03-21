import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { FileAudio, FileVideo, Newspaper, Images, Eye, Download, Users } from "lucide-react";

interface Stats {
  audioCount: number;
  videoCount: number;
  articleCount: number;
  imageCount: number;
  totalViews: number;
  totalDownloads: number;
}

const AdminStats = () => {
  const [stats, setStats] = useState<Stats>({
    audioCount: 0, videoCount: 0, articleCount: 0, imageCount: 0,
    totalViews: 0, totalDownloads: 0,
  });

  useEffect(() => {
    const fetchStats = async () => {
      const { data: content } = await supabase.from("content").select("type, views_count, downloads_count");
      if (!content) return;

      setStats({
        audioCount: content.filter((c) => c.type === "audio").length,
        videoCount: content.filter((c) => c.type === "video").length,
        articleCount: content.filter((c) => c.type === "article").length,
        imageCount: content.filter((c) => c.type === "image").length,
        totalViews: content.reduce((sum, c) => sum + (c.views_count || 0), 0),
        totalDownloads: content.reduce((sum, c) => sum + (c.downloads_count || 0), 0),
      });
    };

    fetchStats();
  }, []);

  const cards = [
    { label: "Audios", value: stats.audioCount, icon: FileAudio, color: "text-primary" },
    { label: "Vidéos", value: stats.videoCount, icon: FileVideo, color: "text-blue-400" },
    { label: "Articles", value: stats.articleCount, icon: Newspaper, color: "text-green-400" },
    { label: "Images", value: stats.imageCount, icon: Images, color: "text-yellow-400" },
    { label: "Vues totales", value: stats.totalViews, icon: Eye, color: "text-purple-400" },
    { label: "Téléchargements", value: stats.totalDownloads, icon: Download, color: "text-orange-400" },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
      {cards.map((card) => (
        <div key={card.label} className="glass-card p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className={`w-10 h-10 rounded-lg bg-muted flex items-center justify-center ${card.color}`}>
              <card.icon size={20} />
            </div>
          </div>
          <p className="font-display text-3xl text-foreground">{card.value}</p>
          <p className="text-sm text-muted-foreground">{card.label}</p>
        </div>
      ))}
    </div>
  );
};

export default AdminStats;
