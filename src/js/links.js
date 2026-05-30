  // ═══════════════════════════════════════
  // LIENS DIRECTS (style Sherlock)
  // Pas de vérification réseau (file:// + CORS) — on génère des URLs
  // directement ouvrables vers les profils/outils potentiels.
  // ═══════════════════════════════════════

  // Plateformes à profil adressable par pseudo ({} = nom d'utilisateur)
  var SHERLOCK = [
    { name: 'GitHub',       url: 'https://github.com/{}' },
    { name: 'GitLab',       url: 'https://gitlab.com/{}' },
    { name: 'Bitbucket',    url: 'https://bitbucket.org/{}/' },
    { name: 'Twitter / X',  url: 'https://twitter.com/{}' },
    { name: 'Instagram',    url: 'https://www.instagram.com/{}' },
    { name: 'TikTok',       url: 'https://www.tiktok.com/@{}' },
    { name: 'Reddit',       url: 'https://www.reddit.com/user/{}' },
    { name: 'YouTube',      url: 'https://www.youtube.com/@{}' },
    { name: 'Twitch',       url: 'https://www.twitch.tv/{}' },
    { name: 'Facebook',     url: 'https://www.facebook.com/{}' },
    { name: 'Telegram',     url: 'https://t.me/{}' },
    { name: 'Steam',        url: 'https://steamcommunity.com/id/{}' },
    { name: 'Mastodon',     url: 'https://mastodon.social/@{}' },
    { name: 'Bluesky',      url: 'https://bsky.app/profile/{}.bsky.social' },
    { name: 'Pinterest',    url: 'https://www.pinterest.com/{}' },
    { name: 'Tumblr',       url: 'https://{}.tumblr.com' },
    { name: 'Medium',       url: 'https://medium.com/@{}' },
    { name: 'Dev.to',       url: 'https://dev.to/{}' },
    { name: 'Keybase',      url: 'https://keybase.io/{}' },
    { name: 'HackerNews',   url: 'https://news.ycombinator.com/user?id={}' },
    { name: 'Spotify',      url: 'https://open.spotify.com/user/{}' },
    { name: 'SoundCloud',   url: 'https://soundcloud.com/{}' },
    { name: 'Vimeo',        url: 'https://vimeo.com/{}' },
    { name: 'Flickr',       url: 'https://www.flickr.com/people/{}' },
    { name: 'DeviantArt',   url: 'https://www.deviantart.com/{}' },
    { name: 'Patreon',      url: 'https://www.patreon.com/{}' },
    { name: 'Linktree',     url: 'https://linktr.ee/{}' },
    { name: 'about.me',     url: 'https://about.me/{}' },
    { name: 'Replit',       url: 'https://replit.com/@{}' },
    { name: 'CodePen',      url: 'https://codepen.io/{}' },
    { name: 'Kaggle',       url: 'https://www.kaggle.com/{}' },
    { name: 'npm',          url: 'https://www.npmjs.com/~{}' },
    { name: 'PyPI',         url: 'https://pypi.org/user/{}' },
    { name: 'Docker Hub',   url: 'https://hub.docker.com/u/{}' },
    { name: 'Gravatar',     url: 'https://gravatar.com/{}' },
    { name: 'Last.fm',      url: 'https://www.last.fm/user/{}' },
    { name: 'Chess.com',    url: 'https://www.chess.com/member/{}' },
    { name: 'Lichess',      url: 'https://lichess.org/@/{}' },
    { name: 'VK',           url: 'https://vk.com/{}' },
    { name: 'Behance',      url: 'https://www.behance.net/{}' },
    { name: 'Dribbble',     url: 'https://dribbble.com/{}' },
    { name: 'Snapchat',     url: 'https://www.snapchat.com/add/{}' }
  ];

  function sherlockLinks(usernames) {
    var links = [];
    var multi = usernames.length > 1;
    usernames.forEach(function(u) {
      var enc = encodeURIComponent(u);
      SHERLOCK.forEach(function(p) {
        links.push({ label: multi ? p.name + ' · ' + u : p.name, url: p.url.replace('{}', enc) });
      });
    });
    return links;
  }

  // Outils OSINT pré-remplis pour un domaine (URLs adressables)
  function domainLinks(d) {
    var e = encodeURIComponent(d);
    return [
      { label: 'crt.sh — certificats',     url: 'https://crt.sh/?q=' + e },
      { label: 'Web Archive',              url: 'https://web.archive.org/web/*/' + d + '/*' },
      { label: 'VirusTotal',               url: 'https://www.virustotal.com/gui/domain/' + e },
      { label: 'urlscan.io',               url: 'https://urlscan.io/domain/' + e },
      { label: 'SecurityTrails — DNS',     url: 'https://securitytrails.com/domain/' + e + '/dns' },
      { label: 'Shodan',                   url: 'https://www.shodan.io/search?query=' + encodeURIComponent('hostname:' + d) },
      { label: 'Censys',                   url: 'https://search.censys.io/search?resource=hosts&q=' + e },
      { label: 'BuiltWith — techs',        url: 'https://builtwith.com/' + e },
      { label: 'Wappalyzer',               url: 'https://www.wappalyzer.com/lookup/' + e },
      { label: 'Whois (who.is)',           url: 'https://who.is/whois/' + e },
      { label: 'ViewDNS',                  url: 'https://viewdns.info/whois/?domain=' + e },
      { label: 'AlienVault OTX',           url: 'https://otx.alienvault.com/indicator/domain/' + e },
      { label: 'Hunter.io — emails',       url: 'https://hunter.io/search/' + e },
      { label: 'robots.txt (archive)',     url: 'https://web.archive.org/web/2/https://' + d + '/robots.txt' }
    ];
  }

  // Outils OSINT pré-remplis pour une IP
  function ipLinks(ip) {
    var e = encodeURIComponent(ip);
    return [
      { label: 'Shodan — host',     url: 'https://www.shodan.io/host/' + e },
      { label: 'Censys — host',     url: 'https://search.censys.io/hosts/' + e },
      { label: 'VirusTotal',        url: 'https://www.virustotal.com/gui/ip-address/' + e },
      { label: 'AbuseIPDB',         url: 'https://www.abuseipdb.com/check/' + e },
      { label: 'GreyNoise',         url: 'https://viz.greynoise.io/ip/' + e },
      { label: 'AlienVault OTX',    url: 'https://otx.alienvault.com/indicator/ip/' + e },
      { label: 'IPinfo',            url: 'https://ipinfo.io/' + e },
      { label: 'Whois IP (who.is)', url: 'https://who.is/whois-ip/ip-address/' + e },
      { label: 'ViewDNS — reverse', url: 'https://viewdns.info/reverseip/?host=' + e }
    ];
  }

  // Registres + outils pré-remplis pour une société
  function societeLinks(nom, siren, domSoc) {
    var links = [];
    var q = encodeURIComponent(nom);
    if (siren) {
      var s = siren.replace(/\D/g, '').slice(0, 9);
      links.push({ label: 'Annuaire entreprises (gouv) — SIREN', url: 'https://annuaire-entreprises.data.gouv.fr/entreprise/' + s });
      links.push({ label: 'Pappers — SIREN',     url: 'https://www.pappers.fr/recherche?q=' + s });
      links.push({ label: 'Infogreffe — SIREN',  url: 'https://www.infogreffe.fr/recherche-siret-entreprise/chercher-siret-entreprise.html?q=' + s });
    }
    links.push({ label: 'Annuaire entreprises (gouv)', url: 'https://annuaire-entreprises.data.gouv.fr/rechercher?terme=' + q });
    links.push({ label: 'Pappers',        url: 'https://www.pappers.fr/recherche?q=' + q });
    links.push({ label: 'Societe.com',     url: 'https://www.societe.com/cgi-bin/search?champs=' + q });
    links.push({ label: 'BODACC',          url: 'https://www.bodacc.fr/pages/annonces-commerciales/?q=' + q });
    links.push({ label: 'Verif.com',       url: 'https://www.verif.com/recherche/' + q + '/1/' });
    links.push({ label: 'LinkedIn — entreprise', url: 'https://www.linkedin.com/search/results/companies/?keywords=' + q });
    if (domSoc) {
      links.push({ label: 'Site web',     url: 'http://' + domSoc });
      links.push({ label: 'crt.sh',       url: 'https://crt.sh/?q=' + encodeURIComponent(domSoc) });
      links.push({ label: 'Web Archive',  url: 'https://web.archive.org/web/*/' + domSoc + '/*' });
    }
    return links;
  }

  // Recherches pré-remplies pour une personne (nom/prénom + emails)
  function identiteLinks(nom, prenom, emails) {
    var links = [];
    var full = [prenom, nom].filter(Boolean).join(' ');
    if (full) {
      var q = encodeURIComponent(full);
      links.push({ label: 'LinkedIn — personnes', url: 'https://www.linkedin.com/search/results/people/?keywords=' + q });
      links.push({ label: 'Facebook',        url: 'https://www.facebook.com/search/people/?q=' + q });
      links.push({ label: 'Twitter / X',     url: 'https://twitter.com/search?q=' + q + '&f=user' });
      links.push({ label: 'Pages Jaunes',    url: 'https://www.pagesjaunes.fr/pagesblanches/recherche?quoiqui=' + q });
      links.push({ label: '118712',          url: 'https://www.118712.fr/recherche?quoiqui=' + q });
      links.push({ label: 'Copains d\'avant', url: 'https://copainsdavant.linternaute.com/s/?q=' + q });
      links.push({ label: 'WebMii',          url: 'https://webmii.com/people?n=' + q });
      links.push({ label: 'Google Images',   url: 'https://www.google.com/search?tbm=isch&q=' + q });
    }
    (emails || []).forEach(function(em) {
      var ee = encodeURIComponent(em);
      links.push({ label: 'HaveIBeenPwned — ' + em, url: 'https://haveibeenpwned.com/account/' + ee });
      links.push({ label: 'EPIEOS — ' + em,         url: 'https://epieos.com/?q=' + ee });
    });
    return links;
  }
