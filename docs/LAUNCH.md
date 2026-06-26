# SaaS Launch Plan — 90 Days

Math for AI: from Figma compose → vertical slice → paid beta.

---

## Positioning

**Wedge:** Phase 1 Math Foundations + deploy promise  
**Expand:** Full 503-lesson path → 17 macro SaaS capstones  
**Tagline:** *Read it. Build it. Deploy it. Own it.*

**ICP:** Self-taught engineers and career switchers who want AI depth + deployable portfolio, not tool tips.

---

## Pricing (draft)

| Tier | Price | Includes |
|------|-------|----------|
| Free | $0 | Placement, Phase 0 (3 lessons), Phase 1 (5 lessons), read-only capstone previews |
| Pro | $39/mo | Full curriculum, workspace, T0+T1, artifact toolkit |
| Deploy | $59/mo | Pro + T2 staging deploys, capstone rubric CI |
| Annual | 2 months free | Either paid tier |

30-day money-back guarantee (Boot.dev pattern).

---

## Phase 0 — Foundation (Weeks 1–4)

| Week | Deliverable | Owner |
|------|-------------|-------|
| 1 | Duplicate Figma kits; compose Shell wireframe | Design |
| 2 | Token retheme; clickable prototype signup→lesson | Design |
| 3 | Vertical slice spec signed off ([VERTICAL-SLICE.md](VERTICAL-SLICE.md)) | Product |
| 4 | Shell UI in code (elevate-app or shadcn base) | Eng |

**Exit:** 5 users complete wireframe walkthrough without confusion.

---

## Phase 1 — Private beta (Weeks 5–8)

| Item | Detail |
|------|--------|
| Content | Phase 0 + Phase 1 (22 lessons) compiled |
| Waitlist | Landing from LearnPro frame; PostHog |
| Cohort | 50–100 users, Discord |
| Billing | Stripe test mode |
| Content marketing | 3 posts: math intuition, anti-vibe-coding, deploy thread |

**Metrics:** Signup→L1 > 35%; Week-2 retention > 15%

---

## Phase 2 — Public beta (Weeks 9–12)

| Channel | Action |
|---------|--------|
| Product Hunt | Launch with interactive demo |
| Hacker News | Show HN — technical depth angle |
| Twitter/X | Blueprint aesthetic, deploy GIF |
| Partnership | ai-engineering-from-scratch maintainers |
| Paid | Stripe live |

**Metrics:** 500 signups; Free→Paid > 4%

---

## Phase 3 — Growth (Months 4–6)

- Training Grounds (spaced repetition)
- First macro capstone (#08 RAG) in Deploy tier
- Teams pilot
- SEO glossary hub (upstream content)
- Case study: “3 SaaS apps from one curriculum”

---

## Marketing stack

| Function | Tool |
|----------|------|
| Landing + waitlist | Next.js on Vercel |
| Email drip | Resend or Loops |
| Analytics | PostHog |
| Payments | Stripe |
| Community | Discord |
| Demo video | Screen Studio → 2 min hero |
| Social clips | Remotion (optional) |

---

## Launch checklist

- [ ] Figma prototype: signup → lesson 1 → run code
- [ ] Landing live with waitlist
- [ ] Privacy policy + Terms
- [ ] Stripe products created
- [ ] PostHog funnels: signup, L1, L5, paywall
- [ ] Discord server + #help channel
- [ ] 30-day refund policy published
- [ ] OG image (blueprint style)

---

## Risk mitigations

| Risk | Mitigation |
|------|------------|
| Figma ≠ code drift | Shell built from elevate-app; Figma for marketing + layout only |
| Scope creep (503 lessons) | Ship Phase 1 only for beta |
| Deploy cost | Staging only; sleep inactive workspaces |
| Template license | Audit before paid ads |
