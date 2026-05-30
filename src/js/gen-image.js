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
