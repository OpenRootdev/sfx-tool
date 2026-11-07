// Listen-free checks: clicks, clipping, harshness, loudness, brightness.
import { lufs } from "./engine.js";

function fftPower(x) {
  let n = 1; while (n < x.length) n <<= 1;
  const re = new Float64Array(n), im = new Float64Array(n);
  for (let i = 0; i < x.length; i++) re[i] = x[i] * (0.5 - 0.5 * Math.cos(2 * Math.PI * i / Math.max(x.length - 1, 1)));
  for (let i = 1, j = 0; i < n; i++) {
    let bit = n >> 1; for (; j & bit; bit >>= 1) j ^= bit; j ^= bit;
    if (i < j) { [re[i], re[j]] = [re[j], re[i]]; [im[i], im[j]] = [im[j], im[i]]; }
  }
  for (let len = 2; len <= n; len <<= 1) {
    const a = -2 * Math.PI / len, wr = Math.cos(a), wi = Math.sin(a);
    for (let i = 0; i < n; i += len) {
      let cr = 1, ci = 0;
      for (let k = 0; k < len / 2; k++) {
        const u = i + k, v = u + len / 2, tr = re[v] * cr - im[v] * ci, ti = re[v] * ci + im[v] * cr;
        re[v] = re[u] - tr; im[v] = im[u] - ti; re[u] += tr; im[u] += ti;
        const t = cr * wr - ci * wi; ci = cr * wi + ci * wr; cr = t;
      }
    }
  }
  const pw = new Float64Array(n / 2 + 1);
  for (let i = 0; i <= n / 2; i++) pw[i] = re[i] * re[i] + im[i] * im[i];
  return { pw, binHz: 1 / n };
}

/** Magnitude spectrum in dB for drawing: returns [{hz, db}] on a log frequency axis. */
export function spectrum(x, sr, points = 160, lo = 40, hi = 10000) {
  const { pw, binHz } = fftPower(x);
  const out = [];
  for (let k = 0; k < points; k++) {
    const f0 = lo * Math.pow(hi / lo, k / points), f1 = lo * Math.pow(hi / lo, (k + 1) / points);
    const a = Math.floor(f0 / (binHz * sr)), b = Math.max(a + 1, Math.floor(f1 / (binHz * sr)));
    let m = 0; for (let i = a; i < b && i < pw.length; i++) m = Math.max(m, pw[i]);
    out.push({ hz: Math.sqrt(f0 * f1), db: 10 * Math.log10(m + 1e-20) });
  }
  return out;
}

/** channels: Float arrays. Returns metrics + verdict list. */
export function analyse(channels, sr) {
  const n = channels[0].length;
  const mono = new Float64Array(n);
  for (const c of channels) for (let i = 0; i < n; i++) mono[i] += c[i] / channels.length;
  let pk = 1e-12, jump = 0, clip = 0, edges = 0;
  for (const c of channels) {
    for (let i = 0; i < n; i++) {
      const a = Math.abs(c[i]); if (a > pk) pk = a; if (a >= 0.9886) clip++;
      if (i) jump = Math.max(jump, Math.abs(c[i] - c[i - 1]));
    }
    edges = Math.max(edges, Math.abs(c[0]), Math.abs(c[n - 1]));
  }
  const { pw, binHz } = fftPower(mono);
  let tot = 1e-20, hf4 = 0, hf8 = 0, cen = 0;
  for (let i = 0; i < pw.length; i++) {
    const hz = i * binHz * sr; tot += pw[i]; cen += hz * pw[i];
    if (hz > 4000) hf4 += pw[i]; if (hz > 8000) hf8 += pw[i];
  }
  const m = { duration: n / sr, peakDb: 20 * Math.log10(pk), lufs: lufs(channels), edges: edges / pk, jump: jump / pk,
    clip, hf4: hf4 / tot, hf8: hf8 / tot, centroid: cen / tot };
  m.problems = [];
  if (m.edges > 0.01) m.problems.push("click at start/end");
  if (m.jump > 0.35) m.problems.push("sharp jump (click)");
  if (m.clip) m.problems.push("clipping");
  if (m.hf4 > 0.03) m.problems.push("harsh above 4 kHz");
  m.ok = m.problems.length === 0;
  return m;
}
