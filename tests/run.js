#!/usr/bin/env node
/*
 * Tests des fonctions pures (sans dépendance).
 * Charge les fragments helpers.js + links.js dans un bac à sable fournissant
 * des stubs minimaux de window/document/navigator, puis exécute des assertions.
 *
 * Usage : node tests/run.js   (ou : npm test)
 */
'use strict';
const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, '..', 'src', 'js');
const code = ['helpers', 'links', 'geo', 'zip']
  .map((f) => fs.readFileSync(path.join(srcDir, f + '.js'), 'utf8'))
  .join('\n\n');

// Le code source n'est pas en mode strict ; new Function l'exécute hors strict,
// ce qui permet de récupérer les déclarations de fonctions via le return.
const factory = new Function(
  'window', 'document', 'navigator',
  code + '\n;return {' +
    'cleanDomain, phoneVariants, pseudoVariants, buildNameQuery,' +
    'buildEmailVariations, buildLocationQuery, crc32,' +
    'sherlockLinks, domainLinks, ipLinks, societeLinks, identiteLinks, imageLinks, phoneLinks, md5, buildGeoOptions, SHERLOCK, GEO' +
  '};'
);
// Stub d'élément suffisant pour escapeHtml (textContent -> innerHTML échappé)
function fakeEl() {
  var el = {};
  Object.defineProperty(el, 'textContent', {
    set: function(v) { this._html = String(v).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); },
    get: function() { return this._t; }
  });
  Object.defineProperty(el, 'innerHTML', { get: function() { return this._html; } });
  return el;
}
const H = factory(
  {},
  { getElementById() { return { value: '' }; }, createElement() { return fakeEl(); } },
  {}
);

let pass = 0, fail = 0;
function ok(label, cond) {
  if (cond) { pass++; }
  else { fail++; console.error('  ✗ ' + label); }
}
function eq(label, a, b) { ok(label + ' (= ' + JSON.stringify(b) + ', reçu ' + JSON.stringify(a) + ')', a === b); }

// cleanDomain
eq('cleanDomain schéma+port+chemin', H.cleanDomain('https://www.Exemple.com:8080/page?q=1#x'), 'www.exemple.com');
eq('cleanDomain identifiants', H.cleanDomain('user:pass@Example.COM/p'), 'example.com');
eq('cleanDomain vide', H.cleanDomain(''), '');
eq('cleanDomain nu', H.cleanDomain('example.com'), 'example.com');

// phoneVariants
ok('phoneVariants national → 5 formats', H.phoneVariants('0612345678').length === 5);
ok('phoneVariants contient +33', H.phoneVariants('0612345678').indexOf('+33612345678') !== -1);
eq('phoneVariants international → national', H.phoneVariants('+33 6 12 34 56 78')[0], '0612345678');
ok('phoneVariants invalide → tel quel', JSON.stringify(H.phoneVariants('abc')) === '["abc"]');

// pseudoVariants
ok('pseudoVariants séparateurs', H.pseudoVariants('shadow_killer').indexOf('shadowkiller') !== -1);
ok('pseudoVariants leet', H.pseudoVariants('shadow_killer').indexOf('5h4d0w_k1ll3r') !== -1);
ok('pseudoVariants vide', H.pseudoVariants('').length === 0);

// buildNameQuery
eq('buildNameQuery nom+prénom', H.buildNameQuery('Dupont', 'Jean', []), '"Jean Dupont" OR "Dupont Jean"');
eq('buildNameQuery variations seules', H.buildNameQuery('', '', ['alias']), '"alias"');

// buildEmailVariations
ok('buildEmailVariations prenom.nom', H.buildEmailVariations('Dupont', 'Jean').indexOf('jean.dupont') !== -1);
ok('buildEmailVariations initiale+nom', H.buildEmailVariations('Dupont', 'Jean').indexOf('jdupont') !== -1);

// crc32 (vecteur de référence : "123456789" → 0xCBF43926)
eq('crc32 vecteur de référence', H.crc32([0x31,0x32,0x33,0x34,0x35,0x36,0x37,0x38,0x39]), 0xcbf43926);

// liens
ok('sherlockLinks multiplie pseudos × plateformes', H.sherlockLinks(['a','b']).length === 2 * H.SHERLOCK.length);
ok('sherlockLinks URL GitHub', H.sherlockLinks(['john'])[0].url.indexOf('github.com/john') !== -1);
ok('domainLinks crt.sh', H.domainLinks('example.com').some(function(l){ return l.url.indexOf('crt.sh/?q=example.com') !== -1; }));
ok('ipLinks shodan host', H.ipLinks('1.2.3.4')[0].url.indexOf('shodan.io/host/1.2.3.4') !== -1);
ok('societeLinks pappers', H.societeLinks('ACME', null, null).some(function(l){ return l.url.indexOf('pappers.fr') !== -1; }));
ok('identiteLinks HIBP par email', H.identiteLinks('Dupont','Jean',['a@b.com']).some(function(l){ return l.label.indexOf('HaveIBeenPwned') !== -1; }));
ok('imageLinks Google Lens', H.imageLinks('http://x/y.jpg')[0].url.indexOf('lens.google.com/uploadbyurl?url=') !== -1);
ok('imageLinks encode l\'URL', H.imageLinks('http://x/y.jpg').some(function(l){ return l.url.indexOf('http%3A%2F%2Fx%2Fy.jpg') !== -1; }));

// md5 (vecteurs de référence)
eq('md5 chaîne vide', H.md5(''), 'd41d8cd98f00b204e9800998ecf8427e');
eq('md5 "abc"', H.md5('abc'), '900150983cd24fb0d6963f7d28e17f72');
eq('md5 email gravatar', H.md5('test@example.com'), '55502f40dc8b7c769880b10874abc9d0');

// phoneLinks
ok('phoneLinks Truecaller intl', H.phoneLinks('0612345678').some(function(l){ return l.url.indexOf('truecaller.com/search/fr/33612345678') !== -1; }));
ok('phoneLinks 5 entrées', H.phoneLinks('0612345678').length === 5);

// identiteLinks enrichi (Gravatar)
ok('identiteLinks Gravatar', H.identiteLinks('Dupont','Jean',['a@b.com']).some(function(l){ return l.label.indexOf('Gravatar') !== -1; }));

// données géographiques
ok('GEO régions = 18', H.GEO.regions.length === 18);
ok('GEO départements = 101', H.GEO.departements.length === 101);
ok('GEO pays >= 190', H.GEO.pays.length >= 190);
ok('GEO pays format "ISO2 nom"', H.GEO.pays.every(function(p){ return /^[A-Z]{2} \S/.test(p); }));

// buildGeoOptions (rendu des <option>/<optgroup>)
var geoHtml = H.buildGeoOptions();
ok('buildGeoOptions optgroups', geoHtml.indexOf('<optgroup label="Pays">') !== -1 && geoHtml.indexOf('<optgroup label="Régions">') !== -1);
ok('buildGeoOptions drapeau pays', geoHtml.indexOf('🇫🇷 France') !== -1);
ok('buildGeoOptions valeur = nom (sans code)', geoHtml.indexOf('value="France"') !== -1 && geoHtml.indexOf('value="Île-de-France"') !== -1);
ok('GEO départements format "code nom"', /^\d{2,3} \S/.test(H.GEO.departements[0]));

console.log('\n' + pass + ' réussis, ' + fail + ' échoués');
process.exit(fail ? 1 : 0);
