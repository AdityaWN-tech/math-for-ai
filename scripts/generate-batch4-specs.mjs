#!/usr/bin/env node
/**
 * Generate interactive-specs-batch4.mjs for all catalog lessons not in batches 1–3.
 * Run: node scripts/generate-batch4-specs.mjs
 */
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import BATCH2 from "./interactive-specs-batch2.mjs";
import BATCH3 from "./interactive-specs-batch3.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");
const CATALOG = path.join(ROOT, "apps/web/src/content/lessons/catalog.json");
const OUT = path.join(__dirname, "interactive-specs-batch4.mjs");
const BUILD = path.join(__dirname, "build-interactive-lessons.mjs");

function escapeJs(s) {
  return s.replace(/\\/g, "\\\\").replace(/'/g, "\\'");
}

function makeSpec(lesson) {
  const { id, phaseId, lessonNumber, title } = lesson;
  const base =
    id
      .replace(/^\d+-/, "")
      .replace(/[^a-z0-9]+/gi, "_")
      .slice(0, 28) || "lesson";
  const filename = `${base}.py`;
  const concept = `Core ideas for ${title}: read the narrative, then implement the checkpoint function to lock in the concept.`;
  const starter = `def lesson_checkpoint(phase_id, lesson_no):\n    \"\"\"Return a deterministic fingerprint for this lesson (phase * 1000 + lesson).\"\"\"\n  # TODO: replace with lesson-specific logic\n    return phase_id * 1000 + lesson_no\n`;
  const testBody = ` __check("checkpoint", lesson_checkpoint(${phaseId}, ${lessonNumber})==${phaseId * 1000 + lessonNumber})`;
  const artName = title.length > 48 ? `${title.slice(0, 45)}…` : title;
  const artDesc = `Completed interactive checkpoint for ${title}.`;

  return `  S("${id}", ${phaseId}, ${lessonNumber}, "${escapeJs(title)}", "${escapeJs(concept)}", "${filename}", ${JSON.stringify(starter)}, '${testBody}', "${escapeJs(artName)}", "${escapeJs(artDesc)}")`;
}

async function loadBatch1Ids() {
  const src = await fs.readFile(BUILD, "utf8");
  const ids = new Set();
  for (const m of src.matchAll(/id:\s*"([^"]+)"/g)) {
    if (m[1].includes("-")) ids.add(m[1]);
  }
  return ids;
}

async function main() {
  const catalog = JSON.parse(await fs.readFile(CATALOG, "utf8"));
  const known = new Set([
    ...(await loadBatch1Ids()),
    ...BATCH2.map((s) => s.id),
    ...BATCH3.map((s) => s.id),
  ]);

  const missing = catalog.lessons.filter((l) => !known.has(l.id));
  const lines = missing.map(makeSpec);

  const body = `/** Batch 4 — auto-generated specs for remaining ${missing.length} catalog lessons */
const C = \`def __check(n,ok,m=""):\\n __results.append({"name":n,"pass":bool(ok),"msg":m})\\n\`;

function S(id, phaseId, ln, title, concept, filename, starter, testBody, artName, artDesc) {
  return {
    id,
    phaseId,
    lessonNumber: ln,
    title,
    concept,
    build: {
      filename,
      starter,
      tests: \`\${C}try:\\n\${testBody}\\nexcept Exception as e:\\n __check("runtime",False,str(e))\`,
    },
    artifact: { name: artName, description: artDesc },
  };
}

export default [
${lines.join(",\n")},
];
`;

  await fs.writeFile(OUT, body);
  console.log(`Wrote ${OUT} with ${missing.length} specs`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
