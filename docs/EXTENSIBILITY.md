# Platform extensibility

Math for AI lessons are data-driven JSON consumed by a small plugin layer in the web app. This doc describes how to extend exercises, figures, runtimes, and gamification without rewriting the shell.

## Architecture

```
Lesson JSON (interactive/*.json)
    │
    ├─ steps[]: motto → problem → concept → build|deploy → ship → complete
    │
    └─ build.deploy.exercise: { plugin, runtimeTier, rubric, xpReward, hints }
            │
            ▼
    LearningShell
            ├─ Figure registry     (lib/figures/registry.tsx)
            ├─ Exercise registry   (lib/exercises/registry.ts)
            ├─ Pyodide runner      (lib/pyodide-runner.ts)  [T0]
            ├─ DeployPanel         [T2]
            └─ Progress + XP       (lib/progress.ts, lib/gamification.ts)
```

## Runtime tiers (T0 / T1 / T2)

| Tier | Runtime | Use for |
|------|---------|---------|
| **T0** | Pyodide in browser | Math, small Python, algorithm checkpoints |
| **T1** | Cloud workspace (planned) | Multi-file repos, terminals, TS/Rust |
| **T2** | Real deploy + infra | Postgres provision, APIs, capstones |

Set on `step.exercise.runtimeTier`. The shell reads `exercise.plugin` to choose workspace UI.

## Rubric tiers

| Rubric | Meaning | XP |
|--------|---------|-----|
| **T0** | Single-check smoke test | 25 base |
| **T1** | Multi-check + hints | 30 base + first-try bonus |
| **T2** | Deploy / integration / capstone | 50 base + deploy bonus |

Inferred from test count when building lessons (`__check` occurrences).

## Exercise plugins

Register in `apps/web/src/lib/exercises/registry.ts`:

| Plugin id | Gate | Status |
|-----------|------|--------|
| `pyodide-tests` | `tests` | **Live** |
| `deploy-postgres` | `deploy` | **Live** (`07-docker-for-ai`) |
| `monaco-ts` | `tests` | Stub for T1 |

To add a plugin:

1. Extend `ExercisePluginId` in `lesson-types.ts`
2. Implement `ExercisePluginDef` in `registry.ts`
3. Add workspace UI branch in `LearningShell` (or extract to `components/exercises/`)

## Figures

Register in `lib/figures/registry.tsx`. Reference from lesson JSON:

```json
{ "type": "concept", "gate": "figure", "figure": "vector-projection" }
```

## Gamification (localStorage `m4ai:progress:v2`)

- **XP**: lesson pass, first-try bonus (+15), deploy (+50), phase complete (+100)
- **Streaks**: consecutive calendar days with activity
- **Badges**: defined in `lib/gamification.ts`, evaluated on lesson complete
- **Code persistence**: editor buffer saved per lesson id

Header HUD: `components/gamification/ProgressHUD.tsx`

## Tooling scripts

| Command | Purpose |
|---------|---------|
| `npm run compile:interactive` | Rebuild lesson JSON + registry + enrich metadata |
| `npm run enrich:lessons` | Add exercise/hints/deepen tests on existing JSON |
| `npm run lint:lessons` | Report shallow tests & missing metadata |
| `npm run generate:batchN` | Regenerate spec batches |

### Adding a new interactive lesson

1. Add spec to `scripts/interactive-specs-batch*.mjs` or `SPECS` in `build-interactive-lessons.mjs`
2. `npm run compile:interactive`
3. Optionally hand-author in `interactive-hand-authored/{id}.json` (preserved on rebuild)

### Deepening exercises

- Prefer **2+ `__check` calls** in test harness
- Add `hints` array (3 progressive strings) on `build.exercise`
- For capstones, use `rubric: "T2"` and deploy gate where appropriate

`scripts/enrich-lesson-platform.mjs` auto-adds metadata and appends edge-case checks for identity stubs.

## Roadmap

1. **T1 workspace** — file tree + terminal provider behind `monaco-ts` plugin
2. **Hidden tests** — server-side or bundled second harness for anti-cheat
3. **Account sync** — POST progress to API for cross-device streaks
4. **Quest lines** — phase-scoped quest JSON driving catalog badges
5. **Figure plugin pack** — attention, calculus, agent-loop diagrams
