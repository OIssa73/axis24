// Importation des outils de React pour gérer les états et les effets
import { useState, useEffect } from "react";
// Importation de la connexion à la base de données
import { supabase } from "@/integrations/supabase/client";
// Importation des icônes d'interface (Megaphone, Star, Save, Image, Edit, Eye...)
import { Plus, Trash2, Loader2, Megaphone, Star, Save, Image as ImageIcon, Edit2, Eye, EyeOff, ArrowUp, ArrowDown, Check } from "lucide-react";
// Importation de l'outil de notification (Toast)
import { useToast } from "@/hooks/use-toast";

// --- STRUCTURES DES DONNÉES (Types) ---

/** Structure d'un partenaire (logo affiché en bas de page) */
interface Partner {
  id: string;
  name: string;
  url: string;
  category: string;
  enabled: boolean;
}

/** Structure d'une bannière publicitaire dans le carrousel */
export interface AdBanner {
  id: string;
  enabled: boolean;
  imageUrl: string;
  linkUrl: string;
  title: string;
  description: string;
}

/** Configuration globale regroupant bannières et partenaires */
interface AdsConfig {
  banners: AdBanner[];
  partners: Partner[];
  showCta: boolean; // Afficher ou non le bouton "Devenir partenaire"
}

// Valeurs par défaut si la base de données est vide
const defaultBanner: AdBanner = {
  id: "default-1",
  enabled: true,
  imageUrl: "",
  linkUrl: "",
  title: "VOTRE PUBLICITÉ ICI",
  description: "Boostez votre visibilité avec notre audience régionale et internationale."
};

const defaultAdsConfig: AdsConfig = {
  banners: [defaultBanner],
  partners: [
    { id: "1", name: "CRTV News", url: "https://www.crtv.cm", category: "Partenaire TV", enabled: true },
    { id: "2", name: "Cameroon Tribune", url: "https://www.cameroon-tribune.cm", category: "Presse Écrite", enabled: true },
    { id: "3", name: "Orange Cameroun", url: "https://www.orange.cm", category: "Sponsor", enabled: true },
    { id: "4", name: "Camtel", url: "https://www.camtel.cm", category: "Sponsor Officiel", enabled: true },
  ],
  showCta: true
};

/**
 * Composant ADMIN ADS (Gestion Publicité & Partenariat).
 * Permet de configurer le carrousel de la page d'accueil et la liste des partenaires.
 */
const AdminAds = () => {
  // --- ÉTATS ---
  const [config, setConfig] = useState<AdsConfig>(defaultAdsConfig); // Toute la config publicitaire
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false); // Mode "Enregistrement en cours"
  const [uploading, setUploading] = useState(false); // Mode "Upload d'image en cours"
  const { toast } = useToast();

  // États temporaires pour les formulaires d'ajout
  const [newPartner, setNewPartner] = useState({ name: "", url: "", category: "", enabled: true });
  const [editingPartnerId, setEditingPartnerId] = useState<string | null>(null);

  const [newBanner, setNewBanner] = useState<Omit<AdBanner, 'id'>>({
    enabled: true, imageUrl: '', linkUrl: '', title: '', description: ''
  });
  const [editingBannerId, setEditingBannerId] = useState<string | null>(null);

  /**
   * Chargement de la configuration depuis la table 'site_settings'.
   */
  useEffect(() => {
    const fetchConfig = async () => {
      const { data, error } = await supabase
        .from("site_settings")
        .select("value")
        .eq("key", "ads_config")
        .maybeSingle();

      if (data && data.value) {
        const val = data.value as { banners?: AdBanner[], banner?: AdBanner, partners?: Partner[], showCta?: boolean };
        
        let loadedBanners: AdBanner[] = [];
        // Gestion de la transition entre l'ancien format (1 seule bannière) et le nouveau (liste)
        if (val.banners && Array.isArray(val.banners)) {
          loadedBanners = val.banners;
        } else if (val.banner) {
          loadedBanners = [{ ...val.banner, id: "legacy-banner-1", enabled: val.banner.enabled !== false }];
        } else {
          loadedBanners = [defaultBanner];
        }

        const partners = (val.partners || []).map((p: Partner) => ({ ...p, enabled: p.enabled !== false }));
        const showCta = val.showCta !== false;

        setConfig({ banners: loadedBanners, partners, showCta });
      } else if (!error && !data) {
        setConfig(defaultAdsConfig); // Si rien en BDD, on met les valeurs par défaut
      }
      setLoading(false);
    };
    fetchConfig();
  }, []);

  /**
   * Enregistre toute la configuration (Bannières + Partenaires) dans Supabase.
   */
  const handleSave = async () => {
    setSaving(true);
    const { error } = await supabase
      .from("site_settings")
      .upsert({ key: "ads_config", value: config as unknown as Record<string, unknown> });

    if (error) {
      toast({ title: "Erreur", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Modifications enregistrées", description: "Le carrousel et les partenaires ont été mis à jour." });
    }
    setSaving(false);
  };

  /**
   * Envoie une image de bannière dans le stockage (Storage) de Supabase.
   */
  const handleBannerFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    
    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const filePath = `ads/${Math.random()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage.from("media").upload(filePath, file);
      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from("media").getPublicUrl(filePath);
      
      setNewBanner(prev => ({ ...prev, imageUrl: data.publicUrl })); // URL récupérée
      toast({ title: "Image chargée", description: "L'image est prête pour la bannière." });
    } catch (error: unknown) {
      toast({ title: "Échec de l'upload", description: (error as Error).message, variant: "destructive" });
    } finally {
      setUploading(false);
    }
  };

  // --- GESTION DES BANNIÈRES (CARROUSEL) ---

  /** Ajoute une bannière à la liste ou valide une modification */
  const handleAddOrUpdateBanner = () => {
    if (!newBanner.title && !newBanner.imageUrl) {
      toast({ title: "Erreur", description: "Donnez au moins un titre ou une image.", variant: "destructive" });
      return;
    }

    if (editingBannerId) {
      setConfig(prev => ({
        ...prev,
        banners: prev.banners.map(b => b.id === editingBannerId ? { id: b.id, ...newBanner } : b)
      }));
      setEditingBannerId(null);
      toast({ title: "Annonce modifiée" });
    } else {
      const bannerToAdd: AdBanner = { id: Date.now().toString(), ...newBanner };
      setConfig(prev => ({ ...prev, banners: [...prev.banners, bannerToAdd] }));
      toast({ title: "Annonce ajoutée au carrousel" });
    }
    // Reset du formulaire local
    setNewBanner({ enabled: true, imageUrl: '', linkUrl: '', title: '', description: '' });
  };

  /** Remplit le formulaire avec les infos d'une bannière existante pour la modifier */
  const startEditBanner = (banner: AdBanner) => {
    setNewBanner({ 
      enabled: banner.enabled, imageUrl: banner.imageUrl || "", linkUrl: banner.linkUrl || "", 
      title: banner.title || "", description: banner.description || "" 
    });
    setEditingBannerId(banner.id);
    document.getElementById("banner-form")?.scrollIntoView({ behavior: "smooth" });
  };

  const cancelEditBanner = () => {
    setNewBanner({ enabled: true, imageUrl: '', linkUrl: '', title: '', description: '' });
    setEditingBannerId(null);
  };

  const removeBanner = (id: string) => {
    setConfig(prev => ({ ...prev, banners: prev.banners.filter(b => b.id !== id) }));
    if (editingBannerId === id) cancelEditBanner();
  };

  const toggleBannerVisibility = (id: string) => {
    setConfig(prev => ({
      ...prev, banners: prev.banners.map(b => b.id === id ? { ...b, enabled: !b.enabled } : b)
    }));
  };

  /** Change l'ordre des bannières (priorité d'affichage) */
  const moveBanner = (index: number, direction: 'up' | 'down') => {
    const newBanners = [...config.banners];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newBanners.length) return;
    [newBanners[index], newBanners[targetIndex]] = [newBanners[targetIndex], newBanners[index]];
    setConfig(prev => ({ ...prev, banners: newBanners }));
  };


  // --- GESTION DES PARTENAIRES ---

  /** Ajoute ou modifie un partenaire */
  const handleAddOrUpdatePartner = () => {
    if (!newPartner.name || !newPartner.url || !newPartner.category) {
      toast({ title: "Champs requis", description: "Nom, URL et Catégorie sont obligatoires.", variant: "destructive" });
      return;
    }
    if (editingPartnerId) {
      setConfig(prev => ({
        ...prev, partners: prev.partners.map(p => p.id === editingPartnerId ? { ...p, ...newPartner } : p)
      }));
      setEditingPartnerId(null);
    } else {
      setConfig(prev => ({ ...prev, partners: [...prev.partners, { id: Date.now().toString(), ...newPartner }] }));
    }
    setNewPartner({ name: "", url: "", category: "", enabled: true });
  };

  const startEditPartner = (p: Partner) => {
    setNewPartner({ name: p.name, url: p.url, category: p.category, enabled: p.enabled });
    setEditingPartnerId(p.id);
  };

  const removePartner = (id: string) => {
    setConfig(prev => ({ ...prev, partners: prev.partners.filter(p => p.id !== id) }));
    if (editingPartnerId === id) {
      setNewPartner({ name: "", url: "", category: "", enabled: true });
      setEditingPartnerId(null);
    }
  };

  const togglePartnerVisibility = (id: string) => setConfig(prev => ({ ...prev, partners: prev.partners.map(p => p.id === id ? { ...p, enabled: !p.enabled } : p) }));
  
  const movePartner = (index: number, direction: 'up' | 'down') => {
    const newP = [...config.partners];
    const tIdx = direction === 'up' ? index - 1 : index + 1;
    if (tIdx < 0 || tIdx >= newP.length) return;
    [newP[index], newP[tIdx]] = [newP[tIdx], newP[index]];
    setConfig(prev => ({ ...prev, partners: newP }));
  };


  if (loading) return <div className="flex justify-center p-20"><Loader2 className="animate-spin text-primary" size={40} /></div>;

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20 animate-in fade-in duration-500">
      
      {/* --- FORMULAIRE BANNIÈRES --- */}
      <div id="banner-form" className="glass-card p-6 bg-white shadow-lg dark:bg-card scroll-mt-20">
        <div className="flex items-center gap-3 border-b border-border pb-4 mb-6">
          <Megaphone className="text-primary" size={24} />
          <h3 className="text-xl font-display uppercase tracking-widest text-foreground">Carrousel Publicitaire (Annonces)</h3>
        </div>

        <div className="space-y-6 mb-10">
          <div className="grid md:grid-cols-2 gap-6 bg-muted/20 p-5 rounded-xl border border-primary/10">
            <div className="col-span-full flex items-center justify-between mb-2">
               <span className="font-bold text-sm text-primary uppercase tracking-tighter">
                 {editingBannerId ? "Modifier l'annonce sélectionnée" : "Créer une nouvelle annonce"}
               </span>
               {editingBannerId && (
                 <button onClick={cancelEditBanner} className="text-xs text-muted-foreground hover:underline font-bold uppercase">Annuler l'édition</button>
               )}
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs text-muted-foreground block mb-1 font-bold">Nom de l'Annonceur (ou Titre)</label>
                <input 
                  type="text" value={newBanner.title} 
                  onChange={(e) => setNewBanner(prev => ({...prev, title: e.target.value}))}
                  placeholder="Ex: ORANGE CAMEROUN"
                  className="w-full bg-background border border-border rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-primary/50"
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground block mb-1 font-bold">Slogan / Description courte</label>
                <textarea 
                  value={newBanner.description} 
                  onChange={(e) => setNewBanner(prev => ({...prev, description: e.target.value}))}
                  rows={2} placeholder="Slogan publicitaire..."
                  className="w-full bg-background border border-border rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-primary/50 resize-none"
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground block mb-1 font-bold">Lien de redirection (URL)</label>
                <input 
                  type="url" value={newBanner.linkUrl} 
                  onChange={(e) => setNewBanner(prev => ({...prev, linkUrl: e.target.value}))}
                  placeholder="https://www.orange.cm"
                  className="w-full bg-background border border-border rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-primary/50"
                />
              </div>
            </div>

            {/* Zone d'image de la bannière */}
            <div className="space-y-2 flex flex-col">
              <label className="text-xs text-muted-foreground block font-bold">Image Publicitaire (Recommandé : 1200x400 px)</label>
              {newBanner.imageUrl ? (
                <div className="relative rounded-xl border border-border overflow-hidden group aspect-[21/9] flex-1 shadow-inner">
                  <img src={newBanner.imageUrl} alt="Aperçu" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity gap-2">
                    <button 
                      onClick={() => setNewBanner(prev => ({...prev, imageUrl: ''}))}
                      className="bg-destructive px-4 py-2 flex items-center gap-2 rounded-lg text-white text-xs font-bold shadow-lg"
                    >
                      <Trash2 size={14} /> Supprimer l'image
                    </button>
                  </div>
                </div>
              ) : (
                <div className="relative border-2 border-dashed border-border/50 rounded-xl hover:border-primary/50 transition-all flex flex-col items-center justify-center bg-muted/5 flex-1 p-4 aspect-[21/9]">
                  <input type="file" accept="image/*" onChange={handleBannerFileUpload} disabled={uploading} className="absolute inset-0 opacity-0 cursor-pointer" />
                  {uploading ? <Loader2 className="animate-spin text-primary" size={24} /> : (
                    <div className="text-center">
                      <ImageIcon className="mx-auto text-muted-foreground mb-2" size={24} />
                      <span className="text-[10px] text-muted-foreground font-bold uppercase block">Cliquer pour uploader</span>
                      <span className="text-[9px] text-muted-foreground/60 block mt-1">Format paysage uniquement</span>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="col-span-full pt-4">
               <button 
                 onClick={handleAddOrUpdateBanner}
                 className="w-full btn-primary-glow py-3 rounded-lg font-bold flex justify-center gap-2 items-center"
               >
                 {editingBannerId ? <Check size={18}/> : <Plus size={18}/>}
                 {editingBannerId ? "Valider la modification" : "Ajouter au carrousel"}
               </button>
            </div>
          </div>
        </div>

        {/* --- LISTE DES ANNONCES --- */}
        <div>
          <h4 className="text-xs font-bold uppercase text-muted-foreground mb-3 flex items-center gap-2 tracking-widest">
            Ordre d'affichage dans le carrousel ({config.banners.length})
          </h4>
          <div className="space-y-3">
             {config.banners.map((banner, index) => (
               <div key={banner.id} className={`flex gap-4 p-4 border border-border rounded-xl bg-background items-center hover:border-primary/20 transition-all ${!banner.enabled ? 'opacity-40 grayscale' : 'shadow-sm'}`}>
                  {/* Flèches pour l'ordre */}
                  <div className="flex flex-col gap-1 items-center">
                      <button onClick={() => moveBanner(index, 'up')} disabled={index === 0} className="p-1 hover:text-primary disabled:opacity-0 transition-colors"><ArrowUp size={14} /></button>
                      <span className="text-[10px] font-bold text-primary">{index + 1}</span>
                      <button onClick={() => moveBanner(index, 'down')} disabled={index === config.banners.length - 1} className="p-1 hover:text-primary disabled:opacity-0 transition-colors"><ArrowDown size={14} /></button>
                  </div>
                  
                  {/* Miniature */}
                  <div className="w-24 h-12 bg-muted rounded overflow-hidden shadow-inner flex shrink-0 items-center justify-center text-[10px] text-muted-foreground font-bold border border-border">
                     {banner.imageUrl ? <img src={banner.imageUrl} alt="" className="w-full h-full object-cover" /> : "SANS IMAGE"}
                  </div>

                  {/* Infos */}
                  <div className="flex-1 min-w-0">
                     <p className="font-bold text-sm truncate uppercase tracking-tighter">{banner.title || "ANNONCE SANS NOM"}</p>
                     <p className="text-[10px] text-muted-foreground truncate">{banner.linkUrl || "Pas de redirection"} • {banner.description}</p>
                  </div>

                  {/* Actions rapides */}
                  <div className="flex items-center gap-1 shrink-0">
                    <button onClick={() => toggleBannerVisibility(banner.id)} className={`p-2 rounded-lg transition-colors ${banner.enabled ? "text-primary bg-primary/10" : "text-muted-foreground bg-muted"}`} title={banner.enabled ? "Masquer" : "Afficher"}>
                      {banner.enabled ? <Eye size={16} /> : <EyeOff size={16} />}
                    </button>
                    <button onClick={() => startEditBanner(banner)} className="p-2 text-muted-foreground hover:bg-primary/10 hover:text-primary rounded-lg transition-colors">
                      <Edit2 size={16} />
                    </button>
                    <button onClick={() => removeBanner(banner.id)} className="p-2 text-muted-foreground hover:bg-destructive/10 hover:text-destructive rounded-lg transition-colors">
                      <Trash2 size={16} />
                    </button>
                  </div>
               </div>
             ))}
          </div>
        </div>
      </div>


      {/* --- SECTION PARTENAIRES --- */}
      <div id="partner-form" className="glass-card p-6 bg-white shadow-lg dark:bg-card scroll-mt-20">
        <div className="flex items-center gap-3 border-b border-border pb-4 mb-6">
          <Star className="text-secondary" size={24} />
          <h3 className="text-xl font-display uppercase tracking-widest text-foreground">Partenaires & Affiliés</h3>
        </div>

        <div className="space-y-6">
          {/* Options de visibilité globale */}
          <div className="flex items-center gap-4 p-4 border border-border rounded-xl bg-secondary/5 border-secondary/20">
            <label className="flex items-center gap-3 cursor-pointer select-none">
              <input 
                type="checkbox" 
                checked={config.showCta} 
                onChange={(e) => setConfig(prev => ({ ...prev, showCta: e.target.checked }))}
                className="w-5 h-5 rounded border-secondary text-secondary focus:ring-secondary accent-secondary"
              />
              <span className="font-bold text-sm text-foreground uppercase tracking-tight">Afficher le bouton "Devenir Partenaire" pour les visiteurs</span>
            </label>
          </div>

          {/* Formulaire Partenaire */}
          <div className="grid md:grid-cols-3 gap-4 bg-muted/30 p-5 rounded-2xl border border-border/50">
            <div className="col-span-full mb-1 flex justify-between">
              <span className="text-xs font-bold uppercase tracking-widest text-secondary">{editingPartnerId ? "Modifier le partenaire" : "Ajouter un nouveau logo"}</span>
              {editingPartnerId && <button onClick={() => {setEditingPartnerId(null); setNewPartner({name:'',url:'',category:'',enabled:true})}} className="text-[10px] uppercase font-bold text-muted-foreground hover:text-foreground">Annuler</button>}
            </div>
            <div>
              <input type="text" value={newPartner.name} onChange={(e) => setNewPartner(prev => ({...prev, name: e.target.value}))} placeholder="Nom (Ex: Orange)" className="w-full bg-background border px-3 py-2 text-sm rounded-lg" />
            </div>
            <div>
              <input type="url" value={newPartner.url} onChange={(e) => setNewPartner(prev => ({...prev, url: e.target.value}))} placeholder="Lien (URL)" className="w-full bg-background border px-3 py-2 text-sm rounded-lg" />
            </div>
            <div className="flex gap-2">
              <input type="text" value={newPartner.category} onChange={(e) => setNewPartner(prev => ({...prev, category: e.target.value}))} placeholder="Catégorie" className="w-full bg-background border px-3 py-2 text-sm rounded-lg" />
              <button onClick={handleAddOrUpdatePartner} className="bg-secondary text-white px-4 rounded-lg hover:bg-secondary/90 shadow-md shadow-secondary/20 transition-all"><Plus size={20}/></button>
            </div>
          </div>

          {/* Liste des partenaires */}
          <div className="border border-border rounded-2xl overflow-hidden shadow-sm">
             <ul className="divide-y divide-border">
                {config.partners.map((partner, index) => (
                  <li key={partner.id} className={`flex items-center justify-between p-4 bg-background transition-all ${!partner.enabled ? "opacity-40 grayscale" : ""}`}>
                    <div className="flex items-center gap-4">
                      <div className="flex flex-col gap-1">
                        <button onClick={() => movePartner(index, 'up')} disabled={index === 0} className="p-1 hover:text-secondary disabled:opacity-0"><ArrowUp size={14} /></button>
                        <button onClick={() => movePartner(index, 'down')} disabled={index === config.partners.length - 1} className="p-1 hover:text-secondary disabled:opacity-0"><ArrowDown size={14} /></button>
                      </div>
                      <div>
                        <div className="flex items-center gap-3">
                          <span className="font-bold text-sm uppercase">{partner.name}</span>
                          <span className="text-[9px] bg-secondary/10 text-secondary border border-secondary/20 px-2 py-0.5 rounded-full uppercase font-bold tracking-tighter">{partner.category}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex gap-1">
                      <button onClick={() => togglePartnerVisibility(partner.id)} className={`p-2 rounded-lg transition-colors ${partner.enabled ? "text-primary" : "text-muted-foreground"}`}>
                        {partner.enabled ? <Eye size={18} /> : <EyeOff size={18} />}
                      </button>
                      <button onClick={() => startEditPartner(partner)} className="p-2 text-muted-foreground hover:text-secondary hover:bg-secondary/5 rounded-lg transition-colors"><Edit2 size={18} /></button>
                      <button onClick={() => removePartner(partner.id)} className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/5 rounded-lg transition-colors"><Trash2 size={18} /></button>
                    </div>
                  </li>
                ))}
            </ul>
          </div>
        </div>
      </div>

      {/* BOUTON SAUVEGARDE GÉNÉRALE (STICKY) */}
      <div className="sticky bottom-4 z-10 pt-4">
        <button 
          onClick={handleSave} disabled={saving}
          className="w-full shadow-2xl btn-primary-glow shadow-primary/30 py-4 rounded-xl font-bold uppercase tracking-widest flex items-center justify-center gap-3 disabled:opacity-50"
        >
          {saving ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
          {saving ? "Synchronisation..." : "Enregistrer la configuration Publicitaire"}
        </button>
      </div>
    </div>
  );
};

export default AdminAds;
