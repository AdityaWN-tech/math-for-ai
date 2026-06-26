"use client";

import { useCallback, useState } from "react";
import { cn } from "@/lib/cn";

interface AgentLoopFigureProps {
  onInteract?: () => void;
}

const STEPS = [
  { id: "observe", label: "Observe", desc: "Read state, tool results, user message" },
  { id: "think", label: "Think", desc: "Reasoning tokens plan the next move" },
  { id: "act", label: "Act", desc: "Call a tool or emit final answer" },
] as const;

export function AgentLoopFigure({ onInteract }: AgentLoopFigureProps) {
  const [active, setActive] = useState(0);
  const [touched, setTouched] = useState(false);

  const notify = useCallback(() => {
    if (!touched) {
      setTouched(true);
      onInteract?.();
    }
  }, [onInteract, touched]);

  const advance = () => {
    setActive((i) => (i + 1) % STEPS.length);
    notify();
  };

  return (
    <div className="rounded-md border border-[var(--rule-soft)] bg-[var(--bg-surface)] p-4">
      <div className="mb-3 font-mono text-[10px] uppercase tracking-widest text-[var(--ink-mute)]">
        ReAct agent loop
      </div>

      <div className="flex flex-col items-center gap-2 sm:flex-row sm:justify-center">
        {STEPS.map((step, i) => (
          <div key={step.id} className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                setActive(i);
                notify();
              }}
              className={cn(
                "rounded-md border px-4 py-3 text-left transition-colors",
                i === active
                  ? "border-[var(--blueprint)] bg-[var(--blueprint-tint)]"
                  : "border-[var(--rule-soft)] hover:border-[var(--blueprint)]",
              )}
            >
              <p className="font-mono text-xs uppercase tracking-widest text-[var(--blueprint)]">
                {step.label}
              </p>
              <p className="mt-1 max-w-[140px] font-body text-xs text-[var(--ink-soft)]">{step.desc}</p>
            </button>
            {i < STEPS.length - 1 && (
              <span className="hidden text-[var(--blueprint)] sm:inline">→</span>
            )}
          </div>
        ))}
      </div>

      <div className="mt-4 flex justify-center">
        <button
          type="button"
          onClick={advance}
          className="rounded border border-[var(--blueprint)] px-3 py-1 font-mono text-xs text-[var(--blueprint)] hover:bg-[var(--blueprint-tint)]"
        >
          Step loop →
        </button>
      </div>

      <p className="mt-3 text-center font-mono text-xs text-[var(--ink-mute)]">
        Repeat until stop condition · every framework is scaffolding on this cycle
      </p>
    </div>
  );
}
