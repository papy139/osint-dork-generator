# OSINT Dork Generator

[![CI](https://github.com/papy139/osint-dork-generator/actions/workflows/ci.yml/badge.svg)](https://github.com/papy139/osint-dork-generator/actions/workflows/ci.yml)

Générateur de Google Dorks pour l'audit d'empreinte numérique. Application
autonome, en un seul fichier HTML, sans dépendance ni serveur : elle s'ouvre
directement dans un navigateur.

## Avertissement légal

Cet outil est destiné à un usage **légitime et autorisé** uniquement : audit de
votre propre empreinte numérique, recherche en source ouverte dans un cadre
autorisé, tests de sécurité avec accord préalable. L'utilisateur est seul
responsable du respect des lois et réglementations applicables (notamment en
matière de vie privée et de protection des données). Les requêtes générées ne
font qu'assembler une syntaxe de recherche publique ; aucune donnée n'est
collectée ni transmise par l'application.

## Fonctionnalités

- **Sept contextes de recherche** : identité, pseudonyme, domaine / IP, société,
  image, corrélation, champs personnalisés.
- **Recoupement d'identifiants** : combine nom, pseudo, email, domaine, société
  et ville en requêtes croisées pour confirmer qu'ils visent la même cible.
- **Recherche par image** : recherche inversée à partir de l'URL d'une image
  (Google Lens, Yandex, Bing, TinEye…) et accès aux moteurs de recherche de
  visages à téléversement manuel.
- **Multi-moteurs** : génération en syntaxe Google, ouverture adaptée à Google,
  DuckDuckGo ou Yandex.
- **Liens directs** : URLs prêtes à l'emploi vers les profils et outils OSINT
  (réseaux sociaux par pseudonyme, registres d'entreprises, services d'analyse
  de domaines et d'adresses IP).
- **Commandes CLI** : génération de commandes Sherlock / Maigret pour la
  vérification réseau réelle de l'existence des comptes.
- **Export** : copie globale, export `.txt`, rapport HTML autonome (liens
  cliquables), ou archive ZIP regroupant tous les contextes remplis.
- **Gestion de cibles** : enregistrement, renommage, import et export JSON des
  formulaires.
- **Lien partageable** : formulaire encodé dans l'URL pour rejouer une recherche.
- **Confort** : filtrage et surlignage des résultats, déduplication, copie par
  catégorie, menus déroulants régions / départements / pays (avec drapeaux),
  normalisation des domaines et des numéros, raccourcis clavier (`Alt+1` à
  `Alt+7`), thème clair / sombre, focus clavier visible.

## Utilisation

Ouvrir `dork-generator.html` dans un navigateur :

```bash
xdg-open dork-generator.html    # Linux
# ou ouvrir le fichier par double-clic
```

Aucun serveur ni installation n'est requis.

## Build

Le fichier `dork-generator.html` est **généré** à partir des sources de `src/`
par un script sans dépendance :

```bash
node build.js
```

`build.js` concatène le HTML, le CSS et les fragments JavaScript de `src/` en un
seul fichier autonome. Ne pas modifier `dork-generator.html` directement :
éditer les sources puis relancer le build.

Les fonctions pures sont couvertes par une suite de tests sans dépendance :

```bash
npm test    # ou : node tests/run.js
```

## Structure des sources

```
src/
├── head.html        # en-tête HTML
├── style.css        # styles
├── body.html        # structure de l'interface
└── js/              # fragments d'une IIFE partagée (non des modules ES)
    ├── helpers.js     # utilitaires, moteurs, construction de requêtes
    ├── links.js       # liens directs (profils et outils OSINT)
    ├── render.js      # rendu des résultats et interactions
    ├── zip.js         # export ZIP (écriture pure JavaScript)
    ├── gen-*.js       # un générateur par contexte
    └── app.js         # initialisation, persistance, gestion des cibles
```

L'ensemble du JavaScript s'exécute dans une seule IIFE afin de fonctionner en
`file://` sans serveur ni problème de CORS.

## Licence

Distribué sous licence MIT. Voir le fichier [LICENSE](LICENSE).
