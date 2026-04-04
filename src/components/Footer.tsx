import { Link } from "react-router-dom";
import { useLanguage } from "@/context/LanguageContext";

const Footer = () => {
  const { t } = useLanguage();
  return (
    <footer className="border-t border-border py-10">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <Link to="/" className="flex items-center gap-2">
            <span className="font-display text-xl tracking-widest text-foreground">
              AXIS<span className="text-primary">24</span>
            </span>
            <span className="text-xs text-muted-foreground uppercase tracking-widest">Media Groupe</span>
          </Link>
          <div className="flex flex-wrap items-center justify-center gap-4 md:gap-6 text-sm text-muted-foreground">
            <Link to="/radio" className="hover:text-foreground transition-colors">{t("radio")}</Link>
            <Link to="/television" className="hover:text-foreground transition-colors">{t("television")}</Link>
            <Link to="/actualites" className="hover:text-foreground transition-colors">{t("actualites")}</Link>
            <Link to="/infos-en-images" className="hover:text-foreground transition-colors">{t("images")}</Link>
            <Link to="/contact" className="hover:text-foreground transition-colors">{t("contact")}</Link>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-2 md:gap-4 text-center mt-2 md:mt-0">
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
};

export default Footer;
