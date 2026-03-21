import Navbar from "@/components/Navbar";
import RadioSection from "@/components/RadioSection";
import Footer from "@/components/Footer";
import BackButton from "@/components/BackButton";

const Radio = () => (
  <div className="min-h-screen bg-background">
    <Navbar />
    <div className="pt-16">
      <BackButton />
      <RadioSection />
    </div>
    <Footer />
  </div>
);

export default Radio;
