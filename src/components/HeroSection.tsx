import { motion } from "framer-motion";
import { Radio, Tv, Images, ChevronDown } from "lucide-react";
import { Link } from "react-router-dom";
import { useLanguage } from "@/context/LanguageContext";
import heroBg from "@/assets/hero-bg.jpg";

const HeroSection = () => {
  const { t } = useLanguage();

  return (
    <section
      id="accueil"
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
    >
      {/* Background */}
      <div className="absolute inset-0">
        <img
          src={heroBg}
          alt="Studio AXIS24"
          className="w-full h-full object-cover"
          loading="eager"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/70 via-background/50 to-background" />
      </div>

      <div className="relative z-10 container mx-auto px-4 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h1 className="font-display text-6xl sm:text-8xl md:text-9xl tracking-wider mb-2">
            AXIS<span className="text-primary">24</span>
          </h1>
          <p className="text-gradient-gold font-display text-2xl sm:text-3xl tracking-[0.3em] mb-4">
            MEDIA GROUPE
          </p>
          <p className="text-muted-foreground text-lg max-w-lg mx-auto mb-10">
            {t("hero_subtitle")}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <Link
            to="/radio"
            className="btn-primary-glow flex items-center gap-3 text-lg px-8 py-4"
          >
            <Radio size={20} />
            {t("radio_live")}
          </Link>
          <Link
            to="/television"
            className="glass-card flex items-center gap-3 text-lg px-8 py-4 text-foreground hover:bg-muted/50 transition-colors cursor-pointer"
          >
            <Tv size={20} />
            {t("tv_live")}
          </Link>
          <Link
            to="/infos-en-images"
            className="glass-card flex items-center gap-3 text-lg px-8 py-4 text-foreground hover:bg-muted/50 transition-colors cursor-pointer"
          >
            <Images size={20} />
            {t("infos_images")}
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2, duration: 1 }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2"
        >
          <ChevronDown size={28} className="text-muted-foreground animate-bounce" />
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection;
