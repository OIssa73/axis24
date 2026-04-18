// Importation des outils de React et React-Router
import { useState } from "react";
// Importation des icônes utilisées pour le menu (Radio, TV, Emploi, etc.)
import { Radio, Tv, Newspaper, Phone, Menu, X, Images, LayoutDashboard, ChevronDown, Trophy, Briefcase, Info } from "lucide-react";
// Importation des outils d'animation pour l'ouverture fluide du menu mobile
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
// Importation des composants pour changer la langue et le thème
import LanguageSwitcher from "./LanguageSwitcher";
import { ThemeToggle } from "./ThemeToggle";
import { useLanguage } from "@/context/LanguageContext";
import { useLiveRadio } from "@/context/LiveRadioContext";
import { Loader2, Square } from "lucide-react";

/**
 * Composant NAVBAR (Barre de navigation).
 * C'est le menu qui reste fixé en haut de l'écran.
 */
const Navbar = () => {
  // État local pour savoir si le menu mobile est ouvert ou fermé
  const [open, setOpen] = useState(false);
  const { t, language } = useLanguage(); // Utilisation de l'outil de traduction
  const { isPlaying, isLoading, togglePlay } = useLiveRadio(); // Moteur radio global

  // Liste des liens de navigation principaux pour ordinateur
  const navItems = [
    { label: t("accueil"), href: "/" },
    { label: t("radio"), href: "/radio", icon: Radio },
    { label: t("television"), href: "/television", icon: Tv },
    { label: t("actualites"), href: "/actualites", icon: Newspaper },
    { label: t("contact"), href: "/contact", icon: Phone },
  ];

  // Liste des liens secondaires (accessibles via le menu déroulant "Plus")
  const moreItems = [
    { label: t("images"), href: "/infos-en-images", icon: Images },
    { label: t("sports"), href: "/sports", icon: Trophy },
    { label: t("emploi") || "Jobs", href: "/jobs", icon: Briefcase },
    { label: "À Propos", href: "/about", icon: Info },
    { label: "Admin", href: "/admin", icon: LayoutDashboard },
  ];
  
  // Sur mobile, on combine toutes les catégories en une seule liste
  const allMobileItems = [...navItems, ...moreItems];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border/50">
      <div className="container mx-auto flex items-center justify-between h-16 px-4">
        {/* Logo de l'application (cliquable pour revenir à l'accueil) */}
        <Link to="/" className="flex items-center gap-2">
          <span className="font-display text-2xl tracking-widest text-foreground">
            AXIS<span className="text-primary">24</span>
          </span>
          <span className="hidden sm:block text-xs text-muted-foreground uppercase tracking-widest">
            Media Groupe
          </span>
        </Link>

        {/* --- AFFICHAGE ORDINATEUR (Caché sur petit écran) --- */}
        <ul className="hidden md:flex items-center gap-6">
          {navItems.map((item) => (
            <li key={item.label}>
              <Link
                to={item.href}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1.5 font-medium uppercase tracking-wider"
              >
                {item.label}
              </Link>
            </li>
          ))}
          {/* Menu déroulant spécial pour la catégorie "Plus" */}
          <li className="relative group">
            <button className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1.5 font-medium uppercase tracking-wider">
              {t("plus") || "Plus"} <ChevronDown size={14} />
            </button>
            <div className="absolute top-1/2 mt-4 left-1/2 -translate-x-1/2 w-48 rounded-xl bg-background/95 backdrop-blur-xl border border-border/50 shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all flex flex-col py-2">
              {moreItems.map(item => (
                <Link key={item.label} to={item.href} className="px-4 py-2.5 text-xs font-bold uppercase tracking-widest flex items-center gap-3 hover:bg-muted/50 text-muted-foreground hover:text-foreground transition-colors">
                  <item.icon size={16} className="text-primary" /> {item.label}
                </Link>
              ))}
            </div>
          </li>
        </ul>

        {/* --- ACTIONS SECONDAIRES (Thème, Langue, Direct) --- */}
        <div className="hidden md:flex items-center gap-3 text-foreground">
          <ThemeToggle />
          <LanguageSwitcher />
          
          <button 
            onClick={togglePlay}
            className={`text-xs px-4 py-2 flex items-center gap-2 rounded-lg font-bold ml-2 transition-all ${
              isPlaying 
                ? "bg-green-600 hover:bg-green-700 text-white shadow-lg shadow-green-600/30 ring-2 ring-green-400/50" 
                : "btn-primary-glow"
            }`}
          >
            {isLoading ? (
              <Loader2 size={12} className="animate-spin text-white" />
            ) : isPlaying ? (
              <div className="flex items-end gap-[2px] h-3 mr-1">
                <div className="w-[3px] bg-white animate-wave rounded-t-sm" style={{ height: "100%", animationDelay: "0ms" }}></div>
                <div className="w-[3px] bg-white animate-wave rounded-t-sm" style={{ height: "100%", animationDelay: "200ms" }}></div>
                <div className="w-[3px] bg-white animate-wave rounded-t-sm" style={{ height: "100%", animationDelay: "400ms" }}></div>
                <div className="w-[3px] bg-white animate-wave rounded-t-sm" style={{ height: "100%", animationDelay: "150ms" }}></div>
              </div>
            ) : (
              <span className="w-2 h-2 rounded-full bg-primary-foreground animate-pulse" />
            )}
            <span className="pointer-events-none">
              {isLoading ? "CHARGEMENT..." : isPlaying ? `STOP RFI (${language.toUpperCase()})` : t("direct")}
            </span>
          </button>
        </div>

        {/* --- CONTROLES MOBILE (Cachés sur ordinateur) --- */}
        <div className="md:hidden flex items-center gap-2">
          <ThemeToggle />
          <LanguageSwitcher />
          
          <button 
            onClick={togglePlay}
            className={`text-[10px] px-2 py-1.5 flex items-center gap-1.5 rounded-md font-bold transition-all ${
              isPlaying 
                ? "bg-green-600 text-white" 
                : "bg-destructive text-white"
            }`}
          >
            {isLoading ? (
              <Loader2 size={10} className="animate-spin text-white" />
            ) : isPlaying ? (
              <div className="flex items-end gap-[1px] h-2.5 mr-0.5">
                <div className="w-0.5 bg-white animate-wave rounded-t-[1px]" style={{ height: "100%", animationDelay: "0ms" }}></div>
                <div className="w-0.5 bg-white animate-wave rounded-t-[1px]" style={{ height: "100%", animationDelay: "200ms" }}></div>
                <div className="w-0.5 bg-white animate-wave rounded-t-[1px]" style={{ height: "100%", animationDelay: "400ms" }}></div>
                <div className="w-0.5 bg-white animate-wave rounded-t-[1px]" style={{ height: "100%", animationDelay: "150ms" }}></div>
              </div>
            ) : (
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
            )}
            <span className="pointer-events-none">
              {isPlaying ? "STOP" : t("direct")}
            </span>
          </button>

          <button
            className="text-foreground p-1 ml-1"
            onClick={() => setOpen(!open)} // Bascule l'ouverture du menu mobile
          >
            {open ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* --- MENU MOBILE DÉROULANT --- */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="md:hidden bg-background/95 backdrop-blur-xl border-b border-border overflow-hidden"
          >
            <ul className="flex flex-col gap-1 p-4">
              {allMobileItems.map((item) => (
                <li key={item.label}>
                  <Link
                    to={item.href}
                    onClick={() => setOpen(false)} // Referme le menu quand on clique sur un lien
                    className="flex items-center gap-3 px-4 py-3 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors font-semibold text-sm uppercase tracking-wider"
                  >
                    {item.icon && <item.icon size={16} className="text-primary" />}
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
