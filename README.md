<div align="center">

# 🛰️ Cellule Orbitale — Suivi ISS

**Suivi temps réel de la Station Spatiale Internationale · Carte ASCII mondiale · Passages · Carte du ciel**

[![Démo](https://img.shields.io/badge/Démo-gunout.github.io%2Fiss--passes-000091?style=for-the-badge)](https://gunout.github.io/iss-passes/)
[![Licence MIT](https://img.shields.io/badge/Licence-MIT-E1000F?style=for-the-badge)](LICENSE)
[![GitHub Pages](https://img.shields.io/github/deployments/gunout/iss-passes/github-pages?label=Pages&style=for-the-badge&color=16a34a)](https://github.com/gunout/iss-passes/deployments)
[![Dernier commit](https://img.shields.io/github/last-commit/gunout/iss-passes?style=for-the-badge&color=1212ff)](https://github.com/gunout/iss-passes/commits/main)
[![Action TLE](https://img.shields.io/github/actions/workflow/status/gunout/iss-passes/update-tle.yml?label=TLE&style=for-the-badge)](https://github.com/gunout/iss-passes/actions/workflows/update-tle.yml)
[![Taille repo](https://img.shields.io/github/repo-size/gunout/iss-passes?style=for-the-badge)](https://github.com/gunout/iss-passes)
[![Issues](https://img.shields.io/github/issues/gunout/iss-passes?style=for-the-badge&color=E1000F)](https://github.com/gunout/iss-passes/issues)
[![Stars](https://img.shields.io/github/stars/gunout/iss-passes?style=for-the-badge&color=f59e0b)](https://github.com/gunout/iss-passes/stargazers)

[![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=flat-square&logo=html5&logoColor=white)](https://developer.mozilla.org/fr/docs/Web/HTML)
[![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=flat-square&logo=css3&logoColor=white)](https://developer.mozilla.org/fr/docs/Web/CSS)
[![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=flat-square&logo=javascript&logoColor=black)](https://developer.mozilla.org/fr/docs/Web/JavaScript)
[![satellite.js](https://img.shields.io/badge/satellite.js-5.0.0-16a34a?style=flat-square)](https://github.com/shashwatak/satellite-js)
[![SGP4](https://img.shields.io/badge/Propagation-SGP4-000091?style=flat-square)](https://en.wikipedia.org/wiki/Simplified_perturbations_models)
[![Sans dépendances](https://img.shields.io/badge/Dépendances-0-16a34a?style=flat-square)](package.json)
[![Responsive](https://img.shields.io/badge/Responsive-Oui-000091?style=flat-square)](index.html)

</div>

---

## Sommaire

- [Présentation](#présentation)
- [Fonctionnalités](#fonctionnalités)
- [Démo](#démo)
- [Architecture](#architecture)
- [Technologies](#technologies)
- [Installation locale](#installation-locale)
- [Personnalisation](#personnalisation)
- [Contribution](#contribution)
- [Signaler un bug](#signaler-un-bug)
- [Licence](#licence)
- [Remerciements](#remerciements)

---

## Présentation

**Cellule Orbitale** est une page web **statique** (100 % front-end) qui affiche en temps réel la position de la **Station Spatiale Internationale (ISS)** et calcule ses **prochains passages visibles** au-dessus d'un observateur.

Aucune clé API, aucun backend, aucun tracking. Tout tourne dans le navigateur.

Le projet combine :

- une **carte ASCII mondiale** générée à partir des données Natural Earth
- un **calcul orbital SGP4** via satellite.js
- une **interface officielle** aux couleurs de la République Française (Marianne, tricolore, police Nasalization)

---

## Fonctionnalités

### Suivi orbital

- Position ISS en temps réel (latitude, longitude, altitude)
- Vitesse orbitale instantanée
- Cap (azimut) et période orbitale
- Trace des 20 dernières positions
- Carte ASCII 120 x 50 avec continents, océans et repères (Paris, Kourou)

### Prévision des passages

- Calcul sur 72 heures glissantes
- AOS / TCA / LOS avec heure locale
- Élévation maximale et distance minimale
- Azimut de montée, culminaison et descente
- Compte à rebours en direct
- Filtre « passages visibles uniquement »
- Carte du ciel (azimut / élévation) du passage sélectionné

### Interface

- Design officiel Marianne / tricolore
- Police Nasalization (fallback CDN)
- Responsive mobile / tablette / desktop
- Horloge UTC intégrée
- Boutons Pause, Recharger TLE, Effacer trace, Ma position

### Automatisation

- TLE mis à jour toutes les 6 h via GitHub Actions
- 4 sources TLE de secours (ivanstanojevic, AllOrigins, Wheretheiss.at, data/tle.json)
- Fallback TLE local si toutes les sources échouent

---

## Démo

**https://gunout.github.io/iss-passes/**

---

## Architecture

- `index.html` : page unique (HTML + CSS + JS intégrés)
- `data/tle.json` : TLE ISS mis à jour par GitHub Actions
- `.github/workflows/update-tle.yml` : workflow de mise à jour TLE
- `.gitignore`
- `LICENSE`
- `README.md`

---

## Technologies

- **satellite.js** : implémentation SGP4/SDP4 en JavaScript
- **Natural Earth** : données géographiques 110 m
- **Celestrak** : source des TLE publics
- **GitHub Actions** : mise à jour automatique du TLE
- **GitHub Pages** : hébergement statique gratuit
- **HTML5 / CSS3 / JavaScript** : zéro framework, zéro build

---

## Installation locale

    git clone https://github.com/gunout/iss-passes.git
    cd iss-passes
    python3 -m http.server 8000

Puis ouvrir **http://localhost:8000**

**Important** : ne pas ouvrir `index.html` directement en `file://` — le `fetch()` serait bloqué par CORS.

---

## Personnalisation

| Paramètre | Fichier | Description |
|---|---|---|
| COLS / ROWS | index.html | Résolution carte ASCII |
| MIN_ELEV | index.html | Élévation minimale (degrés) |
| HOURS_WINDOW | index.html | Fenêtre de prévision (heures) |
| TRACK_MAX | index.html | Longueur de la trace ISS |
| MARKERS | index.html | Villes affichées sur la carte |
| observer | index.html | Position par défaut de l'observateur |

---

## Contribution

Les contributions sont les bienvenues.

1. Fork le projet
2. Créer une branche : `git checkout -b feat/ma-fonctionnalite`
3. Commiter : `git commit -m "feat: ajout de ma fonctionnalité"`
4. Pousser : `git push origin feat/ma-fonctionnalite`
5. Ouvrir une Pull Request

### Convention de commits

- `feat` : nouvelle fonctionnalité
- `fix` : correction de bug
- `docs` : documentation
- `style` : formatage
- `refactor` : refactorisation
- `chore` : maintenance
- `ci` : intégration continue

---

## Signaler un bug

Ouvrir une issue : **https://github.com/gunout/iss-passes/issues**

Merci de préciser :

- Navigateur et version
- Système d'exploitation
- Étapes pour reproduire
- Message d'erreur (console F12)
- Capture d'écran si possible

---

## Licence

Ce projet est sous licence **MIT**. Voir le fichier [LICENSE](LICENSE) pour plus de détails.

---

## Remerciements

- **Celestrak** : TLE publics
- **satellite.js** : propagateur SGP4
- **Natural Earth** : données géographiques
- **NASA Spot the Station** : inspiration
- **Communauté open source**

---

<div align="center">

**Liberté · Égalité · Fraternité**

République Française — Ministère de l'Enseignement supérieur et de la Recherche

**© 2025 · CELLULE ORBITALE · gunout**

</div>

---

<div align="center">

### 🇫🇷 Gunout · 2026

![Made in France](https://img.shields.io/badge/Made_in-France-002395?style=flat-square&labelColor=FFFFFF&logo=data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA5MDAgNjAwIj48cmVjdCB3aWR0aD0iOTAwIiBoZWlnaHQ9IjYwMCIgZmlsbD0iIzAwMjM5NSIvPjxyZWN0IHdpZHRoPSI5MDAiIGhlaWdodD0iNDAwIiB5PSIxMDAiIGZpbGw9IiNmZmYiLz48cmVjdCB3aWR0aD0iOTAwIiBoZWlnaHQ9IjIwMCIgeT0iNDAwIiBmaWxsPSIjZWQyOTM5Ii8+PC9zdmc+)
![GitHub](https://img.shields.io/badge/GitHub-gunout-181717?style=flat-square&logo=github&logoColor=white)
![Year](https://img.shields.io/badge/2026-ED2939?style=flat-square&labelColor=FFFFFF)

<sub>© 2026 <strong>Gunout</strong> — Tous droits réservés.</sub>

</div>
