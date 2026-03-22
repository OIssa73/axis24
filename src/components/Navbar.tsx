import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Radio, Tv, Newspaper, LayoutDashboard, Send } from "lucide-react";
import LanguageSwitcher from "./LanguageSwitcher";

const navLinks = [
  { name: "Accueil", href: "/", icon: Newspaper },
  { name: "TV", href: "/#television", icon: Tv },
  { name: "Radio", href: "/#radio", icon: Radio },
  { name: "Contact", href: "/contact", icon: Send },
];

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${scrolled ? "bg-background/80 backdrop-blur-xl border-b border-white/5 py-2 shadow-2xl" : "bg-transparent py-4"}`}>
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20 group-hover:rotate-12 transition-transform duration-500">
              <span className="text-white font-display text-xl font-bold">A</span>
            </div>
            <span className="font-display text-2xl tracking-[0.3em] font-black text-foreground">AXIS<span className="text-secondary">24</span></span>
          </Link>

          <ul className="hidden md:flex items-center space-x-1">
            {navLinks.map((link) => (
              <li key={link.name}>
                <a
                  href={link.href}
                  className="px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all"
                >
                  {link.name}
                </a>
              </li>
            ))}
          </ul>

          <div className="hidden md:flex items-center space-x-4">
            <LanguageSwitcher />
            <Link to="/admin" className="btn-primary-glow px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest flex items-center gap-2">
              <LayoutDashboard size={14} /> Admin
            </Link>
          </div>

          <div className="md:hidden flex items-center gap-4">
            <LanguageSwitcher />
            <button onClick={() => setIsOpen(!isOpen)} className="text-foreground p-2 bg-muted/30 rounded-lg">
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-background/95 backdrop-blur-xl border-b border-border overflow-hidden"
          >
            <div className="container mx-auto px-4 py-8 flex flex-col space-y-4">
              {navLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  onClick={() => setIsOpen(false)}
                  className="text-lg font-display tracking-widest flex items-center gap-4 p-3 hover:bg-muted rounded-xl transition-all"
                >
                  <link.icon className="text-primary" size={20} />
                  {link.name}
                </a>
              ))}
              <Link
                to="/admin"
                onClick={() => setIsOpen(false)}
                className="btn-primary-glow text-center py-4 rounded-xl font-display tracking-[0.2em]"
              >
                ADMINISTRATION
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
