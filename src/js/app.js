  // Theme toggle
  (function() {
    var toggle = document.getElementById('themeToggle');
    var label = document.getElementById('themeLabel');
    var saved = localStorage.getItem('dork-theme');
    var prefersLight = window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches;
    function apply(light) {
      document.body.classList.toggle('light', light);
      toggle.checked = light;
      label.textContent = light ? 'Dark' : 'Light';
      try { localStorage.setItem('dork-theme', light ? 'light' : 'dark'); } catch(e) {}
    }
    apply(saved ? saved === 'light' : prefersLight);
    toggle.addEventListener('change', function() { apply(this.checked); });
  })();

  // Persistence

  var FIELDS = ['nom','prenom','variations','emails','telephones','dateNaissance','villes','dateDebut','dateFin','exclusions','pseudo','pseudoVariations','pseudoEmails','pseudoPlatforms','pseudoExclusions','domaine','ip','domaineExclusions','societe','siren','domaineSociete','emailsSociete','telephonesSociete','secteur','villeSociete','societeSociete','imageUrl','customDorks'];

  var TAB_FIELDS = {
    identite: ['nom','prenom','variations','emails','telephones','dateNaissance','villes','dateDebut','dateFin','exclusions'],
    pseudo:   ['pseudo','pseudoVariations','pseudoEmails','pseudoPlatforms','pseudoExclusions'],
    domaine:  ['domaine','ip','domaineExclusions'],
    societe:  ['societe','siren','domaineSociete','emailsSociete','telephonesSociete','secteur','villeSociete','societeSociete'],
    image:    ['imageUrl'],
    perso:    ['customDorks'],
  };

  window.clearTab = function(tab) {
    TAB_FIELDS[tab].forEach(function(id) {
      document.getElementById(id).value = '';
    });
    saveFields();
    document.getElementById('results').innerHTML = '<div class="empty-state"><span class="prompt-char">_</span>Remplissez le formulaire et lancez la génération.</div>';
    showToast('Formulaire effacé.');
  };

  function saveFields() {
    var data = {};
    FIELDS.forEach(function(id) { data[id] = document.getElementById(id).value; });
    try { localStorage.setItem('dork-form', JSON.stringify(data)); } catch(e) {}
  }

  function restoreFields() {
    try {
      var data = JSON.parse(localStorage.getItem('dork-form') || '{}');
      FIELDS.forEach(function(id) { if (data[id]) document.getElementById(id).value = data[id]; });
    } catch(e) {}
  }

  FIELDS.forEach(function(id) { document.getElementById(id).addEventListener('input', saveFields); });
  restoreFields();

  // Menus déroulants régions / départements / pays
  if (window.initGeoSelects) window.initGeoSelects();

  // Accessibilité + indication des raccourcis (Alt+N) sur les onglets
  document.querySelectorAll('.tab-btn').forEach(function(b, i) {
    b.setAttribute('role', 'tab');
    b.setAttribute('aria-selected', b.classList.contains('active') ? 'true' : 'false');
    var lbl = b.querySelector('.tab-label');
    b.title = (lbl ? lbl.textContent + ' — ' : '') + 'Alt+' + (i + 1);
  });
  document.querySelectorAll('.tab-panel').forEach(function(p) { p.setAttribute('role', 'tabpanel'); });

  // Pré-remplissage depuis un lien partageable (#d=<base64 JSON>) — prioritaire sur la restauration
  (function() {
    if (location.hash.indexOf('#d=') !== 0) return;
    try {
      var json = decodeURIComponent(escape(atob(location.hash.slice(3))));
      var data = JSON.parse(json);
      FIELDS.forEach(function(id) { if (data[id] != null) document.getElementById(id).value = data[id]; });
      saveFields();
      showToast('Formulaire chargé depuis le lien.');
    } catch(e) {}
  })();

  // Génère un lien contenant le formulaire pré-rempli (les valeurs sont dans l'URL)
  window.shareLink = function() {
    var data = {};
    FIELDS.forEach(function(id) { data[id] = document.getElementById(id).value; });
    var encoded = btoa(unescape(encodeURIComponent(JSON.stringify(data))));
    var url = location.href.split('#')[0] + '#d=' + encoded;
    navigator.clipboard.writeText(url)
      .then(function() { showToast('Lien partageable copié.'); })
      .catch(function() { showToast('Copie impossible.'); });
  };

  // Raccourcis Alt+1..5 : bascule d'onglet
  document.addEventListener('keydown', function(e) {
    if (e.altKey && !e.ctrlKey && !e.metaKey && e.key >= '1' && e.key <= '7') {
      var btns = document.querySelectorAll('.tab-btn');
      var i = parseInt(e.key, 10) - 1;
      if (btns[i]) { e.preventDefault(); btns[i].click(); }
    }
  });

  // Garde-fou dev : signale un champ persistant oublié dans FIELDS
  document.querySelectorAll('input[id]:not([type=checkbox]):not([type=file]), textarea[id], select[id]').forEach(function(el) {
    if (['engine', 'targetSelect'].indexOf(el.id) === -1 && FIELDS.indexOf(el.id) === -1)
      console.warn('[dork] champ non persistant (absent de FIELDS) : #' + el.id);
  });

  // Entrée dans un champ texte → lance la génération de l'onglet courant (sauf textarea)
  var GEN_FN = { identite: 'generate', pseudo: 'generatePseudo', domaine: 'generateDomaine', societe: 'generateSociete', image: 'generateImage', correlation: 'generateCorrelation', perso: 'generateCustom' };
  FIELDS.forEach(function(id) {
    var el = document.getElementById(id);
    if (el.tagName === 'TEXTAREA') return;
    el.addEventListener('keydown', function(e) {
      if (e.key !== 'Enter') return;
      var panel = el.closest('.tab-panel');
      if (!panel) return;
      var tab = panel.id.replace('tab-', '');
      if (GEN_FN[tab]) { e.preventDefault(); window[GEN_FN[tab]](); }
    });
  });

  // Restaure le dernier onglet actif
  (function() {
    var savedTab = null;
    try { savedTab = localStorage.getItem('dork-tab'); } catch(e) {}
    if (!savedTab) return;
    document.querySelectorAll('.tab-btn').forEach(function(b) {
      if (b.getAttribute('onclick').indexOf("'" + savedTab + "'") !== -1) b.click();
    });
  })();

  // ── Moteur : persistance du choix ──
  (function() {
    var sel = document.getElementById('engine');
    if (!sel) return;
    var saved = localStorage.getItem('dork-engine');
    if (saved) sel.value = saved;
    sel.addEventListener('change', function() { localStorage.setItem('dork-engine', sel.value); });
  })();

  // ── Historique des cibles ──
  // Une cible = snapshot de TOUS les champs (FIELDS) sous un nom, en localStorage.

  function loadTargets() {
    try { return JSON.parse(localStorage.getItem('dork-targets') || '{}'); } catch(e) { return {}; }
  }

  function refreshTargetSelect(selected) {
    var sel = document.getElementById('targetSelect');
    if (!sel) return;
    var targets = loadTargets();
    var names = Object.keys(targets).sort();
    sel.innerHTML = '<option value="">— nouvelle cible —</option>'
      + names.map(function(n) {
          return '<option value="' + escapeHtml(n) + '">' + escapeHtml(n) + '</option>';
        }).join('');
    sel.value = selected || '';
  }

  window.saveTarget = function() {
    var current = document.getElementById('targetSelect').value;
    var name = prompt('Nom de la cible :', current || '');
    if (name === null) return;
    name = name.trim();
    if (!name) { showToast('Nom vide.'); return; }
    var targets = loadTargets();
    var snap = {};
    FIELDS.forEach(function(id) { snap[id] = document.getElementById(id).value; });
    targets[name] = snap;
    try {
      localStorage.setItem('dork-targets', JSON.stringify(targets));
    } catch(e) {
      showToast('Espace de stockage plein — cible non sauvegardée.');
      return;
    }
    refreshTargetSelect(name);
    showToast('Cible « ' + name + ' » sauvegardée.');
  };

  window.deleteTarget = function() {
    var sel = document.getElementById('targetSelect');
    var name = sel.value;
    if (!name) { showToast('Aucune cible sélectionnée.'); return; }
    if (!confirm('Supprimer la cible « ' + name + ' » ?')) return;
    var targets = loadTargets();
    delete targets[name];
    try { localStorage.setItem('dork-targets', JSON.stringify(targets)); } catch(e) {}
    refreshTargetSelect('');
    showToast('Cible supprimée.');
  };

  window.renameTarget = function() {
    var name = document.getElementById('targetSelect').value;
    if (!name) { showToast('Aucune cible sélectionnée.'); return; }
    var newName = prompt('Nouveau nom :', name);
    if (newName === null) return;
    newName = newName.trim();
    if (!newName) { showToast('Nom vide.'); return; }
    if (newName === name) return;
    var targets = loadTargets();
    targets[newName] = targets[name];
    delete targets[name];
    try {
      localStorage.setItem('dork-targets', JSON.stringify(targets));
    } catch(e) {
      showToast('Espace de stockage plein.');
      return;
    }
    refreshTargetSelect(newName);
    showToast('Cible renommée « ' + newName +' ».');
  };

  window.exportTargets = function() {
    var targets = loadTargets();
    if (Object.keys(targets).length === 0) { showToast('Aucune cible à exporter.'); return; }
    var blob = new Blob([JSON.stringify(targets, null, 2)], { type: 'application/json' });
    var a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'dork-cibles-' + new Date().toISOString().slice(0, 10) + '.json';
    a.click();
    setTimeout(function() { URL.revokeObjectURL(a.href); }, 100);
    showToast('Cibles exportées.');
  };

  window.importTargets = function(input) {
    var file = input.files && input.files[0];
    if (!file) return;
    var reader = new FileReader();
    reader.onload = function() {
      var imported;
      try { imported = JSON.parse(reader.result); } catch(e) { showToast('Fichier JSON invalide.'); return; }
      if (!imported || typeof imported !== 'object' || Array.isArray(imported)) { showToast('Format invalide.'); return; }
      var targets = loadTargets();
      var count = 0;
      Object.keys(imported).forEach(function(name) {
        if (imported[name] && typeof imported[name] === 'object') { targets[name] = imported[name]; count++; }
      });
      try { localStorage.setItem('dork-targets', JSON.stringify(targets)); }
      catch(e) { showToast('Espace de stockage plein — import incomplet.'); }
      refreshTargetSelect('');
      showToast(count + ' cible(s) importée(s).');
    };
    reader.readAsText(file);
    input.value = '';
  };

  (function() {
    var sel = document.getElementById('targetSelect');
    if (!sel) return;
    refreshTargetSelect('');
    sel.addEventListener('change', function() {
      var name = sel.value;
      if (!name) return;
      var targets = loadTargets();
      var snap = targets[name];
      if (!snap) return;
      FIELDS.forEach(function(id) { document.getElementById(id).value = snap[id] || ''; });
      saveFields();
      showToast('Cible « ' + name + ' » chargée.');
    });
  })();
