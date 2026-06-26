"use client";

import { useCallback, useState } from "react";
import { cn } from "@/lib/cn";

interface MatrixMultiplyFigureProps {
  onInteract?: () => void;
}

export function MatrixMultiplyFigure({ onInteract }: MatrixMultiplyFigureProps) {
  const [a11, setA11] = useState(1);
  const [a12, setA12] = useState(2);
  const [a21, setA21] = useState(3);
  const [a22, setA22] = useState(4);
  const [touched, setTouched] = useState(false);

  const notify = useCallback(() => {
    if (!touched) {
      setTouched(true);
      onInteract?.();
    }
  }, [onInteract, touched]);

  const A = [
    [a11, a12],
    [a21, a22],
  ];
  const B = [
    [5, 6],
    [7, 8],
  ];
  const C = [
    [A[0][0] * B[0][0] + A[0][1] * B[0][1], A[0][0] * B[1][0] + A[0][1] * B[1][1]],
    [A[1][0] * B[0][0] + A[1][1] * B[0][1], A[1][0] * B[1][0] + A[1][1] * B[1][1]],
  ];

  return (
    <div className="rounded-md border border-[var(--rule-soft)] bg-[var(--bg-surface)] p-4">
      <div className="mb-3 flex items-center justify-between font-mono text-[10px] uppercase tracking-widest text-[var(--ink-mute)]">
        <span>Matrix multiply A @ B</span>
        <span>B fixed · edit A</span>
      </div>

      <div className="grid grid-cols-3 items-center gap-2 font-mono text-sm">
        <div className="text-center">
          <p className="mb-1 text-[10px] text-[var(--ink-mute)]">A (2×2)</p>
          <pre className="inline-block rounded bg-[var(--code-bg)] px-2 py-1 text-left">
            {`[${A[0][0]} ${A[0][1]}]\n[${A[1][0]} ${A[1][1]}]`}
          </pre>
        </div>
        <p className="text-center text-xl text-[var(--blueprint)]">@</p>
        <div className="text-center">
          <p className="mb-1 text-[10px] text-[var(--ink-mute)]">B (2×2)</p>
          <pre className="inline-block rounded bg-[var(--code-bg)] px-2 py-1 text-left text-[var(--ink-mute)]">
            {`[5 6]\n[7 8]`}
          </pre>
        </div>
      </div>

      <p className="my-3 text-center font-mono text-lg text-[var(--blueprint)]">=</p>

      <div className="text-center">
        <p className="mb-1 font-mono text-[10px] text-[var(--ink-mute)]">C = A @ B</p>
        <pre className="inline-block rounded border border-[var(--blueprint)] bg-[var(--blueprint-tint)] px-3 py-2 text-left font-mono text-sm">
          {`[${C[0][0]} ${C[0][1]}]\n[${C[1][0]} ${C[1][1]}]`}
        </pre>
      </div>

      <p className="mt-3 font-mono text-xs text-[var(--ink-mute)]">
        C[0][0] = A row 0 · B col 0 = {A[0][0]}×5 + {A[0][1]}×7 = {C[0][0]}
      </p>

      <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
        {(
          [
            ["a11", a11, setA11],
            ["a12", a12, setA12],
            ["a21", a21, setA21],
            ["a22", a22, setA22],
          ] as const
        ).map(([label, val, set]) => (
          <label key={label} className="text-xs text-[var(--ink-soft)]">
            A[{label.slice(1)}]
            <input
              type="range"
              min={-3}
              max={5}
              step={1}
              value={val}
              onChange={(e) => {
                set(Number(e.target.value));
                notify();
              }}
              className="mt-1 w-full accent-[var(--blueprint)]"
            />
          </label>
        ))}
      </div>

      <button
        type="button"
        onClick={() => {
          setTouched(true);
          onInteract?.();
        }}
        className={cn(
          "mt-4 w-full rounded-md border px-3 py-2 text-sm transition-colors",
          touched
            ? "border-[var(--blueprint)] bg-[var(--blueprint-tint)] text-[var(--blueprint)]"
            : "border-[var(--rule-soft)] hover:border-[var(--blueprint)]",
        )}
      >
        {touched ? "Explored ✓" : "Got it — row · column dot products"}
      </button>
    </div>
  );
}
