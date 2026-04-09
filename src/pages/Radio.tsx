// Importation des composants globaux (Navigation, Lecteur Radio, Pied de page)
import Navbar from "@/components/Navbar";
import RadioSection from "@/components/RadioSection"; // Le module qui affiche les podcasts et le direct audio
import Footer from "@/components/Footer";
import BackButton from "@/components/BackButton"; // Bouton pour revenir à la page précédente

/**
 * Page RADIO.
 * Simple conteneur qui affiche l'espace radio en pleine page.
 */
const Radio = () => (
  <div className="min-h-screen bg-background">
    <Navbar />
    {/* On ajoute un espace en haut pour ne pas être caché par le menu fixe */}
    <div className="pt-16">
      <BackButton />
      <RadioSection />
    </div>
    <Footer />
  </div>
);

export default Radio;
