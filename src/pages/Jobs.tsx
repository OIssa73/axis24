import Navbar from "@/components/Navbar";
import JobsSection from "@/components/JobsSection";
import Footer from "@/components/Footer";
import BackButton from "@/components/BackButton";

const Jobs = () => (
  <div className="min-h-screen bg-background">
    <Navbar />
    <div className="pt-16">
      <BackButton />
      <JobsSection />
    </div>
    <Footer />
  </div>
);

export default Jobs;
