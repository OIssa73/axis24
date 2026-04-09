// Importation des composants globaux (Navigation, Rubrique, Pied de page)
import Navbar from "@/components/Navbar";
import NewsSection from "@/components/NewsSection"; // Le module qui affiche les articles
import Footer from "@/components/Footer";
import BackButton from "@/components/BackButton"; // Bouton pour revenir à la page précédente

/**
 * Page ACTUALITÉS.
 * Sert de conteneur simple pour afficher la section des articles en pleine page.
 */
const Actualites = () => (
  <div className="min-h-screen bg-background">
    <Navbar />
    {/* On ajoute un espace en haut pour ne pas être caché par le menu fixe */}
    <div className="pt-16">
      <BackButton />
      <NewsSection />
    </div>
    <Footer />
  </div>
);

export default Actualites;
