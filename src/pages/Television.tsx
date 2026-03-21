import Navbar from "@/components/Navbar";
import TVSection from "@/components/TVSection";
import Footer from "@/components/Footer";
import BackButton from "@/components/BackButton";

const Television = () => (
  <div className="min-h-screen bg-background">
    <Navbar />
    <div className="pt-16">
      <BackButton />
      <TVSection />
    </div>
    <Footer />
  </div>
);

export default Television;
