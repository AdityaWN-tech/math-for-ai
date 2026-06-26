#!/usr/bin/env node
/**
 * Post-process interactive lessons: exercise metadata, hints, deepen shallow tests.
 * Run: node scripts/enrich-lesson-platform.mjs
 */
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");
const INTERACTIVE = path.join(ROOT, "apps/web/src/content/lessons/interactive");
const HAND_AUTHORED = path.join(ROOT, "apps/web/src/content/lessons/interactive-hand-authored");

const HAND_AUTHORED_IDS = new Set([
  "01-linear-algebra-intuition",
  "02-vectors-matrices-operations",
  "03-matrix-transformations",
  "07-docker-for-ai",
]);

const FIGURE_CONCEPTS = {
  "01-the-agent-loop": "agent-loop",
  "02-self-attention-from-scratch": "attention",
  "04-calculus-for-ml": "calculus-derivative",
};

const T1_WORKSPACE_LESSONS = new Set([
  "32-minimal-agent-workbench",
  "41-workbench-for-real-repos",
  "42-agent-workbench-capstone",
]);

function countChecks(tests) {
  return (tests.match(/__check\(/g) ?? []).length;
}

function isIdentityStub(starter, tests) {
  if (/lesson_checkpoint/.test(starter)) return false;
  if (countChecks(tests) >= 2) return false;
  if (/def (\w+)\([^)]*\):\s*\n\s*return \1\b/m.test(starter)) return true;
  if (/def \w+\(x\):\s*\n\s*return x\b/m.test(starter)) return true;
  return false;
}

function deepenTests(starter, tests) {
  const m = starter.match(/def (\w+)\(([^)]*)\):/);
  if (!m) return tests;
  const fn = m[1];
  const params = m[2].trim();
  if (!params || params === "self") return tests;

  const extra = [];
  if (starter.includes("check_python_version")) {
    extra.push(` __check("old", not check_python_version(3, 8))`);
  } else if (params.includes("x") || params === "n") {
    extra.push(` __check("edge_zero", ${fn}(0)==0)`);
  }
  if (params.includes("phase") || params.includes("lesson")) {
    return tests;
  }
  if (extra.length === 0) {
    extra.push(` __check("type", callable(${fn}))`);
  }

  if (tests.includes("try:")) {
    return tests.replace(/(\nexcept Exception)/, `${extra.join("")}$1`);
  }
  return tests + extra.join("");
}

function defaultHints(lesson, buildStep) {
  const fn = buildStep.code?.filename?.replace(".py", "") ?? "your function";
  const concept =
    lesson.steps.find((s) => s.id === "concept")?.body?.slice(0, 120) ?? lesson.title;
  return [
    `Re-read the concept: ${concept}…`,
    `Implement \`${fn}\` incrementally — Run after each small change.`,
    `All test names in the output pane must show ✓ before Continue unlocks.`,
  ];
}

function exerciseFor(lesson, buildStep) {
  const deployStep = lesson.steps.find((s) => s.type === "deploy");
  if (deployStep) {
    return {
      plugin: "deploy-postgres",
      runtimeTier: "T2",
      rubric: "T2",
      xpReward: 50,
      hints: [
        "Click Provision in the workspace — this creates a real Postgres row.",
        "Wait for the health check to return ok before continuing.",
        "Your connection string is stored locally for later capstones.",
      ],
    };
  }

  if (T1_WORKSPACE_LESSONS.has(lesson.id)) {
    const checks = countChecks(buildStep.code?.tests ?? "");
    const rubric = checks >= 3 ? "T2" : "T1";
    return {
      plugin: "monaco-ts",
      runtimeTier: "T1",
      rubric,
      xpReward: 40,
      hints: defaultHints(lesson, buildStep),
    };
  }

  const checks = countChecks(buildStep.code?.tests ?? "");
  const rubric = checks >= 3 ? "T2" : checks >= 2 ? "T1" : "T0";
  const phaseId = lesson.phase?.id ?? 0;
  let xpReward = 25;
  if (phaseId === 19) xpReward = 50;
  else if (phaseId >= 14) xpReward = 35;
  else if (rubric === "T1") xpReward = 30;

  return {
    plugin: "pyodide-tests",
    runtimeTier: "T0",
    rubric,
    xpReward,
    hints: defaultHints(lesson, buildStep),
  };
}

async function enrichFile(filePath, { skipExercise = false } = {}) {
  const raw = await fs.readFile(filePath, "utf8");
  const lesson = JSON.parse(raw);
  let changed = false;

  const buildIdx = lesson.steps.findIndex((s) => s.type === "build");
  if (buildIdx >= 0) {
    const build = lesson.steps[buildIdx];
    if (build.code) {
      if (isIdentityStub(build.code.starter, build.code.tests)) {
        const deepened = deepenTests(build.code.starter, build.code.tests);
        if (deepened !== build.code.tests) {
          build.code.tests = deepened;
          changed = true;
        }
      }
      if (!skipExercise && !build.exercise) {
        build.exercise = exerciseFor(lesson, build);
        build.body =
          "Implement the function in the workspace. Use hints if stuck — first-try passes earn bonus XP.";
        changed = true;
      } else if (!skipExercise && T1_WORKSPACE_LESSONS.has(lesson.id) && build.exercise?.plugin !== "monaco-ts") {
        build.exercise = exerciseFor(lesson, build);
        changed = true;
      }
    }
  }

  const deployIdx = lesson.steps.findIndex((s) => s.type === "deploy");
  if (deployIdx >= 0 && !lesson.steps[deployIdx].exercise) {
    lesson.steps[deployIdx].exercise = {
      plugin: "deploy-postgres",
      runtimeTier: "T2",
      rubric: "T2",
      xpReward: 50,
      hints: exerciseFor(lesson, { code: {} }).hints,
    };
    changed = true;
  }

  const concept = lesson.steps.find((s) => s.id === "concept");
  const figureId = FIGURE_CONCEPTS[lesson.id];
  if (concept && figureId) {
    if (concept.gate !== "figure" || concept.figure !== figureId) {
      concept.gate = "figure";
      concept.figure = figureId;
      changed = true;
    }
  }

  if (changed) {
    await fs.writeFile(filePath, JSON.stringify(lesson, null, 2));
  }
  return changed;
}

async function main() {
  const files = await fs.readdir(INTERACTIVE);
  let updated = 0;

  for (const file of files) {
    if (!file.endsWith(".json")) continue;
    const id = file.replace(".json", "");
    const changed = await enrichFile(path.join(INTERACTIVE, file));
    if (changed) updated += 1;
  }

  for (const id of HAND_AUTHORED_IDS) {
    const src = path.join(HAND_AUTHORED, `${id}.json`);
    try {
      const changed = await enrichFile(src, { skipExercise: false });
      if (changed) {
        await fs.copyFile(src, path.join(INTERACTIVE, `${id}.json`));
        updated += 1;
      }
    } catch {
      /* missing */
    }
  }

  console.log(`Enriched ${updated} lesson files with exercise metadata / deeper tests`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
