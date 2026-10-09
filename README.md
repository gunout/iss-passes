# 🛰️ Passages ISS — Carte du ciel

Page web statique qui affiche les **prochains passages de l'ISS** au‑dessus de votre position, avec :
- 📅 Liste des passages sur 72 h
- ⏱️ Compte à rebours en direct
- 🌌 Carte du ciel (azimut / élévation)
- 🔔 Notifications navigateur (10 min avant un passage visible)
- ✅ Filtre « passages visibles uniquement »

## Démo

👉 https://VOTRE-USERNAME.github.io/iss-passes/

## Comment ça marche

- Les TLE de l'ISS sont récupérés **toutes les 6 h** depuis Celestrak via une GitHub Action.
- Les passages sont calculés **côté navigateur** avec [satellite.js](https://github.com/shashwatak/satellite-js) (SGP4).
- Aucune clé API, aucun backend.

## Déploiement sur GitHub Pages

1. Poussez ce repo sur GitHub.
2. Allez dans **Settings → Pages**.
3. Source : **Deploy from a branch** → branche `main`, dossier `/ (root)`.
4. Attendez 1–2 min, la page est en ligne.

## Personnalisation

- **Position par défaut** : `DEFAULT_LAT` / `DEFAULT_LON` dans `app.js`.
- **Élévation minimale** : `MIN_ELEV` dans `app.js`.
- **Fenêtre de prévision** : `HOURS_WINDOW` dans `app.js`.

## Licence

MIT
