// Spot a video you did not make: where the picture changes and where it rests, what its soundtrack does, and how
// the two line up. Use it before scoring a finished video, or to learn from a reference video you like.
// Needs ffmpeg and ffprobe on PATH. Everything is measured, not heard: report it as measured.
import { spawnSync } from "node:child_process";
import { SR, lufs } from "./engine.js";
import { fftPower } from "./checks.js";
import { loadAudio } from "./audio.js";
import { detectTempo, detectKey, NOTES } from "./analyse.js";

const run = (cmd, args) => {
  const r = spawnSync(cmd, args, { maxBuffer: 1 << 30 });
  if (r.error) throw new Error(`${cmd} not found: spot needs ffmpeg and ffprobe on PATH`);
  if (r.status !== 0) throw new Error(`${cmd} failed: ${r.stderr?.toString().trim().split("\n").pop()}`);
  return r.stdout;
};
const median = (a) => { const s = Array.from(a).sort((x, y) => x - y); return s.length ? s[Math.floor(s.length / 2)] : 0; };
const mean = (a) => (a.length ? a.reduce((s, v) => s + v, 0) / a.length : 0);
const r2 = (v) => +v.toFixed(2);
const db = (p) => 10 * Math.log10(p + 1e-20);
const max = (a) => { let m = -Infinity; for (const v of a) if (v > m) m = v; return m; };
const min = (a) => { let m = Infinity; for (const v of a) if (v < m) m = v; return m; };

export function probe(file) {
  const j = JSON.parse(run("ffprobe", ["-v", "error", "-show_entries", "stream=codec_type,avg_frame_rate,r_frame_rate,width,height:format=duration", "-of", "json", file]).toString());
  const v = (j.streams || []).find((s) => s.codec_type === "video");
  if (!v) throw new Error(`${file} has no video stream (for music alone use: sfx-tool analyse)`);
  const rate = (s) => { const [a, b] = String(s || "0/1").split("/").map(Number); return b ? a / b : 0; };
  const fps = rate(v.avg_frame_rate) || rate(v.r_frame_rate) || 30;
  return { duration: +Number(j.format.duration).toFixed(3), fps: +fps.toFixed(3), width: v.width, height: v.height, hasAudio: j.streams.some((s) => s.codec_type === "audio") };
}

// ---------- picture: frame-to-frame change on a 64×36 grey copy
const PW = 64, PH = 36, PX = PW * PH;
function picture(file, fps) {
  const raw = run("ffmpeg", ["-v", "error", "-i", file, "-an", "-vf", `fps=${fps},scale=${PW}:${PH}:flags=area,format=gray`, "-f", "rawvideo", "-"]);
  const n = Math.floor(raw.length / PX), diff = new Float64Array(n), hd = new Float64Array(n), frac = new Float64Array(n);
  let prevH = null;
  for (let f = 0; f < n; f++) {
    const o = f * PX, h = new Float64Array(16);
    let d = 0, changed = 0;
    for (let i = 0; i < PX; i++) { const v = raw[o + i]; h[v >> 4]++; if (f) { const dd = Math.abs(v - raw[o - PX + i]); d += dd; if (dd > 24) changed++; } }
    diff[f] = f ? d / PX : 0;
    frac[f] = changed / PX;
    if (prevH) { let s = 0; for (let k = 0; k < 16; k++) s += Math.abs(h[k] - prevH[k]); hd[f] = s / (2 * PX); }
    prevH = h;
  }
  const t = (f) => r2(f / fps);
  // one frame changes far more than the frames around it: a cut when most of the frame changes (a new shot),
  // a pop when part of it does (a card, an image or a word appears or swaps in a single frame)
  const cuts = [], pops = [], win = Math.max(3, Math.round(fps / 2));
  for (let f = 1; f < n; f++) {
    const around = []; for (let g = f - win; g <= f + win; g++) if (g > 0 && g < n && Math.abs(g - f) > 1) around.push(diff[g]);
    const local = median(around);
    if (diff[f] >= 12 && diff[f] >= 3 * local + 4 && (hd[f] >= 0.12 || diff[f] >= 30) && diff[f] >= (diff[f - 1] || 0) && diff[f] >= (diff[f + 1] || 0))
      (frac[f] >= 0.4 ? cuts : pops).push({ t: t(f), strength: r2(diff[f]), changedPct: Math.round(frac[f] * 100) });
  }
  // moves: peaks of motion that stand out from the motion around them (a card landing, a swipe, a scene sliding in);
  // steady motion (a slow pan) is motion, not a moment. At most one per 0.25 s, away from cuts and pops.
  const sm = diff.map((_, f) => (diff[Math.max(1, f - 1)] + diff[f] + diff[Math.min(n - 1, f + 1)]) / 3);
  const gap = Math.round(fps * 0.25), sec = Math.round(fps), moves = [];
  for (let f = 2; f < n - 1; f++) {
    if (sm[f] < 0.3 || [...cuts, ...pops].some((c) => Math.abs(c.t * fps - f) <= 2)) continue;
    let top = true; for (let g = f - gap; g <= f + gap; g++) if (g !== f && g > 0 && g < n && sm[g] > sm[f]) { top = false; break; }
    if (!top) continue;
    const local = median(Array.from(sm.subarray(Math.max(1, f - sec), Math.min(n, f + sec + 1))));
    if (sm[f] >= 2 * local && !moves.some((m) => Math.abs(m.f - f) < gap)) moves.push({ f, t: t(f), strength: r2(sm[f]) });
  }
  // holds: the picture rests for 0.5 s or more (room for a breath, a ring-out, an end card); "still" scales with how
  // much this video usually moves, so a quiet typing film and a busy montage are both read fairly
  const still = Math.min(0.4, Math.max(0.05, median(sm)));
  const holds = []; let s0 = -1;
  for (let f = 1; f <= n; f++) {
    const isStill = f < n && sm[f] < still;
    if (isStill && s0 < 0) s0 = f;
    if (!isStill && s0 >= 0) { if ((f - s0) / fps >= 0.5) holds.push([t(s0), t(f)]); s0 = -1; }
  }
  const perSecond = []; for (let s = 0; s * fps < n; s++) perSecond.push(r2(mean(Array.from(diff.subarray(Math.round(s * fps), Math.round((s + 1) * fps))))));
  return { cuts, pops, moves: moves.map(({ t: tt, strength }) => ({ t: tt, strength })), holds, motionPerSecond: perSecond };
}

// ---------- sound: bands, breaks, entries, tempo, key, groove, repetition
const BANDS = [["sub <80", 20, 80], ["low 80-250", 80, 250], ["mid 250-2k", 250, 2000], ["presence 2-5k", 2000, 5000], ["air >5k", 5000, 16000]];
function lowpass(x, hz) { const a = Math.exp(-2 * Math.PI * hz / SR), y = new Float64Array(x.length); let s1 = 0, s2 = 0; for (let i = 0; i < x.length; i++) { s1 = x[i] + (s1 - x[i]) * a; s2 = s1 + (s2 - s1) * a; y[i] = s2; } return y; }
function env10(x) { const w = SR / 100, out = new Float64Array(Math.floor(x.length / w)); for (let b = 0; b < out.length; b++) { let a = 0; for (let i = b * w; i < (b + 1) * w; i++) a += x[i] * x[i]; out[b] = db(a / w); } return out; }
const smooth = (e, k) => e.map((_, i) => { let s = 0, c = 0; for (let j = i - k; j <= i + k; j++) if (j >= 0 && j < e.length) { s += Math.pow(10, e[j] / 10); c++; } return db(s / c); });

function sound(file) {
  const ch = loadAudio(file), n = ch[0].length;
  const L = n ? lufs(ch) : -Infinity;
  if (!n || !Number.isFinite(L) || L < -70) return { silent: true };
  const x = new Float64Array(n); for (let i = 0; i < n; i++) x[i] = (ch[0][i] + ch[1][i]) / 2;
  let side = 0, midE = 0; for (let i = 0; i < n; i += 4) { side += ((ch[0][i] - ch[1][i]) / 2) ** 2; midE += x[i] * x[i]; }

  // band levels per 0.5 s and the overall balance
  const size = 4096, hop = SR / 2, frames = Math.floor(n / hop), bandPw = BANDS.map(() => new Float64Array(frames)), tot = BANDS.map(() => 0);
  for (let f = 0; f < frames; f++) {
    const seg = new Float64Array(size), c = f * hop + hop / 2 - size / 2;
    for (let i = 0; i < size; i++) seg[i] = x[c + i] ?? 0;
    const { pw } = fftPower(seg);
    for (let k = 1; k < pw.length; k++) { const hz = k * SR / size; BANDS.forEach(([, lo, hi], b) => { if (hz >= lo && hz < hi) { bandPw[b][f] += pw[k]; tot[b] += pw[k]; } }); }
  }
  const all = tot.reduce((a, b) => a + b, 0) || 1;
  const balance = Object.fromEntries(BANDS.map(([name], b) => [name, Math.round(tot[b] / all * 100)]));
  const bandLevels = Object.fromEntries(BANDS.map(([name], b) => { const v = Array.from(bandPw[b], db), mx = max(v); return [name, v.map((d) => Math.round(d - mx))]; }));

  // breaks (the whole track ≥ 15 dB under its usual level for ≥ 0.25 s) and entries (the low end jumps in)
  const e = smooth(env10(x), 5), le = smooth(env10(lowpass(x, 150)), 3), eMax = max(e);
  const active = Array.from(e).map((v, i) => (v > eMax - 40 ? i : -1)).filter((i) => i >= 0);
  const a0 = active[0] ?? 0, a1 = active[active.length - 1] ?? e.length - 1, usual = median(e.slice(a0, a1 + 1));
  const breaks = []; let b0 = -1;
  for (let i = a0; i <= a1 + 1; i++) {
    const low = i <= a1 && e[i] < usual - 15;
    if (low && b0 < 0) b0 = i;
    if (!low && b0 >= 0) {
      if (i - b0 >= 25) {
        const mn = min(e.slice(b0, i)), last = breaks[breaks.length - 1], b = { start: r2(b0 / 100), end: r2(i / 100), depthDb: Math.round(usual - mn), nearSilent: mn < -60, hitsInside: 0 };
        // a break with one short hit inside it is still one break
        if (last && b.start - last.end < 0.4) Object.assign(last, { end: b.end, depthDb: Math.max(last.depthDb, b.depthDb), nearSilent: last.nearSilent || b.nearSilent, hitsInside: last.hitsInside + 1 });
        else breaks.push(b);
      }
      b0 = -1;
    }
  }
  // the low end comes in: a sharp rise, and the half second after it is mostly low end where most of the 1.5 s
  // before had none (a gap of a beat or two inside a groove, or one hit inside a silence, is not an entry)
  const lowUsual = median(le.slice(a0, a1 + 1)), entries = [];
  const pct = (a, q) => { const s = Array.from(a).sort((p, r) => p - r); return s[Math.floor(q * (s.length - 1))]; };
  for (let i = 30; i < le.length - 50; i++) {
    if (le[i] - le[i - 3] < 6) continue;
    const before = pct(le.slice(Math.max(0, i - 150), i - 3), 0.6), after = median(le.slice(i, i + 50));
    if (after - before >= 12 && after >= lowUsual - 6 && !entries.some((t) => i / 100 - t < 1.5)) entries.push(r2(i / 100));
  }

  const tempo = detectTempo(ch), key = detectKey(ch);
  const out = { lufs: +L.toFixed(1), stereoWidth: Math.round(side / (midE || 1) * 100), balance, bandLevels, breaks, entries, key: { key: key.key, margin: key.confidence, runnerUp: key.runnerUp } };
  if (!tempo.bpm) return out;

  // onsets (spectral flux) for the groove, and the low band separately for the beat and the bar
  const fs2 = 2048, oh = 512, onsets = [];
  let prev = null; const flux = [], lflux = [];
  for (let s = 0; s + fs2 < n; s += oh) {
    const { pw } = fftPower(x.subarray(s, s + fs2)), mag = pw.map((v) => Math.log1p(100 * Math.sqrt(v)));
    let f = 0, lf = 0;
    if (prev) for (let k = 1; k < mag.length; k++) { const d = Math.max(0, mag[k] - prev[k]); f += d; if (k * SR / fs2 < 150) lf += d; }
    flux.push(f); lflux.push(lf); prev = mag;
  }
  const fm = median(flux), fsd = Math.sqrt(mean(flux.map((v) => (v - fm) ** 2))) || 1, minGap = Math.round(0.06 * SR / oh);
  for (let i = 1; i < flux.length - 1; i++) {
    const z = (flux[i] - fm) / fsd;
    if (z > 1.8 && flux[i] >= flux[i - 1] && flux[i] >= flux[i + 1] && !(onsets.length && i - onsets[onsets.length - 1].i < minGap)) onsets.push({ i, t: (i * oh + 0.75 * fs2) / SR });
  }
  // a beat grid needs hits to stand on: a drone, a pad or speech alone gets none
  if (onsets.length < Math.max(8, 0.5 * n / SR)) return out;
  const beat = tempo.beatSeconds, s16 = beat / 4, end = n / SR, barLen = 4 * beat;
  const lowAt = (t) => { const c = Math.round((t * SR - 0.75 * fs2) / oh); let m = 0; for (let j = c - 2; j <= c + 2; j++) m = Math.max(m, lflux[j] || 0); return m; };
  // the grid is fitted per section between breaks: music that was cut or re-entered at a break can come back off the old grid
  const edges = [0, ...breaks.flatMap((b) => [b.start, b.end]), end], spans = [];
  for (let k = 0; k < edges.length; k += 2) if (edges[k + 1] - edges[k] >= 2 * barLen) spans.push([edges[k], edges[k + 1]]);
  if (!spans.length) spans.push([0, end]);
  const grids = spans.map(([from, to]) => {
    const on = onsets.filter(({ t }) => t >= from && t < to);
    // 1. fine phase: move the grid (by up to half a 16th) to where the onsets fall
    let shift = 0, bestFit = -1;
    for (let k = -4; k <= 4; k++) {
      const o = tempo.firstBeat + k * beat / 32;
      const fit = mean(on.map(({ t }) => (Math.abs(((t - o) / s16 + 0.5) % 1 - 0.5) < 0.12 ? 1 : 0)));
      if (fit > bestFit) { bestFit = fit; shift = k * beat / 32; }
    }
    let start = tempo.firstBeat + shift; start += Math.ceil((from - start) / s16 - 1e-6) * s16;
    // 2. which 16th is the beat, and 3. which beat starts the bar: where the low end hits hardest
    const per16 = new Array(16).fill(0);
    for (let j = 0; start + j * s16 < to; j++) per16[j % 16] += lowAt(start + j * s16);
    const onBeat = [0, 1, 2, 3].map((p) => per16[p] + per16[p + 4] + per16[p + 8] + per16[p + 12]), p4 = onBeat.indexOf(max(onBeat));
    const p16 = [p4, p4 + 4, p4 + 8, p4 + 12].reduce((b, p) => (per16[p] > per16[b] ? p : b), p4);
    return { from: r2(from), to: r2(to), firstBeat: start + p4 * s16, firstBar: start + p16 * s16 };
  });
  const beats = [], bars = [], gridShifts = [];
  for (const g of grids) {
    for (let t = g.firstBeat; t < g.to; t += beat) beats.push(r2(Math.max(0, t)));
    for (let t = g.firstBar; t < g.to; t += barLen) bars.push(r2(Math.max(0, t)));
  }
  for (const g of grids.slice(1)) {
    let d = ((g.firstBeat - grids[0].firstBeat) % beat + beat) % beat; if (d > beat / 2) d -= beat;
    if (Math.abs(d) > 0.04) gridShifts.push({ at: g.from, offsetMs: Math.round(d * 1000), sixteenths: r2(d / s16) });
  }
  const pattern = new Array(16).fill(0);
  let onGrid = 0;
  for (const { t } of onsets) {
    const st = (t - gridAt(grids, t).firstBar) / s16, k = Math.round(st);
    if (Math.abs(st - k) < 0.2) { onGrid++; pattern[((k % 16) + 16) % 16]++; }
  }
  const nBars = Math.max(1, grids.reduce((sum, g) => sum + (g.to - g.from), 0) / barLen), avg = mean(pattern);
  const groove = {
    onsetsPerSecond: r2(onsets.length / end), onSixteenthPct: Math.round(onGrid / Math.max(1, onsets.length) * 100),
    hitsPerBar: pattern.map((v) => r2(v / nBars)), quietSteps: pattern.map((v, i) => (v < 0.35 * avg ? i + 1 : 0)).filter(Boolean),
  };
  // repetition: harmony of each bar vs the bar before (a loop over one chord stays near 1.0)
  const chroma = bars.map((b) => {
    const c = new Array(12).fill(0);
    for (let s = Math.floor(b * SR); s + 8192 < Math.min(n, (b + barLen) * SR); s += 4096) {
      const { pw } = fftPower(x.subarray(s, s + 8192));
      for (let k = 1; k < pw.length; k++) { const hz = k * SR / 8192; if (hz < 60 || hz > 4000) continue; c[((Math.round(12 * Math.log2(hz / 440)) + 9) % 12 + 12) % 12] += Math.sqrt(pw[k]); }
    }
    const nn = Math.hypot(...c) || 1; return c.map((v) => v / nn);
  }).filter((c) => c.some((v) => v > 0));
  const sims = chroma.slice(1).map((c, i) => c.reduce((s, v, k) => s + v * chroma[i][k], 0));
  const top = (c) => c.map((v, k) => [v, NOTES[k]]).sort((a, b) => b[0] - a[0]).slice(0, 3).map(([, nm]) => nm);
  const harmony = { barToBar: r2(mean(sims)), changes: sims.filter((v) => v < 0.9).length, bars: sims.length + 1, notesPerBar: chroma.map(top) };
  return { ...out, tempo: { bpm: tempo.bpm, confidence: tempo.confidence, beatSeconds: beat }, grids: grids.map((g) => ({ ...g, firstBeat: r2(g.firstBeat), firstBar: r2(g.firstBar) })), gridShifts, beats, bars, groove, harmony };
}

// ---------- the two together
// the grid of the section a time falls in (or the nearest one)
function gridAt(grids, t) {
  let best = grids[0], bd = Infinity;
  for (const g of grids) { const d = t < g.from ? g.from - t : t > g.to ? t - g.to : 0; if (d < bd) { bd = d; best = g; } }
  return best;
}
function alignment(pic, snd) {
  const res = {};
  if (snd.beats) {
    const beat = snd.tempo.beatSeconds, w = 0.04;
    const on = (ev, div) => Math.round(mean(ev.map((t) => (Math.abs(((t - gridAt(snd.grids, t).firstBar) / (beat / div) + 0.5) % 1 - 0.5) * beat / div <= w ? 1 : 0))) * 100);
    const row = (ev) => (ev.length ? { events: ev.length, beatPct: on(ev, 1), eighthPct: on(ev, 2), sixteenthPct: on(ev, 4) } : { events: 0 });
    const chance = (div) => Math.round(Math.min(1, 2 * w / (beat / div)) * 100);
    // within 40 ms of the grid, against what random times would score
    res.pictureOnGrid = { cutsAndPops: row([...pic.cuts, ...pic.pops].map((c) => c.t)), moves: row(pic.moves.map((m) => m.t)), chance: { beatPct: chance(1), eighthPct: chance(2), sixteenthPct: chance(4) } };
  }
  const pictureEvents = [...pic.cuts.map((c) => ["cut", c.t]), ...pic.pops.map((c) => ["pop", c.t]), ...pic.moves.map((m) => ["move", m.t]), ...pic.holds.flatMap(([a, b]) => [["hold starts", a], ["hold ends", b]])];
  const nearest = (t, list) => list.reduce((best, [k, v]) => (Math.abs(v - t) < Math.abs(best[1] - t) ? [k, v] : best), ["", Infinity]);
  const link = (kind, t) => {
    // bar lines only mean something inside a section the grid was fitted to
    const g = snd.grids && gridAt(snd.grids, t), inGrid = g && t >= g.from - 0.5 && t <= g.to + 0.5;
    const [pk, pt] = nearest(t, pictureEvents), bar = inGrid ? snd.bars.reduce((b, v) => (Math.abs(v - t) < Math.abs(b - t) ? v : b), Infinity) : null;
    return { sound: kind, t, picture: Number.isFinite(pt) ? { kind: pk, t: pt, offsetMs: Math.round((t - pt) * 1000) } : null, barOffsetMs: bar != null && Number.isFinite(bar) ? Math.round((t - bar) * 1000) : null };
  };
  res.sections = [...snd.entries.map((t) => link("low end comes in", t)), ...snd.breaks.flatMap((b) => [link("break starts", b.start), link("break ends", b.end)])].sort((a, b) => a.t - b.t);
  return res;
}

export function spot(file, { fps } = {}) {
  const p = probe(file), rate = Math.min(fps || p.fps, 60);
  const pic = picture(file, rate);
  const snd = p.hasAudio ? sound(file) : { silent: true, noTrack: true };
  return { file, ...p, analysedFps: rate, picture: pic, sound: snd, together: snd.silent ? null : alignment(pic, snd) };
}

export function events(s) {
  return [...s.picture.cuts.map((c) => ({ t: c.t, kind: "cut", strength: c.strength })), ...s.picture.pops.map((c) => ({ t: c.t, kind: "pop", strength: c.strength })), ...s.picture.moves.map((m) => ({ t: m.t, kind: "move", strength: m.strength })),
    ...s.picture.holds.flatMap(([a, b]) => [{ t: a, kind: "hold-start" }, { t: b, kind: "hold-end" }])].sort((a, b) => a.t - b.t);
}

/** A contact sheet: one frame every `step` seconds with its time, in a grid. */
export function contactSheet(file, out, duration) {
  const step = Math.max(0.5, Math.ceil(duration / 36 * 2) / 2), count = Math.ceil(duration / step), cols = 6, rows = Math.ceil(count / cols);
  const base = `fps=1/${step},scale=320:-2`, tile = `tile=${cols}x${rows}:padding=4:color=black`;
  const withTime = `${base},drawtext=text='%{pts\\:hms}':x=6:y=6:fontsize=18:fontcolor=white:box=1:boxcolor=black@0.6,${tile}`;
  for (const vf of [withTime, `${base},${tile}`]) {
    const r = spawnSync("ffmpeg", ["-v", "error", "-y", "-i", file, "-vf", vf, "-frames:v", "1", out]);
    if (r.status === 0) return { step, labelled: vf === withTime };
  }
  throw new Error("could not write the contact sheet");
}

export function formatSpot(s) {
  const L = [], p = s.picture, d = s.sound, fmtT = (a) => a.map((v) => (typeof v === "number" ? v.toFixed(2) : v)).join(" ");
  L.push(`${s.file}: ${s.duration} s, ${s.width}x${s.height} @ ${s.fps} fps, ${s.hasAudio ? "with sound" : "no audio track"}`);
  L.push("picture");
  L.push(`  cuts (${p.cuts.length}): ${fmtT(p.cuts.map((c) => c.t)) || "none"}`);
  L.push(`  pops, part of the frame changes at once (${p.pops.length}): ${fmtT(p.pops.map((c) => c.t)) || "none"}`);
  L.push(`  moves (${p.moves.length}): ${fmtT(p.moves.map((m) => m.t)) || "none"}`);
  L.push(`  holds, still for 0.5 s or more (${p.holds.length}): ${p.holds.map(([a, b]) => `${a.toFixed(2)}-${b.toFixed(2)}`).join("  ") || "none"}`);
  L.push(`  motion per second: ${p.motionPerSecond.join(" ")}`);
  if (d.silent) { L.push(d.noTrack ? "sound: no audio track" : "sound: silent"); return L.join("\n"); }
  L.push("sound");
  L.push(`  ${d.lufs} LUFS, stereo width ${d.stereoWidth}%, ${d.tempo ? `${d.tempo.bpm} BPM (confidence ${d.tempo.confidence}; half or double is possible)` : "no steady tempo"}, ${d.key.key} (margin ${d.key.margin} over ${d.key.runnerUp})`);
  L.push(`  energy by band: ${Object.entries(d.balance).map(([k, v]) => `${k} ${v}%`).join(", ")}`);
  L.push(`  breaks (15 dB or more under the usual level): ${d.breaks.map((b) => `${b.start.toFixed(2)}-${b.end.toFixed(2)} (${b.depthDb} dB down${b.nearSilent ? ", near silent" : ""}${b.hitsInside ? `, ${b.hitsInside} hit${b.hitsInside > 1 ? "s" : ""} inside` : ""})`).join("  ") || "none"}`);
  L.push(`  low end comes in at: ${fmtT(d.entries) || "none"}`);
  if (d.groove) {
    const g = d.groove;
    L.push(`  groove: ${g.onsetsPerSecond} hits/s, ${g.onSixteenthPct}% on a 16th note; hits per bar on each 16th (1-16): ${g.hitsPerBar.join(" ")}`);
    if (g.quietSteps.length) L.push(`  mostly empty steps: ${g.quietSteps.join(", ")}${g.quietSteps.includes(15) && g.quietSteps.includes(16) ? " (a gap before each downbeat)" : ""}`);
    L.push(`  harmony: bar-to-bar similarity ${d.harmony.barToBar}, ${d.harmony.changes} changes in ${d.harmony.bars} bars${d.harmony.barToBar >= 0.95 ? " (a loop over one chord or pedal)" : ""}`);
    L.push(`  bars start at: ${fmtT(d.bars.slice(0, 24))}${d.bars.length > 24 ? " ..." : ""}`);
    for (const g of d.gridShifts) L.push(`  the beat after ${g.at.toFixed(2)} s sits ${Math.abs(g.offsetMs)} ms (${Math.abs(g.sixteenths)} of a 16th note) ${g.offsetMs > 0 ? "later" : "earlier"} than the grid before it: the music was probably cut or re-entered there`);
  }
  const t = s.together;
  if (t?.pictureOnGrid) {
    const g = t.pictureOnGrid, c = g.chance, fmtRow = (r) => (r.events ? `${r.beatPct}% on a beat, ${r.eighthPct}% on an 8th, ${r.sixteenthPct}% on a 16th` : "none");
    L.push("together (within 40 ms; random times would score " + `${c.beatPct}% / ${c.eighthPct}% / ${c.sixteenthPct}%)`);
    L.push(`  cuts and pops: ${fmtRow(g.cutsAndPops)}`);
    L.push(`  moves: ${fmtRow(g.moves)}`);
  } else if (t?.sections?.length) L.push("together");
  for (const x of t?.sections || []) L.push(`  ${x.sound} ${x.t.toFixed(2)} s: ${x.picture ? `nearest ${x.picture.kind} ${x.picture.t.toFixed(2)} (${x.picture.offsetMs > 0 ? "+" : ""}${x.picture.offsetMs} ms)` : "no picture event"}${x.barOffsetMs != null ? `, ${x.barOffsetMs > 0 ? "+" : ""}${x.barOffsetMs} ms from a bar line` : ""}`);
  return L.join("\n");
}
