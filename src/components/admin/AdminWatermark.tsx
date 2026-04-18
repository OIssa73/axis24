import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Save, Loader2, ImagePlus, X, Stamp } from "lucide-react";

export interface WatermarkConfig {
  enabled: boolean;
  logoUrl: string | null;
  position: "top-right" | "top-left" | "bottom-right" | "bottom-left";
  size: number; // percentage (ex: 15 for 15%)
  opacity: number; // 0 to 100
}

const defaultWatermark: WatermarkConfig = {
  enabled: false,
  logoUrl: null,
  position: "top-right",
  size: 15,
  opacity: 90,
};

const AdminWatermark = () => {
  const [config, setConfig] = useState<WatermarkConfig>(defaultWatermark);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [newLogoFile, setNewLogoFile] = useState<File | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const fetchConfig = async () => {
      const { data } = await supabase
        .from("site_settings")
        .select("value")
        .eq("key", "watermark_config")
        .maybeSingle();

      if (data && data.value) {
        setConfig({ ...defaultWatermark, ...(data.value as unknown as WatermarkConfig) });
      }
      setLoading(false);
    };
    fetchConfig();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        toast({ title: "Format invalide", description: "Veuillez uploader une image (PNG recommandé).", variant: "destructive" });
        return;
      }
      setNewLogoFile(file);
    }
  };

  const removeLogo = () => {
    setConfig({ ...config, logoUrl: null });
    setNewLogoFile(null);
  };

  const uploadLogo = async (file: File): Promise<string> => {
    const ext = file.name.split(".").pop();
    const path = `watermarks/logo-${Date.now()}.${ext}`;
    const { data, error } = await supabase.storage.from("media").upload(path, file);
    if (error) throw error;
    const { data: urlData } = supabase.storage.from("media").getPublicUrl(data.path);
    return urlData.publicUrl;
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      let finalConfig = { ...config };

      if (newLogoFile) {
        const logoUrl = await uploadLogo(newLogoFile);
        finalConfig.logoUrl = logoUrl;
      }

      const { error } = await supabase
        .from("site_settings")
        .upsert({ key: "watermark_config", value: finalConfig as unknown as Record<string, unknown> });

      if (error) throw error;

      setConfig(finalConfig);
      setNewLogoFile(null);
      toast({ title: "Filigrane mis à jour", description: "La configuration du logo a été sauvegardée avec succès." });
    } catch (err: unknown) {
      toast({ title: "Erreur", description: (err as Error).message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="flex justify-center p-20"><Loader2 className="animate-spin text-primary" size={40} /></div>;

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in duration-500">
      <div className="glass-card p-8 shadow-xl shadow-black/5 dark:bg-card border-l-4 border-l-primary">
        <div className="flex items-center justify-between border-b border-border pb-6 mb-8">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-primary/10 rounded-xl text-primary">
              <Stamp size={28} />
            </div>
            <div>
              <h3 className="text-2xl font-display uppercase tracking-widest text-foreground font-bold">Filigrane & Logo</h3>
              <p className="text-sm text-muted-foreground mt-1">Superposez automatiquement votre logo sur vos vidéos et images "Comme à la TV".</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs uppercase font-bold tracking-widest text-muted-foreground">
              {config.enabled ? "Activé" : "Désactivé"}
            </span>
            <div 
              className={`w-14 h-8 rounded-full relative cursor-pointer transition-colors flex items-center px-1 shadow-inner ${config.enabled ? "bg-primary" : "bg-muted border border-border"}`}
              onClick={() => setConfig({ ...config, enabled: !config.enabled })}
            >
              <div className={`w-6 h-6 bg-white rounded-full shadow-md transition-all ${config.enabled ? "translate-x-6" : "translate-x-0"}`} />
            </div>
          </div>
        </div>

        <div className={`transition-opacity duration-300 ${!config.enabled ? "opacity-50 pointer-events-none grayscale" : ""}`}>
          <div className="grid md:grid-cols-2 gap-8">
            
            {/* Colonne de Gauche : Upload & Visuel */}
            <div className="space-y-6">
              <div className="bg-muted/30 border border-border rounded-2xl p-6 text-center shadow-inner">
                <label className="text-sm font-bold uppercase tracking-widest text-primary mb-4 block">Votre Logo Actuel</label>
                
                <div className="w-full aspect-video bg-checkerboard rounded-xl border-2 border-dashed border-border/60 flex items-center justify-center relative overflow-hidden bg-white/5">
                  <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'linear-gradient(45deg, #000 25%, transparent 25%), linear-gradient(-45deg, #000 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #000 75%), linear-gradient(-45deg, transparent 75%, #000 75%)', backgroundSize: '20px 20px', backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px' }} />
                  
                  {newLogoFile ? (
                    <>
                      <img src={URL.createObjectURL(newLogoFile)} alt="Preview Logo" className="max-w-[80%] max-h-[80%] object-contain drop-shadow-2xl z-10" />
                      <button onClick={() => setNewLogoFile(null)} className="absolute top-2 right-2 bg-destructive/80 text-white p-1.5 rounded-lg hover:bg-destructive shadow-lg z-20 transition-transform hover:scale-110">
                        <X size={16} />
                      </button>
                    </>
                  ) : config.logoUrl ? (
                    <>
                      <img src={config.logoUrl} alt="Watermark" className="max-w-[80%] max-h-[80%] object-contain drop-shadow-2xl z-10" />
                      <button onClick={removeLogo} className="absolute top-2 right-2 bg-destructive/80 text-white p-1.5 rounded-lg hover:bg-destructive shadow-lg z-20 transition-transform hover:scale-110">
                        <X size={16} />
                      </button>
                    </>
                  ) : (
                    <div className="flex flex-col items-center justify-center text-muted-foreground z-10">
                      <ImagePlus size={32} className="mb-2 opacity-50" />
                      <span className="text-xs uppercase font-bold tracking-widest">Aucun Logo</span>
                    </div>
                  )}
                </div>

                <div className="mt-4 relative">
                  <input type="file" accept="image/png, image/jpeg, image/webp" onChange={handleFileChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                  <div className="w-full bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 transition-colors py-3 px-4 rounded-xl text-sm font-bold flex items-center justify-center gap-2">
                    <ImagePlus size={18} />
                    {config.logoUrl || newLogoFile ? "Remplacer le fichier" : "Parcourir un fichier"}
                  </div>
                </div>
                <p className="text-[10px] text-muted-foreground uppercase tracking-widest mt-3 opacity-70">PNG Transparent recommandé. Max 2Mo.</p>
              </div>
            </div>

            {/* Colonne de Droite : Paramètres */}
            <div className="space-y-8 bg-muted/10 p-6 rounded-2xl border border-border/50">
              
              {/* Position */}
              <div className="space-y-4">
                <label className="text-[11px] font-bold uppercase tracking-widest text-primary flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary" />Position sur l'écran
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { id: "top-left", label: "Haut Gauche" },
                    { id: "top-right", label: "Haut Droite" },
                    { id: "bottom-left", label: "Bas Gauche" },
                    { id: "bottom-right", label: "Bas Droite" }
                  ].map(pos => (
                    <button
                      key={pos.id}
                      onClick={() => setConfig({ ...config, position: pos.id as any })}
                      className={`py-3 px-4 rounded-xl text-xs font-bold uppercase tracking-widest border transition-all ${
                        config.position === pos.id 
                          ? "bg-primary text-white border-primary shadow-md shadow-primary/20" 
                          : "bg-background border-border text-muted-foreground hover:border-primary/50"
                      }`}
                    >
                      {pos.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Taille */}
              <div className="space-y-4">
                <div className="flex justify-between">
                  <label className="text-[11px] font-bold uppercase tracking-widest text-primary flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary" />Échelle du Logo
                  </label>
                  <span className="text-[11px] font-bold text-muted-foreground bg-muted px-2 py-0.5 rounded">{config.size}% de la largeur</span>
                </div>
                <input 
                  type="range" 
                  min="5" 
                  max="50" 
                  value={config.size} 
                  onChange={(e) => setConfig({ ...config, size: parseInt(e.target.value) })}
                  className="w-full accent-primary h-2 bg-border rounded-lg appearance-none cursor-pointer" 
                />
                <div className="flex justify-between text-[10px] text-muted-foreground">
                  <span>Très petit (5%)</span>
                  <span>Grand (50%)</span>
                </div>
              </div>

              {/* Opacité */}
              <div className="space-y-4">
                <div className="flex justify-between">
                  <label className="text-[11px] font-bold uppercase tracking-widest text-primary flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary" />Opacité
                  </label>
                  <span className="text-[11px] font-bold text-muted-foreground bg-muted px-2 py-0.5 rounded">{config.opacity}%</span>
                </div>
                <input 
                  type="range" 
                  min="20" 
                  max="100" 
                  value={config.opacity} 
                  onChange={(e) => setConfig({ ...config, opacity: parseInt(e.target.value) })}
                  className="w-full accent-primary h-2 bg-border rounded-lg appearance-none cursor-pointer" 
                />
                <div className="flex justify-between text-[10px] text-muted-foreground">
                  <span>Transparent (20%)</span>
                  <span>Solide (100%)</span>
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* Bouton Sauvegarder */}
        <div className="mt-10 pt-6 border-t border-border flex justify-end">
          <button
            onClick={handleSave}
            disabled={saving || (!config.logoUrl && !newLogoFile && config.enabled)}
            className="btn-primary-glow flex items-center gap-3 px-8 py-4 rounded-xl text-sm font-bold uppercase tracking-widest disabled:opacity-50"
          >
            {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
            Appliquer au Site Entier
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminWatermark;
