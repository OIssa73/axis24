import { useState } from "react";
import { Globe, ChevronDown, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "@/context/LanguageContext";

const languages = [
  { code: "fr", name: "Français", flag: "🇫🇷" },
  { code: "en", name: "English", flag: "🇺🇸" },
] as const;

const LanguageSwitcher = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { language, setLanguage } = useLanguage();
  
  const currentLang = languages.find(l => l.code === language) || languages[0];

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-muted/30 hover:bg-muted border border-border/50 text-xs font-bold uppercase tracking-widest transition-all"
      >
        <Globe size={14} className="text-primary" />
        <span>{currentLang.code}</span>
        <ChevronDown size={12} className={`transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              className="absolute right-0 mt-2 w-48 bg-background/95 backdrop-blur-xl border border-border shadow-2xl rounded-2xl p-2 z-50 py-3"
            >
              <div className="grid gap-1">
                {languages.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => {
                      setLanguage(lang.code);
                      setIsOpen(false);
                      try {
                        const selectElement = document.querySelector('.goog-te-combo') as HTMLSelectElement | null;
                        if (selectElement) {
                          selectElement.value = lang.code;
                          selectElement.dispatchEvent(new Event('change'));
                        } else {
                          const domain = window.location.hostname;
                          document.cookie = `googtrans=/fr/${lang.code}; path=/;`;
                          if (domain !== 'localhost') {
                             document.cookie = `googtrans=/fr/${lang.code}; path=/; domain=.${domain}`;
                          }
                          window.location.reload();
                        }
                      } catch (e) {
                         console.error(e);
                      }
                    }}
                    className={`flex items-center justify-between px-3 py-2 rounded-xl text-sm transition-all ${
                      language === lang.code 
                      ? "bg-primary/10 text-primary font-bold" 
                      : "hover:bg-muted text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-lg leading-none">{lang.flag}</span>
                      <span className="tracking-tight">{lang.name}</span>
                    </div>
                    {language === lang.code && <Check size={14} />}
                  </button>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default LanguageSwitcher;
