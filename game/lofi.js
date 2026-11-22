/* Lo-Fi „Nachtschicht“ – 15 Minuten, festgelegt komponiert, live mit WebAudio gespielt */
const LOFI = (function () {
  const SPB = 16; let BPM = 76, STEP = 60 / BPM / 4, BAR = STEP * SPB; const DEF = { tr: 0, lead: null, cut: 1, crackle: 1, title: 'Nachtschicht', keys: 'rhodes', drums: 'boom', swing: 0.33, minor: 0, amb: null, bassk: 'sub', arp: 0, wob: 7 }; let STY = Object.assign({}, DEF); let crackG = null, rainG = null;
  let ctx = null, out = null, filt = null, keysBus = null, trem = null, wob = null, noise = null, crackle = null;
  let timer = null, step = 0, next = 0, playing = false, vol = 0.6, duck = 1;
  // ---------- Komposition ----------
  function rng(seed) { let s = seed >>> 0 || 1; return () => { s ^= s << 13; s >>>= 0; s ^= s >> 17; s ^= s << 5; s >>>= 0; return s / 4294967296; }; }
  const CH = { I: [0, 4, 7, 11, 14], vi: [9, 12, 16, 19, 23], ii: [2, 5, 9, 12, 16], V: [7, 12, 14, 17, 21], IV: [5, 9, 12, 16, 19], iii: [4, 7, 11, 14, 18], IVm: [5, 8, 12, 15, 19], VI7: [9, 13, 16, 19, 22], iv: [5, 8, 12, 15, 17], bVII: [10, 14, 17, 21, 24], im: [0, 3, 7, 10, 14], bVI: [8, 12, 15, 19, 22], bIII: [3, 7, 10, 14, 17], v: [7, 10, 14, 17, 22] };
  const MIN = { I: 'im', vi: 'bVI', ii: 'iv', V: 'v', IV: 'bVII', iii: 'bIII', IVm: 'iv', VI7: 'bVI', iv: 'iv', bVII: 'bVII' };
  const chOf = n => CH[STY.minor ? (MIN[n] || n) : n];
  const LOOPS = { L1: ['I', 'vi', 'ii', 'V'], L2: ['IV', 'iii', 'vi', 'ii'], L3: ['ii', 'V', 'I', 'IV'], L4: ['IV', 'IVm', 'iii', 'VI7'], L5: ['vi', 'IV', 'I', 'V'], L6: ['IV', 'bVII', 'I', 'vi'] };
  const PARTS = [
    { name: 'Nachtschicht', key: 53, lead: 'ep', seq: [['intro', 4, 'L1'], ['verse', 8, 'L1'], ['verse2', 8, 'L1'], ['chorus', 8, 'L3'], ['verse', 8, 'L2'], ['chorus', 8, 'L3'], ['break', 8, 'L4'], ['verse2', 8, 'L1'], ['chorus', 8, 'L3'], ['chorus2', 8, 'L5'], ['verse', 8, 'L2'], ['break', 4, 'L4'], ['chorus2', 4, 'L3'], ['outro', 3, 'L1']] },
    { name: 'Morgenrunde', key: 51, lead: 'flute', seq: [['intro', 4, 'L2'], ['verse', 8, 'L5'], ['verse2', 8, 'L5'], ['chorus', 8, 'L6'], ['verse', 8, 'L2'], ['chorus', 8, 'L6'], ['break', 8, 'L4'], ['verse2', 8, 'L5'], ['chorus2', 8, 'L6'], ['chorus', 8, 'L3'], ['verse', 8, 'L2'], ['break', 4, 'L4'], ['chorus2', 4, 'L6'], ['outro', 3, 'L5']] },
    { name: 'Feierabend', key: 56, lead: 'box', seq: [['intro', 4, 'L3'], ['verse', 8, 'L3'], ['verse2', 8, 'L1'], ['chorus', 8, 'L2'], ['verse', 8, 'L3'], ['chorus', 8, 'L2'], ['break', 8, 'L4'], ['verse2', 8, 'L1'], ['chorus2', 8, 'L2'], ['chorus', 8, 'L6'], ['verse', 8, 'L3'], ['break', 4, 'L4'], ['chorus2', 4, 'L2'], ['outro', 4, 'L1']] }
  ];
  const BARS = []; // pro Takt: {part, sec, chord, nextChord, key, lead, barInSec, secLen, seed}
  PARTS.forEach((p, pi) => p.seq.forEach(([sec, len, loop], si) => { for (let b = 0; b < len; b++) { const L = LOOPS[loop]; BARS.push({ pi, part: p.name, sec, key: p.key, lead: p.lead, chord: L[b % 4], nextChord: L[(b + 1) % 4], bis: b, len, seed: (pi * 97 + si * 31 + b * 7) + 1 }); } }));
  const TOTAL = BARS.length * SPB;
  const LAY = {
    intro: { keys: 1, drums: 0, bass: 0, mel: 0, pad: 1, cut: 1100 }, verse: { keys: 1, drums: 1, bass: 1, mel: 0, pad: 0, cut: 2600 }, verse2: { keys: 1, drums: 1, bass: 1, mel: 1, pad: 0, cut: 2800 },
    chorus: { keys: 1, drums: 1, bass: 1, mel: 1, pad: 1, cut: 3200 }, chorus2: { keys: 1, drums: 1, bass: 1, mel: 2, pad: 1, cut: 3400 }, break: { keys: 1, drums: 2, bass: 0, mel: 0, pad: 1, cut: 1000 }, outro: { keys: 1, drums: 0, bass: 1, mel: 0, pad: 1, cut: 900 }
  };
  // Melodie-Phrasen je Takt (deterministisch)
  const PENTA = [0, 2, 4, 7, 9, 12, 14, 16];
  function melody(bar) {
    const r = rng(bar.seed * 13 + 5); const ch = chOf(bar.chord); const PEN = STY.minor ? [0, 3, 5, 7, 10, 12, 15, 17] : PENTA; const notes = []; const slots = [0, 3, 6, 8, 10, 12, 14];
    const n = bar.bis % 2 === 0 ? 3 + Math.floor(r() * 2) : 2 + Math.floor(r() * 2); const used = new Set();
    for (let i = 0; i < n; i++) {
      let s = slots[Math.floor(r() * slots.length)]; if (used.has(s)) continue; used.add(s);
      const pool = r() < 0.6 ? ch.map(x => x % 12) : PEN; const iv = pool[Math.floor(r() * pool.length)]; notes.push({ s, iv, d: 1 + Math.floor(r() * 3) });
    }
    return notes.sort((a, b) => a.s - b.s);
  }
  // ---------- Klangerzeuger ----------
  const mtof = m => 440 * Math.pow(2, (m - 69) / 12);
  function env(g, t, a, peak, d, sus, rel, end) { g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(peak, t + a); g.gain.exponentialRampToValueAtTime(Math.max(0.0002, peak * sus), t + a + d); g.gain.setValueAtTime(Math.max(0.0002, peak * sus), end); g.gain.exponentialRampToValueAtTime(0.0001, end + rel); }
  function osc(type, f, t, stop, dest, detuneMod) { const o = ctx.createOscillator(); o.type = type; o.frequency.setValueAtTime(f, t); if (detuneMod) detuneMod.connect(o.detune); o.connect(dest); o.start(t); o.stop(stop); return o; }
  function rhodes(m, t, v, dur) {
    const g = ctx.createGain(); g.connect(keysBus); const end = t + dur; env(g, t, 0.008, 0.085 * v, 0.35, 0.55, 1.2, end);
    osc('sine', mtof(m), t, end + 1.3, g, wob); const g2 = ctx.createGain(); g2.connect(g); g2.gain.setValueAtTime(0.35, t); g2.gain.exponentialRampToValueAtTime(0.01, t + 0.25); osc('sine', mtof(m) * 2, t, t + 0.3, g2, wob);
    const g3 = ctx.createGain(); g3.gain.value = 0.22; g3.connect(g); osc('triangle', mtof(m) * 1.002, t, end + 1.3, g3, wob);
  }
  function piano(m, t, v, dur) { const g = ctx.createGain(); g.connect(keysBus); env(g, t, 0.004, 0.1 * v, 0.6, 0.18, 0.5, t + Math.min(dur, 0.9)); osc('triangle', mtof(m), t, t + 2, g, wob); const g2 = ctx.createGain(); g2.gain.setValueAtTime(0.5, t); g2.gain.exponentialRampToValueAtTime(0.01, t + 0.4); g2.connect(g); osc('sine', mtof(m) * 2.002, t, t + 0.5, g2); const g3 = ctx.createGain(); g3.gain.setValueAtTime(0.18, t); g3.gain.exponentialRampToValueAtTime(0.005, t + 0.2); g3.connect(g); osc('square', mtof(m) * 3, t, t + 0.25, g3); }
  function kalimba(m, t, v) { m += 12; const g = ctx.createGain(); g.connect(keysBus); env(g, t, 0.002, 0.09 * v, 0.25, 0.08, 0.6, t + 0.15); osc('sine', mtof(m), t, t + 1.1, g); const g2 = ctx.createGain(); g2.gain.setValueAtTime(0.35, t); g2.gain.exponentialRampToValueAtTime(0.004, t + 0.12); g2.connect(g); osc('sine', mtof(m) * 5.4, t, t + 0.2, g2); }
  function guitar(m, t, v) { const g = ctx.createGain(); const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.setValueAtTime(3200, t); lp.frequency.exponentialRampToValueAtTime(500, t + 0.6); g.connect(lp); lp.connect(keysBus); env(g, t, 0.003, 0.075 * v, 0.3, 0.25, 0.5, t + 0.5); osc('sawtooth', mtof(m), t, t + 1.2, g, wob); const g2 = ctx.createGain(); g2.gain.value = 0.5; g2.connect(g); osc('triangle', mtof(m) * 2, t, t + 0.8, g2); }
  function organ(m, t, v, dur) { const g = ctx.createGain(); const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 1400; g.connect(lp); lp.connect(keysBus); env(g, t, 0.08, 0.035 * v, 0.3, 0.85, 0.5, t + dur);[1, 2, 3].forEach((h, i) => { const gg = ctx.createGain(); gg.gain.value = [1, 0.45, 0.2][i]; gg.connect(g); osc('sine', mtof(m) * h, t, t + dur + 0.6, gg, wob); }); }
  function vibes(m, t, v, dur) {
    const g = ctx.createGain(); g.connect(keysBus); env(g, t, 0.003, 0.075 * v, 0.8, 0.3, 1.0, t + Math.min(dur, 1.2)); osc('sine', mtof(m), t, t + 2.4, g); const g2 = ctx.createGain(); g2.gain.setValueAtTime(0.25, t); g2.gain.exponentialRampToValueAtTime(0.004, t + 0.9); g2.connect(g); osc('sine', mtof(m) * 4, t, t + 1, g2);
    const tr = ctx.createOscillator(), td = ctx.createGain(); tr.frequency.value = 5.5; td.gain.value = 0.3; tr.connect(td); td.connect(g.gain); tr.start(t); tr.stop(t + 2.4);
  }
  function keyNote(m, t, v, dur) { const k = STY.keys; if (k === 'piano') return piano(m, t, v, dur); if (k === 'kalimba') return kalimba(m, t, v); if (k === 'guitar') return guitar(m, t, v); if (k === 'organ') return organ(m, t, v, dur); if (k === 'vibes') return vibes(m, t, v, dur); return rhodes(m, t, v, dur); }
  function blip(f, t, v, d, type) { const g = ctx.createGain(); g.connect(out); env(g, t, 0.003, v, d * 0.5, 0.2, d * 0.5, t + d * 0.3); osc(type || 'sine', f, t, t + d + 0.1, g); return g; }
  function chirp(t) { const o = ctx.createOscillator(), g = ctx.createGain(); o.type = 'sine'; o.frequency.setValueAtTime(2600, t); o.frequency.exponentialRampToValueAtTime(4200, t + 0.06); o.frequency.exponentialRampToValueAtTime(3000, t + 0.12); g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.02, t + 0.01); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.14); o.connect(g); g.connect(out); o.start(t); o.stop(t + 0.16); }
  function brush(t, v, long) { const n = ctx.createBufferSource(); n.buffer = noise; const bp = ctx.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = 3500; bp.Q.value = 0.4; const g = ctx.createGain(); const d = long ? 0.35 : 0.12; g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.06 * v, t + (long ? 0.08 : 0.01)); g.gain.exponentialRampToValueAtTime(0.0001, t + d); n.connect(bp); bp.connect(g); g.connect(out); n.start(t, Math.random() * 1.5); n.stop(t + d + 0.02); }
  function rim(t, v) { const o = ctx.createOscillator(), g = ctx.createGain(); o.type = 'square'; o.frequency.value = 1650; g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.05 * v, t + 0.002); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.035); const bp = ctx.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = 1800; o.connect(bp); bp.connect(g); g.connect(out); o.start(t); o.stop(t + 0.05); }
  function bass(m, t, dur, v) { const g = ctx.createGain(); const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 420; g.connect(lp); lp.connect(out); env(g, t, 0.012, 0.26 * (v || 1), 0.2, 0.75, 0.09, t + dur); osc('sine', mtof(m), t, t + dur + 0.12, g); const g2 = ctx.createGain(); g2.gain.value = 0.25; g2.connect(g); osc('triangle', mtof(m), t, t + dur + 0.12, g2); }
  function kick(t, v) {
    const o = ctx.createOscillator(), g = ctx.createGain(); o.type = 'sine'; o.frequency.setValueAtTime(115, t); o.frequency.exponentialRampToValueAtTime(42, t + 0.11); g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.75 * v, t + 0.006); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.38); o.connect(g); g.connect(out); o.start(t); o.stop(t + 0.4);
    // Ducking der Keys (leichtes Pumpen)
    keysBus.gain.cancelScheduledValues(t); keysBus.gain.setValueAtTime(0.75, t); keysBus.gain.linearRampToValueAtTime(1, t + 0.28);
  }
  function snare(t, v) {
    const n = ctx.createBufferSource(); n.buffer = noise; const bp = ctx.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = 1800; bp.Q.value = 0.7; const g = ctx.createGain(); g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.2 * v, t + 0.004); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.2); n.connect(bp); bp.connect(g); g.connect(out); n.start(t, Math.random() * 1.5); n.stop(t + 0.22);
    const o = ctx.createOscillator(), g2 = ctx.createGain(); o.frequency.value = 185; g2.gain.setValueAtTime(0.0001, t); g2.gain.exponentialRampToValueAtTime(0.12 * v, t + 0.004); g2.gain.exponentialRampToValueAtTime(0.0001, t + 0.09); o.connect(g2); g2.connect(out); o.start(t); o.stop(t + 0.1);
  }
  function hat(t, v, open) { const n = ctx.createBufferSource(); n.buffer = noise; const hp = ctx.createBiquadFilter(); hp.type = 'highpass'; hp.frequency.value = 7200; const g = ctx.createGain(); const d = open ? 0.22 : 0.045; g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.055 * v, t + 0.003); g.gain.exponentialRampToValueAtTime(0.0001, t + d); n.connect(hp); hp.connect(g); g.connect(out); n.start(t, Math.random() * 1.5); n.stop(t + d + 0.02); }
  function lead(kind, m, t, dur) {
    const g = ctx.createGain(); g.connect(out);
    if (kind === 'box') { env(g, t, 0.004, 0.07, 0.5, 0.05, 0.4, t + 0.1); osc('triangle', mtof(m), t, t + 0.9, g); const g2 = ctx.createGain(); g2.gain.value = 0.4; g2.connect(g); osc('sine', mtof(m) * 3, t, t + 0.5, g2); return; }
    if (kind === 'flute') {
      const v = ctx.createOscillator(), vg = ctx.createGain(); v.frequency.value = 5.2; vg.gain.setValueAtTime(0, t); vg.gain.linearRampToValueAtTime(9, t + 0.25); v.connect(vg); v.start(t); v.stop(t + dur + 0.5);
      env(g, t, 0.06, 0.06, 0.2, 0.8, 0.3, t + dur); const o = osc('sine', mtof(m), t, t + dur + 0.4, g); vg.connect(o.detune); return;
    }
    env(g, t, 0.01, 0.065, 0.3, 0.4, 0.6, t + dur); osc('sine', mtof(m), t, t + dur + 0.7, g, wob); const g2 = ctx.createGain(); g2.gain.value = 0.3; g2.connect(g); osc('sine', mtof(m) * 2, t, t + 0.25, g2);
  }
  function pad(m, t, dur) {
    const g = ctx.createGain(); const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 900; g.connect(lp); lp.connect(out); env(g, t, 0.9, 0.03, 0.5, 0.9, 1.6, t + dur);
    osc('triangle', mtof(m), t, t + dur + 1.7, g, wob); const o2 = osc('triangle', mtof(m), t, t + dur + 1.7, g); o2.detune.value = 8;
  }
  function voice(bar) { const root = bar.key + STY.tr, out2 = []; chOf(bar.chord).forEach(iv => { let m = root + iv; while (m > 76) m -= 12; while (m < 55) m += 12; out2.push(m); }); return [...new Set(out2)].sort((a, b) => a - b); }
  function bassRoot(bar, ch) { let m = bar.key + STY.tr - 12 + (chOf(ch || bar.chord)[0] % 12); while (m > 45) m -= 12; while (m < 33) m += 12; return m; }
  // ---------- Ablauf ----------
  function scheduleStep(i, t) {
    const bi = Math.floor(i / SPB), s = i % SPB, bar = BARS[bi]; if (!bar) return; const L = LAY[bar.sec]; const r = rng(bar.seed * 7 + s);
    const swing = (s % 4 === 2) ? STEP * STY.swing : 0; const tt = t + swing;
    if (s === 0) { filt.frequency.setTargetAtTime(L.cut * STY.cut, t, 0.8); }
    // Keys
    if (L.keys) {
      const V = voice(bar);
      if (STY.arp) { const pat = [0, 1, 2, 3, 2, 1, 3, 2]; if (s % 2 === 0) { const m = V[pat[(s / 2) % 8] % V.length]; keyNote(m, tt, s === 0 ? 0.9 : 0.6, STEP * 2); } if (s === 0 && STY.keys !== 'kalimba') keyNote(V[0] - 12, t, 0.5, BAR * 0.5); }
      else {
        const strum = STY.keys === 'guitar' ? 0.03 : 0.014; if (s === 0) { V.forEach((m, k) => keyNote(m, t + k * strum, 0.9, BAR * 0.55)); }
        if (s === 10 && bar.sec !== 'intro' && bar.sec !== 'outro' && r() < 0.7) { V.slice(1).forEach((m, k) => keyNote(m, tt + k * strum * 0.8, 0.5, BAR * 0.3)); }
        if (STY.keys === 'guitar' && s === 6 && r() < 0.6) { V.slice(0, 3).forEach((m, k) => keyNote(m, tt + k * 0.02, 0.45, BAR * 0.2)); }
      }
    }
    if (L.pad && s === 0) { const v = voice(bar); pad(v[0] - 12, t, BAR * 0.95); pad(v[2], t, BAR * 0.95); }
    // Bass
    if (L.bass && STY.bassk === 'walk') { const R = bassRoot(bar), nr = bassRoot(bar, bar.nextChord); const ch = chOf(bar.chord); const notes = [R, R + (ch[1] % 12), R + (ch[2] % 12), nr + (r() < 0.5 ? -1 : 1)]; if (s % 4 === 0) bass(notes[s / 4], tt, STEP * 3.2, s === 0 ? 1 : 0.8); }
    else if (L.bass) { const R = bassRoot(bar); if (s === 0) bass(R, t, STEP * 5); if (s === 6) bass(r() < 0.5 ? R + 7 : R + 12, tt, STEP * 3, 0.8); if (s === 12) { const nr = bassRoot(bar, bar.nextChord); bass(r() < 0.5 ? nr - 1 : R + (r() < 0.5 ? 3 : 5), t, STEP * 3, 0.75); } }
    // Drums
    const D = STY.drums;
    if (L.drums === 1 && D === 'halftime') { if (s === 0 || (s === 10 && r() < 0.6)) kick(tt, 1); if (s === 8) snare(tt, 1); if (s % 2 === 0) hat(tt, 0.5 + r() * 0.4, s === 14 && r() < 0.3); }
    else if (L.drums === 1 && D === 'brush') { if (s === 0 || s === 8) kick(t, 0.55); if (s === 4 || s === 12) brush(tt, 1, true); if (s % 2 === 0) brush(tt, 0.5, false); }
    else if (L.drums === 1 && D === 'rim') { if (s === 0 || s === 6 || s === 10) kick(tt, 0.8); if (s === 3 || s === 6 || s === 10 || s === 13) rim(tt, s === 6 ? 0.7 : 1); if (s % 2 === 0) hat(tt, 0.45, false); }
    else if (L.drums === 1 && D === 'shuffle') { const sw = (s % 4 === 2 || s % 4 === 3) ? STEP * 0.45 : 0; if (s === 0 || s === 11) kick(t + sw, 1); if (s === 4 || s === 12) snare(t + sw, 0.95); if (s % 4 === 0 || s % 4 === 3) hat(t + sw, 0.55 + r() * 0.3, false); }
    else if (L.drums === 1 && D === 'soft') { if (s === 0) kick(t, 0.45); if (s === 8) brush(t, 0.7, true); if (s % 4 === 2) hat(tt, 0.25, false); }
    else if (L.drums === 1) {
      const last = bar.bis === bar.len - 1;
      if (s === 0 || s === 7 || (s === 10 && r() < 0.8) || (s === 3 && r() < 0.2)) kick(tt, s === 0 ? 1 : 0.8);
      if (s === 4 || s === 12) snare(tt, 1); if (last && s >= 13 && r() < 0.6) snare(tt, 0.35 + 0.15 * (s - 13));
      if (s % 2 === 0) hat(tt, 0.6 + r() * 0.5, s === 14 && r() < 0.35); else if (r() < 0.18) hat(tt, 0.3, false);
    }
    if (L.drums === 2) { if (s === 0 || s === 10) kick(t, 0.55); if (s === 12) snare(t, 0.35); if (s % 4 === 2) hat(tt, 0.4, false); }
    // Atmosphäre je Station
    const A = STY.amb;
    if (A === 'monitor' && s % 8 === 0) blip(1046, t, 0.025, 0.12, 'sine');
    if (A === 'bubbles' && r() < 0.12) blip(600 + r() * 900, t, 0.018, 0.08, 'sine');
    if (A === 'birds' && s === 2 && r() < 0.5) { chirp(t); chirp(t + 0.18); }
    if (A === 'chime' && s === 0 && bar.bis % 4 === 0) blip(mtof(bar.key + STY.tr + 31), t, 0.02, 1.4, 'sine');
    // Melodie
    if (L.mel) { if (s === 0) bar._mel = melody(bar); (bar._mel || []).forEach(n => { if (n.s === s) { const base = bar.key + STY.tr + 12 + (L.mel === 2 ? 12 : 0); lead(STY.lead || bar.lead, base + n.iv, tt, STEP * n.d * 1.6); } }); }
  }
  function tick() { if (!playing) return; while (next < ctx.currentTime + 0.25) { scheduleStep(step, next); next += STEP; step = (step + 1) % TOTAL; } }
  function build(c) {
    ctx = c; out = ctx.createGain(); out.gain.value = 0; filt = ctx.createBiquadFilter(); filt.type = 'lowpass'; filt.frequency.value = 2600; filt.Q.value = 0.4;
    const comp = ctx.createDynamicsCompressor(); comp.threshold.value = -18; comp.ratio.value = 3;
    out.connect(filt); filt.connect(comp); comp.connect(ctx.destination);
    keysBus = ctx.createGain(); keysBus.gain.value = 1; const tg = ctx.createGain(); tg.gain.value = 1; keysBus.connect(tg); tg.connect(out);
    trem = ctx.createOscillator(); trem.frequency.value = 4.2; const td = ctx.createGain(); td.gain.value = 0.1; trem.connect(td); td.connect(tg.gain); trem.start();
    const w = ctx.createOscillator(); w.frequency.value = 0.33; wob = ctx.createGain(); wob.gain.value = 7; w.connect(wob); w.start();
    noise = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate); const d = noise.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    // Vinyl-Knistern
    const cb = ctx.createBuffer(1, ctx.sampleRate * 4, ctx.sampleRate), cd = cb.getChannelData(0); for (let i = 0; i < cd.length; i++) { cd[i] = (Math.random() * 2 - 1) * 0.04 + (Math.random() < 0.0009 ? (Math.random() * 2 - 1) * 0.9 : 0); }
    crackle = ctx.createBufferSource(); crackle.buffer = cb; crackle.loop = true; const cbp = ctx.createBiquadFilter(); cbp.type = 'bandpass'; cbp.frequency.value = 3000; cbp.Q.value = 0.5; const cg = ctx.createGain(); crackG = cg; cg.gain.value = 0.22 * STY.crackle; crackle.connect(cbp); cbp.connect(cg); cg.connect(out); crackle.start();
    const rn = ctx.createBufferSource(); rn.buffer = noise; rn.loop = true; const rlp = ctx.createBiquadFilter(); rlp.type = 'lowpass'; rlp.frequency.value = 1600; const rhp = ctx.createBiquadFilter(); rhp.type = 'highpass'; rhp.frequency.value = 300; rainG = ctx.createGain(); rainG.gain.value = STY.amb === 'rain' ? 0.05 : 0; rn.connect(rlp); rlp.connect(rhp); rhp.connect(rainG); rainG.connect(out); rn.start(); wob.gain.value = STY.wob;
  }
  function level() { if (!out) return; out.gain.cancelScheduledValues(ctx.currentTime); out.gain.setTargetAtTime(playing ? vol * duck : 0, ctx.currentTime, 0.3); }
  return {
    start(c) { if (!ctx) build(c); if (playing) return; playing = true; next = ctx.currentTime + 0.08; level(); timer = setInterval(tick, 40); tick(); },
    stop() { if (!ctx) return; playing = false; clearInterval(timer); timer = null; level(); },
    duck(on) { duck = on ? 0.35 : 1; level(); },
    get playing() { return playing; },
    setStyle(s) { STY = Object.assign({}, DEF, s || {}); BPM = STY.bpm || 76; STEP = 60 / BPM / 4; BAR = STEP * SPB; if (ctx) { crackG.gain.setTargetAtTime(0.22 * STY.crackle, ctx.currentTime, 0.5); rainG.gain.setTargetAtTime(STY.amb === 'rain' ? 0.05 : 0, ctx.currentTime, 0.6); wob.gain.setTargetAtTime(STY.wob, ctx.currentTime, 0.3); } },
    get title() { return STY.title; },
    info() {
      const sec = step * STEP, bar = BARS[Math.floor(step / SPB)] || BARS[0]; const f = x => Math.floor(x / 60) + ':' + String(Math.floor(x % 60)).padStart(2, '0');
      return { title: STY.title, part: bar.part, pi: bar.pi + 1, time: f(sec), total: f(TOTAL * STEP) };
    },
    length: TOTAL * STEP
  };
})();
