function zf() { const z = parseFloat(getComputedStyle(document.body).zoom); return z > 0 ? z : 1; }
(function () {
  'use strict';
  const META = window.LP_DATA.meta;
  const SUBJ = META.subjects; // [{id,n,name,sub,bg,ink,icon,nq,ns,extra}]
  const BYID = Object.fromEntries(SUBJ.map(s => [s.id, s]));
  const ICON = META.icons;
  const $app = document.getElementById('app');

  /* ---------- helpers ---------- */
  const E = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const svg = (n, c, sz = 20, ex = '') => `<svg width="${sz}" height="${sz}" viewBox="0 0 24 24" fill="none" stroke="${c}" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"${ex}>${ICON[n] || ''}</svg>`;
  const shuffle = a => { a = [...a]; for (let i = a.length - 1; i > 0; i--) { const j = Math.random() * (i + 1) | 0;[a[i], a[j]] = [a[j], a[i]] } return a; };
  const today = () => { const d = new Date(); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); };
  const LET = 'ABCDEFGHIJ';
  const cache = {};
  function data(id) {
    if (!cache[id]) {
      cache[id] = window.LP_DATA.subjects[id];
      if (typeof ownSync === 'function') ownSync(id);
    }
    return cache[id];
  }
  function img(key) { return window.LP_DATA.images[key]; }

  /* ---------- Lernstand ---------- */
  const KEY = 'lernportal-guk-v2';
  const freshState = () => ({ last: null, lastBy: {}, read: {}, ok: {}, wrong: {}, srs: {}, days: [], today: { d: '', n: 0 }, onlyLz: false, seen: {}, pts: 0, ptsBy: {}, hist: [], daily: {}, best: {}, exams: {}, plan: { min: 60, wd: [1, 2, 3, 4, 5, 6] }, pdone: {} });
  let st;
  try { st = JSON.parse(localStorage.getItem(KEY) || 'null'); } catch (e) { st = null; }
  st = Object.assign(freshState(), st || {});
  if (!st.geschV2) {
    st.geschV2 = 1; const M = [1, 2, 3, 4, 5, 6, 7, 9, 10, 15]; const N0 = 93;
    if (st.read.gesch) { const r = {}; Object.keys(st.read.gesch).forEach(k => { const n = M[+k]; if (n != null) r[n] = st.read.gesch[k]; }); st.read.gesch = r; }
    if (st.lastBy.gesch != null) st.lastBy.gesch = M[+st.lastBy.gesch] ?? 0; if (st.last && st.last.id === 'gesch') st.last.k = M[+st.last.k] ?? 0;
    ['ok', 'seen'].forEach(f => { const o = st[f].gesch; if (o) Object.keys(o).forEach(k => { if (+k >= N0) delete o[k]; }); });
    Object.keys(st.wrong).forEach(k => { const [i, q] = k.split(':'); if (i === 'gesch' && +q >= N0) delete st.wrong[k]; });
    Object.keys(st.srs).forEach(k => { const [i, q] = k.split(':'); if (i === 'gesch' && +q >= N0) delete st.srs[k]; });
    Object.keys(st.pdone).forEach(k => { if (k.startsWith('gesch')) delete st.pdone[k]; });
    try { localStorage.setItem(KEY, JSON.stringify(st)); } catch (e) { }
  }
  if (!st.pgkV2) {
    st.pgkV2 = 1; const M = [40, 26, 17, 80, 60, 52, 79, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 61, 62, 63, 64, 65, 66, 67, 68, 69, 70, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 53, 54, 55, 56, 57, 58, 59, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16]; const N0 = 517;
    if (st.read.pgk) { const r = {}; Object.keys(st.read.pgk).forEach(k => { const n = M[+k]; if (n != null) r[n] = st.read.pgk[k]; }); st.read.pgk = r; }
    if (st.lastBy.pgk != null) st.lastBy.pgk = M[+st.lastBy.pgk] ?? 0;
    ['ok', 'seen'].forEach(f => { const o = st[f].pgk; if (o) Object.keys(o).forEach(k => { if (+k >= N0) delete o[k]; }); });
    Object.keys(st.wrong).forEach(k => { const [i, q] = k.split(':'); if (i === 'pgk' && +q >= N0) delete st.wrong[k]; });
    Object.keys(st.srs).forEach(k => { const [i, q] = k.split(':'); if (i === 'pgk' && +q >= N0) delete st.srs[k]; });
    Object.keys(st.pdone).forEach(k => { if (k.startsWith('pgk')) delete st.pdone[k]; });
    if (st.last && st.last.id === 'pgk') st.last.k = M[+st.last.k] ?? 0;
    try { localStorage.setItem(KEY, JSON.stringify(st)); } catch (e) { }
  }
  if (!st.geschV3) {
    st.geschV3 = 1; const R = new Set([4, 81, 84, 106, 110]), N0 = 160, OLD = 332, SH = 14; /* Qualitätsaudit Nov 2026 */
    const mv = q => q >= OLD ? q + SH : (R.has(q) || q >= N0 ? null : q);
    ['ok', 'seen'].forEach(f => { const o = st[f].gesch; if (o) { const r = {}; Object.keys(o).forEach(k => { const n = mv(+k); if (n != null) r[n] = o[k]; }); st[f].gesch = r; } });
    ['wrong', 'srs'].forEach(f => { const r = {}; Object.keys(st[f]).forEach(k => { const [i, q] = k.split(':'); if (i !== 'gesch') { r[k] = st[f][k]; return; } const n = mv(+q); if (n != null) r['gesch:' + n] = st[f][k]; }); st[f] = r; });
    try { localStorage.setItem(KEY, JSON.stringify(st)); } catch (e) { }
  }
  function migKl1(s) {
    if (!s || s.kl1V2) return false; s.kl1V2 = 1; const N0 = 637, SH = 20; /* KL1-Audit Nov 2026: Kapitel Geschlechtsorgane (+20 Fragen) */
    const mv = q => q >= N0 ? q + SH : q;
    ['ok', 'seen'].forEach(f => { const o = s[f] && s[f].kl1; if (o) { const r = {}; Object.keys(o).forEach(k => { r[mv(+k)] = o[k]; }); s[f].kl1 = r; } });
    ['wrong', 'srs'].forEach(f => { if (!s[f]) return; const r = {}; Object.keys(s[f]).forEach(k => { const [i, q] = k.split(':'); r[i === 'kl1' ? 'kl1:' + mv(+q) : k] = s[f][k]; }); s[f] = r; });
    return true;
  }
  if (migKl1(st)) { try { localStorage.setItem(KEY, JSON.stringify(st)); } catch (e) { } }
  function migShift(s, flag, sid, N0, SH) {
    if (!s || s[flag]) return false; s[flag] = 1; const mv = q => q >= N0 ? q + SH : q;
    ['ok', 'seen'].forEach(f => { const o = s[f] && s[f][sid]; if (o) { const r = {}; Object.keys(o).forEach(k => { r[mv(+k)] = o[k]; }); s[f][sid] = r; } });
    ['wrong', 'srs'].forEach(f => { if (!s[f]) return; const r = {}; Object.keys(s[f]).forEach(k => { const [i, q] = k.split(':'); r[i === sid ? sid + ':' + mv(+q) : k] = s[f][k]; }); s[f] = r; });
    return true;
  }
  function migHyg(s) { return migShift(s, 'hygV2', 'hyg', 314, 184); } /* Hygiene: +184 Lernziel-Auswahlfragen (Nov 2026) */
  function migGesch4(s) { return migShift(s, 'geschV4', 'gesch', 192, 1); } /* Geschichte: +1 Umkehrfrage Caritas (Nov 2026) */
  if (migHyg(st) | migGesch4(st)) { try { localStorage.setItem(KEY, JSON.stringify(st)); } catch (e) { } }
  if (!st.exSeed) st.exSeed = {}; if (!st.exSeed.gesch) { st.exSeed.gesch = 1; if (!st.exams.gesch) st.exams.gesch = '2026-11-19'; }
  if (!st.readV2) { st.read = {}; st.readV2 = 1; try { localStorage.setItem(KEY, JSON.stringify(st)); } catch (e) { } }
  function save() { st._ts = Date.now(); try { localStorage.setItem(KEY, JSON.stringify(st)); } catch (e) { } if (typeof progPush === 'function') progPush(); }
  function touchDay() {
    const d = today();
    if (!st.days.includes(d)) { st.days.push(d); st.days = st.days.slice(-400); }
    if (st.today.d !== d) st.today = { d, n: 0 };
  }
  function streak() {
    const set = new Set(st.days); let n = 0; const d = new Date();
    if (!set.has(today())) d.setDate(d.getDate() - 1);
    for (; ;) { const k = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); if (set.has(k)) { n++; d.setDate(d.getDate() - 1); } else break; }
    return n;
  }
  function okCount(id) { return Object.keys(st.ok[id] || {}).length; }
  function pct(id) { const s = BYID[id]; return s.nq ? Math.min(100, Math.round(100 * okCount(id) / s.nq)) : 0; }
  function wrongList() { return Object.keys(st.wrong).map(k => { const [id, qi] = k.split(':'); return [id, +qi]; }).filter(([id]) => BYID[id]); }
  function record(id, qi, correct) {
    touchDay(); st.today.n++;
    const d = today(); st.daily[d] = (st.daily[d] || 0) + 1;
    const ks = Object.keys(st.daily).sort(); if (ks.length > 120) ks.slice(0, ks.length - 120).forEach(k => delete st.daily[k]);
    (st.seen[id] = st.seen[id] || {})[qi] = 1;
    const k = id + ':' + qi;
    if (correct) { (st.ok[id] = st.ok[id] || {})[qi] = 1; delete st.wrong[k]; }
    else st.wrong[k] = Date.now();
    save();
  }
  const QMAX = 5; const half = x => Math.round(x * 2) / 2;
  function addPts(id, p) { st.pts = half((st.pts || 0) + p); st.ptsBy[id] = half((st.ptsBy[id] || 0) + p); save(); }
  function seenCount(id) { return Object.keys(st.seen[id] || {}).length; }
  /* Punkte: je Frage max. 5, nie unter 0 · Mehrfachauswahl anteilig (richtig − falsch) · Drag & Drop anteilig · je Joker −1 */
  function scoreQ(c, q, ok, partial) {
    /* max. 5 Punkte je Frage, nie unter 0. Mehrfachauswahl wie in der Moodle-Prüfung:
       (richtig angekreuzte − falsch angekreuzte) / Anzahl richtiger Antworten × 5 */
    const parts = []; let f = ok ? 1 : 0;
    if (!ok && q.m && q.o.length) {
      const R = q.o.filter(o => o[1]).length; let r = 0, w = 0; c.sel.forEach(j => { if (q.o[j][1]) r++; else w++; }); f = R ? Math.max(0, (r - w) / R) : 0;
      if (f > 0) parts.push(`${r} von ${R} richtigen angekreuzt${w ? `, ${w} falsch (zieht ab)` : ''}`);
    }
    let p = half(QMAX * f); if (ok) parts.push('richtig');
    if (p > 0) { const j = (c.hint ? 1 : 0) + (c.gone.size ? 1 : 0); if (j) { const np = Math.max(0, p - j); parts.push(`−${fmtN(p - np)} Joker`); p = np; } }
    return { p, max: QMAX, parts };
  }


  /* ---------- layout pieces ---------- */
  function nickDisplay() { try { return localStorage.getItem('lp-nick-name') || localStorage.getItem('lp-nick') || ''; } catch (e) { return ''; } }
  function helloText() { const n = nickDisplay(); return n ? 'Willkommen, ' + E(n) : 'Willkommen!'; }
  function helloUpd() { document.querySelectorAll('.hello').forEach(x => { const n = nickDisplay(); x.textContent = n ? 'Willkommen, ' + n : 'Willkommen!'; }); }
  function topbar(active) {
    const items = [['start', 'Start'], ['lernplan', 'Lernplan'], ['fortschritt', 'Fortschritt'], ['fehler', 'Fehlerkartei'], ['pruefung', 'Prüfungsmodus'], ['semester2', 'Semester 2']];
    return `<header class="top">
  <a class="logo" href="#start"><i>${svg('book', '#FFFFFF', 20)}</i><span class="lgt"><b>Lernportal GuK</b><small class="hello">${helloText()}</small></span></a>
  <nav class="pills" aria-label="Hauptnavigation">${items.map(([h, n]) => `<a href="#${h}"${h === active ? ' aria-current="page"' : ''}>${n}</a>`).join('')}</nav>
  <form class="search" role="search" data-act="search"><label for="sq" class="sr">Suche</label>${svg('search', '#5A5470', 18)}<input id="sq" type="search" placeholder="z. B. MRSA" value="${E(searchQ)}" autocomplete="off"><button class="btn" type="submit" style="min-height:40px;padding:0 16px;font-size:14px">Suchen</button></form>
</header>`;
  }
  function register(activeId) {
    return `<nav class="reg" aria-label="Daumenregister">${SUBJ.map(s => {
      const on = s.id === activeId;
      return `<a href="#f-${s.id}" title="${E(s.name)}" aria-label="${E(s.name)}"${on ? ' aria-current="true"' : ''} style="background:${on ? s.ink : s.bg}">${svg(s.icon, on ? '#FFFFFF' : s.ink, 22)}</a>`;
    }).join('')}</nav>`;
  }
  function shell(active, activeId, inner) {
    $app.innerHTML = `<div class="shell"><div class="col">${topbar(active)}${inner}</div>${register(activeId)}</div>`;
  }
  const MODES = [['themen', 'Themen', 'grid'], ['lern', 'Lernteil', 'book'], ['quiz', 'Quiz', 'quiz'], ['karten', 'Karteikarten', 'cards'], ['zuordnen', 'Zuordnen', 'match']];
  function band(id, mode, k) {
    const s = BYID[id], d = data(id), p = pct(id);
    const suffix = (k != null && k >= 0 && mode !== 'lern') ? '-' + k : '';
    const tabs = MODES.concat(lzIdx(id).length ? [['lernziele', 'Lernziele', 'quiz']] : []).concat(altIdx(id).length ? [['alt', 'Altklausur', 'quiz']] : []).concat([['quellen', 'Quellen', 'book']]).map(([m, lbl, ic]) => {
      const on = m === mode;
      const href = m === 'lernziele' || m === 'alt' || m === 'quellen' ? `#f-${id}-${m}` : m === 'themen' ? `#f-${id}` : m === 'lern' ? `#f-${id}-lern-${k != null && k >= 0 ? k : (st.lastBy[id] || 0)}` : `#f-${id}-${m}${k != null && k >= 0 ? '-' + k : ''}`;
      return `<a href="${href}"${on ? ' aria-current="page"' : ''}>${svg(ic, on ? '#FFFFFF' : s.ink, 18)}${lbl}</a>`;
    }).join('') + (s.extra ? `<a href="${s.extra.url}" target="_blank" rel="noopener">${svg('game', s.ink, 18)}${E(s.extra.label)}</a>` : '');
    return `<section class="band" style="background:${s.bg};color:${s.ink}">
  <a class="back" href="#start" style="color:${s.ink}"><span style="display:inline-flex;transform:rotate(180deg)">${svg('arrow', s.ink, 16)}</span>Alle Fächer</a>
  <div class="ttl"><div style="display:flex;align-items:center;gap:14px"><span class="ico">${svg(s.icon, s.ink, 28)}</span><div><div class="lbl">Fach ${s.n} · ${d.secs.length} Kapitel · ${s.nq} Fragen</div><h1>${E(s.name)}</h1></div></div>
  <div style="display:flex;align-items:center;gap:10px;min-width:220px;font-weight:800"><span>${p} % richtig</span><div class="prog" style="flex:1;background:#fff"><i style="width:${p}%;background:${s.ink}"></i></div></div></div>
  ${(() => { const dd = daysTo(id); const tags = []; if (dd != null) tags.push(`<a class="tag" href="#lernplan" style="background:#fff;color:${s.ink};text-decoration:none">${svg('cal', s.ink, 16)} ${dd === 0 ? 'Prüfung heute' : dd === 1 ? 'Prüfung morgen' : dd > 0 ? 'Prüfung in ' + dd + ' Tagen' : 'Prüfung vorbei'}</a>`); if (s.examFormat) tags.push(`<span class="tag" style="background:#fff;color:${s.ink}">${E(s.examFormat)}</span>`); return tags.length ? `<div style="display:flex;flex-wrap:wrap;gap:8px">${tags.join('')}</div>` : ''; })()}
  <nav class="pills" aria-label="Modus">${tabs}</nav></section>`;
  }

  /* ---------- views ---------- */
  let searchQ = '';
  function viewHome() {
    const last = st.last && BYID[st.last.id] ? st.last : { id: SUBJ[0].id, k: 0 };
    const ls = BYID[last.id], ld = data(last.id), lsec = ld.secs[last.k] || ld.secs[0];
    const nWrong = wrongList().length, nToday = st.today.d === today() ? st.today.n : 0, str = streak();
    const bento = `<section class="bento" aria-label="Heute">
  <div class="b-big"><span style="font-size:15px;font-weight:800;color:#C9BFF5">${st.last ? 'Schön, dass du da bist! Weiterlernen:' : 'Willkommen! Starte hier:'}</span><h1>${E(lsec.t)}</h1><span style="font-size:16px;color:#D6D1E8">${E(ls.name)} · Kapitel ${lsec.k + 1} von ${ld.secs.length}</span>
  <div class="prog" style="background:#453D63"><i style="width:${pct(last.id)}%;background:#C9BFF5"></i></div>
  <div style="margin-top:auto;display:flex;flex-wrap:wrap;gap:10px"><a class="btn" style="background:#C9BFF5;color:#2A2440" href="#f-${last.id}-lern-${lsec.k}">Los geht’s${svg('arrow', '#2A2440', 18)}</a><a class="btn" style="background:transparent;box-shadow:inset 0 0 0 2px #6F6790" href="#f-${last.id}-quiz-${lsec.k}">Quiz zum Kapitel</a></div></div>
  <a class="b-wide" href="#fehler" style="background:#FDE2E4;color:#9B2C3A"><span class="b-num" style="font-size:60px">${nWrong}</span><span style="display:flex;flex-direction:column;gap:4px"><span style="font-size:18px;font-weight:800">Fragen in der Fehlerkartei</span><span style="font-size:15px;font-weight:700">${nWrong ? 'Jetzt wiederholen →' : 'Noch nichts falsch – weiter so'}</span></span></a>
  <div class="b-sm" style="background:#FDE6DA;color:#8C3F1E">${svg('flame', '#8C3F1E', 26)}<span class="b-num">${str}</span><span style="font-size:15px;font-weight:700">${str === 1 ? 'Tag' : 'Tage'} in Folge</span></div>
  <a class="b-sm" href="#fortschritt" style="background:#DDF3EA;color:#1F6B4D;text-decoration:none">${svg('check', '#1F6B4D', 26)}<span class="b-num">${nToday}/30</span><span style="font-size:15px;font-weight:700">Fragen heute · ${fmtN(st.pts || 0)} Punkte gesamt →</span></a>
</section>`;
    const rows = SUBJ.map(s => {
      const kk = st.lastBy[s.id] || 0;
      const m = MODES.filter(x => x[0] !== 'themen').map(([m, lbl, ic]) => `<a href="#f-${s.id}-${m === 'lern' ? 'lern-' + kk : m}" aria-label="${E(s.name)}: ${lbl}" title="${lbl}">${svg(ic, s.ink, 20)}</a>`).join('');
      return `<div class="row"><span class="num" style="background:${s.bg};color:${s.ink}">${s.n}</span><a class="rowt" href="#f-${s.id}"><b>${E(s.name)}</b><span>${E(s.sub)} · ${s.nq} Fragen</span></a>${daysTo(s.id) != null && daysTo(s.id) >= 0 ? `<span class="tag" style="background:#fff;color:${s.ink};box-shadow:inset 0 0 0 2px ${s.bg}">${svg('cal', s.ink, 14)} ${daysTo(s.id)} T</span>` : ''}<span class="tag" style="background:${s.bg};color:${s.ink}">${pct(s.id)} %</span><nav class="modes" aria-label="${E(s.name)} öffnen">${m}</nav></div>`;
    }).join('');
    const gameTile = `<a class="gametile" href="#spiel"><img src="${img('gameapple')}" alt="Mrs. Granny Smith" width="120" height="112"><span class="gt-tx"><span class="gt-k">Entspannung &amp; Lernen</span><b>An Apple a Day</b><span>Lauf mit Mrs. Granny Smith durchs Klinikum und lerne alle Stationen kennen.</span></span><span class="gt-go">Jetzt spielen ›</span></a>`;
    shell('start', null, bento + gameTile + `<section class="card" aria-labelledby="inh"><div style="display:flex;flex-wrap:wrap;justify-content:space-between;align-items:baseline;gap:8px;margin-bottom:10px"><h2 class="h2" id="inh">Inhalt · Semester 1</h2><span class="small">Titel öffnet den Lernteil · Symbole: Lernen, Quiz, Karten, Zuordnen · Register rechts springt ins Fach</span></div>${rows}</section>`
      + todayCard() + sem2Block() + `<p class="small" style="text-align:center">Dein Fortschritt wird nur in diesem Browser auf diesem Gerät gespeichert.</p>`);
  }
  function sem2Block() {
    return `<section aria-labelledby="s2"><h2 id="s2" style="margin:0 0 12px;font-size:22px;font-weight:800;display:flex;align-items:center;gap:8px">${svg('lock', '#5A5470', 20)}Semester 2 · vorbereitet</h2><div class="sem2">${META.sem2.map(([n, d]) => `<div><b>${E(n)}</b><span class="small">${E(d)}</span></div>`).join('')}</div></section>`;
  }
  function viewSem2() { shell('semester2', null, `<section class="card"><h1 class="h2">Semester 2</h1><p class="muted">Diese Fächer sind vorbereitet. Sobald die Folien da sind, bekommen sie hier Lernteil, Quiz, Karteikarten und Zuordnen.</p></section>` + sem2Block()); }

  const STY = { eigen: ['✍️', 'Eigene Frage'], folien: ['📑', 'Folien'], skript: ['📘', 'Skript'], handout: ['📄', 'Handout'], alt: ['🦉', 'Altfrage'], wdh: ['🔁', 'Wiederholungsfrage'], gesetz: ['⚖️', 'Gesetz'], lit: ['📚', 'Literatur/Video'], erg: ['💡', 'Ergänzung'], begriff: ['🔤', 'Begriffe'], mehr: ['📚', 'Mehrere Quellen'], lz: ['🎯', 'Lernziel'], vl: ['🎓', 'Vorlesungsfrage'] };
  function origHtml(q, dark) {
    const S = q.S && q.S.length ? q.S : []; if (!S.length && !q.s) return ''; const ty = [...new Set(S.map(x => x[0]))]; const loc = S.length ? S.map(([t, f, l]) => t === 'lz' ? l : (t === 'alt' && f.startsWith('Altfragen-Sammlung') ? (l ? l.split(' · Foto')[0] : '') : '')).filter(Boolean) : []; const txt = [...loc, q.s || ''].filter(Boolean).join(' · ');
    return `<div class="qorig${dark ? ' dk' : ''}"><span class="srch">Herkunft</span>${ty.map(t => `<span class="sty st-${t}">${(STY[t] || STY.mehr).join(' ')}</span>`).join('')}<span class="oloc">${E(txt)}</span></div>`;
  }
  function srcHtml(q, small) {
    const S = q.S && q.S.length ? q.S : (q.s ? [['mehr', q.s, '']] : []); if (!S.length) return '';
    return `<div class="qsrc${small ? ' sm' : ''}"><span class="srch">Quelle</span>${S.map(([t, f, l]) => `<span class="srow"><span class="sty st-${t}">${(STY[t] || STY.mehr).join(' ')}</span><span class="sfile">${E(f)}</span>${l ? `<span class="sloc">${E(l)}</span>` : ''}</span>`).join('')}</div>`;
  }
  const SRCLEG = `<div class="srcleg"><b>Quellen-Kennzeichnung:</b> ${['folien', 'skript', 'handout', 'alt', 'wdh', 'gesetz', 'begriff'].map(k => `<span class="sty st-${k}">${STY[k].join(' ')}</span>`).join(' ')} <span class="sty st-erg">💡 Kästen = Erklärung/Merkhilfe, steht so nicht in den Unterlagen</span></div>`;
  /* ---------- Themen-Kacheln (Moodle-Kursübersicht) ---------- */
  function grpStats(id, g) {
    const d = data(id); const secs = g.secs.filter(i => d.secs[i]); const rd = secs.filter(i => st.read[id] && st.read[id][i]).length;
    const qi = []; d.qs.forEach((q, i) => { if (!q.hide && secs.some(k => inSec(d, q, k))) qi.push(i); }); const ok = qi.filter(i => st.ok[id] && st.ok[id][i]).length;
    return { secs, rd, nq: qi.length, ok, pr: secs.length ? Math.round(100 * rd / secs.length) : 0 };
  }
  function viewThemen(id) {
    const s = BYID[id], d = data(id);
    const tiles = d.groups.map((g, gi) => {
      const t = grpStats(id, g); const miss = !!g.missing;
      const href = miss ? `#f-${id}-thema-${gi}` : `#f-${id}-thema-${gi}`;
      return `<a class="mtile${miss ? ' miss' : ''}${t.pr === 100 ? ' done' : ''}" href="${href}" style="--ink:${s.ink};--bg:${s.bg}">
      <span class="mbar" aria-hidden="true"><i style="width:${miss ? 0 : Math.max(t.pr, 0)}%"></i></span>
      <span class="mico">${svg(g.ic || 'book', miss ? '#A9A4B8' : '#7C7890', 58, ' stroke-width="1.6"')}</span>
      <b class="mt">${E(g.name)}</b>
      <span class="mmeta">${miss ? 'Unterlagen fehlen noch' : `${t.secs.length} ${t.secs.length === 1 ? 'Kapitel' : 'Kapitel'} · ${t.nq} Fragen`}</span>
      ${miss ? '' : `<span class="mprog">${t.rd}/${t.secs.length} gelesen${t.nq ? ` · ${Math.round(100 * t.ok / t.nq)} % richtig` : ''}</span>`}
    </a>`;
    }).join('');
    const all = d.groups.reduce((a, g) => { const t = grpStats(id, g); a.r += t.rd; a.n += t.secs.length; return a; }, { r: 0, n: 0 });
    const pr = all.n ? Math.round(100 * all.r / all.n) : 0;
    shell('start', id, band(id, 'themen', -1) + `<section class="card mtiles-wrap"><div class="mhead"><h2 class="h2" style="margin:0">Themen</h2><span class="mtot">Fortschritt insgesamt<span class="mring" style="--p:${pr};--ink:${s.ink}"><b>${pr}</b></span></span></div><div class="mtiles">${tiles}</div><p class="small" style="margin:12px 0 0">Der Balken oben an jeder Kachel zeigt, wie viele Kapitel des Themas du als gelesen markiert hast.</p></section>`);
  }
  function viewThema(id, gi) {
    const s = BYID[id], d = data(id), g = d.groups[gi]; if (!g) return viewThemen(id);
    const t = grpStats(id, g);
    const rows = t.secs.map(i => {
      const c = d.secs[i]; const rd = st.read[id] && st.read[id][i]; const n = d.qs.filter(q => inSec(d, q, i) && !q.hide).length;
      return `<div class="mrow${rd ? ' rd' : ''}"><span class="n" style="background:${rd ? s.ink : s.bg};color:${rd ? '#fff' : s.ink}">${rd ? svg('check', '#FFFFFF', 16) : String(i + 1).padStart(2, '0')}</span>
      <a class="mrt" href="#f-${id}-lern-${i}">${c.e ? `<span aria-hidden="true">${c.e}</span> ` : ''}<b>${E(c.t)}</b>${c.badge === 'nein' ? ' <span class="small">· nicht in den Folien</span>' : ''}</a>
      <span class="mra">${n ? `<a class="tag" style="background:${s.bg};color:${s.ink};text-decoration:none" href="#f-${id}-quiz-${i}">${svg('quiz', s.ink, 15)} ${n} Fragen</a>` : ''}<a class="tag" style="background:#F1EFF6;color:#2A2440;text-decoration:none" href="#f-${id}-karten-${i}">${svg('cards', '#2A2440', 15)} Karten</a></span></div>`;
    }).join('');
    const body = g.missing ? `<p class="muted" style="margin:0">${E(g.missing)}</p>` : rows;
    shell('start', id, band(id, 'themen', -1) + `<section class="card"><a class="back2" href="#f-${id}" style="color:${s.ink}"><span style="display:inline-flex;transform:rotate(180deg)">${svg('arrow', s.ink, 16)}</span>Alle Themen</a>
   <div class="mth"><span class="mico sm">${svg(g.ic || 'book', '#7C7890', 44, ' stroke-width="1.6"')}</span><div style="flex:1"><h2 class="h2" style="margin:0">${E(g.name)}</h2>${g.missing ? '' : `<div class="small">${t.secs.length} Kapitel · ${t.nq} Fragen · ${t.rd}/${t.secs.length} gelesen</div><div class="prog" style="margin-top:8px"><i style="width:${t.pr}%;background:${s.ink}"></i></div>`}</div>
   ${!g.missing && t.secs.length ? `<a class="btn" href="#f-${id}-lern-${t.secs.find(i => !(st.read[id] && st.read[id][i])) ?? t.secs[0]}">${t.rd && t.rd < t.secs.length ? 'Weiterlesen' : 'Thema starten'}${svg('arrow', '#FFFFFF', 18)}</a>` : ''}</div>
   <div class="mrows">${body}</div></section>`);
  }
  function viewLern(id, k) {
    const s = BYID[id], d = data(id);
    if (!(k >= 0 && k < d.secs.length)) k = 0;
    st.last = { id, k }; st.lastBy[id] = k; save();
    const isRead = !!(st.read[id] && st.read[id][k]);
    const sec = d.secs[k];
    const qn = d.qs.filter(q => inSec(d, q, k) && !q.hide).length;
    const only = st.onlyLz;
    const nav = d.groups.map(g => {
      const items = g.secs.filter(i => d.secs[i] && (!only || d.secs[i].badge !== 'nein' || i === k)).map(i => {
        const c = d.secs[i], on = i === k, rd = st.read[id] && st.read[id][i];
        return `<a href="#f-${id}-lern-${i}"${on ? ' aria-current="true" style="background:' + s.bg + '"' : ''}><span class="n" style="${on ? `background:${s.ink};color:#fff` : rd ? `background:${s.bg};color:${s.ink}` : ''}">${String(i + 1).padStart(2, '0')}</span><span>${c.e ? `<span class="nem" aria-hidden="true">${c.e}</span>` : ''}${E(c.t)}${s.focus && s.focus[i] ? ` <span title="Schwerpunkt laut Erzählvideo" style="color:#C9A227">${svg('star', '#C9A227', 14, ' style="vertical-align:-2px"')}</span>` : ''}</span></a>`;
      }).join('');
      return items ? `<a class="grp" href="#f-${id}-thema-${d.groups.indexOf(g)}" title="Themenübersicht">${E(g.name)}</a>${items}` : '';
    }).join('');
    const hasBadges = d.secs.some(x => x.badge);
    const foc = s.focus && s.focus[k] ? `<span class="tag focus">${svg('star', '#6E5310', 16)} Schwerpunkt · ${E(s.focus[k])}</span>` : '';
    const badge = sec.badge === 'ja' ? `<span class="tag" style="background:${s.bg};color:${s.ink}">Prüfungsstoff</span>` : sec.badge === 'teil' ? `<span class="tag" style="background:#FBF1D5;color:#6E5310">teilweise Prüfungsstoff</span>` : sec.badge === 'nein' ? `<span class="tag" style="background:#F1EFF6;color:#5A5470">nicht in den Folien</span>` : '';
    const prev = k > 0 ? `<a class="btn lt" href="#f-${id}-lern-${k - 1}"><span style="display:inline-flex;transform:rotate(180deg)">${svg('arrow', '#2A2440', 18)}</span>Kap. ${k}</a>` : '<span></span>';
    const next = k < d.secs.length - 1 ? `<a class="btn" href="#f-${id}-lern-${k + 1}" data-act="markread" data-id="${id}" data-k="${k}">Weiter: ${E(d.secs[k + 1].t)}${svg('arrow', '#FFFFFF', 18)}</a>` : `<a class="btn" href="#f-${id}-quiz" data-act="markread" data-id="${id}" data-k="${k}">Zum Quiz${svg('arrow', '#FFFFFF', 18)}</a>`;
    const readBox = isRead ? `<div class="readbox done">${svg('check', '#1F6B4D', 22)}<span><b>Kapitel gelesen.</b> Im Lernplan ist die Lese-Aufgabe erledigt.</span><button class="btn lt" type="button" data-act="unread" data-id="${id}" data-k="${k}" style="min-height:40px;font-size:14px;padding:0 14px">Zurücksetzen</button></div>`
      : `<div class="readbox"><span><b>Fertig gelesen?</b> Dann markier das Kapitel. Im Lernplan kommt danach das Quiz dazu.</span><button class="btn" type="button" data-act="markread" data-id="${id}" data-k="${k}" style="background:#1F6B4D">${svg('check', '#FFFFFF', 18)}Als gelesen markieren</button></div>`;
    const inner = band(id, 'lern', k) + `<div class="three">
  <nav class="chnav" aria-label="Kapitel"><details class="chd"${window.innerWidth > 860 ? ' open' : ''}><summary>Kapitelübersicht · ${d.secs.length} Kapitel</summary>${hasBadges ? `<label><input type="checkbox" data-act="onlylz"${only ? ' checked' : ''}> Nur Prüfungsstoff</label>` : ''}${nav}</details></nav>
  <article class="art"><div class="card" style="padding:24px"><div class="lbl" style="color:${s.ink}">Kapitel ${k + 1} von ${d.secs.length}</div><h2 style="margin:6px 0 10px;font-size:32px;font-weight:800;line-height:1.15">${sec.e ? `<span class="chem" aria-hidden="true">${sec.e}</span>` : ''}${E(sec.t)}</h2><div class="glance" hidden></div><div style="display:flex;flex-wrap:wrap;gap:8px">${badge}${foc}</div></div>
  ${`<section class="card practicebar" aria-label="Kapitel ${k + 1} üben"><h2 class="lbl muted pb-h">Kapitel ${k + 1} üben</h2>
  ${qn ? `<a class="practice pri" href="#f-${id}-quiz-${k}">${svg('quiz', '#FFFFFF', 20)}Quiz · ${qn} Fragen</a>
  <a class="practice" href="#f-${id}-karten-${k}">${svg('cards', s.ink, 20)}Karteikarten</a>
  <a class="practice" href="#f-${id}-zuordnen-${k}">${svg('match', s.ink, 20)}Zuordnen</a>` : `<p class="small" style="margin:0">Zu diesem Kapitel gibt es keine eigenen Fragen.</p>`}
  <a class="practice" href="#f-${id}-quiz">${svg('quiz', s.ink, 20)}Ganzes Fach · ${s.nq}</a></section>`}${SRCLEG}<div class="lernwrap"><div class="lern" style="--ac:${s.ink};--sbg:${s.bg};--sink:${s.ink}">${sec.html}</div>${railHtml(id, k)}</div>
  ${myBox(id, k)}${readBox}<div class="pager">${prev}${next}</div></article>
</div>`;
    shell('start', id, inner);
    document.querySelectorAll('.lern img[data-img]').forEach(im => { const u = img(im.dataset.img); if (u) im.src = u; else im.closest('figure')?.remove(); });
    enrichLern(id, k);
    applyMarks(id, k);
  }

  /* ---------- Visuelle Lernhilfen (ohne den Text zu verändern) ---------- */
  const GL_SKIP = /^(a|b|c|d|e|f|i|ii|iii|nicht|kein|keine|immer|nur|alle|oder|und|nie|aktiv|passiv|ja|nein|1\.|2\.|3\.)$/i;
  function enrichLern(id, k) {
    const L = document.querySelector('.lern'); if (!L) return;
    // Pfeile als farbige Kreise, Bezeichnungen „Wort:“ als Etikett
    const tw = document.createTreeWalker(L, NodeFilter.SHOW_TEXT, { acceptNode: n => n.nodeValue.includes('→') && !n.parentElement.closest('.flow,.arrow,svg,summary') ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT });
    const tn = []; while (tw.nextNode()) tn.push(tw.currentNode);
    tn.forEach(n => { const parts = n.nodeValue.split('→'); const f = document.createDocumentFragment(); parts.forEach((t, i) => { if (i) { const a = document.createElement('span'); a.className = 'arr'; a.textContent = '→'; f.appendChild(a); } if (t) f.appendChild(document.createTextNode(t)); }); n.parentNode.replaceChild(f, n); });
    L.querySelectorAll('li > b:first-child, p > b:first-child, .ele > b, dd > b:first-child').forEach(b => { const t = b.textContent.trim(); if (t.length <= 34 && /:$/.test(t)) b.classList.add('lbl2'); });
    // Tabellen: erste Spalte als Begriffsspalte, Jahres-Tabellen als Zeitstrahl-Optik
    L.querySelectorAll('table').forEach(tb => { const th = tb.querySelector('th'); if (th && /^(Jahr|Zeit|Datum|Epoche|Zeitraum)/i.test(th.textContent.trim())) tb.classList.add('ttime'); });
    // Kurz-Überblick: wichtigste fett gedruckte Begriffe des Kapitels
    const seen = new Map(); L.querySelectorAll('.sub:not(.nolz) b').forEach(b => { if (b.closest('.lzbox,.tip,.cite,.afo,.afq,th,.eleh,.nolzl,.xnote')) return; let t = b.textContent.replace(/[:.,;]+$/, '').trim(); if (t.length < 3 || t.length > 30 || GL_SKIP.test(t) || /^\d/.test(t) || b.classList.contains('lbl2') || b.classList.contains('l')) return; const key = t.toLowerCase(); const e = seen.get(key); if (e) e.n++; else seen.set(key, { t, n: 1, el: b }); });
    const top = [...seen.values()].sort((a, b) => b.n - a.n).slice(0, 12); const g = document.querySelector('.glance');
    if (g && top.length >= 4) {
      g.hidden = false; g.innerHTML = '<span class="glt">Auf einen Blick</span>' + top.map((x, i) => `<button type="button" class="gchip c${i % 6}" data-gi="${i}">${E(x.t)}</button>`).join('');
      g.querySelectorAll('.gchip').forEach(btn => btn.addEventListener('click', () => { const el = top[+btn.dataset.gi].el; el.scrollIntoView({ behavior: 'smooth', block: 'center' }); el.classList.remove('gflash'); void el.offsetWidth; el.classList.add('gflash'); }));
    }
  }

  /* ---------- quiz ---------- */
  let QZ = null;
  function isOpen(q) { return !q.o.length && !q.y; }
  function isDnd(q) { return q.y === 'cat' || q.y === 'ord'; }
  function typeOk(q, t) { if (q.hide) return false; const open = isOpen(q); if (t === 'mc') return !open; if (t === 'single') return !q.y && q.o.length && !q.m; if (t === 'multi') return !q.y && q.o.length && !!q.m; if (t === 'tf') return q.y === 'tf'; if (t === 'dnd') return isDnd(q); if (t === 'open') return open; if (t === 'rev') return !!q.r; if (t === 'orig') return !!q.wq; if (t === 'own') return !!q.own; return true; }
  function inSec(d, q, k) { return d.secs[k] && d.secs[k].allorig ? !!q.wq : q.sec === k; }
  function poolFor(id, k, t, os) { const d = data(id); return d.qs.map((q, i) => i).filter(i => (!os || qOrig(d.qs[i]).some(o => os.has(o))) && (k == null || k < 0 || inSec(d, d.qs[i], k)) && typeOk(d.qs[i], t || 'all')); }
  const TYPES = [['mc', 'Single + Mehrfach'], ['single', 'Nur Single Choice'], ['multi', 'Nur Mehrfachauswahl'], ['tf', 'Nur Wahr/Falsch'], ['dnd', 'Nur Drag & Drop'], ['orig', 'Nur Fragen der Vortragenden'], ['rev', 'Nur Umkehrfragen'], ['open', 'Offene Fragen'], ['own', 'Meine Fragen']];
  function countOpts(n) { let h = ''; const def = n >= 20 ? 20 : 0; for (let x = 10; x < n; x += 10) h += `<option value="${x}"${x === def ? ' selected' : ''}>${x} Fragen</option>`; return h + `<option value="0"${def === 0 ? ' selected' : ''}>Alle (${n})</option>`; }
  function typeSeg(cnt, cur) { return TYPES.filter(([t]) => t === 'mc' || cnt[t]).map(([t, l]) => { if (t === 'mc' && (cnt.tf || cnt.dnd)) l = cnt.multi ? 'Alle Formate' : 'Prüfungsformat: Single · Wahr/Falsch · Drag & Drop'; return `<button type="button" data-t="${t}" aria-pressed="${t === cur}"${cnt[t] ? '' : ' disabled'}>${l} · ${cnt[t]}</button>`; }).join(''); }
  function pairsFor(ids, k, t, os) { const out = []; ids.forEach(id => poolFor(id, ids.length > 1 ? -1 : k, t, os).forEach(i => out.push([id, i]))); return out; }
  /* Herkunft-Filter: Altklausur / Lernziele / Wiederholung der LV / Unterlagen – frei kombinierbar */
  const ORIG = [['vl', 'Fragen aus der Vorlesung'], ['alt', 'Altklausurfragen'], ['lz', 'Lernzielfragen'], ['wdh', 'Wiederholungsfragen der LV'], ['rest', 'Fragen aus den Unterlagen']];
  function qOrig(q) { if (q._o) return q._o; const o = []; if (!q.r && q.S) { if (q.S.some(x => x[0] === 'vl')) o.push('vl'); if (q.S.some(x => x[0] === 'alt')) o.push('alt'); if (isLzQ(q)) o.push('lz'); if (q.S.some(x => x[0] === 'wdh')) o.push('wdh'); } if (!o.length) o.push('rest'); Object.defineProperty(q, '_o', { value: o, enumerable: false }); return o; }
  function curOrig() { const el = document.getElementById('qo'); if (!el) return null; const b = [...el.querySelectorAll('button')]; if (!b.length) return null; return new Set(b.filter(x => x.getAttribute('aria-pressed') === 'true').map(x => x.dataset.o)); }
  const ALTC = {};
  function altIdx(id) { if (ALTC[id]) return ALTC[id]; const d = data(id); return ALTC[id] = d.qs.map((q, i) => i).filter(i => !d.qs[i].hide && qOrig(d.qs[i]).includes('alt')); }
  function origSeg(ids, k, pre) {
    const el = document.getElementById('qo'); if (!el) return; const old = curOrig(); const cnt = {}; ORIG.forEach(([o]) => cnt[o] = pairsFor(ids, k, 'all', new Set([o])).length);
    const av = ORIG.filter(([o]) => cnt[o]); const wrap = document.getElementById('qowrap'); if (wrap) wrap.style.display = av.length > 1 ? '' : 'none';
    el.innerHTML = av.map(([o, l]) => { const on = old && old.size ? old.has(o) : (pre ? pre.includes(o) : true); return `<button type="button" data-o="${o}" data-act="qorig" aria-pressed="${on}">${l} · ${cnt[o]}</button>`; }).join('');
  }
  function updSetup() {
    const box = document.getElementById('qsetup'); if (!box) return;
    const ids = box.dataset.ids ? box.dataset.ids.split(',') : [document.getElementById('pf').value].filter(Boolean);
    const allIds = ids.length ? ids : SUBJ.map(x => x.id);
    const kEl = document.getElementById('qk'), k = kEl ? +kEl.value : -1;
    const tb = document.querySelector('#qt [aria-pressed=true]'); let t = tb ? tb.dataset.t : 'mc';
    origSeg(allIds, ids.length > 1 ? -1 : k, box.dataset.pre ? box.dataset.pre.split(',') : null); const os = curOrig();
    const cnt = {}; TYPES.forEach(([x]) => cnt[x] = pairsFor(allIds, k, x, os).length);
    if (!cnt[t]) t = 'mc';
    document.getElementById('qt').innerHTML = typeSeg(cnt, t);
    const n = cnt[t]; const sel = document.getElementById('qn'); sel.innerHTML = countOpts(n); sel.disabled = !n;
    document.getElementById('qgo').disabled = !n;
  }
  function viewQuizSetup(id, k, alt) {
    const s = BYID[id], d = data(id);
    const opts = `<option value="-1">Alle Kapitel (${s.nq} Fragen)</option>` + d.groups.filter(g => g.secs.length).map(g => `<optgroup label="${E(g.name)}">${g.secs.map(i => { const n = d.qs.filter(q => inSec(d, q, i) && !q.hide).length; return n ? `<option value="${i}"${i === k ? ' selected' : ''}>${i + 1}. ${E(d.secs[i].t)} (${n})</option>` : ''; }).join('')}</optgroup>`).join('');
    const nWrongHere = wrongList().filter(([x]) => x === id).length;
    const inner = band(id, alt ? 'alt' : 'quiz', alt ? -1 : k) + `<div class="qwrap"><section class="qcard" id="qsetup" data-ids="${id}"${alt ? ' data-pre="alt"' : ''}><h1>${alt ? 'Altklausurfragen üben' : 'Quiz starten'}</h1>${alt ? `<p class="muted" style="margin:0">${altIdx(id).length} Fragen aus Altklausuren und Prüfungsfragen-Sammlungen. Unter „Herkunft“ kannst du weitere Fragearten dazunehmen – z. B. Altklausur + Lernziele.</p>` : ''}
  <label class="lbl muted" for="qk">Kapitel</label><select class="sel" id="qk">${opts}</select>
  <div id="qowrap"><div class="lbl muted" style="margin-top:6px">Herkunft <span class="small" style="text-transform:none;letter-spacing:0">· mehrere wählbar</span></div><div class="seg multi" id="qo"></div></div>
  <div class="lbl muted" style="margin-top:6px">Fragetyp</div><div class="seg" id="qt"></div>
  <label class="lbl muted" for="qn" style="margin-top:6px">Anzahl Fragen</label><select class="sel" id="qn" style="max-width:260px"></select>
  <div style="display:flex;flex-wrap:wrap;gap:10px;margin-top:6px"><label class="sw" style="background:var(--bg)"><input type="checkbox" id="qx" role="switch"> Prüfungsmodus <span class="small">ohne Joker, Auflösung am Ende</span></label></div>
  <div style="display:flex;flex-wrap:wrap;gap:10px;margin-top:10px"><button class="btn" type="button" id="qgo" data-act="qstart" data-id="${id}"${alt ? ' data-alt="1"' : ''}>Los geht’s${svg('arrow', '#FFFFFF', 18)}</button>${nWrongHere ? `<button class="btn lt" type="button" data-act="qwrong" data-id="${id}">Nur Fehler wiederholen (${nWrongHere})</button>` : ''}</div>
  <p class="small" style="margin:0">Single Choice: genau eine Antwort ist richtig. Mehrfachauswahl: mehrere Antworten können richtig sein, du wählst alle passenden aus und prüfst dann. Joker pro Runde: 3× Hinweis und 3× 50:50.</p>
  <details class="rules"><summary>So gibt es Punkte</summary><ul><li>Jede Frage: <b>höchstens 5 Punkte</b>, nie Minuspunkte – schlechtestenfalls 0 (wie in der Moodle-Prüfung)</li><li>Single Choice, Wahr/Falsch, offene Frage „Gewusst“: <b>5 Punkte</b> oder 0</li><li>Mehrfachauswahl: Teilpunkte – (richtig angekreuzte − falsch angekreuzte) ÷ Anzahl richtiger Antworten × 5, in halben Punkten</li><li>Drag & Drop: Anteil richtig zugeordneter Begriffe × 5</li><li>Pro benutztem Joker: <b>−1 Punkt</b> (nicht unter 0)</li></ul></details></section>${alt ? altCard(id) : progressCard(id)}</div>`;
    shell('start', id, inner); updSetup();
  }

  /* Fragen-Rotation: zuletzt gesehene Fragen nach hinten */
  const SEENK = 'lp-seen-v1'; let SEEN = {}; try { SEEN = JSON.parse(localStorage.getItem(SEENK) || '{}') || {}; } catch (e) { SEEN = {}; }
  function qhash(s) { let h = 5381; for (let i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) | 0; return (h >>> 0).toString(36); }
  function qkey(id, qi) { const q = data(id).qs[qi]; return q ? id + ':' + qhash((q.q || '') + '|' + (q.o && q.o[0] ? q.o[0][0] : '') + '|' + (q.a || '').slice(0, 40)) : id + ':' + qi; }
  function markSeen(id, qi) { SEEN[qkey(id, qi)] = Date.now(); try { localStorage.setItem(SEENK, JSON.stringify(SEEN)); } catch (e) { } if (typeof progPush === 'function') progPush(); }
  function freshPairs(pairs) { const r = shuffle(pairs); return r.map((p, i) => [p, SEEN[qkey(p[0], p[1])] || 0, i]).sort((x, y) => x[1] - y[1] || x[2] - y[2]).map(x => x[0]); }
  /* Varianten-Abstand: Original, Umkehrung, Wahr/Falsch und inhaltsgleiche Fragen teilen Schlüssel in q.g
     und erscheinen frühestens nach VGAP anderen Fragen erneut. */
  const VGAP = 10;
  function vkeys(p) { const q = data(p[0]).qs[p[1]]; const g = q && q.g && q.g.length ? q.g : [p[1]]; return g.map(k => p[0] + ':' + k); }
  function spaceVariants(list) {
    const rest = list.slice(), out = [], last = {}, cnt = {}; const KS = new Map(); rest.forEach(p => { const ks = vkeys(p); KS.set(p, ks); ks.forEach(k => cnt[k] = (cnt[k] || 0) + 1); });
    const maxc = Math.max(1, ...Object.values(cnt)); const gap = Math.min(10, Math.max(2, Math.floor(list.length / maxc)));
    while (rest.length) {
      let pick = -1, press = -1, alt = 0, best = -1;
      for (let i = 0, W = Math.min(rest.length, 300); i < W; i++) {
        const ks = KS.get(rest[i]); let age = Infinity, pr = 0; for (const k of ks) { if (last[k] != null) age = Math.min(age, out.length - last[k]); pr = Math.max(pr, cnt[k]); }
        if (age >= gap) { if (pr > press) { press = pr; pick = i; } } else if (age > best) { best = age; alt = i; }
      }
      if (pick < 0) pick = alt; const p = rest.splice(pick, 1)[0]; KS.get(p).forEach(k => { last[k] = out.length; cnt[k]--; }); out.push(p);
    }
    return out;
  }
  function variantFirst(pairs) { const used = new Set(), a = [], b = []; pairs.forEach(p => { const ks = vkeys(p); if (ks.some(k => used.has(k))) b.push(p); else { ks.forEach(k => used.add(k)); a.push(p); } }); return a.concat(b); }
  window.__lpTest = { freshPairs: (...a) => freshPairs(...a), poolFor: (...a) => poolFor(...a), pairsFor: (...a) => pairsFor(...a), spaceVariants, variantFirst, vkeys, shuffle: (...a) => shuffle(...a), SUBJ };
  function startQuiz(list, opts) {
    list = spaceVariants(list);
    QZ = { list, i: 0, score: 0, pts: 0, max: 0, jh: 3, jf: 3, uh: 0, uf: 0, exam: !!opts.exam, home: opts.home, ret: opts.ret, wrong: [], answers: [], t0: Date.now(), cur: null, p0: {}, states: [] };
    [...new Set(list.map(x => x[0]))].forEach(id => QZ.p0[id] = pct(id));
    nextQ();
  }
  function hasAns(x) { if (!x) return false; if (x.done) return true; if (!QZ.exam) return false; const q = data(x.id).qs[x.qi]; if (q.y === 'tf') return x.tfv != null; if (q.y === 'cat' || q.y === 'ord') return !!x.saved; if (isOpen(q)) return false; return x.sel.size > 0; }
  function qOpenIdx() { const r = []; for (let i = 0; i < QZ.list.length; i++) { if (!hasAns(QZ.states[i])) r.push(i); } return r; }
  function goQ(i) { QZ.over = false; QZ.i = Math.max(0, Math.min(i, QZ.list.length - 1)); nextQ(); const el = document.querySelector('.qcard'); if (el) { const y = el.getBoundingClientRect().top + window.scrollY - 12; if (Math.abs(window.scrollY - y) > 40) window.scrollTo(0, y); } }
  function advanceQ() { if (QZ.exam && QZ.i >= QZ.list.length - 1) { QZ.over = true; QZ.conf = false; renderQ(); window.scrollTo(0, 0); return; } if (QZ.i < QZ.list.length - 1) return goQ(QZ.i + 1); const o = qOpenIdx().filter(i => i !== QZ.i); if (o.length) return goQ(o[0]); finishQuiz(); }
  function finishQuiz() { const keep = QZ.list.filter((_, i) => QZ.states[i] && QZ.states[i].done); QZ.skipped = QZ.list.length - keep.length; if (!keep.length) { history.back(); return; } QZ.list = keep; quizResult(); }
  function nextQ() {
    if (QZ.i >= QZ.list.length) { return finishQuiz(); }
    if (QZ.states[QZ.i]) { QZ.cur = QZ.states[QZ.i]; return renderQ(); }
    const [id, qi] = QZ.list[QZ.i]; const q = data(id).qs[qi];
    const idx = q.o.map((_, j) => j);
    QZ.cur = { id, qi, order: q.f ? idx : shuffle(idx), sel: new Set(), gone: new Set(), hint: false, done: false, correct: null, place: {}, pick: null, tfv: null };
    if (q.y === 'ord') { let o = shuffle(q.items.map((_, i) => i)); if (o.every((v, i) => v === i) && o.length > 1) o = o.reverse(); QZ.cur.ord = o; }
    QZ.states[QZ.i] = QZ.cur;
    renderQ();
  }
  function renderQ() {
    if (QZ.exam && QZ.over) return renderOverview();
    const c = QZ.cur, s = BYID[c.id], q = data(c.id).qs[c.qi], d = data(c.id);
    if (!c._seen) { c._seen = 1; markSeen(c.id, c.qi); }
    const multi = !!q.m, open = isOpen(q);
    const special = q.y ? renderSpecial(c, q, s, d) : null;
    const opts = special ? special.html : open ? (c.revealed ? `<div class="fb" style="background:#E9E3FA"><b style="color:#4B3A8C">Musterantwort</b><div>${q.a || ''}</div>${srcHtml(q)}${q.sec >= 0 && d.secs[q.sec] ? `<a class="btn lt" style="align-self:flex-start;min-height:44px;font-size:14px" href="#f-${c.id}-lern-${q.sec}">${svg('book', s.ink, 18)}Im Lernteil nachlesen: ${E(d.secs[q.sec].t)}</a>` : ''}</div>` : `<div class="hint" style="background:#E9E3FA">${svg('quiz', '#4B3A8C', 20, ' style="flex:none;margin-top:1px"')}<span><b style="color:#4B3A8C">Offene Frage:</b> Überleg dir zuerst deine Antwort, dann deck die Musterantwort auf und bewerte dich ehrlich.</span></div>`) : c.order.map((j, pos) => {
      const [txt, ok] = q.o[j];
      let cls = 'opt';
      if (c.done && !QZ.exam) { if (ok) cls += ' ok'; else if (c.sel.has(j)) cls += ' bad'; }
      else if (c.sel.has(j)) cls += ' sel';
      if (c.gone.has(j)) cls += ' gone';
      const mark = c.done && !QZ.exam && ok ? svg('check', '#1F6B4D', 22) : '';
      return `<button type="button" class="${cls}" data-act="opt" data-j="${j}"${c.done || c.gone.has(j) ? ' disabled' : ''}${multi ? ` aria-pressed="${c.sel.has(j)}"` : ''}><span class="l">${LET[pos]}</span><span style="flex:1">${E(txt)}</span>${mark}</button>`;
    }).join('');
    const canJ = !QZ.exam && !c.done && !open && !q.y;
    const wrongOpts = q.o.filter((o, j) => !o[1] && !c.gone.has(j)).length;
    const jrow = QZ.exam ? `<div class="jrow"><span class="tag" style="background:#fff;color:#2A2440">${svg('clock', '#2A2440', 18)} Prüfungsmodus · keine Joker · Auflösung nach dem Abgeben</span><button class="btn lt" type="button" data-act="qover">Gesamtansicht</button></div>` :
      `<div class="jrow"><div style="display:flex;flex-wrap:wrap;gap:8px"><button type="button" class="jk" style="background:#FDE6DA;color:#8C3F1E" data-act="jh" aria-label="Hinweis-Joker, noch ${QZ.jh} von 3"${canJ && QZ.jh > 0 && !c.hint && q.h ? '' : ' disabled'}>${svg('bulb', '#8C3F1E', 20)}Hinweis<em>${QZ.jh} / 3</em></button><button type="button" class="jk" style="background:#E9E3FA;color:#4B3A8C" data-act="jf" aria-label="50:50-Joker, noch ${QZ.jf} von 3"${canJ && QZ.jf > 0 && c.gone.size === 0 && wrongOpts >= 2 ? '' : ' disabled'}>${svg('scissors', '#4B3A8C', 20)}50 : 50<em>${QZ.jf} / 3</em></button></div><button class="btn lt" type="button" data-act="qquit">Beenden</button></div>`;
    const nDone = QZ.list.length - qOpenIdx().length; const pc = Math.round(100 * nDone / QZ.list.length);
    const stats = `<div class="stats"><div><span class="lbl muted">Frage</span><b>${QZ.i + 1} / ${QZ.list.length}</b><div class="prog" style="margin-top:6px"><i style="width:${pc}%;background:#6B5FA8"></i></div></div>${QZ.exam ? `<div style="background:#E9E3FA;color:#4B3A8C"><span class="lbl">Zeit</span><b id="qtime">${fmtT(Date.now() - QZ.t0)}</b></div>` : `<div style="background:#E9E3FA;color:#4B3A8C"><span class="lbl">Punkte</span><b>${fmtN(QZ.pts)}${QZ.max ? ` / ${QZ.max} · ${Math.round(100 * QZ.pts / QZ.max)} %` : ''}</b></div><div style="background:#DDF3EA;color:#1F6B4D"><span class="lbl">Richtig</span><b>${QZ.score}</b></div><div style="background:#FDE6DA;color:#8C3F1E"><span class="lbl">Serie</span><b>${streakInQuiz()} ${svg('flame', '#8C3F1E', 20, ' style="vertical-align:-2px"')}</b></div>`}</div>`;
    let fb = '';
    if (c.done && !QZ.exam && !open && !q.y) {
      const right = q.o.filter(o => o[1]).map(o => E(o[0])).join(' · ');
      const secOk = q.sec >= 0 && d.secs[q.sec];
      fb = `<div class="fb ${c.correct ? 'ok' : 'bad'}"><b style="font-size:18px;color:${c.correct ? '#1F6B4D' : '#9B2C3A'}">${c.correct ? 'Richtig!' : 'Leider nicht ganz.'}</b>${c.correct ? '' : `<span><b>Richtig wäre:</b> ${right}</span>`}${q.e ? `<span>${E(q.e)}</span>` : ''}${q.x ? `<details><summary>Hintergrund aus den Folien</summary><p style="margin:8px 0 0">${E(q.x)}</p></details>` : ''}${srcHtml(q)}${secOk ? `<a class="btn lt" style="align-self:flex-start;min-height:44px;font-size:14px" href="#f-${c.id}-lern-${q.sec}" data-act="tolern">${svg('book', s.ink, 18)}Im Lernteil nachlesen: ${E(d.secs[q.sec].t)}</a>` : ''}</div>`;
    }
    const label = (QZ.home === 'mix' ? E(s.name) + ' · ' : '') + E(q.t || '');
    const imgsrc = q.i ? img(q.i) : null;
    const actions = special ? special.actions : open ? (c.revealed && !c.done ? `<div style="display:flex;flex-wrap:wrap;justify-content:flex-end;gap:10px"><button class="btn lt" type="button" data-act="qself" data-v="0" style="box-shadow:inset 0 0 0 2px #9B2C3A;color:#9B2C3A">Nicht gewusst</button><button class="btn" type="button" data-act="qself" data-v="1" style="background:#1F6B4D">Gewusst</button></div>` : c.done ? `<div style="display:flex;justify-content:flex-end"><button class="btn" type="button" data-act="qnext">${nextLbl()}${svg('arrow', '#FFFFFF', 18)}</button></div>` : `<div style="display:flex;justify-content:flex-end"><button class="btn" type="button" data-act="qreveal">Musterantwort zeigen</button></div>`) : c.done ? `<div style="display:flex;justify-content:flex-end"><button class="btn" type="button" data-act="qnext">${nextLbl()}${svg('arrow', '#FFFFFF', 18)}</button></div>`
      : QZ.exam ? examActs(multi) : (multi ? `<div style="display:flex;flex-wrap:wrap;justify-content:space-between;align-items:center;gap:10px"><span class="small">Mehrere Antworten können richtig sein.</span><button class="btn" type="button" data-act="qcheck"${c.sel.size ? '' : ' disabled'}>Antwort prüfen</button></div>` : `<div style="display:flex;flex-wrap:wrap;justify-content:space-between;align-items:center;gap:10px"><span class="small">Antwort wählen, dann bestätigen – bis dahin änderbar.</span><button class="btn" type="button" data-act="qcheck"${c.sel.size ? '' : ' disabled'}>Antwort prüfen</button></div>`);
    const ttag = q.y === 'tf' ? 'Wahr oder falsch · max. 5 P' : q.y === 'cat' ? 'Drag & Drop · Zuordnen · max. 5 P' : q.y === 'ord' ? 'Drag & Drop · Reihenfolge · max. 5 P' : open ? 'Offene Frage · max. 5 P' : multi ? 'Mehrfachauswahl · mehrere richtig · max. 5 P' : 'Single Choice · eine richtig · max. 5 P';
    const chip = c.done && !QZ.exam && c.sc ? `<div class="ptschip${c.sc.p ? '' : ' zero'}" role="status"><b>+${fmtN(c.sc.p)} von ${c.sc.max} Punkten</b><span>${E(c.sc.parts.join(' · ') || 'keine Punkte für diese Frage')}</span></div>` : '';
    const card = `<section class="qcard"><div style="display:flex;flex-wrap:wrap;justify-content:space-between;align-items:center;gap:8px"><span class="lbl" style="color:${s.ink}">${label}</span><span class="tag" style="background:${multi || isDnd(q) ? '#E9E3FA' : open || q.y === 'tf' ? '#FBF1D5' : '#F1EFF6'};color:${multi || isDnd(q) ? '#4B3A8C' : open || q.y === 'tf' ? '#6E5310' : '#5A5470'}">${ttag}</span></div>${qNav()}<h1>${E(q.q)}</h1>${origHtml(q)}${imgsrc ? `<img class="qimg" alt="Abbildung zur Frage" src="${imgsrc}">` : ''}${c.hint ? `<div class="hint">${svg('bulb', '#8C3F1E', 20, ' style="flex:none;margin-top:1px"')}<span><b style="color:#8C3F1E">Hinweis:</b> ${E(q.h)}</span></div>` : ''}${opts}${chip}${fb}${actions}</section>`;
    const head = QZ.home === 'mix' ? `<section class="card" style="padding:20px 26px"><h1 class="h2">${E(QZ.title)}</h1></section>` : band(c.id, QZ.lz ? 'lernziele' : QZ.alt ? 'alt' : 'quiz', QZ.alt ? -1 : QZ.ret);
    shell(QZ.home === 'mix' ? QZ.nav : 'start', QZ.home === 'mix' ? null : c.id, head + `<div class="qwrap">${jrow}${stats}${card}</div>`);
  }
  function fbBox(c, q, s, d, extra) {
    if (!c.done || QZ.exam) return '';
    const secOk = q.sec >= 0 && d.secs[q.sec];
    return `<div class="fb ${c.correct ? 'ok' : 'bad'}"><b style="font-size:18px;color:${c.correct ? '#1F6B4D' : '#9B2C3A'}">${c.correct ? 'Richtig!' : c.partialTxt || 'Leider nicht ganz.'}</b>${extra || ''}${q.e ? `<span>${E(q.e)}</span>` : ''}${q.x ? `<details><summary>Hintergrund aus den Folien</summary><p style="margin:8px 0 0">${E(q.x)}</p></details>` : ''}${srcHtml(q)}${secOk ? `<a class="btn lt" style="align-self:flex-start;min-height:44px;font-size:14px" href="#f-${c.id}-lern-${q.sec}">${svg('book', s.ink, 18)}Im Lernteil nachlesen: ${E(d.secs[q.sec].t)}</a>` : ''}</div>`;
  }
  function nextLbl() { if (QZ.i < QZ.list.length - 1) return 'Nächste Frage'; const o = qOpenIdx().filter(i => i !== QZ.i).length; return o ? `Zu den offenen Fragen (${o})` : 'Ergebnis ansehen'; }
  function qNav() {
    const last = QZ.i === QZ.list.length - 1; const otherOpen = qOpenIdx().filter(i => i !== QZ.i); const fwd = !last || otherOpen.length;
    const nOpen = qOpenIdx().length;
    return `<div class="qnav"><button class="btn lt" type="button" data-act="qprev"${QZ.i > 0 ? '' : ' disabled'} aria-label="Vorherige Frage"><span style="display:inline-flex;transform:rotate(180deg)">${svg('arrow', '#2A2440', 18)}</span>Zurück</button><span class="qnav-mid"><b>Frage ${QZ.i + 1} / ${QZ.list.length}</b>${nOpen ? ` · ${nOpen} offen` : ' · alle beantwortet'}</span><button class="btn lt" type="button" data-act="qfwd"${fwd ? '' : ' disabled'} aria-label="Nächste Frage">${last && otherOpen.length ? 'Offene Frage' : 'Weiter'}${svg('arrow', '#2A2440', 18)}</button></div>`;
  }
  const nextBtn = () => `<div style="display:flex;justify-content:flex-end"><button class="btn" type="button" data-act="qnext">${nextLbl()}${svg('arrow', '#FFFFFF', 18)}</button></div>`;
  function renderSpecial(c, q, s, d) {
    if (q.y === 'tf') {
      const b = (v, l) => {
        let cls = 'tfb'; if (c.done && !QZ.exam) { if ((q.tf ? 1 : 0) === v) cls += ' ok'; else if (c.tfv === v) cls += ' bad'; } else if (c.tfv === v) cls += ' sel';
        return `<button type="button" class="${cls}" data-act="tf" data-v="${v}"${c.done ? ' disabled' : ''}>${svg(v ? 'check' : 'cross', v ? '#1F6B4D' : '#9B2C3A', 26)}${l}</button>`;
      };
      return { html: `<div class="tfrow">${b(1, 'Wahr')}${b(0, 'Falsch')}</div>` + fbBox(c, q, s, d, c.correct ? '' : `<span><b>Richtig ist:</b> ${q.tf ? 'Wahr' : 'Falsch'}</span>`), actions: c.done ? nextBtn() : QZ.exam ? '' : `<div style="display:flex;flex-wrap:wrap;justify-content:space-between;align-items:center;gap:10px"><span class="small">Antwort wählen, dann bestätigen.</span><button class="btn" type="button" data-act="tfcheck"${c.tfv == null ? ' disabled' : ''}>Antwort prüfen</button></div>` };
    }
    if (q.y === 'cat') {
      const show = c.done && !QZ.exam;
      const chip = i => {
        const pl = c.place[i]; let cls = 'chip'; if (show) cls += (pl === q.items[i][1] ? ' ok' : ' bad'); else if (c.pick === i) cls += ' sel';
        return `<button type="button" class="${cls}" data-act="dchip" data-i="${i}"${c.done ? ' disabled' : ''}>${E(q.items[i][0])}${show && pl !== q.items[i][1] ? `<small>→ ${E(q.cats[q.items[i][1]])}</small>` : ''}</button>`;
      };
      const order = c.order2 || (c.order2 = shuffle(q.items.map((_, i) => i)));
      const pool = order.filter(i => c.place[i] == null);
      const boxes = q.cats.map((cat, ci) => `<div class="dbox${c.pick != null && !c.done ? ' armed' : ''}" data-drop="${ci}" data-act="dbox" data-c="${ci}" role="button" tabindex="0" aria-label="Kategorie: ${E(cat)}"><div class="dbh">${E(cat)}</div><div class="dbc">${order.filter(i => c.place[i] === ci).map(chip).join('')}</div></div>`).join('');
      const all = pool.length === 0;
      return {
        html: `<p class="small" style="margin:0">Zieh jeden Begriff in das passende Feld. Am Handy oder ohne Maus: Begriff antippen, dann das Feld antippen.</p>
      <div class="dpool" data-drop="-1">${pool.length ? pool.map(chip).join('') : '<span class="small">Alle Begriffe sind verteilt.</span>'}</div><div class="dboxes">${boxes}</div>` + fbBox(c, q, s, d, ''),
        actions: c.done ? nextBtn() : `<div style="display:flex;flex-wrap:wrap;justify-content:space-between;gap:10px"><button class="btn lt" type="button" data-act="dreset">Zurücksetzen</button><button class="btn" type="button" data-act="dcheck"${all ? '' : ' disabled'}>${QZ.exam ? 'Antwort speichern' : 'Antwort prüfen'}</button></div>`
      };
    }
    if (q.y === 'ord') {
      const show = c.done && !QZ.exam;
      const rows = c.ord.map((it, pos) => { const ok = it === pos; return `<li class="orow${show ? (ok ? ' ok' : ' bad') : ''}" data-pos="${pos}"><span class="grip" aria-hidden="true">${svg('grip', '#5A5470', 20)}</span><span class="otx">${E(q.items[it][0])}${show ? ` <b class="oyr">${E(q.items[it][1])}</b>` : ''}</span>${c.done ? '' : `<span class="oud"><button type="button" class="ob" data-act="oup" data-p="${pos}" aria-label="Nach oben"${pos === 0 ? ' disabled' : ''}>${svg('up', '#2A2440', 18)}</button><button type="button" class="ob" data-act="odn" data-p="${pos}" aria-label="Nach unten"${pos === c.ord.length - 1 ? ' disabled' : ''}>${svg('down', '#2A2440', 18)}</button></span>`}</li>`; }).join('');
      const corr = show && !c.correct ? `<span><b>Richtige Reihenfolge:</b> ${q.items.map(x => E(x[1]) + ' ' + E(x[0])).join(' → ')}</span>` : '';
      return {
        html: `<p class="small" style="margin:0">Ganz oben steht das früheste Ereignis. Zieh die Zeilen an die richtige Stelle oder nutze die Pfeile.</p><ol class="olist">${rows}</ol>` + fbBox(c, q, s, d, corr),
        actions: c.done ? nextBtn() : `<div style="display:flex;justify-content:flex-end"><button class="btn" type="button" data-act="ocheck">${QZ.exam ? 'Reihenfolge speichern' : 'Reihenfolge prüfen'}</button></div>`
      };
    }
    return { html: '', actions: '' };
  }
  function finishSpecial(ok, pts, max, partialTxt) {
    const c = QZ.cur;
    c.done = true; c.correct = ok; c.partialTxt = partialTxt; QZ.answers.push(ok);
    if (ok) QZ.score++; else QZ.wrong.push([c.id, c.qi, []]);
    const f = max ? Math.max(0, Math.min(1, pts / max)) : 0; pts = half(QMAX * f); max = QMAX;
    c.sc = { p: pts, max, parts: [ok ? 'richtig' : (pts ? `${Math.round(f * 100)} % richtig` : '')].filter(Boolean) };
    QZ.pts += pts; QZ.max += max; addPts(c.id, pts); record(c.id, c.qi, ok);
    if (QZ.exam) { advanceQ(); } else renderQ();
  }
  function streakInQuiz() { let n = 0; for (let i = QZ.answers.length - 1; i >= 0; i--) { if (QZ.answers[i]) n++; else break; } return n; }
  function fmtT(ms) { const s = Math.floor(ms / 1000); return Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0'); }
  function checkQ() {
    const c = QZ.cur, q = data(c.id).qs[c.qi];
    const right = new Set(q.o.map((o, j) => o[1] ? j : -1).filter(j => j >= 0));
    const ok = right.size === c.sel.size && [...c.sel].every(j => right.has(j));
    const partial = !ok && !!q.m && c.sel.size > 0 && [...c.sel].some(j => right.has(j));
    finishQ(ok, partial);
  }
  function finishQ(ok, partial) {
    const c = QZ.cur, q = data(c.id).qs[c.qi];
    c.done = true; c.correct = ok; QZ.answers.push(ok);
    if (ok) QZ.score++; else QZ.wrong.push([c.id, c.qi, [...c.sel]]);
    const sc = scoreQ(c, q, ok, partial); c.sc = sc; QZ.pts += sc.p; QZ.max += sc.max; addPts(c.id, sc.p);
    record(c.id, c.qi, ok);
    if (QZ.exam) { advanceQ(); } else renderQ();
  }

  /* ---------- Prüfungsmodus: Gesamtansicht, Abgeben, Teilpunkte ---------- */
  (() => { const ss = document.createElement('style'); ss.textContent = '.ovlist{display:flex;flex-direction:column;gap:8px}.ovrow{display:flex;align-items:center;gap:12px;width:100%;text-align:left;padding:12px 14px;border-radius:16px;border:2px solid var(--line);background:#fff;font:inherit;color:var(--ink);cursor:pointer}.ovrow:hover{border-color:var(--lav)}.ovrow.open{border-color:#E7B416;background:#FFF8E1}.ovn{width:34px;height:34px;border-radius:10px;background:var(--bg);font-weight:800;display:flex;align-items:center;justify-content:center;flex:none}.ovt{flex:1;min-width:0;display:flex;flex-direction:column;gap:2px}.ovc{font-weight:800;color:var(--lav);font-size:14px;flex:none}.ovconf{display:flex;flex-direction:column;gap:10px;background:#FDE2E4;border-radius:18px;padding:16px 18px}'; document.head.appendChild(ss); })();
  function examActs(multi) { const last = QZ.i >= QZ.list.length - 1; return `<div style="display:flex;flex-wrap:wrap;justify-content:space-between;align-items:center;gap:10px"><span class="small">${multi ? 'Mehrere Antworten können richtig sein. ' : ''}Du kannst deine Antwort bis zum Abgeben jederzeit ändern.</span><button class="btn" type="button" data-act="${last ? 'qover' : 'qnext'}">${last ? 'Zur Gesamtansicht' : 'Nächste Frage'}${svg('arrow', '#FFFFFF', 18)}</button></div>`; }
  function ansSummary(c, q) { if (!c) return ''; if (q.y === 'tf') return c.tfv == null ? '' : (c.tfv ? 'Wahr' : 'Falsch'); if (q.y === 'cat' || q.y === 'ord') return c.saved ? 'Antwort gespeichert' : ''; if (isOpen(q)) return c.done ? (c.correct ? 'Gewusst' : 'Nicht gewusst') : ''; return [...c.sel].map(j => E(q.o[j][0])).join(' · '); }
  function renderOverview() {
    const nOpen = qOpenIdx().length, first = qOpenIdx()[0];
    const rows = QZ.list.map(([id, qi], i) => {
      const q = data(id).qs[qi], c = QZ.states[i], ok = hasAns(c), a = ansSummary(c, q);
      return `<button type="button" class="ovrow${ok ? '' : ' open'}" data-act="qgoto" data-i="${i}"><span class="ovn">${i + 1}</span><span class="ovt"><b>${E(q.q)}</b><span class="small">${ok ? ('Deine Antwort: ' + (a || 'beantwortet')) : 'Noch nicht beantwortet'}</span></span><span class="ovc">${ok ? 'Ändern' : 'Beantworten'}</span></button>`;
    }).join('');
    const conf = QZ.conf ? `<div class="ovconf" role="alertdialog" aria-label="Abgeben bestätigen"><b style="font-size:18px">Prüfung endgültig abgeben?</b><span>${nOpen ? `${nOpen} ${nOpen === 1 ? 'Frage ist' : 'Fragen sind'} noch unbeantwortet und ${nOpen === 1 ? 'zählt' : 'zählen'} mit 0 Punkten. ` : ''}Danach kannst du nichts mehr ändern.</span><div style="display:flex;gap:10px;flex-wrap:wrap;justify-content:flex-end"><button class="btn lt" type="button" data-act="qsubno">Abbrechen</button><button class="btn" type="button" data-act="qsubyes" style="background:#9B2C3A">Ja, endgültig abgeben</button></div></div>` : `<div style="display:flex;flex-wrap:wrap;justify-content:space-between;gap:10px"><button class="btn lt" type="button" data-act="qgoto" data-i="${nOpen ? first : QZ.i}">${nOpen ? 'Zur ersten offenen Frage' : 'Zurück zur Prüfung'}</button><button class="btn" type="button" data-act="qsub">Endgültig abgeben</button></div>`;
    const id0 = QZ.list[0][0];
    const head = QZ.home === 'mix' ? `<section class="card" style="padding:20px 26px"><h1 class="h2">${E(QZ.title || 'Prüfung')}</h1></section>` : band(id0, QZ.lz ? 'lernziele' : 'quiz', QZ.ret);
    shell(QZ.home === 'mix' ? QZ.nav : 'start', QZ.home === 'mix' ? null : id0, head + `<div class="qwrap"><section class="qcard"><div style="display:flex;flex-wrap:wrap;justify-content:space-between;align-items:center;gap:10px"><span class="lbl muted">Gesamtansicht vor dem Abgeben</span><span class="tag" style="background:#E9E3FA;color:#4B3A8C">${svg('clock', '#4B3A8C', 16)} <span id="qtime">${fmtT(Date.now() - QZ.t0)}</span></span></div><h1 style="font-size:28px">${QZ.list.length - nOpen} von ${QZ.list.length} Fragen beantwortet</h1><p class="small" style="margin:0">Tipp auf eine Frage, um deine Antwort anzusehen oder zu ändern. Bewertet wird erst nach dem Abgeben.</p><div class="ovlist">${rows}</div>${conf}</section></div>`);
  }
  function tpScore(c, q) {
    if (!c) return 0;
    if (q.y === 'tf') return c.tfv != null && c.tfv === (q.tf ? 1 : 0) ? 1 : 0;
    if (q.y === 'cat') { const n = q.items.length; return n ? q.items.filter((it, i) => c.place[i] === it[1]).length / n : 0; }
    if (q.y === 'ord') { const n = q.items.length; return n && c.ord ? c.ord.filter((it, pos) => it === pos).length / n : 0; }
    if (isOpen(q)) return c.done && c.correct ? 1 : 0;
    const R = q.o.map((o, j) => o[1] ? j : -1).filter(j => j >= 0); if (!R.length) return 0;
    if (!q.m) return c.sel.size === 1 && R.includes([...c.sel][0]) ? 1 : 0;
    let r = 0, w = 0; c.sel.forEach(j => { if (q.o[j][1]) r++; else w++; }); return Math.max(0, (r - w) / R.length);
  }
  function fmtN(x) { return (Math.round(x * 10) / 10).toString().replace('.', ','); }
  function examSubmit() {
    QZ.over = false; QZ.conf = false; QZ.tp = 0; QZ.tpMax = QZ.list.length; QZ.byTopic = {};
    QZ.list.forEach(([id, qi], i) => {
      const q = data(id).qs[qi], d = data(id); let c = QZ.states[i];
      if (!c) { c = { id, qi, order: q.o.map((_, j) => j), sel: new Set(), gone: new Set(), hint: false, done: false, correct: null, place: {}, pick: null, tfv: null }; QZ.states[i] = c; }
      const tp = tpScore(c, q); QZ.tp += tp;
      const hasSec = q.sec >= 0 && d.secs[q.sec]; const key = id + ':' + (hasSec ? q.sec : (q.t || '-'));
      const tb = QZ.byTopic[key] || (QZ.byTopic[key] = { id, sec: hasSec ? q.sec : -1, t: hasSec ? d.secs[q.sec].t : (q.t || 'Sonstiges'), n: 0, p: 0 }); tb.n++; tb.p += tp;
      if (c.done) return;
      const ok = tp >= 0.999, partial = !ok && tp > 0;
      c.done = true; c.correct = ok; QZ.answers.push(ok);
      if (ok) QZ.score++; else QZ.wrong.push([id, qi, [...c.sel]]);
      let sc; if (q.y) { sc = { p: half(QMAX * tp), max: QMAX, parts: [] }; } else sc = scoreQ(c, q, ok, partial);
      c.sc = sc; QZ.pts += sc.p; QZ.max += sc.max; addPts(id, sc.p); record(id, qi, ok);
    });
    QZ.skipped = 0; QZ.tEnd = Date.now(); quizResult();
  }
  function examTopics() {
    if (!QZ.exam || !QZ.byTopic) return ''; const L = Object.values(QZ.byTopic).map(x => ({ ...x, pc: Math.round(100 * x.p / x.n) })).sort((a, b) => a.pc - b.pc); if (!L.length) return '';
    return `<section class="card"><h2 class="h2" style="font-size:22px;margin-bottom:6px">Auswertung nach Kapiteln</h2><p class="small" style="margin:0 0 10px">Schwächste Kapitel zuerst. Unter 70 % lohnt sich Wiederholen.</p>${L.map(x => { const s = BYID[x.id]; return `<div class="pg"><span class="pgn">${x.sec >= 0 ? `<a href="#f-${x.id}-lern-${x.sec}">${E(x.t)}</a>` : E(x.t)}${QZ.home === 'mix' && s ? ` <span class="small">· ${E(s.name)}</span>` : ''}</span><div class="prog" style="flex:1"><i style="width:${x.pc}%;background:${x.pc >= 70 ? '#1F6B4D' : x.pc >= 50 ? '#C9A227' : '#9B2C3A'}"></i></div><b>${x.pc} % · ${fmtN(x.p)}/${x.n}</b>${x.pc < 70 && x.sec >= 0 ? `<a class="tag" style="background:var(--bg);color:var(--ink);text-decoration:none" href="#f-${x.id}-quiz-${x.sec}">Wiederholen</a>` : ''}</div>`; }).join('')}</section>`;
  }
  function quizResult() {
    const n = QZ.list.length, p = n ? Math.round(100 * QZ.score / n) : 0;
    const s0 = QZ.home === 'mix' ? null : BYID[QZ.list[0][0]];
    const key = s0 ? s0.id : (QZ.nav === 'pruefung' ? 'pruefung' : 'fehler');
    let newBest = false, prevBest = st.best[key];
    if (!QZ.saved && n) {
      QZ.saved = true;
      st.hist.push({ t: Date.now(), k: key, title: s0 ? s0.name : QZ.title, n, ok: QZ.score, pts: QZ.pts, max: QZ.max, exam: QZ.exam });
      st.hist = st.hist.slice(-200);
      if (n >= 10 && (prevBest == null || p > prevBest)) { st.best[key] = p; newBest = prevBest != null; }
      save();
    }
    QZ.newBest = QZ.newBest || newBest;
    const wrongs = QZ.wrong.map(([id, qi, sel]) => {
      const q = data(id).qs[qi], d = data(id);
      return `<div class="it"><b>${E(q.q)}</b><br><span style="color:#1F6B4D"><b>Richtig:</b> ${answerText(q)}</span>${sel.length ? `<br><span style="color:#9B2C3A"><b>Deine Wahl:</b> ${sel.map(j => E(q.o[j][0])).join(' · ')}</span>` : ''}${q.e ? `<br><span class="small">${E(q.e)}</span>` : ''}${srcHtml(q, 1)}${q.sec >= 0 && d.secs[q.sec] ? `<a href="#f-${id}-lern-${q.sec}" style="font-weight:800">Im Lernteil nachlesen</a>` : ''}</div>`;
    }).join('');
    const msg = p >= 90 ? 'Ausgezeichnet!' : p >= 70 ? 'Sehr gut!' : p >= 50 ? 'Gut, dranbleiben!' : 'Weiter üben – das wird!';
    const head = s0 ? band(s0.id, QZ.lz ? 'lernziele' : 'quiz', QZ.ret) : `<section class="card" style="padding:20px 26px"><h1 class="h2">${E(QZ.title)}</h1></section>`;
    const ptsP = QZ.max ? Math.round(100 * QZ.pts / QZ.max) : 0;
    const prog = Object.keys(QZ.p0).filter(id => BYID[id]).map(id => {
      const a0 = QZ.p0[id], a1 = pct(id), s = BYID[id];
      return `<div class="pg"><span class="pgn">${E(s.name)}</span><div class="prog" style="flex:1"><i style="width:${a1}%;background:${s.ink}"></i></div><b>${a0} % → ${a1} %</b>${a1 > a0 ? `<span class="tag" style="background:#DDF3EA;color:#1F6B4D">+${a1 - a0}</span>` : ''}</div>`;
    }).join('');
    shell(s0 ? 'start' : QZ.nav, s0 ? s0.id : null, head + `<div class="qwrap"><section class="qcard"><span class="lbl muted">Ergebnis</span><h1 style="font-size:34px">${msg}</h1>${QZ.skipped ? `<span class="small">${QZ.skipped} ${QZ.skipped === 1 ? 'Frage' : 'Fragen'} übersprungen und nicht gewertet.</span>` : ''}${QZ.newBest ? `<div class="ptschip"><b>Neuer Bestwert!</b><span>Vorher ${prevBest == null ? '–' : prevBest + ' %'} richtig in einer Runde mit mindestens 10 Fragen.</span></div>` : ''}
  <div class="stats"><div style="background:#E9E3FA;color:#4B3A8C"><span class="lbl">Punkte</span><b>${fmtN(QZ.pts)} / ${QZ.max} · ${ptsP} %</b><div class="prog" style="margin-top:6px;background:#fff"><i style="width:${Math.min(100, ptsP)}%;background:#4B3A8C"></i></div></div><div style="background:#DDF3EA;color:#1F6B4D"><span class="lbl">Richtig</span><b>${QZ.score} / ${n} · ${p} %</b></div>${QZ.exam && QZ.tpMax ? `<div style="background:#DDF3EA;color:#1F6B4D"><span class="lbl">Bewertung (Teilpunkte)</span><b>${fmtN(QZ.tp)} / ${QZ.tpMax} · ${Math.round(100 * QZ.tp / QZ.tpMax)} %</b></div>` : ''}${QZ.exam ? `<div style="background:#FBF1D5;color:#6E5310"><span class="lbl">Zeit</span><b>${fmtT((QZ.tEnd || Date.now()) - QZ.t0)}</b></div>` : `<div style="background:#FDE6DA;color:#8C3F1E"><span class="lbl">Joker benutzt</span><b>${QZ.uh}× Hinweis · ${QZ.uf}× 50:50</b></div>`}</div>
  ${prog ? `<div><div class="lbl muted" style="margin-bottom:8px">Dein Fortschritt (Fragen mindestens einmal richtig)</div>${prog}</div>` : ''}
  <div style="display:flex;flex-wrap:wrap;gap:10px">${QZ.wrong.length ? `<button class="btn" type="button" data-act="qretry">Falsche wiederholen (${QZ.wrong.length})</button>` : ''}<button class="btn lt" type="button" data-act="qagain">Neue Runde</button>${s0 ? `<a class="btn lt" href="#f-${s0.id}-lern-${st.lastBy[s0.id] || 0}">Zum Lernteil</a>` : ''}<a class="btn lt" href="#fortschritt">Gesamtfortschritt</a></div></section>
  ${examTopics()}${wrongs ? `<section class="card"><h2 class="h2" style="font-size:22px;margin-bottom:12px">Das solltest du dir nochmal ansehen</h2><div class="res">${wrongs}</div></section>` : ''}</div>`);
    QZ.finished = true;
  }
  /* ---------- Lernplan ---------- */
  const DAY = 86400000;
  function dkey(d) { return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); }
  function parseD(s) { const [y, m, d] = s.split('-').map(Number); return new Date(y, m - 1, d); }
  function today0() { const d = new Date(); d.setHours(0, 0, 0, 0); return d; }
  function daysTo(id) { const e = st.exams[id]; if (!e) return null; return Math.round((parseD(e) - today0()) / DAY); }
  const WD = ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'];
  function fmtDay(d) { const t = today0(); const n = Math.round((d - t) / DAY); const base = WD[d.getDay()] + ', ' + d.getDate() + '.' + (d.getMonth() + 1) + '.'; return n === 0 ? 'Heute · ' + base : n === 1 ? 'Morgen · ' + base : base; }
  function secMinutes(id, k) { const key = 'm' + id + k; if (TXT[key] == null) { const w = strip(data(id).secs[k].html).split(' ').length; TXT[key] = Math.max(5, Math.min(45, Math.round(w / 60))); } return TXT[key]; }
  function planTasks(id) {
    const d = data(id), s = BYID[id], ok = st.ok[id] || {}, rd = st.read[id] || {};
    const out = [];
    d.secs.forEach((c, k) => {
      const qi = d.qs.map((q, i) => inSec(d, q, k) && !q.hide ? i : -1).filter(i => i >= 0);
      const focus = !!(s.focus && s.focus[k]);
      const mul = focus ? 1.3 : 1;
      const kL = `${id}:${k}:lesen`, kQ = `${id}:${k}:quiz`;
      if (!rd[k] && !st.pdone[kL]) out.push({ key: kL, id, k, type: 'lesen', min: Math.round(secMinutes(id, k) * mul), label: `Lesen: ${c.t}`, href: `#f-${id}-lern-${k}`, focus });
      const done = qi.filter(i => ok[i]).length;
      if (qi.length && done / qi.length < 0.7 && !st.pdone[kQ]) out.push({ key: kQ, id, k, type: 'quiz', min: Math.round(Math.max(4, Math.min(25, (qi.length - done) * 0.8)) * mul), label: `Quiz: ${c.t} (${qi.length - done} offen)`, href: `#f-${id}-quiz-${k}`, focus });
    });
    return out;
  }
  function buildPlan() {
    const t0 = today0(), cfg = st.plan, wd = new Set(cfg.wd.length ? cfg.wd : [0, 1, 2, 3, 4, 5, 6]);
    const subs = SUBJ.filter(s => st.exams[s.id] && parseD(st.exams[s.id]) > t0);
    if (!subs.length) return { days: [], warn: [], subs: [] };
    const last = new Date(Math.max(...subs.map(s => parseD(st.exams[s.id]))));
    const days = []; for (let d = new Date(t0); d < last; d = new Date(d.getTime() + DAY)) { if (wd.has(d.getDay())) days.push({ d: new Date(d), tasks: [], used: 0 }); }
    const queue = {}, fixed = [];
    subs.forEach(s => {
      queue[s.id] = planTasks(s.id);
      const E0 = parseD(st.exams[s.id]); const before = days.filter(x => x.d < E0);
      const kS = `${s.id}:sim:${st.exams[s.id]}`, kW = `${s.id}:wdh:${st.exams[s.id]}`;
      if (before.length && !st.pdone[kS]) fixed.push([before[before.length - 1], { key: kS, id: s.id, type: 'sim', min: 30, label: 'Prüfungssimulation (Prüfungsmodus)', href: '#pruefung' }]);
      if (before.length > 1 && !st.pdone[kW]) fixed.push([before[before.length - 2], { key: kW, id: s.id, type: 'wdh', min: 30, label: 'Wiederholen: Fehlerkartei & schwache Kapitel', href: '#fehler' }]);
    });
    fixed.forEach(([day, t]) => { day.tasks.push(t); day.used += t.min; });
    for (const day of days) {
      const got = {};
      for (; ;) {
        const act = subs.filter(s => queue[s.id].length && parseD(st.exams[s.id]) > day.d);
        if (!act.length) break;
        const press = s => { const E0 = parseD(st.exams[s.id]); const left = days.filter(x => x.d >= day.d && x.d < E0).length || 1; return queue[s.id].reduce((a, t) => a + t.min, 0) / left; };
        const sc = s => press(s) / (1 + (got[s.id] || 0) / Math.max(15, cfg.min / act.length));
        act.sort((x, y) => sc(y) - sc(x));
        const s = act[0], t = queue[s.id][0];
        if (day.used > 0 && day.used + t.min > cfg.min) { const alt = act.find(x => day.used + queue[x.id][0].min <= cfg.min); if (!alt) break; const t2 = queue[alt.id].shift(); day.tasks.push(t2); day.used += t2.min; got[alt.id] = (got[alt.id] || 0) + t2.min; continue; }
        queue[s.id].shift(); day.tasks.push(t); day.used += t.min; got[s.id] = (got[s.id] || 0) + t.min;
        if (day.used >= cfg.min) break;
      }
    }
    const warn = subs.filter(s => queue[s.id].length).map(s => { const rest = queue[s.id].reduce((a, t) => a + t.min, 0); return { s, rest }; });
    return { days, warn, subs };
  }
  function taskRow(t, showDate) {
    const s = BYID[t.id], dn = !!st.pdone[t.key];
    const ic = { lesen: 'book', quiz: 'quiz', wdh: 'redo', sim: 'clock' }[t.type];
    return `<div class="task${dn ? ' done' : ''}"><input type="checkbox" data-act="pdone" data-k="${E(t.key)}"${dn ? ' checked' : ''} aria-label="Erledigt: ${E(t.label)}"><span class="dot" style="background:${s.ink}"></span>${svg(ic, s.ink, 18)}<a href="${t.href}"${t.type === 'sim' ? ` data-act="psel" data-id="${t.id}"` : ''}><small class="tsub" style="color:${s.ink}">${E(s.name)}</small>${E(t.label)}${t.focus ? ' ★' : ''}</a><span class="min">${t.min} Min.</span></div>`;
  }
  function remainingKeys() {
    const set = new Set();
    SUBJ.forEach(s => { if (st.exams[s.id]) { planTasks(s.id).forEach(t => set.add(t.key));['sim', 'wdh'].forEach(x => { const k = `${s.id}:${x}:${st.exams[s.id]}`; if (!st.pdone[k]) set.add(k); }); } });
    return set;
  }
  let homeDay = null;
  function todayCard() {
    if (!Object.keys(st.exams).length) return `<section class="card plancard" aria-labelledby="lp"><div style="display:flex;flex-wrap:wrap;align-items:center;gap:16px"><span style="width:56px;height:56px;border-radius:18px;background:#E9E3FA;display:flex;align-items:center;justify-content:center;flex:none">${svg('cal', '#4B3A8C', 28)}</span><div style="flex:1 1 260px"><h2 class="h2" id="lp" style="font-size:24px">Dein Lernplan</h2><p class="muted" style="margin:4px 0 0">Trag deine Prüfungstermine ein. Dann steht hier jeden Tag, was dran ist, und eine Wochenübersicht.</p></div><a class="btn" href="#lernplan">Termine eintragen${svg('arrow', '#FFFFFF', 18)}</a></div></section>`;
    const p = buildPlan(); const t0 = today0(), tk = today();
    const sig = JSON.stringify([st.exams, st.plan]);
    if (!st.tp || st.tp.d !== tk || st.tp.sig !== sig) { const day = p.days.find(x => x.d.getTime() === t0.getTime()); st.tp = { d: tk, sig, tasks: day ? day.tasks.map(t => ({ key: t.key, id: t.id, type: t.type, min: t.min, label: t.label, href: t.href, focus: t.focus })) : [] }; save(); }
    const rem = remainingKeys();
    const isDone = t => !!st.pdone[t.key] || !rem.has(t.key);
    const tot = st.tp.tasks.reduce((a, t) => a + t.min, 0), dn = st.tp.tasks.filter(isDone).reduce((a, t) => a + t.min, 0);
    const pc = tot ? Math.round(100 * dn / tot) : 0;
    const chips = SUBJ.filter(s => daysTo(s.id) != null && daysTo(s.id) >= 0).sort((a, b) => daysTo(a.id) - daysTo(b.id)).map(s => `<a class="tag" href="#f-${s.id}-lern-${st.lastBy[s.id] || 0}" style="background:${s.bg};color:${s.ink};text-decoration:none">${svg('cal', s.ink, 14)} ${E(s.name)} · ${daysTo(s.id) === 0 ? 'heute' : daysTo(s.id) === 1 ? 'morgen' : 'in ' + daysTo(s.id) + ' T.'}</a>`).join('');
    const row = t => {
      const s = BYID[t.id], d = isDone(t); const ic = { lesen: 'book', quiz: 'quiz', wdh: 'redo', sim: 'clock' }[t.type];
      return `<div class="task${d ? ' done' : ''}"><input type="checkbox" data-act="pdone" data-k="${E(t.key)}"${d ? ' checked' : ''}${d && !st.pdone[t.key] ? ' disabled title="Automatisch erledigt"' : ''} aria-label="Erledigt: ${E(t.label)}"><span class="dot" style="background:${s.ink}"></span>${svg(ic, s.ink, 18)}<a href="${t.href}"${t.type === 'sim' ? ` data-act="psel" data-id="${t.id}"` : ''}><small class="tsub" style="color:${s.ink}">${E(s.name)}</small>${E(t.label)}${t.focus ? ' ★' : ''}</a><span class="min">${t.min} Min.</span></div>`;
    };
    const todayHtml = st.tp.tasks.length ? `<div style="display:flex;flex-direction:column;gap:8px">${st.tp.tasks.map(row).join('')}</div>` : `<p class="muted" style="margin:0">Heute ist kein Lerntag laut Plan – oder alles ist schon erledigt.</p>`;
    const week = p.days.filter(x => x.d >= t0).slice(0, 7);
    const sel = homeDay && week.find(x => dkey(x.d) === homeDay) && homeDay !== tk ? homeDay : null;
    const strip = week.map(x => {
      const k = dkey(x.d), isT = k === tk; const subs = [...new Set(x.tasks.map(t => t.id))];
      return `<button type="button" class="wday${isT ? ' today' : ''}${k === sel ? ' on' : ''}" data-act="hday" data-k="${k}" aria-pressed="${k === sel}"><span class="wdn">${isT ? 'Heute' : WD[x.d.getDay()]}</span><span class="wdd">${x.d.getDate()}.${x.d.getMonth() + 1}.</span><span class="wdm">${isT ? tot : x.used} Min.</span><span class="wdots">${subs.map(id => `<i style="background:${BYID[id].ink}"></i>`).join('')}</span></button>`;
    }).join('');
    const selDay = sel ? week.find(x => dkey(x.d) === sel) : null;
    return `<section class="card plancard" aria-labelledby="lp">
  <div style="display:flex;flex-wrap:wrap;justify-content:space-between;align-items:center;gap:10px"><h2 class="h2" id="lp" style="font-size:26px">Dein Lernplan</h2><a href="#lernplan" style="font-weight:800">Plan & Termine bearbeiten →</a></div>
  <div style="display:flex;flex-wrap:wrap;gap:8px">${chips}</div>
  <div class="todayhead"><div><span class="lbl muted">Heute</span><div style="font-size:22px;font-weight:800">${dn} von ${tot} Min. erledigt</div></div><div class="prog" style="flex:1 1 200px;min-width:160px"><i style="width:${pc}%;background:#1F6B4D"></i></div><b style="font-size:20px">${pc} %</b></div>
  ${todayHtml}
  ${week.length ? `<div><div class="lbl muted" style="margin:6px 0 8px">Die nächsten Lerntage · antippen für Details</div><div class="wstrip">${strip}</div></div>` : ''}
  ${selDay ? `<div class="wdetail"><b>${fmtDay(selDay.d)} · ${selDay.used} Min.</b>${selDay.tasks.map(t => taskRow(t)).join('') || '<span class="muted">Nichts geplant.</span>'}</div>` : ''}
  </section>`;
  }
  let planAll = false;
  const MON = ['Jänner', 'Februar', 'März', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'];
  function dateSel(id) {
    const v = st.exams[id] ? st.exams[id].split('-').map(Number) : [null, null, null];
    const y0 = new Date().getFullYear();
    const o = (arr, cur, ph) => `<option value="">${ph}</option>` + arr.map(([val, l]) => `<option value="${val}"${val === cur ? ' selected' : ''}>${l}</option>`).join('');
    const days = [...Array(31)].map((_, i) => [i + 1, String(i + 1)]);
    const mons = MON.map((m, i) => [i + 1, m]);
    const yrs = [y0, y0 + 1, y0 + 2].map(y => [y, String(y)]);
    return `<span class="dsel" role="group" aria-label="Prüfungstermin ${E(BYID[id].name)}"><select class="sel" data-act="exd" data-id="${id}" data-p="d" aria-label="Tag">${o(days, v[2], 'Tag')}</select><select class="sel" data-act="exd" data-id="${id}" data-p="m" aria-label="Monat">${o(mons, v[1], 'Monat')}</select><select class="sel" data-act="exd" data-id="${id}" data-p="y" aria-label="Jahr">${o(yrs, v[0], 'Jahr')}</select></span>`;
  }
  function viewPlan() {
    const p = buildPlan();
    const ex = SUBJ.map(s => { const dd = daysTo(s.id); return `<div class="exrow"><span class="num" style="background:${s.bg};color:${s.ink};width:40px;height:40px;border-radius:14px;font-size:15px">${s.n}</span><span style="flex:1 1 220px;font-weight:800">${E(s.name)}${s.examFormat ? `<br><span class="small" style="font-weight:600">${E(s.examFormat)}</span>` : ''}</span>${dateSel(s.id)}${dd != null ? `<span class="tag" style="background:${s.bg};color:${s.ink}">${dd < 0 ? 'vorbei' : dd === 0 ? 'heute' : 'in ' + dd + ' Tagen'}</span><button class="btn lt" type="button" data-act="exclr" data-id="${s.id}" style="min-height:40px;padding:0 14px;font-size:14px">Entfernen</button>` : ''}</div>`; }).join('');
    if (st.plan.min % 30 || st.plan.min < 30 || st.plan.min > 300) { st.plan.min = Math.min(300, Math.max(30, Math.round(st.plan.min / 30) * 30)); save(); }
    const mins = [...Array(10)].map((_, i) => (i + 1) * 30).map(m => `<option value="${m}"${st.plan.min === m ? ' selected' : ''}>${m < 60 ? '30 Minuten' : (m / 60).toString().replace('.', ',') + (m === 60 ? ' Stunde' : ' Stunden')}</option>`).join('');
    const wd = [1, 2, 3, 4, 5, 6, 0].map(i => `<label><input type="checkbox" data-act="wd" data-d="${i}"${st.plan.wd.includes(i) ? ' checked' : ''}>${WD[i]}</label>`).join('');
    const days = (planAll ? p.days : p.days.slice(0, 14)).filter(x => x.tasks.length);
    const total = p.days.reduce((a, x) => a + x.used, 0);
    const warn = p.warn.map(({ s, rest }) => { const E0 = parseD(st.exams[s.id]); const n = p.days.filter(x => x.d < E0).length || 1; return `<div class="hint" style="background:#FDE2E4"><span><b>${E(s.name)}:</b> Bis zur Prüfung passen etwa ${rest} Minuten Stoff nicht in den Plan. Erhöhe die Lernzeit auf ungefähr ${Math.ceil((st.plan.min + rest / n) / 15) * 15} Minuten pro Tag oder wähle mehr Lerntage.</span></div>`; }).join('');
    shell('lernplan', null, `<section class="card" style="display:flex;flex-direction:column;gap:6px"><span class="lbl" style="color:#4B3A8C">Lernplan</span><h1 class="h2">Prüfungstermine & Lernzeit</h1><p class="muted" style="margin:0 0 6px">Trag ein, wann welche Prüfung ist. Der Plan verteilt Lesen und Quiz je Kapitel bis dahin, stellt Schwerpunkt-Kapitel (★) früher und etwas länger ein und plant vor jeder Prüfung Wiederholung und eine Prüfungssimulation. Er passt sich jeden Tag an deinen Fortschritt an.</p>${ex}
  <div style="display:flex;flex-wrap:wrap;gap:16px 28px;margin-top:12px;align-items:flex-end"><div><label class="lbl muted" for="pmin">Lernzeit pro Lerntag</label><br><select class="sel" id="pmin" data-act="pmin" style="max-width:200px">${mins}</select></div><div><div class="lbl muted">Lerntage</div><div class="wd">${wd}</div></div></div></section>
  ${warn}
  ${p.subs.length ? `<section class="card"><div style="display:flex;flex-wrap:wrap;justify-content:space-between;align-items:baseline;gap:8px"><h2 class="h2" style="font-size:24px">Dein Plan</h2><span class="small">${p.days.filter(x => x.tasks.length).length} Lerntage · ca. ${Math.round(total / 60)} Stunden</span></div>${days.map(x => `<div class="plan-day"><h3><span>${fmtDay(x.d)}</span><span class="small">${x.used} Min.</span></h3>${x.tasks.map(t => taskRow(t)).join('')}</div>`).join('') || '<p class="muted">Alles erledigt – stark!</p>'}${!planAll && p.days.filter(x => x.tasks.length).length > days.length ? `<button class="btn lt" type="button" data-act="planall" style="margin-top:10px">Ganzen Plan anzeigen</button>` : ''}</section>` : `<p class="muted" style="text-align:center">Sobald du einen Termin einträgst, erscheint hier dein Plan.</p>`}
  <p class="small" style="text-align:center">Termine und Plan werden nur in diesem Browser auf diesem Gerät gespeichert.</p>`);
  }
  function answerText(q) {
    if (q.y === 'tf') return q.tf ? 'Wahr' : 'Falsch';
    if (q.y === 'cat') return q.cats.map((c, ci) => `<b>${E(c)}:</b> ${q.items.filter(it => it[1] === ci).map(it => E(it[0])).join(', ')}`).join(' · ');
    if (q.y === 'ord') return q.items.map(x => E(x[1]) + ' ' + E(x[0])).join(' → ');
    return q.o.length ? q.o.filter(o => o[1]).map(o => E(o[0])).join(' · ') : (q.a || '');
  }
  function rounds(k, lim) { return st.hist.filter(h => h.k === k).slice(-lim); }
  function miniBars(list) {
    if (!list.length) return '<p class="small" style="margin:0">Noch keine Runde gespielt.</p>';
    const w = 28;
    return `<svg role="img" aria-label="Quote der letzten ${list.length} Runden" width="100%" height="96" viewBox="0 0 340 96" preserveAspectRatio="xMinYMax meet" style="max-width:420px">${list.map((h, i) => { const p = h.n ? Math.round(100 * h.ok / h.n) : 0; const ht = Math.max(3, Math.round(p * 0.72)); return `<g><title>${new Date(h.t).toLocaleDateString('de-AT')}: ${h.ok}/${h.n} richtig (${p} %), ${h.pts} Punkte</title><rect x="${i * (w + 6)}" y="${80 - ht}" width="${w}" height="${ht}" rx="5" fill="${p >= 70 ? '#1F6B4D' : p >= 50 ? '#C9A227' : '#9B2C3A'}"></rect><text x="${i * (w + 6) + w / 2}" y="94" font-size="10" text-anchor="middle" fill="#5A5470">${p}</text></g>`; }).join('')}</svg>`;
  }
  function chapterStats(id) {
    const d = data(id), ok = st.ok[id] || {}, seen = st.seen[id] || {};
    return d.secs.map((c, k) => { const qi = d.qs.map((q, i) => inSec(d, q, k) && !q.hide ? i : -1).filter(i => i >= 0); const n = qi.length; const o = qi.filter(i => ok[i]).length; const s = qi.filter(i => seen[i]).length; return { k, t: c.t, n, o, s, p: n ? Math.round(100 * o / n) : 0 }; }).filter(x => x.n);
  }
  function progressCard(id) {
    const s = BYID[id], o = okCount(id), se = seenCount(id), n = s.nq, r = rounds(id, 10);
    const weak = chapterStats(id).filter(x => x.s >= 3).sort((a, b) => a.p - b.p).slice(0, 5);
    return `<section class="qcard"><h2 class="h2" style="font-size:24px">Dein Fortschritt in ${E(s.name)}</h2>
  <div class="stats"><div style="background:${s.bg};color:${s.ink}"><span class="lbl">Richtig beantwortet</span><b>${o} / ${n}</b><div class="prog" style="margin-top:6px;background:#fff"><i style="width:${pct(id)}%;background:${s.ink}"></i></div></div><div style="background:var(--bg)"><span class="lbl muted">Schon gesehen</span><b>${se} / ${n}</b></div><div style="background:#E9E3FA;color:#4B3A8C"><span class="lbl">Punkte im Fach</span><b>${st.ptsBy[id] || 0}</b></div><div style="background:#FBF1D5;color:#6E5310"><span class="lbl">Bestwert</span><b>${st.best[id] != null ? st.best[id] + ' %' : '–'}</b></div></div>
  <div><div class="lbl muted" style="margin-bottom:6px">Letzte Runden · % richtig</div>${miniBars(r)}</div>
  ${weak.length ? `<div><div class="lbl muted" style="margin-bottom:8px">Kapitel mit Übungsbedarf</div>${weak.map(x => `<div class="pg"><a class="pgn" href="#f-${id}-lern-${x.k}">${x.k + 1}. ${E(x.t)}</a><div class="prog" style="flex:1"><i style="width:${x.p}%;background:${s.ink}"></i></div><b>${x.o}/${x.n}</b><a class="tag" style="background:var(--bg);color:var(--ink);text-decoration:none" href="#f-${id}-quiz-${x.k}">Üben</a></div>`).join('')}</div>` : ''}</section>`;
  }
  function viewFortschritt() {
    const tot = SUBJ.reduce((a, s) => a + s.nq, 0), ok = SUBJ.reduce((a, s) => a + okCount(s.id), 0), se = SUBJ.reduce((a, s) => a + seenCount(s.id), 0);
    const days = []; for (let i = 13; i >= 0; i--) { const d = new Date(); d.setDate(d.getDate() - i); const k = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); days.push([d, st.daily[k] || 0]); }
    const mx = Math.max(10, ...days.map(x => x[1]));
    const chart = `<svg role="img" aria-label="Beantwortete Fragen der letzten 14 Tage" width="100%" height="150" viewBox="0 0 ${14 * 44} 150">${days.map(([d, v], i) => { const h = Math.round(110 * v / mx); return `<g><title>${d.toLocaleDateString('de-AT')}: ${v} Fragen</title><rect x="${i * 44 + 6}" y="${120 - h}" width="32" height="${Math.max(h, 2)}" rx="6" fill="${v ? '#6B5FA8' : '#E9E3FA'}"></rect>${v ? `<text x="${i * 44 + 22}" y="${114 - h}" font-size="11" text-anchor="middle" fill="#2A2440" font-weight="700">${v}</text>` : ''}<text x="${i * 44 + 22}" y="140" font-size="11" text-anchor="middle" fill="#5A5470">${d.getDate()}.${d.getMonth() + 1}.</text></g>`; }).join('')}</svg>`;
    const rows = SUBJ.map(s => `<div class="row"><span class="num" style="background:${s.bg};color:${s.ink}">${s.n}</span><a class="rowt" href="#f-${s.id}-quiz"><b>${E(s.name)}</b><span>${okCount(s.id)} von ${s.nq} richtig · ${seenCount(s.id)} gesehen · ${fmtN(st.ptsBy[s.id] || 0)} Punkte · Bestwert ${st.best[s.id] != null ? st.best[s.id] + ' %' : '–'}</span></a><div style="flex:1 1 200px;display:flex;align-items:center;gap:10px"><div class="prog" style="flex:1"><i style="width:${pct(s.id)}%;background:${s.ink}"></i></div><b style="min-width:44px;text-align:right">${pct(s.id)} %</b></div></div>`).join('');
    const hist = st.hist.slice(-15).reverse().map(h => { const p = h.n ? Math.round(100 * h.ok / h.n) : 0; return `<div class="pg"><span class="pgn">${new Date(h.t).toLocaleDateString('de-AT')} · ${E(h.title)}${h.exam ? ' · Prüfung' : ''}</span><b>${h.ok}/${h.n} (${p} %)</b><span class="tag" style="background:#E9E3FA;color:#4B3A8C">${fmtN(h.pts)}${h.max ? ` / ${h.max} P · ${Math.round(100 * h.pts / h.max)} %` : ' P'}</span></div>`; }).join('');
    shell('fortschritt', null, `<section class="bento" aria-label="Überblick">
  <div class="b-sm" style="background:#2A2440;color:#fff"><span class="lbl" style="color:#C9BFF5">Punkte gesamt</span><span class="b-num">${fmtN(st.pts || 0)}</span></div>
  <div class="b-sm" style="background:#DDF3EA;color:#1F6B4D"><span class="lbl">Richtig beantwortet</span><span class="b-num">${tot ? Math.round(100 * ok / tot) : 0} %</span><span style="font-weight:700">${ok} von ${tot} Fragen</span></div>
  <div class="b-sm" style="background:#E0EEFB;color:#22548C"><span class="lbl">Schon gesehen</span><span class="b-num">${tot ? Math.round(100 * se / tot) : 0} %</span><span style="font-weight:700">${se} Fragen</span></div>
  <div class="b-sm" style="background:#FDE6DA;color:#8C3F1E"><span class="lbl">Quizrunden · Serie</span><span class="b-num">${st.hist.length}</span><span style="font-weight:700">${streak()} ${streak() === 1 ? 'Tag' : 'Tage'} in Folge</span></div></section>
  <section class="card"><h2 class="h2" style="font-size:24px;margin-bottom:10px">Beantwortete Fragen · letzte 14 Tage</h2>${chart}</section>
  <section class="card"><h2 class="h2" style="font-size:24px;margin-bottom:6px">Fortschritt je Fach</h2><p class="small" style="margin:0 0 6px">Fortschritt = Anteil der Fragen, die du mindestens einmal richtig beantwortet hast.</p>${rows}</section>
  <section class="card"><h2 class="h2" style="font-size:24px;margin-bottom:10px">Letzte Quizrunden</h2>${hist || '<p class="muted" style="margin:0">Noch keine Runde gespielt.</p>'}</section>
  <p class="small" style="text-align:center">Punkte und Fortschritt werden nur in diesem Browser auf diesem Gerät gespeichert.</p>`);
  }


  /* ---------- karten ---------- */
  let KC = null;
  function viewKarten(id, k) {
    const d = data(id), now = Date.now();
    const pool = poolFor(id, k).filter(i => !isDnd(d.qs[i]));
    const due = pool.filter(i => st.srs[id + ':' + i] && st.srs[id + ':' + i].due <= now);
    const fresh = shuffle(pool.filter(i => !st.srs[id + ':' + i]));
    const later = pool.filter(i => st.srs[id + ':' + i] && st.srs[id + ':' + i].due > now).sort((a, b) => st.srs[id + ':' + a].due - st.srs[id + ':' + b].due);
    KC = { id, k, deck: spaceVariants(variantFirst([...shuffle(due), ...fresh, ...later].map(i => [id, i])).slice(0, 40)).map(p => p[1]), i: 0, flip: false, known: 0 };
    renderKarte();
  }
  function renderKarte() {
    const { id, k } = KC, s = BYID[id], d = data(id);
    if (!KC.deck.length) { shell('start', id, band(id, 'karten', k) + `<div class="qwrap"><section class="qcard"><h1>Keine Karten in diesem Kapitel.</h1></section></div>`); return; }
    if (KC.i >= KC.deck.length) { shell('start', id, band(id, 'karten', k) + `<div class="qwrap"><section class="qcard"><span class="lbl muted">Stapel fertig</span><h1>${KC.known} von ${KC.deck.length} Karten gewusst.</h1><p class="muted" style="margin:0">Karten, die du mit „Nochmal“ oder „Schwer“ bewertet hast, kommen bald wieder.</p><div style="display:flex;gap:10px;flex-wrap:wrap"><button class="btn" type="button" data-act="kagain">Nächster Stapel</button><a class="btn lt" href="#f-${id}-lern-${k >= 0 ? k : (st.lastBy[id] || 0)}">Zum Lernteil</a></div></section></div>`); return; }
    const qi = KC.deck[KC.i], q = d.qs[qi], r = st.srs[id + ':' + qi];
    const pc = Math.round(100 * KC.i / KC.deck.length);
    const right = q.o.filter(o => o[1]).map(o => E(o[0]));
    const imgsrc = q.i ? img(q.i) : null;
    const iv = r ? r.iv : 0;
    const nextIv = [['Nochmal', '#9B2C3A', 'in 1 Min.', 0], ['Schwer', '#8C3F1E', 'in 10 Min.', 1], ['Gut', '#1F6B4D', iv ? `in ${Math.max(1, Math.round(iv * 2.5))} Tagen` : 'in 1 Tag', 2], ['Leicht', '#4B3A8C', iv ? `in ${Math.max(4, Math.round(iv * 4))} Tagen` : 'in 4 Tagen', 3]];
    const front = `<div class="lbl" style="color:${s.ink}">${E(q.t || '')}</div><div class="front">${E(q.q)}</div>${origHtml(q, 1)}${imgsrc ? `<img class="qimg" alt="Abbildung" src="${imgsrc}">` : ''}<span class="small" style="text-align:center">${KC.flip ? '' : 'Antippen zum Umdrehen'}</span>`;
    const back = `<div class="lbl">Antwort</div>${q.y === 'tf' ? `<div style="font-size:26px;font-weight:800">${q.tf ? 'Wahr' : 'Falsch'}</div>` : q.o.length ? `<div style="font-size:22px;font-weight:800;line-height:1.35">${right.join('<br>')}</div>` : `<div style="font-size:17px;line-height:1.55" class="lzans">${q.a || ''}</div>`}${q.e ? `<p style="margin:0;font-size:16px;line-height:1.55">${E(q.e)}</p>` : ''}${srcHtml(q, 1)}${q.sec >= 0 && d.secs[q.sec] ? `<a href="#f-${id}-lern-${q.sec}" style="font-weight:800;color:#fff">Im Lernteil nachlesen →</a>` : ''}`;
    shell('start', id, band(id, 'karten', k) + `<div class="qwrap">
  <div style="display:flex;justify-content:space-between;font-size:14px;font-weight:700;color:var(--mu)"><span>Karte ${KC.i + 1} / ${KC.deck.length} · ${KC.known} gewusst</span><span>${pc} %</span></div><div class="prog"><i style="width:${pc}%;background:${s.ink}"></i></div>
  <div style="display:flex;flex-wrap:wrap;gap:14px">
   <button type="button" class="fc" data-act="kflip" style="flex:1 1 320px;background:#fff" aria-expanded="${KC.flip}">${front}</button>
   ${KC.flip ? `<div class="fc" style="flex:1 1 320px;background:${s.ink};color:#fff;cursor:default">${back}</div>` : ''}
  </div>
  ${KC.flip ? `<div class="rate">${nextIv.map(([l, c, t, v]) => `<button type="button" data-act="krate" data-v="${v}" style="border-color:${c}"><span style="color:${c}">${l}</span><small>${t}</small></button>`).join('')}</div>` : `<button class="btn" type="button" data-act="kflip" style="align-self:center">Antwort zeigen</button>`}
  <p class="small" style="text-align:center;margin:0">Karten, die du falsch hattest, kommen öfter. Gekonnte Karten seltener.</p></div>`);
  }
  function rateKarte(v) {
    const { id } = KC, qi = KC.deck[KC.i], key = id + ':' + qi, r = st.srs[key] || { iv: 0, due: 0 };
    const MIN = 60000, DAY = 86400000;
    if (v === 0) { r.iv = 0; r.due = Date.now() + MIN; }
    else if (v === 1) { r.iv = Math.max(0, r.iv * 0.5); r.due = Date.now() + 10 * MIN; }
    else if (v === 2) { r.iv = r.iv ? Math.max(1, r.iv * 2.5) : 1; r.due = Date.now() + r.iv * DAY; KC.known++; }
    else { r.iv = r.iv ? Math.max(4, r.iv * 4) : 4; r.due = Date.now() + r.iv * DAY; KC.known++; }
    st.srs[key] = r; touchDay(); save();
    if (v === 0 && KC.deck.length - KC.i < 60) KC.deck.push(qi);
    KC.i++; KC.flip = false; renderKarte();
  }

  /* ---------- zuordnen ---------- */
  let ZO = null;
  function viewZuordnen(id, k) {
    const d = data(id);
    const seen = new Set();
    const pool = shuffle(poolFor(id, k).filter(i => { const q = d.qs[i]; if (q.m) return false; const r = q.o.filter(o => o[1]); if (r.length !== 1) return false; const a = r[0][0].trim(); if (a.length > 70 || q.q.length > 200 || seen.has(a.toLowerCase())) return false; if (/^(alle|keine|beide)\b|richtig|falsch/i.test(a)) return false; seen.add(a.toLowerCase()); return true; }));
    ZO = { id, k, pool, round: 0, rounds: Math.min(4, Math.floor(pool.length / 5)), pairs: [], sel: null, done: new Set(), bad: null, score: 0, miss: 0 };
    newRound();
  }
  function newRound() {
    const d = data(ZO.id);
    ZO.pairs = ZO.pool.slice(ZO.round * 5, ZO.round * 5 + 5).map(i => ({ qi: i, a: d.qs[i].o.find(o => o[1])[0] }));
    ZO.left = shuffle(ZO.pairs.map((p, j) => j)); ZO.right = shuffle(ZO.pairs.map((p, j) => j));
    ZO.sel = null; ZO.done = new Set(); ZO.bad = null; ZO.msg = '';
    renderZO();
  }
  function renderZO() {
    const { id, k } = ZO, s = BYID[id], d = data(id);
    if (ZO.rounds < 1) { shell('start', id, band(id, 'zuordnen', k) + `<div class="qwrap"><section class="qcard"><h1>Zu wenige passende Fragen für dieses Kapitel.</h1><p class="muted" style="margin:0">Zuordnen braucht mindestens 5 Fragen mit kurzer, eindeutiger Antwort. Probier „Alle Kapitel“.</p><a class="btn" style="align-self:flex-start" href="#f-${id}-zuordnen">Alle Kapitel</a></section></div>`); return; }
    if (ZO.round >= ZO.rounds) { shell('start', id, band(id, 'zuordnen', k) + `<div class="qwrap"><section class="qcard"><span class="lbl muted">Fertig</span><h1>${ZO.score} Paare richtig, ${ZO.miss} Fehlversuche.</h1><div style="display:flex;gap:10px;flex-wrap:wrap"><button class="btn" type="button" data-act="zagain">Neue Runden</button><a class="btn lt" href="#f-${id}-lern-${k >= 0 ? k : (st.lastBy[id] || 0)}">Zum Lernteil</a></div></section></div>`); return; }
    const pc = Math.round(100 * ZO.round / ZO.rounds);
    const L = ZO.left.map(j => { const p = ZO.pairs[j], dn = ZO.done.has(j); return `<button type="button" class="zb${dn ? ' done' : ZO.sel === j ? ' sel' : ''}" data-act="zl" data-j="${j}"${dn ? ' disabled' : ''}><span style="flex:1">${E(p.a)}</span>${dn ? svg('check', '#1F6B4D', 18) : ''}</button>`; }).join('');
    const R = ZO.right.map((j, pos) => { const p = ZO.pairs[j], dn = ZO.done.has(j); return `<button type="button" class="zb${dn ? ' done' : ZO.bad === j ? ' bad' : ''}" data-act="zr" data-j="${j}"${dn ? ' disabled' : ''}><span class="k">${LET[pos]}</span><span style="flex:1;font-weight:600">${E(d.qs[p.qi].q)}</span></button>`; }).join('');
    shell('start', id, band(id, 'zuordnen', k) + `<div class="qwrap">
  <div style="display:flex;justify-content:space-between;font-size:14px;font-weight:700;color:var(--mu)"><span>Runde ${ZO.round + 1} / ${ZO.rounds} · ${ZO.score} Paare</span><span>${pc} %</span></div><div class="prog"><i style="width:${pc}%;background:${s.ink}"></i></div>
  <section class="qcard"><h1>Ordne jeder Antwort die passende Frage zu</h1><p class="muted" style="margin:0">Erst links eine Antwort wählen, dann rechts die passende Frage.</p>
  <div class="zo"><div class="l">${L}</div><div class="r">${R}</div></div>
  ${ZO.msg ? `<div class="hint" style="background:${ZO.msgok ? '#DDF3EA' : '#FDE2E4'}" role="status">${ZO.msg}</div>` : ''}
  ${ZO.done.size === ZO.pairs.length ? `<div style="display:flex;justify-content:flex-end"><button class="btn" type="button" data-act="znext">${ZO.round === ZO.rounds - 1 ? 'Ergebnis' : 'Nächste Runde'}${svg('arrow', '#FFFFFF', 18)}</button></div>` : ''}</section></div>`);
  }

  /* ---------- fehlerkartei / prüfung / suche ---------- */
  function viewFehler() {
    const wl = wrongList();
    const by = {}; wl.forEach(([id]) => by[id] = (by[id] || 0) + 1);
    const rows = SUBJ.filter(s => by[s.id]).map(s => `<div class="row"><span class="num" style="background:${s.bg};color:${s.ink}">${s.n}</span><span class="rowt"><b>${E(s.name)}</b><span>${by[s.id]} falsch beantwortete Fragen</span></span><button class="btn lt" type="button" data-act="fstart" data-id="${s.id}">Wiederholen</button></div>`).join('');
    shell('fehler', null, `<section class="card"><span class="lbl" style="color:#9B2C3A">Fehlerkartei</span><h1 class="h2" style="margin:4px 0 8px">${wl.length} Fragen zum Wiederholen</h1><p class="muted" style="margin:0 0 14px">Jede falsch beantwortete Frage landet hier. Beantwortest du sie richtig, verschwindet sie wieder.</p>${wl.length ? `<button class="btn" type="button" data-act="fstart" data-id="">Alle wiederholen</button>` : ''}</section>${rows ? `<section class="card">${rows}</section>` : ''}`);
  }
  function viewPruefung() {
    const opts = `<option value="">Alle Fächer gemischt</option>` + SUBJ.map(s => `<option value="${s.id}">${E(s.name)} (${s.nq})</option>`).join('');
    shell('pruefung', null, `<section class="card" style="display:flex;flex-direction:column;gap:12px"><span class="lbl" style="color:#4B3A8C">Prüfungsmodus</span><h1 class="h2">Wie in der Klausur</h1><p class="muted" style="margin:0">Zufällige Fragen, keine Joker. Du kannst jederzeit zurückspringen und Antworten ändern. Vor dem Abgeben siehst du alle Fragen in einer Gesamtansicht. Bewertet wird nach dem Abgeben, bei Mehrfachauswahl mit Teilpunkten. Die Zeit läuft mit.</p>
  <div id="qsetup" style="display:flex;flex-direction:column;gap:12px"><label class="lbl muted" for="pf">Fach</label><select class="sel" id="pf">${opts}</select>
  <div id="qowrap"><div class="lbl muted">Herkunft <span class="small" style="text-transform:none;letter-spacing:0">· mehrere wählbar</span></div><div class="seg multi" id="qo"></div></div>
  <div class="lbl muted">Fragetyp</div><div class="seg" id="qt"></div>
  <label class="lbl muted" for="qn">Anzahl Fragen</label><select class="sel" id="qn" style="max-width:260px"></select></div>
  <button class="btn" type="button" id="qgo" data-act="pstart" style="align-self:flex-start;margin-top:6px">Prüfung starten${svg('arrow', '#FFFFFF', 18)}</button></section>`);
    if (st.pfPre && BYID[st.pfPre]) { document.getElementById('pf').value = st.pfPre; delete st.pfPre; save(); }
    updSetup();
  }
  function strip(h) { const t = document.createElement('div'); t.innerHTML = h; return t.textContent.replace(/\s+/g, ' '); }
  const TXT = {};
  function viewSuche() {
    const q = searchQ.trim(); const ql = q.toLowerCase();
    let hits = [];
    if (q.length >= 2) {
      for (const s of SUBJ) {
        const d = data(s.id);
        d.secs.forEach((c, i) => {
          const key = s.id + i; if (!TXT[key]) TXT[key] = strip(c.html); const t = TXT[key]; const p = t.toLowerCase().indexOf(ql); const inT = c.t.toLowerCase().includes(ql);
          if (inT || p >= 0) hits.push({ w: inT ? 3 : 2, html: `<a class="hit" href="#f-${s.id}-lern-${i}"><span class="lbl" style="color:${s.ink}">${E(s.name)} · Lernteil Kapitel ${i + 1}</span><br><b style="font-size:18px">${mark(c.t, q)}</b>${p >= 0 ? `<br><span class="small" style="font-size:14px">… ${mark(t.slice(Math.max(0, p - 70), p + 110), q)} …</span>` : ''}</a>` });
        });
        d.qs.forEach((x, i) => { if (!x.hide && x.q.toLowerCase().includes(ql)) hits.push({ w: 1, html: `<a class="hit" href="#f-${s.id}-lern-${x.sec >= 0 ? x.sec : 0}"><span class="lbl" style="color:${s.ink}">${E(s.name)} · Quizfrage</span><br><b>${mark(x.q, q)}</b><br><span class="small" style="font-size:14px">Antwort: ${x.y ? strip(answerText(x)).slice(0, 160) : x.o.length ? E(x.o.filter(o => o[1]).map(o => o[0]).join(' · ')) : E(strip(x.a || '').slice(0, 160))}</span></a>` }); });
      }
    }
    hits.sort((a, b) => b.w - a.w);
    const shown = hits.slice(0, 60);
    shell('start', null, `<section class="card"><span class="lbl muted">Suche</span><h1 class="h2" style="margin:4px 0 0">${q.length < 2 ? 'Gib mindestens 2 Buchstaben ein.' : `${hits.length} Treffer für „${E(q)}“`}</h1>${hits.length > 60 ? '<p class="small" style="margin:6px 0 0">Die ersten 60 werden angezeigt.</p>' : ''}</section><div style="display:flex;flex-direction:column;gap:10px">${shown.map(h => h.html).join('')}</div>`);
  }
  function mark(text, q) { const t = String(text); const i = t.toLowerCase().indexOf(q.toLowerCase()); if (i < 0) return E(t); return E(t.slice(0, i)) + '<mark>' + E(t.slice(i, i + q.length)) + '</mark>' + E(t.slice(i + q.length)); }

  /* ---------- router ---------- */

  /* ---------- Spiel im Portal ---------- */
  function sizeGame() {
    const f = document.getElementById('gameframe'); if (!f) return; const box = f.parentElement;
    if (matchMedia('(orientation:landscape) and (max-height:520px)').matches || matchMedia('(orientation:portrait) and (max-width:700px)').matches) { f.style.height = ''; f.style.maxHeight = ''; box.style.maxWidth = ''; return; }
    box.style.maxWidth = ''; const w = box.clientWidth - 6; const top = box.getBoundingClientRect().top + window.scrollY; const avail = window.innerHeight - Math.min(top, window.innerHeight * 0.45) - 20;
    const h = Math.max(300, Math.min(w * 390 / 844, avail)); f.style.maxHeight = 'none'; f.style.aspectRatio = 'auto'; f.style.height = Math.round(h) + 'px'; if (h < w * 390 / 844 - 2) box.style.maxWidth = Math.round(h * 844 / 390 + 6) + 'px';
  }
  window.addEventListener('resize', () => { if (location.hash === '#spiel') sizeGame(); });
  function viewSpiel() {
    const inner = `<section class="card spielhead"><a class="back" href="#start">${svg('arrow', '#2A2440', 16).replace('<svg', '<svg style="transform:rotate(180deg)"')}Startseite</a><div class="sp-t"><h1 class="h2" style="margin:0">An Apple a Day</h1><span class="small">Querformat · ← → laufen · ↑ ↓ Bahn/Stockwerk · Leertaste springen (2× Doppelsprung) · Visite 1–4 · M Musik · P Pause</span></div><button type="button" class="btn lt" data-act="gamefs">Vollbild</button></section>
  <section class="card rotatehint" aria-live="polite"><svg width="86" height="86" viewBox="0 0 86 86" aria-hidden="true"><rect x="28" y="10" width="30" height="52" rx="7" fill="#fff" stroke="#2B2A33" stroke-width="3.5"/><g transform="rotate(90 43 43)" opacity="0.35"><rect x="28" y="10" width="30" height="52" rx="7" fill="#7FE0B9" stroke="#2B2A33" stroke-width="3"/></g><path d="M66 22 a26 26 0 0 1 6 24" fill="none" stroke="#5FBF3F" stroke-width="4" stroke-linecap="round"/><path d="M66 44 l6 4 l3 -7" fill="none" stroke="#5FBF3F" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/></svg><h2 class="h2" style="margin:0;font-size:24px">Dreh dein Handy quer</h2><p class="small" style="margin:0">Dann füllt Mrs. Granny Smith den ganzen Bildschirm.</p><button type="button" class="btn lt" data-act="gameforce">Trotzdem hochkant spielen</button></section>
  <div class="spielbox"><iframe id="gameframe" title="An Apple a Day – Spiel mit Mrs. Granny Smith" allow="fullscreen; autoplay"></iframe></div>`;
    shell('start', null, inner);
    const f = document.getElementById('gameframe'); f.src = 'game/index.html'; sizeGame(); setTimeout(sizeGame, 60);
    setTimeout(() => { try { f.focus(); } catch (e) { } }, 400);
  }


  /* ---------- Reiter Altklausur ---------- */
  function altSrc(q) { const a = q.S.find(x => x[0] === 'alt'); return a ? a[1] : 'Altklausur'; }
  function altCard(id) {
    const s = BYID[id], d = data(id), ok = st.ok[id] || {}; const by = {}; altIdx(id).forEach(i => { const k = altSrc(d.qs[i]); (by[k] = by[k] || []).push(i); });
    const rows = Object.keys(by).sort((a, b) => by[b].length - by[a].length).map((k, j) => { const L = by[k], done = L.filter(i => ok[i]).length; return `<div class="pg"><span class="pgn">${E(k)}</span><div class="prog" style="width:70px;flex:none"><i style="width:${Math.round(done / L.length * 100)}%;background:${s.ink}"></i></div><b style="white-space:nowrap">${done}/${L.length}</b><button class="tag" type="button" data-act="altone" data-id="${id}" data-k="${E(k)}" style="background:var(--bg);color:var(--ink);border:0;cursor:pointer">Üben</button></div>`; }).join('');
    return `<section class="card"><h2 class="h2" style="font-size:22px;margin-bottom:4px">Altklausur-Quellen</h2><p class="small" style="margin:0">Fortschritt = richtig beantwortete Fragen je Quelle. „Üben“ fragt nur diese Quelle ab.</p>${rows}</section>`;
  }

  /* ---------- Reiter Quellen ---------- */
  let QU = null; function quData() { if (!QU) { try { QU = window.LP_DATA.quellen || {}; } catch (e) { QU = {}; } } return QU; }
  const QKIND = { vl: 'Vorlesungsfrage (Foto)', folien: 'Folien', skript: 'Skript', handout: 'Handout', lz: 'Lernziele', alt: 'Altklausur/Fragensammlung', wdh: 'Wiederholungsfragen', gesetz: 'Gesetz', info: 'Organisatorisches', extra: 'Zusatzmaterial', own: 'Frühere Lernseite' };
  const QST = { zit: 'von einer Frage zitiert', ok: 'inhaltlich abgedeckt', teil: 'teilweise abgedeckt', offen: 'nicht im Portal – bitte prüfen', leer: 'Titel-, Bild- oder Literaturfolie' };
  function qPageWord(e) { return e.kind === 'skript' || e.kind === 'gesetz' || e.kind === 'handout' || /\.docx$/i.test(e.name) ? 'S.' : 'Folie'; }
  function qEntry(e, s) {
    const pw = qPageWord(e);
    const meta = []; meta.push(QKIND[e.kind] || e.kind);
    if (e.nq) meta.push(e.nq + ' Fragen'); if (e.nsec) meta.push(e.nsec + ' Lernteil-Kapitel'); if (e.np) meta.push(e.np + (e.ocr ? ' Seiten (Texterkennung)' : pw === 'S.' ? ' Seiten' : ' Folien'));
    let strip = '', lists = '';
    if (e.pages) {
      const P = e.pages; strip = `<div class="strip" aria-hidden="true">${P.map((p, i) => `<i class="s-${p[0]}" title="${pw} ${i + 1}: ${E(p[2] || '')} · ${QST[p[0]]}${p[1] != null ? ' (' + p[1] + ' %)' : ''}"></i>`).join('')}</div>`;
      const off = P.map((p, i) => [p, i]).filter(x => x[0][0] === 'offen'), tl = P.map((p, i) => [p, i]).filter(x => x[0][0] === 'teil');
      const li = L => `<ul class="qpl">${L.map(([p, i]) => `<li><b>${pw} ${i + 1}</b> ${E(p[2] || '(ohne Überschrift)')}</li>`).join('')}</ul>`;
      if (off.length) lists += `<details${e.role === 'q' && off.length <= 12 ? ' open' : ''}><summary><b style="color:#9B2C3A">${off.length} ${pw === 'S.' ? (off.length === 1 ? 'Seite' : 'Seiten') : (off.length === 1 ? 'Folie' : 'Folien')} nicht im Portal</b> – bitte prüfen</summary>${li(off)}</details>`;
      if (tl.length) lists += `<details><summary>${tl.length} ${pw === 'S.' ? (tl.length === 1 ? 'Seite' : 'Seiten') : (tl.length === 1 ? 'Folie' : 'Folien')} nur teilweise abgedeckt</summary>${li(tl)}</details>`;
      if (e.newp && e.newp.length) lists += `<details><summary>${e.newp.length} ${pw === 'S.' ? 'Seiten' : 'Folien'} mit Inhalt, der in „${E(e.of)}“ fehlt</summary><p class="small" style="margin:6px 0 0">${pw} ${e.newp.join(', ')}</p></details>`;
    }
    const cov = e.cov != null ? `<span class="qcovb" style="color:${e.cov >= 85 ? '#1F6B4D' : e.cov >= 65 ? '#6E5310' : '#9B2C3A'}">${e.cov} % abgedeckt</span>` : '';
    return `<div class="qsitem"><div class="qh"><span class="qn">${E(e.name)}</span>${cov}</div><div class="qd">${e.chat ? 'Chat-Upload' : 'Studium / ' + E(e.dir || '')}</div><div class="qmeta">${meta.map(m => `<span>${E(m)}</span>`).join('')}</div>${e.note ? `<div class="small">${E(e.note)}</div>` : ''}${strip}${lists}</div>`;
  }
  function viewQuellen(id) {
    const s = BYID[id], Q = quData(), r = Q[id] || { entries: [] }, meta = Q._meta || {};
    const E_ = r.entries || []; const used = E_.filter(e => e.role === 'q' && e.kind !== 'info' || e.role === 'alt' || e.role === 'part'), extra = E_.filter(e => ['extra', 'ver', 'own'].includes(e.role)), rest = E_.filter(e => e.role === 'dup' || e.role === 'info' || (e.role === 'q' && e.kind === 'info'));
    const nOff = used.reduce((a, e) => a + (e.pages ? e.pages.filter(p => p[0] === 'offen').length : 0), 0);
    const warn = (r.themen || []).map(([t, x]) => `<div class="qwarn"><b>${E(t)}</b><span>${E(x)}</span></div>`).join('') + (r.luecken || []).map(([t, x]) => `<div class="qwarn lk"><b>${E(t)}</b><span>${E(x)}</span></div>`).join('');
    const leg = `<div class="qleg">${['zit', 'ok', 'teil', 'offen', 'leer'].map(k => `<span><i class="s-${k}"></i>${QST[k]}</span>`).join('')}</div>`;
    let body = '';
    if (id === 'fremd') {
      body = `<section class="card"><h2 class="h2" style="font-size:22px">Herkunft der Fachbegriffe</h2><p class="small" style="margin:0 0 6px">Anzahl Fragen, deren Begriff in den Folien des jeweiligen Fachs vorkommt (ein Begriff kann aus mehreren Fächern stammen).</p>${(r.fremd || []).map(([k, n]) => `<div class="pg"><span class="pgn">${E(k)}</span><b>${n}</b></div>`).join('')}</section>`;
    } else {
      body = `<section class="card"><h2 class="h2" style="font-size:22px;margin-bottom:4px">Verwendete Quellen (${used.length})</h2><p class="small" style="margin:0">Jedes Kästchen ist eine Folie bzw. Seite – mit der Maus darüberfahren zeigt Titel und Status.${nOff ? ` Insgesamt <b>${nOff}</b> Folien/Seiten ohne Entsprechung im Portal.` : ''}</p>${used.map(e => qEntry(e, s)).join('') || '<p class="muted">Keine.</p>'}</section>`
        + (extra.length ? `<section class="card"><h2 class="h2" style="font-size:22px;margin-bottom:4px">Im Ordner, aber nicht als eigene Quelle verwendet (${extra.length})</h2><p class="small" style="margin:0">Zusatzmaterial, andere Fassungen und frühere Ausgaben. Die Abdeckung zeigt, wie viel davon trotzdem schon im Portal steckt.</p>${extra.map(e => qEntry(e, s)).join('')}</section>` : '')
        + (rest.length ? `<section class="card"><h2 class="h2" style="font-size:22px;margin-bottom:4px">Duplikate & Organisatorisches (${rest.length})</h2>${rest.map(e => `<div class="pg"><span class="pgn">${E(e.name)}<span class="qd" style="display:block;font-weight:600">${e.chat ? 'Chat-Upload' : 'Studium / ' + E(e.dir || '')}</span></span><span class="small" style="flex:1 1 240px">${e.role === 'dup' ? 'Duplikat' : 'Organisatorisch'}${e.note ? ' – ' + E(e.note) : ''}</span></div>`).join('')}</section>` : '');
    }
    shell('start', id, band(id, 'quellen', -1) + `<div class="qwrap"><section class="qcard"><h1>Quellen</h1>
  <p class="muted" style="margin:0">Womit dieses Fach im Portal gebaut ist – Datei für Datei und Folie für Folie. Stand: ${E(meta.stand || '')} (Abgleich mit deinem Studium-Ordner).</p>
  ${warn ? `<div class="lbl muted" style="margin-top:6px">Hinweise auf fehlende Folien</div>${warn}` : ''}${r.ok ? `<p class="small" style="margin:0">✔ ${E(r.ok)}</p>` : ''}
  ${id === 'fremd' ? '' : `<div class="lbl muted" style="margin-top:6px">Legende</div>${leg}
  <details class="rules"><summary>So wird geprüft</summary><ul><li><b>Von einer Frage zitiert:</b> Mindestens eine Frage nennt genau diese Folie/Seite als Quelle.</li><li><b>Inhaltlich abgedeckt / teilweise:</b> Die Fachbegriffe der Folie kommen in Fragen, Erklärungen oder im Lernteil vor (automatischer Abgleich, seltene Fachbegriffe zählen stärker). Das ist eine Schätzung.</li><li><b>Nicht im Portal:</b> Kaum ein Fachbegriff der Folie taucht im Portal auf – hier lohnt sich ein Blick, ob etwas fehlt (oft auch Übungs-, Beispiel- oder Literaturfolien).</li><li>Fachfremde Dateien im Ordner „_Altklausuren SS24“ (${E((meta.fremd_ausgeblendet || []).join(', '))}) sind ausgeblendet.</li></ul></details>`}</section>${body}</div>`);
  }

  /* ---------- Reiter Lernziele (Hygiene) ---------- */
  function isLzQ(q) { return !q.hide && !q.r && !!(q.S && q.S.some(x => x[0] === 'lz')); }
  const LZC = {};
  function lzIdx(id) { if (LZC[id]) return LZC[id]; const d = data(id); return LZC[id] = d.qs.map((q, i) => i).filter(i => isLzQ(d.qs[i])); }
  function lzKey(d, i) { const q = d.qs[i]; return q.lz != null ? q.lz : (isOpen(q) ? i : -1); }
  function lzPool(id, t, key) { const d = data(id); return lzIdx(id).filter(i => { const q = d.qs[i]; if (key != null && lzKey(d, i) !== key) return false; if (t === 'open') return isOpen(q); if (isOpen(q)) return false; if (t === 'single') return !q.m; if (t === 'multi') return !!q.m; return true; }); }
  function viewLernziele(id) {
    const s = BYID[id], d = data(id); const all = lzIdx(id); const ok = st.ok[id] || {};
    const nMc = lzPool(id, 'mc').length, nS = lzPool(id, 'single').length, nM = lzPool(id, 'multi').length, nO = lzPool(id, 'open').length;
    const LZ = all.filter(i => isOpen(d.qs[i]));
    const bySec = {}; LZ.forEach(i => { (bySec[d.qs[i].sec] = bySec[d.qs[i].sec] || []).push(i); });
    const list = Object.keys(bySec).map(Number).sort((a, b) => a - b).map(k => `<div class="lbl muted" style="margin:14px 0 6px">${k + 1}. ${E(d.secs[k] ? d.secs[k].t : '')}</div>` + bySec[k].map((i, j) => { const mc = lzPool(id, 'mc', i); const done = mc.filter(x => ok[x]).length; return `<div class="pg"><span class="pgn">${E(d.qs[i].q)}</span><div class="prog" style="width:70px;flex:none"><i style="width:${mc.length ? Math.round(done / mc.length * 100) : 0}%;background:${s.ink}"></i></div><b style="white-space:nowrap">${done}/${mc.length}</b><button class="tag" type="button" data-act="lzone" data-id="${id}" data-lz="${i}" style="background:var(--bg);color:var(--ink);border:0;cursor:pointer">Üben</button></div>`; }).join('')).join('');
    const seg = [['mc', 'Single + Multiple Choice', nMc], ['single', 'Nur Single Choice', nS], ['multi', 'Nur Multiple Choice', nM], ['open', 'Offene Lernziel-Fragen', nO]].filter(x => x[2]).map(([t, l, n], j) => `<button type="button" data-t="${t}" aria-pressed="${j === 0}">${l} · ${n}</button>`).join('');
    shell('start', id, band(id, 'lernziele', -1) + `<div class="qwrap"><section class="qcard"><h1>Lernziel-Fragen</h1>
  <p class="muted" style="margin:0">${LZ.length} Lernziele aus dem Lernziele-PDF – mit ${nMc} Auswahlfragen (${nS} Single Choice, ${nM} Multiple Choice) und ${nO} offenen Fragen zur Selbstkontrolle.</p>
  <div class="lbl muted" style="margin-top:6px">Fragetyp</div><div class="seg" id="lzt">${seg}</div>
  <label class="lbl muted" for="lzn" style="margin-top:6px">Anzahl Fragen</label><select class="sel" id="lzn" style="max-width:260px">${countOpts(nMc)}</select>
  <div style="display:flex;flex-wrap:wrap;gap:10px;margin-top:6px"><label class="sw" style="background:var(--bg)"><input type="checkbox" id="lzx" role="switch"> Prüfungsmodus <span class="small">ohne Joker, Auflösung am Ende</span></label></div>
  <button class="btn" type="button" data-act="lzstart" data-id="${id}" style="align-self:flex-start;margin-top:6px">Lernziel-Quiz starten${svg('arrow', '#FFFFFF', 18)}</button></section>
  <section class="card"><h2 class="h2" style="font-size:22px;margin-bottom:4px">Alle Lernziele</h2><p class="small" style="margin:0">Fortschritt = richtig beantwortete Auswahlfragen je Lernziel. „Üben“ fragt nur dieses Lernziel ab.</p>${list}</section></div>`);
  }
  function route(preserveScroll) {
    const scrollY = preserveScroll ? window.scrollY : 0;
    const h = decodeURIComponent(location.hash.slice(1));
    document.body.classList.toggle('spielmode', h === 'spiel'); if (h !== 'spiel') document.body.classList.remove('spielforce');
    let m;
    try {
      if (!h || h === 'start') viewHome();
      else if (h === 'fehler') viewFehler();
      else if (h === 'pruefung') viewPruefung();
      else if (h === 'semester2') viewSem2();
      else if (h === 'fortschritt') viewFortschritt();
      else if (h === 'lernplan') viewPlan();
      else if (h === 'suche') viewSuche();
      else if (h === 'spiel') viewSpiel();
      else if (m = h.match(/^f-([a-z0-9]+)$/)) { if (BYID[m[1]]) viewThemen(m[1]); else viewHome(); }
      else if (m = h.match(/^f-([a-z0-9]+)-alt$/)) { if (BYID[m[1]] && altIdx(m[1]).length) viewQuizSetup(m[1], -1, 1); else viewHome(); }
      else if (m = h.match(/^f-([a-z0-9]+)-quellen$/)) { if (BYID[m[1]]) viewQuellen(m[1]); else viewHome(); }
      else if (m = h.match(/^f-([a-z0-9]+)-lernziele$/)) { if (BYID[m[1]] && lzIdx(m[1]).length) viewLernziele(m[1]); else viewHome(); }
      else if (m = h.match(/^f-([a-z0-9]+)-thema-(\d+)$/)) { if (BYID[m[1]]) viewThema(m[1], +m[2]); else viewHome(); }
      else if (m = h.match(/^f-([a-z0-9]+)-(lern|quiz|karten|zuordnen)(?:-(\d+))?$/)) {
        const id = m[1], mode = m[2], k = m[3] != null ? +m[3] : (mode === 'lern' ? 0 : -1);
        if (!BYID[id]) return viewHome();
        if (mode === 'lern') viewLern(id, k);
        else if (mode === 'quiz') viewQuizSetup(id, k);
        else if (mode === 'karten') viewKarten(id, k);
        else viewZuordnen(id, k);
      } else viewHome();
    } catch (err) { console.error(err); $app.innerHTML = '<p style="padding:24px">Da ist etwas schiefgegangen: ' + E(err.message) + '</p>'; }
    window.scrollTo(0, scrollY);
  }
  function go(h) { if (location.hash === '#' + h) route(); else location.hash = h; }
  window.addEventListener('hashchange', () => { if (GATE.open) route(); });

  /* ---------- events ---------- */
  document.addEventListener('submit', e => {
    if (e.target.matches('[data-act=search]')) { e.preventDefault(); searchQ = e.target.querySelector('input').value; go('suche'); }
  });
  // Suche ohne Formular-Absenden (in abgeschotteten Ansichten wird submit blockiert)
  function doSearch(f) { searchQ = f.querySelector('input').value; if (location.hash === '#suche') route(); else go('suche'); }
  document.addEventListener('click', e => { const f = e.target.closest('.lern figure.fimg'); if (f) { const ov = document.createElement('div'); ov.className = 'lbox'; ov.innerHTML = `<img src="${f.querySelector('img').src}" alt=""><div class="lbc">${f.querySelector('figcaption') ? f.querySelector('figcaption').innerHTML : ''}</div>`; ov.addEventListener('click', () => ov.remove()); document.body.appendChild(ov); } });
  document.addEventListener('click', e => { const b = e.target.closest('form[data-act=search] button'); if (b) { e.preventDefault(); doSearch(b.closest('form')); } });
  document.addEventListener('keydown', e => { if (e.key === 'Enter' && e.target.matches('form[data-act=search] input')) { e.preventDefault(); doSearch(e.target.closest('form')); } });
  document.addEventListener('change', e => {
    if (e.target.matches('[data-act=onlylz]')) { st.onlyLz = e.target.checked; save(); route(); }
    if (e.target.matches('#qk,#pf')) updSetup();
    if (e.target.matches('[data-act=exd]')) {
      const id = e.target.dataset.id, box = e.target.closest('.dsel');
      const g = p => box.querySelector(`[data-p=${p}]`).value;
      let d = +g('d'), m = +g('m'), y = +g('y');
      if (m && !y) { y = new Date().getFullYear(); if (new Date(y, m, 0) < today0()) y++; box.querySelector('[data-p=y]').value = y; }
      if (d && m && y) { const max = new Date(y, m, 0).getDate(); if (d > max) d = max; st.exams[id] = y + '-' + String(m).padStart(2, '0') + '-' + String(d).padStart(2, '0'); save(); const sy = window.scrollY; viewPlan(); window.scrollTo(0, sy); }
    }
    if (e.target.matches('[data-act=exam]')) { const v = e.target.value; if (v) st.exams[e.target.dataset.id] = v; else delete st.exams[e.target.dataset.id]; save(); viewPlan(); }
    if (e.target.matches('[data-act=pmin]')) { st.plan.min = +e.target.value; save(); viewPlan(); }
    if (e.target.matches('[data-act=wd]')) { const dd = +e.target.dataset.d; st.plan.wd = st.plan.wd.filter(x => x !== dd); if (e.target.checked) st.plan.wd.push(dd); save(); viewPlan(); }
    if (e.target.matches('[data-act=pdone]')) { const k = e.target.dataset.k; if (e.target.checked) st.pdone[k] = today(); else delete st.pdone[k]; save(); route(); }
  });
  document.addEventListener('click', e => {
    const b = e.target.closest('[data-act]'); if (!b) return;
    const a = b.dataset.act;
    if (b.closest('.seg')) { }
    switch (a) {
      case 'opt': {
        const c = QZ.cur, q = data(c.id).qs[c.qi], j = +b.dataset.j; if (c.done) return; if (QZ.exam) { if (q.m) { c.sel.has(j) ? c.sel.delete(j) : c.sel.add(j); } else { c.sel = new Set([j]); } renderQ(); break; }
        if (q.m) { c.sel.has(j) ? c.sel.delete(j) : c.sel.add(j); } else { c.sel = new Set([j]); } renderQ(); break;
      } /* SC: erst nach Bestätigung werten */
      case 'qcheck': checkQ(); break;
      case 'markread': { if (b.tagName === 'A') { const _cl = curLern(); if (_cl && _cl.id === b.dataset.id && _cl.k === +b.dataset.k) autoGen(_cl.id, _cl.k); } (st.read[b.dataset.id] = st.read[b.dataset.id] || {})[+b.dataset.k] = 1; touchDay(); save(); if (b.tagName === 'BUTTON') { const sy = window.scrollY; viewLern(b.dataset.id, +b.dataset.k); window.scrollTo(0, sy); } break; }
      case 'unread': { if (st.read[b.dataset.id]) delete st.read[b.dataset.id][+b.dataset.k]; save(); { const sy = window.scrollY; viewLern(b.dataset.id, +b.dataset.k); window.scrollTo(0, sy); } break; }
      case 'hday': homeDay = (homeDay === b.dataset.k ? null : b.dataset.k); viewHome(); { const el = document.querySelector('.wdetail') || document.querySelector('.wstrip'); if (el) el.scrollIntoView({ block: 'nearest' }); } break;
      case 'exclr': delete st.exams[b.dataset.id]; save(); viewPlan(); break;
      case 'planall': planAll = true; viewPlan(); break;
      case 'psel': st.pfPre = b.dataset.id; save(); break;
      case 'tf': { const c = QZ.cur, q = data(c.id).qs[c.qi]; if (c.done) return; c.tfv = +b.dataset.v; renderQ(); break; }
      case 'tfcheck': { const c = QZ.cur, q = data(c.id).qs[c.qi]; if (c.done || c.tfv == null) return; finishSpecial(c.tfv === (q.tf ? 1 : 0), c.tfv === (q.tf ? 1 : 0) ? 10 : 0, 10); break; }
      case 'dchip': { if (justDragged) return; const c = QZ.cur; if (c.done) return; const i = +b.dataset.i; if (c.place[i] != null) { delete c.place[i]; c.pick = null; } else c.pick = (c.pick === i ? null : i); renderQ(); break; }
      case 'dbox': { if (justDragged) return; const c = QZ.cur; if (c.done || c.pick == null) return; c.place[c.pick] = +b.dataset.c; c.pick = null; renderQ(); break; }
      case 'dreset': { const c = QZ.cur; c.place = {}; c.pick = null; renderQ(); break; }
      case 'dcheck': { if (QZ.exam) { QZ.cur.saved = 1; advanceQ(); break; } const c = QZ.cur, q = data(c.id).qs[c.qi]; const n = q.items.length, r = q.items.filter((it, i) => c.place[i] === it[1]).length; finishSpecial(r === n, 2 * r, 2 * n, r ? `${r} von ${n} richtig zugeordnet.` : ''); break; }
      case 'oup': case 'odn': { const c = QZ.cur, p = +b.dataset.p, t = a === 'oup' ? p - 1 : p + 1; if (t < 0 || t >= c.ord.length) return;[c.ord[p], c.ord[t]] = [c.ord[t], c.ord[p]]; renderQ(); const el = document.querySelector(`.orow[data-pos="${t}"] [data-act="${a}"]`) || document.querySelector(`.orow[data-pos="${t}"] .ob`); if (el) el.focus(); break; }
      case 'ocheck': { if (QZ.exam) { QZ.cur.saved = 1; advanceQ(); break; } const c = QZ.cur, q = data(c.id).qs[c.qi]; const n = q.items.length, r = c.ord.filter((it, pos) => it === pos).length; finishSpecial(r === n, 2 * r, 2 * n, r ? `${r} von ${n} an der richtigen Stelle.` : ''); break; }
      case 'qreveal': QZ.cur.revealed = true; renderQ(); break;
      case 'qself': { finishQ(b.dataset.v === '1', false); break; }
      case 'qnext': advanceQ(); break;
      case 'qover': QZ.over = true; QZ.conf = false; renderQ(); window.scrollTo(0, 0); break;
      case 'qgoto': QZ.conf = false; goQ(+b.dataset.i); break;
      case 'qsub': QZ.conf = true; renderQ(); { const h = document.querySelector('.ovconf'); if (h) h.scrollIntoView({ block: 'center' }); } break;
      case 'qsubno': QZ.conf = false; renderQ(); break;
      case 'qsubyes': examSubmit(); window.scrollTo(0, 0); break;
      case 'qprev': if (QZ.i > 0) goQ(QZ.i - 1); break;
      case 'qfwd': { if (QZ.i < QZ.list.length - 1) goQ(QZ.i + 1); else { const o = qOpenIdx().filter(i => i !== QZ.i); if (o.length) goQ(o[0]); } break; }
      case 'qquit': if (QZ.exam && !QZ.finished) { QZ.over = true; QZ.conf = false; renderQ(); } else finishQuiz(); break;
      case 'jh': { const c = QZ.cur; if (QZ.jh > 0 && !c.hint) { c.hint = true; QZ.jh--; QZ.uh++; renderQ(); } break; }
      case 'jf': { const c = QZ.cur, q = data(c.id).qs[c.qi]; if (QZ.jf > 0 && !c.gone.size) { const w = shuffle(q.o.map((o, j) => o[1] ? -1 : j).filter(j => j >= 0)); const rm = q.m ? Math.floor(w.length / 2) : w.length - 1; w.slice(0, Math.max(1, rm)).forEach(j => { c.gone.add(j); c.sel.delete(j); }); QZ.jf--; QZ.uf++; renderQ(); } break; }
      case 'lzstart': { const id = b.dataset.id; const tb = document.querySelector('#lzt [aria-pressed=true]'); const t = tb ? tb.dataset.t : 'mc'; const n = +document.getElementById('lzn').value; let pool = lzPool(id, t).map(i => [id, i]); if (n) pool = variantFirst(pool).slice(0, n); pool = shuffle(pool); if (!pool.length) return; startQuiz(pool, { exam: document.getElementById('lzx').checked, home: 'subj', ret: -1 }); QZ.lz = 1; renderQ(); break; }
      case 'qorig': break;
      case 'altone': { const id = b.dataset.id, k = b.dataset.k, d = data(id); const pool = shuffle(altIdx(id).filter(i => altSrc(d.qs[i]) === k).map(i => [id, i])); if (!pool.length) return; startQuiz(pool, { exam: false, home: 'subj', ret: -1 }); QZ.alt = 1; renderQ(); break; }
      case 'lzone': { const id = b.dataset.id, key = +b.dataset.lz; const pool = shuffle(lzPool(id, 'mc', key).concat(lzPool(id, 'open', key)).map(i => [id, i])); if (!pool.length) return; startQuiz(pool, { exam: false, home: 'subj', ret: -1 }); QZ.lz = 1; renderQ(); break; }
      case 'qstart': { const id = b.dataset.id, k = +document.getElementById('qk').value; const tb = document.querySelector('#qt [aria-pressed=true]'); const t = tb ? tb.dataset.t : 'mc'; const n = +document.getElementById('qn').value; let pool = freshPairs(poolFor(id, k, t, curOrig()).map(i => [id, i])); if (n) pool = variantFirst(pool).slice(0, n); pool = shuffle(pool); if (!pool.length) return; const ex = document.getElementById('qx').checked; startQuiz(pool, { exam: ex, home: 'subj', ret: k }); if (b.dataset.alt) { QZ.alt = 1; renderQ(); } break; }
      case 'qwrong': { const id = b.dataset.id; startQuiz(shuffle(wrongList().filter(([x]) => x === id)), { exam: false, home: 'subj', ret: -1 }); break; }
      case 'qretry': { const l = QZ.wrong.map(([id, qi]) => [id, qi]); const o = { exam: QZ.exam, home: QZ.home, ret: QZ.ret }; const t = QZ.title, nv = QZ.nav, lz = QZ.lz, al = QZ.alt; startQuiz(shuffle(l), o); QZ.title = t; QZ.nav = nv; QZ.lz = lz; QZ.alt = al; renderQ(); break; }
      case 'qagain': { if (QZ.lz) { go('f-' + QZ.list[0][0] + '-lernziele'); route(); } else if (QZ.alt) { go('f-' + QZ.list[0][0] + '-alt'); route(); } else if (QZ.home === 'mix') { route(); } else { const id = QZ.list[0][0]; go('f-' + id + '-quiz' + (QZ.ret >= 0 ? '-' + QZ.ret : '')); route(); } break; }
      case 'tolern': break;
      case 'gameforce': { document.body.classList.add('spielforce'); break; }
      case 'gamefs': { const f = document.getElementById('gameframe'); if (f && f.requestFullscreen) { f.requestFullscreen().catch(() => { b.textContent = 'Vollbild hier nicht möglich'; b.disabled = true; }); } else { b.textContent = 'Vollbild hier nicht möglich'; b.disabled = true; } break; }
      case 'owndel': { const L = MY.q[b.dataset.id] || []; const x = L.find(y => y.id === b.dataset.q); if (x) { x.del = 1; x.ts = Date.now(); mySave('q', b.dataset.id); ownSync(b.dataset.id); rerenderLern(); } break; }
      case 'owndelmarks': { const id = b.dataset.id, k = +b.dataset.k; myLive(MY.m[id]).filter(m => m.k === k).forEach(m => { m.del = 1; m.ts = Date.now(); }); mySave('m', id); rerenderLern(); break; }
      case 'gennew': openGen(b.dataset.id, +b.dataset.k); break;
      case 'ownquiz': { const id = b.dataset.id, k = +b.dataset.k; data(id); const pool = (MY.q[id] || []).filter(x => !x.del && x.k === k).map(x => ownIdx(id, x.id)).filter(i => i >= 0); if (pool.length) startQuiz(shuffle(pool).map(i => [id, i]), { exam: false, home: 'subj', ret: k }); break; }
      case 'kflip': KC.flip = !KC.flip; renderKarte(); break;
      case 'krate': rateKarte(+b.dataset.v); break;
      case 'kagain': viewKarten(KC.id, KC.k); break;
      case 'zl': ZO.sel = +b.dataset.j; ZO.bad = null; ZO.msg = ''; renderZO(); break;
      case 'zr': {
        const j = +b.dataset.j; if (ZO.sel == null) { ZO.msg = 'Wähle zuerst links eine Antwort.'; ZO.msgok = false; renderZO(); break; }
        if (j === ZO.sel) { ZO.done.add(j); ZO.score++; ZO.msg = 'Richtig zugeordnet.'; ZO.msgok = true; ZO.sel = null; ZO.bad = null; record(ZO.id, ZO.pairs[j].qi, true); }
        else { ZO.bad = j; ZO.miss++; ZO.msg = '<b>Noch nicht.</b> Diese Frage gehört zu einer anderen Antwort.'; ZO.msgok = false; }
        renderZO(); break;
      }
      case 'znext': ZO.round++; if (ZO.round < ZO.rounds) newRound(); else renderZO(); break;
      case 'zagain': viewZuordnen(ZO.id, ZO.k); break;
      case 'fstart': { const id = b.dataset.id; const l = wrongList().filter(([x]) => !id || x === id); if (!l.length) return; startQuiz(shuffle(l), { exam: false, home: 'mix' }); QZ.title = id ? 'Fehlerkartei · ' + BYID[id].name : 'Fehlerkartei · alle Fächer'; QZ.nav = 'fehler'; renderQ(); break; }
      case 'pstart': { const id = document.getElementById('pf').value; const tb = document.querySelector('#qt [aria-pressed=true]'); const t = tb ? tb.dataset.t : 'mc'; const n = +document.getElementById('qn').value; let all = pairsFor(id ? [id] : SUBJ.map(x => x.id), -1, t, curOrig()); all = freshPairs(all); if (n) all = variantFirst(all).slice(0, n); all = shuffle(all); if (!all.length) return; startQuiz(all, { exam: true, home: 'mix' }); QZ.title = 'Prüfungsmodus · ' + (id ? BYID[id].name : 'alle Fächer'); QZ.nav = 'pruefung'; renderQ(); break; }
    }
  });
  document.addEventListener('click', e => { const a = e.target.closest('a[href^="#"]'); if (a && a.getAttribute('href') === location.hash && !e.defaultPrevented) { e.preventDefault(); route(); } });
  document.addEventListener('click', e => { const sb = e.target.closest('.seg button'); if (!sb) return; if (sb.closest('.multi')) { const on = sb.getAttribute('aria-pressed') === 'true'; const others = [...sb.parentElement.querySelectorAll('[aria-pressed=true]')].filter(x => x !== sb); if (on && !others.length) return; sb.setAttribute('aria-pressed', String(!on)); updSetup(); return; } sb.parentElement.querySelectorAll('button').forEach(x => x.setAttribute('aria-pressed', String(x === sb))); if (sb.closest('#qt')) updSetup(); if (sb.closest('#lzt')) { const id = document.querySelector('[data-act=lzstart]').dataset.id; const sel = document.getElementById('lzn'); sel.innerHTML = countOpts(lzPool(id, sb.dataset.t).length); } });
  /* Drag & Drop mit Maus und Finger */
  let drag = null, justDragged = false;
  document.addEventListener('pointerdown', e => {
    if (e.button !== undefined && e.button !== 0) return;
    const chip = e.target.closest('.chip:not([disabled])'); const row = !chip && e.target.closest('.orow') && !e.target.closest('.ob') ? e.target.closest('.orow') : null;
    if (!chip && !row) return;
    if (!QZ || !QZ.cur || QZ.cur.done) return;
    drag = { el: chip || row, kind: chip ? 'chip' : 'row', x: e.clientX, y: e.clientY, moved: false, ghost: null, id: e.pointerId };
  });
  document.addEventListener('pointermove', e => {
    if (!drag) return;
    const dx = e.clientX - drag.x, dy = e.clientY - drag.y;
    if (!drag.moved && Math.hypot(dx, dy) < 6) return;
    if (!drag.moved) { drag.moved = true; const r = drag.el.getBoundingClientRect(), Z = zf(); drag.z = Z; const g = drag.el.cloneNode(true); g.classList.add('ghost'); g.style.width = (r.width / Z) + 'px'; g.style.left = (r.left / Z) + 'px'; g.style.top = (r.top / Z) + 'px'; document.body.appendChild(g); drag.ghost = g; drag.ox = e.clientX - r.left; drag.oy = e.clientY - r.top; drag.el.classList.add('dragging'); }
    e.preventDefault();
    drag.ghost.style.left = ((e.clientX - drag.ox) / (drag.z || 1)) + 'px'; drag.ghost.style.top = ((e.clientY - drag.oy) / (drag.z || 1)) + 'px';
    document.querySelectorAll('.over').forEach(x => x.classList.remove('over'));
    drag.ghost.style.display = 'none'; const t = document.elementFromPoint(e.clientX, e.clientY); drag.ghost.style.display = '';
    const tgt = t && (drag.kind === 'chip' ? t.closest('[data-drop]') : t.closest('.orow'));
    if (tgt) tgt.classList.add('over');
  }, { passive: false });
  document.addEventListener('pointerup', e => {
    if (!drag) return;
    const d0 = drag; drag = null;
    if (!d0.moved) return;
    justDragged = true; setTimeout(() => justDragged = false, 50);
    if (d0.ghost) { d0.ghost.style.display = 'none'; }
    const t = document.elementFromPoint(e.clientX, e.clientY);
    if (d0.ghost) d0.ghost.remove();
    const c = QZ && QZ.cur; if (!c || c.done) { renderQ(); return; }
    if (d0.kind === 'chip') { const box = t && t.closest('[data-drop]'); const i = +d0.el.dataset.i; if (box) { const ci = +box.dataset.drop; if (ci < 0) delete c.place[i]; else c.place[i] = ci; } c.pick = null; }
    else { const r = t && t.closest('.orow'); if (r) { const from = +d0.el.dataset.pos, to = +r.dataset.pos; const it = c.ord.splice(from, 1)[0]; c.ord.splice(to, 0, it); } }
    renderQ();
  });
  document.addEventListener('pointercancel', () => { if (drag && drag.ghost) drag.ghost.remove(); drag = null; });
  document.addEventListener('keydown', e => {
    if ((e.key === 'Enter' || e.key === ' ') && e.target.matches('.dbox')) { e.preventDefault(); e.target.click(); }
    if ((e.key === 'ArrowLeft' || e.key === 'ArrowRight') && !e.altKey && !e.ctrlKey && !e.metaKey && !e.target.matches('input,select,textarea') && document.querySelector('.qnav')) { e.preventDefault(); const b = document.querySelector(`.qnav [data-act="${e.key === 'ArrowLeft' ? 'qprev' : 'qfwd'}"]`); if (b && !b.disabled) b.click(); }
  });
  setInterval(() => { const t = document.getElementById('qtime'); if (t && QZ && !QZ.finished) t.textContent = fmtT(Date.now() - QZ.t0); }, 1000);
  /* ---------- Unterstreichen, Anstreichen, Häkchen & eigene Fragen ---------- */
  const MYKEY = 'lernportal-guk-my';
  let MY = { m: {}, q: {}, t: {}, g: {} };
  try { const r = JSON.parse(localStorage.getItem(MYKEY) || 'null'); if (r && r.m && r.q) MY = Object.assign(MY, r); } catch (e) { }
  ['m', 'q', 't', 'g'].forEach(k => { MY[k] = MY[k] || {}; });
  const KINDS = ['m', 'q', 't', 'g'];
  const UI = (() => { try { return JSON.parse(localStorage.getItem('lernportal-guk-ui') || '{}'); } catch (e) { return {}; } })();
  function uiSave() { try { localStorage.setItem('lernportal-guk-ui', JSON.stringify(UI)); } catch (e) { } }
  if (!UI.n) UI.n = 10;
  const SYNC = { db: null, uid: null, state: 'local', dirty: new Set(), busy: {}, timer: null };
  function myLive(list) { return (list || []).filter(x => !x.del); }
  function mySave(kind, id) { try { localStorage.setItem(MYKEY, JSON.stringify(MY)); } catch (e) { } if (SYNC.db && SYNC.uid) { SYNC.dirty.add(kind + '-' + id); clearTimeout(SYNC.timer); SYNC.timer = setTimeout(myFlush, 900); } }
  async function myFlush() {
    for (const key of [...SYNC.dirty]) {
      if (SYNC.busy[key]) continue;
      SYNC.dirty.delete(key); SYNC.busy[key] = true;
      const [kind, id] = key.split('-'); const list = (MY[kind][id] || []);
      try { await SYNC.db.collection('data/users/' + SYNC.uid).doc(key).set({ list, ts: Date.now() }); SYNC.state = 'cloud'; }
      catch (e) { if (e && e.code === 'unavailable') { SYNC.dirty.add(key); setTimeout(myFlush, 2500 + Math.random() * 2000); } else SYNC.state = 'local'; }
      SYNC.busy[key] = false;
    }
    if (SYNC.dirty.size) setTimeout(myFlush, 400);
    updSyncTag();
  }
  function myMerge(a, b) { const m = new Map();[...(a || []), ...(b || [])].forEach(x => { if (!x || !x.id) return; const o = m.get(x.id); if (!o || (x.ts || 0) > (o.ts || 0)) m.set(x.id, x); }); return [...m.values()].sort((x, y) => (x.c || 0) - (y.c || 0)); }
  async function mySyncInit() {
    try {
      if (!window.claude || !window.claude.use) return;
      const [db, user] = await Promise.all([window.claude.use('db'), window.claude.use('user')]);
      if (!db || !user) return;
      const uid = await user.id(); if (!uid) return;
      SYNC.db = db; SYNC.uid = uid; SYNC.state = 'loading'; updSyncTag();
      const col = db.collection('data/users/' + uid);
      const to = new Promise(r => setTimeout(() => r('timeout'), 10000));
      const load = Promise.all(SUBJ.flatMap(s => KINDS.map(async kind => { const snap = await col.doc(kind + '-' + s.id).get(); return [kind, s.id, snap]; })));
      const res = await Promise.race([load, to]);
      if (res === 'timeout') { SYNC.state = 'local'; updSyncTag(); return; }
      let changed = false;
      res.forEach(([kind, id, snap]) => {
        const remote = snap.exists ? ((snap.data() || {}).list || []) : [];
        const local = MY[kind][id] || [];
        const merged = myMerge(remote, local);
        if (JSON.stringify(merged) !== JSON.stringify(remote)) SYNC.dirty.add(kind + '-' + id);
        if (JSON.stringify(merged) !== JSON.stringify(local)) { MY[kind][id] = merged; changed = true; }
      });
      try { localStorage.setItem(MYKEY, JSON.stringify(MY)); } catch (e) { }
      SYNC.state = 'cloud';
      if (SYNC.dirty.size) myFlush();
      if (changed) { Object.keys(cache).forEach(ownSync); if (curLern()) rerenderLern(); }
      updSyncTag();
    } catch (e) { SYNC.state = 'local'; updSyncTag(); }
  }
  function syncText() { return SYNC.state === 'cloud' ? '☁️ In deinem Konto gespeichert, auf allen Geräten gleich' : SYNC.state === 'loading' ? '☁️ Wird geladen …' : '💾 Auf diesem Gerät gespeichert'; }
  function updSyncTag() { document.querySelectorAll('.synctag').forEach(x => x.textContent = syncText()); }

  /* eigene Fragen in die Fach-Daten einhängen */
  function ownSync(id) {
    const d = cache[id]; if (!d) return;
    if (d._n == null) d._n = d.qs.length;
    d.qs.length = d._n;
    (MY.q[id] || []).forEach(x => {
      const sec = d.secs[x.k];
      const S = [['eigen', 'KI-Frage, erstellt aus deinem Lernteil' + (x.auto ? ' (automatisch beim Kapitelwechsel)' : ''), sec ? `Kapitel ${x.k + 1}: ${sec.t}${x.hd ? ' · ' + x.hd : ''}` : '']].concat(sec && sec.src ? sec.src : []);
      const q = { q: x.q, o: x.o || [], a: x.a || '', e: x.e || '', x: '', h: '', s: 'Eigene Frage', S, t: 'Meine Fragen', sec: x.k, own: 1, hide: x.del ? 1 : 0, f: 0 };
      if (x.y === 'tf') { q.y = 'tf'; q.tf = x.tf; }
      d.qs.push(q);
    });
  }
  function ownIdx(id, qid) { const d = data(id); const L = MY.q[id] || []; const j = L.findIndex(x => x.id === qid); return j < 0 ? -1 : d._n + j; }
  function newId(p) { return p + Date.now().toString(36) + Math.random().toString(36).slice(2, 6); }
  function curLern() { const m = location.hash.match(/^#f-(\w+)-lern(?:-(\d+))?$/); if (!m) return null; const d = data(m[1]); let k = m[2] ? +m[2] : 0; if (!(k >= 0 && k < d.secs.length)) k = 0; return { id: m[1], k }; }
  function rerenderLern() { const y = window.scrollY; route(); window.scrollTo(0, y); }

  /* Text-Positionen */
  const SKIP = '.srcbox,.mybox,.hctl,.rail,script,style';
  function textNodes(root) { const out = []; const w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, { acceptNode: n => n.parentElement && n.parentElement.closest(SKIP) ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT }); let n, pos = 0; while ((n = w.nextNode())) { out.push([n, pos]); pos += n.data.length; } return out; }
  function fullText(nodes) { return nodes.map(([n]) => n.data).join(''); }
  function rangeOffsets(root, range) {
    const nodes = textNodes(root);
    const pt = (c, o, isEnd) => {
      if (c.nodeType === 3) { const f = nodes.find(([n]) => n === c); if (f) return f[1] + o; }
      // Elementgrenze: erster Textknoten ab der Position
      let best = null; const probe = document.createRange(); probe.setStart(c, Math.min(o, c.childNodes ? c.childNodes.length : 0));
      for (const [n, p] of nodes) { if (probe.comparePoint(n, 0) >= 0) { best = p; break; } }
      if (best == null) { const l = nodes[nodes.length - 1]; best = l ? l[1] + l[0].data.length : 0; }
      return best;
    };
    const s = pt(range.startContainer, range.startOffset), e = pt(range.endContainer, range.endOffset, true);
    return s == null || e == null || e <= s ? null : { s, e, nodes };
  }
  function wrapRange(root, s, e, cls, mid) {
    textNodes(root).forEach(([n, p]) => {
      const a = Math.max(s, p), b = Math.min(e, p + n.data.length); if (a >= b) return;
      const par = n.parentElement; if (!par || /^(TABLE|TBODY|THEAD|TR|UL|OL|DL)$/.test(par.tagName)) return;
      if (!n.data.slice(a - p, b - p).trim()) return;
      let node = n; if (a > p) node = node.splitText(a - p); if (b < p + n.data.length) node.splitText(b - a);
      const m = document.createElement('mark'); m.className = 'ul ' + cls; m.dataset.mid = mid; node.parentNode.insertBefore(m, node); m.appendChild(node);
    });
  }
  function headings(root) { const hs = [...root.querySelectorAll('h4.hd')]; return hs; }
  function headOffsets(root) { const nodes = textNodes(root); return headings(root).map(h => { const f = nodes.find(([n]) => h.contains(n)); return f ? f[1] : Infinity; }); }
  function headIdxAt(root, off) { const ho = headOffsets(root); let h = -1; ho.forEach((o, i) => { if (o <= off) h = i; }); return Math.max(0, h); }
  function headTitle(root, i) { const h = headings(root)[i]; if (!h) return ''; const c = h.cloneNode(true); c.querySelectorAll('.hctl,small,.btag').forEach(x => x.remove()); return c.textContent.trim(); }
  function sectionText(root, i) {
    const hs = headings(root); const r = document.createRange();
    if (!hs.length) { r.selectNodeContents(root); }
    else { r.setStartBefore(hs[i]); if (hs[i + 1]) r.setEndBefore(hs[i + 1]); else r.setEndAfter(root.lastChild); }
    const frag = r.cloneContents(); const div = document.createElement('div'); div.appendChild(frag);
    div.querySelectorAll(SKIP + ',img').forEach(x => x.remove()); div.querySelectorAll('br,p,li,tr,h4,div,dt,dd').forEach(x => x.append('\n'));
    return div.textContent.replace(/[ \t]+/g, ' ').replace(/\n\s*\n+/g, '\n').trim();
  }
  function clearMarks(root) { root.querySelectorAll('mark.ul').forEach(m => { const p = m.parentNode; while (m.firstChild) p.insertBefore(m.firstChild, m); p.removeChild(m); }); root.normalize(); }
  function paintMarks(id, k) {
    const root = document.querySelector('.lern'); if (!root) return;
    clearMarks(root);
    myLive(MY.m[id]).filter(m => m.k === k).sort((a, b) => (a.col === 'must') - (b.col === 'must')).forEach(m => {
      const full = fullText(textNodes(root)); let i = -1, from = 0, best = -1;
      while ((i = full.indexOf(m.t, from)) >= 0) { if (best < 0) best = i; if (full.slice(Math.max(0, i - m.pre.length), i) === m.pre) { best = i; break; } from = i + 1; }
      if (best >= 0) wrapRange(root, best, best + m.t.length, 'c-' + (m.col || 'y'), m.id);
    });
    updHeadCtl(id, k);
  }

  /* Häkchen & Pinsel an den Überschriften */
  function tickOn(id, k, h) { const x = (MY.t[id] || []).find(t => t.id === k + ':' + h); return !!(x && x.on); }
  function mustIn(id, k, h) { return myLive(MY.m[id]).filter(m => m.k === k && m.col === 'must' && (m.h || 0) === h).length; }
  function setTick(id, k, h, on) { const L = (MY.t[id] = MY.t[id] || []); let x = L.find(t => t.id === k + ':' + h); if (!x) { x = { id: k + ':' + h, k, h, c: Date.now() }; L.push(x); } if (!!x.on === !!on) return; x.on = on ? 1 : 0; x.ts = Date.now(); mySave('t', id); }
  function selSections(id, k) { const root = document.querySelector('.lern'); const n = root ? Math.max(1, headings(root).length) : 1; const out = []; for (let h = 0; h < n; h++) { if (tickOn(id, k, h) || mustIn(id, k, h)) out.push(h); } return out; }
  function injectHeadCtl(id, k) {
    const root = document.querySelector('.lern'); if (!root) return;
    const hs = headings(root);
    const mk = (h) => `<span class="hctl"><label class="hchk" title="Abschnitt für neue Fragen auswählen"><input type="checkbox" data-hk="${h}"${tickOn(id, k, h) ? ' checked' : ''} aria-label="Abschnitt für Fragen auswählen"><span class="hbox" aria-hidden="true"></span></label><button type="button" class="hbrush" data-hb="${h}" title="Pinsel: anstreichen, was in den Fragen vorkommen muss" aria-label="Pinsel für diesen Abschnitt">🖌<em></em></button></span>`;
    if (!hs.length) { const row = document.createElement('div'); row.className = 'hctlrow'; row.innerHTML = mk(0) + '<span class="small">Ganzes Kapitel für Fragen auswählen</span>'; root.prepend(row); }
    else hs.forEach((h, i) => h.insertAdjacentHTML('afterbegin', mk(i)));
  }
  function updHeadCtl(id, k) {
    document.querySelectorAll('.lern .hctl').forEach(c => { const h = +c.querySelector('[data-hk]').dataset.hk; const n = mustIn(id, k, h); const cb = c.querySelector('[data-hk]'); cb.checked = tickOn(id, k, h) || n > 0; const em = c.querySelector('.hbrush em'); em.textContent = n ? n : ''; c.classList.toggle('on', cb.checked); });
    updGenInfo(id, k);
  }
  function applyMarks(id, k) { injectHeadCtl(id, k); paintMarks(id, k); syncRail(); }

  /* Werkzeugleiste */
  const TOOLS = [['y', 'Gelb unterstreichen', '#E7B416'], ['g', 'Grün unterstreichen', '#2E9E6B'], ['p', 'Rosa unterstreichen', '#D9467A'], ['b', 'Blau unterstreichen', '#3A7BD5']];
  let TOOL = UI.tool || null;
  function railHtml(id, k) {
    return `<aside class="rail${UI.railOff ? ' off' : ''}" aria-label="Werkzeuge zum Markieren">
  <button type="button" class="rtog" data-rail="toggle" aria-expanded="${!UI.railOff}" title="${UI.railOff ? 'Werkzeuge einblenden' : 'Werkzeuge ausblenden'}">${UI.railOff ? '🖍️ Werkzeuge' : '✕'}</button>
  <div class="rtools">
   <span class="rlbl">Unter&shy;streichen</span>
   ${TOOLS.map(([c, l, h]) => `<button type="button" class="rt" data-tool="${c}" aria-pressed="false" title="${l}" aria-label="${l}"><i style="background:${h}"></i></button>`).join('')}
   <span class="rsep"></span>
   <button type="button" class="rt brush" data-tool="must" aria-pressed="false" title="Pinsel: anstreichen, was unbedingt in den Fragen vorkommen muss" aria-label="Pinsel: muss in die Fragen">🖌<span>Pinsel</span></button>
   <button type="button" class="rt" data-tool="erase" aria-pressed="false" title="Radierer: markierte Stelle entfernen" aria-label="Radierer">⌫<span>Radierer</span></button>
   <span class="rsep"></span>
   <button type="button" class="rt gen" data-rail="gen" title="Jetzt Fragen erzeugen" aria-label="Jetzt Fragen erzeugen">✨<span>Fragen</span></button>
  </div>
  <div class="rhint" aria-live="polite"></div></aside>`;
  }
  function syncRail() {
    document.querySelectorAll('.rail .rt[data-tool]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.tool === TOOL)));
    const hint = document.querySelector('.rail .rhint');
    if (hint) hint.textContent = !TOOL ? 'Werkzeug wählen, dann Text markieren' : TOOL === 'must' ? 'Pinsel aktiv: Text markieren = muss in die Fragen' : TOOL === 'erase' ? 'Radierer aktiv: Markierung überstreichen oder antippen' : 'Unterstreichen aktiv: Text markieren';
    document.body.classList.toggle('tool-on', !!TOOL);
  }
  function setTool(t) { TOOL = (TOOL === t) ? null : t; UI.tool = TOOL; uiSave(); syncRail(); }
  document.addEventListener('click', e => {
    const b = e.target.closest('.rail button'); if (!b) return;
    if (b.dataset.tool) { setTool(b.dataset.tool); return; }
    if (b.dataset.rail === 'toggle') { UI.railOff = !UI.railOff; uiSave(); const r = b.closest('.rail'); const cl = curLern(); if (r && cl) { r.outerHTML = railHtml(cl.id, cl.k); syncRail(); } return; }
    if (b.dataset.rail === 'gen') { const cl = curLern(); if (cl) openGen(cl.id, cl.k); }
  });
  document.addEventListener('click', e => {
    const hb = e.target.closest('.lern .hbrush'); if (hb) { e.preventDefault(); const cl = curLern(); if (!cl) return; TOOL = 'must'; UI.tool = 'must'; if (UI.railOff) { UI.railOff = false; const r = document.querySelector('.rail'); if (r) r.outerHTML = railHtml(cl.id, cl.k); } uiSave(); syncRail(); setTick(cl.id, cl.k, +hb.dataset.hb, 1); updHeadCtl(cl.id, cl.k); toast('🖌 Pinsel aktiv: Markiere jetzt die Stellen, die in den Fragen vorkommen müssen.'); return; }
  });
  document.addEventListener('change', e => {
    const cb = e.target.closest('.lern input[data-hk]'); if (!cb) return; const cl = curLern(); if (!cl) return;
    const h = +cb.dataset.hk;
    if (!cb.checked && mustIn(cl.id, cl.k, h)) { cb.checked = true; toast('In diesem Abschnitt gibt es angestrichene Stellen. Entferne sie mit dem Radierer, um ihn abzuwählen.'); return; }
    setTick(cl.id, cl.k, h, cb.checked); updHeadCtl(cl.id, cl.k);
  });

  /* Markieren mit aktivem Werkzeug */
  let touching = false, selT = null;
  document.addEventListener('touchstart', () => { touching = true; }, { passive: true });
  document.addEventListener('touchend', () => { touching = false; clearTimeout(selT); selT = setTimeout(() => applySel(), 550); }, { passive: true });
  document.addEventListener('mouseup', e => { if (e.target && e.target.closest && e.target.closest('.rail,.hctl,#qgen')) return; setTimeout(() => applySel(), 10); });
  document.addEventListener('selectionchange', () => { if (!touching && window.matchMedia('(pointer:coarse)').matches) { clearTimeout(selT); selT = setTimeout(() => applySel(), 900); } });
  function applySel() {
    if (!TOOL) return;
    const sel = window.getSelection(); const root = document.querySelector('.lern'); const cl = curLern();
    if (!sel || sel.isCollapsed || !sel.rangeCount || !root || !cl) return;
    const r = sel.getRangeAt(0); if (!root.contains(r.commonAncestorContainer)) return;
    if (TOOL === 'erase') {
      const ids = new Set([...root.querySelectorAll('mark.ul')].filter(m => r.intersectsNode(m)).map(m => m.dataset.mid));
      let n = 0; (MY.m[cl.id] || []).forEach(m => { if (ids.has(m.id) && !m.del) { m.del = 1; m.ts = Date.now(); n++; } });
      try { sel.removeAllRanges(); } catch (x) { }
      if (n) { mySave('m', cl.id); paintMarks(cl.id, cl.k); }
      return;
    }
    const off = rangeOffsets(root, r); if (!off) return;
    let { s, e } = off; const full = fullText(off.nodes);
    while (s < e && /\s/.test(full[s])) s++; while (e > s && /\s/.test(full[e - 1])) e--;
    const t = full.slice(s, e); if (t.length < 2 || t.length > 2000) return;
    const h = headIdxAt(root, s);
    const m = { id: newId('m'), k: cl.k, h, t, pre: full.slice(Math.max(0, s - 40), s), col: TOOL, c: Date.now(), ts: Date.now() };
    (MY.m[cl.id] = MY.m[cl.id] || []).push(m); mySave('m', cl.id);
    if (TOOL === 'must') setTick(cl.id, cl.k, h, 1);
    try { sel.removeAllRanges(); } catch (x) { }
    paintMarks(cl.id, cl.k);
  }
  /* Antippen einer Markierung */
  const pop = document.createElement('div'); pop.className = 'selbar'; pop.hidden = true; document.body.appendChild(pop);
  pop.addEventListener('pointerdown', e => e.preventDefault());
  let POPM = null;
  document.addEventListener('click', e => {
    if (!e.target.closest('.selbar') && !e.target.closest('.lern mark.ul')) { pop.hidden = true; POPM = null; }
    const mk = e.target.closest('.lern mark.ul'); if (!mk) return;
    const sel = window.getSelection(); if (sel && !sel.isCollapsed) return;
    const cl = curLern(); if (!cl) return; const m = (MY.m[cl.id] || []).find(x => x.id === mk.dataset.mid); if (!m) return;
    if (TOOL === 'erase') { m.del = 1; m.ts = Date.now(); mySave('m', cl.id); paintMarks(cl.id, cl.k); return; }
    POPM = { id: cl.id, k: cl.k, m };
    pop.innerHTML = `<span class="sbl">${m.col === 'must' ? '🖌 Muss in die Fragen' : 'Unterstrichen'}</span>${m.col === 'must' ? '' : TOOLS.map(([c, l, h]) => `<button type="button" class="sw" data-recol="${c}" aria-label="${l}" title="${l}"><i style="background:${h}"></i></button>`).join('') + '<span class="sep"></span>'}<button type="button" class="sbtn lt" data-do="del">Entfernen</button><button type="button" class="sx" data-do="close" aria-label="Schließen">✕</button>`;
    pop.hidden = false; const Z = zf(); const r = mk.getBoundingClientRect(); const w = pop.offsetWidth * Z, h = pop.offsetHeight * Z;
    let x = Math.max(8, Math.min(r.left + r.width / 2 - w / 2, window.innerWidth - w - 8)); let y = r.top - h - 8; if (y < 8) y = r.bottom + 8;
    pop.style.left = (x / Z) + 'px'; pop.style.top = (y / Z) + 'px';
  });
  pop.addEventListener('click', e => {
    const b = e.target.closest('button'); if (!b || !POPM) return; const { id, k, m } = POPM;
    if (b.dataset.recol) { m.col = b.dataset.recol; m.ts = Date.now(); mySave('m', id); }
    if (b.dataset.do === 'del') { m.del = 1; m.ts = Date.now(); mySave('m', id); }
    pop.hidden = true; POPM = null; paintMarks(id, k);
  });
  window.addEventListener('hashchange', () => { pop.hidden = true; closeGen(); });
  window.addEventListener('scroll', () => { if (!pop.hidden) { pop.hidden = true; POPM = null; } }, { passive: true });

  /* Toast */
  const toastEl = document.createElement('div'); toastEl.className = 'toast'; toastEl.setAttribute('role', 'status'); toastEl.hidden = true; document.body.appendChild(toastEl);
  let toastT = null;
  function toast(html, ms) { toastEl.innerHTML = html; toastEl.hidden = false; clearTimeout(toastT); if (ms !== 0) toastT = setTimeout(() => toastEl.hidden = true, ms || 6000); }
  toastEl.addEventListener('click', e => { if (e.target.closest('a,button')) setTimeout(() => toastEl.hidden = true, 50); });

  /* Fragen erzeugen */
  let SAMPLE = undefined;
  async function getSample() { if (SAMPLE !== undefined) return SAMPLE; SAMPLE = (window.claude && window.claude.use) ? await window.claude.use('sample') : null; return SAMPLE; }
  function collectInput(id, k) {
    const root = document.querySelector('.lern'); const d = data(id);
    let secs = selSections(id, k); const all = !secs.length;
    const n = root ? Math.max(1, headings(root).length) : 1;
    if (all) secs = [...Array(n).keys()];
    const parts = secs.map(h => ({ h, title: headTitle(root, h) || d.secs[k].t, text: root ? sectionText(root, h) : '' }));
    const musts = myLive(MY.m[id]).filter(m => m.k === k && m.col === 'must');
    const unders = myLive(MY.m[id]).filter(m => m.k === k && m.col !== 'must' && secs.includes(m.h || 0));
    return { secs, all, parts, musts, unders };
  }
  function buildPrompt(id, k, n, inp) {
    const s = BYID[id], d = data(id), sec = d.secs[k]; const wf = id === 'gesch';
    let budget = 14000; const txt = inp.parts.map(p => { const t = p.text.slice(0, Math.max(800, Math.floor(budget / inp.parts.length))); return `### ${p.title}\n${t}`; }).join('\n\n');
    const have = d.qs.filter(q => inSec(d, q, k) && !q.hide).slice(-80).map(q => '- ' + q.q.slice(0, 140));
    return `Du erstellst Übungsfragen für eine Studentin der Gesundheits- und Krankenpflege (FH Salzburg, Österreich), zur Prüfungsvorbereitung.
Fach: ${s.name}. Kapitel: ${sec.t}.

AUSGEWÄHLTE ABSCHNITTE (einzige Quelle für die Fragen):
"""${txt}"""
${inp.musts.length ? `
MUSS VORKOMMEN – von der Studentin angestrichen. Zu JEDER dieser Stellen mindestens eine Frage:
${inp.musts.map((m, i) => `${i + 1}. ${m.t.replace(/\s+/g, ' ').slice(0, 500)}`).join('\n')}
`: ''}${inp.unders.length ? `
Zusätzlich unterstrichen (wichtig, bevorzugt abfragen):
${inp.unders.map(m => '- ' + m.t.replace(/\s+/g, ' ').slice(0, 300)).join('\n')}
`: ''}
SCHON VORHANDENE FRAGEN (nicht wiederholen, keine Umformulierungen davon):
${have.join('\n') || '- keine'}

Erstelle GENAU ${n} neue Fragen auf Deutsch (österreichische Schreibweise).
- Jede Frage muss sich eindeutig aus den ausgewählten Abschnitten beantworten lassen. Nichts erfinden.
- Verteile die Fragen auf alle ausgewählten Abschnitte.
- ${wf ? 'Mische Single Choice ("typ":"sc") und Wahr/Falsch ("typ":"wf"), etwa halb-halb, wie in der Prüfung.' : 'Alle Fragen sind Single Choice ("typ":"sc").'}
- Single Choice: genau eine richtige Antwort, drei falsche aber plausible Antworten in gleichem Stil und ähnlicher Länge, kein "alle/keine der genannten".
- Wahr/Falsch: eine klare Aussage, "wahr": true oder false; etwa gleich viele wahre und falsche.
- "abschnitt": die Überschrift des Abschnitts, aus dem die Frage stammt (genau wie oben nach ###).
- Zu jeder Frage eine kurze Erklärung (1–2 Sätze) mit dem Inhalt aus dem Text.
Antworte NUR mit JSON in genau dieser Form:
{"fragen":[{"typ":"sc","abschnitt":"…","frage":"…","richtig":"…","falsch":["…","…","…"],"erklaerung":"…"}${wf ? ',{"typ":"wf","abschnitt":"…","frage":"…","wahr":true,"erklaerung":"…"}' : ''}]}`;
  }
  async function runGen(sample, prompt, signal) {
    let v;
    if (typeof sample.json === 'function') v = await sample.json(prompt, { signal, modelTier: 'default' });
    else { const r = await sample(prompt, { signal, modelTier: 'default' }); const mm = (r.text || '').match(/\{[\s\S]*\}/); v = mm ? JSON.parse(mm[0]) : null; }
    if (typeof v === 'string') { const mm = v.match(/\{[\s\S]*\}/); v = mm ? JSON.parse(mm[0]) : null; }
    const arr = (v && Array.isArray(v.fragen)) ? v.fragen : Array.isArray(v) ? v : [];
    const items = arr.map(x => {
      if (!x || !x.frage) return null; const hd = String(x.abschnitt || '');
      if (x.typ === 'wf' && typeof x.wahr === 'boolean') return { typ: 'wf', hd, frage: String(x.frage), wahr: x.wahr, erklaerung: String(x.erklaerung || '') };
      if (x.richtig && Array.isArray(x.falsch) && x.falsch.length >= 3) return { typ: 'sc', hd, frage: String(x.frage), richtig: String(x.richtig), falsch: x.falsch.slice(0, 3).map(String), erklaerung: String(x.erklaerung || '') };
      return null;
    }).filter(Boolean);
    if (!items.length) throw { code: 'format' };
    return items;
  }
  function saveItems(id, k, items, auto) {
    const L = (MY.q[id] = MY.q[id] || []); let c = Date.now();
    items.forEach(it => {
      const base = { id: newId('q'), kind: 'ki', auto: auto ? 1 : 0, k, hd: it.hd, q: it.frage, e: it.erklaerung, c: c++, ts: Date.now() };
      L.push(it.typ === 'wf' ? { ...base, y: 'tf', tf: it.wahr ? 1 : 0, o: [] } : { ...base, o: [[it.richtig, 1], ...it.falsch.map(f => [f, 0])] });
    });
    mySave('q', id); ownSync(id);
  }
  function genSig(id, k, inp) { return JSON.stringify([inp.secs, inp.musts.map(m => m.id).sort()]); }
  function errText(e) { return e && e.code === 'not_granted' ? 'Die KI-Funktion wurde nicht freigegeben.' : e && e.code === 'rate_limited' ? 'Gerade zu viele Anfragen, bitte gleich nochmal versuchen.' : 'Das Erzeugen hat nicht geklappt.'; }
  /* automatisch beim Wechsel ins nächste Kapitel */
  const RUNNING = new Set();
  async function autoGen(id, k) {
    const sel = selSections(id, k); if (!sel.length) return;
    const inp = collectInput(id, k); const sig = genSig(id, k, inp);
    const prev = (MY.g[id] || []).find(x => x.id === 'k' + k); if (prev && prev.sig === sig) return;
    if (RUNNING.has(id + ':' + k)) return; RUNNING.add(id + ':' + k);
    const n = Math.min(20, Math.max(UI.n || 10, inp.musts.length)); const sec = data(id).secs[k];
    const sample = await getSample();
    if (!sample) { RUNNING.delete(id + ':' + k); toast('Neue Fragen konnten nicht erzeugt werden: Die KI-Funktion ist hier gerade nicht verfügbar.'); return; }
    toast(`<span class="spin"></span> Claude erstellt ${n} Fragen zu Kapitel ${k + 1} „${E(sec.t)}“ … du kannst weiterlesen.`, 0);
    try {
      const items = await runGen(sample, buildPrompt(id, k, n, inp));
      saveItems(id, k, items, true);
      const G = (MY.g[id] = MY.g[id] || []); let g = G.find(x => x.id === 'k' + k); if (!g) { g = { id: 'k' + k, k, c: Date.now() }; G.push(g); } g.sig = sig; g.ts = Date.now(); mySave('g', id);
      toast(`✓ ${items.length} neue Fragen zu Kapitel ${k + 1} gespeichert. <a href="#f-${id}-lern-${k}">Ansehen</a> · <button type="button" data-act="ownquiz" data-id="${id}" data-k="${k}">Gleich üben</button>`, 12000);
      const cl = curLern(); if (cl && cl.id === id && cl.k === k) rerenderBelow();
    } catch (e) { toast(`${errText(e)} <button type="button" data-act="gennew" data-id="${id}" data-k="${k}">Nochmal</button>`, 12000); }
    RUNNING.delete(id + ':' + k);
  }
  function updGenInfo(id, k) { const el = document.querySelector('.geninfo'); if (el) el.innerHTML = genInfo(id, k); }
  function genInfo(id, k) {
    const sel = selSections(id, k); const nm = myLive(MY.m[id]).filter(m => m.k === k && m.col === 'must').length;
    if (!sel.length) return `Hak bei den Überschriften die Abschnitte ab, zu denen du Fragen willst, oder streich mit dem 🖌 Pinsel an, was unbedingt vorkommen muss. Beim Wechsel ins nächste Kapitel erstellt Claude dann automatisch Fragen.`;
    const n = Math.min(20, Math.max(UI.n || 10, nm));
    const prev = (MY.g[id] || []).find(x => x.id === 'k' + k); const done = prev && prev.sig === genSig(id, k, collectInput(id, k));
    return done ? `✓ Zu deiner aktuellen Auswahl wurden schon Fragen erzeugt. Wenn du etwas abhakst oder anstreichst, werden beim nächsten Wechsel neue erstellt.`
      : `<b>${sel.length} Abschnitt${sel.length === 1 ? '' : 'e'}</b> ausgewählt${nm ? `, <b>${nm} angestrichene Stelle${nm === 1 ? '' : 'n'}</b>` : ''}. Beim Klick auf <b>„Weiter“</b> unten erstellt Claude automatisch <b>${n} Fragen</b> dazu.`;
  }

  /* Dialog: jetzt erzeugen (mit Vorschau) */
  let GEN = null;
  function closeGen() { const g = document.getElementById('qgen'); if (g) g.remove(); if (GEN && GEN.ctl) try { GEN.ctl.abort(); } catch (e) { } GEN = null; document.body.classList.remove('noscroll'); }
  function openGen(id, k) {
    closeGen();
    GEN = { id, k, n: UI.n || 10, items: null, pick: new Set(), busy: false, err: '', saved: 0, inp: collectInput(id, k) };
    const g = document.createElement('div'); g.id = 'qgen'; g.className = 'qgen'; g.setAttribute('role', 'dialog'); g.setAttribute('aria-modal', 'true'); g.setAttribute('aria-label', 'Neue Fragen erzeugen');
    document.body.appendChild(g); document.body.classList.add('noscroll');
    g.addEventListener('click', genClick);
    renderGen();
    getSample().then(s => { if (GEN) { GEN.sample = s; GEN.checked = true; renderGen(); } });
  }
  function itemHtml(it, i) {
    const on = GEN.pick.has(i);
    const ans = it.typ === 'wf' ? `<li class="ok">${it.wahr ? '✅ Wahr' : '✅ Falsch'}</li>` : `<li class="ok">✅ ${E(it.richtig)}</li>${it.falsch.map(f => `<li>❌ ${E(f)}</li>`).join('')}`;
    return `<li class="gitem${on ? ' on' : ''}"><label><input type="checkbox" data-pick="${i}"${on ? ' checked' : ''}><span><span class="tag">${it.typ === 'wf' ? 'Wahr/Falsch' : 'Single Choice'}</span>${it.hd ? ` <span class="small">${E(it.hd)}</span>` : ''} <b>${E(it.frage)}</b><ul class="gopts">${ans}</ul>${it.erklaerung ? `<span class="small">${E(it.erklaerung)}</span>` : ''}</span></label></li>`;
  }
  function renderGen() {
    const g = document.getElementById('qgen'); if (!g || !GEN) return;
    const { id, k, inp } = GEN, s = BYID[id], sec = data(id).secs[k];
    const n = Math.min(20, Math.max(GEN.n, inp.musts.length));
    const scope = inp.all ? 'das <b>ganze Kapitel</b> (keine Abschnitte abgehakt)' : `<b>${inp.secs.length} abgehakte Abschnitt${inp.secs.length === 1 ? '' : 'e'}</b>: ${inp.parts.map(p => E(p.title)).join(' · ')}`;
    let body = '';
    if (GEN.checked && !GEN.sample) { body = `<div class="gerr">Die KI-Funktion ist in dieser Ansicht gerade nicht verfügbar (z. B. nicht angemeldet oder offline). Alternativ: Schreib mir im Chat, zu welchen Kapiteln du neue Fragen willst.</div>`; }
    else if (GEN.busy) { body = `<div class="gload"><span class="spin"></span> Claude schreibt ${n} Fragen … das dauert etwa ${Math.round(n * 1.5 + 8)} Sekunden.</div>`; }
    else if (GEN.items) {
      body = `<p class="small" style="margin:0">Hak ab, welche Fragen du behalten willst. Alles Falsche oder Unklare einfach abwählen.</p><ol class="glist">${GEN.items.map(itemHtml).join('')}</ol>
      <div class="gact"><button type="button" class="btn lt" data-g="gen">Neue Auswahl erzeugen</button><button type="button" class="btn" data-g="save"${GEN.pick.size ? '' : ' disabled'}>${GEN.pick.size} ${GEN.pick.size === 1 ? 'Frage' : 'Fragen'} speichern</button></div>`;
    }
    else {
      body = `<p class="small" style="margin:0">Grundlage: ${scope}.${inp.musts.length ? ` Zu deinen <b>${inp.musts.length} angestrichenen Stellen</b> kommt sicher je mindestens eine Frage.` : ''}${inp.unders.length ? ` Unterstrichenes wird bevorzugt.` : ''} ${id === 'gesch' ? 'Format: Single Choice und Wahr/Falsch.' : 'Format: Single Choice mit vier Antworten.'}</p>
      <div><span class="lbl muted">Wie viele Fragen? (gilt auch für das automatische Erzeugen)</span><div class="seg gcount">${[5, 10, 15, 20].map(x => `<button type="button" data-gn="${x}" aria-pressed="${GEN.n === x}">${x}</button>`).join('')}</div></div>
      ${GEN.err ? `<div class="gerr">${E(GEN.err)}</div>` : ''}<div class="gact"><button type="button" class="btn" data-g="gen">✨ ${n} Fragen erzeugen</button></div>`;
    }
    g.innerHTML = `<div class="gbox"><div class="ghead"><div><span class="lbl" style="color:${s.ink}">${E(s.name)} · Kapitel ${k + 1}</span><h2>Neue Fragen: ${E(sec.t)}</h2></div><button type="button" class="sx" data-g="close" aria-label="Schließen">✕</button></div>
    ${body}${GEN.saved ? `<div class="gsaved">✓ ${GEN.saved} ${GEN.saved === 1 ? 'Frage' : 'Fragen'} gespeichert unter „Meine Fragen“. Du findest sie unten im Kapitel und im Quiz.</div>` : ''}</div>`;
  }
  async function kiGen() {
    const { id, k, inp } = GEN; const n = Math.min(20, Math.max(GEN.n, inp.musts.length));
    GEN.busy = true; GEN.err = ''; GEN.items = null; GEN.saved = 0; renderGen();
    try { GEN.ctl = new AbortController(); const items = await runGen(GEN.sample, buildPrompt(id, k, n, inp), GEN.ctl.signal); if (!GEN) return; GEN.items = items; GEN.pick = new Set(items.map((_, i) => i)); }
    catch (e) { if (!GEN) return; GEN.err = e && e.name === 'AbortError' ? '' : errText(e) + ' Bitte nochmal versuchen, eventuell mit weniger Fragen.'; }
    if (GEN) { GEN.busy = false; renderGen(); }
  }
  function genClick(e) {
    if (e.target.id === 'qgen') { if (!GEN || !GEN.busy) closeGen(); return; }
    const cb = e.target.closest('input[data-pick]'); if (cb && GEN) { const i = +cb.dataset.pick; cb.checked ? GEN.pick.add(i) : GEN.pick.delete(i); const li = cb.closest('.gitem'); if (li) li.classList.toggle('on', cb.checked); const sv = document.querySelector('#qgen [data-g="save"]'); if (sv) { sv.disabled = !GEN.pick.size; sv.textContent = `${GEN.pick.size} ${GEN.pick.size === 1 ? 'Frage' : 'Fragen'} speichern`; } return; }
    const b = e.target.closest('button'); if (!b || !GEN) return;
    if (b.dataset.g === 'close') { closeGen(); return; }
    if (b.dataset.gn) { GEN.n = +b.dataset.gn; UI.n = GEN.n; uiSave(); renderGen(); const cl = curLern(); if (cl) updGenInfo(cl.id, cl.k); return; }
    if (b.dataset.g === 'gen') { if (!GEN.busy) kiGen(); return; }
    if (b.dataset.g === 'save' && GEN.items) {
      const { id, k, inp } = GEN; const items = GEN.items.filter((_, i) => GEN.pick.has(i));
      saveItems(id, k, items, false);
      const G = (MY.g[id] = MY.g[id] || []); let g = G.find(x => x.id === 'k' + k); if (!g) { g = { id: 'k' + k, k, c: Date.now() }; G.push(g); } g.sig = genSig(id, k, inp); g.ts = Date.now(); mySave('g', id);
      GEN.items = null; GEN.pick = new Set(); GEN.saved = items.length; renderGen(); rerenderBelow(); return;
    }
  }
  function rerenderBelow() { const box = document.querySelector('.mybox'); if (!box) return; const cl = curLern(); if (cl) { box.outerHTML = myBox(cl.id, cl.k); updSyncTag(); } }

  /* Box unter dem Kapitel */
  function myBox(id, k) {
    const qs = (MY.q[id] || []).filter(x => !x.del && x.k === k);
    const nm = myLive(MY.m[id]).filter(m => m.k === k).length;
    const list = qs.map(x => `<li><span class="mq">${x.y === 'tf' ? '⚖️' : '✨'} ${E(x.q)}</span><button type="button" class="mdel" data-act="owndel" data-id="${id}" data-q="${x.id}" aria-label="Frage löschen">Löschen</button></li>`).join('');
    return `<section class="mybox"><div class="myhead"><h3>Deine Markierungen & Fragen</h3><span class="synctag small">${syncText()}</span></div>
  <p class="geninfo small" style="margin:0">${genInfo(id, k)}</p>
  <div class="mystat"><span class="tag">${nm} Markierung${nm === 1 ? '' : 'en'}</span><span class="tag">${qs.length} eigene Frage${qs.length === 1 ? '' : 'n'}</span><button type="button" class="btn lt mini" data-act="gennew" data-id="${id}" data-k="${k}">✨ Jetzt erzeugen (mit Vorschau)</button>${nm ? `<button type="button" class="btn lt mini" data-act="owndelmarks" data-id="${id}" data-k="${k}">Alle Markierungen dieses Kapitels löschen</button>` : ''}</div>
  ${qs.length ? `<details class="myq"><summary>Meine Fragen zu diesem Kapitel (${qs.length})</summary><ul class="mylist">${list}</ul></details><button type="button" class="btn" data-act="ownquiz" data-id="${id}" data-k="${k}">${svg('quiz', '#FFFFFF', 18)}Meine Fragen üben (${qs.length})</button>` : ''}</section>`;
  }
  mySyncInit();


  /* ---------- Passwort-Sperre (Sichtschutz) ---------- */
  const GATE = { h: '42c227800ed8b00e220e7b6a11c0cc3fac243ad7de58d56a481c8caacbc1cdb9', db: null, owner: false, open: false };
  function sha256hex(str) { // kompakte SHA-256 (funktioniert auch offline / ohne crypto.subtle)
    const K = [0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5, 0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174, 0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da, 0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967, 0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85, 0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070, 0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3, 0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2];
    const b = new TextEncoder().encode(str), l = b.length, n = ((l + 9 + 63) >> 6) << 6, m = new Uint8Array(n); m.set(b); m[l] = 0x80; const bl = l * 8; for (let i = 0; i < 8; i++) m[n - 1 - i] = Math.floor(bl / Math.pow(2, 8 * i)) & 255;
    let H = [0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a, 0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19]; const w = new Uint32Array(64), r = (x, k) => (x >>> k) | (x << (32 - k));
    for (let o = 0; o < n; o += 64) {
      for (let i = 0; i < 16; i++) w[i] = (m[o + 4 * i] << 24) | (m[o + 4 * i + 1] << 16) | (m[o + 4 * i + 2] << 8) | m[o + 4 * i + 3];
      for (let i = 16; i < 64; i++) { const s0 = r(w[i - 15], 7) ^ r(w[i - 15], 18) ^ (w[i - 15] >>> 3), s1 = r(w[i - 2], 17) ^ r(w[i - 2], 19) ^ (w[i - 2] >>> 10); w[i] = (w[i - 16] + s0 + w[i - 7] + s1) | 0; }
      let [a, bb, c, d, e, f, g, h] = H; for (let i = 0; i < 64; i++) { const S1 = r(e, 6) ^ r(e, 11) ^ r(e, 25), ch = (e & f) ^ (~e & g), t1 = (h + S1 + ch + K[i] + w[i]) | 0, S0 = r(a, 2) ^ r(a, 13) ^ r(a, 22), mj = (a & bb) ^ (a & c) ^ (bb & c), t2 = (S0 + mj) | 0; h = g; g = f; f = e; e = (d + t1) | 0; d = c; c = bb; bb = a; a = (t1 + t2) | 0; }
      H = [H[0] + a, H[1] + bb, H[2] + c, H[3] + d, H[4] + e, H[5] + f, H[6] + g, H[7] + h].map(x => x | 0);
    }
    return H.map(x => (x >>> 0).toString(16).padStart(8, '0')).join('');
  }
  const gateHash = pw => sha256hex('lp-guk|' + String(pw).trim().toLowerCase());
  function gateStored() { try { return localStorage.getItem('lp-gate'); } catch (e) { return null; } }
  function gateUnlock() { GATE.open = true; const g = document.getElementById('gate'); if (g) g.remove(); document.body.classList.remove('gated'); route(); }
  function gateLock(msg) {
    GATE.open = false; document.body.classList.add('gated'); $app.innerHTML = ''; let g = document.getElementById('gate');
    if (!g) {
      g = document.createElement('div'); g.id = 'gate'; g.innerHTML = `<div class="gcard"><div class="gicon" aria-hidden="true">🔒</div><h1>Lernportal GuK</h1><p class="small">Bitte Passwort eingeben.</p><label class="sr" for="gpw">Passwort</label><input id="gpw" type="password" placeholder="Passwort" autocomplete="current-password"><button class="btn" type="button" id="gok">Öffnen</button><p class="gmsg" role="alert"></p></div>`; document.body.appendChild(g);
      const tryOpen = () => { const v = g.querySelector('#gpw').value; const h = gateHash(v); if (h === GATE.h) { try { localStorage.setItem('lp-gate', h); } catch (_) { } gateUnlock(); } else { g.querySelector('.gmsg').textContent = 'Das Passwort stimmt nicht.'; g.querySelector('#gpw').select(); } };
      g.querySelector('#gok').addEventListener('click', tryOpen); g.querySelector('#gpw').addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); tryOpen(); } });
    }
    g.querySelector('.gmsg').textContent = msg || ''; setTimeout(() => { try { g.querySelector('#gpw').focus(); } catch (e) { } }, 50);
  }
  function gateCheck() { if (GATE.owner || gateStored() === GATE.h) { if (!GATE.open) gateUnlock(); } else gateLock(GATE.open ? 'Das Passwort wurde geändert – bitte das neue eingeben.' : ''); }
  function gateOwnerBtn() {
    if (document.getElementById('gateAdm')) return; const b = document.createElement('button'); b.id = 'gateAdm'; b.type = 'button'; b.className = 'btn lt'; b.textContent = '🔒 Passwort ändern'; b.title = 'Nur du siehst diesen Knopf'; document.body.appendChild(b);
    b.addEventListener('click', () => {
      let d = document.getElementById('gateDlg'); if (d) { d.remove(); return; } d = document.createElement('div'); d.id = 'gateDlg'; d.setAttribute('role', 'dialog'); d.setAttribute('aria-label', 'Passwort ändern');
      d.innerHTML = `<div class="gcard"><h2 class="h2" style="font-size:20px;margin:0">Passwort ändern</h2><p class="small" style="margin:0">Gilt sofort für alle, die angemeldet sind. Wer das neue Passwort nicht hat, ist draußen.</p><label class="small" for="gn1">Neues Passwort</label><input id="gn1" type="password" autocomplete="new-password"><label class="small" for="gn2">Wiederholen</label><input id="gn2" type="password" autocomplete="new-password"><div style="display:flex;gap:8px;justify-content:flex-end"><button type="button" class="btn lt" data-x>Abbrechen</button><button class="btn" type="button" id="gsave">Speichern</button></div><p class="gmsg" role="alert"></p></div>`;
      document.body.appendChild(d); d.querySelector('[data-x]').addEventListener('click', () => d.remove()); setTimeout(() => d.querySelector('#gn1').focus(), 30);
      const save = async () => {
        const a = d.querySelector('#gn1').value, c = d.querySelector('#gn2').value, msg = d.querySelector('.gmsg');
        if (a.trim().length < 4) { msg.textContent = 'Bitte mindestens 4 Zeichen.'; return; } if (a.trim() !== c.trim()) { msg.textContent = 'Die beiden Eingaben sind verschieden.'; return; }
        try { const h = gateHash(a); await GATE.db.doc('config/gate').set({ h, ts: Date.now() }); GATE.h = h; try { localStorage.setItem('lp-gate', h); } catch (_) { } msg.textContent = 'Gespeichert ✓'; setTimeout(() => d.remove(), 900); }
        catch (err) { msg.textContent = 'Speichern hat nicht geklappt – bitte nochmal versuchen.'; }
      };
      d.querySelector('#gsave').addEventListener('click', save); d.querySelector('#gn2').addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); save(); } });
    });
  }
  async function gateInit() {
    gateCheck();
    try {
      if (!window.claude || !window.claude.use) return; const [db, user] = await Promise.all([window.claude.use('db'), window.claude.use('user')]);
      if (user && user.isOwner && user.isOwner()) { GATE.owner = true; }
      if (db) {
        GATE.db = db; const ref = db.doc('config/gate'); const apply = snap => { const d = snap && snap.exists ? snap.data() : null; if (d && typeof d.h === 'string' && d.h.length === 64) GATE.h = d.h; gateCheck(); };
        try { apply(await ref.get()); } catch (e) { } try { ref.onSnapshot(apply); } catch (e) { }
      }
      if (GATE.owner && db) gateOwnerBtn(); gateCheck();
    } catch (e) { }
  }
  /* ---------- Firebase-Lernstandssynchronisierung ---------- */
  const PROG = { auth: null, db: null, user: null, doc: null, state: 'off', timer: null, busy: false, again: false, lastTs: 0, generation: 0, unsubscribe: null, error: '' };
  const OWNER_KEY = 'lp-sync-uid';
  const CACHE_PREFIX = 'lp-sync-cache-';
  function progChip() {
    let c = document.getElementById('nickChip');
    if (!c) { c = document.createElement('button'); c.id = 'nickChip'; c.type = 'button'; c.className = 'btn lt'; c.addEventListener('click', accountDialog); document.body.appendChild(c); }
    const status = PROG.state === 'cloud' ? 'synchronisiert ✓' : PROG.state === 'saving' ? 'speichert …' : PROG.state === 'loading' ? 'lädt …' : PROG.state === 'error' ? 'Sync fehlgeschlagen' : 'nur lokal';
    c.textContent = (PROG.user ? '👤 ' + PROG.user.email + ' · ' : '☁️ Konto / Synchronisierung · ') + status;
    c.title = PROG.user ? 'Konto und Lernstand-Synchronisierung verwalten' : 'Mit Konto anmelden, um den Lernstand zu synchronisieren';
  }
  function progMerge(a, b) { /* a = neuerer Stand (Basis), b = älterer: Erledigtes aus b bleibt erhalten */
    const m = JSON.parse(JSON.stringify(a || {})); b = b || {};
    ['ok', 'seen', 'read', 'ptsBy', 'best'].forEach(f => {
      const A = m[f] = m[f] || {}, B = b[f] || {};
      Object.keys(B).forEach(id => { if (typeof B[id] === 'object' && B[id]) { A[id] = A[id] || {}; Object.keys(B[id]).forEach(k => { if (A[id][k] == null) A[id][k] = B[id][k]; }); } else if (A[id] == null || (typeof B[id] === 'number' && B[id] > A[id])) A[id] = B[id]; });
    });
    ['pdone', 'srs', 'exams'].forEach(f => { const A = m[f] = m[f] || {}, B = b[f] || {}; Object.keys(B).forEach(k => { if (A[k] == null) A[k] = B[k]; }); });
    const wrong = m.wrong = m.wrong || {};
    Object.keys(b.wrong || {}).forEach(k => { wrong[k] = Math.max(wrong[k] || 0, b.wrong[k] || 0); });
    m.hist = [...new Map([...(m.hist || []), ...(b.hist || [])].map(h => [h.t, h])).values()].sort((x, y) => x.t - y.t).slice(-200);
    const daily = m.daily = m.daily || {};
    Object.keys(b.daily || {}).forEach(k => { daily[k] = Math.max(daily[k] || 0, b.daily[k] || 0); });
    Object.keys(daily).sort().slice(0, Math.max(0, Object.keys(daily).length - 120)).forEach(k => delete daily[k]);
    if (m.today && b.today && m.today.d === b.today.d) m.today.n = Math.max(m.today.n || 0, b.today.n || 0);
    m.days = [...new Set([...(m.days || []), ...(b.days || [])])].sort().slice(-400);
    m.pts = Math.max(m.pts || 0, b.pts || 0);
    return m;
  }
  function progApply(remote, mergeLocal) {
    const local = JSON.parse(JSON.stringify(st));
    const rs = remote.st || {}; if (rs.ok) { migKl1(rs); migHyg(rs); migGesch4(rs); }
    const merged = mergeLocal ? ((rs._ts || 0) >= (local._ts || 0) ? progMerge(rs, local) : progMerge(local, rs)) : progMerge(rs, {});
    Object.keys(st).forEach(k => delete st[k]); Object.assign(st, merged);
    const rseen = remote.seen || {};
    if (mergeLocal) Object.keys(rseen).forEach(k => { if (!SEEN[k] || rseen[k] > SEEN[k]) SEEN[k] = rseen[k]; });
    else SEEN = rseen;
    try { localStorage.setItem(KEY, JSON.stringify(st)); localStorage.setItem(SEENK, JSON.stringify(SEEN)); } catch (e) { }
  }
  function progPush() { if (!PROG || !PROG.db || !PROG.user || PROG.state === 'loading') return; clearTimeout(PROG.timer); PROG.timer = setTimeout(progFlush, 1500); }
  async function progFlush() {
    if (!PROG.db || !PROG.user || !PROG.doc) return; if (PROG.busy) { PROG.again = true; return; }
    const doc = PROG.doc;
    PROG.busy = true; PROG.state = 'saving'; progChip();
    try { const ts = Date.now(); await doc.set({ st, seen: SEEN, ts, v: 1 }); if (PROG.doc === doc) { PROG.lastTs = ts; PROG.error = ''; PROG.state = 'cloud'; } }
    catch (e) { if (PROG.doc === doc) { PROG.error = firebaseError(e); PROG.state = 'error'; } }
    if (PROG.doc === doc) { PROG.busy = false; progChip(); if (PROG.again) { PROG.again = false; progPush(); } }
  }
  async function progSignIn(user, generation) {
    if (!PROG.db || !user) return;
    PROG.user = user; PROG.doc = PROG.db.collection('users').doc(user.uid);
    PROG.state = 'loading'; PROG.error = ''; progChip();
    try {
      let owner = null; try { owner = localStorage.getItem(OWNER_KEY); } catch (e) { }
      let sameOwner = !owner || owner === user.uid;
      if (owner && owner !== user.uid) {
        try { localStorage.setItem(CACHE_PREFIX + owner, JSON.stringify({ st, seen: SEEN })); } catch (e) { }
        let cached = null; try { cached = JSON.parse(localStorage.getItem(CACHE_PREFIX + user.uid) || 'null'); } catch (e) { }
        st = cached && cached.st ? Object.assign(freshState(), cached.st) : freshState();
        SEEN = cached && cached.seen ? cached.seen : {};
        sameOwner = !!(cached && cached.st);
        try { localStorage.setItem(KEY, JSON.stringify(st)); localStorage.setItem(SEENK, JSON.stringify(SEEN)); } catch (e) { }
      }
      const snap = await PROG.doc.get();
      if (generation !== PROG.generation) return;
      let needsUpload = false;
      if (snap.exists && snap.data().st) {
        const remote = snap.data(); progApply(remote, sameOwner); PROG.lastTs = remote.ts || 0;
        if (GATE.open && !/quiz|pruefung|karten|zuordnen|spiel/.test(location.hash)) route(true);
        needsUpload = sameOwner && (st._ts || 0) > PROG.lastTs;
      } else {
        if (!sameOwner) {
          st = freshState(); SEEN = {};
          try { localStorage.setItem(KEY, JSON.stringify(st)); localStorage.setItem(SEENK, '{}'); } catch (e) { }
        }
        PROG.lastTs = 0; PROG.state = 'cloud'; progPush();
      }
      try { localStorage.setItem(OWNER_KEY, user.uid); } catch (e) { }
      PROG.unsubscribe = PROG.doc.onSnapshot(s => {
        if (generation !== PROG.generation || !s.exists) return;
        const remote = s.data();
        if (!remote.st || (remote.ts || 0) <= PROG.lastTs) return;
        const localTs = st._ts || 0; progApply(remote, true); PROG.lastTs = remote.ts || 0; PROG.error = ''; PROG.state = 'cloud'; progChip();
        if (localTs > PROG.lastTs) progPush();
        if (GATE.open && !/quiz|pruefung|karten|zuordnen|spiel/.test(location.hash)) route(true);
      }, e => { PROG.error = firebaseError(e); PROG.state = 'error'; progChip(); });
      PROG.state = 'cloud'; progChip();
      if (needsUpload) progPush();
    } catch (e) {
      if (generation !== PROG.generation) return;
      PROG.error = firebaseError(e); PROG.state = 'error'; progChip();
    }
  }
  function firebaseError(e) {
    const messages = {
      'auth/email-already-in-use': 'Für diese E-Mail-Adresse gibt es bereits ein Konto.',
      'auth/invalid-email': 'Bitte eine gültige E-Mail-Adresse eingeben.',
      'auth/invalid-credential': 'E-Mail-Adresse oder Passwort ist nicht korrekt.',
      'auth/invalid-login-credentials': 'E-Mail-Adresse oder Passwort ist nicht korrekt.',
      'auth/weak-password': 'Das Passwort muss mindestens 6 Zeichen lang sein.',
      'auth/too-many-requests': 'Zu viele Versuche. Bitte später erneut probieren.',
      'auth/network-request-failed': 'Keine Verbindung zu Firebase. Bitte Internetverbindung prüfen.',
      'permission-denied': 'Firestore-Zugriff verweigert. Bitte die Sicherheitsregeln prüfen.',
      'unavailable': 'Firebase ist gerade nicht erreichbar. Der Lernstand bleibt lokal gespeichert.'
    };
    return messages[e && e.code] || (e && e.message) || 'Unbekannter Firebase-Fehler.';
  }
  function accountDialog() {
    if (document.getElementById('nickDlg')) return;
    const d = document.createElement('div'); d.id = 'nickDlg'; d.setAttribute('role', 'dialog'); d.setAttribute('aria-label', 'Konto und Synchronisierung');
    if (PROG.user) {
      d.innerHTML = `<div class="gcard"><h2 class="h2" style="font-size:20px;margin:0">Konto</h2><p class="small" style="margin:0">${E(PROG.user.email)}</p><p class="small" style="margin:0">${PROG.state === 'error' ? E(PROG.error) : 'Dein Lernfortschritt wird mit diesem Konto synchronisiert.'}</p><button class="btn" id="accountOut" type="button">Abmelden</button><button class="btn lt" id="accountClose" type="button">Schließen</button></div>`;
      d.querySelector('#accountOut').addEventListener('click', async () => {
        try { await PROG.auth.signOut(); d.remove(); } catch (e) { d.querySelector('.small').textContent = firebaseError(e); }
      });
      d.querySelector('#accountClose').addEventListener('click', () => d.remove());
    } else {
      const config = window.LP_FIREBASE_CONFIG;
      const hasConfig = config && ['apiKey', 'authDomain', 'projectId', 'appId'].every(k => typeof config[k] === 'string' && config[k].trim());
      const configured = !!PROG.auth;
      d.innerHTML = `<div class="gcard"><h2 class="h2" style="font-size:20px;margin:0">Lernstand synchronisieren</h2>${configured
        ? '<p class="small" style="margin:0">Melde dich an oder erstelle ein Konto. Dein lokaler Lernstand wird beim ersten Login mit dem Cloud-Stand zusammengeführt.</p><label class="small" for="accountEmail">E-Mail</label><input id="accountEmail" type="email" autocomplete="email"><label class="small" for="accountPassword">Passwort</label><input id="accountPassword" type="password" autocomplete="current-password"><p class="gmsg" role="alert"></p><button class="btn" id="accountIn" type="button">Anmelden</button><button class="btn lt" id="accountCreate" type="button">Konto erstellen</button><button class="btn lt" id="accountReset" type="button">Passwort zurücksetzen</button>'
        : hasConfig ? '<p class="small" style="margin:0">Das Firebase SDK konnte nicht geladen werden. Prüfe deine Internetverbindung und lade die Seite erneut.</p>'
          : '<p class="small" style="margin:0">Firebase ist noch nicht konfiguriert. Trage die Web-App-Werte in <code>js/firebase-config.js</code> ein und aktiviere E-Mail/Passwort sowie Firestore in der Firebase Console.</p>'}
        <button class="btn lt" id="accountClose" type="button">Schließen</button></div>`;
      d.querySelector('#accountClose').addEventListener('click', () => d.remove());
      if (configured) {
        const error = m => { d.querySelector('.gmsg').textContent = m; };
        const email = () => d.querySelector('#accountEmail').value.trim();
        const password = () => d.querySelector('#accountPassword').value;
        d.querySelector('#accountIn').addEventListener('click', async () => {
          try { await PROG.auth.signInWithEmailAndPassword(email(), password()); d.remove(); }
          catch (e) { error(firebaseError(e)); }
        });
        d.querySelector('#accountCreate').addEventListener('click', async () => {
          try { await PROG.auth.createUserWithEmailAndPassword(email(), password()); d.remove(); }
          catch (e) { error(firebaseError(e)); }
        });
        d.querySelector('#accountReset').addEventListener('click', async () => {
          if (!email()) { error('Bitte zuerst deine E-Mail-Adresse eingeben.'); return; }
          try { await PROG.auth.sendPasswordResetEmail(email()); error('Wenn ein Konto existiert, wurde eine E-Mail zum Zurücksetzen gesendet.'); }
          catch (e) { error(firebaseError(e)); }
        });
        setTimeout(() => d.querySelector('#accountEmail').focus(), 40);
      }
    }
    document.body.appendChild(d);
  }
  function progInit() {
    try {
      const config = window.LP_FIREBASE_CONFIG;
      const valid = config && ['apiKey', 'authDomain', 'projectId', 'appId'].every(k => typeof config[k] === 'string' && config[k].trim());
      if (!valid || !window.firebase || !firebase.auth || !firebase.firestore) { progChip(); return; }
      if (!firebase.apps.length) firebase.initializeApp(config);
      PROG.auth = firebase.auth(); PROG.db = firebase.firestore();
      PROG.auth.setPersistence(firebase.auth.Auth.Persistence.LOCAL).then(() => {
        PROG.auth.onAuthStateChanged(user => {
          PROG.generation++;
          if (PROG.unsubscribe) { PROG.unsubscribe(); PROG.unsubscribe = null; }
          clearTimeout(PROG.timer); PROG.busy = false; PROG.again = false; PROG.lastTs = 0;
          if (!user) { PROG.user = null; PROG.doc = null; PROG.state = 'off'; PROG.error = ''; progChip(); return; }
          progSignIn(user, PROG.generation);
        }, e => { PROG.error = firebaseError(e); PROG.state = 'error'; progChip(); });
      }).catch(e => { PROG.error = firebaseError(e); PROG.state = 'error'; progChip(); });
    } catch (e) { PROG.error = firebaseError(e); PROG.state = 'error'; progChip(); }
  }
  progInit();
  gateInit();
})();

window.addEventListener('message', e => { if (e.data === 'aad-back' && location.hash === '#spiel') { if (document.fullscreenElement) document.exitFullscreen().catch(() => { }); location.hash = '#start'; } });

