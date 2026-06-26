#!/usr/bin/env node
/**
 * Compile lesson manifests from ai-engineering-from-scratch (GitHub raw).
 * Usage: node scripts/compile-lessons.mjs [--phase=all|0|1|...]
 */
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");
const OUT_DIR = path.join(ROOT, "apps/web/src/content/lessons/compiled");
const CATALOG_PATH = path.join(ROOT, "apps/web/src/content/lessons/catalog.json");

const MANIFEST_PATH = path.join(ROOT, "apps/web/src/content/lessons/interactive-manifest.json");

const REPO = "rohitg00/ai-engineering-from-scratch";
const BRANCH = "main";
const RAW = `https://raw.githubusercontent.com/${REPO}/${BRANCH}`;

/** Loaded from interactive-manifest.json (see build-interactive-lessons.mjs) */
let INTERACTIVE_LESSONS_META = [];
let INTERACTIVE_IDS = new Set();

async function loadInteractiveManifest() {
  try {
    const raw = await fs.readFile(MANIFEST_PATH, "utf8");
    const data = JSON.parse(raw);
    INTERACTIVE_LESSONS_META = data.lessons ?? [];
    INTERACTIVE_IDS = new Set(INTERACTIVE_LESSONS_META.map((l) => l.id));
  } catch {
    console.warn("No interactive-manifest.json — run node scripts/build-interactive-lessons.mjs first");
  }
}

const PHASE_META = {
  0: { dir: "00-setup-and-tooling", name: "Setup & Tooling" },
  1: { dir: "01-math-foundations", name: "Math Foundations" },
  2: { dir: "02-ml-fundamentals", name: "ML Fundamentals" },
  3: { dir: "03-deep-learning-core", name: "Deep Learning Core" },
  4: { dir: "04-computer-vision", name: "Computer Vision" },
  5: { dir: "05-nlp-foundations-to-advanced", name: "NLP Foundations to Advanced" },
  6: { dir: "06-speech-and-audio", name: "Speech & Audio" },
  7: { dir: "07-transformers-deep-dive", name: "Transformers Deep Dive" },
  8: { dir: "08-generative-ai", name: "Generative AI" },
  9: { dir: "09-reinforcement-learning", name: "Reinforcement Learning" },
  10: { dir: "10-llms-from-scratch", name: "LLMs from Scratch" },
  11: { dir: "11-llm-engineering", name: "LLM Engineering" },
  12: { dir: "12-multimodal-ai", name: "Multimodal AI" },
  13: { dir: "13-tools-and-protocols", name: "Tools & Protocols" },
  14: { dir: "14-agent-engineering", name: "Agent Engineering" },
  15: { dir: "15-autonomous-systems", name: "Autonomous Systems" },
  16: { dir: "16-multi-agent-and-swarms", name: "Multi-Agent & Swarms" },
  17: { dir: "17-infrastructure-and-production", name: "Infrastructure & Production" },
  18: { dir: "18-ethics-safety-alignment", name: "Ethics, Safety & Alignment" },
  19: { dir: "19-capstone-projects", name: "Capstone Projects" },
};

const phaseArg = process.argv.find((a) => a.startsWith("--phase="));
const phaseValue = phaseArg ? phaseArg.split("=")[1] : "all";
const PHASES_TO_COMPILE =
  phaseValue === "all"
    ? Object.keys(PHASE_META).map(Number)
    : [Number(phaseValue)].filter((n) => !Number.isNaN(n) && PHASE_META[n]);

async function fetchText(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${res.status} ${url}`);
  return res.text();
}

function slugToTitle(slug) {
  return slug
    .replace(/^\d+-/, "")
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

function parseEnMd(md, meta) {
  const mottoMatch = md.match(/^>\s*(.+)$/m);
  const motto = mottoMatch?.[1]?.trim() ?? meta.title;

  const problemSection = md.split("## The Problem")[1]?.split("##")[0] ?? "";
  const problemParas = problemSection
    .split(/\n\n+/)
    .map((p) => p.trim())
    .filter((p) => p && !p.startsWith("```") && !p.startsWith("|"));

  const conceptSection = md.split("## The Concept")[1]?.split("##")[0] ?? "";
  const conceptBody = conceptSection
    .split(/\n\n+/)
    .map((p) => p.trim())
    .find((p) => p && !p.startsWith("```") && !p.startsWith("|") && !p.startsWith("#"));

  const steps = [
    {
      id: "motto",
      beat: "MOTTO",
      type: "motto",
      gate: "continue",
      title: "Core idea",
      body: motto,
    },
  ];

  if (problemParas.length) {
    steps.push({
      id: "problem",
      beat: "PROBLEM",
      type: "problem",
      gate: "continue",
      title: "The problem",
      cards: problemParas.slice(0, 3),
    });
  }

  if (conceptBody) {
    steps.push({
      id: "concept",
      beat: "CONCEPT",
      type: "content",
      gate: "continue",
      title: "The concept",
      body: conceptBody.slice(0, 1200),
    });
  }

  steps.push({
    id: "complete",
    beat: "COMPLETE",
    type: "complete",
    gate: "continue",
    title: "Lesson overview complete",
    body: "Full interactive build + deploy steps ship in the platform soon. Continue the path from the catalog.",
  });

  return { motto, steps };
}

async function listLessonDirs(phaseKey) {
  const api = `https://api.github.com/repos/${REPO}/contents/phases/${phaseKey}`;
  const res = await fetch(api, {
    headers: { Accept: "application/vnd.github+json", "User-Agent": "math-for-ai-compiler" },
  });
  if (!res.ok) throw new Error(`GitHub API ${res.status} for ${phaseKey}`);
  const items = await res.json();
  return items
    .filter((i) => i.type === "dir")
    .map((i) => i.name)
    .sort();
}

async function compilePhase(phaseNum) {
  const meta = PHASE_META[phaseNum];
  if (!meta) throw new Error(`Unknown phase ${phaseNum}`);

  const { dir: phaseKey, name: phaseName } = meta;
  const dirs = await listLessonDirs(phaseKey);
  await fs.mkdir(OUT_DIR, { recursive: true });

  const catalogEntries = [];

  for (const dir of dirs) {
    const id = dir;
    const lessonNumber = Number(dir.match(/^(\d+)/)?.[1] ?? 0);
    const title = slugToTitle(dir);

    if (INTERACTIVE_IDS.has(id)) {
      const hand = INTERACTIVE_LESSONS_META.find((l) => l.id === id);
      catalogEntries.push({
        id,
        title: hand?.title ?? title,
        phaseId: phaseNum,
        phaseName,
        lessonNumber,
        interactive: true,
        path: `/demo/${id}`,
      });
      continue;
    }

    const enUrl = `${RAW}/phases/${phaseKey}/${dir}/docs/en.md`;
    let md;
    try {
      md = await fetchText(enUrl);
    } catch {
      console.warn(`skip ${id} — no en.md`);
      continue;
    }

    const { motto, steps } = parseEnMd(md, { title });
    const lesson = {
      id,
      title,
      motto,
      phase: { id: phaseNum, name: phaseName, lessonNumber },
      steps,
      compileMeta: { sourcePath: `phases/${phaseKey}/${dir}`, interactive: false },
    };

    await fs.writeFile(path.join(OUT_DIR, `${id}.json`), JSON.stringify(lesson, null, 2));
    catalogEntries.push({
      id,
      title,
      phaseId: phaseNum,
      phaseName,
      lessonNumber,
      interactive: false,
      path: `/demo/${id}`,
    });
    console.log(`compiled ${id}`);
  }

  return catalogEntries;
}

async function main() {
  await loadInteractiveManifest();
  const entries = [];

  for (const phaseNum of PHASES_TO_COMPILE) {
    console.log(`\n— Phase ${phaseNum}: ${PHASE_META[phaseNum].name} —`);
    entries.push(...(await compilePhase(phaseNum)));
  }

  const interactiveCatalog = INTERACTIVE_LESSONS_META.map((l) => ({
    id: l.id,
    title: l.title,
    phaseId: l.phaseId,
    phaseName: l.phaseName ?? PHASE_META[l.phaseId]?.name ?? `Phase ${l.phaseId}`,
    lessonNumber: l.lessonNumber,
    interactive: true,
    path: l.path ?? `/demo/${l.id}`,
  }));

  const byId = new Map();
  for (const e of [...interactiveCatalog, ...entries]) {
    byId.set(e.id, e);
  }

  const lessons = [...byId.values()].sort((a, b) =>
    a.phaseId === b.phaseId ? a.lessonNumber - b.lessonNumber : a.phaseId - b.phaseId,
  );

  const catalog = {
    generatedAt: new Date().toISOString(),
    phases: PHASES_TO_COMPILE.sort((a, b) => a - b),
    lessonCount: lessons.length,
    interactiveCount: lessons.filter((l) => l.interactive).length,
    lessons,
  };

  await fs.writeFile(CATALOG_PATH, JSON.stringify(catalog, null, 2));
  console.log(`\nCatalog: ${catalog.lessonCount} lessons (${catalog.interactiveCount} interactive) → ${CATALOG_PATH}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
