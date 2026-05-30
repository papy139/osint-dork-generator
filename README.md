# OSINT Dork Generator

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

- **Cinq contextes de recherche** : identité, pseudonyme, domaine / IP, société,
  champs personnalisés.
- **Multi-moteurs** : génération en syntaxe Google, ouverture adaptée à Google,
  DuckDuckGo ou Yandex.
- **Liens directs** : URLs prêtes à l'emploi vers les profils et outils OSINT
  (réseaux sociaux par pseudonyme, registres d'entreprises, services d'analyse
  de domaines et d'adresses IP).
- **Export** : copie globale, export `.txt` par contexte, ou archive ZIP
  regroupant tous les contextes remplis.
- **Gestion de cibles** : enregistrement, renommage, import et export JSON des
  formulaires.
- **Filtrage** des résultats, déduplication, normalisation des numéros de
  téléphone, thème clair / sombre.

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
