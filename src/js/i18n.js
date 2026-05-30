  // ═══════════════════════════════════════
  // INTERNATIONALISATION (FR / EN)
  // Détection navigator.language au 1er chargement, bascule via slider,
  // persistance localStorage['dork-lang']. Les éléments [data-i18n] /
  // [data-i18n-ph] sont traduits ; les titres de catégories via CAT_EN.
  // ═══════════════════════════════════════

  var I18N = {
    fr: {
      'app.subtitle': 'Génération de Google Dorks pour l\'audit de l\'empreinte numérique.',
      'tb.engine': 'Moteur', 'tb.target': 'Cible', 'tb.newtarget': '— nouvelle cible —',
      'tb.save': 'Enregistrer', 'tb.rename': 'Renommer', 'tb.delete': 'Supprimer',
      'tb.export': 'Exporter ▾', 'tb.import': 'Importer',
      'tab.identite': 'Identité', 'tab.pseudo': 'Pseudo', 'tab.domaine': 'Domaine / IP',
      'tab.societe': 'Société', 'tab.image': 'Image', 'tab.correlation': 'Corrélation', 'tab.perso': 'Champs perso',
      'f.nom': 'Nom', 'f.prenom': 'Prénom', 'f.dob': 'Date de naissance', 'f.cities': 'Villes / Régions',
      'f.after': 'Résultats après', 'f.emails': 'Emails connus', 'f.before': 'Résultats avant',
      'f.phones': 'Téléphones connus', 'f.variations': 'Variations', 'f.exclude': 'Sites à exclure',
      'f.pseudo': 'Pseudo principal', 'f.platforms': 'Plateformes', 'f.pseudovar': 'Variations du pseudo',
      'f.linkedemails': 'Emails liés', 'f.domain': 'Domaine', 'f.ip': 'Adresse IP',
      'f.company': 'Nom de la société', 'f.siren': 'SIREN / SIRET', 'f.webdomain': 'Domaine web',
      'f.industry': 'Secteur d\'activité', 'f.cityregion': 'Ville / Région', 'f.imgurl': 'URL de l\'image',
      'f.imgimport': 'Ou importer une image',
      'h.opt': '— optionnel', 'h.comma': '— séparés par des virgules', 'h.after': '— after:',
      'h.before': '— before:', 'h.varhint': '— pseudos, formats, séparés par des virgules',
      'h.pseudovarhint': '— anciens pseudos, variantes, séparés par des virgules',
      'h.exdom': '— ex : exemple.com', 'h.imgurl': '— lien direct vers le fichier image',
      'h.imgfile': '— hébergement temporaire pour la recherche par URL',
      'b.genIdent': 'Générer les dorks', 'b.genPseudo': 'Générer les dorks pseudo',
      'b.genDomaine': 'Générer les dorks domaine', 'b.genSociete': 'Générer les dorks société',
      'b.genImage': 'Rechercher par image', 'b.genCorr': 'Générer le recoupement',
      'b.search': 'Rechercher', 'b.clear': 'Clear',
      'co.intro': 'Combine les identifiants saisis dans les autres onglets (nom, pseudo, email, domaine, société, ville) pour générer des requêtes qui les recoupent — utile pour confirmer qu\'ils désignent la même cible. Renseignez au moins deux identifiants.',
      'g.title': 'Rappel des opérateurs', 'g.exact': '— expression exacte', 'g.or': '— l\'un ou l\'autre',
      'g.minus': '— exclure un terme', 'g.site': '— limiter à un domaine', 'g.minussite': '— exclure un domaine',
      'g.intitle': '— dans le titre', 'g.inurl': '— dans l\'URL', 'g.intext': '— dans le contenu',
      'g.filetype': '— type de fichier', 'g.wildcard': '— joker (mot inconnu)', 'g.group': '— grouper des termes',
      'g.range': '— plage de nombres', 'g.oneline': 'Une ligne = un dork.',
      'es.fill': 'Remplissez le formulaire et lancez la génération.',
      'ft.source': 'Code source sur GitHub',
      'ph.nom': 'Nom de famille', 'ph.prenom': 'Prénom', 'ph.cities': 'Ville, région',
      'ph.email': 'adresse@domaine.com', 'ph.phone': 'Numéro de téléphone', 'ph.variations': 'Variante, alias',
      'ph.excl': 'domaine-à-exclure.com', 'ph.pseudo': 'Nom d\'utilisateur', 'ph.platform': 'Plateforme',
      'ph.pseudovar': 'Variante du pseudo', 'ph.domain': 'exemple.com', 'ph.ip': 'Adresse IP',
      'ph.company': 'Raison sociale', 'ph.siren': 'SIREN ou SIRET', 'ph.industry': 'Secteur d\'activité',
      'ph.imgurl': 'https://exemple.com/photo.jpg',
      'r.results': 'résultats', 'r.copyall': 'Tout copier', 'r.exporttxt': 'Exporter .txt',
      'r.reporthtml': 'Rapport HTML', 'r.expand': 'Tout déplier', 'r.collapse': 'Tout replier',
      'r.filter': 'Filtrer…', 'r.copy': 'Copier', 'r.open': 'Ouvrir ↗', 'r.openall': 'Ouvrir tout',
      'r.none': 'Aucun dork généré.',
      'db.coverage': 'Couverture de l\'enquête', 'db.checked': 'vérifiées', 'db.next': 'Prochaine étape',
      'db.prioHigh': 'priorité élevée', 'db.prioMed': 'priorité moyenne', 'db.prioLow': 'priorité faible',
      'db.done': 'Enquête complète — toutes les sources ont été vérifiées.', 'db.verify': 'Marquer comme vérifié',
      'pal.placeholder': 'Rechercher une commande…', 'cmd.gotab': 'Aller à l\'onglet', 'cmd.generate': 'Générer (onglet actuel)',
      'cmd.copyall': 'Tout copier', 'cmd.filter': 'Filtrer les résultats', 'cmd.expand': 'Tout déplier / replier',
      'cmd.zip': 'Exporter en ZIP', 'cmd.share': 'Copier le lien partageable', 'cmd.theme': 'Basculer le thème',
      'cmd.lang': 'Basculer la langue',
      'ex.results': 'Résultats (onglet courant)', 'ex.other': 'Autre',
      'ex.allzip': 'Toutes les recherches (ZIP)', 'ex.targets': 'Cibles sauvegardées (JSON)',
      'ex.link': 'Lien partageable', 'ex.empty': 'Aucun résultat à exporter — lancez une génération.',
      'ex.done': 'Export téléchargé.'
    },
    en: {
      'app.subtitle': 'Generate Google dorks to audit a digital footprint.',
      'tb.engine': 'Engine', 'tb.target': 'Target', 'tb.newtarget': '— new target —',
      'tb.save': 'Save', 'tb.rename': 'Rename', 'tb.delete': 'Delete',
      'tb.export': 'Export ▾', 'tb.import': 'Import',
      'tab.identite': 'Identity', 'tab.pseudo': 'Username', 'tab.domaine': 'Domain / IP',
      'tab.societe': 'Company', 'tab.image': 'Image', 'tab.correlation': 'Correlation', 'tab.perso': 'Custom',
      'f.nom': 'Last name', 'f.prenom': 'First name', 'f.dob': 'Date of birth', 'f.cities': 'Cities / Regions',
      'f.after': 'Results after', 'f.emails': 'Known emails', 'f.before': 'Results before',
      'f.phones': 'Known phone numbers', 'f.variations': 'Variations', 'f.exclude': 'Sites to exclude',
      'f.pseudo': 'Main username', 'f.platforms': 'Platforms', 'f.pseudovar': 'Username variations',
      'f.linkedemails': 'Linked emails', 'f.domain': 'Domain', 'f.ip': 'IP address',
      'f.company': 'Company name', 'f.siren': 'Registration no.', 'f.webdomain': 'Website domain',
      'f.industry': 'Industry', 'f.cityregion': 'City / Region', 'f.imgurl': 'Image URL',
      'f.imgimport': 'Or import an image',
      'h.opt': '— optional', 'h.comma': '— comma-separated', 'h.after': '— after:',
      'h.before': '— before:', 'h.varhint': '— usernames, formats, comma-separated',
      'h.pseudovarhint': '— old usernames, variants, comma-separated',
      'h.exdom': '— e.g. example.com', 'h.imgurl': '— direct link to the image file',
      'h.imgfile': '— temporary hosting for URL-based search',
      'b.genIdent': 'Generate dorks', 'b.genPseudo': 'Generate username dorks',
      'b.genDomaine': 'Generate domain dorks', 'b.genSociete': 'Generate company dorks',
      'b.genImage': 'Search by image', 'b.genCorr': 'Generate correlation',
      'b.search': 'Search', 'b.clear': 'Clear',
      'co.intro': 'Combines the identifiers entered in the other tabs (name, username, email, domain, company, city) into queries that cross-reference them — useful to confirm they point to the same target. Fill in at least two identifiers.',
      'g.title': 'Operators reference', 'g.exact': '— exact phrase', 'g.or': '— either one',
      'g.minus': '— exclude a term', 'g.site': '— restrict to a domain', 'g.minussite': '— exclude a domain',
      'g.intitle': '— in the title', 'g.inurl': '— in the URL', 'g.intext': '— in the content',
      'g.filetype': '— file type', 'g.wildcard': '— wildcard (unknown word)', 'g.group': '— group terms',
      'g.range': '— number range', 'g.oneline': 'One line = one dork.',
      'es.fill': 'Fill in the form and run the generation.',
      'ft.source': 'Source code on GitHub',
      'ph.nom': 'Last name', 'ph.prenom': 'First name', 'ph.cities': 'City, region',
      'ph.email': 'address@domain.com', 'ph.phone': 'Phone number', 'ph.variations': 'Variant, alias',
      'ph.excl': 'domain-to-exclude.com', 'ph.pseudo': 'Username', 'ph.platform': 'Platform',
      'ph.pseudovar': 'Username variant', 'ph.domain': 'example.com', 'ph.ip': 'IP address',
      'ph.company': 'Company name', 'ph.siren': 'Registration number', 'ph.industry': 'Industry',
      'ph.imgurl': 'https://example.com/photo.jpg',
      'r.results': 'results', 'r.copyall': 'Copy all', 'r.exporttxt': 'Export .txt',
      'r.reporthtml': 'HTML report', 'r.expand': 'Expand all', 'r.collapse': 'Collapse all',
      'r.filter': 'Filter…', 'r.copy': 'Copy', 'r.open': 'Open ↗', 'r.openall': 'Open all',
      'r.none': 'No dork generated.',
      'db.coverage': 'Investigation coverage', 'db.checked': 'checked', 'db.next': 'Next step',
      'db.prioHigh': 'high priority', 'db.prioMed': 'medium priority', 'db.prioLow': 'low priority',
      'db.done': 'Investigation complete — all sources have been checked.', 'db.verify': 'Mark as checked',
      'pal.placeholder': 'Search a command…', 'cmd.gotab': 'Go to tab', 'cmd.generate': 'Generate (current tab)',
      'cmd.copyall': 'Copy all', 'cmd.filter': 'Filter results', 'cmd.expand': 'Expand / collapse all',
      'cmd.zip': 'Export as ZIP', 'cmd.share': 'Copy shareable link', 'cmd.theme': 'Toggle theme',
      'cmd.lang': 'Toggle language',
      'ex.results': 'Results (current tab)', 'ex.other': 'Other',
      'ex.allzip': 'All searches (ZIP)', 'ex.targets': 'Saved targets (JSON)',
      'ex.link': 'Shareable link', 'ex.empty': 'No results to export — run a generation first.',
      'ex.done': 'Export downloaded.'
    }
  };

  // Traduction EN des titres de catégories (clé = libellé FR émis par les générateurs)
  var CAT_EN = {
    'TOUT-EN-UN — Scan global': 'ALL-IN-ONE — Global scan',
    'TOUT-EN-UN — Scan pseudo': 'ALL-IN-ONE — Username scan',
    'TOUT-EN-UN — Scan infrastructure': 'ALL-IN-ONE — Infrastructure scan',
    'TOUT-EN-UN — Scan société': 'ALL-IN-ONE — Company scan',
    'Recherche générale': 'General search', 'Avec localisation': 'With location',
    'Avec dates': 'With dates', 'Combinaison complète': 'Full combination',
    'intitle: — Titres de pages': 'intitle: — Page titles', 'intext: — Corps des pages': 'intext: — Page body',
    'inurl: — Dans les URLs': 'inurl: — In URLs', 'Documents exposés': 'Exposed documents',
    'Réseaux sociaux': 'Social networks', 'Fuites / Pastebins': 'Leaks / Pastebins',
    'Email leaks': 'Email leaks', 'Credentials / Données sensibles': 'Credentials / Sensitive data',
    'Bases de données de fuites': 'Breach databases', 'Forums & discussions': 'Forums & discussions',
    'Profils & comptes utilisateur': 'User profiles & accounts', 'Profils & comptes': 'Profiles & accounts',
    'Code & dépôts': 'Code & repositories', 'Archives web': 'Web archives',
    'Images & médias': 'Images & media', 'Annuaires & pages blanches': 'Directories & white pages',
    'Métadonnées de fichiers': 'File metadata', 'Numéros de téléphone': 'Phone numbers',
    'Emails connus — recherche directe': 'Known emails — direct search', 'Date de naissance': 'Date of birth',
    'Avec exclusions': 'With exclusions', 'Liens directs — recherche': 'Direct links — search',
    'Liens directs — téléphone': 'Direct links — phone', 'Gaming & eSport': 'Gaming & eSports',
    'Checkers de pseudos': 'Username checkers', 'Plateformes spécifiques': 'Specific platforms',
    'Telegram & messageries': 'Telegram & messaging', 'Emails liés — recherche directe': 'Linked emails — direct search',
    'Liens directs — profils': 'Direct links — profiles', 'Commandes CLI — vérification réseau': 'CLI commands — network check',
    'Reconnaissance générale': 'General reconnaissance', 'Sous-domaines': 'Subdomains',
    'Fichiers sensibles exposés': 'Exposed sensitive files', 'Panneaux d\'administration': 'Admin panels',
    'Listing de répertoires': 'Directory listing', 'Erreurs & debug': 'Errors & debug',
    'APIs & endpoints': 'APIs & endpoints', 'Fuites & expositions': 'Leaks & exposure',
    'Adresse IP': 'IP address', 'Technologies & CMS': 'Technologies & CMS', 'Liens directs — outils': 'Direct links — tools',
    'Identité légale & registres': 'Legal identity & registries', 'Dirigeants & contacts': 'Executives & contacts',
    'Données financières': 'Financial data', 'Présence web & réseaux sociaux': 'Web & social presence',
    'Offres d\'emploi & stack technique': 'Job offers & tech stack', 'Presse & réputation': 'Press & reputation',
    'Infrastructure technique': 'Technical infrastructure', 'Localisation': 'Location',
    'Téléphones connus — recherche directe': 'Known phones — direct search', 'Liens directs — registres': 'Direct links — registries',
    'Recherche inversée — par URL': 'Reverse search — by URL', 'Moteurs à téléversement manuel': 'Manual-upload engines',
    'Recoupement d\'identifiants': 'Identifier correlation', 'Champs perso': 'Custom fields'
  };

  var curLang = 'fr';
  function t(key) {
    var d = I18N[curLang] || I18N.fr;
    return (key in d) ? d[key] : (I18N.fr[key] != null ? I18N.fr[key] : key);
  }
  function tCat(title) { return (curLang === 'en' && CAT_EN[title]) ? CAT_EN[title] : title; }
  function tDesc(desc) { return desc; } // descriptions laissées en français (fallback)

  function applyLang(lang) {
    curLang = (lang === 'en') ? 'en' : 'fr';
    try { localStorage.setItem('dork-lang', curLang); } catch(e) {}
    document.documentElement.setAttribute('lang', curLang);
    document.querySelectorAll('[data-i18n]').forEach(function(el) {
      el.textContent = t(el.getAttribute('data-i18n'));
    });
    document.querySelectorAll('[data-i18n-ph]').forEach(function(el) {
      el.placeholder = t(el.getAttribute('data-i18n-ph'));
    });
    var lt = document.getElementById('langToggle');
    if (lt) lt.checked = (curLang === 'en');
    // Re-rendre les résultats pour traduire les titres de catégories
    if (typeof renderResults === 'function' && renderResults._last) renderResults(renderResults._last);
  }

  window.initI18n = function() {
    var saved = null;
    try { saved = localStorage.getItem('dork-lang'); } catch(e) {}
    var nav = (navigator.language || 'fr').slice(0, 2).toLowerCase();
    applyLang(saved || (nav === 'en' ? 'en' : 'fr'));
    var lt = document.getElementById('langToggle');
    if (lt) lt.addEventListener('change', function() { applyLang(this.checked ? 'en' : 'fr'); });
  };
