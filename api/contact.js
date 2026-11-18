// Vercel serverless function: POST /api/contact
// Sends contact-form messages to your inbox via Resend, with spam protection.
//
// Required env var (Vercel → Project → Settings → Environment Variables):
//   RESEND_API_KEY            your Resend API key (re_...)
// Recommended (free, makes rate limits work across all servers): https://upstash.com → Redis → REST API
//   UPSTASH_REDIS_REST_URL
//   UPSTASH_REDIS_REST_TOKEN
// Optional:
//   CONTACT_TO                where messages go (default: mudiyalasanith2006@gmail.com)
//   CONTACT_FROM              verified sender (default: contact@saisanithreddy.online)
//   ALLOWED_ORIGINS           comma-separated extra sites allowed to post, e.g. https://www.saisanith.in

import { createHash } from "node:crypto";

const TO = process.env.CONTACT_TO || "mudiyalasanith2006@gmail.com";
const FROM = process.env.CONTACT_FROM || "Sai Sanith Reddy <contact@saisanithreddy.online>";

// ---- spam rules (tweak here) ----
const LIMITS = {
  perIpShort: { max: 3, windowSec: 10 * 60 },       // 3 messages / 10 minutes per visitor
  perIpDay: { max: 8, windowSec: 24 * 60 * 60 },    // 8 messages / day per visitor
  perEmailDay: { max: 5, windowSec: 24 * 60 * 60 }, // 5 / day from the same email address
  globalDay: { max: 60, windowSec: 24 * 60 * 60 },  // 60 / day in total (protects your Resend quota)
};
const MIN_FILL_MS = 3000;   // humans need more than 3 s to fill the form
const MAX_LINKS = 3;
const DUPLICATE_WINDOW_SEC = 24 * 60 * 60;

const DEFAULT_ORIGINS = ["https://saisanith.in", "https://www.saisanith.in"];

/* ---------------- storage: Upstash Redis if configured, else memory ---------------- */
const mem = new Map(); // key -> { n, exp }
const memIncr = (key, ttl) => {
  const now = Date.now();
  let e = mem.get(key);
  if (!e || e.exp <= now) e = { n: 0, exp: now + ttl * 1000 };
  e.n += 1;
  mem.set(key, e);
  if (mem.size > 5000) for (const [k, v] of mem) if (v.exp <= now) mem.delete(k);
  return { count: e.n, ttl: Math.ceil((e.exp - now) / 1000) };
};
const memSetOnce = (key, ttl) => {
  const now = Date.now();
  const e = mem.get(key);
  if (e && e.exp > now) return false;
  mem.set(key, { n: 1, exp: now + ttl * 1000 });
  return true;
};

const upstash = process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
  ? { url: process.env.UPSTASH_REDIS_REST_URL.replace(/\/$/, ""), token: process.env.UPSTASH_REDIS_REST_TOKEN }
  : null;

async function redis(commands) {
  const r = await fetch(`${upstash.url}/pipeline`, {
    method: "POST",
    headers: { Authorization: `Bearer ${upstash.token}`, "Content-Type": "application/json" },
    body: JSON.stringify(commands),
  });
  if (!r.ok) throw new Error(`upstash ${r.status}`);
  return (await r.json()).map((x) => x.result);
}

async function incr(key, ttl) {
  if (upstash) {
    try {
      const [, count, left] = await redis([["SET", key, 0, "EX", ttl, "NX"], ["INCR", key], ["TTL", key]]);
      return { count: Number(count), ttl: Number(left) > 0 ? Number(left) : ttl };
    } catch (e) { console.error("rate-limit store error, using memory:", e.message); }
  }
  return memIncr(key, ttl);
}

async function setOnce(key, ttl) {
  if (upstash) {
    try {
      const [ok] = await redis([["SET", key, 1, "EX", ttl, "NX"]]);
      return ok === "OK";
    } catch (e) { console.error("dedupe store error, using memory:", e.message); }
  }
  return memSetOnce(key, ttl);
}

/* ---------------- helpers ---------------- */
const hash = (s) => createHash("sha256").update(String(s)).digest("hex").slice(0, 32);
const escape = (s) =>
  String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const clientIp = (req) =>
  String(req.headers["x-real-ip"] || req.headers["x-forwarded-for"] || req.socket?.remoteAddress || "unknown")
    .split(",")[0].trim();

function originAllowed(origin) {
  if (!origin) return true; // same-origin form posts may omit it; other checks still apply
  const extra = (process.env.ALLOWED_ORIGINS || "").split(",").map((s) => s.trim()).filter(Boolean);
  if ([...DEFAULT_ORIGINS, ...extra].includes(origin)) return true;
  try {
    const { hostname } = new URL(origin);
    return hostname === "localhost" || hostname === "127.0.0.1" || hostname.endsWith(".vercel.app");
  } catch { return false; }
}

const fail = (res, status, error, extra = {}) => res.status(status).json({ success: false, error, ...extra });

/* ---------------- handler ---------------- */
export default async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return fail(res, 405, "Method not allowed");
  }
  if (!originAllowed(req.headers.origin)) return fail(res, 403, "Not allowed");
  if (!process.env.RESEND_API_KEY) return fail(res, 500, "Server is missing RESEND_API_KEY");

  let body = req.body || {};
  if (typeof body === "string") {
    if (body.length > 12000) return fail(res, 413, "Message too large");
    try { body = JSON.parse(body); } catch { body = {}; }
  }

  const name = String(body.name || "").trim();
  const email = String(body.email || "").trim().toLowerCase();
  const message = String(body.message || "").trim();
  const elapsed = Number(body.elapsed) || 0;

  // 1. Bot traps: pretend it worked so bots learn nothing, but send nothing.
  if (body.company || body.botcheck) return res.status(200).json({ success: true });
  if (elapsed < MIN_FILL_MS) return res.status(200).json({ success: true });

  // 2. Validation
  if (name.length < 2 || name.length > 100) return fail(res, 400, "Please enter your name.");
  if (email.length > 200 || !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) return fail(res, 400, "Please enter a valid email.");
  if (message.length < 10) return fail(res, 400, "Your message needs at least 10 characters.");
  if (message.length > 2000) return fail(res, 400, "Please keep your message under 2000 characters.");
  if ((message.match(/https?:\/\/|www\./gi) || []).length > MAX_LINKS) return fail(res, 400, "Too many links in your message.");
  if (/https?:\/\//i.test(name)) return fail(res, 400, "Please enter your name.");

  // 3. Rate limits (visitor IP is hashed, never stored raw)
  const ipKey = hash(clientIp(req));
  const checks = [
    [`rl:ip10m:${ipKey}`, LIMITS.perIpShort],
    [`rl:ipday:${ipKey}`, LIMITS.perIpDay],
    [`rl:email:${hash(email)}`, LIMITS.perEmailDay],
    ["rl:global", LIMITS.globalDay],
  ];
  for (const [key, { max, windowSec }] of checks) {
    const { count, ttl } = await incr(key, windowSec);
    if (count > max) {
      res.setHeader("Retry-After", String(ttl));
      return fail(res, 429, "Too many messages. Please try again later.", { retryAfter: ttl });
    }
  }

  // 4. Duplicate guard: the exact same message twice within a day is delivered once
  const fresh = await setOnce(`dup:${hash(email + "|" + message)}`, DUPLICATE_WINDOW_SEC);
  if (!fresh) return res.status(200).json({ success: true });

  // 5. Send
  const html = `
    <div style="font-family:Arial,sans-serif;font-size:15px;line-height:1.6;color:#111">
      <h2 style="margin:0 0 12px">New Portfolio Contact</h2>
      <p><strong>Name:</strong> ${escape(name)}</p>
      <p><strong>Email:</strong> <a href="mailto:${escape(email)}">${escape(email)}</a></p>
      <p><strong>Message:</strong></p>
      <p style="white-space:pre-wrap;background:#f4f4f4;padding:12px;border-radius:6px">${escape(message)}</p>
      <hr /><p style="color:#777;font-size:12px">Sent from your portfolio website.</p>
    </div>`;

  try {
    const r = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: FROM,
        to: [TO],
        reply_to: email,
        subject: `New Portfolio Message from ${name.slice(0, 60)}`,
        html,
        text: `Name: ${name}\nEmail: ${email}\n\n${message}`,
      }),
    });
    if (!r.ok) {
      console.error("Resend error", r.status, await r.text());
      return fail(res, 502, "Couldn't send right now. Please email me directly.");
    }
    return res.status(200).json({ success: true });
  } catch (err) {
    console.error(err);
    return fail(res, 500, "Couldn't send right now. Please email me directly.");
  }
}
