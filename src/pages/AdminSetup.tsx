import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
import { Shield, Mail, Lock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

const AdminSetup = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSetup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke("create-admin", {
        body: { email, password },
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      setDone(true);
      toast({ title: "Compte admin créé !" });
      setTimeout(() => navigate("/admin/login"), 2000);
    } catch (err: any) {
      toast({ title: "Erreur", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-8 w-full max-w-md"
      >
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-4">
            <Shield size={32} className="text-primary" />
          </div>
          <h1 className="font-display text-3xl tracking-widest text-foreground">
            Configuration Admin
          </h1>
          <p className="text-muted-foreground text-sm mt-2">
            Créez le premier compte administrateur
          </p>
        </div>

        {done ? (
          <div className="text-center text-green-400 py-4">
            ✓ Admin créé ! Redirection vers la connexion...
          </div>
        ) : (
          <form onSubmit={handleSetup} className="space-y-5">
            <div>
              <label className="text-sm text-muted-foreground mb-1 block">Email admin</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-muted border border-border rounded-lg pl-10 pr-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                  placeholder="admin@axis24media.com"
                />
              </div>
            </div>
            <div>
              <label className="text-sm text-muted-foreground mb-1 block">Mot de passe</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-muted border border-border rounded-lg pl-10 pr-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                  placeholder="Minimum 6 caractères"
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="btn-primary-glow w-full flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? "Création..." : "Créer le compte admin"}
            </button>
          </form>
        )}
      </motion.div>
    </div>
  );
};

export default AdminSetup;
