// Importation des composants globaux (Navigation, Rubrique Sportive, Pied de page)
import Navbar from "@/components/Navbar";
import SportsSection from "@/components/SportsSection"; // Le module qui affiche les actualités et vidéos de sport
import Footer from "@/components/Footer";
import BackButton from "@/components/BackButton"; // Bouton pour revenir à la page précédente

/**
 * Page SPORTS.
 * Simple conteneur qui affiche la section sport d'Axis24.
 */
const Sports = () => (
  <div className="min-h-screen bg-background text-foreground">
    <Navbar />
    {/* On ajoute un espace en haut pour ne pas être caché par le menu fixe */}
    <div className="pt-16">
      <BackButton />
      <SportsSection />
    </div>
    <Footer />
  </div>
);

export default Sports;
