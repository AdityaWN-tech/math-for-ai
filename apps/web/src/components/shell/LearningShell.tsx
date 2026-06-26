"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Lightbulb,
  Loader2,
  Play,
  Sparkles,
} from "lucide-react";
import { notifyProgress, ProgressHUD } from "@/components/gamification/ProgressHUD";
import { DeployPanel } from "@/components/shell/DeployPanel";
import { LocalWorkspace } from "@/components/shell/LocalWorkspace";
import { Button } from "@/components/ui/button";
import { track } from "@/lib/analytics";
import { getExercisePlugin } from "@/lib/exercises/registry";
import { getFigureComponent } from "@/lib/figures/registry";
import { XP_FIRST_TRY_BONUS } from "@/lib/gamification";
import { cn } from "@/lib/cn";
import type { Lesson, LessonStep } from "@/lib/lesson-types";
import { nextInteractiveLessonId, phaseLessonIndex } from "@/lib/lessons";
import { claimAllReadyQuests } from "@/lib/quests";
import {
  getLessonCode,
  getResumeStepIndex,
  markLessonComplete,
  markStep,
  recordTestAttempt,
  recordTestPass,
  saveLessonCode,
} from "@/lib/progress";
import { getWorkspaceTemplate, isT1Lesson } from "@/lib/workspace-templates";
import { runPythonWithTests, type RunResult } from "@/lib/pyodide-runner";

const CodeEditor = dynamic(() => import("@/components/shell/CodeEditor"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full min-h-[280px] items-center justify-center font-mono text-sm text-[var(--ink-mute)]">
      Loading editor…
    </div>
  ),
});

interface LearningShellProps {
  lesson: Lesson;
}

export function LearningShell({ lesson }: LearningShellProps) {
  const [stepIndex, setStepIndex] = useState(0);
  const [figureReady, setFigureReady] = useState(false);
  const [deployReady, setDeployReady] = useState(false);
  const [code, setCode] = useState("");
  const [runResult, setRunResult] = useState<RunResult | null>(null);
  const [running, setRunning] = useState(false);
  const [pyodideReady, setPyodideReady] = useState(false);
  const [hintIndex, setHintIndex] = useState(0);
  const [xpToast, setXpToast] = useState<string | null>(null);

  const step = lesson.steps[stepIndex] as LessonStep;
  const total = lesson.steps.length;
  const buildStep = lesson.steps.find((s) => s.type === "build");
  const hasBuild = Boolean(buildStep);
  const hasDeploy = lesson.steps.some((s) => s.type === "deploy");
  const phaseIndex = useMemo(() => phaseLessonIndex(), []);
  const workspaceTemplate = useMemo(() => {
    if (!buildStep?.code) return null;
    return getWorkspaceTemplate(lesson.id, buildStep.code.starter, buildStep.code.filename);
  }, [lesson.id, buildStep]);
  const useT1Workspace = Boolean(buildStep && isT1Lesson(buildStep.exercise) && workspaceTemplate);

  useEffect(() => {
    setFigureReady(false);
    setDeployReady(false);
    setRunResult(null);
    setHintIndex(0);
    const saved = getLessonCode(lesson.id);
    setCode(saved ?? buildStep?.code?.starter ?? "");
    setStepIndex(getResumeStepIndex(lesson.id, lesson.steps));
  }, [lesson.id, lesson.steps, buildStep?.code?.starter]);

  useEffect(() => {
    track("step_view", { lessonId: lesson.id, stepId: step.id, stepIndex });
    markStep(lesson.id, step.id);
    notifyProgress();

    if (step.type === "complete") {
      markLessonComplete(lesson.id, {
        phaseId: lesson.phase.id,
        phaseLessonIds: phaseIndex,
      });
      track("lesson_complete", { lessonId: lesson.id });
      const claims = claimAllReadyQuests();
      if (claims.length > 0) {
        const total = claims.reduce((s, c) => s + c.xp, 0);
        setXpToast(`Quest${claims.length > 1 ? "s" : ""}: +${total} XP (${claims.map((c) => c.title).join(", ")})`);
        setTimeout(() => setXpToast(null), 5000);
      }
      notifyProgress();
    }
  }, [lesson.id, lesson.phase.id, step.id, stepIndex, step.type, phaseIndex]);

  useEffect(() => {
    if (!hasBuild) return;
    import("@/lib/pyodide-runner")
      .then((m) => m.getPyodide())
      .then(() => setPyodideReady(true))
      .catch(() => setPyodideReady(false));
  }, [hasBuild]);

  const exercisePlugin = getExercisePlugin(
    step.exercise?.plugin ?? (step.type === "deploy" ? "deploy-postgres" : "pyodide-tests"),
  );

  const canContinue = useMemo(() => {
    switch (step.gate) {
      case "continue":
        return true;
      case "figure":
        return figureReady;
      case "tests":
        return runResult?.allPassed === true;
      case "deploy":
        return deployReady;
      default:
        return false;
    }
  }, [step.gate, figureReady, runResult?.allPassed, deployReady]);

  const handleCodeChange = useCallback(
    (value: string) => {
      setCode(value);
      saveLessonCode(lesson.id, value);
    },
    [lesson.id],
  );

  const handleRun = useCallback(async () => {
    if (!buildStep?.code) return;

    setRunning(true);
    setRunResult(null);
    recordTestAttempt(lesson.id);
    const result = await runPythonWithTests(code, buildStep.code.tests);
    setRunResult(result);
    setRunning(false);

    if (result.allPassed) {
      track("test_pass", { lessonId: lesson.id, stepId: step.id });
      const { xp, firstTry } = recordTestPass(lesson.id, {
        xpReward: buildStep.exercise?.xpReward,
        rubric: buildStep.exercise?.rubric,
        hasDeploy,
      });
      notifyProgress();
      if (xp > 0) {
        const msg = firstTry ? `+${xp} XP (includes +${XP_FIRST_TRY_BONUS} first-try!)` : `+${xp} XP`;
        setXpToast(msg);
        setTimeout(() => setXpToast(null), 4000);
      }
    }
  }, [buildStep, code, hasDeploy, lesson.id, step.id]);

  const goNext = () => {
    if (!canContinue || stepIndex >= total - 1) return;
    track("step_complete", { lessonId: lesson.id, stepId: step.id });
    const next = lesson.steps[stepIndex + 1];
    setStepIndex((i) => i + 1);
    if (next?.gate === "figure") setFigureReady(false);
    if (next?.gate === "deploy") setDeployReady(false);
    setHintIndex(0);
  };

  const goBack = () => {
    if (stepIndex > 0) setStepIndex((i) => i - 1);
  };

  const figureId = step.type === "concept" ? step.figure : undefined;
  const FigureComponent = figureId ? getFigureComponent(figureId) : null;
  const hints = buildStep?.exercise?.hints ?? [];
  const nextLessonId = nextInteractiveLessonId(lesson.id);

  return (
    <div className="flex min-h-screen flex-col bg-[var(--bg)] text-[var(--ink)]">
      <header className="sticky top-0 z-20 border-b border-[var(--rule-soft)] bg-[var(--header-bg)] backdrop-blur-sm">
        <div className="mx-auto flex h-14 max-w-[1600px] items-center justify-between gap-4 px-4">
          <div className="min-w-0">
            <Link href="/lessons" className="font-display text-lg leading-none tracking-wide text-[var(--blueprint)]">
              Math for AI
            </Link>
            <p className="truncate font-mono text-[10px] uppercase tracking-widest text-[var(--ink-mute)]">
              Phase {String(lesson.phase.id).padStart(2, "0")} · {lesson.title} · {step.beat}
            </p>
          </div>
          <div className="flex items-center gap-1">
            {lesson.steps.map((s, i) => (
              <span
                key={s.id}
                className={cn(
                  "h-2 w-2 border",
                  i < stepIndex && "border-[var(--blueprint)] bg-[var(--blueprint)]",
                  i === stepIndex && "border-[var(--blueprint)] bg-[var(--blueprint-tint-strong)]",
                  i > stepIndex && "border-[var(--ink-mute)] bg-transparent",
                )}
                title={s.beat}
              />
            ))}
          </div>
          <div className="flex items-center gap-3">
            <ProgressHUD />
            <span className="hidden font-mono text-xs text-[var(--ink-mute)] sm:block">
              {stepIndex + 1}/{total}
            </span>
          </div>
        </div>
        {xpToast && (
          <div className="border-t border-[var(--blueprint)] bg-[var(--blueprint-tint)] px-4 py-1 text-center font-mono text-xs text-[var(--blueprint)]">
            {xpToast}
          </div>
        )}
      </header>

      <main className="mx-auto grid w-full max-w-[1600px] flex-1 grid-cols-1 lg:grid-cols-[minmax(220px,1fr)_minmax(0,2fr)_minmax(260px,1fr)]">
        <section className="border-b border-[var(--rule-soft)] p-4 lg:border-b-0 lg:border-r">
          <p className="mb-2 font-mono text-[10px] uppercase tracking-widest text-[var(--blueprint)]">
            {step.beat}
          </p>
          <h1 className="font-body text-xl font-semibold leading-snug">{step.title}</h1>

          {step.type === "motto" && (
            <blockquote className="mt-6 border-l-2 border-[var(--blueprint)] pl-4 font-body text-2xl italic leading-relaxed text-[var(--ink-soft)]">
              {step.body}
            </blockquote>
          )}

          {step.type === "problem" && step.cards && (
            <div className="mt-4 space-y-3">
              {step.cards.map((card) => (
                <p
                  key={card.slice(0, 32)}
                  className="rounded-md border border-[var(--rule-soft)] bg-[var(--bg-surface)] p-3 font-body text-sm leading-relaxed text-[var(--ink-soft)]"
                >
                  {card}
                </p>
              ))}
            </div>
          )}

          {(step.type === "concept" || step.type === "content" || step.type === "deploy" || step.type === "build") &&
            step.body && (
              <p className="mt-4 font-body text-sm leading-relaxed text-[var(--ink-soft)]">{step.body}</p>
            )}

          {step.type === "build" && step.exercise && (
            <div className="mt-4 flex flex-wrap gap-2 font-mono text-[10px] uppercase tracking-widest">
              <span className="rounded border border-[var(--rule-soft)] px-2 py-0.5">
                {exercisePlugin.label}
              </span>
              <span className="rounded border border-[var(--rule-soft)] px-2 py-0.5">
                Rubric {step.exercise.rubric}
              </span>
              {step.exercise.xpReward && (
                <span className="rounded border border-[var(--blueprint)] bg-[var(--blueprint-tint)] px-2 py-0.5 text-[var(--blueprint)]">
                  +{step.exercise.xpReward} XP
                </span>
              )}
            </div>
          )}

          {step.type === "build" && hints.length > 0 && (
            <div className="mt-4 rounded-md border border-[var(--rule-soft)] bg-[var(--bg-surface)] p-3">
              <div className="mb-2 flex items-center justify-between">
                <span className="flex items-center gap-1 font-mono text-[10px] uppercase tracking-widest text-[var(--ink-mute)]">
                  <Lightbulb className="h-3.5 w-3.5" />
                  Hints ({hintIndex}/{hints.length})
                </span>
                {hintIndex < hints.length && (
                  <Button variant="ghost" size="sm" onClick={() => setHintIndex((i) => i + 1)}>
                    Reveal hint
                  </Button>
                )}
              </div>
              {hintIndex > 0 && (
                <p className="font-body text-sm text-[var(--ink-soft)]">{hints[hintIndex - 1]}</p>
              )}
              {hintIndex === 0 && (
                <p className="font-body text-xs text-[var(--ink-mute)]">
                  Stuck? Reveal hints one at a time — first-try XP bonus still counts.
                </p>
              )}
            </div>
          )}

          {step.type === "ship" && step.artifact && (
            <div className="mt-4 rounded-md border border-[var(--blueprint)] bg-[var(--blueprint-tint)] p-4">
              <div className="mb-2 flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-[var(--blueprint)]">
                <Sparkles className="h-4 w-4" />
                Artifact
              </div>
              <p className="font-body font-semibold">{step.artifact.name}</p>
              <p className="mt-2 font-body text-sm text-[var(--ink-soft)]">{step.artifact.description}</p>
            </div>
          )}

          {step.type === "complete" && (
            <div className="mt-6 space-y-3">
              <p className="font-body text-lg text-[var(--ink-soft)]">
                You finished <strong className="text-[var(--ink)]">{lesson.title}</strong>.
                {lesson.compileMeta?.interactive === false
                  ? " Preview complete — full build + deploy ships next."
                  : " The thread continues — build, deploy, ship SaaS."}
              </p>
              <div className="flex flex-wrap gap-2">
                <Link href="/lessons">
                  <Button variant="secondary" size="sm">
                    Lesson catalog
                  </Button>
                </Link>
                {nextLessonId && (
                  <Link href={`/demo/${nextLessonId}`}>
                    <Button size="sm">Next lesson →</Button>
                  </Link>
                )}
              </div>
            </div>
          )}
        </section>

        <section className="flex min-h-[320px] flex-col border-b border-[var(--rule-soft)] lg:border-b-0 lg:border-r">
          {FigureComponent && (
            <div className="flex-1 p-4">
              <FigureComponent onInteract={() => setFigureReady(true)} />
            </div>
          )}

          {step.type === "build" && (
            <div className="flex min-h-[400px] flex-1 flex-col">
              {useT1Workspace && workspaceTemplate ? (
                <LocalWorkspace
                  lessonId={lesson.id}
                  template={workspaceTemplate}
                  onPrimaryChange={handleCodeChange}
                />
              ) : (
                <>
                  <div className="flex items-center justify-between border-b border-[var(--rule-soft)] px-3 py-2 font-mono text-xs text-[var(--ink-mute)]">
                    <span>{step.code?.filename}</span>
                    <span>{pyodideReady ? `${exercisePlugin.label} ready` : "Loading runtime…"}</span>
                  </div>
                  <div className="min-h-0 flex-1">
                    <CodeEditor
                      value={code}
                      onChange={handleCodeChange}
                      filename={step.code?.filename ?? "main.py"}
                    />
                  </div>
                </>
              )}
            </div>
          )}

          {step.type === "deploy" && (
            <div className="min-h-[400px] flex-1">
              <DeployPanel onDeployed={() => setDeployReady(true)} />
            </div>
          )}

          {!FigureComponent && step.type !== "build" && step.type !== "deploy" && (
            <div className="flex flex-1 flex-col items-center justify-center p-8 text-center">
              <p className="font-display text-4xl text-[var(--blueprint)] opacity-30">◇</p>
              <p className="mt-3 max-w-xs font-body text-sm text-[var(--ink-mute)]">
                {step.type === "complete"
                  ? "Your workspace grows with every lesson — code, database, deploy."
                  : step.type === "content"
                    ? "Read the narrative, then continue."
                    : "Read the narrative, then continue when ready."}
              </p>
            </div>
          )}
        </section>

        <section className="flex flex-col p-4">
          <p className="mb-2 font-mono text-[10px] uppercase tracking-widest text-[var(--ink-mute)]">
            Output
          </p>

          {step.type === "build" ? (
            <div className="flex min-h-[200px] flex-1 flex-col rounded-md border border-[var(--rule-soft)] bg-[var(--code-bg)]">
              <pre className="flex-1 overflow-auto p-3 font-mono text-xs leading-relaxed text-[var(--ink)]">
                {running && "Running tests…\n"}
                {!running && runResult?.error && `Error: ${runResult.error}\n`}
                {!running && runResult?.stdout}
                {!running && !runResult && "# Click Run to execute your code and run tests"}
              </pre>
              {runResult && (
                <ul className="border-t border-[var(--rule-soft)] p-2">
                  {runResult.tests.map((t) => (
                    <li
                      key={t.name}
                      className={cn(
                        "font-mono text-xs",
                        t.pass ? "text-[var(--blueprint)]" : "text-red-600",
                      )}
                    >
                      {t.pass ? "✓" : "✗"} {t.name}
                      {t.msg ? ` — ${t.msg}` : ""}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ) : step.type === "deploy" ? (
            <div className="flex flex-1 flex-col rounded-md border border-[var(--rule-soft)] bg-[var(--code-bg)] p-3 font-mono text-xs text-[var(--ink-soft)]">
              <p># Deploy output · Tier T2</p>
              <p className="mt-2 text-[var(--ink-mute)]">
                Health check: <span className="text-[var(--blueprint)]">GET /api/health/db</span>
              </p>
              <p className="mt-2 text-[var(--ink-mute)]">
                After deploy succeeds, your workspace row is stored in{" "}
                <code className="text-[var(--ink)]">learner_workspace</code>.
              </p>
            </div>
          ) : (
            <div className="rounded-md border border-dashed border-[var(--rule-soft)] p-4 font-mono text-xs text-[var(--ink-mute)]">
              {step.type === "concept" && figureId
                ? "Interact with the figure, then continue."
                : "Tests and deploy output appear here during build/deploy steps."}
            </div>
          )}
        </section>
      </main>

      <footer className="sticky bottom-0 border-t border-[var(--rule-soft)] bg-[var(--header-bg)] backdrop-blur-sm">
        <div className="mx-auto flex h-16 max-w-[1600px] items-center justify-between gap-3 px-4">
          <Button variant="ghost" size="sm" onClick={goBack} disabled={stepIndex === 0}>
            <ChevronLeft className="mr-1 h-4 w-4" />
            Back
          </Button>

          <div className="flex items-center gap-2">
            {step.type === "build" && (
              <Button variant="secondary" size="sm" onClick={handleRun} disabled={running || !pyodideReady}>
                {running ? (
                  <Loader2 className="mr-1 h-4 w-4 animate-spin" />
                ) : (
                  <Play className="mr-1 h-4 w-4" />
                )}
                Run
              </Button>
            )}
            {step.type === "deploy" && (
              <span className="hidden font-mono text-[10px] uppercase tracking-widest text-[var(--ink-mute)] sm:inline">
                Deploy in workspace pane →
              </span>
            )}
            <Button
              size="sm"
              onClick={goNext}
              disabled={!canContinue || stepIndex >= total - 1}
              title={!canContinue ? "Complete this step first" : undefined}
            >
              Continue
              <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
          </div>
        </div>
      </footer>
    </div>
  );
}
