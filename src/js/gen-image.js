  // Import d'image : upload temporaire sur litterbox (expiration 1h côté serveur)
  // pour obtenir une URL exploitable par la recherche inversée. Effacement de
  // l'interface au bout de 60 s.
  var imgExpireTimer = null;
  window.importImage = function(input) {
    var file = input.files && input.files[0];
    if (!file) return;
    if (!/^image\//.test(file.type)) { showToast('Le fichier doit être une image.'); input.value = ''; return; }
    if (file.size > 30 * 1024 * 1024) { showToast('Image trop volumineuse (max 30 Mo).'); input.value = ''; return; }

    showToast('Envoi de l\'image…');
    var fd = new FormData();
    fd.append('reqtype', 'fileupload');
    fd.append('time', '1h');
    fd.append('fileToUpload', file);

    fetch('https://litterbox.catbox.moe/resources/internals/api.php', { method: 'POST', body: fd })
      .then(function(r) { return r.text(); })
      .then(function(url) {
        url = (url || '').trim();
        if (!/^https?:\/\//.test(url)) throw new Error('réponse inattendue');
        var target = document.getElementById('imageUrl');
        target.value = url;
        target.dispatchEvent(new Event('input', { bubbles: true }));
        window.generateImage();
        showToast('Image envoyée — recherche prête.');

        if (imgExpireTimer) clearTimeout(imgExpireTimer);
        imgExpireTimer = setTimeout(function() {
          target.value = '';
          target.dispatchEvent(new Event('input', { bubbles: true }));
          var res = document.getElementById('results');
          if (res) res.innerHTML = '<div class="empty-state"><span class="prompt-char">_</span>L\'image a été supprimée pour confidentialité, veuillez la réuploader.</div>';
          showToast('Image supprimée pour confidentialité — réuploadez si besoin.');
        }, 60000);
      })
      .catch(function() {
        showToast('Échec de l\'envoi (réseau ou blocage CORS). Collez plutôt l\'URL d\'une image.');
      })
      .then(function() { input.value = ''; });
  };

  window.generateImage = function(silent) {
    var imgUrl = val('imageUrl');
    if (!imgUrl) {
      if (silent) return null;
      showToast('Renseignez l\'URL directe d\'une image.');
      return;
    }

    var categories = [];

    categories.push({
      icon: '🔎', title: 'Recherche inversée — par URL',
      desc: 'Ouvre la recherche inversée avec l\'URL de l\'image fournie',
      links: imageLinks(imgUrl)
    });

    categories.push({
      icon: '📷', title: 'Moteurs à téléversement manuel',
      desc: 'Téléverser l\'image manuellement — utile notamment pour la recherche de visages',
      links: [
        { label: 'PimEyes (visages)',    url: 'https://pimeyes.com/en' },
        { label: 'FaceCheck.id (visages)', url: 'https://facecheck.id/' },
        { label: 'Lenso.ai',             url: 'https://lenso.ai/' },
        { label: 'Google Images',        url: 'https://images.google.com/' },
        { label: 'Baidu Images',         url: 'https://image.baidu.com/' },
        { label: 'Sogou Images',         url: 'https://pic.sogou.com/' }
      ]
    });

    if (silent) return { categories: categories, values: [] };
    renderResults(categories);
  };
