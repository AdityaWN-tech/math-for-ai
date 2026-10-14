"use client";

import { Canvas } from "@react-three/fiber";
import { Html, OrbitControls } from "@react-three/drei";
import { useEffect, useMemo, type ReactNode } from "react";
import * as THREE from "three";

export type Vec3 = [number, number, number];

/** Shared 3D stage: orbit camera, soft light, floor grid and axes. */
export function Scene3D({
  children,
  camera = [6, 5, 7],
  height = 460,
  grid = true,
  axes = true,
  mute = "#7a7a78",
}: {
  children: ReactNode;
  camera?: Vec3;
  height?: number;
  grid?: boolean;
  axes?: boolean;
  mute?: string;
}) {
  return (
    <div
      className="relative w-full overflow-hidden rounded-md border border-[var(--rule-soft)] bg-[var(--bg-surface)]"
      style={{ height }}
    >
      <Canvas camera={{ position: camera, fov: 45 }} dpr={[1, 2]}>
        <ambientLight intensity={0.7} />
        <directionalLight position={[5, 10, 7]} intensity={1.1} />
        {grid && <gridHelper args={[12, 12, mute, mute]} material-opacity={0.25} material-transparent />}
        {axes && <Axes color={mute} />}
        {children}
        <OrbitControls makeDefault enableDamping enablePan={false} minDistance={3} maxDistance={22} />
      </Canvas>
      <p className="pointer-events-none absolute bottom-2 right-3 font-mono text-[10px] uppercase tracking-widest text-[var(--ink-mute)]">
        Drag to orbit · scroll to zoom
      </p>
    </div>
  );
}

function Axes({ color }: { color: string }) {
  const L = 5.5;
  return (
    <group>
      {(
        [
          ["x", [L, 0, 0]],
          ["y", [0, L, 0]],
          ["z", [0, 0, L]],
        ] as const
      ).map(([name, tip]) => (
        <group key={name}>
          <Line from={[0, 0, 0]} to={tip as Vec3} color={color} opacity={0.6} />
          <Html position={tip as Vec3} center style={{ pointerEvents: "none" }}>
            <span style={{ color, font: "11px ui-monospace, monospace" }}>{name}</span>
          </Html>
        </group>
      ))}
    </group>
  );
}

export function Line({
  from,
  to,
  color,
  opacity = 1,
}: {
  from: Vec3;
  to: Vec3;
  color: string;
  opacity?: number;
}) {
  const fromKey = from.join();
  const toKey = to.join();
  const geometry = useMemo(
    () => new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(...from), new THREE.Vector3(...to)]),
    // keyed on the numbers, not the (fresh every render) array identity
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [fromKey, toKey],
  );
  useEffect(() => () => geometry.dispose(), [geometry]);
  return (
    <lineSegments geometry={geometry}>
      <lineBasicMaterial color={color} transparent opacity={opacity} />
    </lineSegments>
  );
}

/** A solid arrow from `from` to `to`. */
export function Arrow({
  from = [0, 0, 0],
  to,
  color,
  opacity = 1,
  radius = 0.05,
  label,
}: {
  from?: Vec3;
  to: Vec3;
  color: string;
  opacity?: number;
  radius?: number;
  label?: string;
}) {
  const fromKey = from.join();
  const toKey = to.join();
  const { position, quaternion, shaft, head } = useMemo(() => {
    const a = new THREE.Vector3(...from);
    const b = new THREE.Vector3(...to);
    const dir = b.clone().sub(a);
    const len = dir.length();
    const headLen = Math.min(0.35, len * 0.4);
    const q = new THREE.Quaternion();
    if (len > 1e-6) q.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.clone().normalize());
    return { position: a, quaternion: q, shaft: Math.max(0, len - headLen), head: headLen };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fromKey, toKey]);

  if (shaft + head < 1e-4) return null;
  const transparent = opacity < 1;
  return (
    <group position={position} quaternion={quaternion}>
      <mesh position={[0, shaft / 2, 0]}>
        <cylinderGeometry args={[radius, radius, shaft, 12]} />
        <meshStandardMaterial color={color} transparent={transparent} opacity={opacity} />
      </mesh>
      <mesh position={[0, shaft + head / 2, 0]}>
        <coneGeometry args={[radius * 2.6, head, 16]} />
        <meshStandardMaterial color={color} transparent={transparent} opacity={opacity} />
      </mesh>
      {label && (
        <Html position={[0, shaft + head + 0.25, 0]} center style={{ pointerEvents: "none" }}>
          <span style={{ color, font: "600 13px ui-monospace, monospace", whiteSpace: "nowrap" }}>{label}</span>
        </Html>
      )}
    </group>
  );
}
