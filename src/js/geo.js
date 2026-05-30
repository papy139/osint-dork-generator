  // ═══════════════════════════════════════
  // ZONES GÉOGRAPHIQUES (menu déroulant)
  // Régions, départements (FR) et pays — pour aider à remplir les champs de
  // localisation sans tout taper. La sélection est ajoutée à la liste du champ
  // (séparée par des virgules), format déjà consommé par les générateurs.
  // ═══════════════════════════════════════

  var GEO = {
    regions: [
      'Auvergne-Rhône-Alpes', 'Bourgogne-Franche-Comté', 'Bretagne',
      'Centre-Val de Loire', 'Corse', 'Grand Est', 'Hauts-de-France',
      'Île-de-France', 'Normandie', 'Nouvelle-Aquitaine', 'Occitanie',
      'Pays de la Loire', 'Provence-Alpes-Côte d\'Azur',
      'Guadeloupe', 'Martinique', 'Guyane', 'La Réunion', 'Mayotte'
    ],
    // Format "code nom" — la valeur insérée est le nom, le libellé affiche le code
    departements: [
      '01 Ain', '02 Aisne', '03 Allier', '04 Alpes-de-Haute-Provence',
      '05 Hautes-Alpes', '06 Alpes-Maritimes', '07 Ardèche', '08 Ardennes',
      '09 Ariège', '10 Aube', '11 Aude', '12 Aveyron', '13 Bouches-du-Rhône',
      '14 Calvados', '15 Cantal', '16 Charente', '17 Charente-Maritime',
      '18 Cher', '19 Corrèze', '2A Corse-du-Sud', '2B Haute-Corse',
      '21 Côte-d\'Or', '22 Côtes-d\'Armor', '23 Creuse', '24 Dordogne',
      '25 Doubs', '26 Drôme', '27 Eure', '28 Eure-et-Loir', '29 Finistère',
      '30 Gard', '31 Haute-Garonne', '32 Gers', '33 Gironde', '34 Hérault',
      '35 Ille-et-Vilaine', '36 Indre', '37 Indre-et-Loire', '38 Isère',
      '39 Jura', '40 Landes', '41 Loir-et-Cher', '42 Loire', '43 Haute-Loire',
      '44 Loire-Atlantique', '45 Loiret', '46 Lot', '47 Lot-et-Garonne',
      '48 Lozère', '49 Maine-et-Loire', '50 Manche', '51 Marne',
      '52 Haute-Marne', '53 Mayenne', '54 Meurthe-et-Moselle', '55 Meuse',
      '56 Morbihan', '57 Moselle', '58 Nièvre', '59 Nord', '60 Oise',
      '61 Orne', '62 Pas-de-Calais', '63 Puy-de-Dôme',
      '64 Pyrénées-Atlantiques', '65 Hautes-Pyrénées', '66 Pyrénées-Orientales',
      '67 Bas-Rhin', '68 Haut-Rhin', '69 Rhône', '70 Haute-Saône',
      '71 Saône-et-Loire', '72 Sarthe', '73 Savoie', '74 Haute-Savoie',
      '75 Paris', '76 Seine-Maritime', '77 Seine-et-Marne', '78 Yvelines',
      '79 Deux-Sèvres', '80 Somme', '81 Tarn', '82 Tarn-et-Garonne', '83 Var',
      '84 Vaucluse', '85 Vendée', '86 Vienne', '87 Haute-Vienne', '88 Vosges',
      '89 Yonne', '90 Territoire de Belfort', '91 Essonne', '92 Hauts-de-Seine',
      '93 Seine-Saint-Denis', '94 Val-de-Marne', '95 Val-d\'Oise',
      '971 Guadeloupe', '972 Martinique', '973 Guyane', '974 La Réunion',
      '976 Mayotte'
    ],
    pays: [
      'Afghanistan', 'Afrique du Sud', 'Albanie', 'Algérie', 'Allemagne',
      'Andorre', 'Angola', 'Antigua-et-Barbuda', 'Arabie saoudite', 'Argentine',
      'Arménie', 'Australie', 'Autriche', 'Azerbaïdjan', 'Bahamas', 'Bahreïn',
      'Bangladesh', 'Barbade', 'Belgique', 'Belize', 'Bénin', 'Bhoutan',
      'Biélorussie', 'Birmanie (Myanmar)', 'Bolivie', 'Bosnie-Herzégovine',
      'Botswana', 'Brésil', 'Brunei', 'Bulgarie', 'Burkina Faso', 'Burundi',
      'Cambodge', 'Cameroun', 'Canada', 'Cap-Vert', 'Chili', 'Chine', 'Chypre',
      'Colombie', 'Comores', 'Congo (Brazzaville)', 'Congo (RDC)',
      'Corée du Nord', 'Corée du Sud', 'Costa Rica', 'Côte d\'Ivoire',
      'Croatie', 'Cuba', 'Danemark', 'Djibouti', 'Dominique', 'Égypte',
      'Émirats arabes unis', 'Équateur', 'Érythrée', 'Espagne', 'Estonie',
      'Eswatini', 'États-Unis', 'Éthiopie', 'Fidji', 'Finlande', 'France',
      'Gabon', 'Gambie', 'Géorgie', 'Ghana', 'Grèce', 'Grenade', 'Guatemala',
      'Guinée', 'Guinée-Bissau', 'Guinée équatoriale', 'Guyana', 'Haïti',
      'Honduras', 'Hongrie', 'Inde', 'Indonésie', 'Irak', 'Iran', 'Irlande',
      'Islande', 'Israël', 'Italie', 'Jamaïque', 'Japon', 'Jordanie',
      'Kazakhstan', 'Kenya', 'Kirghizistan', 'Kiribati', 'Koweït', 'Laos',
      'Lesotho', 'Lettonie', 'Liban', 'Liberia', 'Libye', 'Liechtenstein',
      'Lituanie', 'Luxembourg', 'Macédoine du Nord', 'Madagascar', 'Malaisie',
      'Malawi', 'Maldives', 'Mali', 'Malte', 'Maroc', 'Îles Marshall',
      'Maurice', 'Mauritanie', 'Mexique', 'Micronésie', 'Moldavie', 'Monaco',
      'Mongolie', 'Monténégro', 'Mozambique', 'Namibie', 'Nauru', 'Népal',
      'Nicaragua', 'Niger', 'Nigeria', 'Norvège', 'Nouvelle-Zélande', 'Oman',
      'Ouganda', 'Ouzbékistan', 'Pakistan', 'Palaos', 'Palestine', 'Panama',
      'Papouasie-Nouvelle-Guinée', 'Paraguay', 'Pays-Bas', 'Pérou',
      'Philippines', 'Pologne', 'Portugal', 'Qatar',
      'République centrafricaine', 'République dominicaine',
      'République tchèque', 'Roumanie', 'Royaume-Uni', 'Russie', 'Rwanda',
      'Saint-Christophe-et-Niévès', 'Saint-Marin',
      'Saint-Vincent-et-les-Grenadines', 'Sainte-Lucie', 'Îles Salomon',
      'Salvador', 'Samoa', 'São Tomé-et-Principe', 'Sénégal', 'Serbie',
      'Seychelles', 'Sierra Leone', 'Singapour', 'Slovaquie', 'Slovénie',
      'Somalie', 'Soudan', 'Soudan du Sud', 'Sri Lanka', 'Suède', 'Suisse',
      'Suriname', 'Syrie', 'Tadjikistan', 'Tanzanie', 'Tchad', 'Thaïlande',
      'Timor oriental', 'Togo', 'Tonga', 'Trinité-et-Tobago', 'Tunisie',
      'Turkménistan', 'Turquie', 'Tuvalu', 'Ukraine', 'Uruguay', 'Vanuatu',
      'Vatican', 'Venezuela', 'Viêt Nam', 'Yémen', 'Zambie', 'Zimbabwe'
    ]
  };

  function buildGeoOptions() {
    function group(label, items, withCode) {
      var opts = items.map(function(it) {
        var value = it, text = it;
        if (withCode) {
          var sp = it.indexOf(' ');
          value = it.slice(sp + 1);
          text = it.slice(0, sp) + ' — ' + value;
        }
        return '<option value="' + escapeHtml(value) + '">' + escapeHtml(text) + '</option>';
      }).join('');
      return '<optgroup label="' + label + '">' + opts + '</optgroup>';
    }
    return '<option value="">+ Région / département / pays…</option>'
      + group('Régions', GEO.regions, false)
      + group('Départements', GEO.departements, true)
      + group('Pays', GEO.pays, false);
  }

  // Alimente chaque <select class="geo-select"> et ajoute la zone choisie à son champ cible
  window.initGeoSelects = function() {
    var html = buildGeoOptions();
    document.querySelectorAll('.geo-select').forEach(function(sel) {
      sel.innerHTML = html;
      sel.addEventListener('change', function() {
        var value = sel.value;
        if (!value) return;
        var target = document.getElementById(sel.getAttribute('data-target'));
        if (target) {
          var current = target.value.split(',').map(function(s) { return s.trim(); }).filter(Boolean);
          if (current.indexOf(value) === -1) current.push(value);
          target.value = current.join(', ');
          target.dispatchEvent(new Event('input', { bubbles: true }));
        }
        sel.value = '';
      });
    });
  };
