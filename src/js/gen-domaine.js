  window.generateDomaine = function(silent) {
    var domaine = cleanDomain(val('domaine'));
    var ip = val('ip');
    var excl = list('domaineExclusions');

    if (!domaine && !ip) {
      if (silent) return null;
      showToast('Remplissez au moins le domaine ou l\'IP.');
      return;
    }

    var exclQ = excl.map(function(s) { return '-site:' + s; }).join(' ');
    var categories = [];

    // ── 0. TOUT-EN-UN ──
    var aioD = [];
    if (domaine) {
      aioD.push('site:' + domaine + ' (intitle:"index of" OR intitle:"admin" OR inurl:"login" OR inurl:"wp-admin" OR inurl:"config")');
      aioD.push('site:' + domaine + ' (filetype:env OR filetype:sql OR filetype:log OR filetype:bak OR filetype:conf OR filetype:xml)');
      aioD.push('"' + domaine + '" (intext:"password" OR intext:"passwd" OR intext:"credentials" OR intext:"secret") (site:pastebin.com OR site:github.com OR site:gitlab.com)');
    }
    if (ip) {
      aioD.push('"' + ip + '" (site:shodan.io OR site:censys.io OR site:abuseipdb.com)');
      aioD.push('"' + ip + '" (intext:"password" OR intext:"credentials" OR intext:"secret") (site:pastebin.com OR site:github.com)');
    }
    if (aioD.length > 0) {
      categories.push({ icon: '🚀', title: 'TOUT-EN-UN — Scan infrastructure', dorks: aioD });
    }

    // ── 1. Reconnaissance générale ──
    if (domaine) {
      var recoD = [
        'site:' + domaine,
        '"' + domaine + '" (site:shodan.io OR site:censys.io OR site:zoomeye.org)',
        '"' + domaine + '" (site:whois.domaintools.com OR site:who.is OR site:viewdns.info)',
        '"' + domaine + '" (site:web.archive.org OR site:cachedview.nl)',
        '"' + domaine + '" (site:crt.sh OR site:transparencyreport.google.com)',
      ];
      categories.push({ icon: '🔍', title: 'Reconnaissance générale', dorks: recoD });
    }

    // ── 2. Sous-domaines ──
    if (domaine) {
      var base = domaine.replace(/^www\./, '');
      var subD = [
        'site:*.' + base,
        'site:' + base + ' -site:www.' + base,
        '".' + base + '" (site:crt.sh OR site:dnsdumpster.com)',
        'inurl:".' + base + '"',
        '"' + base + '" (intext:"subdomain" OR intext:"sous-domaine" OR intext:"vhost")',
      ];
      categories.push({ icon: '🌿', title: 'Sous-domaines', dorks: subD });
    }

    // ── 3. Fichiers sensibles exposés ──
    if (domaine) {
      var filesD = [
        'site:' + domaine + ' (filetype:env OR filetype:cfg OR filetype:conf)',
        'site:' + domaine + ' (filetype:sql OR filetype:db OR filetype:sqlite)',
        'site:' + domaine + ' (filetype:log OR filetype:bak OR filetype:backup OR filetype:old)',
        'site:' + domaine + ' (filetype:xml OR filetype:json OR filetype:yaml OR filetype:yml)',
        'site:' + domaine + ' (filetype:pem OR filetype:key OR filetype:crt OR filetype:p12)',
        'site:' + domaine + ' (inurl:".git" OR inurl:".svn" OR inurl:".env" OR inurl:"wp-config")',
      ];
      categories.push({ icon: '📄', title: 'Fichiers sensibles exposés', dorks: filesD });
    }

    // ── 4. Panneaux d'administration ──
    if (domaine) {
      var adminD = [
        'site:' + domaine + ' (inurl:admin OR inurl:login OR inurl:dashboard OR inurl:panel)',
        'site:' + domaine + ' (inurl:wp-admin OR inurl:wp-login OR inurl:phpmyadmin)',
        'site:' + domaine + ' (intitle:"admin" OR intitle:"login" OR intitle:"dashboard" OR intitle:"panel")',
        'site:' + domaine + ' (inurl:cpanel OR inurl:webmail OR inurl:plesk OR inurl:directadmin)',
        'site:' + domaine + ' (intitle:"phpMyAdmin" OR intitle:"Adminer" OR intitle:"Webmin")',
      ];
      categories.push({ icon: '🔐', title: 'Panneaux d\'administration', dorks: adminD });
    }

    // ── 5. Listing de répertoires ──
    if (domaine) {
      var dirD = [
        'site:' + domaine + ' intitle:"index of"',
        'site:' + domaine + ' intitle:"index of /" "parent directory"',
        'site:' + domaine + ' intitle:"index of" (intext:"backup" OR intext:"upload" OR intext:"config" OR intext:"log")',
        'site:' + domaine + ' intitle:"Directory listing"',
      ];
      categories.push({ icon: '📂', title: 'Listing de répertoires', dorks: dirD });
    }

    // ── 6. Erreurs & debug ──
    if (domaine) {
      var errD = [
        'site:' + domaine + ' (intitle:"error" OR intitle:"exception" OR intitle:"warning" OR intitle:"500")',
        'site:' + domaine + ' (intext:"stack trace" OR intext:"Fatal error" OR intext:"Warning:" OR intext:"Notice:")',
        'site:' + domaine + ' (intext:"SQL syntax" OR intext:"mysql_fetch" OR intext:"ORA-" OR intext:"pg_query")',
        'site:' + domaine + ' (intext:"debug" OR intext:"verbose" OR intext:"development mode")',
      ];
      categories.push({ icon: '⚠️', title: 'Erreurs & debug', dorks: errD });
    }

    // ── 7. APIs & endpoints ──
    if (domaine) {
      var apiD = [
        'site:' + domaine + ' (inurl:api OR inurl:v1 OR inurl:v2 OR inurl:graphql OR inurl:swagger)',
        'site:' + domaine + ' (inurl:"/api/" OR inurl:"/rest/" OR inurl:"/ws/")',
        'site:' + domaine + ' filetype:json (inurl:api OR inurl:data OR inurl:export)',
        'site:' + domaine + ' (intitle:"swagger" OR intitle:"API documentation" OR intitle:"Redoc")',
      ];
      categories.push({ icon: '🔌', title: 'APIs & endpoints', dorks: apiD });
    }

    // ── 8. Fuites sur repos & pastebins ──
    if (domaine) {
      var leakD = [
        '"' + domaine + '" (' + SITES.pasteShort + ')',
        '"' + domaine + '" (' + SITES.repos + ')',
        '"' + domaine + '" (intext:"password" OR intext:"token" OR intext:"api_key" OR intext:"secret") site:github.com',
        '"@' + domaine + '" (site:pastebin.com OR site:github.com OR site:gitlab.com)',
        '"' + domaine + '" (site:shodan.io OR site:ivre.rocks OR site:fofa.info)',
      ];
      categories.push({ icon: '💀', title: 'Fuites & expositions', dorks: leakD });
    }

    // ── 9. Adresse IP ──
    if (ip) {
      var ipD = [
        '"' + ip + '"',
        '"' + ip + '" (site:shodan.io OR site:censys.io OR site:fofa.info OR site:zoomeye.org)',
        '"' + ip + '" (site:abuseipdb.com OR site:virustotal.com OR site:threatcrowd.org)',
        '"' + ip + '" (intext:"open port" OR intext:"service" OR intext:"banner")',
        '"' + ip + '" (site:pastebin.com OR site:github.com)',
      ];
      if (domaine) ipD.push('"' + ip + '" "' + domaine + '"');
      categories.push({ icon: '🖥️', title: 'Adresse IP', dorks: ipD });
    }

    // ── 10. Technologies & CMS ──
    if (domaine) {
      var techD = [
        'site:' + domaine + ' (intext:"Powered by WordPress" OR intext:"wp-content" OR intext:"wp-includes")',
        'site:' + domaine + ' (intext:"Powered by Drupal" OR intext:"Joomla!" OR intext:"TYPO3")',
        'site:' + domaine + ' (intext:"Laravel" OR intext:"Symfony" OR intext:"Django" OR intext:"Rails")',
        'site:' + domaine + ' (intext:"X-Powered-By" OR intext:"Server:" OR intext:"ASP.NET")',
      ];
      categories.push({ icon: '⚙️', title: 'Technologies & CMS', dorks: techD });
    }

    if (exclQ) {
      categories.forEach(function(cat) {
        cat.dorks = cat.dorks.map(function(d) { return d + ' ' + exclQ; });
      });
    }

    // ── Liens directs (outils OSINT pré-remplis) — non concernés par les exclusions ──
    var dLinks = [];
    if (domaine) dLinks = dLinks.concat(domainLinks(domaine));
    if (ip) dLinks = dLinks.concat(ipLinks(ip));
    if (dLinks.length) {
      categories.push({
        icon: '🔗', title: 'Liens directs — outils',
        desc: 'Outils OSINT pré-remplis (crt.sh, Shodan, VirusTotal…) — ouvre directement',
        links: dLinks
      });
    }

    if (silent) return { categories: categories, values: [domaine, ip].filter(Boolean) };
    renderResults(categories);
  };
