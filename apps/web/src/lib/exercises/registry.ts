import type { ExerciseEvaluateContext, ExercisePluginDef, ExercisePluginId } from "@/lib/exercises/types";

const pyodideTests: ExercisePluginDef = {
  id: "pyodide-tests",
  label: "Python · Pyodide",
  runtimeTier: "T0",
  defaultRubric: "T1",
  isComplete: (ctx) => ctx.runResult?.allPassed === true,
};

const deployPostgres: ExercisePluginDef = {
  id: "deploy-postgres",
  label: "Deploy · Postgres",
  runtimeTier: "T2",
  defaultRubric: "T2",
  isComplete: (ctx) => ctx.deployReady,
};

const monacoTs: ExercisePluginDef = {
  id: "monaco-ts",
  label: "TypeScript workspace",
  runtimeTier: "T1",
  defaultRubric: "T1",
  isComplete: () => false,
};

const PLUGINS: Record<ExercisePluginId, ExercisePluginDef> = {
  "pyodide-tests": pyodideTests,
  "deploy-postgres": deployPostgres,
  "monaco-ts": monacoTs,
};

export function getExercisePlugin(id: ExercisePluginId | undefined): ExercisePluginDef {
  return PLUGINS[id ?? "pyodide-tests"] ?? pyodideTests;
}

export function isExerciseComplete(ctx: ExerciseEvaluateContext): boolean {
  const plugin = getExercisePlugin(ctx.step.exercise?.plugin);
  return plugin.isComplete(ctx);
}

export function listExercisePlugins(): ExercisePluginDef[] {
  return Object.values(PLUGINS);
}
