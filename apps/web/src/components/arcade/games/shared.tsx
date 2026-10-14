"use client";

import { useEffect, useState, type ReactNode } from "react";
import { cn } from "@/lib/cn";

export interface GameProps {
  /** Called once with a 0–100 score when the run ends. */
  onFinish: (score: number) => void;
}

export function GameHUD({
  round,
  rounds,
  score,
  extra,
}: {
  round: number;
  rounds: number;
  score: number;
  extra?: ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-center gap-4 rounded-md border border-[var(--rule-soft)] bg-[var(--bg-surface)] px-4 py-2 font-mono text-xs uppercase tracking-widest">
      <span>
        Round <strong className="text-[var(--blueprint)]">{Math.min(round + 1, rounds)}</strong>/{rounds}
      </span>
      <span className="flex gap-1" aria-hidden>
        {Array.from({ length: rounds }, (_, i) => (
          <span
            key={i}
            className={cn(
              "h-2 w-5 border border-[var(--blueprint)]",
              i < round && "bg-[var(--blueprint)]",
              i === round && "bg-[var(--blueprint-tint-strong)]",
            )}
          />
        ))}
      </span>
      <span>
        Score <strong className="text-[var(--blueprint)]">{Math.round(score)}</strong>
      </span>
      {extra}
    </div>
  );
}

export function Slider({
  label,
  value,
  min,
  max,
  step,
  onChange,
  color,
  format = (v) => v.toFixed(2),
  disabled,
}: {
  label: ReactNode;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (v: number) => void;
  color?: string;
  format?: (v: number) => string;
  disabled?: boolean;
}) {
  return (
    <label className={cn("block", disabled && "opacity-50")}>
      <span className="flex items-baseline justify-between font-mono text-xs">
        <span style={color ? { color } : undefined}>{label}</span>
        <span className="text-base font-semibold tabular-nums">{format(value)}</span>
      </span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(Number(e.target.value))}
        className="mt-1 w-full"
        style={{ accentColor: color ?? "var(--blueprint)" }}
      />
    </label>
  );
}

/** A transient banner for "Hit!", "Miss", etc. */
export function Flash({ text, tone }: { text: string | null; tone: "good" | "bad" | "info" }) {
  if (!text) return null;
  return (
    <div
      key={text}
      className={cn(
        "m4ai-pop rounded-md px-4 py-2 text-center font-mono text-sm font-semibold",
        tone === "good" && "bg-[var(--arcade-hit)] text-white",
        tone === "bad" && "m4ai-shake bg-[var(--arcade-b)] text-white",
        tone === "info" && "bg-[var(--blueprint-tint-strong)] text-[var(--ink)]",
      )}
      role="status"
    >
      {text}
    </div>
  );
}

/** Resolve CSS custom properties so canvas / WebGL can use the theme. */
export function useThemeColors() {
  const read = () => {
    if (typeof window === "undefined") {
      return { a: "#3553ff", b: "#e4572e", hit: "#1a7f4b", gold: "#f5c542", ink: "#1a1a1a", mute: "#7a7a78", bg: "#fafaf5" };
    }
    const s = getComputedStyle(document.documentElement);
    const v = (n: string, f: string) => s.getPropertyValue(n).trim() || f;
    return {
      a: v("--arcade-a", "#3553ff"),
      b: v("--arcade-b", "#e4572e"),
      hit: v("--arcade-hit", "#1a7f4b"),
      gold: v("--arcade-gold", "#f5c542"),
      ink: v("--ink", "#1a1a1a"),
      mute: v("--ink-mute", "#7a7a78"),
      bg: v("--bg", "#fafaf5"),
    };
  };
  const [colors, setColors] = useState(read);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const update = () => setColors(read());
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);
  return colors;
}

export function randInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function pick<T>(items: readonly T[]): T {
  return items[Math.floor(Math.random() * items.length)];
}

export function shuffle<T>(items: readonly T[]): T[] {
  const out = [...items];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}
