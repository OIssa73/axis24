import Navbar from "@/components/Navbar";
import NewsSection from "@/components/NewsSection";
import Footer from "@/components/Footer";
import BackButton from "@/components/BackButton";

const Actualites = () => (
  <div className="min-h-screen bg-background">
    <Navbar />
    <div className="pt-16">
      <BackButton />
      <NewsSection />
    </div>
    <Footer />
  </div>
);

export default Actualites;
