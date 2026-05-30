  window.generate = function(silent) {
    var nom = val('nom');
    var prenom = val('prenom');
    var variations = list('variations');
    var emailsConnus = list('emails');
    var telephonesConnus = list('telephones');
    var dateNaissance = val('dateNaissance');
    var villes = list('villes');
    var dateDebut = val('dateDebut');
    var dateFin = val('dateFin');
    var exclusions = list('exclusions');

    if (!nom && !prenom && variations.length === 0) {
      if (silent) return null;
      showToast('Remplissez au moins le nom ou le prénom.');
      return;
    }

    var nameQ = buildNameQuery(nom, prenom, variations);
    var locQ = buildLocationQuery(villes);
    var dateQ = buildDateQuery(dateDebut, dateFin);
    var exclQ = buildExclusions(exclusions);
    var allVar = buildAllVariations(nom, prenom, variations);
    var emailVar = buildEmailVariations(nom, prenom);

    // Combo query
    var comboParts = ['(' + nameQ + ')'];
    if (villes.length > 0) comboParts.push('(' + locQ + ')');
    if (dateQ) comboParts.push(dateQ);
    var comboQ = comboParts.join(' ');

    var categories = [];

    // ── 0. TOUT-EN-UN ──
    var aioparts = [];
    // Nom + variations
    aioparts.push('(' + nameQ + ')');
    // Localisation
    if (villes.length > 0) aioparts.push('(' + locQ + ')');
    // Dates
    if (dateQ) aioparts.push(dateQ);
    // Exclusions
    if (exclusions.length > 0) aioparts.push(exclQ);

    var aioDorks = [];

    // Version de base maximale
    var aioBase = aioparts.join(' ');

    // Tout-en-un : sites sensibles + filetypes
    var aioSites = [
      'site:linkedin.com', 'site:github.com', 'site:facebook.com',
      'site:twitter.com', 'site:x.com', 'site:instagram.com',
      'site:reddit.com', 'site:pastebin.com', 'site:ghostbin.com',
      'site:rentry.co', 'site:justpaste.it', 'site:web.archive.org'
    ].join(' OR ');
    var aioFileTypes = 'filetype:pdf OR filetype:doc OR filetype:docx OR filetype:xlsx OR filetype:csv OR filetype:pptx';

    // Dork 1 : nom + tous les sites clés
    aioDorks.push(aioBase + ' (' + aioSites + ')');

    // Dork 2 : nom + tous les filetypes
    aioDorks.push(aioBase + ' (' + aioFileTypes + ')');

    // Dork 3 : intitle + intext + inurl combinés (top 2 variations)
    if (nom && prenom) {
      var fullName = prenom + ' ' + nom;
      aioDorks.push(
        '(intitle:"' + fullName + '" OR intext:"' + fullName + '" OR inurl:"' + (prenom + nom).toLowerCase() + '")'
        + (villes.length > 0 ? ' (' + locQ + ')' : '')
        + (dateQ ? ' ' + dateQ : '')
        + (exclusions.length > 0 ? ' ' + exclQ : '')
      );
    }

    // Dork 4 : emails + credentials en une passe
    if (emailVar.length > 0) {
      var topEmailQ = emailVar.slice(0, 3).map(function(v) { return 'intext:"' + v + '@"'; }).join(' OR ');
      aioDorks.push('(' + topEmailQ + ') (intext:"password" OR intext:"leak" OR intext:"dump" OR intext:"breach")');
    }

    // Dork 5 : toutes les variations en intext, max coverage
    if (allVar.length > 0) {
      var intextAll = allVar.slice(0, 3).map(function(v) { return 'intext:"' + v + '"'; }).join(' OR ');
      aioDorks.push('(' + intextAll + ')'
        + (exclusions.length > 0 ? ' ' + exclQ : '')
      );
    }

    categories.push({
      icon: '🚀', title: 'TOUT-EN-UN — Scan global', dorks: aioDorks
    });

    // ── 1. Recherche générale ──
    categories.push({
      icon: '🔍', title: 'Recherche générale', dorks: [nameQ]
    });

    // ── 2. Avec localisation ──
    if (villes.length > 0) {
      categories.push({
        icon: '📍', title: 'Avec localisation',
        dorks: ['(' + nameQ + ') (' + locQ + ')']
      });
    }

    // ── 3. Avec dates ──
    if (dateDebut || dateFin) {
      categories.push({
        icon: '📅', title: 'Avec dates',
        dorks: [nameQ + ' ' + dateQ]
      });
    }

    // ── 4. Combinaison complète ──
    if (villes.length > 0 || dateQ) {
      categories.push({
        icon: '⚡', title: 'Combinaison complète',
        dorks: [comboQ]
      });
    }

    // ── 5. intitle: — Nom dans les titres de pages ──
    var intitleDorks = [];
    if (nom && prenom) {
      intitleDorks.push('intitle:"' + prenom + ' ' + nom + '"');
      intitleDorks.push('intitle:"' + nom + '" intitle:"' + prenom + '"');
    } else if (nom) {
      intitleDorks.push('intitle:"' + nom + '"');
    }
    if (allVar.length > 0) {
      intitleDorks.push(allVar.slice(0, 4).map(function(v) { return 'intitle:"' + v + '"'; }).join(' OR '));
    }
    categories.push({
      icon: '🏷️', title: 'intitle: — Titres de pages', desc: 'Pages dont le titre HTML contient le nom — souvent des profils, annuaires, articles de presse', dorks: intitleDorks
    });

    // ── 6. intext: — Nom dans le corps des pages ──
    var intextDorks = [];
    if (nom && prenom) {
      intextDorks.push('intext:"' + prenom + ' ' + nom + '"');
      if (villes.length > 0) {
        intextDorks.push('intext:"' + prenom + ' ' + nom + '" (' + locQ + ')');
      }
      intextDorks.push('intext:"' + prenom + ' ' + nom + '" (intext:"email" OR intext:"contact" OR intext:"tel" OR intext:"phone")');
      intextDorks.push('intext:"' + prenom + ' ' + nom + '" (intext:"cv" OR intext:"resume" OR intext:"curriculum")');
    }
    if (allVar.length > 0) {
      intextDorks.push(allVar.slice(0, 4).map(function(v) { return 'intext:"' + v + '"'; }).join(' OR '));
    }
    categories.push({
      icon: '📝', title: 'intext: — Corps des pages', desc: 'Pages qui mentionnent le nom dans leur contenu — forums, commentaires, documents, annuaires', dorks: intextDorks
    });

    // ── 7. inurl: — Nom dans les URLs ──
    var inurlDorks = [];
    if (allVar.length > 0) {
      inurlDorks.push(allVar.slice(0, 4).map(function(v) { return 'inurl:"' + v + '"'; }).join(' OR '));
    }
    if (nom && prenom) {
      inurlDorks.push('inurl:"' + prenom.toLowerCase() + '" inurl:"' + nom.toLowerCase() + '"');
    }
    categories.push({
      icon: '🔗', title: 'inurl: — Dans les URLs', desc: 'Pages dont l\'URL contient le nom — révèle des comptes, profils ou espaces personnels indexés', dorks: inurlDorks
    });

    // ── 8. Documents exposés ──
    var fileTypes = 'filetype:pdf OR filetype:doc OR filetype:docx OR filetype:xlsx OR filetype:pptx OR filetype:csv';
    var docDorks = [
      comboQ + ' (' + fileTypes + ')',
      nameQ + ' filetype:pdf',
      nameQ + ' (filetype:xlsx OR filetype:csv)',
      nameQ + ' (filetype:doc OR filetype:docx)',
    ];
    if (nom && prenom) {
      docDorks.push('intext:"' + prenom + ' ' + nom + '" filetype:pdf');
      docDorks.push('intitle:"' + prenom + ' ' + nom + '" (filetype:pdf OR filetype:doc)');
    }
    categories.push({
      icon: '📄', title: 'Documents exposés', dorks: docDorks
    });

    // ── 9. Réseaux sociaux ──
    var socialSites = [
      'site:linkedin.com', 'site:github.com', 'site:facebook.com',
      'site:twitter.com', 'site:x.com', 'site:instagram.com',
      'site:reddit.com', 'site:tiktok.com', 'site:medium.com',
      'site:mastodon.social', 'site:bsky.app'
    ];
    var socialDorks = [
      nameQ + ' (' + socialSites.join(' OR ') + ')'
    ];
    // Dorks individuels par réseau pour les plus importants
    ['linkedin.com', 'github.com', 'facebook.com', 'twitter.com', 'instagram.com', 'reddit.com'].forEach(function(s) {
      socialDorks.push(nameQ + ' site:' + s);
    });
    if (nom && prenom) {
      socialDorks.push('inurl:"' + (prenom + '-' + nom).toLowerCase() + '" (' + socialSites.slice(0, 5).join(' OR ') + ')');
      socialDorks.push('intitle:"' + prenom + ' ' + nom + '" (' + socialSites.slice(0, 5).join(' OR ') + ')');
    }
    categories.push({
      icon: '👤', title: 'Réseaux sociaux', dorks: socialDorks
    });

    // ── 10. Fuites / Pastebins ──
    var pastebinSites = SITES.paste;
    var leakDorks = [
      nameQ + ' (' + pastebinSites + ')',
    ];
    if (allVar.length > 0) {
      var pasteVarQ = allVar.slice(0, 4).map(function(v) { return '"' + v + '"'; }).join(' OR ');
      leakDorks.push('(' + pasteVarQ + ') (' + pastebinSites + ')');
    }
    categories.push({
      icon: '⚠️', title: 'Fuites / Pastebins', dorks: leakDorks
    });

    // ── 11. Email leaks ──
    if (emailVar.length > 0) {
      var emailDorks = [];
      var emailQ = emailVar.slice(0, 4).map(function(v) { return 'intext:"' + v + '@"'; }).join(' OR ');
      emailDorks.push(emailQ);
      var emailQTop = '(' + emailVar.slice(0, 3).map(function(v) { return 'intext:"' + v + '@"'; }).join(' OR ') + ')';
      emailDorks.push(emailQTop + ' (site:pastebin.com OR site:ghostbin.com OR site:rentry.co OR site:justpaste.it)');
      emailDorks.push(emailQTop + ' (site:haveibeenpwned.com OR site:dehashed.com OR site:intelx.io OR site:breachdirectory.org)');
      categories.push({
        icon: '📧', title: 'Email leaks',
        desc: 'Recherche toute adresse email construite à partir du nom — capte Gmail, Outlook, Proton, etc. en une seule requête',
        dorks: emailDorks
      });
    }

    // ── 12. Credentials / Données sensibles ──
    var credDorks = [];
    if (nom && prenom) {
      credDorks.push('"' + prenom + ' ' + nom + '" (intext:"password" OR intext:"mot de passe" OR intext:"passwd" OR intext:"pwd")');
      credDorks.push('"' + prenom + ' ' + nom + '" (intext:"username" OR intext:"login" OR intext:"identifiant")');
      credDorks.push('"' + prenom + ' ' + nom + '" (intext:"ssn" OR intext:"numéro de sécurité sociale" OR intext:"date de naissance")');
      credDorks.push('"' + prenom + ' ' + nom + '" (intext:"api_key" OR intext:"apikey" OR intext:"secret" OR intext:"token")');
    }
    if (allVar.length > 0) {
      var credVarQ = allVar.slice(0, 3).map(function(v) { return '"' + v + '"'; }).join(' OR ');
      credDorks.push('(' + credVarQ + ') (intext:"password" OR intext:"mot de passe" OR intext:"leak")');
    }
    categories.push({
      icon: '🔐', title: 'Credentials / Données sensibles',
      desc: 'Cherche des pages contenant le nom associé à des mots-clés comme "password", "login" ou "token" — indique une exposition dans des fichiers ou dumps',
      dorks: credDorks
    });

    // ── 13. Breach databases / have-i-been-pwned style ──
    var breachSites = SITES.breach;
    var breachDorks = [nameQ + ' (' + breachSites + ')'];
    if (emailVar.length > 0) {
      var breachEmailQ = '(' + emailVar.slice(0, 3).map(function(v) { return 'intext:"' + v + '@"'; }).join(' OR ') + ')';
      breachDorks.push(breachEmailQ + ' (' + breachSites + ')');
    }
    categories.push({
      icon: '💀', title: 'Bases de données de fuites',
      desc: 'Recherche directement sur HaveIBeenPwned, Dehashed et IntelX si le nom ou les emails apparaissent dans des fuites connues',
      dorks: breachDorks
    });

    // ── 14. Forums & discussions ──
    var forumDorks = [
      nameQ + ' (inurl:forum OR inurl:thread OR inurl:topic OR inurl:viewtopic)',
      nameQ + ' (site:forums.commentcamarche.net OR site:forum.hardware.fr OR site:jeuxvideo.com OR site:reddit.com)',
      nameQ + ' (site:stackoverflow.com OR site:stackexchange.com OR site:superuser.com)',
      nameQ + ' (site:quora.com OR site:answers.microsoft.com)',
    ];
    if (nom && prenom) {
      forumDorks.push('intext:"' + prenom + ' ' + nom + '" (inurl:forum OR inurl:thread OR inurl:discussion)');
      forumDorks.push('intext:"' + prenom + ' ' + nom + '" (inurl:profile OR inurl:member OR inurl:user)');
    }
    categories.push({
      icon: '💬', title: 'Forums & discussions', dorks: forumDorks
    });

    // ── 15. Profils & comptes ──
    var profileDorks = [];
    allVar.slice(0, 3).forEach(function(v) {
      profileDorks.push('inurl:"/user/' + v + '" OR inurl:"/profile/' + v + '" OR inurl:"/u/' + v + '" OR inurl:"/member/' + v + '"');
    });
    if (allVar.length > 0) {
      var profInurlQ = allVar.slice(0, 3).map(function(v) { return 'inurl:"/' + v + '"'; }).join(' OR ');
      profileDorks.push('(' + profInurlQ + ') (intitle:"profile" OR intitle:"profil" OR intitle:"user")');
    }
    categories.push({
      icon: '🪪', title: 'Profils & comptes utilisateur', dorks: profileDorks
    });

    // ── 16. Code & repos ──
    var codeSites = SITES.code;
    var codeDorks = [
      nameQ + ' (' + codeSites + ')',
    ];
    if (allVar.length > 0) {
      var codeVarQ = allVar.slice(0, 3).map(function(v) { return '"' + v + '"'; }).join(' OR ');
      codeDorks.push('(' + codeVarQ + ') (' + codeSites + ')');
      var codeInurlQ = allVar.slice(0, 3).map(function(v) { return 'inurl:"' + v + '"'; }).join(' OR ');
      codeDorks.push('(' + codeInurlQ + ') (' + codeSites + ')');
    }
    if (nom && prenom) {
      codeDorks.push('intext:"' + prenom + ' ' + nom + '" (filetype:json OR filetype:yml OR filetype:yaml OR filetype:xml OR filetype:env OR filetype:conf)');
      codeDorks.push('"' + prenom + ' ' + nom + '" (intext:"author" OR intext:"contributor" OR intext:"maintainer") (' + codeSites + ')');
    }
    categories.push({
      icon: '💻', title: 'Code & dépôts', dorks: codeDorks
    });

    // ── 17. Archives web ──
    var archiveDorks = [
      nameQ + ' site:web.archive.org',
    ];
    if (nom && prenom) {
      archiveDorks.push('site:web.archive.org intext:"' + prenom + ' ' + nom + '"');
    }
    if (allVar.length > 0) {
      var archVarQ = allVar.slice(0, 3).map(function(v) { return '"' + v + '"'; }).join(' OR ');
      archiveDorks.push('site:web.archive.org (' + archVarQ + ')');
    }
    archiveDorks.push(nameQ + ' (site:cachedview.nl OR site:archive.org OR site:timetravel.mementoweb.org)');
    categories.push({
      icon: '🏛️', title: 'Archives web', dorks: archiveDorks
    });

    // ── 18. Images & médias ──
    var imageDorks = [
      nameQ + ' (site:flickr.com OR site:imgur.com OR site:500px.com OR site:deviantart.com)',
      nameQ + ' (site:youtube.com OR site:vimeo.com OR site:dailymotion.com)',
    ];
    if (nom && prenom) {
      imageDorks.push('intitle:"' + prenom + ' ' + nom + '" (site:youtube.com OR site:vimeo.com)');
      imageDorks.push('intext:"' + prenom + ' ' + nom + '" (filetype:jpg OR filetype:png OR filetype:jpeg)');
    }
    categories.push({
      icon: '🖼️', title: 'Images & médias', dorks: imageDorks
    });

    // ── 19. Annuaires & pages blanches ──
    var annuaireDorks = [
      nameQ + ' (site:pagesjaunes.fr OR site:118712.fr OR site:infobel.com OR site:societe.com)',
      nameQ + ' (site:verif.com OR site:pappers.fr OR site:infogreffe.fr)',
      nameQ + ' (site:copainsdavant.linternaute.com OR site:trombi.com)',
    ];
    if (villes.length > 0) {
      annuaireDorks.push(nameQ + ' (' + locQ + ') (site:pagesjaunes.fr OR site:118712.fr)');
    }
    categories.push({
      icon: '📇', title: 'Annuaires & pages blanches', dorks: annuaireDorks
    });

    // ── 20. Métadonnées de fichiers ──
    var metaDorks = [];
    if (nom && prenom) {
      metaDorks.push('filetype:pdf intext:"' + prenom + ' ' + nom + '" (intext:"Author" OR intext:"Creator" OR intext:"Producer")');
      metaDorks.push('filetype:docx intext:"' + prenom + ' ' + nom + '"');
      metaDorks.push('filetype:pptx intext:"' + prenom + ' ' + nom + '"');
      metaDorks.push('filetype:xlsx intext:"' + prenom + ' ' + nom + '"');
    }
    if (allVar.length > 0) {
      var metaVarQ = allVar.slice(0, 3).map(function(v) { return 'intext:"' + v + '"'; }).join(' OR ');
      metaDorks.push('filetype:pdf (' + metaVarQ + ')');
    }
    categories.push({
      icon: '🧬', title: 'Métadonnées de fichiers', dorks: metaDorks
    });

    // ── 21. Téléphone ──
    var phoneDorks = [];
    if (nom && prenom) {
      phoneDorks.push('"' + prenom + ' ' + nom + '" (intext:"06" OR intext:"07" OR intext:"+33 6" OR intext:"+33 7")');
      phoneDorks.push('"' + prenom + ' ' + nom + '" (intext:"téléphone" OR intext:"telephone" OR intext:"tel" OR intext:"mobile" OR intext:"portable")');
      phoneDorks.push('"' + prenom + ' ' + nom + '" (intext:"contact" OR intext:"joindre" OR intext:"appeler") (intext:"06" OR intext:"07" OR intext:"+33")');
      phoneDorks.push('intitle:"' + prenom + ' ' + nom + '" (intext:"06" OR intext:"07" OR intext:"+33")');
    }
    if (allVar.length > 0) {
      var phoneVarQ = allVar.slice(0, 3).map(function(v) { return '"' + v + '"'; }).join(' OR ');
      phoneDorks.push('(' + phoneVarQ + ') (intext:"06" OR intext:"07" OR intext:"+33 6" OR intext:"+33 7")');
    }
    phoneDorks.push(nameQ + ' (site:pagesjaunes.fr OR site:118712.fr OR site:annuaire.com) (intext:"06" OR intext:"07")');
    // Numéros connus fournis → dorks directs
    if (telephonesConnus.length > 0) {
      telephonesConnus.forEach(function(t) {
        var q = phoneVariants(t).map(function(v) { return '"' + v + '"'; }).join(' OR ');
        phoneDorks.unshift('(' + q + ')');
        phoneDorks.unshift('(' + q + ') ' + nameQ);
      });
    }
    if (phoneDorks.length > 0) {
      categories.push({
        icon: '📞', title: 'Numéros de téléphone', dorks: phoneDorks
      });
    }

    // ── Emails connus ──
    if (emailsConnus.length > 0) {
      var emailConnuQ = emailsConnus.map(function(e) { return '"' + e + '"'; }).join(' OR ');
      var emailConnuDorks = [
        '(' + emailConnuQ + ')',
        '(' + emailConnuQ + ') (intext:"password" OR intext:"leak" OR intext:"breach" OR intext:"dump")',
        '(' + emailConnuQ + ') (site:pastebin.com OR site:github.com OR site:haveibeenpwned.com OR site:dehashed.com)',
        '(' + emailConnuQ + ') (site:linkedin.com OR site:twitter.com OR site:facebook.com)',
      ];
      if (nom && prenom) emailConnuDorks.push('"' + prenom + ' ' + nom + '" (' + emailConnuQ + ')');
      categories.push({ icon: '📧', title: 'Emails connus — recherche directe', dorks: emailConnuDorks });
    }

    // ── Date de naissance ──
    if (dateNaissance) {
      var dob = dateNaissance;
      var dobParts = dob.split('-');
      var dobFr = dobParts[2] + '/' + dobParts[1] + '/' + dobParts[0];
      var dobFr2 = dobParts[2] + '-' + dobParts[1] + '-' + dobParts[0];
      var dobDot = dobParts[2] + '.' + dobParts[1] + '.' + dobParts[0];
      var dobUs = dobParts[1] + '/' + dobParts[2] + '/' + dobParts[0];
      var moisFr = ['janvier','février','mars','avril','mai','juin','juillet','août','septembre','octobre','novembre','décembre'][parseInt(dobParts[1], 10) - 1];
      var dobText = parseInt(dobParts[2], 10) + ' ' + moisFr + ' ' + dobParts[0];
      var dobYear = dobParts[0];
      var dobDorks = [];
      if (nom && prenom) {
        dobDorks.push('"' + prenom + ' ' + nom + '" "' + dobFr + '"');
        dobDorks.push('"' + prenom + ' ' + nom + '" "' + dobFr2 + '"');
        dobDorks.push('"' + prenom + ' ' + nom + '" "' + dob + '"');
        dobDorks.push('"' + prenom + ' ' + nom + '" ("' + dobDot + '" OR "' + dobUs + '" OR "' + dobText + '")');
        dobDorks.push('"' + prenom + ' ' + nom + '" "né le ' + dobFr + '" OR "née le ' + dobFr + '"');
        dobDorks.push('"' + prenom + ' ' + nom + '" "' + dobYear + '" (intext:"né" OR intext:"naissance" OR intext:"born")');
      }
      dobDorks.push(nameQ + ' "' + dobYear + '"');
      categories.push({ icon: '🎂', title: 'Date de naissance', dorks: dobDorks });
    }

    // ── 22. Avec exclusions ──
    if (exclusions.length > 0) {
      categories.push({
        icon: '🚫', title: 'Avec exclusions',
        dorks: [comboQ + ' ' + exclQ]
      });
    }

    // ── Liens directs (recherches personnes + emails pré-remplies) ──
    var iLinks = identiteLinks(nom, prenom, emailsConnus);
    if (iLinks.length) {
      categories.push({
        icon: '🔗', title: 'Liens directs — recherche',
        desc: 'Recherches pré-remplies (LinkedIn, Pages Jaunes, HIBP, Gravatar…) — ouvre directement',
        links: iLinks
      });
    }

    // ── Liens directs (annuaires inversés pour les numéros connus) ──
    if (telephonesConnus.length > 0) {
      var telLinks = [];
      var multiTel = telephonesConnus.length > 1;
      telephonesConnus.forEach(function(t) {
        phoneLinks(t).forEach(function(l) {
          telLinks.push(multiTel ? { label: l.label + ' · ' + t, url: l.url } : l);
        });
      });
      categories.push({
        icon: '📞', title: 'Liens directs — téléphone',
        desc: 'Annuaires inversés et recherche pour les numéros connus',
        links: telLinks
      });
    }

    if (silent) {
      var idVals = [prenom, nom].filter(Boolean);
      if (idVals.length === 0) idVals = variations.slice(0, 2);
      if (dateNaissance) idVals.push(dateNaissance);
      return { categories: categories, values: idVals };
    }
    renderResults(categories);
  };
