# Directives du Projet Axis24

## Déploiement Automatique Obligatoire (À la fin de chaque tâche)

À la fin de chaque tâche ou modification de code future, l'assistant doit systématiquement exécuter la procédure de déploiement et de mise à jour à chaud suivante :

1. **Compilation Web** : Exécuter `npm run build`
2. **Téléversement Capgo (Live Update)** : Incrémenter le numéro de version (ex: 1.0.5, 1.0.6...) et exécuter :
   `$env:NODE_OPTIONS="--dns-result-order=ipv4first"; npx @capgo/cli bundle upload com.axis24.mediahub --path ./dist --apikey 86af18fc-21d4-4adb-aebb-b3bf1aa8f7ed -b <VERSION> --channel production`
3. **Publication Web (Vercel)** : Effectuer les commandes `git add .`, `git commit` et `git push origin main` pour mettre à jour automatiquement le site Vercel.
