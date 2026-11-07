#!/usr/bin/env node
// sfx-tool CLI. Run `sfx-tool help` for usage.
import fs from "node:fs";
import path from "node:path";
import { FAMILIES, MODELS, normalize, renderRecipe } from "../src/engine.js";
import { encodeWav, decodeWav } from "../src/wav.js";
import { analyse } from "../src/checks.js";
import { renderTrack, textEvents, parseTimes } from "../src/track.js";
import { initProject, loadSounds, listRecipes, writeRecipe, writeWav, compact, NAME_RE } from "../src/project.js";

const HELP = `sfx-tool: subtle typing and UI sounds

  sfx-tool studio [dir] [--port 5178] [--open]   open the Studio for a sound folder (default ./sfx)
  sfx-tool init [dir] [--force]                  put the default 34-sound pack into dir (default ./sfx)
  sfx-tool list [dir]                            list sounds with their family and key settings
  sfx-tool new <name> --from <sound|family> [--set key=value ...] [--seed N] [--desc "..."] [--dir sfx]
                                                 make a new sound from an existing one or a family
  sfx-tool set <name> key=value [...] [--dir sfx]
                                                 change settings of an existing sound
  sfx-tool variants <name> [--count 4] [--dir sfx]
                                                 save name_v1..vN with new seeds (pick the one you like)
  sfx-tool render [dir|recipe.json ...] [--out dir]
                                                 render recipes to WAV (default: dir/wav)
  sfx-tool track (--text "..." | --times file) -o out.wav [options]
      --sound tap         sound name or family for each event (default tap)
      --start 0 --cps 18 --per char|word   timing for --text
      --fps 30            --times holds frame numbers
      --end-chime         add a completion chime after the last event
      --duration S        track length (default: last event + 1.2 s)
      --lufs -30 --ceiling -12 --jitter-ms 6 --pitch-jitter 0.05 --gain-jitter-db 1.5
      --min-gap-ms 40 --spread 0.2 --seed 1 --dir sfx --events-out events.json
  sfx-tool check <file.wav|dir ...>               clicks, clipping, harshness, loudness (exit 1 on problems)
  sfx-tool params [model|family]                 list the settings a sound type has, with ranges
`;

const FLAGS = new Set(["end-chime", "force", "open", "help"]);
function parse(argv) {
  const pos = [], opt = {};
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a.startsWith("--")) {
      const k = a.slice(2), nxt = argv[i + 1];
      if (k === "set") { opt.set = opt.set || []; while (argv[i + 1] && !argv[i + 1].startsWith("--")) opt.set.push(argv[++i]); }
      else if (FLAGS.has(k) || nxt === undefined || (nxt.startsWith("-") && isNaN(Number(nxt)))) opt[k] = true;
      else { opt[k] = nxt; i++; }
    } else if (a === "-o") opt.out = argv[++i];
    else pos.push(a);
  }
  return { pos, opt };
}
const num = (v, d) => (v === undefined || v === true ? d : Number(v));
const kv = (list) => Object.fromEntries(list.map((s) => {
  const [k, v] = s.split("="); if (v === undefined) throw new Error(`expected key=value, got "${s}"`);
  return [k, isNaN(Number(v)) ? v : Number(v)];
}));
function checkKeys(recipe, params) {
  const known = new Set(MODELS[normalize(recipe).model].params.map((p) => p.key));
  for (const k of Object.keys(params)) if (!known.has(k)) throw new Error(`"${k}" is not a ${normalize(recipe).model} setting. Try: sfx-tool params ${recipe.family}`);
}

const fmt = (m) => `${m.duration.toFixed(2).padStart(6)}${m.peakDb.toFixed(1).padStart(7)}${m.lufs.toFixed(1).padStart(7)}${m.edges.toFixed(3).padStart(7)}`
  + `${m.jump.toFixed(2).padStart(6)}${String(m.clip).padStart(5)}${(10 * Math.log10(m.hf4 + 1e-20)).toFixed(0).padStart(7)}${m.centroid.toFixed(0).padStart(6)}  ${m.ok ? "OK" : m.problems.join(", ")}`;

async function main() {
  const [cmd = "help", ...rest] = process.argv.slice(2);
  const { pos, opt } = parse(rest);
  const dir = path.resolve(opt.dir || (["studio", "init", "list", "render"].includes(cmd) && pos[0] && !pos[0].endsWith(".json") ? pos[0] : "sfx"));

  if (cmd === "help" || cmd === "--help" || cmd === "-h") return console.log(HELP);

  if (cmd === "init") {
    const w = initProject(dir, { force: !!opt.force });
    return console.log(`${w.length} sounds written to ${dir} (+ wav/)${w.length ? "" : ". Already there; use --force to overwrite"}`);
  }

  if (cmd === "studio") {
    const { startStudio } = await import("../src/server.js");
    const port = num(opt.port, 5178);
    startStudio({ dir, port });
    if (opt.open) {
      const { exec } = await import("node:child_process");
      const url = `http://localhost:${port}`;
      exec(process.platform === "win32" ? `start "" ${url}` : process.platform === "darwin" ? `open ${url}` : `xdg-open ${url}`);
    }
    return;
  }

  if (cmd === "list") {
    const rs = listRecipes(dir);
    if (!rs.length) return console.log(`no sounds in ${dir}. Run: sfx-tool init`);
    for (const r of rs.map(normalize)) console.log(`${r.name.padEnd(16)}${r.family.padEnd(9)}${String(Math.round(r.params.pitch)).padStart(5)} Hz  muffle ${String(Math.round(r.params.muffle)).padStart(4)}  ${r.description}`);
    return;
  }

  if (cmd === "params") {
    const want = pos[0] || "tap";
    const model = MODELS[want] ? want : FAMILIES[want]?.model;
    if (!model) throw new Error(`unknown model or family "${want}". Families: ${Object.keys(FAMILIES).join(", ")}`);
    const defaults = FAMILIES[want]?.params || {};
    console.log(`${MODELS[model].label} model${FAMILIES[want] ? ` (family ${want})` : ""}. Families: ${Object.entries(FAMILIES).filter(([, f]) => f.model === model).map(([k]) => k).join(", ")}\n`);
    let g = "";
    for (const p of MODELS[model].params) {
      if (p.group !== g) { g = p.group; console.log(`  ${g}`); }
      console.log(`    ${p.key.padEnd(15)}${`${p.min}..${p.max} ${p.unit}`.padEnd(20)}${defaults[p.key] !== undefined ? `default ${defaults[p.key]}`.padEnd(16) : "".padEnd(16)}${p.help || p.label}`);
    }
    return;
  }

  if (cmd === "new" || cmd === "set" || cmd === "variants") {
    const name = pos[0];
    if (!name || !NAME_RE.test(name)) throw new Error("give a sound name (letters, digits, _ and -)");
    const sounds = loadSounds(dir);
    if (cmd === "new") {
      if (sounds[name] && !opt.force) throw new Error(`${name} already exists (use set, or --force)`);
      const from = opt.from || "tap";
      const base = sounds[from] ? { ...sounds[from] } : FAMILIES[from] ? { family: from } : null;
      if (!base) throw new Error(`--from "${from}" is neither a sound in ${dir} nor a family (${Object.keys(FAMILIES).join(", ")})`);
      const params = kv(opt.set || []);
      const r = { ...base, name, seed: num(opt.seed, base.seed ?? 1), params: { ...(base.params || {}), ...params }, description: opt.desc || base.description || "" };
      checkKeys(r, params);
      writeRecipe(dir, r);
      return console.log(`created ${name} (${normalize(r).family}) -> ${path.join(dir, name + ".json")}`);
    }
    const cur = sounds[name];
    if (!cur) throw new Error(`no sound "${name}" in ${dir}`);
    if (cmd === "set") {
      const changes = kv(pos.slice(1).concat(opt.set || []));
      const top = {}; for (const k of ["seed", "description", "family"]) if (k in changes) { top[k] = changes[k]; delete changes[k]; }
      checkKeys(cur, changes);
      writeRecipe(dir, { ...cur, ...top, params: { ...(cur.params || {}), ...changes } });
      return console.log(`updated ${name}: ${JSON.stringify({ ...top, ...changes })}`);
    }
    const count = num(opt.count, 4);
    for (let i = 1; i <= count; i++) writeRecipe(dir, { ...cur, name: `${name}_v${i}`, seed: (cur.seed ?? 1) * 100 + i, description: `${cur.description || name} (variant ${i})` });
    return console.log(`saved ${name}_v1..${name}_v${count}. Audition them in the Studio, keep one, delete the rest.`);
  }

  if (cmd === "render") {
    const targets = pos.length ? pos : [dir];
    const out = opt.out ? path.resolve(opt.out) : null;
    let count = 0;
    for (const t of targets) {
      const home = t.endsWith(".json") ? path.dirname(path.resolve(t)) : path.resolve(t);
      const recipes = t.endsWith(".json") ? [{ name: path.basename(t, ".json"), ...JSON.parse(fs.readFileSync(t, "utf8")) }] : listRecipes(home);
      for (const r of recipes) {
        if (out) { fs.mkdirSync(out, { recursive: true }); fs.writeFileSync(path.join(out, r.name + ".wav"), encodeWav([renderRecipe(r)])); }
        else writeWav(home, r);
        count++;
      }
    }
    return console.log(`rendered ${count} sounds to ${out || "wav/ next to the recipes"}`);
  }

  if (cmd === "track") {
    if (!opt.out) throw new Error("give an output file with -o out.wav");
    const sounds = loadSounds(dir);
    const sound = opt.sound || "tap";
    let events, last;
    if (opt.text) {
      const r = textEvents(String(opt.text).replace(/\\n/g, "\n"), { start: num(opt.start, 0), cps: num(opt.cps, 18), per: opt.per || "char" });
      events = r.events; last = r.end;
    } else if (opt.times) {
      events = parseTimes(fs.readFileSync(opt.times, "utf8"), path.extname(opt.times).toLowerCase(), opt.fps ? num(opt.fps) : null);
      last = Math.max(0, ...events.map((e) => e.t));
    } else throw new Error("give --text or --times");
    if (opt["end-chime"]) events.push({ t: last + 0.18, sound: "chime" });
    const { channels, kept } = renderTrack(events, sounds, {
      sound, duration: opt.duration ? num(opt.duration) : null, lufs: num(opt.lufs, -30), ceilingDb: num(opt.ceiling, -12),
      jitterMs: num(opt["jitter-ms"], 6), pitchJitter: num(opt["pitch-jitter"], 0.05), gainJitterDb: num(opt["gain-jitter-db"], 1.5),
      minGapMs: num(opt["min-gap-ms"], 40), spread: num(opt.spread, 0.2), seed: num(opt.seed, 1) });
    fs.mkdirSync(path.dirname(path.resolve(opt.out)), { recursive: true });
    fs.writeFileSync(opt.out, encodeWav(channels));
    if (opt["events-out"]) fs.writeFileSync(opt["events-out"], JSON.stringify(kept, null, 1));
    const m = analyse(channels, 48000);
    return console.log(`wrote ${opt.out}: ${m.duration.toFixed(2)} s, ${kept.length}/${events.length} events, ${m.lufs.toFixed(1)} LUFS, peak ${m.peakDb.toFixed(1)} dBFS, ${m.ok ? "checks OK" : m.problems.join(", ")}`);
  }

  if (cmd === "check") {
    const files = (pos.length ? pos : [path.join(dir, "wav")]).flatMap((t) => fs.statSync(t).isDirectory()
      ? fs.readdirSync(t).filter((f) => f.endsWith(".wav")).sort().map((f) => path.join(t, f)) : [t]);
    console.log(`${"file".padEnd(18)}${"dur".padStart(6)}${"peak".padStart(7)}${"LUFS".padStart(7)}${"edges".padStart(7)}${"jump".padStart(6)}${"clip".padStart(5)}${">4k dB".padStart(7)}${"cent".padStart(6)}  verdict`);
    let bad = 0;
    for (const f of files) {
      const { sr, channels } = decodeWav(fs.readFileSync(f));
      const m = analyse(channels, sr); bad += !m.ok;
      console.log(path.basename(f, ".wav").slice(0, 17).padEnd(18) + fmt(m));
    }
    process.exitCode = bad ? 1 : 0;
    return;
  }

  console.log(HELP); process.exitCode = 1;
}

main().catch((e) => { console.error(`sfx-tool: ${e.message}`); process.exitCode = 1; });
