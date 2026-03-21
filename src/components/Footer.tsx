import { Link } from "react-router-dom";

const Footer = () => (
  <footer className="border-t border-border py-10">
    <div className="container mx-auto px-4">
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <Link to="/" className="flex items-center gap-2">
          <span className="font-display text-xl tracking-widest text-foreground">
            AXIS<span className="text-primary">24</span>
          </span>
          <span className="text-xs text-muted-foreground uppercase tracking-widest">Media Groupe</span>
        </Link>
        <div className="flex items-center gap-6 text-sm text-muted-foreground">
          <Link to="/radio" className="hover:text-foreground transition-colors">Radio</Link>
          <Link to="/television" className="hover:text-foreground transition-colors">TV</Link>
          <Link to="/actualites" className="hover:text-foreground transition-colors">Actualités</Link>
          <Link to="/infos-en-images" className="hover:text-foreground transition-colors">Infos en images</Link>
          <Link to="/contact" className="hover:text-foreground transition-colors">Contact</Link>
        </div>
        <div className="flex items-center gap-4">
          <p className="text-xs text-muted-foreground">
            © 2026 AXIS24 Media Groupe. Tous droits réservés.
          </p>
          <Link to="/admin/login" className="text-xs text-muted-foreground/50 hover:text-muted-foreground transition-colors">
            Admin
          </Link>
        </div>
      </div>
    </div>
  </footer>
);

export default Footer;
