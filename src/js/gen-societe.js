  window.generateSociete = function(silent) {
    var societe = val('societe');
    var siren = val('siren');
    var domSoc = val('domaineSociete');
    var emailsSoc = list('emailsSociete');
    var telsSoc = list('telephonesSociete');
    var secteur = val('secteur');
    var ville = val('villeSociete');
    var excl = list('societeSociete');

    if (!societe) { if (silent) return null; showToast('Remplissez au moins le nom de la société.'); return; }

    var socQ = '"' + societe + '"';
    var exclQ = excl.map(function(s) { return '-site:' + s; }).join(' ');
    var locQ = ville ? '("' + ville + '")' : '';
    var categories = [];

    // ── 0. TOUT-EN-UN ──
    var aioS = [];
    aioS.push(socQ + ' (site:linkedin.com OR site:pappers.fr OR site:societe.com OR site:infogreffe.fr)' + (locQ ? ' ' + locQ : ''));
    aioS.push(socQ + ' (intext:"dirigeant" OR intext:"président" OR intext:"directeur" OR intext:"CEO" OR intext:"DG")');
    aioS.push(socQ + ' (filetype:pdf OR filetype:xlsx OR filetype:doc) (intext:"bilan" OR intext:"rapport" OR intext:"résultat")');
    if (domSoc) aioS.push('site:' + domSoc + ' (filetype:env OR filetype:sql OR filetype:log OR inurl:admin OR inurl:login)');
    categories.push({ icon: '🚀', title: 'TOUT-EN-UN — Scan société', dorks: aioS });

    // ── 1. Identité légale ──
    var legalD = [
      socQ + ' (site:pappers.fr OR site:societe.com OR site:infogreffe.fr OR site:verif.com)',
      socQ + ' (site:bodacc.fr OR site:journal-officiel.gouv.fr)',
      socQ + ' (intext:"SIREN" OR intext:"SIRET" OR intext:"RCS" OR intext:"TVA intracommunautaire")',
      socQ + ' (intext:"capital social" OR intext:"siège social" OR intext:"forme juridique")',
    ];
    if (siren) {
      legalD.push('"' + siren + '" (site:pappers.fr OR site:societe.com OR site:infogreffe.fr)');
      var sirenDigits = siren.replace(/\s/g, '');
      if (sirenDigits.length > 9) legalD.push('"' + sirenDigits + '" OR "' + sirenDigits.slice(0, 9) + '"');
    }
    categories.push({ icon: '⚖️', title: 'Identité légale & registres', dorks: legalD });

    // ── 2. Dirigeants & contacts ──
    var dirgD = [
      socQ + ' (intext:"président" OR intext:"directeur général" OR intext:"PDG" OR intext:"CEO" OR intext:"DG" OR intext:"gérant")',
      socQ + ' (intext:"fondateur" OR intext:"co-fondateur" OR intext:"founder")',
      socQ + ' (intext:"conseil d\'administration" OR intext:"comité de direction" OR intext:"board")',
      socQ + ' (intext:"contact" OR intext:"email" OR intext:"téléphone") (site:annuaire-entreprises.fr OR site:societe.com)',
    ];
    if (domSoc) {
      dirgD.push('"@' + domSoc + '" (intext:"CEO" OR intext:"directeur" OR intext:"président")');
      dirgD.push('site:linkedin.com "' + societe + '" (intext:"directeur" OR intext:"president" OR intext:"founder")');
    }
    categories.push({ icon: '👔', title: 'Dirigeants & contacts', dorks: dirgD });

    // ── 3. Données financières ──
    var finD = [
      socQ + ' (intext:"chiffre d\'affaires" OR intext:"résultat net" OR intext:"bilan" OR intext:"bénéfice")',
      socQ + ' filetype:pdf (intext:"rapport annuel" OR intext:"rapport de gestion" OR intext:"comptes annuels")',
      socQ + ' (site:pappers.fr OR site:infogreffe.fr) (intext:"bilan" OR intext:"compte de résultat")',
      socQ + ' (filetype:xlsx OR filetype:csv) (intext:"budget" OR intext:"prévisionnel" OR intext:"trésorerie")',
    ];
    if (siren) finD.push('"' + siren + '" (intext:"bilan" OR intext:"chiffre d\'affaires" OR intext:"résultat")');
    categories.push({ icon: '💶', title: 'Données financières', dorks: finD });

    // ── 4. Présence web & réseaux sociaux ──
    var socialD = [
      socQ + ' (site:linkedin.com OR site:twitter.com OR site:x.com OR site:facebook.com OR site:instagram.com)',
      socQ + ' site:linkedin.com',
      socQ + ' (site:youtube.com OR site:vimeo.com)',
      socQ + ' (site:glassdoor.fr OR site:glassdoor.com OR site:indeed.fr OR site:welcometothejungle.com)',
    ];
    if (domSoc) socialD.push('site:' + domSoc + ' OR inurl:"' + domSoc + '"');
    categories.push({ icon: '📡', title: 'Présence web & réseaux sociaux', dorks: socialD });

    // ── 5. Offres d'emploi & technos ──
    var jobD = [
      socQ + ' (site:welcometothejungle.com OR site:indeed.fr OR site:apec.fr OR site:pole-emploi.fr OR site:linkedin.com/jobs)',
      socQ + ' (intext:"offre d\'emploi" OR intext:"nous recrutons" OR intext:"CDI" OR intext:"CDD")',
      socQ + ' (inurl:jobs OR inurl:careers OR inurl:recrutement OR inurl:offres)',
    ];
    if (domSoc) {
      jobD.push('site:' + domSoc + ' (inurl:jobs OR inurl:careers OR inurl:recrutement)');
      jobD.push('"' + societe + '" (intext:"stack" OR intext:"technologies" OR intext:"kubernetes" OR intext:"AWS" OR intext:"Azure")');
    }
    categories.push({ icon: '💼', title: 'Offres d\'emploi & stack technique', dorks: jobD });

    // ── 6. Presse & réputation ──
    var pressD = [
      socQ + ' (site:lefigaro.fr OR site:lemonde.fr OR site:lesechos.fr OR site:bfmtv.com OR site:challenges.fr)',
      socQ + ' (site:latribune.fr OR site:capital.fr OR site:lentreprise.lexpress.fr)',
      socQ + ' (intext:"scandale" OR intext:"fraude" OR intext:"litige" OR intext:"condamné" OR intext:"plainte")',
      socQ + ' (intext:"faillite" OR intext:"liquidation" OR intext:"redressement judiciaire" OR intext:"procédure collective")',
    ];
    if (secteur) pressD.push(socQ + ' "' + secteur + '" (site:lefigaro.fr OR site:lesechos.fr OR site:latribune.fr)');
    categories.push({ icon: '📰', title: 'Presse & réputation', dorks: pressD });

    // ── 7. Documents exposés ──
    var docsD = [
      socQ + ' (filetype:pdf OR filetype:doc OR filetype:pptx)',
      socQ + ' filetype:pdf (intext:"confidentiel" OR intext:"interne" OR intext:"usage interne")',
      socQ + ' (filetype:xlsx OR filetype:csv) (intext:"client" OR intext:"prospect" OR intext:"devis")',
      socQ + ' filetype:pptx (intext:"stratégie" OR intext:"roadmap" OR intext:"plan")',
    ];
    if (domSoc) docsD.push('site:' + domSoc + ' (filetype:pdf OR filetype:doc OR filetype:xlsx)');
    categories.push({ icon: '📄', title: 'Documents exposés', dorks: docsD });

    // ── 8. Fuites & pastebins ──
    var leakD = [
      socQ + ' (site:pastebin.com OR site:ghostbin.com OR site:rentry.co OR site:justpaste.it)',
      socQ + ' (site:github.com OR site:gitlab.com OR site:gist.github.com)',
      socQ + ' (intext:"password" OR intext:"credentials" OR intext:"api_key" OR intext:"token") site:github.com',
    ];
    if (domSoc) {
      leakD.push('"@' + domSoc + '" (site:pastebin.com OR site:github.com OR site:gitlab.com)');
      leakD.push('"' + domSoc + '" (intext:"password" OR intext:"breach" OR intext:"leak") (site:pastebin.com OR site:github.com)');
    }
    categories.push({ icon: '💀', title: 'Fuites & expositions', dorks: leakD });

    // ── 9. Infrastructure technique ──
    if (domSoc) {
      var infraD = [
        'site:' + domSoc,
        'site:*.' + domSoc.replace(/^www\./, ''),
        '"' + domSoc + '" (site:shodan.io OR site:censys.io OR site:crt.sh)',
        'site:' + domSoc + ' (inurl:admin OR inurl:login OR inurl:dashboard OR inurl:api)',
        'site:' + domSoc + ' (filetype:env OR filetype:sql OR filetype:log OR filetype:bak)',
      ];
      categories.push({ icon: '🖥️', title: 'Infrastructure technique', dorks: infraD });
    }

    // ── 10. Localisation & localité ──
    if (ville) {
      var locD = [
        socQ + ' "' + ville + '"',
        socQ + ' "' + ville + '" (site:pagesjaunes.fr OR site:societe.com OR site:verif.com)',
        socQ + ' "' + ville + '" (intext:"adresse" OR intext:"siège" OR intext:"locaux")',
      ];
      if (secteur) locD.push(socQ + ' "' + ville + '" "' + secteur + '"');
      categories.push({ icon: '📍', title: 'Localisation', dorks: locD });
    }

    // ── Emails connus ──
    if (emailsSoc.length > 0) {
      var emailSocQ = emailsSoc.map(function(e) { return '"' + e + '"'; }).join(' OR ');
      categories.push({ icon: '📧', title: 'Emails connus — recherche directe', dorks: [
        '(' + emailSocQ + ')',
        '(' + emailSocQ + ') ' + socQ,
        '(' + emailSocQ + ') (intext:"password" OR intext:"leak" OR intext:"breach") (site:pastebin.com OR site:github.com OR site:dehashed.com)',
        '(' + emailSocQ + ') (site:linkedin.com OR site:twitter.com OR site:facebook.com)',
      ]});
    }

    // ── Téléphones connus ──
    if (telsSoc.length > 0) {
      var telSocQ = telsSoc.map(function(t) {
        return phoneVariants(t).map(function(v) { return '"' + v + '"'; }).join(' OR ');
      }).join(' OR ');
      categories.push({ icon: '📞', title: 'Téléphones connus — recherche directe', dorks: [
        '(' + telSocQ + ')',
        '(' + telSocQ + ') ' + socQ,
        '(' + telSocQ + ') (site:pagesjaunes.fr OR site:118712.fr OR site:societe.com OR site:verif.com)',
      ]});
    }

    if (exclQ) {
      categories.forEach(function(cat) {
        cat.dorks = cat.dorks.map(function(d) { return d + ' ' + exclQ; });
      });
    }

    // ── Liens directs (registres + outils pré-remplis) ──
    var sLinks = societeLinks(societe, siren, domSoc);
    if (sLinks.length) {
      categories.push({
        icon: '🔗', title: 'Liens directs — registres',
        desc: 'Pappers, Annuaire entreprises, BODACC… pré-remplis — ouvre directement',
        links: sLinks
      });
    }

    if (silent) return { categories: categories, values: [societe, siren].filter(Boolean) };
    renderResults(categories);
  };
