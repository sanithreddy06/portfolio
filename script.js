/* =========================================================
   Sai Sanith Reddy — Portfolio scripts
   Edit the PROJECTS and HACKATHONS arrays below to update content.
   ========================================================= */

/* ---------- CONTACT FORM ----------
   The form posts to /api/contact (api/contact.js), a Vercel serverless function
   that sends the message to your inbox with Resend. The API key lives only in
   environment variables (Vercel, or .env.local when testing), never in this file. */
const CONTACT_EMAIL = "mudiyalasanith2006@gmail.com";

const PROJECTS = [
  {
    title: "CodeLens",
    category: "AI · Developer tool",
    desc: "An AI-powered tool for exploring codebases — it explains code and its structure, detects errors and suggests optimizations.",
    tags: ["React", "Node.js", "AI", "GitHub API"],
    link: "https://github.com/sanithreddy06/AI-Powered-Codebase-Understanding-and-Exploration-Tool",
  },
  {
    title: "Smart Waste Classification",
    category: "ML · Computer vision",
    desc: "An AI image-classification system for automated waste segregation.",
    tags: ["Python", "Machine Learning", "Computer Vision"],
    link: "https://github.com/sanithreddy06/smartwaste",
  },
  {
    title: "Smart Parking System",
    category: "IoT · Hardware",
    desc: "An IoT parking solution using sensors and microcontrollers, with real-time availability tracking. Try the live simulation in the Lab below.",
    tags: ["Arduino", "IoT", "Sensors"],
    link: null, // academic project
    labLink: true,
  },
  {
    title: "Personal Control Center",
    category: "Full-stack · Productivity",
    desc: "A full-stack dashboard to manage notes, tasks, documents, bookmarks and schedules in one place.",
    tags: ["Full-stack", "Supabase", "Dashboard"],
    link: "https://github.com/sanithreddy06/control-center",
  },
  {
    title: "House Price Prediction",
    category: "ML · Data science",
    desc: "A machine learning model trained with regression techniques to forecast house prices from property features.",
    tags: ["Python", "Machine Learning", "Data Science"],
    link: null, // academic project
  },
];

// Add one object per hackathon.
const HACKATHONS = [
  {
    name: "Aarambh Hackathon",
    organizer: "Orion · School of Computer Science & Engineering",
    date: "2026",
    result: "Participant",
    project: "CODEX — Autonomous Reverse Engineering & Code Intelligence",
    desc: "Ingests software repositories, parses them into ASTs with Tree-sitter, and builds dependency graphs, discovers REST endpoints, reverse-engineers database models and generates technical specs and test suites — with AI answers grounded in static-analysis evidence.",
    tags: ["Python", "FastAPI", "React", "TypeScript", "Tree-sitter", "Docker"],
    link: "https://github.com/sanithreddy06/CODEX_Aarambh",
  },
];

/* ---------- helpers ---------- */
const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
const pad = (n, l = 2) => String(n).padStart(l, "0");
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/* ---------- render projects ---------- */
$("#projectList").innerHTML = PROJECTS.map((p, i) => `
  <article class="project reveal">
    <span class="p-idx">${pad(i + 1)} / ${pad(PROJECTS.length)}</span>
    <div>
      <span class="p-cat">${p.category}</span>
      <h3 class="p-title">${p.title}</h3>
    </div>
    <div>
      <p class="p-desc">${p.desc}</p>
      <div class="p-tags">${p.tags.map(t => `<span>${t}</span>`).join("")}</div>
    </div>
    ${p.link
      ? `<a class="p-link" href="${p.link}" target="_blank" rel="noopener">GitHub ↗</a>`
      : p.labLink
        ? `<a class="p-link" href="#lab">Try demo ↓</a>`
        : `<span class="p-link">${p.note || "Academic project"}</span>`}
  </article>`).join("");

/* ---------- render hackathons ---------- */
$("#hackGrid").innerHTML = HACKATHONS.map((h, i) => `
  <article class="hack reveal" data-n="${pad(i + 1)}">
    <div class="hack-top mono"><span>${h.date}</span><span class="badge">${h.result}</span></div>
    <h3>${h.name}</h3>
    ${h.organizer ? `<p class="org mono">${h.organizer}</p>` : ""}
    <p class="proj">→ ${h.project}</p>
    <p>${h.desc}</p>
    ${h.tags ? `<div class="p-tags">${h.tags.map(t => `<span>${t}</span>`).join("")}</div>` : ""}
    ${h.link ? `<a class="p-link" href="${h.link}" target="_blank" rel="noopener">GitHub ↗</a>` : ""}
  </article>`).join("");

/* ---------- nav ---------- */
const nav = $(".nav");
const menuBtn = $(".menu-btn");
const links = $(".nav-links");
menuBtn.addEventListener("click", () => {
  const open = links.classList.toggle("open");
  menuBtn.setAttribute("aria-expanded", open);
});
$$(".nav-links a").forEach(a => a.addEventListener("click", () => {
  links.classList.remove("open");
  menuBtn.setAttribute("aria-expanded", "false");
}));
window.addEventListener("scroll", () => nav.classList.toggle("scrolled", scrollY > 20), { passive: true });

// active link
const secObserver = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      $$(".nav-links a").forEach(a => a.classList.toggle("active", a.getAttribute("href") === "#" + e.target.id));
    }
  });
}, { rootMargin: "-45% 0px -50% 0px" });
$$("main section[id]").forEach(s => secObserver.observe(s));

/* ---------- reveal on scroll ---------- */
const revealObserver = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add("in"); revealObserver.unobserve(e.target); }
  });
}, { threshold: 0.12 });
$$(".reveal").forEach((el, i) => {
  el.style.transitionDelay = `${(i % 4) * 70}ms`;
  revealObserver.observe(el);
});

/* ---------- hero LED matrix ---------- */
(() => {
  const canvas = $("#matrix");
  const ctx = canvas.getContext("2d");
  const GAP = 26;
  let w, h, cols, rows, dpr;
  const mouse = { x: -9999, y: -9999, active: false };
  let t = 0;

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = canvas.clientWidth; h = canvas.clientHeight;
    canvas.width = w * dpr; canvas.height = h * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    cols = Math.ceil(w / GAP) + 1; rows = Math.ceil(h / GAP) + 1;
  }
  resize();
  window.addEventListener("resize", resize);

  const hero = $(".hero");
  hero.addEventListener("pointermove", e => {
    const r = canvas.getBoundingClientRect();
    mouse.x = e.clientX - r.left; mouse.y = e.clientY - r.top; mouse.active = true;
  });
  hero.addEventListener("pointerleave", () => { mouse.active = false; });

  let visible = true, running = false;
  new IntersectionObserver(([e]) => {
    visible = e.isIntersecting;
    if (visible && !running && !reduceMotion) { running = true; requestAnimationFrame(frame); }
  }).observe(canvas);

  function frame() {
    if (!visible && !reduceMotion) { running = false; return; }
    running = true;
    t += 0.012;
    ctx.clearRect(0, 0, w, h);
    // idle wanderer when the cursor isn't on the hero
    const tx = mouse.active ? mouse.x : w * (0.5 + 0.32 * Math.sin(t * 0.9));
    const ty = mouse.active ? mouse.y : h * (0.45 + 0.25 * Math.cos(t * 1.3));
    const R = Math.min(260, w * 0.35);
    for (let i = 0; i < cols; i++) {
      for (let j = 0; j < rows; j++) {
        const x = i * GAP, y = j * GAP;
        const d = Math.hypot(x - tx, y - ty);
        const k = Math.max(0, 1 - d / R);
        const hue = (255 + (x / w) * 110 + (y / h) * 30 + t * 20) % 360; // violet → pink → orange
        if (k > 0.02) {
          ctx.fillStyle = `hsla(${hue.toFixed(0)}, 95%, 58%, ${(0.15 + k * 0.85).toFixed(3)})`;
          ctx.beginPath(); ctx.arc(x, y, 1.4 + k * 3.2, 0, Math.PI * 2); ctx.fill();
        } else {
          const wave = 0.5 + 0.5 * Math.sin(i * 0.35 + j * 0.25 - t * 2.2);
          ctx.fillStyle = `rgba(40, 30, 90, ${(0.08 + wave * 0.06).toFixed(3)})`;
          ctx.fillRect(x - 0.8, y - 0.8, 1.6, 1.6);
        }
      }
    }
    if (!reduceMotion) requestAnimationFrame(frame); else running = false;
  }
  frame();
})();

/* ---------- Live Lab: smart parking ---------- */
(() => {
  const N = 12;
  const lot = $("#lot");
  const serial = $("#serial");
  const freeCount = $("#freeCount");
  const freeBar = $("#freeBar");
  const gateLed = $("#gateLed");
  const gateText = $("#gateText");
  const THRESH = 30;

  const bays = Array.from({ length: N }, (_, i) => ({ id: i + 1, taken: [1, 4, 5, 9].includes(i) }));

  lot.innerHTML = bays.map(b => `
    <button class="bay" data-id="${b.id}">
      <span class="bay-head"><span>B${pad(b.id)}</span><span class="led"></span></span>
      <span class="beam"></span>
      <span class="car"></span>
      <span class="bay-dist">— cm</span>
      <span class="sr-only bay-sr"></span>
    </button>`).join("");

  const els = $$(".bay", lot);
  const lines = [];
  const now = () => { const d = new Date(); return `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`; };
  function log(msg, cls = "") {
    lines.push(`<span class="${cls}">[${now()}] ${msg}</span>`);
    if (lines.length > 11) lines.shift();
    serial.innerHTML = lines.join("\n");
  }

  const reading = b => b.taken ? 8 + Math.round(Math.random() * 14) : 180 + Math.round(Math.random() * 70);

  function paint() {
    let free = 0;
    bays.forEach((b, i) => {
      const el = els[i];
      el.classList.toggle("taken", b.taken);
      el.classList.toggle("free", !b.taken);
      const led = $(".led", el);
      led.className = "led " + (b.taken ? "red" : "on");
      el.setAttribute("aria-pressed", b.taken);
      $(".bay-sr", el).textContent = `${b.taken ? "occupied" : "free"}, press to ${b.taken ? "remove car" : "park"}`;
      if (!b.taken) free++;
    });
    freeCount.textContent = free;
    freeCount.classList.toggle("full", free === 0);
    freeBar.style.width = (free / N) * 100 + "%";
    freeBar.style.background = free === 0 ? "var(--red)" : "var(--lime)";
    gateLed.className = "led " + (free === 0 ? "red" : "on");
    gateText.textContent = free === 0 ? "LOT FULL · GATE CLOSED" : "GATE OPEN";
  }

  function tickReadings() {
    bays.forEach((b, i) => { $(".bay-dist", els[i]).textContent = `${pad(reading(b), 3)} cm`; });
  }

  function toggle(i, source = "manual") {
    const b = bays[i];
    b.taken = !b.taken;
    const d = reading(b);
    $(".bay-dist", els[i]).textContent = `${pad(d, 3)} cm`;
    log(`B${pad(b.id)} dist=${d}cm ${d < THRESH ? "<" : ">"} ${THRESH} → ${b.taken ? "OCCUPIED" : "FREE"}${source === "auto" ? " (auto)" : ""}`, b.taken ? "warn" : "ok");
    paint();
    const free = bays.filter(x => !x.taken).length;
    if (free === 0) log("ALL BAYS TAKEN → gate servo 0°", "warn");
  }

  els.forEach((el, i) => el.addEventListener("click", () => toggle(i)));

  // auto traffic
  let autoTimer = null;
  $("#autoTraffic").addEventListener("change", e => {
    if (e.target.checked) {
      log("auto traffic ON", "ok");
      autoTimer = setInterval(() => toggle(Math.floor(Math.random() * N), "auto"), 1300);
    } else {
      clearInterval(autoTimer);
      log("auto traffic OFF");
    }
  });

  log("booting… HC-SR04 ×12 online", "ok");
  log(`threshold = ${THRESH}cm · polling 1Hz`);
  paint();
  tickReadings();
  let labVisible = false;
  new IntersectionObserver(([e]) => { labVisible = e.isIntersecting; }).observe(lot);
  setInterval(() => { if (labVisible) tickReadings(); }, 1000);
})();

/* ---------- copy email ---------- */
$$(".copy").forEach(btn => btn.addEventListener("click", async () => {
  try {
    await navigator.clipboard.writeText(btn.dataset.copy);
    btn.textContent = "COPIED ✓"; btn.classList.add("done");
  } catch {
    btn.textContent = "SELECT ↑";
  }
  setTimeout(() => { btn.textContent = "COPY"; btn.classList.remove("done"); }, 1800);
}));

/* ---------- contact form: spam guards + paper-plane send ---------- */
(() => {
  const form = $("#contactForm");
  const body = $("#formBody");
  const success = $("#formSuccess");
  const note = $("#formNote");
  const btn = $("#sendBtn");
  const msg = form.elements.message;
  const counter = $("#msgCount");
  const LOG_KEY = "ssr_contact_log";
  const MAX_PER_HOUR = 3;          // browser-side limit (the server enforces its own, stricter one)
  const COOLDOWN_MS = 60 * 1000;   // wait between two messages
  let startedAt = 0;

  const say = (text, tone = "dim") => {
    note.textContent = text;
    note.dataset.tone = tone;
  };

  // time-trap: remember when the visitor started typing (bots submit instantly)
  form.addEventListener("focusin", () => { if (!startedAt) startedAt = Date.now(); });

  msg.addEventListener("input", () => {
    counter.textContent = `${msg.value.length} / 2000`;
    counter.classList.toggle("warn", msg.value.length > 1800);
  });

  // ---- local send history (friendly limit; can't be relied on alone) ----
  const readLog = () => {
    try { return JSON.parse(localStorage.getItem(LOG_KEY) || "[]").filter(t => Date.now() - t < 3600e3); }
    catch { return []; }
  };
  const writeLog = log => { try { localStorage.setItem(LOG_KEY, JSON.stringify(log)); } catch {} };
  const localBlock = () => {
    const log = readLog();
    const last = log[log.length - 1] || 0;
    if (Date.now() - last < COOLDOWN_MS) return `Please wait ${Math.ceil((COOLDOWN_MS - (Date.now() - last)) / 1000)}s before sending another message.`;
    if (log.length >= MAX_PER_HOUR) return "You've sent a few messages already — please try again in an hour, or email me directly.";
    return "";
  };

  const validate = () => {
    const f = form.elements;
    const checks = [
      [f.name, f.name.value.trim().length >= 2, "Please enter your name."],
      [f.email, /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(f.email.value.trim()), "Please enter a valid email."],
      [f.message, f.message.value.trim().length >= 10, "Your message needs at least 10 characters."],
    ];
    let firstError = "";
    checks.forEach(([el, ok, text]) => {
      el.classList.toggle("err", !ok);
      if (!ok && !firstError) { firstError = text; el.focus(); }
    });
    return firstError;
  };

  // ---- paper plane flight ----
  function flyAway() {
    return new Promise(resolve => {
      if (reduceMotion) return resolve();
      const from = $(".btn-plane", btn).getBoundingClientRect();
      const plane = document.createElement("div");
      plane.className = "flying-plane";
      plane.innerHTML = $(".btn-plane", btn).outerHTML;
      plane.style.left = `${from.left + from.width / 2 - 30}px`;
      plane.style.top = `${from.top + from.height / 2 - 30}px`;
      document.body.appendChild(plane);
      btn.classList.add("launched");
      body.classList.add("folding");

      // loop up and around, then glide off the top-right of the screen
      const dx = window.innerWidth - from.left + 160;
      const up = Math.min(from.top + 120, window.innerHeight * 0.75);
      const flight = plane.animate([
        { transform: "translate(0,0) rotate(0deg) scale(.6)", easing: "ease-out" },
        { transform: "translate(-60px,34px) rotate(-12deg) scale(1)", offset: 0.14, easing: "ease-in-out" },
        { transform: `translate(${dx * 0.12}px,-${up * 0.35}px) rotate(-48deg) scale(1.15)`, offset: 0.34, easing: "ease-in-out" },
        { transform: `translate(${dx * 0.3}px,-${up * 0.55}px) rotate(8deg) scale(1.2)`, offset: 0.52, easing: "ease-in-out" },
        { transform: `translate(${dx * 0.55}px,-${up * 0.45}px) rotate(-6deg) scale(1.05)`, offset: 0.7, easing: "ease-in" },
        { transform: `translate(${dx}px,-${up}px) rotate(-30deg) scale(.6)`, opacity: 0.3 },
      ], { duration: 2400, easing: "linear", fill: "forwards" });

      // dotted trail
      let last = 0;
      const trail = t => {
        if (!plane.isConnected) return;
        if (t - last > 34) {
          last = t;
          const r = plane.getBoundingClientRect();
          const dot = document.createElement("span");
          dot.className = "trail-dot";
          dot.style.left = `${r.left + r.width / 2}px`;
          dot.style.top = `${r.top + r.height / 2}px`;
          document.body.appendChild(dot);
          setTimeout(() => dot.remove(), 1100);
        }
        requestAnimationFrame(trail);
      };
      requestAnimationFrame(trail);

      flight.onfinish = () => { plane.remove(); resolve(); };
    });
  }

  function showSuccess(name, email) {
    $("#successName").textContent = name.split(" ")[0];
    $("#successEmail").textContent = email;
    body.hidden = true;
    success.hidden = false;
    success.classList.remove("show");
    void success.offsetWidth; // restart animation
    success.classList.add("show");
  }

  $("#sendAnother").addEventListener("click", () => {
    form.reset();
    counter.textContent = "0 / 2000";
    startedAt = 0;
    success.hidden = true;
    body.hidden = false;
    body.classList.remove("folding");
    btn.classList.remove("launched", "is-sending");
    say("");
    const block = localBlock();
    if (block) say(block, "warn");
    form.elements.name.focus();
  });

  form.addEventListener("submit", async e => {
    e.preventDefault();
    if (btn.disabled) return;
    const error = validate();
    if (error) return say(error, "error");
    if (form.elements.company.value) return; // honeypot tripped: silently ignore

    const block = localBlock();
    if (block) return say(block, "warn");

    const name = form.elements.name.value.trim();
    const email = form.elements.email.value.trim();
    const message = form.elements.message.value.trim();

    // The form only sends through the server (Resend). Opened as a plain file there is no server.
    if (location.protocol === "file:") {
      return say("Start the site with `npm run dev` to send messages (see README).", "warn");
    }

    btn.disabled = true;
    btn.classList.add("is-sending");
    $(".send-label", btn).textContent = "Sending…";
    say("");
    // The server treats forms filled in under 3 s as bots. A real person who pastes
    // quickly shouldn't lose their message, so we simply hold it until 3 s have passed.
    if (!startedAt) startedAt = Date.now();
    const wait = 3300 - (Date.now() - startedAt);
    if (wait > 0) await new Promise(r => setTimeout(r, wait));
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, message, company: "", elapsed: startedAt ? Date.now() - startedAt : 0 }),
      });
      if (res.status === 404 || res.status === 405 || res.status === 501) {
        throw new Error(`Contact service isn't running here. Email me at ${CONTACT_EMAIL}`);
      }
      const data = await res.json().catch(() => ({}));
      if (res.status === 429) {
        const mins = Math.max(1, Math.ceil((data.retryAfter || 600) / 60));
        return say(`Too many messages — please try again in ~${mins} min.`, "warn");
      }
      if (!res.ok || !data.success) throw new Error(data.error || data.message || "failed");

      writeLog([...readLog(), Date.now()]);
      await flyAway();
      showSuccess(name, email);
    } catch (err) {
      say(err.message && err.message !== "failed" ? err.message : `Couldn't send right now — email me at ${CONTACT_EMAIL}`, "error");
      form.classList.remove("shake"); void form.offsetWidth; form.classList.add("shake");
    } finally {
      btn.disabled = false;
      btn.classList.remove("is-sending");
      $(".send-label", btn).textContent = "Send Message";
    }
  });
})();

$("#year").textContent = new Date().getFullYear();
