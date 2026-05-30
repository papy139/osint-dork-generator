  // ═══════════════════════════════════════
  // PALETTE DE COMMANDES (Ctrl/Cmd + K)
  // ═══════════════════════════════════════
  window.initPalette = function() {
    var overlay = document.createElement('div');
    overlay.id = 'cmdk';
    overlay.className = 'cmdk';
    overlay.style.display = 'none';
    overlay.innerHTML = '<div class="cmdk-box">'
      + '<input id="cmdkInput" class="cmdk-input" type="text" autocomplete="off" spellcheck="false">'
      + '<div id="cmdkList" class="cmdk-list"></div></div>';
    document.body.appendChild(overlay);

    var input = overlay.querySelector('#cmdkInput');
    var list = overlay.querySelector('#cmdkList');
    var sel = 0, filtered = [];

    function commands() {
      var cmds = [];
      document.querySelectorAll('.tab-btn').forEach(function(b) {
        var lbl = b.querySelector('.tab-label');
        cmds.push({ label: t('cmd.gotab') + ' : ' + (lbl ? lbl.textContent : ''), run: function() { b.click(); } });
      });
      cmds.push({ label: t('cmd.generate'), run: function() {
        var p = document.querySelector('.tab-panel.active'); if (!p) return;
        var tab = p.id.replace('tab-', '');
        if (GEN_FN[tab]) window[GEN_FN[tab]]();
      } });
      cmds.push({ label: t('cmd.copyall'), run: function() { var b = document.getElementById('btnCopyAll'); if (b) b.click(); } });
      cmds.push({ label: t('cmd.filter'), run: function() { var f = document.getElementById('filterInput'); if (f) f.focus(); } });
      cmds.push({ label: t('cmd.expand'), run: function() { var b = document.getElementById('btnToggleAll'); if (b) b.click(); } });
      cmds.push({ label: t('cmd.zip'), run: function() { exportAllZip(); } });
      cmds.push({ label: t('cmd.share'), run: function() { shareLink(); } });
      cmds.push({ label: t('cmd.theme'), run: function() { var c = document.getElementById('themeToggle'); if (c) { c.checked = !c.checked; c.dispatchEvent(new Event('change')); } } });
      cmds.push({ label: t('cmd.lang'), run: function() { var c = document.getElementById('langToggle'); if (c) { c.checked = !c.checked; c.dispatchEvent(new Event('change')); } } });
      return cmds;
    }

    function render() {
      list.innerHTML = filtered.length
        ? filtered.map(function(c, i) { return '<div class="cmdk-item' + (i === sel ? ' active' : '') + '" data-i="' + i + '">' + escapeHtml(c.label) + '</div>'; }).join('')
        : '<div class="cmdk-empty">—</div>';
    }
    function refilter() {
      var q = input.value.toLowerCase();
      filtered = commands().filter(function(c) { return c.label.toLowerCase().indexOf(q) !== -1; });
      sel = 0; render();
    }
    function open() { overlay.style.display = 'flex'; input.value = ''; input.placeholder = t('pal.placeholder'); refilter(); input.focus(); }
    function close() { overlay.style.display = 'none'; }
    function run(i) { if (filtered[i]) { close(); filtered[i].run(); } }

    input.addEventListener('input', refilter);
    input.addEventListener('keydown', function(e) {
      if (e.key === 'ArrowDown') { e.preventDefault(); sel = Math.min(sel + 1, filtered.length - 1); render(); }
      else if (e.key === 'ArrowUp') { e.preventDefault(); sel = Math.max(sel - 1, 0); render(); }
      else if (e.key === 'Enter') { e.preventDefault(); run(sel); }
      else if (e.key === 'Escape') { close(); }
    });
    list.addEventListener('click', function(e) {
      var it = e.target.closest('.cmdk-item');
      if (it) run(parseInt(it.getAttribute('data-i'), 10));
    });
    overlay.addEventListener('click', function(e) { if (e.target === overlay) close(); });
    document.addEventListener('keydown', function(e) {
      if ((e.ctrlKey || e.metaKey) && (e.key === 'k' || e.key === 'K')) {
        e.preventDefault();
        overlay.style.display === 'none' ? open() : close();
      }
    });
  };
