// --- Importations des bibliothèques externes ---
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"; // Gestionnaire de données (cache)
import { BrowserRouter, Route, Routes } from "react-router-dom"; // Système de navigation par URLs
import { Toaster as Sonner } from "@/components/ui/sonner"; // Petites bulles de notification (variante 1)
import { Toaster } from "@/components/ui/toaster"; // Petites bulles de notification (variante 2)
import { TooltipProvider } from "@/components/ui/tooltip"; // Gestion des bulles d'aide au survol
import { LanguageProvider } from "@/context/LanguageContext"; // Fournisseur de langue (FR/EN)
import { ThemeProvider } from "@/components/theme-provider"; // Fournisseur de thème (Clair/Sombre)

// --- Importations des Pages du site ---
import Index from "./pages/Index.tsx"; // Page d'accueil
import Radio from "./pages/Radio.tsx"; // Page de la radio en direct
import Television from "./pages/Television.tsx"; // Page de la télévision
import Actualites from "./pages/Actualites.tsx"; // Page de toutes les actualités
import InfoImages from "./pages/InfoImages.tsx"; // Page "Infos en images" (galerie)
import Contact from "./pages/Contact.tsx"; // Page de contact
import AdminLogin from "./pages/AdminLogin.tsx"; // Page de connexion admin
import AdminDashboard from "./pages/AdminDashboard.tsx"; // Tableau de bord administratif
import AdminSetup from "./pages/AdminSetup.tsx"; // Page de configuration initiale de l'admin
import ContentDetail from "./pages/ContentDetail.tsx"; // Page de lecture d'un article ou contenu précis
import NotFound from "./pages/NotFound.tsx"; // Page d'erreur 404 (si l'adresse n'existe pas)
import Sports from "./pages/Sports.tsx"; // Page dédiée aux sports
import Jobs from "./pages/Jobs.tsx"; // Page dédiée aux offres d'emploi
import About from "./pages/About.tsx"; // Page À Propos fusionnée

// Création du client de requête (pour garder les données en mémoire et éviter de recharger inutilement)
const queryClient = new QueryClient();

/**
 * Composant principal de l'application (le "cerveau" de la navigation).
 * Il enveloppe le site dans plusieurs "couches" (Providers) qui gèrent 
 * la langue, le thème sombre, les notifications et les données.
 */
const App = () => (
  <QueryClientProvider client={queryClient}>
    <LanguageProvider>
      <ThemeProvider defaultTheme="dark" storageKey="axis-theme">
        <TooltipProvider>
          {/* Composants d'affichage des notifications flash */}
          <Toaster />
          <Sonner />
          
          {/* Configuration du routeur pour gérer les adresses (URLs) du site */}
          <BrowserRouter>
            <Routes>
              {/* Chaque "Route" fait le lien entre une adresse et une page précise */}
              <Route path="/" element={<Index />} />
              <Route path="/radio" element={<Radio />} />
              <Route path="/television" element={<Television />} />
              <Route path="/actualites" element={<Actualites />} />
              <Route path="/infos-en-images" element={<InfoImages />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/content/:id" element={<ContentDetail />} />
              <Route path="/admin/login" element={<AdminLogin />} />
              <Route path="/admin/setup" element={<AdminSetup />} />
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/sports" element={<Sports />} />
              <Route path="/jobs" element={<Jobs />} />
              <Route path="/about" element={<About />} />
              
              {/* "*" capture toutes les adresses inconnues pour afficher la page 404 */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </ThemeProvider>
    </LanguageProvider>
  </QueryClientProvider>
);

export default App;
