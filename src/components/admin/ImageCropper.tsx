// Importation des outils de base de React
import { useState, useRef } from "react";
// Importation de la bibliothèque de recadrage d'image
import ReactCrop, { centerCrop, makeAspectCrop, Crop, PixelCrop } from "react-image-crop";
// Importation du CSS nécessaire à l'affichage de la zone de sélection de la bibliothèque
import "react-image-crop/dist/ReactCrop.css";
// Importation des icônes de contrôle (X pour fermer, Check pour valider)
import { X, Check } from "lucide-react";

// --- PROPRIÉTÉS DU COMPOSANT ---
interface ImageCropperProps {
  imageSrc: string;                         // Source de l'image (en base64 ou URL)
  onCropSubmit: (croppedBlob: Blob) => void; // Fonction appelée une fois le recadrage validé
  onCancel: () => void;                      // Fonction pour fermer la fenêtre sans enregistrer
}

/**
 * Fonction utilitaire pour transformer la zone sélectionnée (Crop) en un fichier image réel.
 * Utilise un élément <canvas> invisible pour "redessiner" uniquement la partie sélectionnée.
 */
const getCroppedImg = (image: HTMLImageElement, crop: PixelCrop): Promise<Blob> => {
  const canvas = document.createElement("canvas");
  // On calcule le ratio entre l'image affichée à l'écran et sa taille réelle (pixels)
  const scaleX = image.naturalWidth / image.width;
  const scaleY = image.naturalHeight / image.height;
  
  canvas.width = crop.width;
  canvas.height = crop.height;
  const ctx = canvas.getContext("2d");

  if (!ctx) {
    return Promise.reject(new Error("Impossible de créer le contexte 2D du canvas"));
  }

  // On dessine la portion de l'image source sur le canvas à la destination (0,0)
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

  // On transforme le résultat du canvas en Blob (format binaire prêt pour l'envoi au serveur)
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        reject(new Error("Le canvas est vide"));
        return;
      }
      resolve(blob);
    }, "image/jpeg", 0.95); // On exporte en JPEG avec une qualité de 95%
  });
};

/**
 * Calcule un recadrage centré par défaut au chargement de l'image.
 */
function centerAspectCrop(mediaWidth: number, mediaHeight: number, aspect: number) {
  return centerCrop(
    makeAspectCrop({ unit: "%", width: 90 }, aspect, mediaWidth, mediaHeight),
    mediaWidth,
    mediaHeight
  );
}

/**
 * Composant IMAGE CROPPER.
 * Affiche une fenêtre modale permettant de choisir une zone précise sur une photo de profil.
 */
export default function ImageCropper({ imageSrc, onCropSubmit, onCancel }: ImageCropperProps) {
  // États pour suivre la sélection de l'utilisateur
  const [crop, setCrop] = useState<Crop>();         // Zone en pourcentage
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>(); // Zone finale en pixels
  const imgRef = useRef<HTMLImageElement>(null);    // Référence vers l'élément <img> affiché

  /** Déclenché quand l'image est affichée à l'écran */
  const handleImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const { width, height } = e.currentTarget;
    // On impose un ratio de 3:4 (idéal pour les portraits de journalistes)
    setCrop(centerAspectCrop(width, height, 3 / 4));
  };

  /** Déclenché au clic sur "Valider" */
  const handleApply = async () => {
    if (completedCrop && imgRef.current) {
      const blob = await getCroppedImg(imgRef.current, completedCrop);
      onCropSubmit(blob); // On renvoie le résultat au parent
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-background rounded-2xl overflow-hidden shadow-2xl max-w-2xl w-full border border-border/50 animate-in zoom-in-95 duration-200">
        
        {/* En-tête */}
        <div className="p-4 border-b border-border flex items-center justify-between bg-muted/30">
          <h3 className="font-bold text-foreground uppercase tracking-widest text-sm italic">Recadrer la photo de profil</h3>
          <button onClick={onCancel} className="p-2 hover:bg-muted text-muted-foreground hover:text-foreground rounded-full transition-all">
            <X size={20} />
          </button>
        </div>
        
        {/* Zone de recadrage interactive */}
        <div className="p-6 flex items-center justify-center bg-black/20 min-h-[400px] max-h-[65vh] overflow-hidden">
          <ReactCrop
            crop={crop}
            onChange={(_, percentCrop) => setCrop(percentCrop)}
            onComplete={(c) => setCompletedCrop(c)}
            aspect={3 / 4}
            className="max-h-full rounded-lg shadow-2xl border border-white/10"
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
        <div className="p-4 border-t border-border flex justify-end gap-3 bg-muted/30">
          <button 
            onClick={onCancel} 
            className="px-6 py-2.5 border border-border text-foreground/70 rounded-xl hover:bg-muted font-bold uppercase tracking-widest text-xs transition-all"
          >
            Annuler
          </button>
          <button 
            onClick={handleApply} 
            disabled={!completedCrop}
            className="px-8 py-2.5 bg-primary text-white rounded-xl hover:bg-primary/90 disabled:opacity-50 flex items-center gap-2 font-bold uppercase tracking-widest text-xs shadow-lg transition-all"
          >
            <Check size={16} /> Appliquer le recadrage
          </button>
        </div>
      </div>
    </div>
  );
}
