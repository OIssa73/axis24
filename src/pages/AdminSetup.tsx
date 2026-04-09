// Importation des outils de React pour gérer les données saisies
import { useState } from "react";
// Importation de la connexion à Supabase
import { supabase } from "@/integrations/supabase/client";
// Importation de Framer Motion pour les animations fluides
import { motion } from "framer-motion";
// Importation des icônes de sécurité, mail et cadenas
import { Shield, Mail, Lock, Loader2 } from "lucide-react";
// Importation de l'outil de notification (Toast)
import { useToast } from "@/hooks/use-toast";
// Importation de l'outil de navigation pour rediriger l'utilisateur
import { useNavigate } from "react-router-dom";

/**
 * Composant ADMIN SETUP (Configuration initiale).
 * Cette page permet de créer le TOUT PREMIER compte administrateur du site.
 * Elle utilise une "Edge Function" Supabase nommée 'create-admin' pour créer l'utilisateur avec les bons droits.
 */
const AdminSetup = () => {
  // --- ÉTATS ---
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false); // Pour savoir si la création est réussie
  const { toast } = useToast();
  const navigate = useNavigate();

  /**
   * Envoie les identifiants à la fonction de création d'admin.
   */
  const handleSetup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // 1. Appel de la fonction Cloud (Edge Function) 'create-admin'
      const { data, error } = await supabase.functions.invoke("create-admin", {
        body: { email, password },
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      // 2. Si tout est bon, on affiche un message de succès
      setDone(true);
      toast({ title: "Compte administrateur créé avec succès !" });
      
      // redirection vers la page de connexion après 2 secondes
      setTimeout(() => navigate("/admin/login"), 2000);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Une erreur est survenue lors de la création.";
      toast({ title: "Échec de la configuration", description: message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 overflow-hidden">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="glass-card p-10 w-full max-w-md bg-white/5 dark:bg-card/40 backdrop-blur-2xl border border-white/10 shadow-2xl"
      >
        <div className="text-center mb-10">
          {/* Icône de bouclier stylisée */}
          <div className="w-20 h-20 rounded-2xl bg-primary/20 flex items-center justify-center mx-auto mb-6 transform rotate-12 shadow-lg shadow-primary/10">
            <Shield size={40} className="text-primary -rotate-12" />
          </div>
          <h1 className="font-display text-4xl tracking-widest text-foreground font-bold uppercase">
            Initialisation
          </h1>
          <p className="text-muted-foreground text-xs mt-3 uppercase tracking-widest opacity-60">
            Création du compte maître
          </p>
        </div>

        {done ? (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }}
            className="text-center text-primary font-bold py-8 bg-primary/5 rounded-2xl border border-primary/20 animate-pulse"
          >
            ✓ ADMIN CONFIGURÉ <br /> Redirection en cours...
          </motion.div>
        ) : (
          <form onSubmit={handleSetup} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest block ml-1">Email de l'administrateur</label>
              <div className="relative group">
                <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-muted/30 border border-border rounded-xl pl-12 pr-4 py-4 text-foreground placeholder:text-muted-foreground/30 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:bg-background transition-all"
                  placeholder="ex: admin@axis24media.com"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest block ml-1">Mot de passe de sécurité</label>
              <div className="relative group">
                <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" />
                <input
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-muted/30 border border-border rounded-xl pl-12 pr-4 py-4 text-foreground placeholder:text-muted-foreground/30 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:bg-background transition-all"
                  placeholder="Choisissez un mot de passe robuste"
                />
              </div>
            </div>

            {/* Bouton de configuration */}
            <button
              type="submit"
              disabled={loading}
              className="btn-primary-glow w-full h-14 rounded-xl flex items-center justify-center gap-3 disabled:opacity-50 font-bold uppercase tracking-widest text-sm text-white shadow-xl shadow-primary/10"
            >
              {loading ? <Loader2 className="animate-spin" size={20} /> : null}
              {loading ? "Configuration..." : "Activer l'accès Administrateur"}
            </button>
          </form>
        )}
      </motion.div>
    </div>
  );
};

export default AdminSetup;
