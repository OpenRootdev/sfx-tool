// Listen-free music analysis: loudness, tempo + beat grid, key, and which notes fit.
// Estimates, not ground truth: report them as "measured" and confirm by ear when it matters.
import { SR, lufs } from "./engine.js";
import { fftPower } from "./checks.js";

export const NOTES = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
const FLAT = { Db: "C#", Eb: "D#", Gb: "F#", Ab: "G#", Bb: "A#" };

/** "A4" | "F#3" | "Bb2" → Hz (A4 = 440) */
export function noteHz(name) {
  const m = /^([A-G])([#b]?)(-?\d)$/.exec(String(name).trim());
  if (!m) return null;
  const pc = NOTES.indexOf(FLAT[m[1] + m[2]] || m[1] + m[2]);
  return 440 * Math.pow(2, (pc - 9 + (Number(m[3]) - 4) * 12) / 12);
}
export const hzNote = (hz) => { const k = Math.round(12 * Math.log2(hz / 440)) + 57; return NOTES[((k % 12) + 12) % 12] + Math.floor(k / 12); };

// Krumhansl–Kessler key profiles
const MAJ = [6.35, 2.23, 3.48, 2.33, 4.38, 4.09, 2.52, 5.19, 2.39, 3.66, 2.29, 2.88];
const MIN = [6.33, 2.68, 3.52, 5.38, 2.6, 3.53, 2.54, 4.75, 3.98, 2.69, 3.34, 3.17];
const corr = (a, b) => {
  const ma = a.reduce((s, v) => s + v, 0) / 12, mb = b.reduce((s, v) => s + v, 0) / 12;
  let n = 0, da = 0, db = 0;
  for (let i = 0; i < 12; i++) { n += (a[i] - ma) * (b[i] - mb); da += (a[i] - ma) ** 2; db += (b[i] - mb) ** 2; }
  return n / Math.sqrt(da * db || 1);
};

function mono([L, R]) { const m = new Float64Array(L.length); for (let i = 0; i < L.length; i++) m[i] = (L[i] + (R ? R[i] : L[i])) / 2; return m; }

export function detectKey(ch, { maxSeconds = 120 } = {}) {
  const x = mono(ch), size = 8192, hop = 4096, chroma = new Array(12).fill(0);
  const end = Math.min(x.length - size, maxSeconds * SR);
  for (let s = 0; s < end; s += hop) {
    const { pw } = fftPower(x.subarray(s, s + size));
    for (let k = 1; k < pw.length; k++) {
      const hz = k * SR / (2 * (pw.length - 1));
      if (hz < 55 || hz > 2000) continue;
      const pc = ((Math.round(12 * Math.log2(hz / 440)) + 9) % 12 + 12) % 12;
      chroma[pc] += Math.sqrt(pw[k]);
    }
  }
  const cands = [];
  for (let r = 0; r < 12; r++) {
    const rot = chroma.slice(r).concat(chroma.slice(0, r));
    cands.push({ key: `${NOTES[r]} major`, root: r, mode: "major", score: corr(rot, MAJ) });
    cands.push({ key: `${NOTES[r]} minor`, root: r, mode: "minor", score: corr(rot, MIN) });
  }
  cands.sort((a, b) => b.score - a.score);
  const best = cands[0];
  const steps = best.mode === "major" ? [0, 2, 4, 5, 7, 9, 11] : [0, 2, 3, 5, 7, 8, 10];
  const scale = steps.map((s) => NOTES[(best.root + s) % 12]);
  return {
    key: best.key, confidence: +(best.score - cands[1].score).toFixed(3), runnerUp: cands[1].key,
    scale, safe: [scale[0], scale[4], scale[2]], // tonic, fifth, third: the notes that sit best for tonal SFX
    chroma: chroma.map((v) => +(v / Math.max(...chroma)).toFixed(2)),
  };
}

export function detectTempo(ch, { min = 70, max = 180 } = {}) {
  const x = mono(ch), size = 2048, hop = 512, rate = SR / hop;
  const flux = [], lowFlux = []; let prev = null;
  const lowBins = Math.ceil(160 * size / SR); // kick + bass region: where listeners feel the downbeat
  for (let s = 0; s + size < x.length; s += hop) {
    const { pw } = fftPower(x.subarray(s, s + size));
    const mag = pw.map((v) => Math.log1p(1000 * Math.sqrt(v)));
    let f = 0, lf = 0;
    if (prev) for (let k = 1; k < mag.length; k++) {
      f += Math.max(0, mag[k] - prev[k]);
      if (k <= lowBins) lf += Math.max(0, Math.sqrt(pw[k]) - prev.lin[k]); // linear: the strongest low hit (kick) wins
    }
    mag.lin = pw.map((v) => Math.sqrt(v));
    flux.push(f); lowFlux.push(lf); prev = mag;
  }
  if (flux.length < rate * 4) return { bpm: null, beats: [], confidence: 0 };
  const mean = flux.reduce((a, b) => a + b, 0) / flux.length;
  const o = flux.map((v) => Math.max(0, v - mean));
  // for the beat phase, weight low-frequency onsets: off-beat hats are often sharper than the kick
  const lmean = lowFlux.reduce((a, b) => a + b, 0) / lowFlux.length, lmax = Math.max(...lowFlux) || 1, omax = Math.max(...o) || 1;
  const op = o.map((v, i) => v / omax + 3 * Math.max(0, lowFlux[i] - lmean) / lmax);
  let best = { bpm: 0, score: -1 }; const scores = [];
  for (let bpm = min; bpm <= max; bpm += 0.5) {
    const lag = 60 * rate / bpm; let s = 0;
    for (let i = 0; i + 2 * lag < o.length; i++) s += o[i] * (o[Math.round(i + lag)] + 0.5 * o[Math.round(i + 2 * lag)]);
    s /= o.length - 2 * lag; scores.push(s);
    // a gentle preference for the 90–140 range, where most edit-friendly music sits
    const w = s * Math.exp(-0.5 * Math.pow(Math.log2(bpm / 115) / 0.9, 2));
    if (w > best.score) best = { bpm, score: w, raw: s };
  }
  // refine: a beat comb (sum of onset strength exactly on the grid) over fine tempo + phase steps
  const comb = (bpm) => {
    const lg = 60 * rate / bpm; let bestP = 0, bestS = -1;
    for (let p = 0; p < lg; p += 0.25) {
      let s = 0; for (let t = p; t < op.length - 1; t += lg) { const k = Math.floor(t), f = t - k; s += op[k] * (1 - f) + op[k + 1] * f; }
      if (s > bestS) { bestS = s; bestP = p; }
    }
    return { s: bestS, p: bestP };
  };
  let fine = { bpm: best.bpm, ...comb(best.bpm) };
  for (let bpm = best.bpm - 1.5; bpm <= best.bpm + 1.5; bpm += 0.05) { const c = comb(bpm); if (c.s > fine.s) fine = { bpm, ...c }; }
  best.bpm = +fine.bpm.toFixed(2);
  const lag = 60 * rate / best.bpm, phase = fine.p;
  // onset frames are stamped at the window start; the attack registers ~3/4 into the 2048-sample window
  const off = 0.75 * size / SR;
  let t0 = phase / rate + off; while (t0 - 60 / best.bpm >= -0.01) t0 -= 60 / best.bpm;
  const beats = []; for (let t = Math.max(t0, 0); t < x.length / SR; t += 60 / best.bpm) beats.push(+t.toFixed(3));
  const sorted = scores.slice().sort((a, b) => b - a);
  return { bpm: best.bpm, beatSeconds: +(60 / best.bpm).toFixed(4), firstBeat: beats[0] ?? 0, beats, confidence: +(best.raw / (sorted[Math.floor(sorted.length / 2)] || 1)).toFixed(2) };
}

/** Sections by energy: quiet / build / full, from short-term loudness (1 s hop). Useful for placing cuts and drops. */
export function energyMap(ch) {
  const x = mono(ch), out = [];
  for (let s = 0; s < x.length; s += SR) { let a = 0; const e = Math.min(s + SR, x.length); for (let i = s; i < e; i++) a += x[i] * x[i]; out.push(10 * Math.log10(a / Math.max(e - s, 1) + 1e-12)); }
  return out.map((v) => +v.toFixed(1));
}

export function analyseMusic(ch, opts = {}) {
  const t = detectTempo(ch), k = detectKey(ch);
  const fps = opts.fps || 30;
  return {
    duration: +(ch[0].length / SR).toFixed(2), lufs: +lufs(ch).toFixed(1),
    tempo: t.bpm ? { bpm: t.bpm, confidence: t.confidence, beatSeconds: t.beatSeconds, framesPerBeat: +(t.beatSeconds * fps).toFixed(2), firstBeat: t.firstBeat } : null,
    key: k.key, keyConfidence: k.confidence, runnerUp: k.runnerUp, scale: k.scale,
    sfxNotes: k.safe.map((n) => ({ note: n, hz: [3, 4, 5].map((o) => +noteHz(n + o).toFixed(1)) })),
    beats: t.beats, energy: energyMap(ch),
  };
}
