  function val(id) { return document.getElementById(id).value.trim(); }

  function list(id) { return val(id).split(',').map(function(s) { return s.trim(); }).filter(Boolean); }

  // Listes de sites partagées — source unique de vérité (évite la duplication entre générateurs)
  var SITES = {
    paste:  'site:pastebin.com OR site:ghostbin.com OR site:rentry.co OR site:justpaste.it OR site:dpaste.org OR site:paste.ee OR site:hastebin.com',
    breach: 'site:haveibeenpwned.com OR site:dehashed.com OR site:leakpeek.com OR site:intelx.io OR site:breachdirectory.org',
    code:   'site:github.com OR site:gitlab.com OR site:bitbucket.org OR site:codeberg.org OR site:gist.github.com'
  };

  // Extrait le nom d'hôte d'une saisie : retire le schéma, les identifiants,
  // le chemin, la requête et le port (ex. "https://www.exemple.com/page" → "www.exemple.com")
  function cleanDomain(raw) {
    if (!raw) return '';
    var d = raw.trim().replace(/^[a-z][a-z0-9+.-]*:\/\//i, '');
    d = d.replace(/^[^@\/]*@/, '');
    d = d.split(/[\/?#]/)[0];
    d = d.replace(/:\d+$/, '');
    return d.toLowerCase();
  }

  // Normalise un numéro FR en plusieurs formats pour maximiser les correspondances Google
  function phoneVariants(raw) {
    var d = raw.replace(/\D/g, '');
    if (d.length === 11 && d.slice(0, 2) === '33') d = '0' + d.slice(2);
    else if (d.length === 12 && d.slice(0, 3) === '330') d = '0' + d.slice(3);
    if (d.length !== 10 || d[0] !== '0') return [raw];
    var p = [d.slice(0, 2), d.slice(2, 4), d.slice(4, 6), d.slice(6, 8), d.slice(8, 10)];
    return Array.from(new Set([
      d,                                            // 0612345678
      p.join(' '),                                  // 06 12 34 56 78
      p.join('.'),                                  // 06.12.34.56.78
      '+33' + d.slice(1),                           // +33612345678
      '+33 ' + d[1] + ' ' + p.slice(1).join(' '),   // +33 6 12 34 56 78
      raw
    ]));
  }

  // Permutations courantes d'un pseudo (séparateurs alternatifs + leetspeak)
  function pseudoVariants(p) {
    if (!p) return [];
    var base = p.toLowerCase();
    var out = [p, base];
    var leet = base.replace(/a/g, '4').replace(/e/g, '3').replace(/i/g, '1').replace(/o/g, '0').replace(/s/g, '5');
    if (leet !== base) out.push(leet);
    var m = base.split(/[._-]/);
    if (m.length > 1) out.push(m.join(''), m.join('.'), m.join('_'), m.join('-'));
    return Array.from(new Set(out));
  }

  // Tab switching

  window.switchTab = function(tab, btn) {
    document.querySelectorAll('.tab-btn').forEach(function(b) { b.classList.remove('active'); });
    document.querySelectorAll('.tab-panel').forEach(function(p) { p.classList.remove('active'); });
    btn.classList.add('active');
    document.getElementById('tab-' + tab).classList.add('active');
    // Les résultats sont conservés au changement d'onglet (effacés à la prochaine génération).
    try { localStorage.setItem('dork-tab', tab); } catch(e) {}
  };

  function showToast(msg) {
    const t = document.getElementById('toast');
    t.textContent = msg;
    t.classList.add('show');
    clearTimeout(t._timer);
    t._timer = setTimeout(() => t.classList.remove('show'), 1800);
  }

  function copyText(text, btn) {
    navigator.clipboard.writeText(text).then(() => {
      btn.textContent = '✓';
      btn.classList.add('copied');
      setTimeout(() => { btn.textContent = 'Copier'; btn.classList.remove('copied'); }, 1200);
    }).catch(() => showToast('Erreur de copie'));
  }

  // ── Moteurs de recherche ──
  // Les générateurs produisent toujours du dork en syntaxe Google canonique.
  // adaptDork() le réécrit à la volée selon le moteur choisi (au moment d'ouvrir
  // seulement — l'affichage et l'export restent en syntaxe Google).

  var SEARCH_ENGINES = {
    google:     { label: 'Google',     url: 'https://www.google.com/search?q=' },
    duckduckgo: { label: 'DuckDuckGo', url: 'https://duckduckgo.com/?q=' },
    yandex:     { label: 'Yandex',     url: 'https://yandex.com/search/?text=' },
  };

  function currentEngine() {
    var sel = document.getElementById('engine');
    var e = sel ? sel.value : 'google';
    return SEARCH_ENGINES[e] ? e : 'google';
  }

  // Traduction approximative des opérateurs Google vers DuckDuckGo / Yandex.
  // Certaines constructions complexes (OR entre guillemets, parenthèses
  // imbriquées) ne sont pas couvertes ; suffisant pour une recherche exploratoire.
  function adaptDork(dork, engine) {
    if (engine === 'google' || !engine) return dork;
    var q = dork;
    if (engine === 'duckduckgo') {
      // DDG ne gère pas after:/before: → on les retire
      q = q.replace(/\b(after|before):\S+/g, '');
      // intext:"x" → "x" (DDG n'a pas intext:)
      q = q.replace(/\bintext:/g, '');
    } else if (engine === 'yandex') {
      q = q.replace(/\bintitle:/g, 'title:');
      q = q.replace(/\binurl:/g, 'url:');
      q = q.replace(/\bfiletype:/g, 'mime:');
      q = q.replace(/\bintext:/g, '');
      q = q.replace(/\bafter:(\S+)/g, 'date:>$1');
      q = q.replace(/\bbefore:(\S+)/g, 'date:<$1');
      q = q.replace(/ OR /g, ' | ');
    }
    return q.replace(/\s{2,}/g, ' ').trim();
  }

  // Ouvre une requête dans le moteur sélectionné (comportement dépendant du navigateur)
  function openSearch(query) {
    var engine = currentEngine();
    var url = SEARCH_ENGINES[engine].url + encodeURIComponent(adaptDork(query, engine));
    var w = window.open(url, '_blank');
    // Conserve le focus sur l'onglet courant
    if (w) {
      window.focus();
      // Certains navigateurs ignorent window.focus() ; blur + focus en repli
      try { w.blur(); window.focus(); } catch(e) {}
    }
    return !!w;
  }

  // Nombre de "mots" d'un dork (Google tronque au-delà de ~32)
  var MAX_DORK_WORDS = 32;
  function dorkWordCount(dork) {
    var m = dork.trim().match(/\S+/g);
    return m ? m.length : 0;
  }

  function buildNameQuery(nom, prenom, variations) {
    var parts = [];
    if (nom && prenom) {
      parts.push('"' + prenom + ' ' + nom + '"');
      parts.push('"' + nom + ' ' + prenom + '"');
    } else if (nom) {
      parts.push('"' + nom + '"');
    } else if (prenom) {
      parts.push('"' + prenom + '"');
    }
    variations.forEach(function(v) { parts.push('"' + v + '"'); });
    return parts.join(' OR ');
  }

  function buildLocationQuery(villes) {
    return villes.map(function(v) { return '"' + v + '"'; }).join(' OR ');
  }

  function buildDateQuery(dateDebut, dateFin) {
    var q = '';
    if (dateDebut) q += ' after:' + dateDebut;
    if (dateFin) q += ' before:' + dateFin;
    return q.trim();
  }

  function buildExclusions(sites) {
    return sites.map(function(s) { return '-site:' + s; }).join(' ');
  }

  // Construit les variations pour inurl/intext

  function buildAllVariations(nom, prenom, variations) {
    var v = [].concat(variations);
    if (nom) v.push(nom.toLowerCase());
    if (prenom) v.push(prenom.toLowerCase());
    if (nom && prenom) {
      var n = nom.toLowerCase(), p = prenom.toLowerCase();
      v.push(p + n, p + '-' + n, p + '.' + n, p + '_' + n, n + p, n + '.' + p);
    }
    return Array.from(new Set(v));
  }

  // Construit les variations email — uniquement les formes composées nom+prénom

  function buildEmailVariations(nom, prenom) {
    var v = [];
    if (nom && prenom) {
      var n = nom.toLowerCase(), p = prenom.toLowerCase();
      [p + '.' + n, p + n, n + '.' + p, n + p, p + '_' + n, p[0] + '.' + n, p[0] + n].forEach(function(e) {
        if (v.indexOf(e) === -1) v.push(e);
      });
    }
    return v;
  }

  function escapeHtml(s) {
    var d = document.createElement('div');
    d.textContent = s;
    return d.innerHTML.replace(/"/g, '&quot;');
  }

  // Accordion : ferme tout dans la même colonne, ouvre le cliqué

  function getCatIcon(title) {
    var t = title.toLowerCase();
    var S = {
      zap:      '<polygon points="13,2 3,14 12,14 11,22 21,10 12,10"/>',
      search:   '<circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>',
      pin:      '<path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/>',
      cal:      '<rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>',
      tag:      '<path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/>',
      text:     '<path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14,2 14,8 20,8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>',
      link:     '<path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71"/>',
      file:     '<path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14,2 14,8 20,8"/>',
      share:    '<circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>',
      alert:    '<path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>',
      mail:     '<path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/>',
      lock:     '<rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/>',
      db:       '<ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/>',
      msg:      '<path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>',
      user:     '<path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/>',
      code:     '<polyline points="16,18 22,12 16,6"/><polyline points="8,6 2,12 8,18"/>',
      box:      '<polyline points="21,8 21,21 3,21 3,8"/><rect x="1" y="3" width="22" height="5"/>',
      img:      '<rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21,15 16,10 5,21"/>',
      book:     '<path d="M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2z"/><path d="M22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z"/>',
      layers:   '<polygon points="12,2 2,7 12,12 22,7"/><polyline points="2,17 12,22 22,17"/><polyline points="2,12 12,17 22,12"/>',
      phone:    '<path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/>',
      slash:    '<circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/>',
      game:     '<line x1="6" y1="11" x2="10" y2="11"/><line x1="8" y1="9" x2="8" y2="13"/><line x1="15" y1="12" x2="15.01" y2="12"/><line x1="18" y1="10" x2="18.01" y2="10"/><path d="M17.32 5H6.68a4 4 0 00-3.978 3.59C2.604 9.416 2 14.456 2 16a3 3 0 003 3c1 0 1.5-.5 2-1l1.414-1.414A2 2 0 019.828 16h4.344a2 2 0 011.414.586L17 18c.5.5 1 1 2 1a3 3 0 003-3c0-1.545-.604-6.584-.685-7.258A4 4 0 0017.32 5z"/>',
      shield:   '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>',
      brief:    '<rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v16"/>',
      dollar:   '<line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/>',
      news:     '<path d="M4 22h16a2 2 0 002-2V4a2 2 0 00-2-2H8a2 2 0 00-2 2v16a2 2 0 01-2 2zm0 0a2 2 0 01-2-2v-9c0-1.1.9-2 2-2h2"/><path d="M18 14h-8"/><path d="M15 18h-5"/><path d="M10 6h8v4h-8V6z"/>',
      server:   '<rect x="2" y="2" width="20" height="8" rx="2"/><rect x="2" y="14" width="20" height="8" rx="2"/><line x1="6" y1="6" x2="6.01" y2="6"/><line x1="6" y1="18" x2="6.01" y2="18"/>',
      send:     '<line x1="22" y1="2" x2="11" y2="13"/><polygon points="22,2 15,22 11,13 2,9"/>',
      branch:   '<line x1="6" y1="3" x2="6" y2="15"/><circle cx="18" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><path d="M18 9a9 9 0 01-9 9"/>',
      sliders:  '<line x1="4" y1="21" x2="4" y2="14"/><line x1="4" y1="10" x2="4" y2="3"/><line x1="12" y1="21" x2="12" y2="12"/><line x1="12" y1="8" x2="12" y2="3"/><line x1="20" y1="21" x2="20" y2="16"/><line x1="20" y1="12" x2="20" y2="3"/><line x1="1" y1="14" x2="7" y2="14"/><line x1="9" y1="8" x2="15" y2="8"/><line x1="17" y1="16" x2="23" y2="16"/>',
      list:     '<line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/>',
      wifi:     '<path d="M1.42 9a16 16 0 0121.16 0"/><path d="M5 12.55a11 11 0 0114.08 0"/><path d="M8.53 16.11a6 6 0 016.95 0"/><line x1="12" y1="20" x2="12.01" y2="20"/>',
      cpu:      '<rect x="4" y="4" width="16" height="16" rx="2"/><rect x="9" y="9" width="6" height="6"/><line x1="9" y1="1" x2="9" y2="4"/><line x1="15" y1="1" x2="15" y2="4"/><line x1="9" y1="20" x2="9" y2="23"/><line x1="15" y1="20" x2="15" y2="23"/><line x1="20" y1="9" x2="23" y2="9"/><line x1="20" y1="14" x2="23" y2="14"/><line x1="1" y1="9" x2="4" y2="9"/><line x1="1" y1="14" x2="4" y2="14"/>',
      check:    '<polyline points="9,11 12,14 22,4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/>',
      target:   '<circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/>',
      bar:      '<line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/>',
    };

    if (t.includes('tout-en-un') || t.includes('scan')) return S.zap;
    if (t.includes('recherche générale') || (t.includes('recherche') && !t.includes('directe'))) return S.search;
    if (t.includes('localisation') || t.includes('local') || t.includes('ville') || t.includes('région')) return S.pin;
    if (t.includes('naissance')) return S.cal;
    if (t.includes('date') && !t.includes('naissance')) return S.cal;
    if (t.includes('combinaison')) return S.zap;
    if (t.includes('intitle')) return S.tag;
    if (t.includes('intext')) return S.text;
    if (t.includes('inurl')) return S.link;
    if (t.includes('document')) return S.file;
    if (t.includes('réseau') || t.includes('social')) return S.share;
    if (t.includes('pastebin') || t.includes('fuite') || t.includes('exposure')) return S.alert;
    if (t.includes('email leak')) return S.mail;
    if (t.includes('credential') || t.includes('sensible')) return S.lock;
    if (t.includes('base de') || t.includes('breach') || t.includes('fuite')) return S.db;
    if (t.includes('forum') || t.includes('discussion')) return S.msg;
    if (t.includes('profil') || t.includes('compte')) return S.user;
    if (t.includes('code') || t.includes('dépôt') || t.includes('repo')) return S.code;
    if (t.includes('archive')) return S.box;
    if (t.includes('image') || t.includes('média')) return S.img;
    if (t.includes('annuaire') || t.includes('blanche')) return S.book;
    if (t.includes('méta')) return S.layers;
    if (t.includes('téléphone') || t.includes('numéro')) return S.phone;
    if (t.includes('exclusion')) return S.slash;
    if (t.includes('gaming') || t.includes('esport')) return S.game;
    if (t.includes('légal') || t.includes('registre')) return S.shield;
    if (t.includes('dirigeant') || t.includes('emploi') || t.includes('stack')) return S.brief;
    if (t.includes('financ')) return S.dollar;
    if (t.includes('presse') || t.includes('réputation')) return S.news;
    if (t.includes('infra') || t.includes('serveur')) return S.server;
    if (t.includes('telegram') || t.includes('messagerie')) return S.send;
    if (t.includes('sous-domaine')) return S.branch;
    if (t.includes('admin') || t.includes('panneau')) return S.sliders;
    if (t.includes('listing') || t.includes('répertoire')) return S.list;
    if (t.includes('erreur') || t.includes('debug')) return S.wifi;
    if (t.includes('api') || t.includes('endpoint')) return S.bar;
    if (t.includes('technolog') || t.includes('cms')) return S.cpu;
    if (t.includes('checker') || t.includes('check')) return S.check;
    if (t.includes('plateforme') || t.includes('spécifique')) return S.target;
    if (t.includes('email') || t.includes('mail')) return S.mail;
    return S.search;
  }
