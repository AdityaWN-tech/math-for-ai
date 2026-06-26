# Vertical Slice — First Build

Prove the unified platform with **one lesson**, end-to-end, before scaling the compiler.

---

## Scope

| Item | Choice |
|------|--------|
| Lesson | `phases/01-math-foundations/01-linear-algebra-intuition` |
| Beats | MOTTO → PROBLEM → CONCEPT (figure) → BUILD (dot product) → SHIP |
| Runtime | T0 Pyodide only |
| Deploy | Deferred to slice v2 (Phase 0 Docker lesson) |
| Design | Code Editor kit layout + blueprint tokens |

---

## User journey (slice v1)

1. Land on `/demo` — no auth required
2. See Learning Shell with lesson pre-loaded
3. Step through 5 beats with gates
4. On BUILD: edit `dot_product` in editor, Run, pass tests
5. On complete: “Lesson 1 done” + CTA to waitlist

**Time to complete:** ~8 minutes for motivated user.

---

## Steps (beat breakdown)

### Step 1 — MOTTO
- Text: *"Every AI model is just matrix math wearing a fancy hat."*
- Gate: Continue

### Step 2 — PROBLEM (abbreviated)
- 2 scroll cards from `en.md` Problem section
- Gate: Continue

### Step 3 — CONCEPT + figure
- Short concept: dot product similarity
- Embed `vector-projection` figure (port from upstream `figures-math.js`)
- Gate: slider moved OR “Got it”

### Step 4 — BUILD
- Starter code:

```python
def dot_product(a, b):
    # TODO: implement
    pass
```

- Tests (hidden): `dot_product([1,2],[3,4]) == 11`, etc.
- Gate: all tests pass

### Step 5 — SHIP
- Show artifact card: embedding similarity concept
- Gate: Continue → completion screen

---

## Technical stack (slice v1)

```
apps/web/
├── app/demo/page.tsx          # Shell route
├── components/shell/          # 3-pane layout
├── components/figure/         # vector-projection (React)
├── lib/pyodide-runner.ts      # Web worker
└── content/lessons/01.json    # Compiled step manifest
```

**Bootstrap option:** Fork [elevate-app](https://github.com/stack-crafter/elevate-app) into `apps/web` and retheme.

---

## Slice v2 (deploy) — live

- Lesson `07-docker-for-ai` at `/demo/07-docker-for-ai`
- `docker-compose.yml` — Postgres + pgvector on port **5433**
- API: `POST /api/deploy/provision`, `GET /api/health/db`
- Deploy panel creates `learner_workspace` table

```bash
npm run infra:up    # from project root
npm run infra:down
```

---

## Definition of done

- [x] 5 steps navigable with gates
- [x] Pyodide run in browser
- [x] Figure interactive (vector projection)
- [x] Mobile: narrative readable (editor desktop-first)
- [x] Analytics hooks (`m4ai:analytics` custom events)
- [ ] Figma Shell frame approved (parallel track)

---

## After slice

1. Lesson compiler v1 (`en.md` → `lesson.json`)
2. Auth + dashboard (E-Tutor frames)
3. Submodule `content/` → ai-engineering-from-scratch
4. Phase 1 bulk compile
