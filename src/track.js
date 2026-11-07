// Lay sounds onto one quiet stereo track from timestamps, with natural jitter.
import { SR, FAMILIES, normalize, synth, lufs, mulberry32, gaussian } from "./engine.js";

/** One event per typed character (whitespace skipped) or per word; pauses at line breaks. */
export function textEvents(text, { start = 0, cps = 18, per = "char", sound } = {}) {
  const ev = []; let t = start, afterSpace = true;
  for (const ch of text) {
    const space = /\s/.test(ch);
    if (per === "char" ? !space : !space && afterSpace) ev.push(sound ? { t, sound } : { t });
    afterSpace = space;
    if (ch === "\n") t += 6 / cps;
    t += 1 / cps;
  }
  return { events: ev, end: t };
}

/** Parse timestamps from .txt (one per line), .csv (first or t/time/frame column) or .json. */
export function parseTimes(text, ext, fps) {
  let ev;
  if (ext === ".json") {
    ev = JSON.parse(text).map((e) => (typeof e === "number" ? { t: e } : { ...e }));
  } else if (ext === ".csv") {
    const rows = text.split(/\r?\n/).filter((r) => r.trim()).map((r) => r.split(","));
    const head = rows[0].map((h) => h.trim().toLowerCase());
    let col = head.findIndex((h) => ["t", "time", "frame"].includes(h));
    if (col >= 0) rows.shift(); else col = 0;
    ev = rows.map((r) => ({ t: parseFloat(r[col]) })).filter((e) => Number.isFinite(e.t));
  } else {
    ev = text.split(/\s+/).filter(Boolean).map((s) => ({ t: parseFloat(s) })).filter((e) => Number.isFinite(e.t));
  }
  if (fps) for (const e of ev) e.t /= fps;
  return ev;
}

/**
 * events: [{ t, sound?, pitch?, gain? }]; sound is a recipe name or a family ("tap", "knock", "chime"...).
 * sounds: { name: recipe }. Returns { channels: [L, R], kept }.
 */
export function renderTrack(events, sounds, opts = {}) {
  const o = { sound: "tap", duration: null, jitterMs: 6, pitchJitter: 0.05, gainJitterDb: 1.5, minGapMs: 40,
    spread: 0.2, lufs: -30, ceilingDb: -12, seed: 1, ...opts };
  const rng = mulberry32(o.seed * 7919 + 17);
  const all = Object.values(sounds).map(normalize);
  const pick = (want) => {
    if (sounds[want]) return normalize(sounds[want]);
    const fam = all.filter((r) => r.family === want);
    if (fam.length) return fam[Math.floor(rng() * fam.length)];
    if (FAMILIES[want]) return normalize({ name: want, family: want });
    throw new Error(`unknown sound or family "${want}"`);
  };
  const role = (r) => FAMILIES[r.family]?.role || (r.model === "chime" || r.params.doubleGain > 0 ? "accent" : "hit");
  const resolved = events.slice().sort((a, b) => a.t - b.t).map((e) => ({ ...e, recipe: pick(e.sound || o.sound) }));

  // thin very fast runs (accents always stay)
  const kept = []; let last = -1e9;
  for (const e of resolved) {
    const hit = role(e.recipe) === "hit";
    if (!hit || (e.t - last) * 1000 >= o.minGapMs) { kept.push(e); if (hit) last = e.t; }
  }
  const end = Math.max(0, ...kept.map((e) => e.t)) + 1.2;
  const n = Math.floor(SR * (o.duration || end));
  const L = new Float64Array(n), R = new Float64Array(n);
  const levelCache = {};
  const level = (r) => { // gain that brings this recipe's base render to the pack loudness (−28) + accent offset
    if (!(r.name in levelCache)) levelCache[r.name] = Math.pow(10, (-28 - lufs([synth(r)]) + (FAMILIES[r.family]?.trackGainDb || 0)) / 20);
    return levelCache[r.name];
  };
  kept.forEach((e, i) => {
    const r = e.recipe, hit = role(r) === "hit", ov = { seed: Math.floor(rng() * 2 ** 30) };
    ov.pitch = (e.pitch ?? r.params.pitch) * (hit ? Math.pow(2, gaussian(rng) * o.pitchJitter) : 1);
    if (hit && e.length == null) {
      const next = kept.slice(i + 1).find((f) => role(f.recipe) === "hit");
      if (next) ov.length = Math.min(Math.max(1.6 * (next.t - e.t), 0.025), r.params.length);
    } else if (e.length != null) ov.length = e.length;
    const x = synth(r, ov);
    const g = level(r) * (e.gain ?? 1) * (hit ? Math.pow(10, gaussian(rng) * o.gainJitterDb / 2 / 20) : 1);
    const t = e.t + (hit ? gaussian(rng) * o.jitterMs / 2 / 1000 : 0);
    const s = Math.max(Math.round(t * SR), 0);
    const pan = hit ? Math.max(-o.spread, Math.min(o.spread, gaussian(rng) * o.spread / 2)) : 0;
    const gl = Math.cos((pan + 1) * Math.PI / 4) * Math.SQRT2, gr = Math.sin((pan + 1) * Math.PI / 4) * Math.SQRT2;
    for (let k = 0; k < x.length && s + k < n; k++) { L[s + k] += x[k] * g * gl; R[s + k] += x[k] * g * gr; }
  });
  const loud = lufs([L, R]);
  let gain = Number.isFinite(loud) ? Math.pow(10, (o.lufs - loud) / 20) : 1, pk = 0;
  for (let i = 0; i < n; i++) pk = Math.max(pk, Math.abs(L[i]), Math.abs(R[i]));
  gain = Math.min(gain, Math.pow(10, o.ceilingDb / 20) / (pk || 1));
  const f = Math.min(Math.floor(SR * 0.01), n);
  for (let i = 0; i < n; i++) { const fade = i >= n - f ? (n - i) / f : 1; L[i] *= gain * fade; R[i] *= gain * fade; }
  return { channels: [L, R], kept: kept.map(({ recipe, ...e }) => ({ ...e, sound: recipe.name })) };
}
