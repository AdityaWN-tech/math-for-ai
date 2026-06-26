"use client";

import { useCallback, useMemo, useState } from "react";
import { cn } from "@/lib/cn";

interface AttentionFigureProps {
  onInteract?: () => void;
}

const TOKENS = ["The", "cat", "sat", "on", "mat"];

export function AttentionFigure({ onInteract }: AttentionFigureProps) {
  const [queryIdx, setQueryIdx] = useState(2);
  const [touched, setTouched] = useState(false);

  const notify = useCallback(() => {
    if (!touched) {
      setTouched(true);
      onInteract?.();
    }
  }, [onInteract, touched]);

  const weights = useMemo(() => {
    const d = 4;
    const scores = TOKENS.map((_, j) => {
      const dist = Math.abs(queryIdx - j);
      const raw = 3 - dist * 0.9 + (j === queryIdx ? 1.2 : 0);
      return raw / Math.sqrt(d);
    });
    const max = Math.max(...scores);
    const exps = scores.map((s) => Math.exp(s - max));
    const sum = exps.reduce((a, b) => a + b, 0);
    return exps.map((e) => e / sum);
  }, [queryIdx]);

  return (
    <div className="rounded-md border border-[var(--rule-soft)] bg-[var(--bg-surface)] p-4">
      <div className="mb-3 flex items-center justify-between font-mono text-[10px] uppercase tracking-widest text-[var(--ink-mute)]">
        <span>Scaled dot-product attention</span>
        <span>Pick query token</span>
      </div>

      <p className="mb-2 font-body text-sm text-[var(--ink-soft)]">
        Each row asks: &quot;who matters to me?&quot; Softmax turns scores into weights that sum to 1.
      </p>

      <div className="flex flex-wrap gap-2">
        {TOKENS.map((tok, i) => (
          <button
            key={tok}
            type="button"
            onClick={() => {
              setQueryIdx(i);
              notify();
            }}
            className={cn(
              "rounded border px-2 py-1 font-mono text-sm transition-colors",
              i === queryIdx
                ? "border-[var(--blueprint)] bg-[var(--blueprint-tint)] text-[var(--blueprint)]"
                : "border-[var(--rule-soft)] hover:border-[var(--blueprint)]",
            )}
          >
            {tok}
          </button>
        ))}
      </div>

      <div className="mt-4 overflow-x-auto">
        <table className="w-full min-w-[280px] border-collapse font-mono text-xs">
          <thead>
            <tr>
              <th className="p-1 text-left text-[var(--ink-mute)]">Key →</th>
              {TOKENS.map((t) => (
                <th key={t} className="p-1 text-center text-[var(--ink-mute)]">
                  {t}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="p-1 text-[var(--ink-mute)]">weight</td>
              {weights.map((w, j) => (
                <td key={j} className="p-0.5">
                  <div
                    className="rounded text-center text-[var(--ink)]"
                    style={{
                      background: `color-mix(in srgb, var(--blueprint) ${Math.round(w * 100)}%, transparent)`,
                    }}
                  >
                    {(w * 100).toFixed(0)}%
                  </div>
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>

      <p className="mt-3 font-mono text-xs text-[var(--ink-mute)]">
        Query &quot;{TOKENS[queryIdx]}&quot; → output = Σ weight<sub>j</sub> · V<sub>j</sub>
      </p>
    </div>
  );
}
