import Navbar from "@/components/Navbar";
import SportsSection from "@/components/SportsSection";
import Footer from "@/components/Footer";
import BackButton from "@/components/BackButton";

const Sports = () => (
  <div className="min-h-screen bg-background">
    <Navbar />
    <div className="pt-16">
      <BackButton />
      <SportsSection />
    </div>
    <Footer />
  </div>
);

export default Sports;
