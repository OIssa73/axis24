import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from "react";
import { useLanguage } from "./LanguageContext";
import { useToast } from "@/hooks/use-toast";

interface LiveRadioContextType {
  isPlaying: boolean;
  isLoading: boolean;
  togglePlay: () => void;
}

const LiveRadioContext = createContext<LiveRadioContextType | undefined>(undefined);

// Tableau en cascade des Flux Audio RFI (du plus fiable/rapide pour faible réseau au principal)
const STREAMS_FR = [
  "https://rfiafrique64k.ice.infomaniak.ch/rfiafrique-64.mp3", // RFI Afrique - 64kbps stable
  "http://live02.rfi.fr/rfiafrique-96k.mp3",                 // Qualité normale
  "https://rfi-afrique.fr.ice.infomaniak.ch/rfi-afrique.mp3"  // Miroir Afrique
];

const STREAMS_EN = [
  "https://rfienanglais64k.ice.infomaniak.ch/rfienanglais-64.mp3", // 64kbps stable English
  "http://live02.rfi.fr/rfienanglais-96k.mp3",
  "https://rfi-en-anglais.fr.ice.infomaniak.ch/rfi-en-anglais.mp3"
];

export const LiveRadioProvider = ({ children }: { children: React.ReactNode }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const streamIndex = useRef(0); // Pour retenir quel flux de secours est en cours
  const { language } = useLanguage();
  const languageRef = useRef(language);
  const { toast } = useToast();

  // Mise à jour de la référence de langue magique
  useEffect(() => {
    languageRef.current = language;
  }, [language]);

  // Assistant pour récupérer l'URL courante selon la langue et l'index de secours
  const getActiveStreamArray = useCallback(() => languageRef.current === "en" ? STREAMS_EN : STREAMS_FR, []);
  const getActiveStreamUrl = useCallback(() => getActiveStreamArray()[streamIndex.current], [getActiveStreamArray]);

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
        // CASCADE DE SECOURS: Si le flux actuel échoue
        const activeArray = languageRef.current === "en" ? STREAMS_EN : STREAMS_FR;
        const maxIndex = activeArray.length - 1;
        
        if (streamIndex.current < maxIndex) {
           // On passe au flux de secours suivant
           streamIndex.current += 1;
           console.warn(`Basculement sur le flux radio de secours n°${streamIndex.current}`);
           
           if (audioRef.current) {
             audioRef.current.src = activeArray[streamIndex.current];
             audioRef.current.load();
             // On tente de relancer la lecture si possible
             audioRef.current.play().catch(() => {});
           }
        } else {
           // Épuisement de tous les flux de secours
           setIsPlaying(false);
           setIsLoading(false);
           streamIndex.current = 0; // Réinitialisation pour la prochaine tentative manuelle
           toast({ 
             title: "Radio RFI Indisponible", 
             description: "Le serveur radio est bloqué ou inaccessible depuis votre réseau internet actuel.",
             variant: "destructive"
           });
        }
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
      // A chaque changement de langue, on redémarre l'essai depuis le flux le plus robuste (index 0)
      streamIndex.current = 0;
      const activeStream = getActiveStreamUrl();
      
      // Si la source est différente de celle en cours
      if (!audioRef.current.src || !audioRef.current.src.includes(activeStream)) {
        const wasPlaying = isPlaying;
        audioRef.current.src = activeStream;
        audioRef.current.load();
        // Si elle jouait, on relance automatiquement dans la nouvelle langue
        if (wasPlaying) {
          setIsLoading(true);
          const playPromise = audioRef.current.play();
          if (playPromise !== undefined) {
             playPromise.catch(() => {
               // En cas d'échec initial, l'événement "error" prendra le relais pour la cascade de secours
             });
          }
        }
      }
    }
  }, [language, isPlaying, getActiveStreamUrl]);

  const togglePlay = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
    } else {
      setIsLoading(true);
      
      // Assurer que la source est correcte avant de lancer
      const activeStream = getActiveStreamUrl();
      if (!audioRef.current.src || !audioRef.current.src.includes(activeStream)) {
         audioRef.current.src = activeStream;
         audioRef.current.load();
      }
      
      const playPromise = audioRef.current.play();
      if (playPromise !== undefined) {
        playPromise.catch((e) => {
          console.warn("Lecture bloquée ou impossible à lancer directement", e);
          // On laisse l'événement 'error' s'en occuper et relancer les secours si nécessaire.
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

// eslint-disable-next-line react-refresh/only-export-components
export const useLiveRadio = () => {
  const context = useContext(LiveRadioContext);
  if (context === undefined) {
    throw new Error("useLiveRadio must be used within a LiveRadioProvider");
  }
  return context;
};
