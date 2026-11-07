import { SR, MODELS, FAMILIES, normalize, renderRecipe, gaussian, mulberry32 } from "/src/engine.js";
import { analyse, spectrum } from "/src/checks.js";
import { renderTrack } from "/src/track.js";
import { encodeWav } from "/src/wav.js";
import { DEFAULT_PACK } from "/src/pack.js";

const $ = (id) => document.getElementById(id);
const css = (n) => getComputedStyle(document.documentElement).getPropertyValue(n).trim();
const clone = (o) => JSON.parse(JSON.stringify(o));
const rnd = mulberry32(Date.now() & 0xffffff);
const randSeed = () => 1 + Math.floor(rnd() * 99999);
const PLAY_ICON = '<svg viewBox="0 0 12 12" aria-hidden="true"><path d="M2.5 1.2l8 4.8-8 4.8z"/></svg>';

const S = { sounds: {}, cur: null, orig: null, x: null, local: false, dir: "", dirty: false };

// ---------------- storage: local server, or this browser as a fallback ----------------
const LS_KEY = "sfx-tool:sounds";
async function load() {
  try {
    const info = await fetch("/api/info").then((r) => { if (!r.ok) throw 0; return r.json(); });
    S.local = true; S.dir = info.dir;
    for (const r of await fetch("/api/sounds").then((r) => r.json())) S.sounds[r.name] = r;
  } catch {
    S.local = false; S.dir = "this browser (no folder)";
    let saved = null; try { saved = JSON.parse(localStorage.getItem(LS_KEY)); } catch {}
    for (const r of saved || DEFAULT_PACK) S.sounds[r.name] = r;
  }
  $("folder").textContent = "‎" + S.dir + "‎"; $("folder").title = `Sounds are saved in ${S.dir}`;
}
let saveTimer = null;
function scheduleSave() {
  S.dirty = true; setSave("Unsaved changes");
  clearTimeout(saveTimer); saveTimer = setTimeout(saveCurrent, 350);
}
async function saveRecipe(r) {
  S.sounds[r.name] = clone(r);
  if (!S.local) { try { localStorage.setItem(LS_KEY, JSON.stringify(Object.values(S.sounds))); } catch {} return; }
  const res = await fetch(`/api/sounds/${encodeURIComponent(r.name)}`, { method: "PUT", body: JSON.stringify(r) });
  if (!res.ok) throw new Error((await res.json()).error || res.statusText);
}
async function saveCurrent() {
  if (!S.cur) return;
  try { await saveRecipe(S.cur); S.dirty = false; setSave(S.local ? `Saved ${S.cur.name}.json` : "Saved in this browser"); }
  catch (e) { setSave(`Not saved: ${e.message}`, true); }
}
async function deleteRecipe(name) {
  delete S.sounds[name];
  if (S.local) await fetch(`/api/sounds/${encodeURIComponent(name)}`, { method: "DELETE" });
  else try { localStorage.setItem(LS_KEY, JSON.stringify(Object.values(S.sounds))); } catch {}
}
function setSave(t, err = false) { const el = $("save-state"); el.textContent = t; el.classList.toggle("err", err); }
function toast(t) { const el = $("toast"); el.textContent = t; el.hidden = false; clearTimeout(el._t); el._t = setTimeout(() => (el.hidden = true), 2600); }

// ---------------- audio ----------------
let ctx = null, master = null;
function audio() {
  if (!ctx) { ctx = new AudioContext({ sampleRate: SR }); master = ctx.createGain(); master.gain.value = +$("volume").value; master.connect(ctx.destination); }
  if (ctx.state === "suspended") ctx.resume();
  return ctx;
}
function play(channels, onEnd) {
  const c = audio(), b = c.createBuffer(channels.length, channels[0].length, SR);
  channels.forEach((x, i) => b.copyToChannel(Float32Array.from(x), i));
  const s = c.createBufferSource(); s.buffer = b; s.connect(master); s.start(); if (onEnd) s.onended = onEnd;
  return s;
}
$("volume").addEventListener("input", () => { if (master) master.gain.value = +$("volume").value; });

// ---------------- drawing ----------------
function setupCanvas(cv) {
  const dpr = devicePixelRatio || 1, w = cv.clientWidth, h = cv.clientHeight;
  cv.width = Math.max(1, w * dpr); cv.height = Math.max(1, h * dpr);
  const g = cv.getContext("2d"); g.setTransform(dpr, 0, 0, dpr, 0, 0); g.clearRect(0, 0, w, h);
  return { g, w, h };
}
function drawWave(cv, chans, { progress = null, scale = null, axis = false } = {}) {
  const { g, w, h } = setupCanvas(cv); if (!w || !chans) return;
  const x = chans[0], n = x.length, ah = axis ? 14 : 0, hh = h - ah, mid = hh / 2;
  let pk = 1e-9; for (const c of chans) for (const v of c) pk = Math.max(pk, Math.abs(v));
  const norm = scale || pk;
  g.strokeStyle = css("--line"); g.beginPath(); g.moveTo(0, mid + .5); g.lineTo(w, mid + .5); g.stroke();
  g.fillStyle = css("--wave");
  const step = n / w;
  for (let px = 0; px < w; px++) {
    let lo = 0, hi = 0; const a = Math.floor(px * step), b = Math.max(a + 1, Math.floor((px + 1) * step));
    for (const c of chans) for (let i = a; i < b && i < n; i++) { if (c[i] > hi) hi = c[i]; if (c[i] < lo) lo = c[i]; }
    const t = Math.max(0.5, (hi / norm) * (mid - 2)), btm = Math.max(0.5, (-lo / norm) * (mid - 2));
    g.fillRect(px, mid - t, 1, t + btm);
  }
  if (axis) {
    g.fillStyle = css("--faint"); g.font = `10px ${css("--mono")}`;
    const dur = n / SR, tick = dur > 2 ? 0.5 : dur > 0.4 ? 0.1 : dur > 0.15 ? 0.05 : 0.02;
    for (let t = 0; t <= dur + 1e-9; t += tick) {
      const px = Math.round(t / dur * (w - 1)); g.fillRect(px, hh, 1, 4);
      const lbl = dur > 2 ? `${t.toFixed(1)}s` : `${Math.round(t * 1000)}ms`;
      g.fillText(lbl, Math.min(px + 3, w - g.measureText(lbl).width), h - 2);
    }
  }
  if (progress != null) { g.fillStyle = css("--head"); g.fillRect(Math.round(progress * (w - 2)), 0, 2, hh); }
}
function drawSpectrum(cv, x, muffle) {
  const { g, w, h } = setupCanvas(cv); if (!w) return;
  const pts = spectrum(x, SR, Math.min(220, Math.floor(w / 2)));
  const max = Math.max(...pts.map((p) => p.db)), floor = max - 70, ah = 14, hh = h - ah;
  const fx = (hz) => Math.log(hz / 40) / Math.log(10000 / 40) * w;
  g.font = `10px ${css("--mono")}`;
  for (const [hz, lbl] of [[100, "100"], [300, "300"], [1000, "1k"], [3000, "3k"], [10000, "10k"]]) {
    const px = Math.round(fx(hz)); g.fillStyle = css("--line"); g.fillRect(px, 0, 1, hh);
    g.fillStyle = css("--faint"); g.fillText(lbl, Math.min(px + 3, w - 22), h - 2);
  }
  g.beginPath(); g.moveTo(0, hh);
  pts.forEach((p, i) => g.lineTo(i / (pts.length - 1) * w, hh - Math.max(0, (p.db - floor) / (max - floor)) * (hh - 4)));
  g.lineTo(w, hh); g.closePath();
  g.fillStyle = css("--wave-dim"); g.fill(); g.strokeStyle = css("--wave"); g.lineWidth = 1.5; g.stroke();
  if (muffle) {
    const px = fx(muffle); g.setLineDash([3, 3]); g.strokeStyle = css("--head"); g.lineWidth = 1;
    g.beginPath(); g.moveTo(px, 0); g.lineTo(px, hh); g.stroke(); g.setLineDash([]);
    g.fillStyle = css("--head"); g.fillText("muffle", Math.min(px + 4, w - 40), 11);
  }
}

// ---------------- list ----------------
function familyOrder() { return [...Object.keys(FAMILIES), "custom"]; }
function renderList() {
  const q = $("search").value.trim().toLowerCase(), list = $("list"); list.innerHTML = "";
  const all = Object.values(S.sounds).map(normalize).filter((r) => !q || `${r.name} ${r.family} ${r.description}`.toLowerCase().includes(q));
  const fams = [...new Set([...familyOrder(), ...all.map((r) => r.family)])];
  for (const f of fams) {
    const items = all.filter((r) => r.family === f).sort((a, b) => a.name.localeCompare(b.name));
    if (!items.length) continue;
    const lab = document.createElement("div"); lab.className = "group-label";
    lab.innerHTML = `<span>${FAMILIES[f]?.label || f}</span><span>${items.length}</span>`; list.appendChild(lab);
    for (const r of items) {
      const b = document.createElement("button"); b.className = "item"; b.dataset.name = r.name;
      b.setAttribute("aria-current", S.cur?.name === r.name);
      b.innerHTML = `<span class="nm"></span><span class="ds"></span><span class="pl">${PLAY_ICON}</span>`;
      b.querySelector(".nm").textContent = r.name; b.querySelector(".ds").textContent = r.description || FAMILIES[r.family]?.blurb || "";
      b.addEventListener("click", () => { select(r.name); playCurrent(); });
      list.appendChild(b);
    }
  }
  fillSoundSelects();
}
$("search").addEventListener("input", renderList);
function visibleNames() { return [...$("list").querySelectorAll(".item")].map((b) => b.dataset.name); }

// ---------------- editor ----------------
function select(name) {
  if (S.dirty) saveCurrent();
  S.cur = normalize(clone(S.sounds[name])); S.orig = clone(S.cur);
  $("variations").hidden = true;
  for (const b of $("list").querySelectorAll(".item")) b.setAttribute("aria-current", b.dataset.name === name);
  $("list").querySelector(`[data-name="${CSS.escape(name)}"]`)?.scrollIntoView({ block: "nearest" });
  buildParams(); refresh();
}
function refresh() {
  const r = S.cur;
  $("name").textContent = r.name;
  $("family").textContent = `${FAMILIES[r.family]?.label || r.family} · ${MODELS[r.model].label} model`;
  if (document.activeElement !== $("desc")) $("desc").value = r.description || "";
  S.x = renderRecipe(r);
  const m = analyse([S.x], SR);
  drawWave($("wave"), [S.x], { axis: true, scale: 0.5 });
  drawSpectrum($("spec"), S.x, r.params.muffle);
  $("dur").textContent = `${Math.round(m.duration * 1000)} ms`;
  const bd = [
    `<span class="badge">Loudness <b>${m.lufs.toFixed(1)}</b> LUFS</span>`,
    `<span class="badge">Peak <b>${m.peakDb.toFixed(1)}</b> dBFS</span>`,
    `<span class="badge">Brightness <b>${Math.round(m.centroid)}</b> Hz</span>`,
    m.edges > 0.01 || m.jump > 0.35 ? `<span class="badge bad">Click</span>` : `<span class="badge ok">No clicks</span>`,
    m.hf4 > 0.03 ? `<span class="badge bad">Harsh above 4 kHz</span>` : `<span class="badge ok">Not harsh</span>`,
    m.clip ? `<span class="badge bad">Clipping</span>` : `<span class="badge ok">No clipping</span>`,
  ];
  $("badges").innerHTML = bd.join("");
  syncRows();
}
let rafPending = false;
function scheduleRefresh() { if (!rafPending) { rafPending = true; requestAnimationFrame(() => { rafPending = false; refresh(); }); } }
function playCurrent() { if (S.x) play([S.x]); }

const familyDefaults = () => normalize({ family: S.cur.family, model: S.cur.model }).params;
function fmtNum(v, step) { const d = step >= 1 ? 0 : Math.min(4, Math.ceil(-Math.log10(step))); return (+v).toFixed(d); }
function buildParams() {
  const box = $("params"); box.innerHTML = "";
  const groups = {};
  for (const p of MODELS[S.cur.model].params) (groups[p.group] ||= []).push(p);
  for (const [gname, ps] of Object.entries(groups)) {
    const card = document.createElement("div"); card.className = "card"; card.dataset.group = gname;
    card.innerHTML = `<h3>${gname}</h3>`;
    for (const p of ps) {
      const row = document.createElement("div"); row.className = "row"; row.dataset.key = p.key;
      const id = `p-${p.key}`;
      row.innerHTML = `<label for="${id}" title="${(p.help || p.label).replace(/"/g, "&quot;")}">${p.label}</label>
        <input type="range" id="${id}" min="${p.min}" max="${p.max}" step="${p.step}">
        <input type="number" min="${p.min}" max="${p.max}" step="${p.step}" aria-label="${p.label} value">
        <span class="unit">${p.unit}</span><button class="reset" title="Back to the family default"></button>`;
      const [range, number] = row.querySelectorAll("input");
      const set = (v, commit) => {
        v = Math.min(p.max, Math.max(p.min, +v)); if (!Number.isFinite(v)) return;
        S.cur.params[p.key] = v; scheduleRefresh(); scheduleSave();
        if (commit && $("auto-play").checked) requestAnimationFrame(() => requestAnimationFrame(playCurrent));
      };
      range.addEventListener("input", () => { number.value = fmtNum(range.value, p.step); set(range.value, false); });
      range.addEventListener("change", () => set(range.value, true));
      range.addEventListener("dblclick", () => set(familyDefaults()[p.key], true));
      number.addEventListener("change", () => set(number.value, true));
      row.querySelector(".reset").addEventListener("click", () => set(familyDefaults()[p.key], true));
      card.appendChild(row);
    }
    if (gname === "Output") {
      const sr = document.createElement("div"); sr.className = "seed-row";
      sr.innerHTML = `<span>Seed</span><input type="number" id="seed" min="1" step="1" aria-label="Seed"><button class="btn small" id="dice" title="New random seed">New take</button>`;
      sr.querySelector("#seed").addEventListener("change", (e) => { S.cur.seed = Math.max(1, Math.round(+e.target.value || 1)); refresh(); scheduleSave(); if ($("auto-play").checked) playCurrent(); });
      sr.querySelector("#dice").addEventListener("click", () => { S.cur.seed = randSeed(); refresh(); scheduleSave(); playCurrent(); });
      card.appendChild(sr);
    }
    box.appendChild(card);
  }
}
function syncRows() {
  const d = familyDefaults();
  for (const row of $("params").querySelectorAll(".row")) {
    const k = row.dataset.key, v = S.cur.params[k], p = MODELS[S.cur.model].params.find((q) => q.key === k);
    const [range, number] = row.querySelectorAll("input");
    if (document.activeElement !== range) range.value = v;
    if (document.activeElement !== number) number.value = fmtNum(v, p.step);
    row.querySelector(".reset").classList.toggle("on", Math.abs(v - d[k]) > 1e-9);
    const off = (k.startsWith("pre") && k !== "preGain" && !(S.cur.params.preGain > 0))
      || (k.startsWith("double") && k !== "doubleGain" && !(S.cur.params.doubleGain > 0))
      || (/^h[12](Ratio|Decay)$/.test(k) && !(S.cur.params[k.slice(0, 2) + "Amp"] > 0))
      || (k.startsWith("noise") && k !== "noise" && !(S.cur.params.noise > 0));
    row.classList.toggle("off", off);
  }
  const seed = $("seed"); if (seed && document.activeElement !== seed) seed.value = S.cur.seed;
}

$("desc").addEventListener("input", () => { S.cur.description = $("desc").value; scheduleSave(); });
$("play").addEventListener("click", playCurrent);
$("revert").addEventListener("click", () => { S.cur = clone(S.orig); buildParams(); refresh(); scheduleSave(); playCurrent(); toast("Back to how it was when you opened it"); });
$("download").addEventListener("click", () => downloadWav([S.x], `${S.cur.name}.wav`));
$("delete").addEventListener("click", async () => {
  const name = S.cur.name;
  if (!confirm(`Delete ${name}? This removes ${name}.json and its WAV from the folder.`)) return;
  clearTimeout(saveTimer); S.dirty = false;
  await deleteRecipe(name); renderList();
  const next = visibleNames()[0]; if (next) select(next);
  toast(`Deleted ${name}`);
});
function uniqueName(base, start = null) {
  let i = start ?? 2, n = start == null ? base : `${base}${i++}`;
  while (S.sounds[n]) n = `${base}${i++}`;
  return n;
}
$("dup").addEventListener("click", async () => {
  const r = { ...clone(S.cur), name: uniqueName(`${S.cur.name}_copy`) };
  await saveRecipe(r); renderList(); select(r.name); toast(`Created ${r.name}`);
});
function downloadWav(chans, name) {
  const url = URL.createObjectURL(new Blob([encodeWav(chans)], { type: "audio/wav" }));
  const a = document.createElement("a"); a.href = url; a.download = name; a.click(); setTimeout(() => URL.revokeObjectURL(url), 2000);
}

// ---------------- variations ----------------
let variants = [];
function makeVariants() {
  const nudgeGroups = new Set(["Tone", "Shape", "Overtones", "Contact", "Second bubble", "Double hit"]);
  variants = Array.from({ length: 8 }, (_, i) => {
    const r = clone(S.cur); r.seed = randSeed();
    if (i >= 4) for (const p of MODELS[r.model].params) {
      if (!nudgeGroups.has(p.group) || !r.params[p.key]) continue;
      r.params[p.key] = Math.min(p.max, Math.max(p.min, r.params[p.key] * (1 + gaussian(rnd) * 0.09)));
    }
    return { r, kind: i < 4 ? "new take" : "nudged", x: renderRecipe(r) };
  });
  const grid = $("var-grid"); grid.innerHTML = "";
  variants.forEach((v, i) => {
    const el = document.createElement("div"); el.className = "var";
    el.innerHTML = `<span class="lbl">${v.kind} · seed ${v.r.seed}</span><canvas title="Play"></canvas>
      <div class="vb"><button class="btn small" data-a="keep">Keep</button><button class="btn small" data-a="new">Save as new</button></div>`;
    const cv = el.querySelector("canvas");
    cv.addEventListener("click", () => { el.classList.add("playing"); play([v.x], () => el.classList.remove("playing")); });
    el.querySelector('[data-a="keep"]').addEventListener("click", () => { S.cur = clone(v.r); buildParams(); refresh(); scheduleSave(); playCurrent(); toast("Kept this variation"); });
    el.querySelector('[data-a="new"]').addEventListener("click", async () => {
      const r = { ...clone(v.r), name: uniqueName(`${S.cur.name}_v`, 1) }; await saveRecipe(r); renderList(); toast(`Saved ${r.name}`);
    });
    grid.appendChild(el);
    requestAnimationFrame(() => drawWave(cv, [v.x], { scale: 0.5 }));
  });
}
$("vary").addEventListener("click", () => { const el = $("variations"); el.hidden = !el.hidden; if (!el.hidden) makeVariants(); });
$("var-more").addEventListener("click", makeVariants);
$("var-close").addEventListener("click", () => ($("variations").hidden = true));

// ---------------- new sound ----------------
$("new-btn").addEventListener("click", openNew);
function openNew() {
  const sel = $("new-from"); sel.innerHTML = "";
  if (S.cur) sel.add(new Option(`A copy of ${S.cur.name}`, "@current"));
  for (const [k, f] of Object.entries(FAMILIES)) sel.add(new Option(`${f.label} (${k}) default`, k));
  $("new-name").value = S.cur ? uniqueName(`${S.cur.family}_new`) : "new_sound"; $("new-err").textContent = "";
  $("new-dialog").showModal(); $("new-name").select();
}
$("new-form").addEventListener("submit", async (e) => {
  if (e.submitter?.value !== "ok") return;
  const name = $("new-name").value.trim(), from = $("new-from").value;
  if (S.sounds[name]) { e.preventDefault(); $("new-err").textContent = `${name} already exists. Pick another name.`; return; }
  const r = from === "@current" ? { ...clone(S.cur), name } : normalize({ name, family: from, seed: randSeed(), description: "" });
  try { await saveRecipe(r); renderList(); select(name); playCurrent(); toast(`Created ${name}`); }
  catch (err) { e.preventDefault(); $("new-err").textContent = err.message; }
});

// ---------------- live updates from files (agent / editor) ----------------
function listen() {
  if (!S.local) return;
  const es = new EventSource("/api/events");
  es.onmessage = (ev) => {
    const m = JSON.parse(ev.data);
    if (m.type === "changed") {
      const isNew = !S.sounds[m.recipe.name]; S.sounds[m.recipe.name] = m.recipe;
      if (isNew) renderList();
      if (S.cur?.name === m.recipe.name) {
        clearTimeout(saveTimer); S.dirty = false; S.cur = normalize(clone(m.recipe));
        if (S.cur.model !== normalize(S.orig).model) buildParams();
        refresh(); setSave(`Updated from file`);
      }
      $("list").querySelector(`[data-name="${CSS.escape(m.recipe.name)}"]`)?.classList.add("flash");
      setTimeout(() => $("list").querySelector(`[data-name="${CSS.escape(m.recipe.name)}"]`)?.classList.remove("flash"), 1300);
      toast(`${m.recipe.name} ${isNew ? "added" : "updated"} from file`);
    } else if (m.type === "removed") {
      delete S.sounds[m.name]; renderList();
      if (S.cur?.name === m.name) { const n = visibleNames()[0]; if (n) select(n); }
      toast(`${m.name} was removed`);
    }
  };
  es.onerror = () => setSave("Studio server stopped", true);
  es.onopen = () => setSave("");
}

// ---------------- bench: type ----------------
function fillSoundSelects() {
  for (const id of ["type-sound", "track-sound"]) {
    const sel = $(id), v = sel.value; sel.innerHTML = "";
    sel.add(new Option("The open sound", "@current"));
    const og = document.createElement("optgroup"); og.label = "Any sound in family";
    for (const [k, f] of Object.entries(FAMILIES)) if (f.role === "hit" && Object.values(S.sounds).some((r) => r.family === k)) og.appendChild(new Option(f.label, k));
    sel.appendChild(og);
    if ([...sel.options].some((o) => o.value === v)) sel.value = v;
  }
}
function soundsWithEdits() { return S.cur ? { ...S.sounds, [S.cur.name]: S.cur } : S.sounds; }
function pickFrom(want) {
  if (want === "@current") return S.cur;
  const fam = Object.values(soundsWithEdits()).filter((r) => r.family === want);
  return fam[Math.floor(rnd() * fam.length)] || S.cur;
}
let lastKey = 0;
$("pad").addEventListener("keydown", (e) => {
  if (e.repeat || e.ctrlKey || e.metaKey || e.altKey) return;
  const now = performance.now();
  if (e.key === "Enter") { const line = Object.values(S.sounds).filter((r) => r.family === "line"); if (line.length) play([renderRecipe(line[Math.floor(rnd() * line.length)], { seed: randSeed() })]); return; }
  if (e.key.length !== 1 && e.key !== "Backspace") return;
  if (e.key === " " || now - lastKey < 35) { lastKey = now; return; }
  lastKey = now;
  const r = normalize(pickFrom($("type-sound").value));
  const x = renderRecipe(r, { seed: randSeed(), pitch: r.params.pitch * Math.pow(2, gaussian(rnd) * 0.05 * (e.key === "Backspace" ? 0 : 1)) * (e.key === "Backspace" ? 0.88 : 1) });
  const g = Math.pow(10, gaussian(rnd) * 0.75 / 20); for (let i = 0; i < x.length; i++) x[i] *= g;
  play([x]);
});

// ---------------- bench: track ----------------
for (const b of document.querySelectorAll(".tabs button")) b.addEventListener("click", () => {
  for (const t of document.querySelectorAll(".tabs button")) t.setAttribute("aria-selected", t === b);
  for (const p of document.querySelectorAll(".tab-panel")) p.hidden = p.dataset.panel !== b.dataset.tab;
  if (b.dataset.tab === "track") drawTrack(null);
});
$("cps").addEventListener("input", () => ($("cps-out").value = $("cps").value));
let track = null, trackSrc = null, trackRaf = 0;
function charTimes(text, cps, start) { const out = []; let t = start; for (const ch of text) { out.push(t); if (ch === "\n") t += 6 / cps; t += 1 / cps; } return { times: out, end: t }; }
function buildTrack() {
  const text = $("track-text").value, cps = +$("cps").value, per = $("per").value, start = 0.4;
  const { times, end } = charTimes(text, cps, start);
  const events = []; let prevSpace = true;
  [...text].forEach((ch, i) => { const sp = /\s/.test(ch); if (per === "char" ? !sp : !sp && prevSpace) events.push({ t: times[i] }); prevSpace = sp; });
  if ($("chime").checked) events.push({ t: end + 0.18, sound: "chime" });
  const want = $("track-sound").value, sounds = soundsWithEdits();
  const sound = want === "@current" ? S.cur.name : want;
  const { channels } = renderTrack(events, sounds, { sound, duration: end + 1.4, seed: randSeed() });
  return { channels, text, times, end, name: `typing_${want === "@current" ? S.cur.name : want}.wav` };
}
function drawTrack(t) {
  const screen = $("track-screen"), text = track?.text ?? $("track-text").value;
  if (!track || t == null) { screen.textContent = text; drawWave($("track-wave"), track?.channels || [new Float64Array(10)], {}); return; }
  const n = track.times.filter((x) => x <= t).length;
  screen.innerHTML = "";
  screen.append(text.slice(0, n));
  const g = document.createElement("span"); g.className = "ghost"; g.textContent = text.slice(n); screen.append(g);
  if ($("chime").checked && t >= track.end + 0.18) { const d = document.createElement("span"); d.className = "done"; d.textContent = "\n✓ done"; screen.append(d); }
  drawWave($("track-wave"), track.channels, { progress: Math.min(1, t / (track.channels[0].length / SR)) });
}
$("track-play").addEventListener("click", () => {
  if (trackSrc) { trackSrc.stop(); return; }
  track = buildTrack();
  const c = audio(), t0 = c.currentTime + 0.03;
  trackSrc = play(track.channels, () => { trackSrc = null; cancelAnimationFrame(trackRaf); drawTrack(null); $("track-play").lastChild.textContent = "Play track"; });
  $("track-play").lastChild.textContent = "Stop";
  const tick = () => { drawTrack(c.currentTime - t0); if (trackSrc) trackRaf = requestAnimationFrame(tick); }; tick();
});
$("track-download").addEventListener("click", () => { track = track || buildTrack(); downloadWav(track.channels, track.name); });
$("track-save").addEventListener("click", async () => {
  track = track || buildTrack();
  if (!S.local) return toast("Saving to a folder needs the local Studio (npx sfx-tool studio). Use WAV to download.");
  const r = await fetch(`/api/export?name=${encodeURIComponent(track.name)}`, { method: "POST", body: encodeWav(track.channels) }).then((r) => r.json());
  toast(r.ok ? `Saved ${r.file}` : `Not saved: ${r.error}`);
});
$("track-text").addEventListener("input", () => { track = null; drawTrack(null); });

// ---------------- keyboard ----------------
addEventListener("keydown", (e) => {
  const tag = document.activeElement?.tagName;
  if (["INPUT", "TEXTAREA", "SELECT"].includes(tag) && document.activeElement.type !== "range") return;
  if ($("new-dialog").open || e.ctrlKey || e.metaKey || e.altKey) return;
  if (e.key === " ") { e.preventDefault(); playCurrent(); }
  else if (e.key === "ArrowDown" || e.key === "ArrowUp") {
    if (tag === "INPUT") return;
    e.preventDefault(); const names = visibleNames(), i = names.indexOf(S.cur?.name);
    const n = names[Math.min(names.length - 1, Math.max(0, i + (e.key === "ArrowDown" ? 1 : -1)))]; if (n) { select(n); playCurrent(); }
  } else if (e.key === "v" || e.key === "V") $("vary").click();
  else if (e.key === "d" || e.key === "D") $("dup").click();
  else if (e.key === "n" || e.key === "N") { e.preventDefault(); openNew(); }
});
let rz; addEventListener("resize", () => { clearTimeout(rz); rz = setTimeout(() => { if (S.cur) refresh(); drawTrack(null); }, 120); });
matchMedia("(prefers-color-scheme: dark)").addEventListener("change", () => S.cur && refresh());
addEventListener("beforeunload", () => { if (S.dirty) saveCurrent(); });

// ---------------- boot ----------------
await load();
renderList();
const first = Object.keys(S.sounds).find((n) => n === "tap_01") || visibleNames()[0];
if (first) select(first);
drawTrack(null);
listen();
