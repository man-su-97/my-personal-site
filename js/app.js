/* Portfolio interactions — no dependencies.
   1. reveals, nav, ambient videos   2. typed rotator   3. pipeline widget */

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

/* ---------- 1d. mobile nav (hamburger) ---------- */
const navEl = document.querySelector(".nav");
const navToggle = document.getElementById("nav-toggle");
if (navEl && navToggle) {
  const setOpen = (open) => {
    navEl.classList.toggle("open", open);
    navToggle.setAttribute("aria-expanded", String(open));
  };
  navToggle.addEventListener("click", () => setOpen(!navEl.classList.contains("open")));
  navEl.querySelectorAll(".nav-links a").forEach((a) => a.addEventListener("click", () => setOpen(false)));
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") setOpen(false); });
}

/* ---------- 1e. ambient videos: play only while on screen ---------- */
const ambients = document.querySelectorAll("video.ambient");
if (ambients.length && !reduce && "IntersectionObserver" in window) {
  const vio = new IntersectionObserver((entries) => {
    for (const e of entries) {
      if (e.isIntersecting) e.target.play().catch(() => {});
      else e.target.pause();
    }
  }, { threshold: 0.15 });
  ambients.forEach((v) => vio.observe(v));
}

/* ---------- 2. typed rotator: real work, typed live ---------- */
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

/* ---------- 3. pipeline widget ---------- */
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

nodes.forEach((n, i) => {
  n.addEventListener("click", () => selectStage(n.dataset.stage));
  n.addEventListener("mouseenter", () => selectStage(n.dataset.stage));
  n.addEventListener("keydown", (e) => {
    let j;
    if (e.key === "ArrowRight" || e.key === "ArrowDown") j = (i + 1) % nodes.length;
    else if (e.key === "ArrowLeft" || e.key === "ArrowUp") j = (i - 1 + nodes.length) % nodes.length;
    else return;
    e.preventDefault();
    nodes[j].focus();
    selectStage(nodes[j].dataset.stage);
  });
});
