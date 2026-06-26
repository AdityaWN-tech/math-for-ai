# UX Principles — Math for AI

Non-negotiable rules for a frictionless, unified platform.  
Reference UX: [Scrimba](https://scrimba.com) (in-lesson editor), [Coursiv](https://coursiv.io) (micro-flow), [Boot.dev](https://boot.dev) (mastery + gamification).

---

## North star

> **One workspace. One flow. Zero tab switching from signup to deployed SaaS.**

The learner never leaves the platform to: clone a repo, open a separate IDE, read a PDF, or hunt for a database URL.

---

## The 10-second rule

| Action | Target |
|--------|--------|
| Signup → first interactive step | < 60s |
| Lesson load (cached) | < 2s |
| Run code (browser tier) | < 3s |
| First workspace provision | < 30s (with progress UI) |
| Deploy to staging | < 90s |
| Advance to next step | 1 click or auto (user setting) |

If any step exceeds 2× target, treat it as a product bug.

---

## Friction killers (mandatory)

1. **No external setup in Phase 0** — platform provisions environment
2. **No copy-paste between windows** — editor pre-filled from lesson
3. **No “open README”** — narrative lives in the left pane
4. **Persistent state** — code, notes, deploy URLs survive refresh
5. **Keyboard-first** — `Cmd+Enter` run, `→` continue when gate passed
6. **Mastery-gated Continue** — not scroll-gated (unlike passive video)
7. **Inline errors** — test failures show diff hints, not generic “wrong”
8. **One primary CTA per step** — Coursiv-style card flow

---

## Learning Shell zones

```
┌──────────────────────────────────────────────────────────────────┐
│  Progress rail · phase · lesson · beat · step        streak · XP │
├──────────────┬─────────────────────────────┬─────────────────────┤
│  NARRATIVE   │  WORKSPACE                  │  OUTPUT             │
│  concept     │  figure | editor | terminal │  stdout · plots     │
│  quiz        │  file tree · deploy panel   │  tests · live URL   │
├──────────────┴─────────────────────────────┴─────────────────────┤
│  ← Back    [ Hint ]  [ Run ]  [ Deploy ]     Continue → (gated)  │
└──────────────────────────────────────────────────────────────────┘
```

### Zone rules

| Zone | Content | Scroll |
|------|---------|--------|
| Narrative | MOTTO, PROBLEM, CONCEPT text, pre/post quiz | Independent |
| Workspace | Figures, Monaco editor, terminal, deploy | Independent |
| Output | Run results, plots, test report, URL preview | Independent |

On mobile: stack Narrative → Workspace → Output; build/deploy desktop-first.

---

## Beat → step model

Maps to upstream curriculum (`docs/en.md`):

| Beat | Typical steps | Gate to continue |
|------|---------------|------------------|
| MOTTO | 1 splash | Tap continue |
| PROBLEM | 1–2 story cards | Optional pre-quiz (2 Q) |
| CONCEPT | 2–5 cards + figures | Figure interaction OR “Got it” |
| BUILD IT | 3–8 code steps | All tests pass |
| USE IT | 1–3 compare runs | Framework run succeeds |
| SHIP IT | 1 export + 1 quiz | Artifact saved + post-quiz ≥80% |

**Auto-advance:** when gate passes, animate to next step (300ms). Optional setting: auto-continue without click.

---

## Execution tiers (frictionless escalation)

| Tier | When | Learner experience |
|------|------|-------------------|
| T0 Browser | Phase 1 math, small scripts | Pyodide + figures, zero setup |
| T1 Workspace | Phase 0+, most lessons | Cloud container, file tree in shell |
| T2 Deploy | Phase 11+, capstones | Real Postgres/pgvector, live URL |

Never jump tiers without UI explaining what’s happening (“Provisioning your workspace…”).

---

## Gamification (depth, not distraction)

Borrow from Boot.dev; tie rewards to engineering outcomes:

| Mechanic | Rule |
|----------|------|
| Streaks | 1 lesson or challenge per day |
| XP | Per step; bonus for first-try pass |
| Levels | Per phase complete |
| Quests | Concrete (“Deploy first Postgres table”) |
| Certificates | Phase pass + capstone rubric |
| Portfolio | Public page of live capstone URLs |

No XP for scrolling. No loot boxes without skill tie-in.

---

## AI tutor behavior

- **Socratic** — hints, not full solutions (Boot.dev Boots model)
- **Context-aware** — current step, workspace files, prior quiz misses
- **Escalation** — after 3 hints, offer worked example for *this step only*
- **Never** dump full capstone solutions

---

## Accessibility

- WCAG 2.1 AA for shell chrome
- Keyboard navigation for all gates and editor actions
- Reduced motion respects `prefers-reduced-motion`
- Figure sliders usable via keyboard

---

## Success metrics (UX)

| Metric | Target |
|--------|--------|
| Signup → Lesson 1 complete | > 40% |
| Step drop-off (any single step) | < 15% |
| Run → pass (first 3 attempts) | > 60% |
| Support tickets per 100 learners | < 5 |

Track per-step funnels in PostHog from day one of vertical slice.
