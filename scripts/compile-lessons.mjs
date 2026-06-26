#!/usr/bin/env node
/**
 * Compile lesson manifests from ai-engineering-from-scratch (GitHub raw).
 * Usage: node scripts/compile-lessons.mjs [--phase=1]
 */
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");
const OUT_DIR = path.join(ROOT, "apps/web/src/content/lessons/compiled");
const CATALOG_PATH = path.join(ROOT, "apps/web/src/content/lessons/catalog.json");

const REPO = "rohitg00/ai-engineering-from-scratch";
const BRANCH = "main";
const RAW = `https://raw.githubusercontent.com/${REPO}/${BRANCH}`;

const INTERACTIVE_IDS = new Set([
  "01-linear-algebra-intuition",
  "02-vectors-matrices-operations",
  "07-docker-for-ai",
]);

const phaseArg = process.argv.find((a) => a.startsWith("--phase="));
const phaseValue = phaseArg ? phaseArg.split("=")[1] : "1";
const PHASES_TO_COMPILE =
  phaseValue === "all" ? [0, 1] : [Number(phaseValue)].filter((n) => !Number.isNaN(n));

const PHASE_DIRS = {
  0: "00-setup-and-tooling",
  1: "01-math-foundations",
};

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
  const phaseKey = PHASE_DIRS[phaseNum];
  if (!phaseKey) throw new Error(`Unknown phase ${phaseNum}`);

  const phaseName =
    phaseNum === 0 ? "Setup & Tooling" : phaseNum === 1 ? "Math Foundations" : `Phase ${phaseNum}`;

  const dirs = await listLessonDirs(phaseKey);
  await fs.mkdir(OUT_DIR, { recursive: true });

  const catalogEntries = [];

  for (const dir of dirs) {
    const id = dir;
    const lessonNumber = Number(dir.match(/^(\d+)/)?.[1] ?? 0);
    const title = slugToTitle(dir);

    if (INTERACTIVE_IDS.has(id)) {
      const titles = {
        "01-linear-algebra-intuition": "Linear Algebra Intuition",
        "02-vectors-matrices-operations": "Vectors, Matrices & Operations",
        "07-docker-for-ai": "Docker for AI",
      };
      catalogEntries.push({
        id,
        title: titles[id] ?? slugToTitle(id),
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
  const entries = [];

  for (const phaseNum of PHASES_TO_COMPILE) {
    entries.push(...(await compilePhase(phaseNum)));
  }

  const interactive = [
    {
      id: "01-linear-algebra-intuition",
      title: "Linear Algebra Intuition",
      phaseId: 1,
      phaseName: "Math Foundations",
      lessonNumber: 1,
      interactive: true,
      path: "/demo/01-linear-algebra-intuition",
    },
    {
      id: "02-vectors-matrices-operations",
      title: "Vectors, Matrices & Operations",
      phaseId: 1,
      phaseName: "Math Foundations",
      lessonNumber: 2,
      interactive: true,
      path: "/demo/02-vectors-matrices-operations",
    },
    {
      id: "07-docker-for-ai",
      title: "Docker for AI",
      phaseId: 0,
      phaseName: "Setup & Tooling",
      lessonNumber: 7,
      interactive: true,
      path: "/demo/07-docker-for-ai",
    },
  ];

  const byId = new Map();
  for (const e of [...interactive, ...entries]) {
    byId.set(e.id, e);
  }

  const catalog = {
    generatedAt: new Date().toISOString(),
    phases: [0, 1],
    lessons: [...byId.values()].sort((a, b) =>
      a.phaseId === b.phaseId ? a.lessonNumber - b.lessonNumber : a.phaseId - b.phaseId,
    ),
  };

  await fs.writeFile(CATALOG_PATH, JSON.stringify(catalog, null, 2));
  console.log(`\nCatalog: ${catalog.lessons.length} lessons → ${CATALOG_PATH}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
