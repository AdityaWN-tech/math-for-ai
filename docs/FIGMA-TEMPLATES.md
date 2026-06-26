# Figma Templates — Don't Reinvent the Wheel

Curated, market-proven kits from Figma Community. **Duplicate → retheme → wireframe.**  
Apply blueprint tokens from [DESIGN.md](DESIGN.md) after duplicating.

---

## Recommended stack (use all four)

| Role | Template | Cost | Why |
|------|----------|------|-----|
| **Marketing + LMS shell** | [E-Tutor LMS](https://www.figma.com/community/file/1271304360859402063/e-tutor-learning-management-system-community) | Free | 45+ pages, student dashboard, course detail, quiz, auth, progress — most complete free LMS |
| **Coursiv-like flow** | [Coursiva.io UI Kit](https://www.figma.com/community/website-templates/e-learning) (search “Coursiva.io” in Community) | ~$6 | Closest to coursiv.io card-based education UX |
| **Coding shell** | [Code Editor Learning Platform UI](https://www.figma.com/design/ombLNHqde0OB66uIesz7Ay/Code-Editor-Learning-Platform-UI--Community-) | Free | Pre-built IDE + lesson layout; [code export](https://github.com/stack-crafter/elevate-app) exists |
| **Gamified dashboard** | [Learning Skills Platform](https://www.figma.com/community/file/1511080132826644065/learning-skills-platform) | Free | Streaks, XP, achievements, course grid — Boot.dev energy |

**Optional fifth:** [SkillQue UI Kit](https://www.figma.com/community/file/1643119431001316704/skillque-ui-ux-figma-landing-page-copy) — polished student dashboard + landing if E-Tutor feels too heavy.

---

## Secondary / swap-in options

| Template | Link | Use for |
|----------|------|---------|
| LearnPro Career Kit | [Figma](https://www.figma.com/community/file/1512394369372185201/learnpro-career-acceleration-website-ui-kit) | Landing, conversion hero, pricing |
| Dreams LMS | [Figma](https://www.figma.com/community/file/1542911527930004020/dreams-lms-free-figma-ui-kit-for-learning-management-systems) | Alternate dashboard |
| LMS Template 2 | [Figma](https://www.figma.com/community/file/1608160468832873529/lms-or-online-education-or-elearning-tor-learning-management-system-template-2) | Video lesson page, progress UI |
| LMS Dashboards | [Figma](https://www.figma.com/community/file/1561971037277211668/lms-dashboards-community) | Light/dark analytics |
| CS Lab Editor | [Figma](https://www.figma.com/community/file/1269984078143781693/cs-lab-editor-an-integrated-web-based-ide-for-beginners-and-students) | IDE glassmorphism reference (Replit-like) |
| SaaSPro blocks | [Figma Community → SaaS](https://www.figma.com/community/website-templates/e-learning) | Pricing tables, feature grids |
| Untitled UI | [untitledui.com](https://www.figma.com/community) | If you need enterprise-grade component library (free tier available) |

---

## What each competitor maps to

| Competitor UX | Steal from template | Build custom |
|---------------|---------------------|--------------|
| Scrimba in-lesson edit | Code Editor Learning Platform | Event timeline / pause semantics |
| Coursiv micro-lessons | Coursiva.io kit | Auto-advance gate logic |
| Boot.dev gamification | Learning Skills Platform | Quest copy tied to deploy milestones |
| Boot.dev text lessons | E-Tutor lesson pages | Beat/step splitter UI |
| Real deploy + DB | — | Deploy panel (no template — wireframe in WIREFRAME-MAP) |

---

## Setup checklist (30 minutes)

1. Create Figma team project: **Math for AI**
2. Duplicate these four files into the project:
   - E-Tutor LMS
   - Code Editor Learning Platform UI
   - Learning Skills Platform
   - Coursiva.io kit (purchase if needed — $6)
3. Create **`Math for AI — Product`** file with pages from [DESIGN.md](DESIGN.md)
4. Copy components into `01 — Components` page
5. Create local styles:
   - Colors: blueprint, paper, ink (from DESIGN.md)
   - Text: VT323 / Source Serif 4 / JetBrains Mono
6. Follow [WIREFRAME-MAP.md](WIREFRAME-MAP.md) to assemble screens

---

## Retheme guide (1 hour)

| Template default | Replace with |
|------------------|--------------|
| Teal / green primaries | `#3553ff` blueprint |
| Inter / Poppins body | Source Serif 4 (narrative), JetBrains (UI) |
| Rounded 16px cards | 8px + optional hard shadow `3px 3px 0 #1a1a1a` |
| Stock photos | Blueprint SVG figures (from upstream `site/assets`) |
| “Course” labels | “Phase” / “Lesson” / “Beat” |

---

## Code-ready exports

| Template | Has React export? | Notes |
|----------|-------------------|-------|
| Code Editor Learning Platform | Yes — [elevate-app](https://github.com/stack-crafter/elevate-app) | Good shell starting point; retheme required |
| E-Tutor | No (design only) | Use for layout reference |
| shadcn/ui + Tailwind | N/A | Implement dashboard from E-Tutor screenshots |

**Recommendation:** Use **elevate-app** or **shadcn dashboard blocks** for dev bootstrap after Figma sign-off on Shell layout only.

---

## Licensing

- Community files: check each file’s license (most CC BY 4.0 or free for commercial)
- Coursiva.io kit: verify Envato/Figma author license before commercial launch
- Replace all stock photography before marketing launch

---

## Not recommended (avoid wheel reinvention traps)

| Trap | Instead |
|------|---------|
| Blank Figma file | Duplicate E-Tutor + Code Editor kits |
| Generic “AI SaaS” purple templates | Blueprint tokens on LMS kits |
| Building full design system before one screen | Vertical slice: Shell only first |
| Figma-only with no code path | Pair with elevate-app or shadcn for Shell |
