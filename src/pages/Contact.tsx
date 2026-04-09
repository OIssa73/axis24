// Importation des composants globaux (Navigation, Rubrique Contact, Pied de page)
import Navbar from "@/components/Navbar";
import ContactSection from "@/components/ContactSection"; // Le module qui affiche les coordonnées et le formulaire
import Footer from "@/components/Footer";
import BackButton from "@/components/BackButton"; // Bouton pour revenir à la page précédente

/**
 * Page CONTACT.
 * Simple conteneur qui affiche les informations de contact d'Axis24.
 */
const Contact = () => (
  <div className="min-h-screen bg-background">
    <Navbar />
    {/* On ajoute un espace en haut pour ne pas être caché par le menu fixe */}
    <div className="pt-16">
      <BackButton />
      <ContactSection />
    </div>
    <Footer />
  </div>
);

export default Contact;
