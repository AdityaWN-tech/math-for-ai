import { ArcadeHeader } from "@/components/arcade/ArcadeHeader";
import { TrophyRoom } from "@/components/arcade/TrophyRoom";

export const metadata = { title: "Trophy room — Math Arcade" };

export default function TrophiesPage() {
  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--ink)]">
      <ArcadeHeader crumb={{ href: "/arcade/trophies", label: "Trophy room" }} />
      <TrophyRoom />
    </div>
  );
}
