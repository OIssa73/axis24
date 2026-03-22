import Navbar from "@/components/Navbar";
import NewsTicker from "@/components/NewsTicker";
import HeroSection from "@/components/HeroSection";
import NewsSection from "@/components/NewsSection";
import AdsWidget from "@/components/AdsWidget";
import TVSection from "@/components/TVSection";
import RadioSection from "@/components/RadioSection";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-16">
        <NewsTicker />
      </div>
      <HeroSection />
      <NewsSection />
      <AdsWidget />
      <TVSection />
      <RadioSection />
      <Footer />
    </div>
  );
};

export default Index;
