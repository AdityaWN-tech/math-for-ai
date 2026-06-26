export type StepGate = "continue" | "figure" | "tests" | "deploy";

export type StepType =
  | "motto"
  | "problem"
  | "concept"
  | "build"
  | "deploy"
  | "ship"
  | "complete"
  | "content";

export type RuntimeTier = "T0" | "T1" | "T2";
export type RubricTier = "T0" | "T1" | "T2";
export type ExercisePluginId = "pyodide-tests" | "deploy-postgres" | "monaco-ts";

export interface ExerciseMeta {
  plugin: ExercisePluginId;
  runtimeTier: RuntimeTier;
  rubric: RubricTier;
  xpReward?: number;
  hints?: string[];
}

export interface LessonStep {
  id: string;
  beat: string;
  type: StepType;
  gate: StepGate;
  title: string;
  body?: string;
  cards?: string[];
  figure?: "vector-projection" | "matrix-multiply" | "matrix-transform";
  artifact?: {
    name: string;
    description: string;
  };
  exercise?: ExerciseMeta;
  code?: {
    language: string;
    filename: string;
    starter: string;
    tests: string;
  };
  compileMeta?: {
    sourcePath?: string;
    hasCode?: boolean;
    interactive?: boolean;
  };
}

export interface Lesson {
  id: string;
  title: string;
  motto: string;
  phase: { id: number; name: string; lessonNumber: number };
  steps: LessonStep[];
  compileMeta?: {
    sourcePath?: string;
    interactive?: boolean;
  };
}

export interface LessonCatalogEntry {
  id: string;
  title: string;
  phaseId: number;
  phaseName: string;
  lessonNumber: number;
  interactive: boolean;
  path: string;
}

export interface LessonCatalog {
  generatedAt: string;
  phases?: number[];
  lessonCount?: number;
  interactiveCount?: number;
  lessons: LessonCatalogEntry[];
}
