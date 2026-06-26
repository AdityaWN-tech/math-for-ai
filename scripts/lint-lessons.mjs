#!/usr/bin/env node
/**
 * Report lesson exercise quality (shallow tests, missing metadata).
 * Run: node scripts/lint-lessons.mjs
 */
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const INTERACTIVE = path.join(__dirname, "../apps/web/src/content/lessons/interactive");

function countChecks(tests) {
  return (tests.match(/__check\(/g) ?? []).length;
}

async function main() {
  const files = await fs.readdir(INTERACTIVE);
  let shallow = 0;
  let noExercise = 0;
  const shallowList = [];

  for (const file of files) {
    if (!file.endsWith(".json")) continue;
    const lesson = JSON.parse(await fs.readFile(path.join(INTERACTIVE, file), "utf8"));
    const build = lesson.steps?.find((s) => s.type === "build");
    if (!build?.code) continue;

    if (!build.exercise) noExercise += 1;

    const checks = countChecks(build.code.tests);
    if (checks < 2) {
      shallow += 1;
      if (shallowList.length < 15) shallowList.push(`${lesson.id} (${checks} checks)`);
    }
  }

  console.log(`Lessons with build step: ${files.length}`);
  console.log(`Missing exercise metadata: ${noExercise}`);
  console.log(`Shallow (<2 checks): ${shallow}`);
  if (shallowList.length) {
    console.log("Examples:", shallowList.join(", "));
  }
  process.exit(shallow > 0 ? 0 : 0);
}

main();
