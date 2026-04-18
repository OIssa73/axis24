// Importation des outils de base de React
import { useState, useRef } from "react";
// Importation de la bibliothèque de recadrage d'image
import ReactCrop, { centerCrop, makeAspectCrop, Crop, PixelCrop } from "react-image-crop";
// Importation du CSS nécessaire à l'affichage de la zone de sélection de la bibliothèque
import "react-image-crop/dist/ReactCrop.css";
// Importation des icônes de contrôle
import { X, Check, Maximize, Smartphone, Monitor, Square } from "lucide-react";

// --- PROPRIÉTÉS DU COMPOSANT ---
interface ImageCropperProps {
  imageSrc: string;                         // Source de l'image (en base64 ou URL)
  onCropSubmit: (croppedBlob: Blob) => void; // Fonction appelée une fois le recadrage validé
  onCancel: () => void;                      // Fonction pour fermer la fenêtre sans enregistrer
}

/**
 * Fonction utilitaire pour transformer la zone sélectionnée (Crop) en un fichier image réel.
 */
const getCroppedImg = (image: HTMLImageElement, crop: PixelCrop): Promise<Blob> => {
  const canvas = document.createElement("canvas");
  const scaleX = image.naturalWidth / image.width;
  const scaleY = image.naturalHeight / image.height;
  
  canvas.width = crop.width;
  canvas.height = crop.height;
  const ctx = canvas.getContext("2d");

  if (!ctx) {
    return Promise.reject(new Error("Impossible de créer le contexte 2D du canvas"));
  }

  ctx.drawImage(
    image,
    crop.x * scaleX,
    crop.y * scaleY,
    crop.width * scaleX,
    crop.height * scaleY,
    0,
    0,
    crop.width,
    crop.height
  );

  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        reject(new Error("Le canvas est vide"));
        return;
      }
      resolve(blob);
    }, "image/jpeg", 0.95);
  });
};

/**
 * Calcule un recadrage centré selon un ratio donné.
 */
function centerAspectCrop(mediaWidth: number, mediaHeight: number, aspect: number) {
  return centerCrop(
    makeAspectCrop({ unit: "%", width: 90 }, aspect, mediaWidth, mediaHeight),
    mediaWidth,
    mediaHeight
  );
}

export default function ImageCropper({ imageSrc, onCropSubmit, onCancel }: ImageCropperProps) {
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
  const imgRef = useRef<HTMLImageElement>(null);
  
  // undefined = Format libre (aucun aspect imposé)
  const [currentAspect, setCurrentAspect] = useState<number | undefined>(undefined);

  /** Déclenché quand l'image est affichée à l'écran */
  const handleImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const { width, height } = e.currentTarget;
    // Par défaut, un cadre libre centré de 50%
    const cropSize = Math.min(width, height) * 0.5;
    setCrop({
        unit: 'px',
        width: cropSize,
        height: cropSize,
        x: (width - cropSize) / 2,
        y: (height - cropSize) / 2,
    });
  };

  /** Change le ratio d'aspect */
  const handleAspectChange = (aspect: number | undefined) => {
    setCurrentAspect(aspect);
    if (aspect && imgRef.current) {
        const { width, height } = imgRef.current;
        setCrop(centerAspectCrop(width, height, aspect));
    }
  };

  /** Déclenché au clic sur "Valider" */
  const handleApply = async () => {
    if (completedCrop && imgRef.current) {
      const blob = await getCroppedImg(imgRef.current, completedCrop);
      onCropSubmit(blob);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-background rounded-2xl overflow-hidden shadow-2xl max-w-3xl w-full border border-border/50 animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
        
        {/* En-tête avec options de ratio */}
        <div className="p-4 border-b border-border flex flex-col sm:flex-row items-center justify-between bg-muted/30 gap-4">
          <div className="flex bg-black/20 p-1 rounded-xl">
            <button 
                onClick={() => handleAspectChange(undefined)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors ${!currentAspect ? 'bg-primary text-white shadow' : 'text-muted-foreground hover:bg-black/20'}`}
            >
                <Maximize size={14} /> Libre
            </button>
            <button 
                onClick={() => handleAspectChange(16/9)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors ${currentAspect === 16/9 ? 'bg-primary text-white shadow' : 'text-muted-foreground hover:bg-black/20'}`}
            >
                <Monitor size={14} /> 16:9
            </button>
            <button 
                onClick={() => handleAspectChange(3/4)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors ${currentAspect === 3/4 ? 'bg-primary text-white shadow' : 'text-muted-foreground hover:bg-black/20'}`}
            >
                <Smartphone size={14} /> 3:4
            </button>
            <button 
                onClick={() => handleAspectChange(1)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors ${currentAspect === 1 ? 'bg-primary text-white shadow' : 'text-muted-foreground hover:bg-black/20'}`}
            >
                <Square size={14} /> 1:1
            </button>
          </div>

          <button onClick={onCancel} className="p-2 hover:bg-muted text-muted-foreground hover:text-foreground rounded-full transition-all">
            <X size={20} />
          </button>
        </div>
        
        {/* Zone de recadrage interactive */}
        <div className="p-6 flex items-center justify-center bg-black/40 flex-1 overflow-auto">
          <ReactCrop
            crop={crop}
            onChange={(_, percentCrop) => setCrop(percentCrop)}
            onComplete={(c) => setCompletedCrop(c)}
            aspect={currentAspect}
            className="max-h-full rounded-lg shadow-2xl border border-white/10 mx-auto"
          >
            <img 
              ref={imgRef}
              src={imageSrc} 
              onLoad={handleImageLoad}
              alt="Source à recadrer" 
              className="max-w-full max-h-[60vh] object-contain"
            />
          </ReactCrop>
        </div>
        
        {/* Pied de page avec actions */}
        <div className="p-4 border-t border-border flex justify-end gap-3 bg-muted/30 shrink-0">
          <button 
            onClick={onCancel} 
            className="px-6 py-2.5 border border-border text-foreground/70 rounded-xl hover:bg-muted font-bold uppercase tracking-widest text-xs transition-all"
          >
            Annuler
          </button>
          <button 
            onClick={handleApply} 
            disabled={!completedCrop || completedCrop.width === 0}
            className="px-8 py-2.5 bg-primary text-white rounded-xl hover:bg-primary/90 disabled:opacity-50 flex items-center gap-2 font-bold uppercase tracking-widest text-xs shadow-lg transition-all"
          >
            <Check size={16} /> Appliquer le recadrage
          </button>
        </div>
      </div>
    </div>
  );
}
