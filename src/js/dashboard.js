  // ═══════════════════════════════════════
  // TABLEAU DE BORD D'ENQUÊTE
  // Suivi des sources vérifiées (cochées), couverture par catégorie,
  // priorisation et suggestion de « prochaine étape ».
  // ═══════════════════════════════════════

  // État « vérifié » : ensemble de textes (dork/url) cochés, persisté.
  var CHECKED = (function() {
    try { return new Set(JSON.parse(localStorage.getItem('dork-checked') || '[]')); }
    catch(e) { return new Set(); }
  })();
  function saveChecked() {
    try { localStorage.setItem('dork-checked', JSON.stringify(Array.from(CHECKED))); } catch(e) {}
  }
  function isChecked(raw) { return CHECKED.has(raw); }
  window.toggleChecked = function(raw, on) {
    if (on) CHECKED.add(raw); else CHECKED.delete(raw);
    saveChecked();
    updateDashboard();
  };

  // Priorité d'une catégorie (3 = élevée, 2 = moyenne, 1 = faible) — par mots-clés du titre FR
  function catPriority(title) {
    var s = title.toLowerCase();
    if (/fuite|pastebin|credential|breach|leak|sensibles|bases de données|exposition|\bcli\b|commandes/.test(s)) return 3;
    if (/réseaux|social|document|code|dépôt|profil|forum|email|téléphone|telegram|registre|dirigeant|financ|infrastructure|liens directs|intitle|intext|inurl|sous-domaine|admin|api|recoupement/.test(s)) return 2;
    return 1;
  }

  // Calcule l'état de couverture à partir des catégories rendues (avec .entries)
  function coverage(categories) {
    var total = 0, checked = 0, cats = [], next = null;
    categories.forEach(function(cat) {
      var tot = cat.entries.length;
      var c = 0;
      cat.entries.forEach(function(e) { if (isChecked(e.text)) c++; });
      total += tot; checked += c;
      var prio = catPriority(cat.title);
      var row = { title: cat.title, total: tot, checked: c, prio: prio };
      cats.push(row);
      if (c < tot) {
        if (!next || prio > next.prio || (prio === next.prio && (tot - c) > (next.total - next.checked))) next = row;
      }
    });
    cats.sort(function(a, b) { return b.prio - a.prio || (b.total - b.checked) - (a.total - a.checked); });
    return { total: total, checked: checked, cats: cats, next: next };
  }

  function pct(c, t) { return t ? Math.round(c / t * 100) : 0; }

  function buildDashboard(categories) {
    var cov = coverage(categories);
    var prioLabel = { 3: t('db.prioHigh'), 2: t('db.prioMed'), 1: t('db.prioLow') };
    var html = '<div id="dashboard" class="dashboard">';
    html += '<div class="db-head"><span class="db-title">' + escapeHtml(t('db.coverage')) + '</span>'
      + '<span class="db-overall">' + cov.checked + '/' + cov.total + ' ' + escapeHtml(t('db.checked'))
      + ' · ' + pct(cov.checked, cov.total) + '%</span></div>';
    html += '<div class="db-bar"><div class="db-bar-fill" style="width:' + pct(cov.checked, cov.total) + '%"></div></div>';
    html += '<div class="db-cats">';
    cov.cats.forEach(function(r) {
      html += '<div class="db-cat">'
        + '<span class="db-prio db-prio-' + r.prio + '" title="' + escapeHtml(prioLabel[r.prio]) + '">●</span>'
        + '<span class="db-cat-name">' + tCat(r.title) + '</span>'
        + '<span class="db-mini"><span class="db-mini-fill" style="width:' + pct(r.checked, r.total) + '%"></span></span>'
        + '<span class="db-cat-count">' + r.checked + '/' + r.total + '</span>'
        + '</div>';
    });
    html += '</div>';
    if (cov.next) {
      html += '<div class="db-next">' + escapeHtml(t('db.next')) + ' : <strong>' + tCat(cov.next.title)
        + '</strong> <span class="db-prio db-prio-' + cov.next.prio + '">●</span> '
        + escapeHtml(prioLabel[cov.next.prio]) + '</div>';
    } else if (cov.total > 0) {
      html += '<div class="db-next db-done">✓ ' + escapeHtml(t('db.done')) + '</div>';
    }
    html += '</div>';
    return html;
  }

  // Met à jour le tableau de bord en place (sans re-rendre toute la grille)
  function updateDashboard() {
    var el = document.getElementById('dashboard');
    if (!el || !renderResults._cats) return;
    el.outerHTML = buildDashboard(renderResults._cats);
  }
