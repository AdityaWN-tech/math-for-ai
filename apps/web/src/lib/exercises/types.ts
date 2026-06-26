import type { RunResult } from "@/lib/pyodide-runner";
import type { LessonStep } from "@/lib/lesson-types";

export type ExercisePluginId = "pyodide-tests" | "deploy-postgres" | "monaco-ts";

export interface ExerciseEvaluateContext {
  lessonId: string;
  step: LessonStep;
  code: string;
  runResult: RunResult | null;
  deployReady: boolean;
}

export interface ExercisePluginDef {
  id: ExercisePluginId;
  label: string;
  runtimeTier: "T0" | "T1" | "T2";
  defaultRubric: "T0" | "T1" | "T2";
  /** Whether the step gate can be satisfied */
  isComplete(ctx: ExerciseEvaluateContext): boolean;
}
