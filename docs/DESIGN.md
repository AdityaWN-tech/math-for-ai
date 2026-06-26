# Design System — Math for AI

Visual and layout spec. **Do not invent from zero** — start from market-proven Figma kits (see [FIGMA-TEMPLATES.md](FIGMA-TEMPLATES.md)), then apply this token layer.

---

## Aesthetic direction

**Blueprint technical manuscript** — aligned with [aiengineeringfromscratch.com](https://aiengineeringfromscratch.com), not generic purple-gradient SaaS.

| Attribute | Choice |
|-----------|--------|
| Tone | Engineer’s notebook + modern IDE |
| Density | Scrimba-clean (focused), Boot.dev-readable (text) |
| Motion | Staggered step reveals; subtle, not gamified casino |
| Differentiation | Blueprint accent on warm paper; mono display headings |

---

## Color tokens

Apply over duplicated Figma components (replace template primaries).

```css
/* Light */
--bg: #fafaf5;
--bg-surface: #f3f1e8;
--ink: #1a1a1a;
--ink-soft: #4a4a4a;
--ink-mute: #7a7a78;
--blueprint: #3553ff;
--blueprint-tint: rgba(53, 83, 255, 0.08);
--warn: #b8870f;
--code-bg: #efece0;
--rule-soft: rgba(26, 26, 26, 0.16);

/* Dark */
--bg-dark: #0a0d1a;
--bg-surface-dark: #131830;
--ink-dark: #e8e6dc;
--blueprint-dark: #6b8eff;
```

---

## Typography

| Role | Font | Fallback |
|------|------|----------|
| Display / phase numbers | VT323 | monospace |
| Body / concept prose | Source Serif 4 | Georgia, serif |
| Code / UI chrome | JetBrains Mono | ui-monospace |

Template kits often use Inter — **swap body to Source Serif 4** for narrative; keep sans only for dense UI labels if needed.

---

## Core components (build from templates)

| Component | Source template | Customization |
|-----------|-----------------|---------------|
| Button primary | Any kit `Button/Primary` | `--blueprint`, hard shadow optional |
| Progress bar | LMS dashboard kits | Blueprint fill, phase label |
| Course card | SkillQue / E-Tutor | Phase number, lesson count |
| Lesson step card | Coursiva-style mobile cards | Beat indicator |
| Editor chrome | Code Editor Learning Platform | 3-pane shell |
| Quiz option | E-Tutor / LMS template | Pre/post badge |
| Deploy panel | SaaS dashboard blocks | URL + status pill |
| Stat card | Boot.dev-style dashboard | XP, streak, deploy count |

---

## Screen inventory

| # | Screen | Priority | Template primary |
|---|--------|----------|------------------|
| 1 | Landing | P0 | LearnPro / SkillQue / Coursiva kit |
| 2 | Placement quiz | P0 | LMS quiz modals |
| 3 | Dashboard (path) | P0 | SkillQue student dashboard |
| 4 | **Learning Shell** | P0 | Code Editor Platform + CS Lab |
| 5 | Auth | P0 | Any LMS sign-in |
| 6 | Pricing | P1 | LearnPro pricing section |
| 7 | Portfolio / SaaS gallery | P1 | Dashboard + project cards |
| 8 | Artifact toolkit | P1 | Settings / library pattern |
| 9 | Capstone rubric results | P2 | Analytics dashboard |
| 10 | Settings / billing | P2 | E-Tutor student settings |

---

## Learning Shell layout (canonical)

**Desktop (≥1280px):** 20% | 50% | 30%  
**Tablet:** collapsible narrative drawer  
**Mobile:** single column, workspace hidden for concept-only steps

### Header (fixed)

- Logo · Phase/Lesson breadcrumb · Step dots · Streak · Avatar

### Footer action bar (fixed)

- Back (disabled on first step)
- Hint (opens tutor drawer)
- Run (T0/T1)
- Deploy (T2, disabled until tests pass)
- Continue (primary, gated)

---

## Motion

| Event | Animation |
|-------|-----------|
| Step advance | 300ms slide-left + fade |
| Test pass | Brief green pulse on output panel |
| Deploy success | URL reveal + copy button |
| Phase complete | Full-screen certificate (skippable) |

Respect `prefers-reduced-motion`: instant transitions only.

---

## Figma team file structure

Create one team file: **`Math for AI — Product`**

```
📁 00 — Cover & tokens
📁 01 — Components (from duplicated kits)
📁 02 — Marketing (landing, pricing)
📁 03 — App (dashboard, shell, quiz)
📁 04 — Flows (signup → lesson 1 → deploy)
📁 99 — Reference (screenshots Scrimba, Boot.dev)
```

---

## Code alignment (later)

When implementing:

- **Next.js 15** + App Router
- **Tailwind** with CSS variables above
- **shadcn/ui** for primitives (maps cleanly from Untitled UI / SaaS kits)
- **Monaco** for editor pane

Figma → code: use Figma Dev Mode or Anima only for marketing pages; **hand-build Shell** from spec (templates rarely include deploy pane).
