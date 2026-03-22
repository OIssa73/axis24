import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { LayoutDashboard, Upload, FolderOpen, BarChart3, LogOut, Menu, X, Users, Settings } from "lucide-react";
import useAdminAuth from "@/hooks/useAdminAuth";
import AdminStats from "@/components/admin/AdminStats";
import AdminContent from "@/components/admin/AdminContent";
import AdminCategories from "@/components/admin/AdminCategories";
import AdminUpload from "@/components/admin/AdminUpload";
import AdminJournalists from "@/components/admin/AdminJournalists";
import AdminSettings from "@/components/admin/AdminSettings";

const tabs = [
  { id: "stats", label: "Tableau de bord", icon: LayoutDashboard },
  { id: "content", label: "Contenus", icon: BarChart3 },
  { id: "upload", label: "Uploader", icon: Upload },
  { id: "categories", label: "Catégories", icon: FolderOpen },
  { id: "journalists", label: "Journalistes", icon: Users },
];

const AdminDashboard = () => {
  const { isAdmin } = useAdminAuth();
  const [activeTab, setActiveTab] = useState("stats");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/admin/login");
  };

  if (isAdmin === null) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-muted-foreground">Chargement...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-card border-r border-border transform transition-transform duration-200 lg:relative lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="p-6 border-b border-border">
          <Link to="/" className="font-display text-2xl tracking-widest text-foreground">
            AXIS<span className="text-primary">24</span>
          </Link>
          <p className="text-xs text-muted-foreground mt-1">Administration</p>
        </div>

        <nav className="p-4 space-y-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                setSidebarOpen(false);
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

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-background/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col min-h-screen">
        <header className="h-14 border-b border-border flex items-center px-4 gap-4">
          <button
            className="lg:hidden text-foreground"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
          <h2 className="font-display text-xl tracking-wider text-foreground">
            {tabs.find((t) => t.id === activeTab)?.label}
          </h2>
        </header>

        <main className="flex-1 p-4 md:p-6 overflow-auto">
          {activeTab === "stats" && <AdminStats />}
          {activeTab === "content" && <AdminContent />}
          {activeTab === "upload" && <AdminUpload />}
          {activeTab === "categories" && <AdminCategories />}
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;
