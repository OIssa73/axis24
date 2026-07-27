import { Capacitor } from "@capacitor/core";
import { MediaSession } from "@capgo/capacitor-media-session";

/**
 * Met à jour la session média système (contrôles sur l'écran de verrouillage et volet de notification)
 * avec les métadonnées et abonnements d'action (Play/Pause).
 */
export const updateMediaSession = async (
  title: string,
  artist: string,
  album: string,
  artworkUrl: string | null,
  isPlaying: boolean,
  onPlay: () => void,
  onPause: () => void
) => {
  const finalArtwork = artworkUrl || "/favicon.png";

  if (Capacitor.isNativePlatform()) {
    try {
      // 1. Définir les métadonnées pour le widget natif
      await MediaSession.setMetadata({
        title,
        artist,
        album,
        artwork: [
          {
            src: finalArtwork.startsWith("http")
              ? finalArtwork
              : window.location.origin + finalArtwork,
            sizes: "512x512",
            type: "image/png",
          },
        ],
      });

      // 2. Mettre à jour l'état de lecture
      await MediaSession.setPlaybackState({
        playbackState: isPlaying ? "playing" : "paused",
      });

      // 3. Associer les écouteurs d'actions pour le verrouillage natif
      await MediaSession.setActionHandler({ action: "play" }, () => {
        onPlay();
      });
      await MediaSession.setActionHandler({ action: "pause" }, () => {
        onPause();
      });
    } catch (error) {
      console.warn("Erreur lors de la mise à jour de la session média native :", error);
    }
  } else if ("mediaSession" in navigator) {
    // Navigateur Standard Web
    try {
      navigator.mediaSession.metadata = new MediaMetadata({
        title,
        artist,
        album,
        artwork: [
          {
            src: finalArtwork.startsWith("http")
              ? finalArtwork
              : window.location.origin + finalArtwork,
            sizes: "512x512",
            type: "image/png",
          },
        ],
      });

      navigator.mediaSession.playbackState = isPlaying ? "playing" : "paused";

      navigator.mediaSession.setActionHandler("play", onPlay);
      navigator.mediaSession.setActionHandler("pause", onPause);
    } catch (error) {
      console.warn("Erreur lors de la mise à jour de la session média du navigateur :", error);
    }
  }
};

/**
 * Supprime les métadonnées de la session média et coupe les contrôleurs.
 */
export const clearMediaSession = async () => {
  if (Capacitor.isNativePlatform()) {
    try {
      await MediaSession.setPlaybackState({ playbackState: "none" });
    } catch (error) {
      console.warn("Erreur lors du nettoyage de la session média native :", error);
    }
  } else if ("mediaSession" in navigator) {
    try {
      navigator.mediaSession.playbackState = "none";
      navigator.mediaSession.metadata = null;
    } catch (error) {
      console.warn("Erreur lors du nettoyage de la session média du navigateur :", error);
    }
  }
};
