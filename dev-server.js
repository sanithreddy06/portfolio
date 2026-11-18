// Local test server: serves the site AND runs api/contact.js, like Vercel does.
// No installs needed (Node 18+).
//
//   1. cp .env.example .env.local   → put your real RESEND_API_KEY in .env.local
//   2. npm run dev                  → open http://localhost:3000
//
// Messages sent from the form are delivered to your inbox through Resend.

import http from "node:http";
import { readFile, stat } from "node:fs/promises";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.dirname(fileURLToPath(import.meta.url));
const PORT = Number(process.env.PORT) || 3000;

// load .env.local (or .env) into process.env
for (const file of [".env.local", ".env"]) {
  const p = path.join(ROOT, file);
  if (!existsSync(p)) continue;
  for (const line of readFileSync(p, "utf8").split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (m && !line.trim().startsWith("#") && process.env[m[1]] === undefined) {
      process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
    }
  }
}

const { default: contact } = await import("./api/contact.js");

const TYPES = {
  ".html": "text/html; charset=utf-8", ".css": "text/css", ".js": "text/javascript",
  ".json": "application/json", ".svg": "image/svg+xml", ".png": "image/png", ".ico": "image/x-icon",
  ".pdf": "application/pdf", ".jpg": "image/jpeg", ".webp": "image/webp", ".woff2": "font/woff2",
};
const BLOCKED = /^\/(\.env|\.git|api\/|dev-server\.js|package\.json|node_modules)/;

// minimal Vercel-style res helpers
function wrap(res) {
  res.status = (code) => { res.statusCode = code; return res; };
  res.json = (obj) => { res.setHeader("Content-Type", "application/json"); res.end(JSON.stringify(obj)); return res; };
  return res;
}

http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  try {
    if (url.pathname === "/api/contact") {
      let raw = "";
      for await (const chunk of req) {
        raw += chunk;
        if (raw.length > 20000) { res.statusCode = 413; return res.end(); }
      }
      try { req.body = raw ? JSON.parse(raw) : {}; } catch { req.body = raw; }
      req.headers["x-real-ip"] ||= req.socket.remoteAddress;
      await contact(req, wrap(res));
      console.log(`POST /api/contact → ${res.statusCode}`);
      return;
    }

    let file = decodeURIComponent(url.pathname);
    if (BLOCKED.test(file)) { res.statusCode = 404; return res.end("Not found"); }
    if (file.endsWith("/")) file += "index.html";
    const full = path.join(ROOT, path.normalize(file));
    if (!full.startsWith(ROOT)) { res.statusCode = 403; return res.end(); }
    if (!(await stat(full).catch(() => null))?.isFile()) { res.statusCode = 404; return res.end("Not found"); }
    res.setHeader("Content-Type", TYPES[path.extname(full)] || "application/octet-stream");
    res.end(await readFile(full));
  } catch (err) {
    console.error(err);
    res.statusCode = 500;
    res.end("Server error");
  }
}).listen(PORT, () => {
  const key = process.env.RESEND_API_KEY;
  console.log(`\n  Portfolio running at  http://localhost:${PORT}`);
  console.log(key ? "  Resend key loaded ✓ — form messages will be emailed to you.\n"
                  : "  ⚠ No RESEND_API_KEY found — add it to .env.local, then restart.\n");
});
