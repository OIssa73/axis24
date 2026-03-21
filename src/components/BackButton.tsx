import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

const BackButton = () => (
  <div className="container mx-auto px-4 pt-6">
    <Link
      to="/"
      className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
    >
      <ArrowLeft size={16} />
      Retour à l'accueil
    </Link>
  </div>
);

export default BackButton;
