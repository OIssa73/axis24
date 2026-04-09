// Ce fichier contient des outils qui aident à gérer les styles CSS de l'application.
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Fonction "cn" (Class Name).
 * Elle permet de fusionner plusieurs classes CSS de Tailwind proprement.
 * Par exemple : si vous voulez ajouter une couleur seulement sous certaines conditions
 * sans casser les autres styles déjà présents.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
