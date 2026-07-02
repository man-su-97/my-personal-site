/* Portfolio interactions — no dependencies.
   1. scroll reveal + progress   2. typed rotator   3. pipeline widget   4. canvas dino */

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

nodes.forEach((n) => {
  n.addEventListener("click", () => selectStage(n.dataset.stage));
  n.addEventListener("mouseenter", () => selectStage(n.dataset.stage));
});

/* ---------- 4. bespoke dino (canvas, palette-native) ----------
   Crisp at any width (devicePixelRatio-aware) and waits for the
   player to start — it never dies on its own. */
const cv = document.getElementById("dino");
const scoreEl = document.getElementById("dino-score");

if (cv && cv.getContext) {
  const ctx = cv.getContext("2d");
  const MINT = "#10B981", MUTED = "#71717A", LINE = "#26262B", BG_TXT = "#3F3F46";

  let W, H, GROUND;
  let dino, cacti, speed, score, state, raf; // state: "idle" | "run" | "dead"

  function fit() {
    const rect = cv.parentElement.getBoundingClientRect();
    const width = Math.min(720, rect.width - 28);
    const dpr = window.devicePixelRatio || 1;
    W = Math.max(300, width);
    H = Math.round(W * 0.19);
    cv.width = Math.round(W * dpr);
    cv.height = Math.round(H * dpr);
    cv.style.width = W + "px";
    cv.style.height = H + "px";
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    GROUND = H - 30;
  }

  function reset() {
    dino = { x: 42, y: 0, vy: 0, w: 26, h: 26 };
    cacti = [];
    speed = W / 170;
    score = 0;
    scoreEl.textContent = "0";
  }

  function drawDino(color) {
    const gy = GROUND - dino.y;                    // dino.y = height above ground
    ctx.fillStyle = color;
    ctx.fillRect(dino.x, gy - dino.h + 8, dino.w, dino.h - 8);   // body
    ctx.fillRect(dino.x + dino.w - 8, gy - dino.h - 4, 16, 14);  // head
    ctx.fillRect(dino.x - 7, gy - dino.h + 12, 8, 5);            // tail
    ctx.fillStyle = "#09090B";
    ctx.fillRect(dino.x + dino.w + 2, gy - dino.h, 3, 3);        // eye
  }

  function drawGroundLine() {
    ctx.strokeStyle = LINE;
    ctx.beginPath();
    ctx.moveTo(0, GROUND + 0.5);
    ctx.lineTo(W, GROUND + 0.5);
    ctx.stroke();
  }

  function drawIdle() {
    ctx.clearRect(0, 0, W, H);
    drawGroundLine();
    drawDino(MINT);
    ctx.fillStyle = BG_TXT;
    ctx.font = "12px 'JetBrains Mono', monospace";
    ctx.textAlign = "center";
    ctx.fillText("press Space or click to start", W / 2, GROUND - 22);
  }

  function jump() {
    if (state === "idle" || state === "dead") {
      reset();
      state = "run";
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(step);
      return;
    }
    if (dino.y === 0) dino.vy = 8.4;
  }

  function step() {
    // physics: y is height above ground (0 = standing)
    dino.vy -= 0.45;
    dino.y = Math.max(0, dino.y + dino.vy);
    if (dino.y === 0) dino.vy = 0;

    if (Math.random() < 0.015 && (!cacti.length || W - cacti[cacti.length - 1].x > W / 3.2)) {
      cacti.push({ x: W + 12, w: 9 + Math.random() * 8, h: 16 + Math.random() * 14 });
    }
    for (const c of cacti) c.x -= speed;
    while (cacti.length && cacti[0].x < -30) {
      cacti.shift();
      score++;
      scoreEl.textContent = score;
      if (score % 7 === 0) speed += 0.3;
    }

    // collision: overlap in x while too low to clear the cactus
    for (const c of cacti) {
      const overlapX = dino.x + dino.w - 4 > c.x && dino.x + 4 < c.x + c.w;
      if (overlapX && dino.y < c.h - 3) { state = "dead"; break; }
    }

    // draw
    ctx.clearRect(0, 0, W, H);
    drawGroundLine();
    ctx.fillStyle = MUTED;
    for (const c of cacti) ctx.fillRect(c.x, GROUND - c.h, c.w, c.h);
    drawDino(state === "dead" ? MUTED : MINT);

    if (state === "dead") {
      ctx.fillStyle = BG_TXT;
      ctx.font = "12px 'JetBrains Mono', monospace";
      ctx.textAlign = "center";
      ctx.fillText("ouch — Space or click to retry", W / 2, GROUND - 22);
    } else {
      raf = requestAnimationFrame(step);
    }
  }

  cv.addEventListener("pointerdown", jump);
  document.addEventListener("keydown", (e) => {
    if (e.code !== "Space") return;
    const tag = document.activeElement?.tagName;
    if (tag === "INPUT" || tag === "TEXTAREA" || tag === "BUTTON" || tag === "A") return;
    e.preventDefault();
    jump();
  });

  let resizeTimer;
  window.addEventListener("resize", () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => { fit(); reset(); state = "idle"; cancelAnimationFrame(raf); drawIdle(); }, 150);
  });

  fit();
  reset();
  state = "idle";
  if (reduce) {
    drawIdle(); // static frame; a click still starts it deliberately
  } else {
    drawIdle();
  }
}
