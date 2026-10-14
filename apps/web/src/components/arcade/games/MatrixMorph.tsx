"use client";

import { useEffect, useMemo, useState } from "react";
import * as THREE from "three";
import { Minus, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Arrow, Scene3D, type Vec3 } from "@/components/arcade/games/Scene3D";
import { Flash, GameHUD, type GameProps, pick, useThemeColors } from "@/components/arcade/games/shared";
import { cn } from "@/lib/cn";

type M3 = number[][]; // rows

const ROUND_POINTS = 20;
const HINT_COST = 5;

interface Puzzle {
  name: string;
  M: M3;
}

/** One puzzle per tier so difficulty ramps up. */
const TIERS: Puzzle[][] = [
  [
    { name: "Stretch", M: [[2, 0, 0], [0, 1, 0], [0, 0, 1]] },
    { name: "Tall", M: [[1, 0, 0], [0, 2, 0], [0, 0, 1]] },
    { name: "Squash", M: [[1, 0, 0], [0, 0.5, 0], [0, 0, 1]] },
  ],
  [
    { name: "Shear", M: [[1, 1, 0], [0, 1, 0], [0, 0, 1]] },
    { name: "Lean", M: [[1, 0, 0], [0, 1, 0], [0, 1, 1]] },
  ],
  [
    { name: "Quarter turn", M: [[0, 0, 1], [0, 1, 0], [-1, 0, 0]] },
    { name: "Roll", M: [[0, -1, 0], [1, 0, 0], [0, 0, 1]] },
  ],
  [
    { name: "Mirror", M: [[1, 0, 0], [0, 1, 0], [0, 0, -1]] },
    { name: "Flatten (det = 0)", M: [[1, 0, 0], [0, 0, 0], [0, 0, 1]] },
  ],
  [
    { name: "Combo", M: [[1, 0.5, 0], [0, 2, 0], [0, 0, 0.5]] },
    { name: "Twisted box", M: [[0, 0, 1.5], [1, 1, 0], [0, -1, 0]] },
  ],
];

const identity = (): M3 => [[1, 0, 0], [0, 1, 0], [0, 0, 1]];
const det3 = (m: M3) =>
  m[0][0] * (m[1][1] * m[2][2] - m[1][2] * m[2][1]) -
  m[0][1] * (m[1][0] * m[2][2] - m[1][2] * m[2][0]) +
  m[0][2] * (m[1][0] * m[2][1] - m[1][1] * m[2][0]);
const col = (m: M3, j: number): Vec3 => [m[0][j], m[1][j], m[2][j]];
const apply = (m: M3, v: Vec3): Vec3 => [0, 1, 2].map((i) => m[i][0] * v[0] + m[i][1] * v[1] + m[i][2] * v[2]) as Vec3;

const CUBE_CORNERS: Vec3[] = [
  [0, 0, 0], [1, 0, 0], [1, 1, 0], [0, 1, 0],
  [0, 0, 1], [1, 0, 1], [1, 1, 1], [0, 1, 1],
];
const CUBE_FACES = [
  [0, 1, 2, 0, 2, 3], [4, 6, 5, 4, 7, 6], [0, 4, 5, 0, 5, 1],
  [3, 2, 6, 3, 6, 7], [0, 3, 7, 0, 7, 4], [1, 5, 6, 1, 6, 2],
].flat();
const CUBE_EDGES = [0, 1, 1, 2, 2, 3, 3, 0, 4, 5, 5, 6, 6, 7, 7, 4, 0, 4, 1, 5, 2, 6, 3, 7];

function Box({ m, color, ghost }: { m: M3; color: string; ghost?: boolean }) {
  const key = m.flat().join();
  const { faces, edges } = useMemo(() => {
    const pts = CUBE_CORNERS.map((c) => apply(m, c)).flat();
    const f = new THREE.BufferGeometry();
    f.setAttribute("position", new THREE.Float32BufferAttribute(pts, 3));
    f.setIndex(CUBE_FACES);
    f.computeVertexNormals();
    const e = new THREE.BufferGeometry();
    e.setAttribute("position", new THREE.Float32BufferAttribute(CUBE_EDGES.flatMap((i) => pts.slice(i * 3, i * 3 + 3)), 3));
    return { faces: f, edges: e };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);
  useEffect(() => () => {
    faces.dispose();
    edges.dispose();
  }, [faces, edges]);

  return (
    <group>
      {!ghost && (
        <mesh geometry={faces}>
          <meshStandardMaterial color={color} transparent opacity={0.55} side={THREE.DoubleSide} />
        </mesh>
      )}
      <lineSegments geometry={edges}>
        <lineBasicMaterial color={color} transparent opacity={ghost ? 0.9 : 1} />
      </lineSegments>
    </group>
  );
}

export default function MatrixMorph({ onFinish }: GameProps) {
  const colors = useThemeColors();
  const puzzles = useMemo(() => TIERS.map((tier) => pick(tier)), []);
  const [round, setRound] = useState(0);
  const [score, setScore] = useState(0);
  const [m, setM] = useState<M3>(identity);
  const [hint, setHint] = useState(false);
  const [flash, setFlash] = useState<{ text: string; tone: "good" | "bad" | "info" } | null>(null);
  const [locked, setLocked] = useState(false);

  const target = puzzles[Math.min(round, puzzles.length - 1)];
  const d = det3(m);
  const axisColors = ["#e4572e", "#1a9f5b", "#3553ff"];

  const bump = (i: number, j: number, delta: number) => {
    if (locked) return;
    setM((prev) => prev.map((row, r) => row.map((v, c) => (r === i && c === j ? Math.max(-3, Math.min(3, v + delta)) : v))));
  };

  const lockIn = () => {
    if (locked) return;
    const err = Math.sqrt(m.flat().reduce((acc, v, k) => acc + (v - target.M.flat()[k]) ** 2, 0));
    let pts = err < 1e-9 ? ROUND_POINTS : Math.max(0, Math.round(ROUND_POINTS - 10 * err));
    if (hint) pts = Math.max(0, pts - HINT_COST);
    const total = score + pts;
    setScore(total);
    setLocked(true);
    setFlash(
      err < 1e-9
        ? { text: `Perfect match! +${pts}`, tone: "good" }
        : { text: `Off by ${err.toFixed(2)} → +${pts}`, tone: pts > 0 ? "info" : "bad" },
    );
    setTimeout(() => {
      if (round + 1 >= puzzles.length) {
        onFinish(total);
        return;
      }
      setRound(round + 1);
      setM(identity());
      setHint(false);
      setFlash(null);
      setLocked(false);
    }, 1600);
  };

  return (
    <div className="space-y-3">
      <GameHUD round={round} rounds={puzzles.length} score={score} extra={<span>Puzzle: {target.name}</span>} />
      <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
        <Scene3D camera={[4.5, 4, 6]} mute={colors.mute}>
          <Box m={target.M} color={colors.hit} ghost />
          <Box m={locked ? target.M : m} color={colors.a} />
          {[0, 1, 2].map((j) => (
            <Arrow key={j} to={col(m, j)} color={axisColors[j]} radius={0.035} label={["x→", "y→", "z→"][j]} />
          ))}
          {hint &&
            [0, 1, 2].map((j) => (
              <Arrow key={`h${j}`} to={col(target.M, j)} color={axisColors[j]} opacity={0.35} radius={0.06} />
            ))}
        </Scene3D>

        <div className="space-y-4 rounded-md border border-[var(--rule-soft)] p-4">
          <p className="font-mono text-[10px] uppercase tracking-widest text-[var(--ink-mute)]">Your matrix M</p>
          <div className="grid grid-cols-3 gap-2">
            {m.map((row, i) =>
              row.map((v, j) => (
                <div
                  key={`${i}${j}`}
                  className="flex items-center justify-between rounded-sm border px-1 py-1"
                  style={{ borderColor: axisColors[j] }}
                >
                  <button
                    type="button"
                    aria-label={`decrease row ${i + 1} column ${j + 1}`}
                    onClick={() => bump(i, j, -0.5)}
                    className="p-0.5 text-[var(--ink-mute)] hover:text-[var(--ink)]"
                  >
                    <Minus className="h-3 w-3" />
                  </button>
                  <span className="font-mono text-sm tabular-nums">{v}</span>
                  <button
                    type="button"
                    aria-label={`increase row ${i + 1} column ${j + 1}`}
                    onClick={() => bump(i, j, 0.5)}
                    className="p-0.5 text-[var(--ink-mute)] hover:text-[var(--ink)]"
                  >
                    <Plus className="h-3 w-3" />
                  </button>
                </div>
              )),
            )}
          </div>
          <p className="font-body text-xs text-[var(--ink-soft)]">
            Column colours match the arrows. Column 1 is where the x-axis lands, column 2 is where y lands, and
            column 3 is where z lands.
          </p>
          <div className="flex items-center justify-between font-mono text-sm">
            <span>det(M)</span>
            <span
              className={cn(
                "font-semibold tabular-nums",
                d < 0 && "text-[var(--arcade-b)]",
                d === 0 && "text-[var(--warn)]",
              )}
            >
              {d.toFixed(2)}
            </span>
          </div>
          <p className="font-mono text-[11px] text-[var(--ink-mute)]">
            {d === 0 ? "Volume collapsed: a dimension is gone." : d < 0 ? `Flipped inside out · volume ×${Math.abs(d).toFixed(2)}` : `Volume ×${d.toFixed(2)}`}
          </p>
          <div className="flex gap-2">
            <Button className="flex-1" onClick={lockIn} disabled={locked}>
              Lock in
            </Button>
            <Button variant="secondary" onClick={() => setHint(true)} disabled={hint || locked}>
              Hint (−{HINT_COST})
            </Button>
          </div>
          <Button variant="ghost" size="sm" onClick={() => setM(identity())} disabled={locked}>
            Reset to identity
          </Button>
          <Flash text={flash?.text ?? null} tone={flash?.tone ?? "info"} />
        </div>
      </div>
    </div>
  );
}
