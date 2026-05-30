  window.generatePseudo = function(silent) {
    var pseudo = val('pseudo');
    var pseudoVars = list('pseudoVariations');
    var pseudoEmailsConnus = list('pseudoEmails');
    var platforms = list('pseudoPlatforms');
    var excl = list('pseudoExclusions');

    if (!pseudo && pseudoVars.length === 0) {
      if (silent) return null;
      showToast('Remplissez au moins le pseudo principal.');
      return;
    }

    // Toutes les variations (pseudo principal + variations)
    var allPseudos = [pseudo].concat(pseudoVars).concat(pseudoVariants(pseudo)).filter(Boolean);
    var allPseudosUnique = Array.from(new Set(allPseudos));

    var pseudoQ = allPseudosUnique.map(function(p) { return '"' + p + '"'; }).join(' OR ');
    var exclQ = excl.map(function(s) { return '-site:' + s; }).join(' ');

    var categories = [];

    // ── 0. TOUT-EN-UN PSEUDO ──
    var aioP = [];
    aioP.push('(' + pseudoQ + ') (inurl:profile OR inurl:user OR inurl:member OR intitle:"profile" OR intitle:"user")');
    aioP.push('(' + pseudoQ + ') (site:github.com OR site:reddit.com OR site:twitter.com OR site:x.com OR site:steamcommunity.com OR site:pastebin.com)');
    var intextAllP = allPseudosUnique.slice(0, 5).map(function(p) { return 'intext:"' + p + '" OR inurl:"' + p + '" OR intitle:"' + p + '"'; });
    aioP.push('(' + intextAllP.join(' OR ') + ')');
    categories.push({
      icon: '🚀', title: 'TOUT-EN-UN — Scan pseudo', dorks: aioP
    });

    // ── Liens directs (style Sherlock) ──
    var sherlockNames = Array.from(new Set([pseudo].concat(pseudoVars).filter(Boolean)));
    var directLinks = sherlockLinks(sherlockNames);
    if (directLinks.length) {
      categories.push({
        icon: '🔗', title: 'Liens directs — profils',
        desc: 'Profils potentiels à vérifier (' + sherlockNames.length + ' pseudo × ' + SHERLOCK.length + ' plateformes) — ouvre l\'URL directement',
        links: directLinks
      });
    }

    // ── Commandes CLI (vérification réseau réelle via Sherlock / Maigret) ──
    if (sherlockNames.length) {
      var argList = sherlockNames.map(function(u) { return /\s/.test(u) ? '"' + u + '"' : u; }).join(' ');
      categories.push({
        icon: '⌨️', title: 'Commandes CLI — vérification réseau',
        desc: 'À exécuter dans un terminal avec Sherlock ou Maigret installé — vérifie réellement l\'existence des comptes',
        dorks: ['maigret ' + argList, 'sherlock ' + argList]
      });
    }

    // ── 1. Recherche générale ──
    categories.push({
      icon: '🔍', title: 'Recherche générale', dorks: [pseudoQ]
    });

    // helper : combine toutes les variations en un seul dork OR
    var pIntitleQ = allPseudosUnique.map(function(p) { return 'intitle:"' + p + '"'; }).join(' OR ');
    var pIntextQ  = allPseudosUnique.map(function(p) { return 'intext:"' + p + '"'; }).join(' OR ');
    var pInurlQ   = Array.from(new Set(allPseudosUnique.map(function(p) { return p.toLowerCase(); })))
                      .map(function(p) { return 'inurl:"' + p + '"'; }).join(' OR ');

    // ── 2. intitle: ──
    categories.push({
      icon: '🏷️', title: 'intitle: — Titres de pages', desc: 'Pages dont le titre contient le pseudo — profils, classements, fiches de joueurs',
      dorks: [pIntitleQ]
    });

    // ── 3. intext: ──
    categories.push({
      icon: '📝', title: 'intext: — Corps des pages', desc: 'Pages qui mentionnent le pseudo dans leur contenu — messages, commentaires, discussions',
      dorks: [
        pIntextQ,
        '(' + pseudoQ + ') (intext:"email" OR intext:"contact" OR intext:"discord" OR intext:"steam")'
      ]
    });

    // ── 4. inurl: ──
    categories.push({
      icon: '🔗', title: 'inurl: — Dans les URLs', desc: 'Pages dont l\'URL contient le pseudo — comptes, pages de profil, espaces personnels',
      dorks: [pInurlQ]
    });

    // ── 5. Profils & comptes ──
    var profileP = allPseudosUnique.map(function(p) {
      return 'inurl:"/user/' + p + '" OR inurl:"/profile/' + p + '" OR inurl:"/u/' + p + '" OR inurl:"/member/' + p + '" OR inurl:"/id/' + p + '"';
    });
    profileP.push('(' + pIntitleQ + ') (intitle:"profile" OR intitle:"profil" OR intitle:"user" OR intitle:"player")');
    categories.push({
      icon: '🪪', title: 'Profils & comptes', dorks: profileP
    });

    // ── 6. Gaming ──
    var gamingSites = 'site:steamcommunity.com OR site:tracker.gg OR site:op.gg OR site:dotabuff.com OR site:overbuff.com OR site:faceit.com OR site:esea.net OR site:battlemetrics.com OR site:namemc.com';
    categories.push({
      icon: '🎮', title: 'Gaming & eSport', dorks: [
        pseudoQ + ' (' + gamingSites + ')',
        '(' + pInurlQ + ') (' + gamingSites + ')',
        pseudoQ + ' (site:twitch.tv OR site:kick.com)',
        pseudoQ + ' (site:epicgames.com OR site:xbox.com OR site:playstation.com)',
      ]
    });

    // ── 7. Réseaux sociaux ──
    categories.push({
      icon: '👤', title: 'Réseaux sociaux', dorks: [
        pseudoQ + ' (site:twitter.com OR site:x.com OR site:instagram.com OR site:tiktok.com OR site:reddit.com OR site:youtube.com)',
        pseudoQ + ' (site:linkedin.com OR site:facebook.com OR site:mastodon.social OR site:bsky.app)',
        pseudoQ + ' (site:discord.me OR site:discordservers.com OR site:disboard.org)',
        '(' + pInurlQ + ') (site:twitter.com OR site:instagram.com OR site:reddit.com OR site:youtube.com OR site:tiktok.com)',
      ]
    });

    // ── 8. Code & dépôts ──
    categories.push({
      icon: '💻', title: 'Code & dépôts', dorks: [
        pseudoQ + ' (' + SITES.code + ')',
        '(' + pInurlQ + ') (site:github.com OR site:gitlab.com)',
        '(' + pseudoQ + ') (site:stackoverflow.com OR site:stackexchange.com)',
      ]
    });

    // ── 9. Forums & discussions ──
    categories.push({
      icon: '💬', title: 'Forums & discussions', dorks: [
        pseudoQ + ' (inurl:forum OR inurl:thread OR inurl:topic OR inurl:viewtopic)',
        pseudoQ + ' (site:jeuxvideo.com OR site:forum.hardware.fr OR site:reddit.com OR site:forums.commentcamarche.net)',
        pseudoQ + ' (site:quora.com OR site:stackoverflow.com)',
        '(' + pIntextQ + ') (inurl:forum OR inurl:member OR inurl:profile)',
      ]
    });

    // ── 10. Fuites / Pastebins ──
    var pastePsiteQ = 'site:pastebin.com OR site:ghostbin.com OR site:rentry.co OR site:justpaste.it OR site:dpaste.org OR site:paste.ee';
    categories.push({
      icon: '⚠️', title: 'Fuites / Pastebins', dorks: [
        pseudoQ + ' (' + pastePsiteQ + ')',
        '(' + pseudoQ + ') (' + pastePsiteQ + ')',
      ]
    });

    // ── 11. Credentials / Données sensibles ──
    categories.push({
      icon: '🔐', title: 'Credentials / Données sensibles', dorks: [
        '(' + pseudoQ + ') (intext:"password" OR intext:"mot de passe" OR intext:"passwd" OR intext:"leak")',
        '(' + pseudoQ + ') (intext:"email" OR intext:"mail" OR intext:"@gmail" OR intext:"@hotmail" OR intext:"@proton")',
        '(' + pseudoQ + ') (intext:"ip" OR intext:"address" OR intext:"location" OR intext:"dox")',
      ]
    });

    // ── 12. Breach databases ──
    categories.push({
      icon: '💀', title: 'Bases de données de fuites', dorks: [
        pseudoQ + ' (' + SITES.breach + ')',
        '(' + pseudoQ + ') (site:haveibeenpwned.com OR site:dehashed.com OR site:intelx.io)',
      ]
    });

    // ── 13. Images & médias ──
    categories.push({
      icon: '🖼️', title: 'Images & médias', dorks: [
        pseudoQ + ' (site:youtube.com OR site:twitch.tv OR site:kick.com OR site:dailymotion.com)',
        pseudoQ + ' (site:imgur.com OR site:flickr.com OR site:deviantart.com)',
        '(' + pIntitleQ + ') (site:youtube.com OR site:twitch.tv)',
      ]
    });

    // ── 14. Archives web ──
    var archVarPQ = allPseudosUnique.slice(0, 3).map(function(p) { return '"' + p + '"'; }).join(' OR ');
    categories.push({
      icon: '🏛️', title: 'Archives web', dorks: [
        pseudoQ + ' site:web.archive.org',
        'site:web.archive.org (' + archVarPQ + ')',
      ]
    });

    // ── 15. Checker de pseudos (liens utiles) ──
    categories.push({
      icon: '🔎', title: 'Checkers de pseudos', dorks: [
        '(' + pseudoQ + ') (site:namechk.com OR site:knowem.com OR site:checkusernames.com OR site:namecheckr.com)',
        '(' + pseudoQ + ') (site:whatsmyname.app OR site:usersearch.org OR site:social-searcher.com)',
      ]
    });

    // ── 16. Plateformes spécifiques ──
    if (platforms.length > 0) {
      var platDorks = platforms.map(function(plat) {
        return '(' + pseudoQ + ') site:' + plat + '.com';
      });
      platDorks = platDorks.concat(platforms.map(function(plat) {
        return '(' + pInurlQ + ') site:' + plat + '.com';
      }));
      categories.push({ icon: '🎯', title: 'Plateformes spécifiques', dorks: platDorks });
    }

    // ── 17. Telegram & messageries ──
    var teleInurlQ = allPseudosUnique.map(function(p) { return 'inurl:"t.me/' + p + '" OR inurl:"telegram.me/' + p + '"'; }).join(' OR ');
    categories.push({
      icon: '✈️', title: 'Telegram & messageries', dorks: [
        '(' + pseudoQ + ') (site:t.me OR site:telegram.me OR site:telegram.dog)',
        teleInurlQ,
        '(' + pseudoQ + ') (intext:"telegram" OR intext:"signal" OR intext:"discord")',
        pseudoQ + ' (intext:"telegram" OR intext:"rejoindre" OR intext:"join")',
      ]
    });

    // ── 18. Emails connus liés au pseudo ──
    if (pseudoEmailsConnus.length > 0) {
      var pseudoEmailConnuQ = pseudoEmailsConnus.map(function(e) { return '"' + e + '"'; }).join(' OR ');
      categories.push({ icon: '📧', title: 'Emails liés — recherche directe', dorks: [
        '(' + pseudoEmailConnuQ + ')',
        '(' + pseudoEmailConnuQ + ') ' + pseudoQ,
        '(' + pseudoEmailConnuQ + ') (intext:"password" OR intext:"leak" OR intext:"breach") (site:pastebin.com OR site:github.com OR site:dehashed.com)',
        '(' + pseudoEmailConnuQ + ') (site:linkedin.com OR site:twitter.com OR site:reddit.com OR site:github.com)',
      ]});
    }

    // ── 19. Avec exclusions ──
    if (excl.length > 0) {
      categories.push({
        icon: '🚫', title: 'Avec exclusions',
        dorks: [pseudoQ + ' ' + exclQ]
      });
    }

    if (silent) return { categories: categories, values: (pseudo ? [pseudo] : pseudoVars.slice(0, 2)) };
    renderResults(categories);
  };
