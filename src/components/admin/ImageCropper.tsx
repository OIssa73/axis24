import { useState, useRef } from "react";
import ReactCrop, { centerCrop, makeAspectCrop, Crop, PixelCrop } from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";
import { X, Check } from "lucide-react";

interface ImageCropperProps {
  imageSrc: string;
  onCropSubmit: (croppedBlob: Blob) => void;
  onCancel: () => void;
}

const getCroppedImg = (image: HTMLImageElement, crop: PixelCrop): Promise<Blob> => {
  const canvas = document.createElement("canvas");
  const scaleX = image.naturalWidth / image.width;
  const scaleY = image.naturalHeight / image.height;
  canvas.width = crop.width;
  canvas.height = crop.height;
  const ctx = canvas.getContext("2d");

  if (!ctx) {
    return Promise.reject(new Error("No 2d context"));
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
        reject(new Error("Canvas is empty"));
        return;
      }
      resolve(blob);
    }, "image/jpeg", 0.95);
  });
};

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

  const handleImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const { width, height } = e.currentTarget;
    setCrop(centerAspectCrop(width, height, 3 / 4));
  };

  const handleApply = async () => {
    if (completedCrop && imgRef.current) {
      const blob = await getCroppedImg(imgRef.current, completedCrop);
      onCropSubmit(blob);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-background rounded-2xl overflow-hidden shadow-2xl max-w-2xl w-full animate-in zoom-in-95 duration-200">
        <div className="p-4 border-b border-border flex items-center justify-between">
          <h3 className="font-semibold text-foreground">Recadrer la photo (3:4)</h3>
          <button onClick={onCancel} className="p-1 hover:bg-muted text-foreground rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>
        
        <div className="p-4 flex items-center justify-center bg-black/5 min-h-[300px] max-h-[60vh] overflow-hidden">
          <ReactCrop
            crop={crop}
            onChange={(_, percentCrop) => setCrop(percentCrop)}
            onComplete={(c) => setCompletedCrop(c)}
            aspect={3 / 4}
            className="max-h-full"
          >
            <img 
              ref={imgRef}
              src={imageSrc} 
              onLoad={handleImageLoad}
              alt="Crop" 
              className="max-w-full max-h-[55vh] object-contain"
            />
          </ReactCrop>
        </div>
        
        <div className="p-4 border-t border-border flex justify-end gap-3">
          <button onClick={onCancel} className="px-4 py-2 border border-border text-foreground rounded-lg hover:bg-muted text-sm font-medium transition-colors">
            Annuler
          </button>
          <button 
            onClick={handleApply} 
            disabled={!completedCrop}
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50 flex items-center gap-2 text-sm font-bold uppercase tracking-wider transition-colors"
          >
            <Check size={16} /> Valider
          </button>
        </div>
      </div>
    </div>
  );
}
