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
    // Format "ISO2 nom" — le drapeau est calculé depuis le code, la valeur insérée est le nom
    pays: [
      'AF Afghanistan', 'ZA Afrique du Sud', 'AL Albanie', 'DZ Algérie',
      'DE Allemagne', 'AD Andorre', 'AO Angola', 'AG Antigua-et-Barbuda',
      'SA Arabie saoudite', 'AR Argentine', 'AM Arménie', 'AU Australie',
      'AT Autriche', 'AZ Azerbaïdjan', 'BS Bahamas', 'BH Bahreïn',
      'BD Bangladesh', 'BB Barbade', 'BE Belgique', 'BZ Belize', 'BJ Bénin',
      'BT Bhoutan', 'BY Biélorussie', 'MM Birmanie (Myanmar)', 'BO Bolivie',
      'BA Bosnie-Herzégovine', 'BW Botswana', 'BR Brésil', 'BN Brunei',
      'BG Bulgarie', 'BF Burkina Faso', 'BI Burundi', 'KH Cambodge',
      'CM Cameroun', 'CA Canada', 'CV Cap-Vert', 'CL Chili', 'CN Chine',
      'CY Chypre', 'CO Colombie', 'KM Comores', 'CG Congo (Brazzaville)',
      'CD Congo (RDC)', 'KP Corée du Nord', 'KR Corée du Sud', 'CR Costa Rica',
      'CI Côte d\'Ivoire', 'HR Croatie', 'CU Cuba', 'DK Danemark', 'DJ Djibouti',
      'DM Dominique', 'EG Égypte', 'AE Émirats arabes unis', 'EC Équateur',
      'ER Érythrée', 'ES Espagne', 'EE Estonie', 'SZ Eswatini', 'US États-Unis',
      'ET Éthiopie', 'FJ Fidji', 'FI Finlande', 'FR France', 'GA Gabon',
      'GM Gambie', 'GE Géorgie', 'GH Ghana', 'GR Grèce', 'GD Grenade',
      'GT Guatemala', 'GN Guinée', 'GW Guinée-Bissau', 'GQ Guinée équatoriale',
      'GY Guyana', 'HT Haïti', 'HN Honduras', 'HU Hongrie', 'IN Inde',
      'ID Indonésie', 'IQ Irak', 'IR Iran', 'IE Irlande', 'IS Islande',
      'IL Israël', 'IT Italie', 'JM Jamaïque', 'JP Japon', 'JO Jordanie',
      'KZ Kazakhstan', 'KE Kenya', 'KG Kirghizistan', 'KI Kiribati',
      'KW Koweït', 'LA Laos', 'LS Lesotho', 'LV Lettonie', 'LB Liban',
      'LR Liberia', 'LY Libye', 'LI Liechtenstein', 'LT Lituanie',
      'LU Luxembourg', 'MK Macédoine du Nord', 'MG Madagascar', 'MY Malaisie',
      'MW Malawi', 'MV Maldives', 'ML Mali', 'MT Malte', 'MA Maroc',
      'MH Îles Marshall', 'MU Maurice', 'MR Mauritanie', 'MX Mexique',
      'FM Micronésie', 'MD Moldavie', 'MC Monaco', 'MN Mongolie',
      'ME Monténégro', 'MZ Mozambique', 'NA Namibie', 'NR Nauru', 'NP Népal',
      'NI Nicaragua', 'NE Niger', 'NG Nigeria', 'NO Norvège',
      'NZ Nouvelle-Zélande', 'OM Oman', 'UG Ouganda', 'UZ Ouzbékistan',
      'PK Pakistan', 'PW Palaos', 'PS Palestine', 'PA Panama',
      'PG Papouasie-Nouvelle-Guinée', 'PY Paraguay', 'NL Pays-Bas', 'PE Pérou',
      'PH Philippines', 'PL Pologne', 'PT Portugal', 'QA Qatar',
      'CF République centrafricaine', 'DO République dominicaine',
      'CZ République tchèque', 'RO Roumanie', 'GB Royaume-Uni', 'RU Russie',
      'RW Rwanda', 'KN Saint-Christophe-et-Niévès', 'SM Saint-Marin',
      'VC Saint-Vincent-et-les-Grenadines', 'LC Sainte-Lucie', 'SB Îles Salomon',
      'SV Salvador', 'WS Samoa', 'ST São Tomé-et-Principe', 'SN Sénégal',
      'RS Serbie', 'SC Seychelles', 'SL Sierra Leone', 'SG Singapour',
      'SK Slovaquie', 'SI Slovénie', 'SO Somalie', 'SD Soudan',
      'SS Soudan du Sud', 'LK Sri Lanka', 'SE Suède', 'CH Suisse',
      'SR Suriname', 'SY Syrie', 'TJ Tadjikistan', 'TZ Tanzanie', 'TD Tchad',
      'TH Thaïlande', 'TL Timor oriental', 'TG Togo', 'TO Tonga',
      'TT Trinité-et-Tobago', 'TN Tunisie', 'TM Turkménistan', 'TR Turquie',
      'TV Tuvalu', 'UA Ukraine', 'UY Uruguay', 'VU Vanuatu', 'VA Vatican',
      'VE Venezuela', 'VN Viêt Nam', 'YE Yémen', 'ZM Zambie', 'ZW Zimbabwe'
    ]
  };

  // Drapeau emoji depuis un code pays ISO 3166-1 alpha-2
  function flagEmoji(cc) {
    return cc.toUpperCase().replace(/[A-Z]/g, function(c) {
      return String.fromCodePoint(0x1F1E6 + c.charCodeAt(0) - 65);
    });
  }

  function buildGeoOptions() {
    // mode : 'plain' (valeur = libellé), 'code' ("CC nom" → libellé "CC — nom"),
    //        'flag' ("CC nom" → libellé "🏳 nom")
    function group(label, items, mode) {
      var opts = items.map(function(it) {
        var value = it, text = it;
        if (mode === 'code' || mode === 'flag') {
          var sp = it.indexOf(' ');
          var code = it.slice(0, sp);
          value = it.slice(sp + 1);
          text = (mode === 'flag' ? flagEmoji(code) + ' ' : code + ' — ') + value;
        }
        return '<option value="' + escapeHtml(value) + '">' + escapeHtml(text) + '</option>';
      }).join('');
      return '<optgroup label="' + label + '">' + opts + '</optgroup>';
    }
    return '<option value="">+ Région / département / pays…</option>'
      + group('Régions', GEO.regions, 'plain')
      + group('Départements', GEO.departements, 'code')
      + group('Pays', GEO.pays, 'flag');
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
