// Render a sound plan (JSON) into a finished stereo mix.
//
// A plan has tracks (voice, music or its stems, sfx, ambience, typing), each with clips placed in time, plus
// automation for gain and low/high-pass filters, ducking under other tracks, reverb and reverse-reverb swells.
// The master is loudness-matched and peak-limited. See skills/sound-design/references/plan-format.md.
import path from "node:path";
import { SR, lufs, kWeight, normalize, renderRecipe } from "./engine.js";
import { loadAudio } from "./audio.js";
import { renderTrack, textEvents } from "./track.js";
import { noteHz } from "./analyse.js";

const dbToGain = (db) => (db <= -120 ? 0 : Math.pow(10, db / 20));
const gainToDb = (g) => (g <= 1e-9 ? -Infinity : 20 * Math.log10(g));
const BLOCK = 32; // samples per automation step (0.67 ms)

/** "12.5" | 12.5 | "90f" (frames) | "1:02.5" (m:ss) → seconds */
export function parseTime(v, fps = 30) {
  if (typeof v === "number") return v;
  const s = String(v).trim();
  if (/^-?[\d.]+f$/.test(s)) return parseFloat(s) / fps;
  if (/^\d+:[\d.]+$/.test(s)) { const [m, x] = s.split(":"); return Number(m) * 60 + Number(x); }
  const n = Number(s); if (Number.isNaN(n)) throw new Error(`bad time "${v}" (use seconds, "90f" or "1:02.5")`);
  return n;
}

/** Automation: [[t, value, curve?], ...]; curve applies from this point to the next: lin (default), smooth, hold, exp. */
function curveFn(points, fps, domain) {
  if (points == null) return null;
  if (typeof points === "number") return () => points;
  const pts = points.map(([t, v, c]) => ({ t: parseTime(t, fps), v: domain === "log" ? Math.log2(v) : v, c: c || "lin" }))
    .sort((a, b) => a.t - b.t);
  const out = (v) => (domain === "log" ? Math.pow(2, v) : v);
  return (t) => {
    if (t <= pts[0].t) return out(pts[0].v);
    for (let i = 0; i < pts.length - 1; i++) {
      const a = pts[i], b = pts[i + 1];
      if (t < b.t) {
        let u = (t - a.t) / Math.max(b.t - a.t, 1e-9);
        if (a.c === "hold") u = 0;
        else if (a.c === "smooth") u = 0.5 - 0.5 * Math.cos(Math.PI * u);
        else if (a.c === "exp") u = u * u * u;
        return out(a.v + (b.v - a.v) * u);
      }
    }
    return out(pts[pts.length - 1].v);
  };
}

// RBJ biquad with per-block coefficients, so cutoff can move smoothly over time.
function coeffs(type, f, q) {
  f = Math.min(Math.max(f, 10), SR * 0.45);
  const w = 2 * Math.PI * f / SR, cw = Math.cos(w), al = Math.sin(w) / (2 * q);
  const lo = type === "low", b0 = lo ? (1 - cw) / 2 : (1 + cw) / 2, b1 = lo ? 1 - cw : -(1 + cw), a0 = 1 + al;
  return [b0 / a0, b1 / a0, b0 / a0, (-2 * cw) / a0, (1 - al) / a0];
}
// RBJ peaking EQ: a bell of `db` around f (0 dB passes the signal unchanged)
function peakCoeffs(f, q, db) {
  const A = Math.pow(10, db / 40), w = 2 * Math.PI * Math.min(f, SR * 0.45) / SR, cw = Math.cos(w), al = Math.sin(w) / (2 * q);
  const a0 = 1 + al / A;
  return [(1 + al * A) / a0, (-2 * cw) / a0, (1 - al * A) / a0, (-2 * cw) / a0, (1 - al / A) / a0];
}
// A band dip that follows a gain curve (dB per block): a dynamic EQ, used to carve a pocket for the voice.
function movingBell(ch, [lo, hi], dbAtBlock) {
  const f0 = Math.sqrt(lo * hi), oct = Math.log2(hi / lo), q = Math.sqrt(Math.pow(2, oct)) / (Math.pow(2, oct) - 1);
  for (const x of ch) {
    let x1 = 0, x2 = 0, y1 = 0, y2 = 0, c = null;
    for (let i = 0; i < x.length; i++) {
      if (i % BLOCK === 0) { const db = dbAtBlock(i / BLOCK); c = db > -0.05 ? null : peakCoeffs(f0, q, db); }
      const v = c ? c[0] * x[i] + c[1] * x1 + c[2] * x2 - c[3] * y1 - c[4] * y2 : x[i];
      x2 = x1; x1 = x[i]; y2 = y1; y1 = v; x[i] = v;
    }
  }
}

function movingFilter(ch, type, freqAt, q, t0 = 0) {
  for (const x of ch) {
    let x1 = 0, x2 = 0, y1 = 0, y2 = 0, c = null;
    for (let i = 0; i < x.length; i++) {
      if (i % BLOCK === 0) {
        const f = freqAt(t0 + i / SR);
        // fully open filters are skipped (no colouring when not in use)
        c = (type === "low" && f >= 19500) || (type === "high" && f <= 12) ? null : coeffs(type, f, q);
      }
      const v = c ? c[0] * x[i] + c[1] * x1 + c[2] * x2 - c[3] * y1 - c[4] * y2 : x[i];
      x2 = x1; x1 = x[i]; y2 = y1; y1 = v; x[i] = v;
    }
  }
}

// Small stereo reverb (Freeverb-style: 8 combs + 4 allpasses per side). Returns the wet signal only.
function reverb([L, R], { size = 0.6, damp = 0.4, predelay = 0.02, tail = 2 } = {}) {
  const n = L.length + Math.floor(tail * SR), pre = Math.floor(predelay * SR);
  const combs = [1116, 1188, 1277, 1356, 1422, 1491, 1557, 1617].map((d) => Math.round(d * SR / 44100));
  const aps = [556, 441, 341, 225].map((d) => Math.round(d * SR / 44100));
  const fb = 0.7 + 0.28 * size;
  const side = (x, spread) => {
    const y = new Float64Array(n), cb = combs.map((d) => ({ b: new Float64Array(d + spread), i: 0, s: 0 }));
    const ab = aps.map((d) => ({ b: new Float64Array(d + spread), i: 0 }));
    for (let i = 0; i < n; i++) {
      const inp = (i - pre >= 0 && i - pre < x.length ? x[i - pre] : 0) * 0.015;
      let o = 0;
      for (const c of cb) { const v = c.b[c.i]; c.s = v * (1 - damp) + c.s * damp; c.b[c.i] = inp + c.s * fb; c.i = (c.i + 1) % c.b.length; o += v; }
      for (const a of ab) { const v = a.b[a.i]; a.b[a.i] = o + v * 0.5; o = v - o; a.i = (a.i + 1) % a.b.length; }
      y[i] = o;
    }
    return y;
  };
  return [side(L, 0), side(R, 23)];
}

function varispeed(ch, semis) {
  if (!semis) return ch;
  const r = Math.pow(2, semis / 12);
  return ch.map((x) => {
    const n = Math.floor(x.length / r), y = new Float64Array(n);
    for (let i = 0; i < n; i++) { const p = i * r, k = Math.floor(p), f = p - k; y[i] = x[k] * (1 - f) + (x[k + 1] ?? 0) * f; }
    return y;
  });
}

function clipSource(clip, ctx) {
  if (clip.file) return loadAudio(path.resolve(ctx.base, clip.file));
  if (clip.sound) {
    const r = ctx.sounds[clip.sound];
    if (!r) throw new Error(`unknown sound "${clip.sound}" (looked in ${ctx.sfxDir})`);
    const set = Object.fromEntries(Object.entries(clip.set || {}).map(([k, v]) => [k, typeof v === "string" ? noteHz(v) ?? Number(v) : v]));
    for (const [k, v] of Object.entries(set)) if (!Number.isFinite(v)) throw new Error(`clip "${clip.sound}": set.${k} must be a number or a note name like E5`);
    const x = renderRecipe(normalize(r), set, -6);
    return [x, x];
  }
  if (clip.typing) {
    const t = clip.typing, events = t.events || textEvents(t.text, { start: 0, cps: t.cps ?? 18, per: t.per || "char", sound: t.sound }).events;
    if (t.endChime) events.push({ t: Math.max(0, ...events.map((e) => e.t)) + 0.18, sound: "chime" });
    return renderTrack(events, ctx.sounds, { sound: t.sound || "tap", lufs: t.lufs ?? -30, seed: t.seed ?? 1 }).channels;
  }
  if (clip.silence != null) return [new Float64Array(0), new Float64Array(0)];
  throw new Error("each clip needs file, sound, typing or silence");
}

function renderClip(clip, ctx) {
  const fps = ctx.fps;
  let ch = clipSource(clip, ctx).map((c) => c);
  const from = Math.floor(parseTime(clip.from ?? 0, fps) * SR);
  const len = clip.length != null ? Math.floor(parseTime(clip.length, fps) * SR) : ch[0].length - from;
  ch = ch.map((c) => c.slice(from, from + Math.max(len, 0)));
  if (clip.reverse) ch = ch.map((c) => c.slice().reverse());
  ch = varispeed(ch, clip.semitones || 0);
  const n = ch[0].length, g = dbToGain(clip.gain ?? 0);
  const fi = Math.floor(parseTime(clip.fadeIn ?? 0.003, fps) * SR), fo = Math.floor(parseTime(clip.fadeOut ?? 0.01, fps) * SR);
  for (const c of ch) for (let i = 0; i < n; i++) {
    let e = g;
    if (i < fi) e *= Math.sin(Math.PI / 2 * i / fi);
    if (i >= n - fo) e *= Math.sin(Math.PI / 2 * (n - i) / fo);
    c[i] *= e;
  }
  const pan = clip.pan ?? 0;
  if (pan) { const a = (pan + 1) * Math.PI / 4; ch = [ch[0].map((v) => v * Math.cos(a) * Math.SQRT2), ch[1].map((v) => v * Math.sin(a) * Math.SQRT2)]; }
  // reverse-reverb swell: a reverb tail that grows into the clip's first moment
  let lead = null;
  if (clip.swell) {
    const sw = parseTime(clip.swell, fps), head = ch.map((c) => c.slice(0, Math.floor(0.35 * SR)).reverse());
    // reverse → reverb → reverse: the reverb tail now grows towards the hit; keep the last `swell` seconds before it
    const swN = Math.floor(sw * SR);
    lead = reverb(head, { size: 0.85, damp: 0.3, predelay: 0, tail: sw }).map((c) => {
      const r = c.slice().reverse(), hitAt = r.length - head[0].length; // where the (reversed back) hit begins
      return r.slice(Math.max(0, hitAt - swN), hitAt);
    });
    const pk = Math.max(...lead.map((c) => c.reduce((m, v) => Math.max(m, Math.abs(v)), 0))) || 1;
    const ref = Math.max(...ch.map((c) => c.reduce((m, v) => Math.max(m, Math.abs(v)), 0))) || 1;
    const ln = lead[0].length; // shape it as a rise from nothing, so the moment before still reads as quiet
    lead = lead.map((c) => c.map((v, i) => v / pk * ref * dbToGain(clip.swellGain ?? -6) * Math.pow(i / ln, 2)));
  }
  return { ch, lead };
}

/** plan → { channels:[L,R], tracks:{name:[L,R]}, report } */
export function renderMix(plan, { base = ".", sounds = {}, sfxDir = "sfx" } = {}) {
  const fps = plan.fps || 30, ctx = { fps, base, sounds, sfxDir };
  const tracks = (plan.tracks || []).filter((t) => !t.mute);
  const solo = tracks.filter((t) => t.solo);
  const live = solo.length ? solo : tracks;

  // 1. clips → one stereo buffer per track
  const rendered = live.map((t) => {
    const clips = (t.clips || []).map((c) => ({ c, at: parseTime(c.at ?? 0, fps), ...renderClip(c, ctx) }));
    return { t, clips };
  });
  const endOf = (r) => Math.max(0, ...r.clips.map((k) => k.at + k.ch[0].length / SR));
  const dur = plan.duration != null ? parseTime(plan.duration, fps) : Math.max(0, ...rendered.map(endOf)) + 0.5;
  const N = Math.ceil(dur * SR);
  const bus = {};
  for (const { t, clips } of rendered) {
    const L = new Float64Array(N), R = new Float64Array(N);
    for (const k of clips) {
      const s = Math.round(k.at * SR);
      for (let i = 0; i < k.ch[0].length; i++) { const j = s + i; if (j >= 0 && j < N) { L[j] += k.ch[0][i]; R[j] += k.ch[1][i]; } }
      if (k.lead) { const ls = s - k.lead[0].length; for (let i = 0; i < k.lead[0].length; i++) { const j = ls + i; if (j >= 0 && j < N) { L[j] += k.lead[0][i]; R[j] += k.lead[1][i]; } } }
    }
    bus[t.name] = [L, R];
  }

  // 2. per-track filters, reverb, gain + automation
  for (const { t } of rendered) {
    const ch = bus[t.name], a = t.automation || {};
    const hp = curveFn(a.highpass ?? t.highpass, fps, "log"), lp = curveFn(a.lowpass ?? t.lowpass, fps, "log");
    if (hp) movingFilter(ch, "high", hp, t.q ?? Math.SQRT1_2);
    if (lp) movingFilter(ch, "low", lp, t.q ?? Math.SQRT1_2);
    if (t.reverb) {
      const r = typeof t.reverb === "number" ? { mix: t.reverb } : t.reverb;
      const wet = reverb(ch, { ...r, tail: 0 }), m = r.mix ?? 0.2;
      for (let c = 0; c < 2; c++) for (let i = 0; i < N; i++) ch[c][i] = ch[c][i] * (1 - m * 0.5) + wet[c][i] * m * 4;
    }
    const g = curveFn(a.gain, fps, "lin"), base0 = t.gain ?? 0;
    applyGain(ch, (tt) => base0 + (g ? g(tt) : 0));
  }

  // 3. ducking (sidechain): computed from the key tracks after their own gain, before anyone is ducked
  const keyEnv = {};
  const env = (name) => {
    if (keyEnv[name]) return keyEnv[name];
    const [L, R] = bus[name] || [], w = Math.floor(0.03 * SR), e = new Float64Array(Math.ceil(N / BLOCK));
    if (!L) throw new Error(`duck: no track named "${name}"`);
    for (let b = 0; b < e.length; b++) {
      let s = 0, cnt = 0; const c0 = b * BLOCK;
      for (let i = Math.max(0, c0 - w); i < Math.min(N, c0 + w); i += 4) { s += L[i] * L[i] + R[i] * R[i]; cnt++; }
      e[b] = 10 * Math.log10(s / Math.max(cnt, 1) / 2 + 1e-12);
    }
    return (keyEnv[name] = e);
  };
  const duckLog = [];
  for (const { t } of rendered) {
    if (!t.duck) continue;
    const d = t.duck, keys = [].concat(d.under), amt = d.amount ?? -10, thr = d.threshold ?? -45;
    const look = Math.round((d.lookahead ?? 0.04) * SR / BLOCK);
    const atk = Math.exp(-BLOCK / ((d.attack ?? 0.06) * SR)), rel = Math.exp(-BLOCK / ((d.release ?? 0.4) * SR));
    const envs = keys.map(env), nb = envs[0].length;
    const hold = Math.round((d.hold ?? 0.3) * SR / BLOCK); // stay down through short gaps between words
    let cur = 0, active = 0, lastOn = -1e9;
    const dbs = new Float64Array(nb);
    for (let b = 0; b < nb; b++) {
      if (envs.some((e) => e[Math.min(b + look, nb - 1)] > thr)) lastOn = b;
      const on = b - lastOn <= hold, target = on ? amt : 0;
      cur = target < cur ? target + (cur - target) * atk : target + (cur - target) * rel;
      if (on) active++;
      dbs[b] = cur;
    }
    if (d.band) {
      // a pocket: only this band of the track dips (e.g. [1000, 4000] under speech), the rest keeps its level
      const [lo, hi] = d.band.map(Number);
      if (!(lo > 0 && hi > lo)) throw new Error(`duck.band on "${t.name}" must be [low Hz, high Hz]`);
      movingBell(bus[t.name], [lo, hi], (b) => dbs[Math.min(b, nb - 1)]);
    } else applyGain(bus[t.name], (tt) => dbs[Math.min(Math.floor(tt * SR / BLOCK), nb - 1)]);
    duckLog.push({ track: t.name, under: keys, seconds: +(active * BLOCK / SR).toFixed(2), amount: amt, ...(d.band ? { band: d.band } : {}) });
  }

  // 4. master: sum, master automation, loudness match, limiter
  const L = new Float64Array(N), R = new Float64Array(N);
  for (const { t } of rendered) { if (t.keyOnly) continue; const [a, b] = bus[t.name]; for (let i = 0; i < N; i++) { L[i] += a[i]; R[i] += b[i]; } }
  const m = plan.master || {}, ma = m.automation || {};
  const mhp = curveFn(ma.highpass, fps, "log"), mlp = curveFn(ma.lowpass, fps, "log"), mg = curveFn(ma.gain, fps, "lin");
  if (mhp) movingFilter([L, R], "high", mhp, Math.SQRT1_2);
  if (mlp) movingFilter([L, R], "low", mlp, Math.SQRT1_2);
  if (mg) applyGain([L, R], mg);
  const target = m.lufs ?? -14, ceiling = m.ceiling ?? -1;
  const before = lufs([L, R]);
  const makeup = Number.isFinite(before) ? dbToGain(target - before) : 1;
  for (let i = 0; i < N; i++) { L[i] *= makeup; R[i] *= makeup; }
  const gr = limit([L, R], dbToGain(ceiling));
  // inter-sample peaks can exceed the sample ceiling after D/A or lossy encoding: trim to the true-peak ceiling
  const tp = truePeakDb([L, R]);
  if (tp > ceiling) { const k = dbToGain(ceiling - tp - 0.05); for (let i = 0; i < N; i++) { L[i] *= k; R[i] *= k; } }
  const f = Math.min(Math.floor(0.02 * SR), N);
  for (let i = N - f; i < N; i++) { const e = (N - i) / f; L[i] *= e; R[i] *= e; }

  for (const { t } of rendered) if (t.keyOnly) delete bus[t.name];
  return { channels: [L, R], tracks: bus, report: report(plan, rendered, bus, [L, R], { dur, target, ceiling, gr, duckLog, fps }) };
}

// Gain automation (dB as a function of time), sampled per block and smoothed per sample (~3 ms) so steps never click.
function applyGain(ch, dbAt) {
  const n = ch[0].length, k = 1 - Math.exp(-1 / (0.003 * SR));
  let g = dbToGain(dbAt(0)), target = g;
  for (let i = 0; i < n; i++) {
    if (i % BLOCK === 0) target = dbToGain(dbAt(i / SR));
    g += (target - g) * k;
    for (const c of ch) c[i] *= g;
  }
}

// True peak (dBTP) by 4x oversampling with a windowed-sinc interpolator, as BS.1770 suggests.
export function truePeakDb(ch) {
  const taps = 12, phases = [1, 2, 3].map((p) => {
    const h = []; for (let j = -taps + 1; j <= taps; j++) { const x = j - p / 4; const w = 0.5 + 0.5 * Math.cos(Math.PI * x / taps); h.push(x === 0 ? 1 : Math.sin(Math.PI * x) / (Math.PI * x) * w); }
    return h;
  });
  let pk = 0;
  for (const x of ch) for (let i = taps; i < x.length - taps; i++) {
    pk = Math.max(pk, Math.abs(x[i]));
    if (Math.abs(x[i]) < 0.25 * pk) continue; // far below the running peak: cannot set a new one
    for (const h of phases) { let v = 0; for (let j = 0; j < h.length; j++) v += h[j] * x[i - taps + 1 + j]; pk = Math.max(pk, Math.abs(v)); }
  }
  return gainToDb(pk);
}

// Look-ahead peak limiter (5 ms look-ahead, 80 ms release). Returns the deepest gain reduction in dB.
function limit([L, R], ceil) {
  const n = L.length, la = Math.floor(0.005 * SR), rel = Math.exp(-1 / (0.08 * SR));
  const need = new Float64Array(n);
  for (let i = 0; i < n; i++) { const p = Math.max(Math.abs(L[i]), Math.abs(R[i])); need[i] = p > ceil ? ceil / p : 1; }
  // minimum over the look-ahead window (simple deque)
  const minAhead = new Float64Array(n), dq = [];
  for (let i = n - 1; i >= 0; i--) {
    while (dq.length && need[dq[dq.length - 1]] >= need[i]) dq.pop();
    dq.push(i);
    while (dq[0] > i + la) dq.shift();
    minAhead[i] = need[dq[0]];
  }
  let g = 1, worst = 1;
  for (let i = 0; i < n; i++) {
    const t = minAhead[i];
    g = t < g ? t : t + (g - t) * rel;
    L[i] *= g; R[i] *= g; worst = Math.min(worst, g);
  }
  for (let i = 0; i < n; i++) { L[i] = Math.max(-ceil, Math.min(ceil, L[i])); R[i] = Math.max(-ceil, Math.min(ceil, R[i])); }
  return gainToDb(worst);
}

// Loudness in 1 s windows (0.5 s hop) of a stereo buffer, as an array of LUFS values; window i starts at i * 0.5 s.
function shortTerm(ch) {
  const kw = ch.map(kWeight), w = SR, hop = SR / 2, out = [];
  for (let s = 0; s < kw[0].length; s += hop) {
    let tot = 0; const e = Math.min(s + w, kw[0].length);
    for (const c of kw) { let a = 0; for (let i = s; i < e; i += 2) a += c[i] * c[i]; tot += a / Math.max((e - s) / 2, 1); }
    out.push(-0.691 + 10 * Math.log10(tot + 1e-20));
  }
  return out;
}

function report(plan, rendered, bus, master, { dur, target, ceiling, gr, duckLog, fps }) {
  const r = { duration: +dur.toFixed(2), lufs: +lufs(master).toFixed(1), target, ceiling, limiterDb: +gr.toFixed(1), tracks: {}, ducking: duckLog, warnings: [] };
  let pk = 0; for (const c of master) for (const v of c) pk = Math.max(pk, Math.abs(v));
  r.peakDb = +gainToDb(pk).toFixed(1);
  r.truePeakDb = +truePeakDb(master).toFixed(1);
  const st = {};
  rendered = rendered.filter(({ t }) => bus[t.name]);
  for (const { t } of rendered) {
    const l = lufs(bus[t.name]);
    r.tracks[t.name] = { role: t.role || "", lufs: Number.isFinite(l) ? +l.toFixed(1) : null, clips: (t.clips || []).length };
    st[t.name] = shortTerm(bus[t.name]);
  }
  if (gr < -6) r.warnings.push(`limiter is working hard (${gr.toFixed(1)} dB): lower the loudest track or the master target`);
  // voice clarity: while a voice is talking, music/ambience should sit well below it
  const voices = rendered.filter(({ t }) => t.role === "voice").map(({ t }) => t.name);
  const beds = rendered.filter(({ t }) => ["music", "stem", "ambience"].includes(t.role)).map(({ t }) => t.name);
  for (const v of voices) for (const b of beds) {
    const close = [];
    const bad = st[v].map((lv, i) => lv > -40 && st[b][i] > lv - 8);
    bad.forEach((x, i) => { if (x && (bad[i - 1] || bad[i + 1])) close.push(i * 0.5 + 0.5); }); // ignore a lone window at a voice entry
    if (close.length) r.warnings.push(`"${b}" is within 8 LU of voice "${v}" around ${fmtTimes(close)} s: duck it more, or carve a pocket for the voice with duck.band`);
  }
  // crowding (Murch's "two and a half" rule): too many separate foreground sounds starting at once
  const fg = [];
  for (const { t, clips } of rendered) if (["sfx", "foley"].includes(t.role)) for (const k of clips) fg.push({ s: k.at, e: k.at + Math.min(k.ch[0].length / SR, 0.6) });
  const crowded = [];
  for (const a of fg) { const n = fg.filter((b) => b.s < a.e && b.e > a.s).length; if (n > 3) crowded.push(a.s); }
  if (crowded.length) r.warnings.push(`more than 3 foreground sounds overlap around ${fmtTimes(crowded)} s: listeners can follow about two at once, so drop or delay some`);
  // silences: deliberate ones work (the picture explains them, they are short and end on the beat); accidental ones
  // read as a broken player. Silences inside the plan's `gaps` ([[start, end], ...] in seconds) are intended.
  const W = Math.floor(0.05 * SR), lv = [];
  for (let s = 0; s + W <= master[0].length; s += W) { let a = 0; for (let i = s; i < s + W; i++) a += master[0][i] ** 2 + master[1][i] ** 2; lv.push(10 * Math.log10(a / W / 2 + 1e-20)); }
  const gaps = (plan.gaps || []).map(([a, b]) => [parseTime(a, fps), parseTime(b, fps)]);
  const loudIdx = lv.map((v, i) => (v > -50 ? i : -1)).filter((i) => i >= 0);
  if (loudIdx.length) {
    const first = loudIdx[0], last = loudIdx[loudIdx.length - 1];
    for (let i = first, run = 0; i <= last; i++) {
      run = lv[i] < -60 ? run + 1 : 0;
      if (run * 0.05 >= 0.2 && lv[i + 1] >= -60) {
        const s0 = (i - run + 1) * 0.05, s1 = (i + 1) * 0.05;
        if (gaps.some(([a, b]) => s0 >= a - 0.05 && s1 <= b + 0.05)) continue;
        r.warnings.push(`the mix is silent for ${(run * 0.05).toFixed(2)} s at ${s0.toFixed(2)} s: if it is meant, list it in the plan's "gaps" (it works when the picture explains it and it ends on the beat); if not, keep something carrying (a tail, a thinned pad, a swell)`);
      }
    }
  }
  if (Math.abs(r.lufs - target) > 1.5) r.warnings.push(`final loudness ${r.lufs} LUFS misses the ${target} target (limited by the ceiling): reduce peaks`);
  return r;
}
const fmtTimes = (ts) => [...new Set(ts.map((t) => t.toFixed(1)))].slice(0, 6).join(", ");
