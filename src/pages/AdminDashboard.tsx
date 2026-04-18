// Importation des outils de React pour gérer l'affichage et les effets
import { useState, useEffect } from "react";
// Importation de la connexion à la base de données
import { supabase } from "@/integrations/supabase/client";
// Importation des outils de navigation
import { useNavigate, Link, useLocation } from "react-router-dom";
// Importation des icônes pour le menu latéral (Sidebar)
import { LayoutDashboard, Upload, FolderOpen, BarChart3, LogOut, Menu, X, Users, Settings, Megaphone, Sun, Moon } from "lucide-react";
// Importation du crochet personnalisé pour vérifier si l'utilisateur est bien admin
import useAdminAuth from "@/hooks/useAdminAuth";
// Importation des différents modules de l'administration
import AdminStats from "@/components/admin/AdminStats";
import AdminContent from "@/components/admin/AdminContent";
import AdminCategories from "@/components/admin/AdminCategories";
import AdminUpload from "@/components/admin/AdminUpload";
import AdminJournalists from "@/components/admin/AdminJournalists";
import AdminSettings from "@/components/admin/AdminSettings";
import AdminAds from "@/components/admin/AdminAds";
import AdminAbout from "@/components/admin/AdminAbout"; // Nouveau composant
import AdminWatermark from "@/components/admin/AdminWatermark";
import LanguageSwitcher from "@/components/LanguageSwitcher";

// Définition des onglets disponibles dans le menu de gauche
const tabs = [
  { id: "stats", label: "Tableau de bord", icon: LayoutDashboard },
  { id: "content", label: "Contenus", icon: BarChart3 },
  { id: "upload", label: "Uploader", icon: Upload },
  { id: "categories", label: "Catégories", icon: FolderOpen },
  { id: "journalists", label: "Journalistes", icon: Users },
  { id: "about", label: "À Propos", icon: Users }, // Nouvel onglet (On réutilise l'icône Users ou une autre si dispo, ou Info)
  { id: "ads", label: "Publicités", icon: Megaphone },
  { id: "watermark", label: "Filigrane", icon: Settings },
  { id: "settings", label: "Paramètres", icon: Settings },
];

/**
 * Composant ADMIN DASHBOARD (Tableau de bord d'administration).
 * C'est le centre de contrôle pour gérer tout le site Axis24.
 */
const AdminDashboard = () => {
  // Vérification de l'identité de l'administrateur
  const { isAdmin } = useAdminAuth();
  // État pour savoir quel onglet est actuellement affiché
  const [activeTab, setActiveTab] = useState("stats");
  // État pour l'ouverture du menu sur mobile
  const [sidebarOpen, setSidebarOpen] = useState(false);
  // État pour le mode sombre/clair
  const [isDark, setIsDark] = useState(() => document.documentElement.classList.contains('dark'));
  const navigate = useNavigate();

  // Fonction pour se déconnecter proprement
  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/admin/login"); // Redirection vers la page de connexion
  };

  // Si on est encore en train de vérifier si l'utilisateur est admin
  if (isAdmin === null) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-muted-foreground">Chargement de l'interface...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex">
      
      {/* --- MENU LATÉRAL (SIDEBAR) --- */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-card border-r border-border transform transition-transform duration-200 lg:relative lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Titre de l'administration */}
        <div className="p-6 border-b border-border">
          <Link to="/" className="font-display text-2xl tracking-widest text-foreground">
            AXIS<span className="text-primary">24</span>
          </Link>
          <p className="text-xs text-muted-foreground mt-1">AXIS24 ADMIN PANEL</p>
        </div>

        {/* Liste des onglets de navigation */}
        <nav className="p-4 space-y-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id); // On change de module
                setSidebarOpen(false); // On ferme le menu si on est sur mobile
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm transition-colors ${
                activeTab === tab.id
                  ? "bg-primary/10 text-primary font-medium"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              }`}
            >
              <tab.icon size={18} />
              {tab.label}
            </button>
          ))}
        </nav>

        {/* Bouton de déconnexion en bas du menu */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-border">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
          >
            <LogOut size={18} />
            Déconnexion
          </button>
        </div>
      </aside>

      {/* Voile sombre pour fermer le menu mobile en cliquant à côté */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-background/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* --- ZONE DE CONTENU PRINCIPAL --- */}
      <div className="flex-1 flex flex-col min-h-screen">
        
        {/* Barre du haut (En-tête) */}
        <header className="h-14 border-b border-border flex items-center px-4 gap-4 justify-between bg-card text-foreground">
          <div className="flex items-center gap-4">
            {/* Bouton pour ouvrir le menu sur mobile */}
            <button
              className="lg:hidden text-foreground"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
            <h2 className="font-display text-xl tracking-wider uppercase">
              {tabs.find((t) => t.id === activeTab)?.label}
            </h2>
          </div>
          
          {/* Options de thème et de langue */}
          <div className="flex items-center gap-3">
             <button 
               onClick={() => {
                 setIsDark(!isDark);
                 document.documentElement.classList.toggle('dark');
               }} 
               className="p-2 rounded-full border border-border bg-background hover:bg-muted transition-colors text-foreground"
             >
               {isDark ? <Sun size={16} /> : <Moon size={16} />}
             </button>
             <LanguageSwitcher />
          </div>
        </header>

        {/* Espace où s'affiche le module sélectionné */}
        <main className="flex-1 p-4 md:p-6 overflow-auto bg-muted/20">
          {/* On n'affiche qu'un seul module à la fois selon l'onglet actif */}
          {activeTab === "stats" && <AdminStats />}
          {activeTab === "content" && <AdminContent />}
          {activeTab === "upload" && <AdminUpload />}
          {activeTab === "categories" && <AdminCategories />}
          {activeTab === "journalists" && <AdminJournalists />}
          {activeTab === "about" && <AdminAbout />}
          {activeTab === "ads" && <AdminAds />}
          {activeTab === "watermark" && <AdminWatermark />}
          {activeTab === "settings" && <AdminSettings />}
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;
