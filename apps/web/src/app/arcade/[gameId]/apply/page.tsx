import { notFound } from "next/navigation";
import { ApplyMission } from "@/components/arcade/ApplyMission";
import { ArcadeHeader } from "@/components/arcade/ArcadeHeader";
import { gameById, GAMES } from "@/lib/arcade/catalog";

interface PageProps {
  params: Promise<{ gameId: string }>;
}

export function generateStaticParams() {
  return GAMES.map((g) => ({ gameId: g.id }));
}

export async function generateMetadata({ params }: PageProps) {
  const game = gameById((await params).gameId);
  return { title: game ? `Apply it: ${game.apply.title} — Math Arcade` : "Math Arcade" };
}

export default async function ApplyPage({ params }: PageProps) {
  const game = gameById((await params).gameId);
  if (!game) notFound();

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--ink)]">
      <ArcadeHeader crumb={{ href: `/arcade/${game.id}`, label: game.title }} />
      <ApplyMission game={game} />
    </div>
  );
}
