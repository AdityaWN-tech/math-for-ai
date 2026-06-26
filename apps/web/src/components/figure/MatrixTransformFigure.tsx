"use client";

import { useCallback, useMemo, useState } from "react";
import { cn } from "@/lib/cn";

interface MatrixTransformFigureProps {
  onInteract?: () => void;
}

function matMul(a: number[][], b: number[][]): number[][] {
  return [
    [a[0][0] * b[0][0] + a[0][1] * b[1][0], a[0][0] * b[0][1] + a[0][1] * b[1][1]],
    [a[1][0] * b[0][0] + a[1][1] * b[1][0], a[1][0] * b[0][1] + a[1][1] * b[1][1]],
  ];
}

function apply(M: number[][], p: [number, number]): [number, number] {
  return [M[0][0] * p[0] + M[0][1] * p[1], M[1][0] * p[0] + M[1][1] * p[1]];
}

const UNIT_SQUARE: [number, number][] = [
  [0, 0],
  [1, 0],
  [1, 1],
  [0, 1],
];

export function MatrixTransformFigure({ onInteract }: MatrixTransformFigureProps) {
  const [deg, setDeg] = useState(30);
  const [sx, setSx] = useState(1.2);
  const [sy, setSy] = useState(0.9);
  const [kx, setKx] = useState(0.35);
  const [touched, setTouched] = useState(false);

  const notify = useCallback(() => {
    if (!touched) {
      setTouched(true);
      onInteract?.();
    }
  }, [onInteract, touched]);

  const theta = (deg * Math.PI) / 180;
  const c = Math.cos(theta);
  const s = Math.sin(theta);

  const matrix = useMemo(() => {
    const R = [
      [c, -s],
      [s, c],
    ];
    const S = [
      [sx, 0],
      [0, sy],
    ];
    const Sh = [
      [1, kx],
      [0, 1],
    ];
    return matMul(matMul(R, S), Sh);
  }, [c, s, sx, sy, kx]);

  const det = matrix[0][0] * matrix[1][1] - matrix[0][1] * matrix[1][0];

  const W = 520;
  const H = 260;
  const OX = 70;
  const OY = H - 50;
  const U = 72;

  const toSvg = (x: number, y: number) => ({
    x: OX + x * U,
    y: OY - y * U,
  });

  const poly = (pts: [number, number][]) =>
    pts.map((p) => `${toSvg(p[0], p[1]).x},${toSvg(p[0], p[1]).y}`).join(" ");

  const original = UNIT_SQUARE;
  const transformed = UNIT_SQUARE.map((p) => apply(matrix, p));

  return (
    <div className="rounded-md border border-[var(--rule-soft)] bg-[var(--bg-surface)] p-4">
      <div className="mb-3 flex items-center justify-between font-mono text-[10px] uppercase tracking-widest text-[var(--ink-mute)]">
        <span>Matrix transforms space</span>
        <span>drag sliders</span>
      </div>

      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label="Matrix transformation of unit square">
        <line x1={OX} y1={OY} x2={W - 20} y2={OY} stroke="var(--rule-soft)" strokeWidth="1" />
        <line x1={OX} y1={20} x2={OX} y2={OY} stroke="var(--rule-soft)" strokeWidth="1" />
        <polygon
          points={poly(original)}
          fill="var(--warn)"
          fillOpacity={0.15}
          stroke="var(--warn)"
          strokeWidth="2"
        />
        <polygon
          points={poly(transformed)}
          fill="var(--blueprint)"
          fillOpacity={0.12}
          stroke="var(--blueprint)"
          strokeWidth="2.5"
        />
        {transformed.map((p, i) => {
          const pt = toSvg(p[0], p[1]);
          return <circle key={i} cx={pt.x} cy={pt.y} r={3} fill="var(--blueprint)" />;
        })}
      </svg>

      <p className="mt-3 font-mono text-sm text-[var(--blueprint)]">
        det(M) = {det.toFixed(2)}{" "}
        <span className="text-[var(--ink-mute)]">
          {Math.abs(det - 1) < 0.05 ? "· area ~ preserved" : det < 0 ? "· orientation flipped" : "· area scaled"}
        </span>
      </p>
      <p className="mt-1 text-sm text-[var(--ink-soft)]">
        Orange = unit square · Blue = after rotate {deg}° → scale ({sx}, {sy}) → shear kx={kx}
      </p>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <label className="text-xs text-[var(--ink-soft)]">
          rotation (°)
          <input
            type="range"
            min={-180}
            max={180}
            step={1}
            value={deg}
            onChange={(e) => {
              setDeg(Number(e.target.value));
              notify();
            }}
            className="mt-1 w-full accent-[var(--blueprint)]"
          />
        </label>
        <label className="text-xs text-[var(--ink-soft)]">
          scale x
          <input
            type="range"
            min={0.4}
            max={2}
            step={0.1}
            value={sx}
            onChange={(e) => {
              setSx(Number(e.target.value));
              notify();
            }}
            className="mt-1 w-full accent-[var(--blueprint)]"
          />
        </label>
        <label className="text-xs text-[var(--ink-soft)]">
          scale y
          <input
            type="range"
            min={0.4}
            max={2}
            step={0.1}
            value={sy}
            onChange={(e) => {
              setSy(Number(e.target.value));
              notify();
            }}
            className="mt-1 w-full accent-[var(--blueprint)]"
          />
        </label>
        <label className="text-xs text-[var(--ink-soft)]">
          shear kx
          <input
            type="range"
            min={-0.8}
            max={0.8}
            step={0.05}
            value={kx}
            onChange={(e) => {
              setKx(Number(e.target.value));
              notify();
            }}
            className="mt-1 w-full accent-[var(--blueprint)]"
          />
        </label>
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
        {touched ? "Explored ✓" : "Got it — I see how matrices reshape space"}
      </button>
    </div>
  );
}
