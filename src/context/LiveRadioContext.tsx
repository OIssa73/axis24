import React, { createContext, useContext, useState, useEffect, useRef } from "react";
import { useLanguage } from "./LanguageContext";
import { useToast } from "@/hooks/use-toast";

interface LiveRadioContextType {
  isPlaying: boolean;
  isLoading: boolean;
  togglePlay: () => void;
}

const LiveRadioContext = createContext<LiveRadioContextType | undefined>(undefined);

// Flux Audio RFI (Radio France Internationale)
const STREAM_FR = "http://live02.rfi.fr/rfimonde-96k.mp3";
// Le flux anglais officiel RFI est parfois difficile à isoler, mais celui-ci est aux normes Icecast ou peut tomber sur le flux Europe.
const STREAM_EN = "http://live02.rfi.fr/rfienanglais-96k.mp3"; 

export const LiveRadioProvider = ({ children }: { children: React.ReactNode }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const { language } = useLanguage();
  const { toast } = useToast();

  // Initialisation unique de l'objet Audio sans le monter dans le DOM
  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio();
      
      // Comportements natifs de l'audio
      audioRef.current.addEventListener("playing", () => {
        setIsPlaying(true);
        setIsLoading(false);
      });
      
      audioRef.current.addEventListener("pause", () => {
        setIsPlaying(false);
        setIsLoading(false);
      });
      
      audioRef.current.addEventListener("waiting", () => setIsLoading(true));
      
      audioRef.current.addEventListener("error", () => {
        setIsPlaying(false);
        setIsLoading(false);
        toast({ 
          title: "Erreur de connexion", 
          description: "Le flux radio en direct est temporairement indisponible.",
          variant: "destructive"
        });
      });
    }

    // Le son est nettoyé uniquement si le site est fermé complètement
    return () => {
      // Cleanup listeners logic normally here, but since it's global App level, it rarely unmounts.
    };
  }, [toast]);

  // Si on change de langue alors que la radio joue, on met à jour le flux dynamiquement !
  useEffect(() => {
    if (audioRef.current) {
      const activeStream = language === "en" ? STREAM_EN : STREAM_FR;
      
      // Si la source est différente de celle en cours
      if (audioRef.current.src !== activeStream) {
        const wasPlaying = isPlaying;
        audioRef.current.src = activeStream;
        audioRef.current.load();
        // Si elle jouait, on relance automatiquement dans la nouvelle langue
        if (wasPlaying) {
          setIsLoading(true);
          const playPromise = audioRef.current.play();
          if (playPromise !== undefined) {
             playPromise.catch(() => {
               setIsPlaying(false);
               setIsLoading(false);
             });
          }
        }
      }
    }
  }, [language, isPlaying]);

  const togglePlay = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
    } else {
      setIsLoading(true);
      
      // Assurer que la source est correcte avant de lancer
      const activeStream = language === "en" ? STREAM_EN : STREAM_FR;
      if (audioRef.current.src !== activeStream) {
         audioRef.current.src = activeStream;
         audioRef.current.load();
      }
      
      const playPromise = audioRef.current.play();
      if (playPromise !== undefined) {
        playPromise.catch((e) => {
          console.error("Lecture impossible", e);
          setIsPlaying(false);
          setIsLoading(false);
        });
      }
    }
  };

  return (
    <LiveRadioContext.Provider value={{ isPlaying, isLoading, togglePlay }}>
      {children}
    </LiveRadioContext.Provider>
  );
};

export const useLiveRadio = () => {
  const context = useContext(LiveRadioContext);
  if (context === undefined) {
    throw new Error("useLiveRadio must be used within a LiveRadioProvider");
  }
  return context;
};
