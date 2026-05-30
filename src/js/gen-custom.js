  window.generateCustom = function(silent) {
    var raw = document.getElementById('customDorks').value;
    var dorks = raw.split('\n').map(function(l) { return l.trim(); }).filter(Boolean);
    if (dorks.length === 0) {
      if (silent) return null;
      showToast('Saisissez au moins un dork (une ligne par requête).');
      return;
    }
    var categories = [{ icon: '⚙️', title: 'Champs perso', dorks: dorks }];
    if (silent) return { categories: categories, values: [] };
    renderResults(categories);
  };
