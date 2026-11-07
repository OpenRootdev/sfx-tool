// sfx-tool engine: subtle typing / UI sound synthesis. Plain JS, no dependencies.
// Runs the same in Node (CLI, server) and the browser (Studio).
//
// A sound is a *recipe*: { name, family, model, seed, params, description }.
// Models: "tap" (damped percussive body + contact noise, optional double hit),
//         "bubble" (sine whose pitch rises as it decays, optional second bubble),
//         "chime" (two soft bell notes).
// Every render starts and ends at exactly zero (raised-cosine attack, cosine fade),
// is high-passed (no DC / sub thump) and low-passed ("muffle"), so nothing clicks or gets harsh.

export const SR = 48000;

// ---------- small DSP helpers ----------
export function mulberry32(seed) {
  let a = (seed >>> 0) || 1;
  return () => {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
export function gaussian(rng) {
  let u = 0; while (u === 0) u = rng();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * rng());
}

function envelope(n, attackMs, decayS, fadeMs = 12) {
  const e = new Float64Array(n);
  const a = Math.max(Math.floor(SR * attackMs / 1000), 2);
  const f = Math.min(Math.max(Math.floor(SR * fadeMs / 1000), 2), n);
  const d = Math.max(decayS, 1e-4);
  for (let i = 0; i < n; i++) {
    let v = Math.exp(-(i / SR) / d);
    if (i < a) v *= 0.5 - 0.5 * Math.cos(Math.PI * i / a);
    if (i >= n - f) v *= 0.5 + 0.5 * Math.cos(Math.PI * (i - (n - f)) / f);
    e[i] = v;
  }
  return e;
}

// sine following a per-sample frequency curve (Hz)
function oscCurve(freq, mul = 1) {
  const out = new Float64Array(freq.length);
  let ph = 0;
  for (let i = 0; i < freq.length; i++) { ph += 2 * Math.PI * freq[i] * mul / SR; out[i] = Math.sin(ph); }
  return out;
}

// RBJ biquad; Q = 1/sqrt(2) gives a 2nd-order Butterworth
export function biquad(x, type, freq, q = Math.SQRT1_2) {
  const f = Math.min(Math.max(freq, 10), SR * 0.45);
  const w = 2 * Math.PI * f / SR, cw = Math.cos(w), al = Math.sin(w) / (2 * q);
  let b0, b1, b2;
  if (type === "low") { b0 = (1 - cw) / 2; b1 = 1 - cw; b2 = b0; }
  else { b0 = (1 + cw) / 2; b1 = -(1 + cw); b2 = b0; }
  const a0 = 1 + al, a1 = -2 * cw, a2 = 1 - al;
  const B0 = b0 / a0, B1 = b1 / a0, B2 = b2 / a0, A1 = a1 / a0, A2 = a2 / a0;
  const y = new Float64Array(x.length);
  let x1 = 0, x2 = 0, y1 = 0, y2 = 0;
  for (let i = 0; i < x.length; i++) {
    const v = B0 * x[i] + B1 * x1 + B2 * x2 - A1 * y1 - A2 * y2;
    x2 = x1; x1 = x[i]; y2 = y1; y1 = v; y[i] = v;
  }
  return y;
}

function finish(x, muffle, highpass) {
  const pad = Math.floor(SR * 0.03);
  const p = new Float64Array(x.length + pad); p.set(x);
  let y = biquad(biquad(p, "low", muffle), "high", highpass);
  const f = Math.floor(SR * 0.012);
  for (let i = 0; i < f; i++) y[y.length - f + i] *= 0.5 + 0.5 * Math.cos(Math.PI * i / f);
  let pk = 0; for (const v of y) pk = Math.max(pk, Math.abs(v));
  if (pk > 0) for (let i = 0; i < y.length; i++) y[i] /= pk;
  return y;
}

function addAt(dst, src, offset, gain = 1) {
  for (let i = 0; i < src.length && offset + i < dst.length; i++) dst[offset + i] += gain * src[i];
}

// ---------- models ----------
// Each model: { params: [schema...], render(p, rng, j) -> Float64Array (pre-filter) }
// schema: { key, label, group, min, max, step, unit, help }
const OUT = [
  { key: "muffle", label: "Muffle", group: "Output", min: 400, max: 6000, step: 10, unit: "Hz", help: "Low-pass cutoff. Lower is softer and more muted." },
  { key: "highpass", label: "Low cut", group: "Output", min: 30, max: 400, step: 5, unit: "Hz", help: "Removes rumble below this." },
  { key: "loudness", label: "Loudness", group: "Output", min: -40, max: -14, step: 0.5, unit: "LUFS", help: "Level of the rendered file. The pack standard is −28." },
  { key: "variation", label: "Variation", group: "Output", min: 0, max: 1, step: 0.01, unit: "", help: "How far the seed moves pitch, length and muffle." },
];

function tapBody(p, rng, j, pitch, length) {
  const n = Math.max(Math.floor(SR * length), 8);
  const settle = p.settle * j(0.3), sTau = Math.max(p.settleMs, 0.1) / 1000;
  const f = new Float64Array(n);
  for (let i = 0; i < n; i++) f[i] = pitch * (1 + settle * Math.exp(-(i / SR) / sTau));
  const body = oscCurve(f);
  for (const h of [1, 2]) {
    const amp = p[`h${h}Amp`]; if (!amp) continue;
    const ratio = p[`h${h}Ratio`] * j(0.03), dec = p[`h${h}Decay`];
    const o = oscCurve(f, ratio);
    for (let i = 0; i < n; i++) body[i] += amp * o[i] * (dec > 0 ? Math.exp(-(i / SR) / (length / p.ring * dec)) : 1);
  }
  const env = envelope(n, p.softness, length / p.ring);
  for (let i = 0; i < n; i++) body[i] *= env[i];
  if (p.noise > 0) {
    const ne = envelope(n, 0.6, p.noiseMs / 1000);
    let nz = new Float64Array(n);
    for (let i = 0; i < n; i++) nz[i] = gaussian(rng) * ne[i];
    nz = biquad(biquad(nz, "high", p.noiseLo), "low", Math.max(p.noiseHi, p.noiseLo + 50));
    for (let i = 0; i < n; i++) body[i] += p.noise * nz[i];
  }
  return body;
}

export const MODELS = {
  tap: {
    label: "Tap",
    params: [
      { key: "pitch", label: "Pitch", group: "Tone", min: 100, max: 1000, step: 1, unit: "Hz", help: "Body pitch. Lower is deeper (thock), higher is lighter (tick)." },
      { key: "settle", label: "Hit drop", group: "Tone", min: 0, max: 1.5, step: 0.01, unit: "", help: "How far the pitch falls right at the hit." },
      { key: "settleMs", label: "Drop time", group: "Tone", min: 1, max: 25, step: 0.5, unit: "ms", help: "How quickly the pitch settles." },
      { key: "length", label: "Length", group: "Shape", min: 0.015, max: 0.25, step: 0.001, unit: "s", help: "Length of the body." },
      { key: "softness", label: "Softness", group: "Shape", min: 0.3, max: 12, step: 0.1, unit: "ms", help: "Attack time. Higher is rounder, less clicky." },
      { key: "ring", label: "Damping", group: "Shape", min: 1.5, max: 9, step: 0.1, unit: "", help: "Higher dies away faster; lower rings longer." },
      { key: "h1Ratio", label: "Overtone 1", group: "Overtones", min: 1.1, max: 7, step: 0.01, unit: "×", help: "Inharmonic partials make it woody (≈2.7) or hollow." },
      { key: "h1Amp", label: "Overtone 1 level", group: "Overtones", min: 0, max: 0.7, step: 0.01, unit: "" },
      { key: "h1Decay", label: "Overtone 1 fade", group: "Overtones", min: 0, max: 2, step: 0.01, unit: "", help: "0 follows the body; small values fade it out fast." },
      { key: "h2Ratio", label: "Overtone 2", group: "Overtones", min: 1.1, max: 9, step: 0.01, unit: "×" },
      { key: "h2Amp", label: "Overtone 2 level", group: "Overtones", min: 0, max: 0.7, step: 0.01, unit: "" },
      { key: "h2Decay", label: "Overtone 2 fade", group: "Overtones", min: 0, max: 2, step: 0.01, unit: "" },
      { key: "noise", label: "Contact", group: "Contact", min: 0, max: 0.9, step: 0.01, unit: "", help: "Level of the short noise burst where the key is struck." },
      { key: "noiseLo", label: "Contact low", group: "Contact", min: 80, max: 3000, step: 10, unit: "Hz" },
      { key: "noiseHi", label: "Contact high", group: "Contact", min: 200, max: 5000, step: 10, unit: "Hz" },
      { key: "noiseMs", label: "Contact length", group: "Contact", min: 0.5, max: 15, step: 0.1, unit: "ms" },
      { key: "preGain", label: "Key-down hit", group: "Double hit", min: 0, max: 1, step: 0.01, unit: "", help: "A small first hit before the main one (keycap). 0 is off." },
      { key: "preRatio", label: "Key-down pitch", group: "Double hit", min: 0.6, max: 2.2, step: 0.01, unit: "×" },
      { key: "preGapMs", label: "Key travel", group: "Double hit", min: 3, max: 50, step: 0.5, unit: "ms" },
      ...OUT,
    ],
    render(p, rng, j) {
      const main = tapBody(p, rng, j, p.pitch, p.length);
      if (!(p.preGain > 0)) return main;
      const first = tapBody(p, rng, j, p.pitch * p.preRatio, p.length * 0.5);
      const off = Math.floor(SR * p.preGapMs / 1000 * j(0.25));
      const y = new Float64Array(off + main.length);
      addAt(y, first, 0, p.preGain); addAt(y, main, off);
      return y;
    },
  },
  bubble: {
    label: "Bubble",
    params: [
      { key: "pitch", label: "Pitch", group: "Tone", min: 150, max: 1500, step: 1, unit: "Hz", help: "Higher is a smaller bubble." },
      { key: "rise", label: "Rise", group: "Tone", min: 0, max: 1.5, step: 0.01, unit: "", help: "How far the pitch rises as it decays (the bubble sound)." },
      { key: "riseTime", label: "Rise time", group: "Tone", min: 0.05, max: 1, step: 0.01, unit: "×len" },
      { key: "h2", label: "Overtone", group: "Tone", min: 0, max: 0.5, step: 0.01, unit: "" },
      { key: "length", label: "Length", group: "Shape", min: 0.02, max: 0.4, step: 0.001, unit: "s" },
      { key: "softness", label: "Softness", group: "Shape", min: 0.3, max: 15, step: 0.1, unit: "ms" },
      { key: "ring", label: "Damping", group: "Shape", min: 1.5, max: 9, step: 0.1, unit: "" },
      { key: "doubleGain", label: "Second bubble", group: "Second bubble", min: 0, max: 1, step: 0.01, unit: "", help: "A smaller bubble right after (the line pop). 0 is off." },
      { key: "doubleRatio", label: "Second pitch", group: "Second bubble", min: 0.6, max: 2.5, step: 0.01, unit: "×" },
      { key: "doubleLength", label: "Second length", group: "Second bubble", min: 0.2, max: 1.2, step: 0.01, unit: "×" },
      { key: "doubleOffsetMs", label: "Second delay", group: "Second bubble", min: 4, max: 120, step: 1, unit: "ms" },
      ...OUT,
    ],
    render(p, rng, j) {
      const one = (pitch, length, rise) => {
        const n = Math.max(Math.floor(SR * length), 8), f = new Float64Array(n), rt = length * p.riseTime;
        for (let i = 0; i < n; i++) f[i] = pitch * (1 + rise * (1 - Math.exp(-(i / SR) / rt)));
        const a = oscCurve(f), b = oscCurve(f, 2), e = envelope(n, p.softness, length / p.ring);
        for (let i = 0; i < n; i++) a[i] = (a[i] + p.h2 * b[i]) * e[i];
        return a;
      };
      const rise = p.rise * j(0.35);
      const a = one(p.pitch, p.length, rise);
      if (!(p.doubleGain > 0)) return a;
      const b = one(p.pitch * p.doubleRatio * j(0.05), p.length * p.doubleLength, rise / 1.2);
      const off = Math.floor(SR * p.doubleOffsetMs / 1000 * j(0.3));
      const y = new Float64Array(Math.max(a.length, off + b.length));
      addAt(y, a, 0); addAt(y, b, off, p.doubleGain);
      return y;
    },
  },
  chime: {
    label: "Chime",
    params: [
      { key: "pitch", label: "Pitch", group: "Tone", min: 250, max: 1500, step: 1, unit: "Hz" },
      { key: "interval", label: "Second note", group: "Tone", min: 1, max: 2.5, step: 0.001, unit: "×", help: "1.5 is a fifth, 1.335 a fourth, 1.26 a major third." },
      { key: "secondGain", label: "Second level", group: "Tone", min: 0, max: 1, step: 0.01, unit: "" },
      { key: "bright", label: "Shimmer", group: "Tone", min: 0, max: 0.5, step: 0.01, unit: "", help: "Level of the bell overtone." },
      { key: "delayMs", label: "Second delay", group: "Shape", min: 0, max: 400, step: 1, unit: "ms" },
      { key: "length", label: "Length", group: "Shape", min: 0.2, max: 2.5, step: 0.01, unit: "s" },
      { key: "softness", label: "Softness", group: "Shape", min: 1, max: 40, step: 0.5, unit: "ms" },
      { key: "ring", label: "Damping", group: "Shape", min: 2, max: 12, step: 0.1, unit: "" },
      ...OUT,
    ],
    render(p, rng, j) {
      const n = Math.floor(SR * p.length);
      const y = new Float64Array(Math.floor(SR * (p.length + p.delayMs / 1000 + 0.04)));
      const notes = [[1, 0, 1], [p.interval, p.delayMs, p.secondGain]];
      for (const [ratio, delay, g] of notes) {
        if (!g) continue;
        const f0 = p.pitch * ratio * j(0.01), e = envelope(n, p.softness, p.length / p.ring, 60), tone = new Float64Array(n);
        for (let i = 0; i < n; i++) {
          const t = i / SR;
          tone[i] = (Math.sin(2 * Math.PI * f0 * t) + p.bright * Math.sin(2 * Math.PI * 2.01 * f0 * t)
            + 0.05 * Math.sin(2 * Math.PI * 3.02 * f0 * t) * Math.exp(-t / 0.08)) * e[i];
        }
        addAt(y, tone, Math.floor(SR * delay / 1000), g);
      }
      return y;
    },
  },
};

// ---------- families: starting points (and what "new sound" offers) ----------
const TAP0 = { settle: 0.6, settleMs: 6, ring: 3.5, h1Ratio: 2.7, h1Amp: 0.2, h1Decay: 0, h2Ratio: 4, h2Amp: 0, h2Decay: 0.5,
  noise: 0.35, noiseLo: 700, noiseHi: 2200, noiseMs: 4, preGain: 0, preRatio: 1.35, preGapMs: 12, highpass: 90, loudness: -28, variation: 0.3 };
const BUB0 = { rise: 0.55, riseTime: 0.35, h2: 0.12, ring: 3.2, doubleGain: 0, doubleRatio: 1.5, doubleLength: 0.55, doubleOffsetMs: 28,
  highpass: 90, loudness: -28, variation: 0.3 };
export const FAMILIES = {
  tap:    { model: "tap", role: "hit", label: "Dull taps", blurb: "soft key \"tok\"", params: { ...TAP0, pitch: 380, muffle: 1800, length: 0.045, softness: 1.5 } },
  thock:  { model: "tap", role: "hit", label: "Thocks", blurb: "deep, rounded keyboard taps", params: { ...TAP0, pitch: 230, muffle: 1300, length: 0.07, softness: 1.8, settle: 0.45, settleMs: 8,
            h1Ratio: 2.3, h1Amp: 0.15, h1Decay: 0.8, h2Ratio: 3.9, h2Amp: 0.04, h2Decay: 0.4, noise: 0.25, noiseLo: 300, noiseHi: 1200, noiseMs: 5 } },
  tick:   { model: "tap", role: "hit", label: "Ticks", blurb: "small and light, for fast typing", params: { ...TAP0, pitch: 560, muffle: 2600, length: 0.03, softness: 1.0, settle: 0.3, settleMs: 3,
            h1Ratio: 2.7, h1Amp: 0.25, h1Decay: 0.7, noise: 0.3, noiseLo: 1200, noiseHi: 2800, noiseMs: 2.5 } },
  knock:  { model: "tap", role: "hit", label: "Wood knocks", blurb: "soft wooden taps", params: { ...TAP0, pitch: 320, muffle: 2000, length: 0.06, softness: 1.2, settle: 0.2, settleMs: 4,
            h1Ratio: 2.76, h1Amp: 0.35, h1Decay: 0.6, h2Ratio: 5.4, h2Amp: 0.1, h2Decay: 0.3, noise: 0.08, noiseLo: 500, noiseHi: 1500, noiseMs: 2 } },
  felt:   { model: "tap", role: "hit", label: "Felt taps", blurb: "the dullest, for under a voice or music", params: { ...TAP0, pitch: 290, muffle: 800, length: 0.05, softness: 3.5, settle: 0.5, settleMs: 10,
            h1Ratio: 2.2, h1Amp: 0.1, h1Decay: 0.6, noise: 0.1, noiseLo: 200, noiseHi: 700, noiseMs: 6 } },
  keycap: { model: "tap", role: "hit", label: "Keycaps", blurb: "two-stage press: key down, then bottom-out", params: { ...TAP0, pitch: 340, muffle: 1800, length: 0.05, softness: 1.2, settle: 0.5, settleMs: 5,
            h1Ratio: 2.5, h1Amp: 0.2, h1Decay: 0.7, noise: 0.2, noiseLo: 600, noiseHi: 1800, noiseMs: 3, preGain: 0.45, preRatio: 1.35, preGapMs: 12 } },
  pop:    { model: "bubble", role: "hit", label: "Bubble pops", blurb: "things popping in", params: { ...BUB0, pitch: 620, muffle: 2600, length: 0.085, softness: 2.5 } },
  soft:   { model: "bubble", role: "hit", label: "Soft pops", blurb: "bubble pops behind music or a voice", params: { ...BUB0, pitch: 520, muffle: 1400, length: 0.1, softness: 4 } },
  line:   { model: "bubble", role: "accent", label: "Line pops", blurb: "a line, card or panel appearing", trackGainDb: 2,
            params: { ...BUB0, pitch: 430, muffle: 2200, length: 0.17, softness: 3.5, rise: 0.66, doubleGain: 0.55 } },
  chime:  { model: "chime", role: "accent", label: "Chimes", blurb: "done, success, the last line typed", trackGainDb: -2,
            params: { pitch: 660, interval: 1.5, secondGain: 0.8, bright: 0.18, delayMs: 85, length: 0.9, softness: 8, ring: 4.5,
                      muffle: 3200, highpass: 90, loudness: -28, variation: 0.3 } },
};

export function familyOf(recipe) { return FAMILIES[recipe.family] || null; }

/** Fill a recipe with defaults from its family (or model) so every param exists. */
export function normalize(recipe) {
  const fam = FAMILIES[recipe.family];
  const model = recipe.model || fam?.model || "tap";
  const base = fam && fam.model === model ? fam.params : FAMILIES[{ tap: "tap", bubble: "pop", chime: "chime" }[model]].params;
  return { name: recipe.name || "untitled", family: recipe.family || "custom", model, seed: recipe.seed ?? 1,
    description: recipe.description || "", ...recipe, params: { ...base, ...(recipe.params || {}) } };
}

/** Render a recipe to mono Float64Array, peak 1.0 (no loudness applied). overrides: { seed, pitch, length, ... } */
export function synth(recipe, overrides = {}) {
  const r = normalize(recipe);
  const p = { ...r.params, ...overrides };
  const seed = overrides.seed ?? r.seed;
  const rng = mulberry32(seed * 2654435761 + 12345);
  const v = Math.min(Math.max(p.variation, 0), 1);
  const j = (s) => 1 + v * s * (rng() * 2 - 1);
  p.pitch *= j(0.12); p.length *= j(0.18); p.muffle *= j(0.15);
  const x = MODELS[r.model].render(p, rng, j);
  return finish(x, p.muffle, p.highpass);
}

/** Render at the recipe's loudness (pack standard: −28 LUFS) with a −6 dBFS peak ceiling. */
export function renderRecipe(recipe, overrides = {}, ceilingDb = -6) {
  const r = normalize(recipe);
  const x = synth(r, overrides);
  const target = overrides.loudness ?? r.params.loudness;
  let g = Math.pow(10, (target - lufs([x])) / 20);
  let pk = 0; for (const v of x) pk = Math.max(pk, Math.abs(v));
  g = Math.min(g, Math.pow(10, ceilingDb / 20) / (pk || 1));
  for (let i = 0; i < x.length; i++) x[i] *= g;
  return x;
}

// ---------- loudness (ITU-R BS.1770, 48 kHz) ----------
function iir(x, b, a) {
  const y = new Float64Array(x.length); let x1 = 0, x2 = 0, y1 = 0, y2 = 0;
  for (let i = 0; i < x.length; i++) { const v = b[0] * x[i] + b[1] * x1 + b[2] * x2 - a[1] * y1 - a[2] * y2; x2 = x1; x1 = x[i]; y2 = y1; y1 = v; y[i] = v; }
  return y;
}
/** Integrated loudness of channels[] (each a Float array at 48 kHz). */
export function lufs(channels) {
  const kw = channels.map((c) => iir(iir(c, [1.53512485958697, -2.69169618940638, 1.19839281085285], [1, -1.69065929318241, 0.73248077421585]),
    [1, -2, 1], [1, -1.99004745483398, 0.99007225036621]));
  const blk = Math.floor(0.4 * SR), hop = Math.floor(0.1 * SR), n = Math.max(kw[0].length, blk);
  const ms = [];
  for (let s = 0; s + blk <= n; s += hop) {
    let tot = 0;
    for (const c of kw) { let a = 0; for (let i = s; i < s + blk; i++) { const v = i < c.length ? c[i] : 0; a += v * v; } tot += a / blk; }
    ms.push(tot);
  }
  const L = (m) => -0.691 + 10 * Math.log10(m + 1e-20);
  const g1 = ms.filter((m) => L(m) > -70); if (!g1.length) return -Infinity;
  const rel = L(g1.reduce((a, b) => a + b, 0) / g1.length) - 10;
  const g2 = g1.filter((m) => L(m) > rel);
  return L(g2.reduce((a, b) => a + b, 0) / g2.length);
}
