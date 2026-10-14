"use client";

import { useEffect, useState } from "react";
import { LEVEL_UP_EVENT, type LevelUpDetail } from "@/lib/gamification";

const CONFETTI_COLORS = ["#3553ff", "#f5c542", "#e4572e", "#1a7f4b", "#9b5de5"];

/** Global level-up moment. Mounted once in the root layout. */
export function LevelUpCelebration() {
  const [detail, setDetail] = useState<LevelUpDetail | null>(null);

  useEffect(() => {
    const onLevel = (e: Event) => setDetail((e as CustomEvent<LevelUpDetail>).detail);
    window.addEventListener(LEVEL_UP_EVENT, onLevel);
    return () => window.removeEventListener(LEVEL_UP_EVENT, onLevel);
  }, []);

  useEffect(() => {
    if (!detail) return;
    const t = setTimeout(() => setDetail(null), 5200);
    return () => clearTimeout(t);
  }, [detail]);

  if (!detail) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={() => setDetail(null)}
      role="dialog"
      aria-live="assertive"
      aria-label={`Level up: level ${detail.level}`}
    >
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
        {Array.from({ length: 48 }, (_, i) => (
          <span
            key={i}
            className="m4ai-confetti absolute top-[-12px] block h-3 w-2"
            style={{
              left: `${(i * 37) % 100}%`,
              background: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
              animationDelay: `${(i % 12) * 0.08}s`,
              animationDuration: `${2.2 + (i % 5) * 0.35}s`,
            }}
          />
        ))}
      </div>
      <div className="m4ai-pop relative w-full max-w-sm rounded-md border-2 border-[var(--ink)] bg-[var(--bg)] p-8 text-center shadow-[6px_6px_0_var(--ink)]">
        <p className="font-mono text-xs uppercase tracking-[0.3em] text-[var(--blueprint)]">Level up</p>
        <p className="mt-2 font-display text-8xl leading-none text-[var(--ink)]">{detail.level}</p>
        <p className="mt-3 font-body text-2xl font-semibold">{detail.title}</p>
        <p className="mt-2 font-body text-sm text-[var(--ink-soft)]">Your math is compounding. Keep the streak alive.</p>
        <p className="mt-6 font-mono text-[10px] uppercase tracking-widest text-[var(--ink-mute)]">Tap to continue</p>
      </div>
    </div>
  );
}
