// A project's sound folder: <dir>/<name>.json recipes, rendered to <dir>/wav/<name>.wav.
import fs from "node:fs";
import path from "node:path";
import { normalize, renderRecipe } from "./engine.js";
import { encodeWav } from "./wav.js";
import { DEFAULT_PACK } from "./pack.js";

export const NAME_RE = /^[a-z0-9][a-z0-9_-]{0,63}$/i;

export function listRecipes(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir).filter((f) => f.endsWith(".json")).sort().flatMap((f) => {
    try { return [{ name: path.basename(f, ".json"), ...JSON.parse(fs.readFileSync(path.join(dir, f), "utf8")) }]; }
    catch (e) { console.warn(`skipping ${f}: ${e.message}`); return []; }
  }).map((r) => ({ ...r, name: r.name }));
}

export function loadSounds(dir) {
  const out = {};
  for (const r of listRecipes(dir)) out[r.name] = r;
  if (!Object.keys(out).length) for (const r of DEFAULT_PACK) out[r.name] = r;
  return out;
}

/** Store only what differs from the family defaults, so recipes stay short and readable. */
export function compact(recipe) {
  const full = normalize(recipe);
  const base = normalize({ family: full.family, model: full.model }).params;
  const params = {};
  for (const [k, v] of Object.entries(full.params)) if (base[k] !== v) params[k] = typeof v === "number" ? +v.toFixed(4) : v;
  const out = { name: full.name, family: full.family, model: full.model, seed: full.seed, params };
  if (full.description) out.description = full.description;
  if (full.tags?.length) out.tags = full.tags;
  return out;
}

export function writeRecipe(dir, recipe, { wav = true } = {}) {
  if (!NAME_RE.test(recipe.name)) throw new Error(`bad sound name "${recipe.name}" (letters, digits, _ and - only)`);
  fs.mkdirSync(dir, { recursive: true });
  const file = path.join(dir, `${recipe.name}.json`);
  fs.writeFileSync(file, JSON.stringify(compact(recipe), null, 2) + "\n");
  if (wav) writeWav(dir, recipe);
  return file;
}

export function writeWav(dir, recipe) {
  const out = path.join(dir, "wav");
  fs.mkdirSync(out, { recursive: true });
  const file = path.join(out, `${recipe.name}.wav`);
  fs.writeFileSync(file, encodeWav([renderRecipe(recipe)]));
  return file;
}

export function removeRecipe(dir, name) {
  if (!NAME_RE.test(name)) throw new Error("bad name");
  for (const f of [path.join(dir, `${name}.json`), path.join(dir, "wav", `${name}.wav`)]) if (fs.existsSync(f)) fs.unlinkSync(f);
}

export function initProject(dir, { force = false } = {}) {
  const written = [];
  for (const r of DEFAULT_PACK) {
    if (!force && fs.existsSync(path.join(dir, `${r.name}.json`))) continue;
    writeRecipe(dir, r); written.push(r.name);
  }
  return written;
}
