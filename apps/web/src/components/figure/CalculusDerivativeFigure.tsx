"use client";

import { useCallback, useMemo, useState } from "react";
import { cn } from "@/lib/cn";

interface CalculusDerivativeFigureProps {
  onInteract?: () => void;
}

function f(x: number) {
  return 0.15 * (x - 2) ** 2 + 0.5;
}

function df(x: number) {
  return 0.3 * (x - 2);
}

export function CalculusDerivativeFigure({ onInteract }: CalculusDerivativeFigureProps) {
  const [x0, setX0] = useState(1.2);
  const [touched, setTouched] = useState(false);

  const notify = useCallback(() => {
    if (!touched) {
      setTouched(true);
      onInteract?.();
    }
  }, [onInteract, touched]);

  const W = 480;
  const H = 200;
  const pad = 30;
  const xMin = -0.5;
  const xMax = 4.5;
  const yMin = 0;
  const yMax = 3.5;

  const toX = (x: number) => pad + ((x - xMin) / (xMax - xMin)) * (W - 2 * pad);
  const toY = (y: number) => H - pad - ((y - yMin) / (yMax - yMin)) * (H - 2 * pad);

  const curvePath = useMemo(() => {
    const pts: string[] = [];
    for (let i = 0; i <= 80; i++) {
      const x = xMin + (i / 80) * (xMax - xMin);
      const y = f(x);
      pts.push(`${i === 0 ? "M" : "L"} ${toX(x).toFixed(1)} ${toY(y).toFixed(1)}`);
    }
    return pts.join(" ");
  }, [xMin, xMax]);

  const yAt = f(x0);
  const slope = df(x0);
  const tangentLen = 1.4;
  const x1 = x0 - tangentLen;
  const x2 = x0 + tangentLen;
  const y1 = yAt + slope * (x1 - x0);
  const y2 = yAt + slope * (x2 - x0);

  return (
    <div className="rounded-md border border-[var(--rule-soft)] bg-[var(--bg-surface)] p-4">
      <div className="mb-3 flex items-center justify-between font-mono text-[10px] uppercase tracking-widest text-[var(--ink-mute)]">
        <span>Derivative = slope of tangent</span>
        <span>f&apos;(x₀) = {slope.toFixed(2)}</span>
      </div>

      <svg viewBox={`0 0 ${W} ${H}`} className="w-full max-w-lg">
        <line x1={pad} y1={toY(0)} x2={W - pad} y2={toY(0)} stroke="var(--rule-soft)" strokeWidth="1" />
        <line x1={toX(0)} y1={pad} x2={toX(0)} y2={H - pad} stroke="var(--rule-soft)" strokeWidth="1" />
        <path d={curvePath} fill="none" stroke="var(--ink-mute)" strokeWidth="2" />
        <line
          x1={toX(x1)}
          y1={toY(y1)}
          x2={toX(x2)}
          y2={toY(y2)}
          stroke="var(--blueprint)"
          strokeWidth="2"
          strokeDasharray="4 3"
        />
        <circle cx={toX(x0)} cy={toY(yAt)} r="5" fill="var(--blueprint)" />
      </svg>

      <label className="mt-3 block font-mono text-xs text-[var(--ink-mute)]">
        x₀ = {x0.toFixed(2)}
        <input
          type="range"
          min={0}
          max={4}
          step={0.05}
          value={x0}
          onChange={(e) => {
            setX0(Number(e.target.value));
            notify();
          }}
          className={cn("mt-1 block w-full accent-[var(--blueprint)]")}
        />
      </label>

      <p className="mt-2 font-body text-sm text-[var(--ink-soft)]">
        Negative slope → nudge weight down to reduce loss. That is gradient descent.
      </p>
    </div>
  );
}
