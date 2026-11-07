// Local Studio server: serves the UI and reads/writes the project's sound folder.
// Edits saved in the Studio land in <dir>/*.json (+ rendered wav/); edits made to those files
// by hand or by an agent are pushed to open Studio tabs live (Server-Sent Events).
import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { listRecipes, writeRecipe, writeWav, removeRecipe, NAME_RE, initProject } from "./project.js";
import { encodeWav } from "./wav.js";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const TYPES = { ".html": "text/html; charset=utf-8", ".js": "text/javascript; charset=utf-8", ".css": "text/css; charset=utf-8",
  ".svg": "image/svg+xml", ".json": "application/json", ".wav": "audio/wav", ".png": "image/png" };

export function startStudio({ dir, port = 5178, host = "127.0.0.1" }) {
  dir = path.resolve(dir);
  if (!fs.existsSync(dir) || !fs.readdirSync(dir).some((f) => f.endsWith(".json"))) {
    const w = initProject(dir);
    console.log(`created ${dir} with the default pack (${w.length} sounds)`);
  }
  const clients = new Set();
  const ownWrites = new Map(); // name -> time, to skip echoing our own saves
  const send = (msg) => { for (const c of clients) c.write(`data: ${JSON.stringify(msg)}\n\n`); };

  let timer = null; const pending = new Set();
  fs.watch(dir, (ev, file) => {
    if (!file || !file.endsWith(".json")) return;
    const name = path.basename(file, ".json");
    if (Date.now() - (ownWrites.get(name) || 0) < 800) return;
    pending.add(name); clearTimeout(timer);
    timer = setTimeout(() => {
      const names = [...pending]; pending.clear();
      const recipes = Object.fromEntries(listRecipes(dir).map((r) => [r.name, r]));
      for (const n of names) send(recipes[n] ? { type: "changed", recipe: recipes[n] } : { type: "removed", name: n });
      for (const n of names) if (recipes[n]) try { writeWav(dir, recipes[n]); } catch (e) { console.warn(`${n}: ${e.message}`); }
    }, 150);
  });

  const body = (req) => new Promise((res, rej) => { const ch = []; req.on("data", (c) => ch.push(c)); req.on("end", () => res(Buffer.concat(ch))); req.on("error", rej); });
  const json = (res, code, obj) => { res.writeHead(code, { "content-type": "application/json" }); res.end(JSON.stringify(obj)); };

  const server = http.createServer(async (req, res) => {
    try {
      const url = new URL(req.url, "http://x");
      const p = decodeURIComponent(url.pathname);
      if (p === "/api/info") return json(res, 200, { dir, mode: "local", version: JSON.parse(fs.readFileSync(path.join(ROOT, "package.json"))).version });
      if (p === "/api/sounds" && req.method === "GET") return json(res, 200, listRecipes(dir));
      if (p === "/api/events") {
        res.writeHead(200, { "content-type": "text/event-stream", "cache-control": "no-cache", connection: "keep-alive" });
        res.write(": hi\n\n"); clients.add(res); req.on("close", () => clients.delete(res)); return;
      }
      const m = p.match(/^\/api\/sounds\/([^/]+)$/);
      if (m) {
        const name = m[1];
        if (!NAME_RE.test(name)) return json(res, 400, { error: "Use letters, digits, _ and - only." });
        if (req.method === "PUT") {
          const recipe = { ...JSON.parse((await body(req)).toString("utf8")), name };
          ownWrites.set(name, Date.now()); writeRecipe(dir, recipe); ownWrites.set(name, Date.now());
          return json(res, 200, { ok: true });
        }
        if (req.method === "DELETE") { ownWrites.set(name, Date.now()); removeRecipe(dir, name); return json(res, 200, { ok: true }); }
      }
      if (p === "/api/export" && req.method === "POST") { // save a rendered track/wav into <dir>/exports
        const name = (url.searchParams.get("name") || "track").replace(/[^a-z0-9_.-]/gi, "_");
        const out = path.join(dir, "exports"); fs.mkdirSync(out, { recursive: true });
        const file = path.join(out, name.endsWith(".wav") ? name : name + ".wav");
        fs.writeFileSync(file, await body(req));
        return json(res, 200, { ok: true, file });
      }
      // static: /src/* engine modules, everything else from studio/
      let file = p.startsWith("/src/") ? path.join(ROOT, p) : path.join(ROOT, "studio", p === "/" ? "index.html" : p);
      file = path.resolve(file);
      if (!file.startsWith(ROOT) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) { res.writeHead(404); return res.end("not found"); }
      res.writeHead(200, { "content-type": TYPES[path.extname(file)] || "application/octet-stream", "cache-control": "no-store" });
      fs.createReadStream(file).pipe(res);
    } catch (e) { json(res, 500, { error: e.message }); }
  });
  server.listen(port, host, () => console.log(`sfx-tool Studio: http://localhost:${port}  (sounds in ${dir})`));
  return server;
}

export { encodeWav };
