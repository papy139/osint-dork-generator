# Changelog

Toutes les évolutions notables de ce projet sont documentées dans ce fichier.

Le format s'inspire de [Keep a Changelog](https://keepachangelog.com/fr/1.1.0/),
et le projet suit le [versionnage sémantique](https://semver.org/lang/fr/).

## [1.0.0] — 2026-05-30

Première version stable.

### Recherche
- Sept contextes : identité, pseudonyme, domaine / IP, société, image,
  corrélation, champs personnalisés.
- Génération de Google Dorks en syntaxe canonique, ouverture adaptée à Google,
  DuckDuckGo ou Yandex.
- Liens directs vers les profils (style Sherlock) et les outils OSINT
  (crt.sh, Shodan, VirusTotal, Pappers, registres…).
- Commandes Sherlock / Maigret prêtes à copier pour la vérification réseau.
- Recoupement d'identifiants (nom × pseudo × email × domaine × société × ville).
- Recherche par image : recherche inversée par URL et import d'image
  (hébergement temporaire), moteurs de recherche de visages.
- Normalisation des domaines et des numéros, variantes de pseudos
  (séparateurs, leet, homoglyphes), menus régions / départements / pays.

### Enquête
- Tableau de bord de couverture (sources vérifiées par catégorie), priorisation
  des pistes et suggestion de prochaine étape.
- Cases « vérifié » persistantes sur chaque résultat.
- Palette de commandes (`Ctrl/Cmd + K`).

### Export / import
- Export multi-format des résultats : TXT, Markdown, HTML, JSON, CSV, SQL
  (état « vérifié » inclus).
- Archive ZIP de toutes les recherches, lien partageable, import / export JSON
  des cibles.

### Interface
- Bilingue FR / EN (détection de la langue du navigateur + bascule).
- Thèmes clair / sombre, design responsive, accessibilité (rôles ARIA, focus
  clavier visible, `prefers-reduced-motion`).

### Qualité
- Architecture compartimentée sous `src/`, build sans dépendance (`build.js`).
- Suite de tests sans dépendance et intégration continue (GitHub Actions) avec
  garde anti-désynchronisation du fichier généré.

[1.0.0]: https://github.com/papy139/osint-dork-generator/releases/tag/v1.0.0
