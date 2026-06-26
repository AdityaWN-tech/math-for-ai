"use client";

import { useCallback, useState } from "react";
import { CheckCircle2, Database, Loader2, Rocket, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/cn";
import { track } from "@/lib/analytics";

type DeployStage = "idle" | "checking" | "migrating" | "live" | "error";

interface DeployResult {
  ok: boolean;
  url?: string;
  error?: string;
  hint?: string;
  database?: {
    latencyMs: number;
    version?: string;
    table: string;
    rows: number;
  };
}

interface DeployPanelProps {
  onDeployed?: () => void;
}

const STAGES: { id: DeployStage; label: string }[] = [
  { id: "checking", label: "Connect Postgres" },
  { id: "migrating", label: "Migrate schema" },
  { id: "live", label: "Live URL" },
];

export function DeployPanel({ onDeployed }: DeployPanelProps) {
  const [stage, setStage] = useState<DeployStage>("idle");
  const [result, setResult] = useState<DeployResult | null>(null);

  const deploy = useCallback(async () => {
    setStage("checking");
    setResult(null);
    track("deploy_start", { lessonId: "07-docker-for-ai" });

    try {
      setStage("migrating");
      const res = await fetch("/api/deploy/provision", { method: "POST" });
      const data = (await res.json()) as DeployResult & { hint?: string };

      if (!res.ok || !data.ok) {
        setStage("error");
        setResult({ ok: false, error: data.error ?? "Deploy failed", hint: data.hint });
        track("deploy_fail", { error: data.error });
        return;
      }

      setStage("live");
      setResult(data);
      track("deploy_success", { url: data.url, latencyMs: data.database?.latencyMs });
      onDeployed?.();
    } catch (error) {
      setStage("error");
      const message = error instanceof Error ? error.message : String(error);
      setResult({ ok: false, error: message });
      track("deploy_fail", { error: message });
    }
  }, [onDeployed]);

  return (
    <div className="flex h-full flex-col p-4">
      <div className="mb-4 flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-[var(--blueprint)]">
        <Rocket className="h-4 w-4" />
        Deploy workspace
      </div>

      <p className="font-body text-sm leading-relaxed text-[var(--ink-soft)]">
        Provision a real <strong>Postgres + pgvector</strong> database for your learner workspace.
        Run <code className="font-mono text-xs">npm run infra:up</code> once from the project root, then
        deploy.
      </p>

      <ul className="mt-4 space-y-2">
        {STAGES.map((s) => {
          const isDone =
            (stage === "migrating" && s.id === "checking") ||
            (stage === "live" && (s.id === "checking" || s.id === "migrating")) ||
            (stage === "live" && s.id === "live");
          const isActive =
            (stage === "checking" && s.id === "checking") ||
            (stage === "migrating" && s.id === "migrating") ||
            (stage === "live" && s.id === "live");

          return (
            <li
              key={s.id}
              className={cn(
                "flex items-center gap-2 rounded-md border px-3 py-2 font-mono text-xs",
                isDone && "border-[var(--blueprint)] bg-[var(--blueprint-tint)] text-[var(--blueprint)]",
                isActive && !isDone && "border-[var(--warn)] bg-[var(--bg-surface)]",
                !isActive && !isDone && "border-[var(--rule-soft)] text-[var(--ink-mute)]",
              )}
            >
              {isDone ? (
                <CheckCircle2 className="h-4 w-4 shrink-0" />
              ) : isActive ? (
                <Loader2 className="h-4 w-4 shrink-0 animate-spin" />
              ) : (
                <Database className="h-4 w-4 shrink-0 opacity-40" />
              )}
              {s.label}
            </li>
          );
        })}
      </ul>

      {stage === "live" && result?.url && (
        <div className="mt-4 rounded-md border border-[var(--blueprint)] bg-[var(--blueprint-tint)] p-3">
          <p className="font-mono text-[10px] uppercase tracking-widest text-[var(--blueprint)]">
            Live endpoint
          </p>
          <a
            href={result.url}
            target="_blank"
            rel="noreferrer"
            className="mt-1 block break-all font-mono text-sm text-[var(--ink)] underline"
          >
            {result.url}
          </a>
          {result.database && (
            <p className="mt-2 font-mono text-xs text-[var(--ink-soft)]">
              Postgres {result.database.version} · {result.database.latencyMs}ms · table{" "}
              {result.database.table} ({result.database.rows} rows)
            </p>
          )}
        </div>
      )}

      {stage === "error" && result?.error && (
        <div className="mt-4 rounded-md border border-red-300 bg-red-50 p-3 dark:bg-red-950/30">
          <div className="flex items-start gap-2 text-red-700 dark:text-red-300">
            <XCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <div>
              <p className="font-mono text-xs">{result.error}</p>
              {result.hint && (
                <p className="mt-2 font-body text-sm text-[var(--ink-soft)]">{result.hint}</p>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="mt-auto pt-6">
        <Button
          className="w-full"
          onClick={deploy}
          disabled={stage === "checking" || stage === "migrating"}
        >
          {stage === "idle" || stage === "error" ? (
            <>
              <Rocket className="mr-2 h-4 w-4" />
              Deploy to Postgres
            </>
          ) : stage === "live" ? (
            "Redeploy"
          ) : (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Deploying…
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
