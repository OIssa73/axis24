// Importation des outils de React pour gérer les formulaires
import { useState } from "react";
// Importation de l'outil de navigation pour rediriger l'utilisateur après connexion
import { useNavigate } from "react-router-dom";
// Importation de la connexion à Supabase (système d'authentification)
import { supabase } from "@/integrations/supabase/client";
// Importation de Framer Motion pour les animations fluides à l'ouverture de la page
import { motion } from "framer-motion";
// Importation des icônes de cadenas et de mail
import { Lock, Mail, Loader2 } from "lucide-react";
// Importation de l'outil de notification (Toast)
import { useToast } from "@/hooks/use-toast";

/**
 * Composant ADMIN LOGIN (Page de connexion).
 * Sécurise l'accès à l'interface de gestion en vérifiant l'email, le mot de passe et le rôle "admin".
 */
const AdminLogin = () => {
  // --- ÉTATS ---
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false); // Mode "chargement" pour le bouton
  const navigate = useNavigate();
  const { toast } = useToast();

  /**
   * Gère la soumission du formulaire de connexion.
   */
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // 1. Tentative de connexion avec l'email et le mot de passe via Supabase Auth
      const { error: authError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (authError) throw authError;

      // 2. Récupération des informations de l'utilisateur qui vient de se connecter
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Utilisateur introuvable après connexion.");

      // 3. Vérification du rôle : On s'assure que cet utilisateur possède bien le rôle "admin"
      // Note : La fonction RPC "has_role" est définie dans la base de données Supabase.
      const { data: hasAdminRole, error: roleError } = await supabase.rpc("has_role", {
        _user_id: user.id,
        _role: "admin",
      });

      if (roleError) {
        await supabase.auth.signOut(); // On le déconnecte par sécurité en cas d'erreur de vérification
        throw new Error("Impossible de vérifier vos droits d'accès.");
      }

      if (!hasAdminRole) {
        await supabase.auth.signOut(); // Déconnexion immédiate s'il n'est pas admin
        throw new Error("Accès refusé : Vous n'avez pas les droits d'administrateur.");
      }

      // Tout est OK : On redirige vers le tableau de bord
      toast({ title: "Connexion réussie", description: "Bienvenue sur l'interface Axis24." });
      navigate("/admin");

    } catch (err: any) {
      // Affichage de l'erreur dans une notification rouge
      toast({ 
        title: "Échec de connexion", 
        description: err.message || "Identifiants incorrects.", 
        variant: "destructive" 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 overflow-hidden">
      {/* Animation d'apparition en fondu et léger glissement vers le haut */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="glass-card p-10 w-full max-w-md bg-white/10 dark:bg-card/50 backdrop-blur-xl border border-white/20 shadow-2xl"
      >
        <div className="text-center mb-10">
          <h1 className="font-display text-5xl tracking-widest text-foreground font-bold">
            AXIS<span className="text-primary">24</span>
          </h1>
          <p className="text-muted-foreground text-xs uppercase tracking-[0.3em] mt-3 font-medium opacity-70">
            Espace Sécurisé Administration
          </p>
        </div>

        {/* Formulaire */}
        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest block ml-1">Email professionnel</label>
            <div className="relative group">
              <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-muted/50 border border-border rounded-xl pl-12 pr-4 py-4 text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:bg-background transition-all"
                placeholder="nom@axis24media.com"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest block ml-1">Mot de passe</label>
            <div className="relative group">
              <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-muted/50 border border-border rounded-xl pl-12 pr-4 py-4 text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:bg-background transition-all"
                placeholder="••••••••"
              />
            </div>
          </div>

          {/* Bouton de validation */}
          <button
            type="submit"
            disabled={loading}
            className="btn-primary-glow w-full h-14 rounded-xl flex items-center justify-center gap-3 disabled:opacity-50 font-bold uppercase tracking-[0.2em] text-sm text-white shadow-lg"
          >
            {loading ? <Loader2 className="animate-spin" size={20} /> : null}
            {loading ? "Connexion..." : "Ouvrir la session"}
          </button>
        </form>

        {/* Lien de retour au site public */}
        <div className="mt-8 text-center">
          <button 
            onClick={() => navigate("/")}
            className="text-[10px] uppercase font-bold text-muted-foreground hover:text-primary tracking-widest transition-colors"
          >
            ← Retourner sur le média
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default AdminLogin;
