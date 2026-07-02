/* Portfolio interactions — no dependencies.
   1. scroll reveal   2. pipeline widget   3. command menu   4. canvas dino */

const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/* ---------- 1. scroll reveal (cards + section headings) ---------- */
const revealables = document.querySelectorAll(".reveal, .section h2");
if (!reduce && "IntersectionObserver" in window) {
  const io = new IntersectionObserver((entries) => {
    for (const e of entries) if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); }
  }, { threshold: 0.12 });
  revealables.forEach((el) => io.observe(el));
} else {
  revealables.forEach((el) => el.classList.add("in"));
}

/* ---------- 1b. scroll progress hairline ---------- */
const bar = document.getElementById("progress");
if (bar && !reduce) {
  const onScroll = () => {
    const doc = document.documentElement;
    const max = doc.scrollHeight - doc.clientHeight;
    bar.style.width = max > 0 ? (100 * doc.scrollTop / max) + "%" : "0";
  };
  document.addEventListener("scroll", onScroll, { passive: true });
  onScroll();
}

/* ---------- 1c. typed rotator: real work, typed live ---------- */
const typedEl = document.getElementById("typed");
if (typedEl) {
  const phrases = [
    "fusing vector + full-text search with RRF",
    "bounding agent loops in LangGraph",
    "parsing citations out of grounded answers",
    "logging tokens & latency on every LLM call",
    "guarding inputs: injection blocked, PII redacted",
  ];
  if (reduce) {
    typedEl.textContent = phrases[0];
  } else {
    let pi = 0, ci = 0, deleting = false;
    (function tick() {
      const phrase = phrases[pi];
      ci += deleting ? -1 : 1;
      typedEl.textContent = phrase.slice(0, ci);
      let delay = deleting ? 26 : 46 + Math.random() * 40;
      if (!deleting && ci === phrase.length) { delay = 2100; deleting = true; }
      else if (deleting && ci === 0) { deleting = false; pi = (pi + 1) % phrases.length; delay = 420; }
      setTimeout(tick, delay);
    })();
  }
}

/* ---------- 2. pipeline widget ---------- */
const nodes = document.querySelectorAll(".node");
const panels = document.querySelectorAll(".panel-content");

function selectStage(stage) {
  nodes.forEach((n) => {
    const on = n.dataset.stage === stage;
    n.classList.toggle("active", on);
    n.setAttribute("aria-selected", String(on));
  });
  panels.forEach((p) => { p.hidden = p.dataset.for !== stage; });
}

nodes.forEach((n) => {
  n.addEventListener("click", () => selectStage(n.dataset.stage));
  n.addEventListener("mouseenter", () => selectStage(n.dataset.stage));
});

/* ---------- 3. command menu ---------- */
const overlay = document.getElementById("cmdk");
const input = document.getElementById("cmdk-input");
const list = document.getElementById("cmdk-list");
let items = [];
let sel = 0;

function openMenu() {
  overlay.hidden = false;
  input.value = "";
  filter("");
  input.focus();
}

function closeMenu() { overlay.hidden = true; }

function visibleItems() { return items.filter((li) => !li.hidden); }

function setSel(i) {
  const vis = visibleItems();
  if (!vis.length) return;
  sel = (i + vis.length) % vis.length;
  items.forEach((li) => li.classList.remove("sel"));
  vis[sel].classList.add("sel");
  vis[sel].scrollIntoView({ block: "nearest" });
}

function filter(q) {
  q = q.toLowerCase();
  items.forEach((li) => { li.hidden = q && !li.textContent.toLowerCase().includes(q); });
  setSel(0);
}

function run(li) {
  if (!li) return;
  const { action, target, value } = li.dataset;
  if (action === "goto") {
    closeMenu();
    document.querySelector(target)?.scrollIntoView({ behavior: reduce ? "auto" : "smooth" });
  } else if (action === "copy") {
    navigator.clipboard?.writeText(value);
    li.querySelector("em").textContent = "Copied";
    setTimeout(closeMenu, 550);
  } else if (action === "open") {
    window.open(value, "_blank", "noopener");
    closeMenu();
  }
}

items = Array.from(list.querySelectorAll("li"));
items.forEach((li) => li.addEventListener("click", () => run(li)));

document.getElementById("cmdk-open").addEventListener("click", openMenu);

document.addEventListener("keydown", (e) => {
  if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") { e.preventDefault(); overlay.hidden ? openMenu() : closeMenu(); return; }
  if (overlay.hidden) return;
  if (e.key === "Escape") closeMenu();
  else if (e.key === "ArrowDown") { e.preventDefault(); setSel(sel + 1); }
  else if (e.key === "ArrowUp") { e.preventDefault(); setSel(sel - 1); }
  else if (e.key === "Enter") run(visibleItems()[sel]);
});

input.addEventListener("input", () => filter(input.value));
overlay.addEventListener("click", (e) => { if (e.target === overlay) closeMenu(); });

/* ---------- 4. bespoke dino (canvas, palette-native) ---------- */
const cv = document.getElementById("dino");
const scoreEl = document.getElementById("dino-score");

if (cv && cv.getContext) {
  const ctx = cv.getContext("2d");
  const W = cv.width, H = cv.height;
  const GROUND = H - 26;
  const MINT = "#10B981", MUTED = "#71717A", LINE = "#26262B";

  let dino, cacti, speed, score, dead, raf;

  function reset() {
    dino = { x: 46, y: GROUND, vy: 0, w: 22, h: 30 };
    cacti = [];
    speed = 4.2;
    score = 0;
    dead = false;
  }

  function jump() {
    if (dead) { reset(); raf = requestAnimationFrame(step); return; }
    if (dino.y >= GROUND) dino.vy = -11.5;
  }

  cv.addEventListener("pointerdown", jump);
  document.addEventListener("keydown", (e) => {
    if (e.code === "Space" && overlay.hidden) {
      const tag = document.activeElement?.tagName;
      if (tag !== "INPUT" && tag !== "TEXTAREA") { e.preventDefault(); jump(); }
    }
  });

  function step() {
    // physics
    dino.vy += 0.62;
    dino.y = Math.min(dino.y + dino.vy, GROUND);

    if (Math.random() < 0.016 && (!cacti.length || W - cacti[cacti.length - 1].x > 240)) {
      const h = 18 + Math.random() * 16;
      cacti.push({ x: W + 10, w: 10 + Math.random() * 8, h });
    }
    for (const c of cacti) c.x -= speed;
    while (cacti.length && cacti[0].x < -30) { cacti.shift(); score++; scoreEl.textContent = score; if (score % 8 === 0) speed += 0.25; }

    // collision: axis-aligned boxes, 4px forgiveness on each side
    const dinoBottom = dino.y + dino.h;
    for (const c of cacti) {
      const cactusTop = GROUND + dino.h - c.h;
      const overlapX = dino.x + dino.w - 4 > c.x && dino.x + 4 < c.x + c.w;
      const overlapY = dinoBottom - 2 > cactusTop;
      if (overlapX && overlapY) { dead = true; break; }
    }

    // draw
    ctx.clearRect(0, 0, W, H);
    ctx.strokeStyle = LINE;
    ctx.beginPath(); ctx.moveTo(0, GROUND + dino.h + 0.5); ctx.lineTo(W, GROUND + dino.h + 0.5); ctx.stroke();

    // dino: minimal blocks in mint
    ctx.fillStyle = dead ? MUTED : MINT;
    const dy = dino.y;
    ctx.fillRect(dino.x, dy, dino.w, dino.h);                 // body
    ctx.fillRect(dino.x + dino.w - 6, dy - 10, 14, 12);       // head
    ctx.fillStyle = "#09090B";
    ctx.fillRect(dino.x + dino.w + 2, dy - 7, 3, 3);          // eye

    // cacti: muted blocks
    ctx.fillStyle = MUTED;
    for (const c of cacti) ctx.fillRect(c.x, GROUND + dino.h - c.h, c.w, c.h);

    if (dead) {
      ctx.fillStyle = MUTED;
      ctx.font = "12px 'JetBrains Mono', monospace";
      ctx.textAlign = "center";
      ctx.fillText("— click to restart —", W / 2, 44);
      cancelAnimationFrame(raf); // freeze the end state; jump() resets
    } else {
      raf = requestAnimationFrame(step);
    }
  }

  reset();
  if (reduce) {
    // Reduced motion: draw one static frame, no game loop.
    dino.y = GROUND;
    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = MINT;
    ctx.fillRect(dino.x, dino.y, dino.w, dino.h);
    ctx.fillRect(dino.x + dino.w - 6, dino.y - 10, 14, 12);
    ctx.strokeStyle = LINE;
    ctx.beginPath(); ctx.moveTo(0, GROUND + dino.h + 0.5); ctx.lineTo(W, GROUND + dino.h + 0.5); ctx.stroke();
  } else {
    raf = requestAnimationFrame(step);
  }
}
