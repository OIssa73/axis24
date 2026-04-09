// Ce fichier gère la connexion entre votre site et votre base de données Supabase.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types'; // Importation des types de données pour plus de sécurité

// On récupère les adresses techniques (URL et Clé) depuis les variables d'environnement
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_PUBLISHABLE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

/**
 * Création de l'instance "supabase".
 * C'est cet objet que l'on utilisera partout ailleurs dans le code pour lire ou écrire des données
 * (articles, vidéos, publicités, etc.) dans votre base de données.
 */
export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    storage: localStorage, // Conserver la session de l'utilisateur (connexion) sur son navigateur
    persistSession: true, // Se souvenir de l'utilisateur même s'il actualise la page
    autoRefreshToken: true, // Renouveler automatiquement la sécurité de la connexion
  }
});