// Importation des composants globaux (Navigation, Rubrique Emploi, Pied de page)
import Navbar from "@/components/Navbar";
import JobsSection from "@/components/JobsSection"; // Le module qui affiche les offres de recrutement
import Footer from "@/components/Footer";
import BackButton from "@/components/BackButton"; // Bouton pour revenir à la page précédente

/**
 * Page JOBS & EMPLOIS.
 * Simple conteneur qui affiche les opportunités de carrière sur Axis24.
 */
const Jobs = () => (
  <div className="min-h-screen bg-background text-foreground">
    <Navbar />
    {/* On ajoute un espace en haut pour ne pas être caché par le menu fixe */}
    <div className="pt-16">
      <BackButton />
      <JobsSection />
    </div>
    <Footer />
  </div>
);

export default Jobs;
