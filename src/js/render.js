  function renderResults(categories) {
    var container = document.getElementById('results');

    // Dédup inter-catégories : on garde la 1re occurrence de chaque dork.
    // Les catégories de liens directs (cat.links) ne sont ni dédupées ni concernées.
    var seen = {};
    categories = categories.map(function(c) {
      if (c.links) return c;
      var d = c.dorks.filter(function(x) { if (seen[x]) return false; seen[x] = 1; return true; });
      return { icon: c.icon, title: c.title, desc: c.desc, dorks: d };
    }).filter(function(c) { return c.links ? c.links.length > 0 : c.dorks.length > 0; });

    if (categories.length === 0) {
      container.innerHTML = '<div class="empty-state"><span class="prompt-char">_</span>Aucun dork généré.</div>';
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
    html += '<h2>' + allLines.length + ' résultat' + (allLines.length > 1 ? 's' : '') + '</h2>';
    html += '<div style="display:flex;gap:0.5rem;flex-wrap:wrap;align-items:center">';
    html += '<input type="text" id="filterInput" class="filter-input" placeholder="Filtrer…" aria-label="Filtrer les résultats">';
    html += '<button class="btn-copy-all" id="btnCopyAll">Tout copier</button>';
    html += '<button class="btn-copy-all" id="btnExport">Exporter .txt</button>';
    html += '</div>';
    html += '</div>';

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
        html += '<span class="cat-title">' + cat.title + '</span>';
        if (cat.desc) html += '<span class="cat-desc">' + cat.desc + '</span>';
        html += '</span>';
        html += '<span class="cat-count">' + cat.entries.length + '</span>';
        html += '<button class="btn-open-all" onclick="handleOpenAll(this); event.stopPropagation();" title="Tout ouvrir dans des onglets">Ouvrir tout (' + cat.entries.length + ')</button>';
        html += '<span class="cat-chevron">▼</span>';
        html += '</div>';
        html += '<div class="dork-items">';
        cat.entries.forEach(function(entry, di) {
          var id = 'dork-' + ci + '-' + di;
          html += '<div class="dork-item">';
          if (entry.url) {
            html += '<div class="dork-query" id="' + id + '" data-url="' + escapeHtml(entry.url) + '">' + escapeHtml(entry.url);
            if (entry.label) html += ' <span class="link-label">' + escapeHtml(entry.label) + '</span>';
            html += '</div>';
          } else {
            var wc = dorkWordCount(entry.text);
            html += '<div class="dork-query" id="' + id + '">' + escapeHtml(entry.text);
            if (wc > MAX_DORK_WORDS) {
              html += ' <span class="dork-warn" title="' + wc + ' mots — Google tronque au-delà de ' + MAX_DORK_WORDS + '">⚠️</span>';
            }
            html += '</div>';
          }
          html += '<div class="dork-actions">';
          html += '<button class="btn-sm" onclick="handleCopy(\'' + id + '\', this)">Copier</button>';
          html += '<button class="btn-sm" onclick="handleOpen(\'' + id + '\')">Ouvrir ↗</button>';
          html += '</div>';
          html += '</div>';
        });
        html += '</div></div>';
      });
      html += '</div>';
    });
    html += '</div>';

    container.innerHTML = html;

    document.getElementById('btnCopyAll').addEventListener('click', function() {
      var text = allLines.join('\n\n');
      navigator.clipboard.writeText(text).then(function() {
        showToast('Tout copié !');
        var btn = document.getElementById('btnCopyAll');
        btn.textContent = '✓ Copié';
        setTimeout(function() { btn.textContent = 'Tout copier'; }, 1500);
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

    // Filtre live : masque les dorks (et les catégories vides) qui ne matchent pas
    var filterInput = document.getElementById('filterInput');
    filterInput.addEventListener('input', function() {
      var q = this.value.toLowerCase();
      document.querySelectorAll('.dork-category').forEach(function(cat) {
        var anyVisible = false;
        cat.querySelectorAll('.dork-item').forEach(function(item) {
          var match = item.textContent.toLowerCase().indexOf(q) !== -1;
          item.style.display = match ? '' : 'none';
          if (match) anyVisible = true;
        });
        cat.style.display = anyVisible ? '' : 'none';
        if (q && anyVisible) cat.classList.remove('collapsed');
      });
    });
  }

  // Texte du dork sans le badge ⚠️ éventuel (firstChild = nœud texte du dork)
  function dorkTextOf(el) {
    return (el.firstChild ? el.firstChild.textContent : el.textContent).trim();
  }

  window.handleCopy = function(id, btn) {
    copyText(dorkTextOf(document.getElementById(id)), btn);
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
