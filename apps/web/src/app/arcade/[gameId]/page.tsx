import { notFound } from "next/navigation";
import { ArcadeHeader } from "@/components/arcade/ArcadeHeader";
import { GameFrame } from "@/components/arcade/GameFrame";
import { gameById, GAMES } from "@/lib/arcade/catalog";

interface PageProps {
  params: Promise<{ gameId: string }>;
}

export function generateStaticParams() {
  return GAMES.map((g) => ({ gameId: g.id }));
}

export async function generateMetadata({ params }: PageProps) {
  const game = gameById((await params).gameId);
  return { title: game ? `${game.title} — Math Arcade` : "Math Arcade" };
}

export default async function GamePage({ params }: PageProps) {
  const game = gameById((await params).gameId);
  if (!game) notFound();

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--ink)]">
      <ArcadeHeader crumb={{ href: `/arcade/${game.id}`, label: game.title }} />
      <GameFrame game={game} />
    </div>
  );
}
