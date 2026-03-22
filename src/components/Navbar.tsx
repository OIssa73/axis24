import { useState } from "react";
import { Radio, Tv, Newspaper, Phone, Menu, X, Images, LayoutDashboard } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import LanguageSwitcher from "./LanguageSwitcher";
import { useLanguage } from "@/context/LanguageContext";

const Navbar = () => {
  const [open, setOpen] = useState(false);
  const { t } = useLanguage();

  const navItems = [
    { label: t("accueil"), href: "/" },
    { label: t("radio"), href: "/radio", icon: Radio },
    { label: t("television"), href: "/television", icon: Tv },
    { label: t("actualites"), href: "/actualites", icon: Newspaper },
    { label: t("images"), href: "/infos-en-images", icon: Images },
    { label: t("contact"), href: "/contact", icon: Phone },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border/50">
      <div className="container mx-auto flex items-center justify-between h-16 px-4">
        <Link to="/" className="flex items-center gap-2">
          <span className="font-display text-2xl tracking-widest text-foreground">
            AXIS<span className="text-primary">24</span>
          </span>
          <span className="hidden sm:block text-xs text-muted-foreground uppercase tracking-widest">
            Media Groupe
          </span>
        </Link>

        {/* Desktop */}
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
        </ul>

        <div className="hidden md:flex items-center gap-3 text-foreground">
          <LanguageSwitcher />
          <Link to="/admin" className="text-xs font-bold uppercase tracking-widest flex items-center gap-2 text-muted-foreground hover:text-primary transition-all ml-2">
            <LayoutDashboard size={14} /> Admin
          </Link>
          <Link to="/radio" className="btn-primary-glow text-xs px-4 py-2 flex items-center gap-2 rounded-lg font-bold">
            <span className="w-2 h-2 rounded-full bg-primary-foreground animate-pulse" />
            {t("direct")}
          </Link>
        </div>

        {/* Mobile toggle */}
        <div className="md:hidden flex items-center gap-4">
          <LanguageSwitcher />
          <button
            className="text-foreground p-1"
            onClick={() => setOpen(!open)}
          >
            {open ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="md:hidden bg-background/95 backdrop-blur-xl border-b border-border overflow-hidden"
          >
            <ul className="flex flex-col gap-1 p-4">
              {navItems.map((item) => (
                <li key={item.label}>
                  <Link
                    to={item.href}
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-2 px-4 py-3 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors font-medium text-sm"
                  >
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
