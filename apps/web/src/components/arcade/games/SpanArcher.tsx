"use client";

import { useFrame } from "@react-three/fiber";
import { useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { Button } from "@/components/ui/button";
import { Arrow, Scene3D, type Vec3 } from "@/components/arcade/games/Scene3D";
import { Flash, GameHUD, type GameProps, pick, randInt, Slider, useThemeColors } from "@/components/arcade/games/shared";

const ROUNDS = 5;
const TRIES = 3;
const POINTS_BY_TRY = [20, 13, 7];
const MULTIPLIERS = [-2, -1.5, -1, -0.5, 0.5, 1, 1.5, 2];

interface Round {
  a: Vec3;
  b: Vec3;
  target: Vec3;
}

const add = (p: Vec3, q: Vec3): Vec3 => [p[0] + q[0], p[1] + q[1], p[2] + q[2]];
const scale = (s: number, p: Vec3): Vec3 => [s * p[0], s * p[1], s * p[2]];
const len = (p: Vec3) => Math.hypot(...p);
const cross = (p: Vec3, q: Vec3): Vec3 => [
  p[1] * q[2] - p[2] * q[1],
  p[2] * q[0] - p[0] * q[2],
  p[0] * q[1] - p[1] * q[0],
];

function makeRound(): Round {
  for (;;) {
    const a: Vec3 = [randInt(-2, 2), randInt(0, 2), randInt(-2, 2)];
    const b: Vec3 = [randInt(-2, 2), randInt(-1, 2), randInt(-2, 2)];
    if (len(a) < 1 || len(b) < 1) continue;
    if (len(cross(a, b)) < 1.5) continue; // too close to parallel to be fun
    const target = add(scale(pick(MULTIPLIERS), a), scale(pick(MULTIPLIERS), b));
    if (len(target) < 1.2 || len(target) > 4.8 || target[1] < -1.5) continue;
    return { a, b, target };
  }
}

export default function SpanArcher({ onFinish }: GameProps) {
  const colors = useThemeColors();
  const rounds = useMemo(() => Array.from({ length: ROUNDS }, makeRound), []);
  const [round, setRound] = useState(0);
  const [tries, setTries] = useState(0);
  const [score, setScore] = useState(0);
  const [s, setS] = useState(1);
  const [t, setT] = useState(1);
  const [lastShot, setLastShot] = useState<Vec3 | null>(null);
  const [flash, setFlash] = useState<{ text: string; tone: "good" | "bad" | "info" } | null>(null);
  const [locked, setLocked] = useState(false);

  const r = rounds[Math.min(round, ROUNDS - 1)];
  const sa = scale(s, r.a);
  const shot = add(sa, scale(t, r.b));

  const advance = (gained: number) => {
    const total = score + gained;
    setScore(total);
    setLocked(true);
    setTimeout(() => {
      if (round + 1 >= ROUNDS) {
        onFinish(total);
        return;
      }
      setRound(round + 1);
      setTries(0);
      setS(1);
      setT(1);
      setLastShot(null);
      setFlash(null);
      setLocked(false);
    }, 1300);
  };

  const fire = () => {
    if (locked) return;
    const miss = len(add(shot, scale(-1, r.target)));
    const attempt = tries + 1;
    setTries(attempt);
    setLastShot(shot);
    if (miss < 0.05) {
      setFlash({ text: `Bullseye! +${POINTS_BY_TRY[tries]}`, tone: "good" });
      advance(POINTS_BY_TRY[tries]);
    } else if (attempt >= TRIES) {
      setFlash({ text: `Out of arrows. It was s=${solve(r).s}, t=${solve(r).t}`, tone: "bad" });
      advance(0);
    } else {
      setFlash({ text: `Missed by ${miss.toFixed(2)}. ${TRIES - attempt} arrow${TRIES - attempt > 1 ? "s" : ""} left`, tone: "bad" });
    }
  };

  return (
    <div className="space-y-3">
      <GameHUD
        round={round}
        rounds={ROUNDS}
        score={score}
        extra={<span>Arrows {"➶".repeat(TRIES - tries)}</span>}
      />
      <div className="grid gap-4 lg:grid-cols-[1fr_300px]">
        <Scene3D mute={colors.mute}>
          <SpanPlane a={r.a} b={r.b} color={colors.a} />
          <Arrow to={r.a} color={colors.a} label="a" />
          <Arrow to={r.b} color={colors.b} label="b" />
          <Arrow to={sa} color={colors.a} opacity={0.45} radius={0.035} />
          <Arrow from={sa} to={shot} color={colors.b} opacity={0.45} radius={0.035} />
          <Arrow to={shot} color={colors.ink} radius={0.06} label="s·a + t·b" />
          <Target position={r.target} color={colors.hit} />
          {lastShot && (
            <mesh position={lastShot}>
              <sphereGeometry args={[0.09, 16, 16]} />
              <meshStandardMaterial color={colors.b} />
            </mesh>
          )}
        </Scene3D>

        <div className="space-y-4 rounded-md border border-[var(--rule-soft)] p-4">
          <div className="font-mono text-xs leading-relaxed">
            <p style={{ color: colors.a }}>a = [{r.a.join(", ")}]</p>
            <p style={{ color: colors.b }}>b = [{r.b.join(", ")}]</p>
            <p style={{ color: colors.hit }}>target = [{r.target.map(fmt).join(", ")}]</p>
            <p className="mt-2 text-[var(--ink-mute)]">your shot = [{shot.map(fmt).join(", ")}]</p>
          </div>
          <Slider label="s (multiplies a)" value={s} min={-3} max={3} step={0.5} onChange={setS} color={colors.a} format={fmt} />
          <Slider label="t (multiplies b)" value={t} min={-3} max={3} step={0.5} onChange={setT} color={colors.b} format={fmt} />
          <Button className="w-full" onClick={fire} disabled={locked}>
            Fire arrow
          </Button>
          <Flash text={flash?.text ?? null} tone={flash?.tone ?? "info"} />
          <p className="font-body text-xs text-[var(--ink-soft)]">
            Tip: solve one coordinate at a time. If a has a 0 somewhere, that coordinate only depends on t.
          </p>
        </div>
      </div>
    </div>
  );
}

function fmt(v: number) {
  return Number.isInteger(v) ? String(v) : v.toFixed(1);
}

/** Recover s, t for the reveal by least squares on the 3×2 system. */
function solve({ a, b, target }: Round) {
  const aa = a[0] * a[0] + a[1] * a[1] + a[2] * a[2];
  const bb = b[0] * b[0] + b[1] * b[1] + b[2] * b[2];
  const ab = a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
  const at = a[0] * target[0] + a[1] * target[1] + a[2] * target[2];
  const bt = b[0] * target[0] + b[1] * target[1] + b[2] * target[2];
  const det = aa * bb - ab * ab;
  return { s: fmt((at * bb - bt * ab) / det), t: fmt((bt * aa - at * ab) / det) };
}

function SpanPlane({ a, b, color }: { a: Vec3; b: Vec3; color: string }) {
  const quaternion = useMemo(() => {
    const u = new THREE.Vector3(...a).normalize();
    const n = new THREE.Vector3(...a).cross(new THREE.Vector3(...b)).normalize();
    const w = n.clone().cross(u).normalize();
    return new THREE.Quaternion().setFromRotationMatrix(new THREE.Matrix4().makeBasis(u, w, n));
  }, [a, b]);
  return (
    <mesh quaternion={quaternion}>
      <planeGeometry args={[11, 11]} />
      <meshBasicMaterial color={color} transparent opacity={0.08} side={THREE.DoubleSide} depthWrite={false} />
    </mesh>
  );
}

function Target({ position, color }: { position: Vec3; color: string }) {
  const ring = useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => {
    if (ring.current) {
      const k = 1 + 0.25 * Math.sin(clock.elapsedTime * 4);
      ring.current.scale.setScalar(k);
    }
  });
  return (
    <group position={position}>
      <mesh>
        <sphereGeometry args={[0.13, 24, 24]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.6} />
      </mesh>
      <mesh ref={ring}>
        <sphereGeometry args={[0.26, 24, 24]} />
        <meshBasicMaterial color={color} transparent opacity={0.2} depthWrite={false} />
      </mesh>
    </group>
  );
}
