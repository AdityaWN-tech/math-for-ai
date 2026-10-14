"use client";

import dynamic from "next/dynamic";
import type { ComponentType } from "react";
import type { GameId } from "@/lib/arcade/catalog";
import type { GameProps } from "@/components/arcade/games/shared";

function Loading() {
  return (
    <div className="flex h-[460px] items-center justify-center rounded-md border border-dashed border-[var(--rule-soft)] font-mono text-xs uppercase tracking-widest text-[var(--ink-mute)]">
      Loading game…
    </div>
  );
}

const GAMES: Record<GameId, ComponentType<GameProps>> = {
  "span-archer": dynamic(() => import("@/components/arcade/games/SpanArcher"), { ssr: false, loading: Loading }),
  "matrix-morph": dynamic(() => import("@/components/arcade/games/MatrixMorph"), { ssr: false, loading: Loading }),
  "descent-golf": dynamic(() => import("@/components/arcade/games/DescentGolf"), { ssr: false, loading: Loading }),
  "cosine-radar": dynamic(() => import("@/components/arcade/games/CosineRadar"), { ssr: false, loading: Loading }),
  "bayes-detective": dynamic(() => import("@/components/arcade/games/BayesDetective"), { ssr: false, loading: Loading }),
  "eigen-hunter": dynamic(() => import("@/components/arcade/games/EigenHunter"), { ssr: false, loading: Loading }),
};

export function GameView({ id, onFinish }: { id: GameId } & GameProps) {
  const Game = GAMES[id];
  return <Game onFinish={onFinish} />;
}
