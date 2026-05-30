  // Recoupement : combine les identifiants saisis dans les autres onglets
  // (nom, pseudo, email, domaine, société, ville) pour trouver les pages qui
  // les associent — confirme qu'ils désignent la même cible.
  window.generateCorrelation = function(silent) {
    var nom = val('nom'), prenom = val('prenom');
    var names = [];
    if (nom && prenom) { names.push('"' + prenom + ' ' + nom + '"', '"' + nom + ' ' + prenom + '"'); }
    else if (nom) names.push('"' + nom + '"');
    else if (prenom) names.push('"' + prenom + '"');
    var nameQ = names.length ? '(' + names.join(' OR ') + ')' : '';

    var pseudos = [val('pseudo')].concat(list('pseudoVariations')).filter(Boolean);
    var pseudoQ = pseudos.length ? '(' + pseudos.map(function(p) { return '"' + p + '"'; }).join(' OR ') + ')' : '';

    var emails = Array.from(new Set(list('emails').concat(list('pseudoEmails')).concat(list('emailsSociete'))));
    var emailQ = emails.length ? '(' + emails.map(function(e) { return '"' + e + '"'; }).join(' OR ') + ')' : '';

    var domaine = cleanDomain(val('domaine')) || cleanDomain(val('domaineSociete'));
    var societe = val('societe');
    var societeQ = societe ? '"' + societe + '"' : '';
    var villes = Array.from(new Set(list('villes').concat(list('villeSociete'))));
    var villeQ = villes.length ? '(' + villes.map(function(v) { return '"' + v + '"'; }).join(' OR ') + ')' : '';

    var present = [nameQ, pseudoQ, emailQ, domaine, societeQ].filter(Boolean);
    if (present.length < 2) {
      if (silent) return null;
      showToast('Renseignez au moins deux identifiants (nom, pseudo, email, domaine, société) dans les onglets.');
      return;
    }

    var dorks = [];
    function pair(a, b) { if (a && b) dorks.push(a + ' ' + b); }

    pair(nameQ, pseudoQ);
    pair(nameQ, emailQ);
    pair(nameQ, societeQ);
    pair(nameQ, villeQ);
    if (nameQ && domaine) { dorks.push(nameQ + ' "' + domaine + '"'); dorks.push(nameQ + ' site:' + domaine); }

    pair(pseudoQ, emailQ);
    pair(pseudoQ, societeQ);
    if (pseudoQ && domaine) dorks.push(pseudoQ + ' "' + domaine + '"');

    pair(emailQ, societeQ);
    if (emailQ && domaine) dorks.push(emailQ + ' "' + domaine + '"');

    if (nameQ && pseudoQ && emailQ) dorks.push(nameQ + ' ' + pseudoQ + ' ' + emailQ);
    if (nameQ && pseudoQ && villeQ) dorks.push(nameQ + ' ' + pseudoQ + ' ' + villeQ);

    dorks = Array.from(new Set(dorks)).filter(Boolean);

    var categories = [{
      icon: '🧩', title: 'Recoupement d\'identifiants',
      desc: 'Requêtes combinant plusieurs identifiants de la cible pour trouver les pages qui les associent',
      dorks: dorks
    }];

    if (silent) return { categories: categories, values: [] };
    renderResults(categories);
  };
