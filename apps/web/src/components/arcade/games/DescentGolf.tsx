"use client";

import { useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { Button } from "@/components/ui/button";
import { Scene3D } from "@/components/arcade/games/Scene3D";
import { Flash, GameHUD, type GameProps, Slider, useThemeColors } from "@/components/arcade/games/shared";

type P2 = [number, number];

interface Course {
  name: string;
  blurb: string;
  f: (x: number, y: number) => number;
  grad: (x: number, y: number) => P2;
  start: P2;
  min: P2;
  par: number;
  momentum: boolean;
}

/** Pars come from a brute-force search over lr (and momentum) with the same rules as the game. */
const COURSES: Course[] = [
  {
    name: "Hole 1 · The Bowl",
    blurb: "A perfectly round bowl. Find the learning rate that gets there almost instantly.",
    f: (x, y) => 0.5 * (x * x + y * y),
    grad: (x, y) => [x, y],
    start: [-3.5, 3],
    min: [0, 0],
    par: 2,
    momentum: false,
  },
  {
    name: "Hole 2 · Long Valley",
    blurb: "Steep walls, gentle floor. Too big a step and you'll bounce off the walls.",
    f: (x, y) => 0.5 * (0.15 * x * x + 2 * y * y),
    grad: (x, y) => [0.15 * x, 2 * y],
    start: [-4, 2.5],
    min: [0, 0],
    par: 23,
    momentum: false,
  },
  {
    name: "Hole 3 · The Ravine",
    blurb: "A narrow canyon. Plain gradient descent stalls. Momentum is unlocked.",
    f: (x, y) => 0.5 * (0.05 * x * x + 3 * y * y),
    grad: (x, y) => [0.05 * x, 3 * y],
    start: [-4.2, 1.8],
    min: [0, 0],
    par: 13,
    momentum: true,
  },
  {
    name: "Hole 4 · Tilted Basin",
    blurb: "The minimum is off-centre and the bowl is rotated. Read the slope.",
    f: (x, y) => {
      const dx = x - 1.5;
      const dy = y + 1;
      return 0.5 * dx * dx + 0.6 * dx * dy + 0.6 * dy * dy;
    },
    grad: (x, y) => [x - 1.5 + 0.6 * (y + 1), 0.6 * (x - 1.5) + 1.2 * (y + 1)],
    start: [-3.5, 3],
    min: [1.5, -1],
    par: 4,
    momentum: true,
  },
];

const MAX_STEPS = 60;
const ATTEMPTS = 3;
const HOLE_RADIUS = 0.15;
const SINK_SPEED = 0.3;
const BOUNDS = 5.5;
const COURSE_POINTS = 25;
const STEPS_PER_SEC = 10;

type Verdict = "sunk" | "short" | "out";

function simulate(c: Course, lr: number, beta: number): { path: P2[]; verdict: Verdict } {
  let [x, y] = c.start;
  let vx = 0;
  let vy = 0;
  const path: P2[] = [[x, y]];
  for (let s = 1; s <= MAX_STEPS; s++) {
    const [gx, gy] = c.grad(x, y);
    vx = beta * vx - lr * gx;
    vy = beta * vy - lr * gy;
    x += vx;
    y += vy;
    if (Math.abs(x) > BOUNDS || Math.abs(y) > BOUNDS) {
      path.push([Math.max(-BOUNDS, Math.min(BOUNDS, x)), Math.max(-BOUNDS, Math.min(BOUNDS, y))]);
      return { path, verdict: "out" };
    }
    path.push([x, y]);
    if (Math.hypot(x - c.min[0], y - c.min[1]) < HOLE_RADIUS && Math.hypot(vx, vy) < SINK_SPEED) {
      return { path, verdict: "sunk" };
    }
  }
  return { path, verdict: "short" };
}

function useHeight(c: Course) {
  return useMemo(() => {
    let fmax = 0;
    for (let i = -5; i <= 5; i += 0.5) for (let j = -5; j <= 5; j += 0.5) fmax = Math.max(fmax, c.f(i, j));
    const k = 3.5 / fmax;
    return (x: number, y: number) => Math.min(4, c.f(x, y) * k);
  }, [c]);
}

export default function DescentGolf({ onFinish }: GameProps) {
  const colors = useThemeColors();
  const [hole, setHole] = useState(0);
  const [attempt, setAttempt] = useState(0);
  const [score, setScore] = useState(0);
  const [lr, setLr] = useState(0.3);
  const [beta, setBeta] = useState(0);
  const [shot, setShot] = useState<{ path: P2[]; verdict: Verdict } | null>(null);
  const [shotId, setShotId] = useState(0);
  const [rolling, setRolling] = useState(false);
  const [flash, setFlash] = useState<{ text: string; tone: "good" | "bad" | "info" } | null>(null);

  const course = COURSES[Math.min(hole, COURSES.length - 1)];
  const height = useHeight(course);

  const putt = () => {
    if (rolling) return;
    const result = simulate(course, lr, course.momentum ? beta : 0);
    setShot(result);
    setShotId((n) => n + 1);
    setRolling(true);
    setFlash(null);
  };

  const nextHole = (total: number) => {
    setTimeout(() => {
      if (hole + 1 >= COURSES.length) {
        onFinish(total);
        return;
      }
      setHole(hole + 1);
      setAttempt(0);
      setShot(null);
      setFlash(null);
      setBeta(0);
      setLr(0.3);
    }, 1600);
  };

  const onRollDone = () => {
    setRolling(false);
    if (!shot) return;
    const steps = shot.path.length - 1;
    const used = attempt + 1;
    setAttempt(used);
    if (shot.verdict === "sunk") {
      const pts = Math.max(5, Math.round(COURSE_POINTS - Math.max(0, steps - course.par) * 0.6 - (used - 1) * 4));
      const total = score + pts;
      setScore(total);
      setFlash({ text: `In the hole in ${steps} step${steps > 1 ? "s" : ""} (par ${course.par}) · +${pts}`, tone: "good" });
      nextHole(total);
      return;
    }
    const why =
      shot.verdict === "out"
        ? "Diverged! The step was too big, so it bounced off the course."
        : `Still rolling after ${MAX_STEPS} steps. Too timid${course.momentum ? ", or try momentum" : ""}.`;
    if (used >= ATTEMPTS) {
      setFlash({ text: `${why} No points on this hole.`, tone: "bad" });
      nextHole(score);
    } else {
      setFlash({ text: `${why} ${ATTEMPTS - used} putt${ATTEMPTS - used > 1 ? "s" : ""} left.`, tone: "bad" });
    }
  };

  const [gx, gy] = course.grad(...course.start);

  return (
    <div className="space-y-3">
      <GameHUD
        round={hole}
        rounds={COURSES.length}
        score={score}
        extra={<span>Putts {"●".repeat(ATTEMPTS - attempt)}</span>}
      />
      <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
        <Scene3D camera={[7, 7, 8]} grid={false} axes={false} height={480} mute={colors.mute}>
          <Surface course={course} height={height} low={colors.a} high={colors.b} />
          <Flag at={course.min} height={height} color={colors.hit} />
          <Ball
            key={`${hole}-${shotId}`}
            path={shot?.path ?? [course.start]}
            height={height}
            color={colors.gold}
            trail={colors.ink}
            running={rolling}
            onDone={onRollDone}
          />
        </Scene3D>

        <div className="space-y-4 rounded-md border border-[var(--rule-soft)] p-4">
          <div>
            <p className="font-body font-semibold">{course.name}</p>
            <p className="mt-1 font-body text-sm text-[var(--ink-soft)]">{course.blurb}</p>
          </div>
          <p className="font-mono text-[11px] text-[var(--ink-mute)]">
            slope at the tee: ∇f = [{gx.toFixed(2)}, {gy.toFixed(2)}] · par {course.par}
          </p>
          <Slider label="learning rate (lr)" value={lr} min={0.01} max={1.2} step={0.01} onChange={setLr} disabled={rolling} />
          <Slider
            label={course.momentum ? "momentum (β)" : "momentum 🔒 (unlocks on hole 3)"}
            value={course.momentum ? beta : 0}
            min={0}
            max={0.95}
            step={0.05}
            onChange={setBeta}
            disabled={!course.momentum || rolling}
          />
          <p className="font-mono text-[11px] leading-relaxed text-[var(--ink-mute)]">
            v ← β·v − lr·∇f(p)
            <br />p ← p + v
          </p>
          <Button className="w-full" onClick={putt} disabled={rolling || attempt >= ATTEMPTS}>
            {rolling ? "Rolling…" : "Putt"}
          </Button>
          <Flash text={flash?.text ?? null} tone={flash?.tone ?? "info"} />
        </div>
      </div>
    </div>
  );
}

function Surface({
  course,
  height,
  low,
  high,
}: {
  course: Course;
  height: (x: number, y: number) => number;
  low: string;
  high: string;
}) {
  const geometry = useMemo(() => {
    const N = 60;
    const positions: number[] = [];
    const colorsArr: number[] = [];
    const cLow = new THREE.Color(low);
    const cHigh = new THREE.Color(high);
    for (let i = 0; i <= N; i++) {
      for (let j = 0; j <= N; j++) {
        const x = -5 + (10 * i) / N;
        const y = -5 + (10 * j) / N;
        const h = height(x, y);
        positions.push(x, h, y);
        const c = cLow.clone().lerp(cHigh, Math.min(1, h / 3.5));
        colorsArr.push(c.r, c.g, c.b);
      }
    }
    const index: number[] = [];
    for (let i = 0; i < N; i++) {
      for (let j = 0; j < N; j++) {
        const a = i * (N + 1) + j;
        const b = a + N + 1;
        index.push(a, b, a + 1, b, b + 1, a + 1);
      }
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
    g.setAttribute("color", new THREE.Float32BufferAttribute(colorsArr, 3));
    g.setIndex(index);
    g.computeVertexNormals();
    return g;
    // course drives height; colours are theme-only
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [course, low, high]);
  useEffect(() => () => geometry.dispose(), [geometry]);

  return (
    <group>
      <mesh geometry={geometry}>
        <meshStandardMaterial vertexColors side={THREE.DoubleSide} roughness={0.8} transparent opacity={0.92} />
      </mesh>
      <mesh geometry={geometry}>
        <meshBasicMaterial wireframe color="#000000" transparent opacity={0.06} />
      </mesh>
    </group>
  );
}

function Flag({ at, height, color }: { at: P2; height: (x: number, y: number) => number; color: string }) {
  const h = height(at[0], at[1]);
  return (
    <group position={[at[0], h, at[1]]}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
        <torusGeometry args={[HOLE_RADIUS + 0.05, 0.03, 8, 32]} />
        <meshStandardMaterial color="#111111" />
      </mesh>
      <mesh position={[0, 0.6, 0]}>
        <cylinderGeometry args={[0.02, 0.02, 1.2, 8]} />
        <meshStandardMaterial color="#dddddd" />
      </mesh>
      <mesh position={[0.2, 1.05, 0]}>
        <boxGeometry args={[0.4, 0.25, 0.02]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.4} />
      </mesh>
    </group>
  );
}

function Ball({
  path,
  height,
  color,
  trail,
  running,
  onDone,
}: {
  path: P2[];
  height: (x: number, y: number) => number;
  color: string;
  trail: string;
  running: boolean;
  onDone: () => void;
}) {
  const ball = useRef<THREE.Mesh>(null);
  const progress = useRef(0);
  const done = useRef(false);
  const [shown, setShown] = useState(1);
  const pts3 = useMemo(() => path.map(([x, y]) => new THREE.Vector3(x, height(x, y) + 0.12, y)), [path, height]);
  const trailLine = useMemo(() => new THREE.Line(new THREE.BufferGeometry(), new THREE.LineBasicMaterial()), []);
  const trailGeo = trailLine.geometry;
  useEffect(() => {
    (trailLine.material as THREE.LineBasicMaterial).color.set(trail);
  }, [trail, trailLine]);
  useEffect(
    () => () => {
      trailLine.geometry.dispose();
      (trailLine.material as THREE.Material).dispose();
    },
    [trailLine],
  );

  useEffect(() => {
    trailGeo.setFromPoints(pts3.slice(0, Math.max(1, shown)));
  }, [pts3, shown, trailGeo]);

  useFrame((_, dt) => {
    if (!ball.current) return;
    if (!running) {
      if (!done.current) ball.current.position.copy(pts3[0]);
      return;
    }
    progress.current = Math.min(pts3.length - 1, progress.current + dt * STEPS_PER_SEC);
    const i = Math.floor(progress.current);
    const frac = progress.current - i;
    const a = pts3[i];
    const b = pts3[Math.min(i + 1, pts3.length - 1)];
    ball.current.position.lerpVectors(a, b, frac);
    if (i + 1 !== shown) setShown(i + 1);
    if (progress.current >= pts3.length - 1 && !done.current) {
      done.current = true;
      setShown(pts3.length);
      onDone();
    }
  });

  return (
    <group>
      <mesh ref={ball} position={pts3[0]}>
        <sphereGeometry args={[0.16, 24, 24]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.25} />
      </mesh>
      {shown > 1 && <primitive object={trailLine} />}
    </group>
  );
}
