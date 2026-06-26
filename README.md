# Math for AI

Unified learning platform: read → build → deploy → ship SaaS.  
Curriculum spine: [ai-engineering-from-scratch](https://github.com/rohitg00/ai-engineering-from-scratch).

## Repository

**Private GitHub:** https://github.com/t4tarzan/math-for-ai

```bash
git clone git@github.com:t4tarzan/math-for-ai.git
```

**Phase 0–19 roadmap** — 502-lesson catalog, **30 interactive** lessons (setup → math → ML → DL → LLM eng).

```bash
# Terminal 1 — app (http://localhost:7777)
cd apps/web && npm install && npm run dev

# Terminal 2 — Postgres (slice v2 deploy)
cd ../.. && npm run infra:up   # requires Docker

# Recompile curriculum + refresh interactive manifest
npm run compile:lessons

# Add interactive lessons: edit scripts/build-interactive-lessons.mjs, then:
node scripts/build-interactive-lessons.mjs
```

| URL | What |
|-----|------|
| http://localhost:7777 | Landing |
| http://localhost:7777/lessons | Full roadmap — Phases 0–19 (502 lessons) |
| http://localhost:7777/demo/01-dev-environment | **Start here** — Phase 0 setup |
| http://localhost:7777/demo/07-docker-for-ai | Deploy Postgres |
| http://localhost:7777/demo/01-linear-algebra-intuition | Phase 1 math + Pyodide |

## Docs

| Doc | Purpose |
|-----|---------|
| [docs/UX-PRINCIPLES.md](docs/UX-PRINCIPLES.md) | Friction budget, gates, auto-advance rules |
| [docs/DESIGN.md](docs/DESIGN.md) | Visual system, shell layout, screen map |
| [docs/FIGMA-TEMPLATES.md](docs/FIGMA-TEMPLATES.md) | Market-proven Figma kits to duplicate (don't reinvent) |
| [docs/LAUNCH.md](docs/LAUNCH.md) | 90-day SaaS launch plan |
| [docs/WIREFRAME-MAP.md](docs/WIREFRAME-MAP.md) | Which template frames → which product screens |
| [docs/VERTICAL-SLICE.md](docs/VERTICAL-SLICE.md) | First build: one math lesson end-to-end |
| [docs/DEPLOY.md](docs/DEPLOY.md) | Vercel + Postgres production setup |

## Quick start (design)

1. Open [docs/FIGMA-TEMPLATES.md](docs/FIGMA-TEMPLATES.md)
2. Duplicate the recommended kits into a team Figma file: `Math for AI — Product`
3. Apply blueprint tokens from [docs/DESIGN.md](docs/DESIGN.md) over the duplicated components
4. Wireframe the Learning Shell using [docs/WIREFRAME-MAP.md](docs/WIREFRAME-MAP.md)

## Repo layout (planned)

```
math-for-ai/
├── apps/
│   └── web/                 # Next.js — landing + /demo learning shell
│       ├── src/app/         # / and /demo routes
│       ├── src/components/  # shell, figure, ui
│       ├── src/content/     # lesson manifests (JSON)
│       └── src/lib/         # pyodide runner, types
├── packages/              # ui, shell, runtime (TBD)
├── content/               # git submodule → ai-engineering-from-scratch (TBD)
├── overlays/              # harness, intent, deploy manifests (TBD)
└── docs/
```
