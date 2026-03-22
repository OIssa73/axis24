import Navbar from "@/components/Navbar";
import NewsTicker from "@/components/NewsTicker";
import HeroSection from "@/components/HeroSection";
import ExternalNewsWidget from "@/components/ExternalNewsWidget";
import NewsSection from "@/components/NewsSection";
import JournalistsSection from "@/components/JournalistsSection";
import TVSection from "@/components/TVSection";
import RadioSection from "@/components/RadioSection";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <div className="pt-16">
        <NewsTicker />
      </div>
      <HeroSection />
      
      {/* Dynamic international/local news */}
      <ExternalNewsWidget />
      
      <NewsSection />
      
      {/* Meet the team section */}
      <JournalistsSection />
      
      <TVSection />
      <RadioSection />
      <Footer />
    </div>
  );
};

export default Index;
