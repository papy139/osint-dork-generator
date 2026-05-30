  function sanitizeName(s) {
    return s.replace(/[\/\\:*?"<>|\x00-\x1f]/g, '').replace(/\s+/g, ' ').trim();
  }

  // CRC32 (table-based)

  var crcTable = (function() {
    var t = [];
    for (var n = 0; n < 256; n++) {
      var c = n;
      for (var k = 0; k < 8; k++) c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
      t[n] = c >>> 0;
    }
    return t;
  })();

  function crc32(bytes) {
    var crc = 0xFFFFFFFF;
    for (var i = 0; i < bytes.length; i++) crc = (crc >>> 8) ^ crcTable[(crc ^ bytes[i]) & 0xFF];
    return (crc ^ 0xFFFFFFFF) >>> 0;
  }

  // Minimal ZIP writer (store / no compression, UTF-8 filenames)

  function buildZip(files) {
    var enc = new TextEncoder();
    var chunks = [], central = [], offset = 0;
    function u16(n) { return [n & 0xFF, (n >>> 8) & 0xFF]; }
    function u32(n) { return [n & 0xFF, (n >>> 8) & 0xFF, (n >>> 16) & 0xFF, (n >>> 24) & 0xFF]; }
    files.forEach(function(f) {
      var nameBytes = enc.encode(f.name);
      var dataBytes = enc.encode(f.content);
      var crc = crc32(dataBytes), size = dataBytes.length;
      chunks.push(new Uint8Array([].concat(
        u32(0x04034b50), u16(20), u16(0x0800), u16(0), u16(0), u16(0),
        u32(crc), u32(size), u32(size), u16(nameBytes.length), u16(0)
      )));
      chunks.push(nameBytes);
      chunks.push(dataBytes);
      central.push(new Uint8Array([].concat(
        u32(0x02014b50), u16(20), u16(20), u16(0x0800), u16(0), u16(0), u16(0),
        u32(crc), u32(size), u32(size), u16(nameBytes.length), u16(0), u16(0),
        u16(0), u16(0), u32(0), u32(offset)
      )));
      central.push(nameBytes);
      offset += 30 + nameBytes.length + size;
    });
    var cdStart = offset, cdSize = 0;
    central.forEach(function(c) { chunks.push(c); cdSize += c.length; });
    chunks.push(new Uint8Array([].concat(
      u32(0x06054b50), u16(0), u16(0), u16(files.length), u16(files.length),
      u32(cdSize), u32(cdStart), u16(0)
    )));
    return new Blob(chunks, { type: 'application/zip' });
  }

  window.exportAllZip = function() {
    var tabs = [
      { label: 'identité', fn: window.generate },
      { label: 'pseudo', fn: window.generatePseudo },
      { label: 'domaine', fn: window.generateDomaine },
      { label: 'société', fn: window.generateSociete },
      { label: 'champs-perso', fn: window.generateCustom }
    ];
    var files = [];
    tabs.forEach(function(t) {
      var r = t.fn(true);
      if (!r || !r.categories || r.categories.length === 0) return;
      var lines = [];
      r.categories.forEach(function(cat) {
        lines.push('=== ' + cat.title + ' ===');
        var items = cat.dorks || cat.links.map(function(l) { return l.url; });
        items.forEach(function(d) { lines.push(d); });
        lines.push('');
      });
      var name = t.label;
      if (r.values && r.values.length) name += '[' + r.values.join(',') + ']';
      files.push({ name: sanitizeName(name) + '.txt', content: lines.join('\n') });
    });
    if (files.length === 0) { showToast('Aucun onglet rempli à exporter.'); return; }
    var blob = buildZip(files);
    var a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'dorks-osint-' + new Date().toISOString().slice(0, 10) + '.zip';
    a.click();
    setTimeout(function() { URL.revokeObjectURL(a.href); }, 100);
    showToast(files.length + ' onglet(s) exporté(s) en ZIP !');
  };

  // ═══════════════════════════════════════
  // PSEUDO GENERATOR
  // ═══════════════════════════════════════
