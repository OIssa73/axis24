import { useState } from "react";
import { Radio, Tv, Newspaper, Phone, Menu, X, Images } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";

const navItems = [
  { label: "Accueil", href: "/" },
  { label: "Radio", href: "/radio", icon: Radio },
  { label: "Télévision", href: "/television", icon: Tv },
  { label: "Actualités", href: "/actualites", icon: Newspaper },
  { label: "Infos en images", href: "/infos-en-images", icon: Images },
  { label: "Contact", href: "/contact", icon: Phone },
];

const Navbar = () => {
  const [open, setOpen] = useState(false);

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
            <li key={item.href}>
              <Link
                to={item.href}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1.5"
              >
                {item.icon && <item.icon size={14} />}
                {item.label}
              </Link>
            </li>
          ))}
        </ul>

        <div className="hidden md:flex items-center gap-3">
          <Link to="/radio" className="btn-primary-glow text-sm flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-primary-foreground animate-pulse" />
            EN DIRECT
          </Link>
        </div>

        {/* Mobile toggle */}
        <button
          className="md:hidden text-foreground"
          onClick={() => setOpen(!open)}
        >
          {open ? <X size={24} /> : <Menu size={24} />}
        </button>
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
                <li key={item.href}>
                  <Link
                    to={item.href}
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-2 px-4 py-3 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                  >
                    {item.icon && <item.icon size={16} />}
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
