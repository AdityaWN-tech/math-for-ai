"use client";

import { useCallback, useState } from "react";
import { cn } from "@/lib/cn";

interface VectorProjectionFigureProps {
  onInteract?: () => void;
}

export function VectorProjectionFigure({ onInteract }: VectorProjectionFigureProps) {
  const [degB, setDegB] = useState(25);
  const [degA, setDegA] = useState(70);
  const [lenA, setLenA] = useState(2.4);
  const [touched, setTouched] = useState(false);

  const notify = useCallback(() => {
    if (!touched) {
      setTouched(true);
      onInteract?.();
    }
  }, [onInteract, touched]);

  const ra = (degA * Math.PI) / 180;
  const rb = (degB * Math.PI) / 180;
  const ax = lenA * Math.cos(ra);
  const ay = lenA * Math.sin(ra);
  const bx = Math.cos(rb);
  const by = Math.sin(rb);
  const dot = ax * bx + ay * by;
  const projLen = dot;
  const px = projLen * bx;
  const py = projLen * by;
  const lenAm = Math.sqrt(ax * ax + ay * ay);
  const theta =
    (Math.acos(Math.max(-1, Math.min(1, dot / (lenAm || 1)))) * 180) / Math.PI;

  const W = 520;
  const H = 230;
  const OX = 60;
  const OY = H - 40;
  const U = 52;

  const toSvg = (x: number, y: number) => ({
    x: OX + x * U,
    y: OY - y * U,
  });

  const aEnd = toSvg(ax, ay);
  const bEnd = toSvg(3.4 * bx, 3.4 * by);
  const pEnd = toSvg(px, py);

  return (
    <div className="rounded-md border border-[var(--rule-soft)] bg-[var(--bg-surface)] p-4">
      <div className="mb-3 flex items-center justify-between font-mono text-[10px] uppercase tracking-widest text-[var(--ink-mute)]">
        <span>Vector projection</span>
        <span>drag the angles</span>
      </div>

      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label="Vector projection diagram">
        <line x1={OX} y1={OY} x2={bEnd.x} y2={bEnd.y} stroke="var(--ink-mute)" strokeWidth="2" />
        <line x1={OX} y1={OY} x2={aEnd.x} y2={aEnd.y} stroke="var(--blueprint)" strokeWidth="2.5" />
        <line x1={OX} y1={OY} x2={pEnd.x} y2={pEnd.y} stroke="var(--warn)" strokeWidth="3" />
        <line
          x1={aEnd.x}
          y1={aEnd.y}
          x2={pEnd.x}
          y2={pEnd.y}
          stroke="var(--rule-soft)"
          strokeWidth="1"
          strokeDasharray="4 3"
        />
      </svg>

      <p className="mt-3 font-mono text-sm text-[var(--blueprint)]">
        {projLen.toFixed(2)} <span className="text-[var(--ink-mute)]">proj length</span>
      </p>
      <p className="mt-1 text-sm text-[var(--ink-soft)]">
        angle θ = {theta.toFixed(0)}° · proj = |a|cos θ = {projLen.toFixed(2)}
      </p>
      <p className="mt-2 font-mono text-xs text-[var(--ink-mute)]">
        Blue is <strong>a</strong>, grey is direction of <strong>b</strong>, orange is the projection onto{" "}
        <strong>b</strong>.
      </p>

      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        <label className="text-xs text-[var(--ink-soft)]">
          angle of b
          <input
            type="range"
            min={0}
            max={180}
            step={1}
            value={degB}
            onChange={(e) => {
              setDegB(Number(e.target.value));
              notify();
            }}
            className="mt-1 w-full accent-[var(--blueprint)]"
          />
        </label>
        <label className="text-xs text-[var(--ink-soft)]">
          angle of a
          <input
            type="range"
            min={0}
            max={180}
            step={1}
            value={degA}
            onChange={(e) => {
              setDegA(Number(e.target.value));
              notify();
            }}
            className="mt-1 w-full accent-[var(--blueprint)]"
          />
        </label>
        <label className="text-xs text-[var(--ink-soft)]">
          length of a
          <input
            type="range"
            min={0.4}
            max={3.4}
            step={0.1}
            value={lenA}
            onChange={(e) => {
              setLenA(Number(e.target.value));
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
        {touched ? "Explored ✓" : "Got it — I see how projection works"}
      </button>
    </div>
  );
}
