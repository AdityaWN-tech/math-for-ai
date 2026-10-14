"use client";

import { useMemo, useRef, useState, type PointerEvent } from "react";
import { Button } from "@/components/ui/button";
import { Flash, GameHUD, type GameProps, pick, useThemeColors } from "@/components/arcade/games/shared";

const ROUNDS = 5;
const ROUND_POINTS = 20;
const FULL_MARKS_DEG = 2;
const ZERO_MARKS_DEG = 20;
const UNIT = 70; // px per unit length

type M2 = [[number, number], [number, number]];

interface Round {
  M: M2;
  vecs: [number, number][]; // unit eigenvectors
  lambdas: number[];
}

/** Symmetric matrices built as R·diag(λ)·Rᵀ, so the eigenvectors are real and perpendicular. */
function makeRound(): Round {
  const lambdaPairs: [number, number][] = [
    [2, 0.5],
    [2.5, 1],
    [3, -1],
    [1.5, -0.5],
    [2, -1.5],
    [0.5, 2.5],
  ];
  const [l1, l2] = pick(lambdaPairs);
  const phi = Math.random() * Math.PI;
  const c = Math.cos(phi);
  const s = Math.sin(phi);
  const M: M2 = [
    [l1 * c * c + l2 * s * s, (l1 - l2) * c * s],
    [(l1 - l2) * c * s, l1 * s * s + l2 * c * c],
  ];
  return { M, vecs: [[c, s], [-s, c]], lambdas: [l1, l2] };
}

const mul = (M: M2, v: [number, number]): [number, number] => [M[0][0] * v[0] + M[0][1] * v[1], M[1][0] * v[0] + M[1][1] * v[1]];

/** Angle between two lines through the origin (ignores direction), in degrees. */
function lineAngle(u: [number, number], v: [number, number]) {
  const cos = Math.abs(u[0] * v[0] + u[1] * v[1]) / (Math.hypot(...u) * Math.hypot(...v) || 1);
  return (Math.acos(Math.min(1, cos)) * 180) / Math.PI;
}

export default function EigenHunter({ onFinish }: GameProps) {
  const colors = useThemeColors();
  const rounds = useMemo(() => Array.from({ length: ROUNDS }, makeRound), []);
  const [round, setRound] = useState(0);
  const [score, setScore] = useState(0);
  const [theta, setTheta] = useState(Math.PI / 5);
  const [revealed, setRevealed] = useState(false);
  const [flash, setFlash] = useState<{ text: string; tone: "good" | "bad" | "info" } | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const dragging = useRef(false);

  const r = rounds[Math.min(round, ROUNDS - 1)];
  const v: [number, number] = [Math.cos(theta), Math.sin(theta)];
  const Av = mul(r.M, v);
  const misalign = lineAngle(v, Av);
  const aligned = misalign < FULL_MARKS_DEG + 1;

  const ellipse = useMemo(() => {
    const pts: string[] = [];
    for (let k = 0; k <= 72; k++) {
      const a = (k / 72) * Math.PI * 2;
      const p = mul(r.M, [Math.cos(a), Math.sin(a)]);
      pts.push(`${p[0] * UNIT},${-p[1] * UNIT}`);
    }
    return pts.join(" ");
  }, [r]);

  const pointerAngle = (e: PointerEvent<SVGSVGElement>) => {
    const svg = svgRef.current;
    if (!svg) return;
    const rect = svg.getBoundingClientRect();
    const x = e.clientX - (rect.left + rect.width / 2);
    const y = -(e.clientY - (rect.top + rect.height / 2));
    setTheta(Math.atan2(y, x));
  };

  const lockIn = () => {
    if (revealed) return;
    const err = Math.min(...r.vecs.map((e) => lineAngle(v, e)));
    const pts = Math.round(
      ROUND_POINTS * Math.max(0, Math.min(1, 1 - (err - FULL_MARKS_DEG) / (ZERO_MARKS_DEG - FULL_MARKS_DEG))),
    );
    const nearest = r.vecs.findIndex((e) => lineAngle(v, e) === err);
    const total = score + pts;
    setScore(total);
    setRevealed(true);
    setFlash({
      text: `${err.toFixed(1)}° off · λ = ${r.lambdas[nearest]} · +${pts}`,
      tone: pts >= 15 ? "good" : pts > 0 ? "info" : "bad",
    });
    setTimeout(() => {
      if (round + 1 >= ROUNDS) {
        onFinish(total);
        return;
      }
      setRound(round + 1);
      setRevealed(false);
      setFlash(null);
      setTheta(Math.random() * Math.PI * 2);
    }, 1900);
  };

  const fmt = (x: number) => (Math.abs(x) < 1e-9 ? "0" : x.toFixed(2));

  return (
    <div className="space-y-3">
      <GameHUD round={round} rounds={ROUNDS} score={score} />
      <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
        <div className="flex items-center justify-center rounded-md border border-[var(--rule-soft)] bg-[var(--bg-surface)] p-2">
          <svg
            ref={svgRef}
            viewBox="-260 -260 520 520"
            className="aspect-square w-full max-w-[520px] cursor-crosshair touch-none select-none"
            onPointerDown={(e) => {
              if (revealed) return;
              dragging.current = true;
              (e.target as Element).setPointerCapture?.(e.pointerId);
              pointerAngle(e);
            }}
            onPointerMove={(e) => dragging.current && !revealed && pointerAngle(e)}
            onPointerUp={() => (dragging.current = false)}
            role="img"
            aria-label="Drag to rotate the probe vector"
          >
            <defs>
              {(["a", "b", "hit"] as const).map((k) => (
                <marker key={k} id={`eh-${k}`} viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto">
                  <path d="M0 0 L10 5 L0 10z" fill={colors[k]} />
                </marker>
              ))}
            </defs>
            <line x1={-250} x2={250} y1={0} y2={0} stroke={colors.mute} strokeOpacity={0.3} />
            <line y1={-250} y2={250} x1={0} x2={0} stroke={colors.mute} strokeOpacity={0.3} />
            <circle r={UNIT} fill="none" stroke={colors.a} strokeOpacity={0.35} strokeDasharray="4 4" />
            <polygon points={ellipse} fill={colors.b} fillOpacity={0.06} stroke={colors.b} strokeOpacity={0.4} />
            {revealed &&
              r.vecs.map((e, i) => (
                <line
                  key={i}
                  x1={-e[0] * 250}
                  y1={e[1] * 250}
                  x2={e[0] * 250}
                  y2={-e[1] * 250}
                  stroke={colors.hit}
                  strokeWidth={2}
                  strokeDasharray="8 5"
                />
              ))}
            <line
              x1={0}
              y1={0}
              x2={Av[0] * UNIT}
              y2={-Av[1] * UNIT}
              stroke={aligned ? colors.hit : colors.b}
              strokeWidth={5}
              markerEnd={`url(#eh-${aligned ? "hit" : "b"})`}
            />
            <line x1={0} y1={0} x2={v[0] * UNIT} y2={-v[1] * UNIT} stroke={colors.a} strokeWidth={5} markerEnd="url(#eh-a)" />
            <circle cx={v[0] * UNIT} cy={-v[1] * UNIT} r={10} fill={colors.a} fillOpacity={0.25} />
            <text x={v[0] * (UNIT + 22)} y={-v[1] * (UNIT + 22)} fill={colors.a} fontFamily="ui-monospace, monospace" fontSize={16} textAnchor="middle" dominantBaseline="middle">
              v
            </text>
            <text x={Av[0] * UNIT * 1.12 + 6} y={-Av[1] * UNIT * 1.12} fill={aligned ? colors.hit : colors.b} fontFamily="ui-monospace, monospace" fontSize={16}>
              Av
            </text>
          </svg>
        </div>
        <div className="space-y-4 rounded-md border border-[var(--rule-soft)] p-4">
          <div className="font-mono text-sm">
            <p className="text-[10px] uppercase tracking-widest text-[var(--ink-mute)]">Matrix A</p>
            <p className="mt-1">
              [{fmt(r.M[0][0])}, {fmt(r.M[0][1])}]
              <br />[{fmt(r.M[1][0])}, {fmt(r.M[1][1])}]
            </p>
          </div>
          <div className="font-mono text-xs">
            <p>angle(v, Av) = {misalign.toFixed(1)}°</p>
            <p className="text-[var(--ink-mute)]">|Av| / |v| = {Math.hypot(...Av).toFixed(2)}</p>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-[var(--bg-surface)]">
            <div
              className="h-full transition-all"
              style={{ width: `${Math.max(4, 100 - misalign * 2.5)}%`, background: aligned ? colors.hit : colors.b }}
            />
          </div>
          <Button className="w-full" onClick={lockIn} disabled={revealed}>
            Lock in direction
          </Button>
          <Flash text={flash?.text ?? null} tone={flash?.tone ?? "info"} />
          <p className="font-body text-xs text-[var(--ink-soft)]">
            Drag anywhere on the board to rotate v. The faint ellipse is where every unit vector lands. Its
            longest and shortest axes are big clues.
          </p>
        </div>
      </div>
    </div>
  );
}
