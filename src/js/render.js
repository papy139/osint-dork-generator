  function renderResults(categories) {
    var container = document.getElementById('results');
    renderResults._last = categories; // mémorisé pour re-rendre lors d'un changement de langue

    // Dédup inter-catégories : on garde la 1re occurrence de chaque dork.
    // Les catégories de liens directs (cat.links) ne sont ni dédupées ni concernées.
    var seen = {};
    categories = categories.map(function(c) {
      if (c.links) return c;
      var d = c.dorks.filter(function(x) { if (seen[x]) return false; seen[x] = 1; return true; });
      return { icon: c.icon, title: c.title, desc: c.desc, dorks: d };
    }).filter(function(c) { return c.links ? c.links.length > 0 : c.dorks.length > 0; });

    if (categories.length === 0) {
      container.innerHTML = '<div class="empty-state"><span class="prompt-char">_</span>' + escapeHtml(t('r.none')) + '</div>';
      return;
    }

    // Normalise chaque catégorie en entrées { text, url, label }
    // text = ce qu'on copie/exporte ; url non-null = lien direct (ouverture sans moteur)
    categories.forEach(function(cat) {
      cat.entries = cat.links
        ? cat.links.map(function(l) { return { text: l.url, url: l.url, label: l.label }; })
        : cat.dorks.map(function(d) { return { text: d, url: null, label: null }; });
    });

    var allLines = [];
    categories.forEach(function(c) { c.entries.forEach(function(e) { allLines.push(e.text); }); });

    var html = '<div class="results-header">';
    html += '<h2>' + allLines.length + ' ' + escapeHtml(t('r.results')) + '</h2>';
    html += '<div style="display:flex;gap:0.5rem;flex-wrap:wrap;align-items:center">';
    html += '<input type="text" id="filterInput" class="filter-input" placeholder="' + escapeHtml(t('r.filter')) + '" aria-label="' + escapeHtml(t('r.filter')) + '">';
    html += '<button class="btn-copy-all" id="btnCopyAll">' + escapeHtml(t('r.copyall')) + '</button>';
    html += '<button class="btn-copy-all" id="btnExport">' + escapeHtml(t('r.exporttxt')) + '</button>';
    html += '<button class="btn-copy-all" id="btnExportHtml">' + escapeHtml(t('r.reporthtml')) + '</button>';
    html += '<button class="btn-copy-all" id="btnToggleAll">' + escapeHtml(t('r.expand')) + '</button>';
    html += '</div>';
    html += '</div>';

    renderResults._cats = categories;
    html += buildDashboard(categories);

    // Distribute into 3 columns round-robin
    var cols = [[], [], []];
    categories.forEach(function(cat, ci) { cols[ci % 3].push({ cat: cat, ci: ci }); });

    html += '<div class="results-grid">';
    cols.forEach(function(col) {
      html += '<div class="results-col">';
      col.forEach(function(item) {
        var cat = item.cat, ci = item.ci;
        var collapsedClass = ci > 0 ? ' collapsed' : '';
        var aioClass = ci === 0 ? ' aio' : '';
        html += '<div class="dork-category' + collapsedClass + aioClass + '" style="animation-delay:' + (ci * 0.04) + 's">';
        html += '<div class="dork-category-header" onclick="handleToggle(this)">';
        html += '<svg class="cat-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' + getCatIcon(cat.title) + '</svg>';
        html += '<span class="cat-title-wrap">';
        html += '<span class="cat-title">' + tCat(cat.title) + '</span>';
        if (cat.desc) html += '<span class="cat-desc">' + tDesc(cat.desc) + '</span>';
        html += '</span>';
        html += '<span class="cat-count">' + cat.entries.length + '</span>';
        html += '<button class="btn-open-all" onclick="handleCopyCat(this); event.stopPropagation();" title="Copier les entrées de cette catégorie">' + escapeHtml(t('r.copy')) + '</button>';
        html += '<button class="btn-open-all" onclick="handleOpenAll(this); event.stopPropagation();" title="Tout ouvrir dans des onglets">' + escapeHtml(t('r.openall')) + ' (' + cat.entries.length + ')</button>';
        html += '<span class="cat-chevron">▼</span>';
        html += '</div>';
        html += '<div class="dork-items">';
        cat.entries.forEach(function(entry, di) {
          var id = 'dork-' + ci + '-' + di;
          var raw = entry.url || entry.text;
          html += '<div class="dork-item' + (isChecked(raw) ? ' checked' : '') + '">';
          html += '<input type="checkbox" class="chk"' + (isChecked(raw) ? ' checked' : '') + ' data-raw="' + escapeHtml(raw) + '" title="' + escapeHtml(t('db.verify')) + '" aria-label="' + escapeHtml(t('db.verify')) + '">';
          html += '<div class="dork-query" id="' + id + '"' + (entry.url ? ' data-url="' + escapeHtml(entry.url) + '"' : '') + '>';
          html += '<span class="dork-text" data-raw="' + escapeHtml(raw) + '">' + escapeHtml(raw) + '</span>';
          if (entry.url) {
            if (entry.label) html += ' <span class="link-label">' + escapeHtml(entry.label) + '</span>';
          } else {
            var wc = dorkWordCount(entry.text);
            if (wc > MAX_DORK_WORDS) {
              html += ' <span class="dork-warn" title="' + wc + ' mots — Google tronque au-delà de ' + MAX_DORK_WORDS + '">⚠️</span>';
            }
          }
          html += '</div>';
          html += '<div class="dork-actions">';
          html += '<button class="btn-sm" onclick="handleCopy(\'' + id + '\', this)">' + escapeHtml(t('r.copy')) + '</button>';
          html += '<button class="btn-sm" onclick="handleOpen(\'' + id + '\')">' + escapeHtml(t('r.open')) + '</button>';
          if (entry.url) {
            html += '<button class="btn-sm" onclick="handleArchive(\'' + id + '\')" title="Voir les archives Wayback Machine">📦</button>';
          }
          html += '</div>';
          html += '</div>';
        });
        html += '</div></div>';
      });
      html += '</div>';
    });
    html += '</div>';

    container.innerHTML = html;

    document.querySelectorAll('.chk').forEach(function(c) {
      c.addEventListener('change', function() {
        var item = this.closest('.dork-item');
        if (item) item.classList.toggle('checked', this.checked);
        toggleChecked(this.getAttribute('data-raw'), this.checked);
      });
    });

    document.getElementById('btnCopyAll').addEventListener('click', function() {
      var text = allLines.join('\n\n');
      navigator.clipboard.writeText(text).then(function() {
        showToast('Tout copié !');
        var btn = document.getElementById('btnCopyAll');
        btn.textContent = '✓';
        setTimeout(function() { btn.textContent = t('r.copyall'); }, 1500);
      }).catch(function() { showToast('Erreur de copie'); });
    });

    document.getElementById('btnExport').addEventListener('click', function() {
      var lines = [];
      categories.forEach(function(cat) {
        lines.push('=== ' + cat.title + ' ===');
        cat.entries.forEach(function(e) { lines.push(e.text); });
        lines.push('');
      });
      var blob = new Blob([lines.join('\n')], { type: 'text/plain' });
      var a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = 'dorks-' + new Date().toISOString().slice(0, 10) + '.txt';
      a.click();
      setTimeout(function() { URL.revokeObjectURL(a.href); }, 100);
      showToast('Export téléchargé !');
    });

    document.getElementById('btnExportHtml').addEventListener('click', function() {
      var parts = ['<!DOCTYPE html><html lang="fr"><head><meta charset="UTF-8">',
        '<meta name="viewport" content="width=device-width, initial-scale=1.0">',
        '<title>Rapport OSINT</title>',
        '<style>body{font-family:system-ui,-apple-system,sans-serif;max-width:900px;margin:2rem auto;padding:0 1rem;line-height:1.5;color:#1a1a1a}h1{border-bottom:2px solid #00a37a;padding-bottom:.4rem}h2{margin-top:2rem;color:#00795c}code{background:#f3f3f3;padding:.1rem .35rem;border-radius:3px;word-break:break-all;font-size:.85em}li{margin:.35rem 0}a{color:#0066cc}em{color:#555}</style></head><body>'];
      parts.push('<h1>Rapport OSINT — ' + escapeHtml(new Date().toLocaleString('fr-FR')) + '</h1>');
      categories.forEach(function(cat) {
        parts.push('<h2>' + escapeHtml(cat.title) + '</h2>');
        if (cat.desc) parts.push('<p><em>' + escapeHtml(cat.desc) + '</em></p>');
        parts.push('<ul>');
        cat.entries.forEach(function(e) {
          if (e.url) {
            parts.push('<li><a href="' + escapeHtml(e.url) + '" target="_blank" rel="noopener">'
              + escapeHtml(e.label || e.url) + '</a> — <code>' + escapeHtml(e.url) + '</code></li>');
          } else {
            parts.push('<li><code>' + escapeHtml(e.text) + '</code></li>');
          }
        });
        parts.push('</ul>');
      });
      parts.push('</body></html>');
      var blob = new Blob([parts.join('\n')], { type: 'text/html' });
      var a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = 'rapport-osint-' + new Date().toISOString().slice(0, 10) + '.html';
      a.click();
      setTimeout(function() { URL.revokeObjectURL(a.href); }, 100);
      showToast('Rapport HTML téléchargé !');
    });

    // Tout déplier / replier (bascule globale)
    document.getElementById('btnToggleAll').addEventListener('click', function() {
      var cats = document.querySelectorAll('.dork-category');
      var anyCollapsed = Array.prototype.some.call(cats, function(c) { return c.classList.contains('collapsed'); });
      cats.forEach(function(c) { c.classList.toggle('collapsed', !anyCollapsed); });
      this.textContent = anyCollapsed ? t('r.collapse') : t('r.expand');
    });

    // Filtre live : masque les entrées non concordantes, surligne la correspondance
    var filterInput = document.getElementById('filterInput');
    filterInput.addEventListener('input', function() {
      var q = this.value.trim().toLowerCase();
      document.querySelectorAll('.dork-category').forEach(function(cat) {
        var anyVisible = false;
        cat.querySelectorAll('.dork-item').forEach(function(item) {
          var textEl = item.querySelector('.dork-text');
          var raw = textEl ? (textEl.getAttribute('data-raw') || '') : item.textContent;
          var idx = q ? raw.toLowerCase().indexOf(q) : -1;
          var match = !q || idx !== -1;
          item.style.display = match ? '' : 'none';
          if (match) anyVisible = true;
          if (textEl) {
            if (q && idx !== -1) {
              textEl.innerHTML = escapeHtml(raw.slice(0, idx)) + '<mark>'
                + escapeHtml(raw.slice(idx, idx + q.length)) + '</mark>'
                + escapeHtml(raw.slice(idx + q.length));
            } else {
              textEl.textContent = raw;
            }
          }
        });
        cat.style.display = anyVisible ? '' : 'none';
        if (q && anyVisible) cat.classList.remove('collapsed');
      });
    });
  }

  // Texte brut du dork/lien — lu depuis .dork-text[data-raw] (robuste au surlignage)
  function dorkTextOf(el) {
    var t = el.querySelector ? el.querySelector('.dork-text') : null;
    if (t) return (t.getAttribute('data-raw') || t.textContent).trim();
    return (el.firstChild ? el.firstChild.textContent : el.textContent).trim();
  }

  window.handleCopy = function(id, btn) {
    copyText(dorkTextOf(document.getElementById(id)), btn);
  };

  // Ouvre les archives Wayback Machine d'un lien
  window.handleArchive = function(id) {
    var el = document.getElementById(id);
    var url = el.getAttribute('data-url') || dorkTextOf(el);
    window.open('https://web.archive.org/web/*/' + url, '_blank');
  };

  window.handleOpen = function(id) {
    var el = document.getElementById(id);
    var url = el.getAttribute('data-url');
    if (url) {
      var w = window.open(url, '_blank');
      if (!w) showToast('Popup bloquée par le navigateur.');
      return;
    }
    openSearch(dorkTextOf(el));
  };

  // Copie toutes les entrées (dorks ou URLs) d'une catégorie
  window.handleCopyCat = function(btn) {
    var catEl = btn.closest('.dork-category');
    var lines = [];
    catEl.querySelectorAll('.dork-text').forEach(function(t) {
      lines.push((t.getAttribute('data-raw') || t.textContent).trim());
    });
    if (lines.length === 0) return;
    navigator.clipboard.writeText(lines.join('\n'))
      .then(function() { showToast(lines.length + ' entrée(s) copiée(s).'); })
      .catch(function() { showToast('Erreur de copie'); });
  };

  // Ouvre toutes les entrées d'une catégorie (confirmation si > 5)
  // Liens directs → ouverture de l'URL ; dorks → via le moteur courant.
  window.handleOpenAll = function(btn) {
    var catEl = btn.closest('.dork-category');
    var items = [];
    catEl.querySelectorAll('.dork-query').forEach(function(q) {
      var url = q.getAttribute('data-url');
      items.push({ url: url, text: url ? null : dorkTextOf(q) });
    });
    if (items.length === 0) return;
    if (items.length > 5 && !confirm('Ouvrir ' + items.length + ' onglets ? Le navigateur peut en bloquer une partie.')) return;
    items.forEach(function(it, i) {
      setTimeout(function() {
        if (it.url) window.open(it.url, '_blank');
        else openSearch(it.text);
      }, i * 300);
    });
    showToast('Ouverture de ' + items.length + ' onglet(s)…');
  };

  // ═══════════════════════════════════════
  // CHAMPS PERSO + EXPORT ZIP
  // ═══════════════════════════════════════

  window.handleToggle = function(headerEl) {
    var cat = headerEl.parentElement;
    var col = cat.parentElement;
    var wasOpen = !cat.classList.contains('collapsed');
    col.querySelectorAll('.dork-category').forEach(function(c) {
      c.classList.add('collapsed');
    });
    if (!wasOpen) cat.classList.remove('collapsed');
  };

  // Icônes SVG par catégorie (Feather-style, stroke)
