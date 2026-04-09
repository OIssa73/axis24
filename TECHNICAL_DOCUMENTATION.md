# Documentation Technique - Axis24 MediaHub

Ce document fournit un aperçu technologique et structurel du projet **Axis24 MediaHub**, une plateforme multimédia moderne pour la diffusion de radio, télévision et actualités.

---

## 1. Stack Technologique (Technologies utilisées)

Le projet est bâti sur une architecture web moderne, performante et scalable :

*   **Frontend :**
    *   **React (Vite) :** Bibliothèque principale pour l'interface utilisateur.
    *   **TypeScript :** Pour un code sécurisé et sans erreurs de typage.
    *   **Tailwind CSS :** Framework de stylisation pour un design responsive et moderne.
    *   **Framer Motion :** Moteur d'animations pour une expérience utilisateur fluide.
    *   **Lucide React :** Bibliothèque d'icônes vectorielles.
    *   **Shadcn/UI :** Composants d'interface pré-construits et personnalisables.

*   **Backend & Base de données :**
    *   **Supabase :** Backend-as-a-Service (BaaS) fournissant :
        *   **PostgreSQL :** Base de données relationnelle.
        *   **Supabase Auth :** Gestion sécurisée des comptes administrateurs.
        *   **Supabase Storage :** Stockage des fichiers multimédias (MP3, MP4, Images).
        *   **Supabase Edge Functions :** Fonctions serveur pour des tâches spécifiques (ex: initialisation admin).

*   **Outils tiers :**
    *   **Formspree :** Gestion de la réception des formulaires de contact par email.
    *   **Google Translate API (Widget) :** Traduction automatique du site en plusieurs langues via un cookie dédié.

---

## 2. Architecture des Pages et Rôles

Le site est divisé en deux grandes parties : la **Vitrine Publique** et l'**Administration**.

### Vitrine Publique
| Page | Rôle |
| :--- | :--- |
| `Index.tsx` (Accueil) | Point d'entrée principal. Affiche dynamiquement les sections activées (News, Radio, TV, Sports, Emplois). |
| `Actualites.tsx` | Liste complète de tous les articles et émissions publiés. |
| `Radio.tsx` | Page dédiée à l'écoute des podcasts et émissions audio. |
| `Television.tsx` | Galerie de vidéos, replays d'émissions et streaming. |
| `Sports.tsx` | Flux d'actualités filtré spécifiquement sur la thématique sportive. |
| `Jobs.tsx` | Portail de recrutement affichant les offres d'emploi déposées. |
| `InfoImages.tsx` | Galerie multimédia filtrable par catégories d'images. |
| `ContentDetail.tsx` | Page dynamique affichant le contenu complet d'un article, d'une vidéo ou d'un son (avec compteur de vues). |
| `Contact.tsx` | Coordonnées et formulaire de message direct. |

### Administration (Privée)
| Page / Composant | Rôle |
| :--- | :--- |
| `AdminLogin.tsx` | Connexion sécurisée des administrateurs. |
| `AdminSetup.tsx` | Initialisation du premier compte administrateur (sécurité). |
| `Admin.tsx` (Dashboard) | Tableau de bord central regroupant les statistiques et la navigation administrative. |
| `AdminUpload.tsx` | Formulaire d'ajout de nouveaux contenus avec gestion des fichiers (Storage). |
| `AdminContent.tsx` | Liste de gestion : modifier, masquer/publier ou supprimer des contenus. |
| `AdminAds.tsx` | Gestion dynamique des bannières publicitaires et des partenaires sponsors. |
| `AdminJournalists.tsx` | Gestion de l'équipe rédactionnelle (trombinoscope). |
| `AdminSettings.tsx` | Configuration de la page d'accueil (titres, visibilité des sections). |

---

## 3. Modèle de Données (Base de données Supabase)

Les principales tables utilisées sont :

*   **`content` :** Stocke tous les médias (titre, description, type: audio/video/article/job/sport, url des fichiers, nombre de vues).
*   **`categories` :** Liste des thématiques pour le filtrage (politique, sport, musique, etc.).
*   **`journalists` :** Liste des membres de l'équipe (nom, photo).
*   **`site_settings` :** Stockage de configurations JSON (titres des pages, visibilité des blocs d'accueil, bannières publicitaires, biographies des journalistes).
*   **`profiles` :** Profils utilisateurs liés à l'authentification (rôles admin).

---

## 4. Interdépendances et Logique Métier

1.  **Filtrage Dynamique :** Les sections *Sports* et *Jobs* filtrent automatiquement la table `content` selon le champ `type` ou la catégorie associée.
2.  **Gestion des Fichiers :** Lors d'un upload, le fichier est envoyé dans le bucket `media` de Supabase. L'URL générée est ensuite enregistrée dans la table `content`.
3.  **Temps réel :** Le composant `AdsWidget` utilise les "Realtime Subscriptions" de Supabase pour mettre à jour les publicités sur l'écran du visiteur dès que l'administrateur les modifie, sans rechargement de page.
4.  **Statistiques :** Chaque consultation d'un contenu (`ContentDetail`) déclenche une incrémentation du champ `views_count` directement dans la base de données.
5.  **Multi-langues :** Le `LanguageContext` gère la traduction des textes statiques, tandis que les contenus dynamiques (BDD) sont traduits via le widget Google intégré.

---

## 5. Maintenance et Évolutions futures

*   **Sécurité :** L'accès à la console `/admin` est protégé par des "Row Level Security" (RLS) sur Supabase, empêchant toute modification anonyme des données.
*   **Scalabilité :** La structure modulaire par composants permet d'ajouter facilement de nouvelles rubriques ou fonctionnalités (ex: système de commentaires, newsletter).
