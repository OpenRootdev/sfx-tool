// 16-bit PCM WAV encode/decode (48 kHz by default). Works on Uint8Array, so Node and browser share it.
import { SR } from "./engine.js";

/** channels: array of Float arrays (1 = mono, 2 = stereo). Returns Uint8Array. */
export function encodeWav(channels, sr = SR) {
  const ch = channels.length, n = channels[0].length, data = n * ch * 2;
  const buf = new ArrayBuffer(44 + data), v = new DataView(buf);
  const str = (o, s) => { for (let i = 0; i < s.length; i++) v.setUint8(o + i, s.charCodeAt(i)); };
  str(0, "RIFF"); v.setUint32(4, 36 + data, true); str(8, "WAVE");
  str(12, "fmt "); v.setUint32(16, 16, true); v.setUint16(20, 1, true); v.setUint16(22, ch, true);
  v.setUint32(24, sr, true); v.setUint32(28, sr * ch * 2, true); v.setUint16(32, ch * 2, true); v.setUint16(34, 16, true);
  str(36, "data"); v.setUint32(40, data, true);
  let o = 44;
  for (let i = 0; i < n; i++) for (let c = 0; c < ch; c++) {
    const s = Math.max(-1, Math.min(1, channels[c][i]));
    v.setInt16(o, Math.round(s * 32767), true); o += 2;
  }
  return new Uint8Array(buf);
}

/** Returns { sr, channels: Float64Array[] }. Supports 16-bit PCM and 32-bit float. */
export function decodeWav(bytes) {
  const u = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
  const v = new DataView(u.buffer, u.byteOffset, u.byteLength);
  let p = 12, ch = 1, sr = SR, bits = 16, fmt = 1, start = 0, len = 0;
  while (p + 8 <= u.length) {
    const id = String.fromCharCode(u[p], u[p + 1], u[p + 2], u[p + 3]), sz = v.getUint32(p + 4, true);
    if (id === "fmt ") { fmt = v.getUint16(p + 8, true); ch = v.getUint16(p + 10, true); sr = v.getUint32(p + 12, true); bits = v.getUint16(p + 22, true); }
    if (id === "data") { start = p + 8; len = Math.min(sz, u.length - start); break; }
    p += 8 + sz + (sz & 1);
  }
  const bps = bits / 8, n = Math.floor(len / bps / ch);
  const out = Array.from({ length: ch }, () => new Float64Array(n));
  for (let i = 0; i < n; i++) for (let c = 0; c < ch; c++) {
    const o = start + (i * ch + c) * bps;
    out[c][i] = fmt === 3 ? v.getFloat32(o, true) : v.getInt16(o, true) / 32768;
  }
  return { sr, channels: out };
}
