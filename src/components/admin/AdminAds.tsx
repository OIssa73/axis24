import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Plus, Trash2, Loader2, Megaphone, Star, Save, Image as ImageIcon, Edit2, Eye, EyeOff, ArrowUp, ArrowDown, Check, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Partner {
  id: string;
  name: string;
  url: string;
  category: string;
  enabled: boolean;
}

interface AdsConfig {
  banner: {
    enabled: boolean;
    imageUrl: string;
    linkUrl: string;
    title: string;
    description: string;
  };
  partners: Partner[];
  showCta: boolean;
}

const defaultAdsConfig: AdsConfig = {
  banner: {
    enabled: true,
    imageUrl: "",
    linkUrl: "",
    title: "VOTRE PUBLICITÉ ICI",
    description: "Boostez votre visibilité avec notre audience régionale et internationale."
  },
  partners: [
    { id: "1", name: "CRTV News", url: "https://www.crtv.cm", category: "Partenaire TV", enabled: true },
    { id: "2", name: "Cameroon Tribune", url: "https://www.cameroon-tribune.cm", category: "Presse Écrite", enabled: true },
    { id: "3", name: "Orange Cameroun", url: "https://www.orange.cm", category: "Sponsor", enabled: true },
    { id: "4", name: "Camtel", url: "https://www.camtel.cm", category: "Sponsor Officiel", enabled: true },
  ],
  showCta: true
};

const AdminAds = () => {
  const [config, setConfig] = useState<AdsConfig>(defaultAdsConfig);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();

  const [newPartner, setNewPartner] = useState({ name: "", url: "", category: "", enabled: true });
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    const fetchConfig = async () => {
      const { data, error } = await supabase
        .from("site_settings")
        .select("value")
        .eq("key", "ads_config")
        .maybeSingle();

      if (data && data.value) {
        const val = data.value as unknown as AdsConfig;
        // Ensure properties exist for old data
        const partners = (val.partners || []).map(p => ({ ...p, enabled: p.enabled !== undefined ? p.enabled : true }));
        const showCta = val.showCta !== undefined ? val.showCta : true;
        setConfig({ ...val, partners, showCta });
      } else if (!error && !data) {
        setConfig(defaultAdsConfig);
      }
      setLoading(false);
    };
    fetchConfig();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    const { error } = await supabase
      .from("site_settings")
      .upsert({ key: "ads_config", value: config as any });

    if (error) {
      toast({ title: "Erreur", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Enregistré", description: "Les paramètres de publicité ont été mis à jour." });
    }
    setSaving(false);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    
    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const filePath = `ads/${Math.random()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("media")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from("media").getPublicUrl(filePath);
      
      setConfig(prev => ({
        ...prev,
        banner: { ...prev.banner, imageUrl: data.publicUrl }
      }));
      toast({ title: "Image ajoutée", description: "L'image a été téléchargée avec succès." });
    } catch (error: any) {
      toast({ title: "Erreur", description: error.message, variant: "destructive" });
    } finally {
      setUploading(false);
    }
  };

  const handleAddOrUpdatePartner = () => {
    if (!newPartner.name || !newPartner.url || !newPartner.category) {
      toast({ title: "Champs manquants", description: "Veuillez remplir tous les champs du partenaire.", variant: "destructive" });
      return;
    }

    if (editingId) {
      setConfig(prev => ({
        ...prev,
        partners: prev.partners.map(p => p.id === editingId ? { ...p, ...newPartner } : p)
      }));
      setEditingId(null);
      toast({ title: "Partenaire modifié", description: "Les modifications ont été appliquées." });
    } else {
      const partner: Partner = {
        id: Date.now().toString(),
        ...newPartner
      };
      setConfig(prev => ({ ...prev, partners: [...prev.partners, partner] }));
      toast({ title: "Partenaire ajouté", description: "Le nouveau partenaire a été ajouté à la liste." });
    }
    setNewPartner({ name: "", url: "", category: "", enabled: true });
  };

  const startEdit = (partner: Partner) => {
    setNewPartner({ name: partner.name, url: partner.url, category: partner.category, enabled: partner.enabled });
    setEditingId(partner.id);
    document.getElementById("partner-form")?.scrollIntoView({ behavior: "smooth" });
  };

  const cancelEdit = () => {
    setNewPartner({ name: "", url: "", category: "", enabled: true });
    setEditingId(null);
  };

  const togglePartnerVisibility = (id: string) => {
    setConfig(prev => ({
      ...prev,
      partners: prev.partners.map(p => p.id === id ? { ...p, enabled: !p.enabled } : p)
    }));
  };

  const movePartner = (index: number, direction: 'up' | 'down') => {
    const newPartners = [...config.partners];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    
    if (targetIndex < 0 || targetIndex >= newPartners.length) return;
    
    [newPartners[index], newPartners[targetIndex]] = [newPartners[targetIndex], newPartners[index]];
    setConfig(prev => ({ ...prev, partners: newPartners }));
  };

  const removePartner = (id: string) => {
    setConfig(prev => ({
      ...prev,
      partners: prev.partners.filter(p => p.id !== id)
    }));
    if (editingId === id) cancelEdit();
  };

  if (loading) return <div className="flex justify-center p-20"><Loader2 className="animate-spin text-primary" size={40} /></div>;

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20 animate-in fade-in duration-500">
      
      {/* SECTION BANNIERE */}
      <div className="glass-card p-6 bg-white shadow-lg dark:bg-card">
        <div className="flex items-center gap-3 border-b border-border pb-4 mb-6">
          <Megaphone className="text-primary" size={24} />
          <h3 className="text-xl font-display uppercase tracking-widest text-foreground">Espace Publicitaire (Bannière)</h3>
        </div>

        <div className="space-y-6">
          <div className="flex items-center gap-4 p-4 border border-border rounded-xl bg-muted/20">
            <label className="flex items-center gap-3 cursor-pointer select-none">
              <input 
                type="checkbox" 
                checked={config.banner.enabled} 
                onChange={(e) => setConfig(prev => ({ ...prev, banner: { ...prev.banner, enabled: e.target.checked } }))}
                className="w-5 h-5 rounded border-primary text-primary focus:ring-primary"
              />
              <span className="font-semibold text-foreground">Activer l'affichage de la bannière sur le site</span>
            </label>
          </div>

          <div className={`grid md:grid-cols-2 gap-6 transition-opacity ${!config.banner.enabled ? "opacity-50 pointer-events-none" : ""}`}>
            
            <div className="space-y-4">
              <div>
                <label className="text-xs text-muted-foreground block mb-1 font-bold uppercase tracking-tighter">Texte de secours (si pas d'image)</label>
                <input 
                  type="text" 
                  value={config.banner.title} 
                  onChange={(e) => setConfig(prev => ({ ...prev, banner: { ...prev.banner, title: e.target.value } }))}
                  placeholder="EX: VOTRE PUBLICITÉ ICI"
                  className="w-full bg-muted border border-border rounded-lg px-4 py-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>

              <div>
                <label className="text-xs text-muted-foreground block mb-1 font-bold uppercase tracking-tighter">Sous-texte de secours</label>
                <textarea 
                  value={config.banner.description} 
                  onChange={(e) => setConfig(prev => ({ ...prev, banner: { ...prev.banner, description: e.target.value } }))}
                  rows={2}
                  placeholder="Texte descriptif..."
                  className="w-full bg-muted border border-border rounded-lg px-4 py-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
                />
              </div>

              <div>
                <label className="text-xs text-muted-foreground block mb-1 font-bold uppercase tracking-tighter">Lien de redirection (Lien Publicitaire)</label>
                <input 
                  type="url" 
                  value={config.banner.linkUrl} 
                  onChange={(e) => setConfig(prev => ({ ...prev, banner: { ...prev.banner, linkUrl: e.target.value } }))}
                  placeholder="https://www.site-annonceur.com"
                  className="w-full bg-muted border border-border rounded-lg px-4 py-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs text-muted-foreground block font-bold uppercase tracking-tighter">Image de la Publicité</label>
              
              {config.banner.imageUrl ? (
                <div className="relative rounded-xl border border-border overflow-hidden bg-muted group mt-2 shadow-inner">
                  <img src={config.banner.imageUrl} alt="Banner" className="w-full aspect-[21/9] object-contain bg-black/10" />
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <button 
                      onClick={() => setConfig(prev => ({ ...prev, banner: { ...prev.banner, imageUrl: "" } }))}
                      className="px-4 py-2 bg-destructive text-white rounded-lg text-xs font-bold flex items-center gap-2 shadow-lg hover:scale-105 transition-transform"
                    >
                      <Trash2 size={16} /> Supprimer l'image
                    </button>
                  </div>
                </div>
              ) : (
                <div className="relative border-2 border-dashed border-border/50 rounded-xl p-8 hover:border-primary/50 transition-all group aspect-[21/9] flex flex-col items-center justify-center gap-3 mt-2 bg-muted/5">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="absolute inset-0 opacity-0 cursor-pointer z-10"
                    disabled={uploading}
                  />
                  {uploading ? (
                    <Loader2 className="animate-spin text-primary" size={32} />
                  ) : (
                    <>
                      <ImageIcon className="text-muted-foreground group-hover:text-primary transition-colors" size={32} />
                      <div className="text-center">
                        <span className="text-xs font-bold text-muted-foreground uppercase block group-hover:text-primary transition-colors">Cliquer pour uploader</span>
                        <span className="text-[10px] text-muted-foreground opacity-60">Format recommandé: 1200x400 (3:1)</span>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
            
          </div>
        </div>
      </div>


      {/* SECTION PARTENAIRES */}
      <div id="partner-form" className="glass-card p-6 bg-white shadow-lg dark:bg-card scroll-mt-20">
        <div className="flex items-center gap-3 border-b border-border pb-4 mb-6">
          <Star className="text-secondary" size={24} />
          <h3 className="text-xl font-display uppercase tracking-widest text-foreground">Gestion des Partenaires & Affiliés</h3>
        </div>

        <div className="space-y-6">
          <div className="flex items-center gap-4 p-4 border border-border rounded-xl bg-muted/20">
            <label className="flex items-center gap-3 cursor-pointer select-none">
              <input 
                type="checkbox" 
                checked={config.showCta} 
                onChange={(e) => setConfig(prev => ({ ...prev, showCta: e.target.checked }))}
                className="w-5 h-5 rounded border-secondary text-secondary focus:ring-secondary"
              />
              <span className="font-semibold text-foreground italic">Afficher le bouton "Devenir Partenaire" sur le site</span>
            </label>
          </div>

          <div className="grid md:grid-cols-3 gap-4 bg-muted/30 p-5 rounded-2xl border border-border/50 shadow-inner">
            <div className="col-span-full mb-1 flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-widest text-secondary">{editingId ? "Modification du partenaire" : "Ajouter un nouveau partenaire"}</span>
              {editingId && <button onClick={cancelEdit} className="text-[10px] uppercase font-bold text-muted-foreground hover:underline">Annuler l'édition</button>}
            </div>
            <div>
              <label className="text-[10px] text-muted-foreground block mb-1 font-bold uppercase tracking-tighter">Nom de la structure</label>
              <input 
                type="text" 
                value={newPartner.name} 
                onChange={(e) => setNewPartner(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Ex: Orange Cameroun"
                className="w-full bg-background border border-border rounded-lg px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-secondary/50"
              />
            </div>
            <div>
              <label className="text-[10px] text-muted-foreground block mb-1 font-bold uppercase tracking-tighter">Lien du site (Redirection)</label>
              <input 
                type="url" 
                value={newPartner.url} 
                onChange={(e) => setNewPartner(prev => ({ ...prev, url: e.target.value }))}
                placeholder="https://www.orange.cm"
                className="w-full bg-background border border-border rounded-lg px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-secondary/50"
              />
            </div>
            <div className="flex items-end gap-3">
              <div className="flex-1">
                <label className="text-[10px] text-muted-foreground block mb-1 font-bold uppercase tracking-tighter">Catégorie / Titre</label>
                <input 
                  type="text" 
                  value={newPartner.category} 
                  onChange={(e) => setNewPartner(prev => ({ ...prev, category: e.target.value }))}
                  placeholder="Ex: Sponsor Gold"
                  className="w-full bg-background border border-border rounded-lg px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-secondary/50"
                />
              </div>
              <button 
                onClick={handleAddOrUpdatePartner}
                className="bg-secondary text-white h-10 px-6 rounded-lg font-bold flex items-center justify-center shrink-0 hover:bg-secondary/90 transition-all hover:shadow-lg hover:shadow-secondary/20 active:scale-95"
                title={editingId ? "Appliquer les modifications" : "Ajouter à la liste"}
              >
                {editingId ? <Check size={20} /> : <Plus size={20} />}
              </button>
            </div>
          </div>

          <div className="border border-border rounded-2xl overflow-hidden bg-background shadow-sm">
            {config.partners.length === 0 ? (
               <div className="p-12 text-center text-muted-foreground italic flex flex-col items-center gap-3">
                 <Star size={40} className="opacity-10" />
                 <p className="uppercase tracking-widest text-xs font-semibold">Aucun partenaire dans la liste</p>
               </div>
            ) : (
              <ul className="divide-y divide-border">
                {config.partners.map((partner, index) => (
                  <li key={partner.id} className={`flex items-center justify-between p-4 hover:bg-muted/30 transition-colors ${!partner.enabled ? "opacity-50" : ""}`}>
                    <div className="flex items-center gap-4">
                      <div className="flex flex-col gap-1">
                        <button 
                          onClick={() => movePartner(index, 'up')} 
                          disabled={index === 0}
                          className="p-1 hover:text-primary disabled:opacity-0 transition-colors"
                        >
                          <ArrowUp size={14} />
                        </button>
                        <button 
                          onClick={() => movePartner(index, 'down')} 
                          disabled={index === config.partners.length - 1}
                          className="p-1 hover:text-primary disabled:opacity-0 transition-colors"
                        >
                          <ArrowDown size={14} />
                        </button>
                      </div>
                      <div>
                        <div className="flex items-center gap-3">
                          <span className="font-bold text-foreground text-sm tracking-wide">{partner.name}</span>
                          <span className="text-[9px] bg-secondary/10 text-secondary border border-secondary/20 px-2 py-0.5 rounded-full font-bold uppercase tracking-widest whitespace-nowrap">
                            {partner.category}
                          </span>
                        </div>
                        <a href={partner.url} target="_blank" rel="noreferrer" className="text-[11px] text-muted-foreground hover:text-primary transition-colors hover:underline line-clamp-1 mt-0.5 opacity-60">
                          {partner.url}
                        </a>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-1">
                      <button 
                        onClick={() => togglePartnerVisibility(partner.id)}
                        className={`p-2 rounded-lg transition-colors ${partner.enabled ? "text-primary hover:bg-primary/10" : "text-muted-foreground hover:bg-muted"}`}
                        title={partner.enabled ? "Masquer du site public" : "Afficher sur le site"}
                      >
                        {partner.enabled ? <Eye size={18} /> : <EyeOff size={18} />}
                      </button>
                      <button 
                        onClick={() => startEdit(partner)}
                        className="p-2 text-muted-foreground hover:text-secondary hover:bg-secondary/10 rounded-lg transition-colors"
                        title="Modifier"
                      >
                        <Edit2 size={18} />
                      </button>
                      <button 
                        onClick={() => removePartner(partner.id)}
                        className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                        title="Supprimer"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>

      <div className="sticky bottom-4 z-10 pt-4">
        <button 
          onClick={handleSave} 
          disabled={saving}
          className="w-full shadow-2xl btn-primary-glow shadow-primary/30 py-4 rounded-xl font-bold uppercase tracking-widest flex items-center justify-center gap-3 disabled:opacity-50"
        >
          {saving ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
          Enregistrer Toutes les Modifications Publicitaires
        </button>
      </div>

    </div>
  );
};

export default AdminAds;
