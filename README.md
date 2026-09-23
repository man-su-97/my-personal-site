# Suman Mandal — portfolio

Personal portfolio of a full-stack & GenAI developer — production web apps
(Next.js, FastAPI, NestJS, PostgreSQL) and LLM features (RAG pipelines,
LangGraph agents, evaluation and safety).

- **Live:** https://suman-mandal.vercel.app/
- **Mirror (GitHub Pages):** https://man-su-97.github.io/my-personal-site/

## What's on the site

- **Hero** — intro, resume download, GitHub / LinkedIn links, and an
  interactive widget walking through the stages of a RAG pipeline
- **Selected work** — News Aggregator + AI News Intelligence, PRISM,
  AI Dashboard Lab, PleaseYourself e-commerce
- **Experience** — A&J Intelli Systems, Nashbud Inc, upliance.ai, education
- **Stack** — tools grouped by area, each linking to its official docs
- **Contact** — email and resume PDF

## Tech

Plain HTML + CSS + one small dependency-free script — no framework, no build step.

```
index.html               page content
css/styles.css           all styles (dark "Obsidian & Mint" theme, responsive)
js/app.js                scroll reveals, mobile nav, typed rotator, pipeline widget
images/                  profile photo, stack icons, animations
Suman_Mandal_Resume.pdf  resume served by the Download buttons
```

## Run locally

```bash
python3 -m http.server 8000
# open http://localhost:8000
```

## Deploy

Pushing to `main` deploys automatically:

- **Vercel** serves the repo root as a static site.
- **GitHub Pages** is deployed by `.github/workflows/deploy.yml`.

After changing `css/styles.css` or `js/app.js`, bump the `?v=` number on its
`<link>` / `<script>` tag in `index.html` so returning visitors get the new file.

## Updating the resume

Replace `Suman_Mandal_Resume.pdf` (keep the filename), then check that the
Experience, Work and Stack sections in `index.html` still match it.
