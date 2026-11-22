/* Lädt alle Daten (JSON) und startet danach das Portal (js/app.js).
   V hochzählen, wenn Dateien geändert wurden – so holen Browser die neue Version statt des Caches. */
(function () {
  var V = '1';
  var app = document.getElementById('app');
  var get = function (u) {
    return fetch(u + '?v=' + V).then(function (r) {
      if (!r.ok) throw new Error(u + ' (' + r.status + ')');
      return r.json();
    });
  };
  get('data/meta.json').then(function (meta) {
    var ids = meta.subjects.map(function (s) { return s.id; });
    return Promise.all([get('data/quellen.json'), get('data/images.json')]
      .concat(ids.map(function (id) { return get('data/subjects/' + id + '.json'); })))
      .then(function (r) {
        var subjects = {};
        ids.forEach(function (id, i) { subjects[id] = r[i + 2]; });
        window.LP_DATA = { meta: meta, quellen: r[0], images: r[1], subjects: subjects };
        var s = document.createElement('script');
        s.src = 'js/app.js?v=' + V;
        document.body.appendChild(s);
      });
  }).catch(function (e) {
    app.innerHTML = '<p style="padding:32px;font-family:system-ui">Das Lernportal konnte nicht geladen werden: ' +
      String(e.message || e).replace(/</g, '&lt;') +
      '<br><br>Lokal bitte über einen Webserver öffnen: <code>python3 -m http.server</code> im Projektordner, dann <code>http://localhost:8000</code>.</p>';
  });
})();
