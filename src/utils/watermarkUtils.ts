import { WatermarkConfig } from "@/components/admin/AdminWatermark";
import { supabase } from "@/integrations/supabase/client";

/**
 * Charge une image depuis une URL ou un File (Blob)
 */
const loadImage = (src: string | Blob): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "Anonymous"; // Pour éviter les soucis de CORS sur le logo depuis supabase
    img.onload = () => resolve(img);
    img.onerror = reject;
    if (src instanceof Blob) {
      img.src = URL.createObjectURL(src);
    } else {
      img.src = src;
    }
  });
};

/**
 * Récupère la configuration globale du filigrane
 */
export const getWatermarkConfig = async (): Promise<WatermarkConfig | null> => {
  const { data } = await supabase
    .from("site_settings")
    .select("value")
    .eq("key", "watermark_config")
    .maybeSingle();

  if (data && data.value) {
    const config = data.value as unknown as WatermarkConfig;
    if (config.enabled && config.logoUrl) {
      return config;
    }
  }
  return null;
};

/**
 * Fusionne "en dur" un logo sur une image (pour les publications de type image)
 * Retourne le fichier original s'il n'y a pas de logo configuré ou de problème.
 */
export const applyWatermarkToImage = async (originalFile: File, config: WatermarkConfig | null): Promise<File> => {
  try {
    if (!config || !config.enabled || !config.logoUrl) {
      return originalFile; // On renvoie l'original si le filigrane est désactivé
    }

    const baseImg = await loadImage(originalFile);
    const logoImg = await loadImage(config.logoUrl);

    // Initialisation du fond (Canvas)
    const canvas = document.createElement("canvas");
    canvas.width = baseImg.width;
    canvas.height = baseImg.height;
    const ctx = canvas.getContext("2d");

    if (!ctx) return originalFile;

    // 1. Dessiner l'image de fond
    ctx.drawImage(baseImg, 0, 0, canvas.width, canvas.height);

    // 2. Calculer la taille du logo (en fonction du % choisi)
    // ratio = (canvas.width * (config.size / 100)) / logoImg.width;
    const logoWidth = canvas.width * (config.size / 100);
    const proportion = logoWidth / logoImg.width;
    const logoHeight = logoImg.height * proportion;

    // 3. Calculer la position avec marginX et marginY (ou 3% par défaut)
    const marginX = canvas.width * ((config.marginX ?? 3) / 100);
    const marginY = canvas.height * ((config.marginY ?? 3) / 100);
    let x = marginX;
    let y = marginY;

    if (config.position === "top-right") {
      x = canvas.width - logoWidth - marginX;
      y = marginY;
    } else if (config.position === "bottom-left") {
      x = marginX;
      y = canvas.height - logoHeight - marginY;
    } else if (config.position === "bottom-right") {
      x = canvas.width - logoWidth - marginX;
      y = canvas.height - logoHeight - marginY;
    }

    // 4. Appliquer de la transparence selon le réglage
    ctx.globalAlpha = config.opacity / 100;
    
    // 5. Dessiner le logo par dessus l'image
    ctx.drawImage(logoImg, x, y, logoWidth, logoHeight);

    // Retour à l'opacité normale
    ctx.globalAlpha = 1.0;

    // Convertir de nouveau en File
    const finalBlob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/jpeg", 0.95));
    
    if (finalBlob) {
      return new File([finalBlob], originalFile.name.replace(/\.[^/.]+$/, "") + "-watermarked.jpg", {
        type: "image/jpeg",
        lastModified: Date.now(),
      });
    }

    return originalFile;
  } catch (error) {
    console.error("Erreur lors de l'incrustation du filigrane :", error);
    // En cas d'échec de la fusion, par sécurité, on renvoie le fichier original pour ne pas bloquer l'utilisateur
    return originalFile;
  }
};
