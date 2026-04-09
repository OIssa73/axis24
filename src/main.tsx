// Importation des outils nécessaires à React pour afficher l'application dans le navigateur
import { createRoot } from "react-dom/client";
// Importation du composant principal "App" qui contient toute la logique de navigation
import App from "./App.tsx";
// Importation des styles CSS globaux (le design général)
import "./index.css";

// On récupère l'élément "root" dans le fichier index.html et on y lance l'application
createRoot(document.getElementById("root")!).render(<App />);
