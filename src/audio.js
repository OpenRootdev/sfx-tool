// Load any audio file as stereo Float64 at the engine rate (48 kHz).
// 48 kHz WAV is read directly; anything else (mp3, m4a, 44.1 kHz wav, a video's audio) goes through ffmpeg.
import fs from "node:fs";
import { spawnSync } from "node:child_process";
import { SR } from "./engine.js";
import { decodeWav } from "./wav.js";

const cache = new Map();

export function loadAudio(file) {
  if (cache.has(file)) return cache.get(file);
  if (!fs.existsSync(file)) throw new Error(`audio file not found: ${file}`);
  let out = null;
  if (/\.wav$/i.test(file)) {
    const { sr, channels } = decodeWav(fs.readFileSync(file));
    if (sr === SR && channels.length) out = channels.length === 1 ? [channels[0], channels[0]] : channels.slice(0, 2);
  }
  if (!out) {
    const r = spawnSync("ffmpeg", ["-v", "error", "-i", file, "-vn", "-f", "f32le", "-ac", "2", "-ar", String(SR), "-"],
      { maxBuffer: 1 << 30 });
    if (r.error || r.status !== 0) throw new Error(`could not read ${file}: needs a 48 kHz WAV, or ffmpeg on PATH for other formats` +
      (r.stderr?.length ? `\n${r.stderr.toString().trim()}` : ""));
    const f = new Float32Array(r.stdout.buffer, r.stdout.byteOffset, Math.floor(r.stdout.length / 4));
    const n = f.length >> 1, L = new Float64Array(n), R = new Float64Array(n);
    for (let i = 0; i < n; i++) { L[i] = f[2 * i]; R[i] = f[2 * i + 1]; }
    out = [L, R];
  }
  cache.set(file, out);
  return out;
}
