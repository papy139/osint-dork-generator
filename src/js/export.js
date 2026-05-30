  // ═══════════════════════════════════════
  // EXPORT MULTI-FORMAT (résultats affichés)
  // Formats : TXT, Markdown, HTML, JSON, CSV, SQL.
  // L'état « vérifié » de chaque entrée est inclus.
  // ═══════════════════════════════════════

  function entryChecked(text) { return (typeof isChecked === 'function') ? isChecked(text) : false; }

  // Représentation structurée commune : [{title, desc, entries:[{value,url,label,checked}]}]
  function buildStruct(cats) {
    return cats.map(function(c) {
      return {
        title: c.title,
        description: c.desc || '',
        entries: (c.entries || []).map(function(e) {
          return { value: e.text, url: e.url || null, label: e.label || null, checked: entryChecked(e.text) };
        })
      };
    });
  }

  function buildTxt(cats) {
    var lines = [];
    cats.forEach(function(c) {
      lines.push('=== ' + c.title + ' ===');
      (c.entries || []).forEach(function(e) { lines.push((entryChecked(e.text) ? '[x] ' : '[ ] ') + e.text); });
      lines.push('');
    });
    return lines.join('\n');
  }

  function buildMd(cats) {
    var out = ['# Rapport OSINT — ' + new Date().toISOString().slice(0, 10), ''];
    cats.forEach(function(c) {
      out.push('## ' + c.title);
      if (c.desc) out.push('_' + c.desc + '_');
      (c.entries || []).forEach(function(e) {
        var chk = entryChecked(e.text) ? '[x]' : '[ ]';
        out.push(e.url ? '- ' + chk + ' [' + (e.label || e.url) + '](' + e.url + ')' : '- ' + chk + ' `' + e.text + '`');
      });
      out.push('');
    });
    return out.join('\n');
  }

  function csvCell(s) { return '"' + String(s == null ? '' : s).replace(/"/g, '""') + '"'; }
  function buildCsv(cats) {
    var rows = ['categorie,type,valeur,label,verifie'];
    cats.forEach(function(c) {
      (c.entries || []).forEach(function(e) {
        rows.push([csvCell(c.title), e.url ? 'lien' : 'dork', csvCell(e.text), csvCell(e.label || ''), entryChecked(e.text) ? '1' : '0'].join(','));
      });
    });
    return rows.join('\r\n');
  }

  function sqlStr(s) { return "'" + String(s == null ? '' : s).replace(/'/g, "''") + "'"; }
  function buildSql(cats) {
    var out = ['CREATE TABLE IF NOT EXISTS dorks (',
      '  categorie TEXT, type TEXT, valeur TEXT, label TEXT, verifie INTEGER',
      ');', ''];
    cats.forEach(function(c) {
      (c.entries || []).forEach(function(e) {
        out.push('INSERT INTO dorks (categorie, type, valeur, label, verifie) VALUES ('
          + sqlStr(c.title) + ', ' + sqlStr(e.url ? 'lien' : 'dork') + ', ' + sqlStr(e.text) + ', '
          + sqlStr(e.label || '') + ', ' + (entryChecked(e.text) ? 1 : 0) + ');');
      });
    });
    return out.join('\n');
  }

  function buildHtmlReport(cats) {
    var parts = ['<!DOCTYPE html><html lang="fr"><head><meta charset="UTF-8">',
      '<meta name="viewport" content="width=device-width, initial-scale=1.0"><title>Rapport OSINT</title>',
      '<style>body{font-family:system-ui,-apple-system,sans-serif;max-width:900px;margin:2rem auto;padding:0 1rem;line-height:1.5;color:#1a1a1a}h1{border-bottom:2px solid #00a37a;padding-bottom:.4rem}h2{margin-top:2rem;color:#00795c}code{background:#f3f3f3;padding:.1rem .35rem;border-radius:3px;word-break:break-all;font-size:.85em}li{margin:.35rem 0}a{color:#0066cc}em{color:#555}.done{opacity:.55;text-decoration:line-through}</style></head><body>'];
    parts.push('<h1>Rapport OSINT — ' + escapeHtml(new Date().toLocaleString('fr-FR')) + '</h1>');
    cats.forEach(function(c) {
      parts.push('<h2>' + escapeHtml(c.title) + '</h2>');
      if (c.desc) parts.push('<p><em>' + escapeHtml(c.desc) + '</em></p>');
      parts.push('<ul>');
      (c.entries || []).forEach(function(e) {
        var cls = entryChecked(e.text) ? ' class="done"' : '';
        if (e.url) parts.push('<li' + cls + '><a href="' + escapeHtml(e.url) + '" target="_blank" rel="noopener">' + escapeHtml(e.label || e.url) + '</a> — <code>' + escapeHtml(e.url) + '</code></li>');
        else parts.push('<li' + cls + '><code>' + escapeHtml(e.text) + '</code></li>');
      });
      parts.push('</ul>');
    });
    parts.push('</body></html>');
    return parts.join('\n');
  }

  function downloadBlob(filename, mime, content) {
    var blob = new Blob([content], { type: mime });
    var a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = filename;
    a.click();
    setTimeout(function() { URL.revokeObjectURL(a.href); }, 100);
  }

  var EXPORTERS = {
    txt:  { build: buildTxt, ext: 'txt', mime: 'text/plain' },
    md:   { build: buildMd, ext: 'md', mime: 'text/markdown' },
    html: { build: buildHtmlReport, ext: 'html', mime: 'text/html' },
    json: { build: function(c) { return JSON.stringify({ generated: new Date().toISOString(), categories: buildStruct(c) }, null, 2); }, ext: 'json', mime: 'application/json' },
    csv:  { build: buildCsv, ext: 'csv', mime: 'text/csv' },
    sql:  { build: buildSql, ext: 'sql', mime: 'text/plain' }
  };

  window.exportResults = function(format) {
    closeExportMenu();
    var cats = (typeof renderResults === 'function') ? renderResults._cats : null;
    if (!cats || cats.length === 0) { showToast(t('ex.empty')); return; }
    var ex = EXPORTERS[format];
    if (!ex) return;
    downloadBlob('dorks-' + new Date().toISOString().slice(0, 10) + '.' + ex.ext, ex.mime, ex.build(cats));
    showToast(t('ex.done'));
  };

  function closeExportMenu() {
    var m = document.getElementById('exportMenu');
    if (m) m.hidden = true;
  }
  window.toggleExportMenu = function(evt) {
    if (evt) evt.stopPropagation();
    var m = document.getElementById('exportMenu');
    if (!m) return;
    m.hidden = !m.hidden;
    if (!m.hidden) {
      setTimeout(function() {
        document.addEventListener('click', function onDoc() { closeExportMenu(); document.removeEventListener('click', onDoc); });
      }, 0);
    }
  };
