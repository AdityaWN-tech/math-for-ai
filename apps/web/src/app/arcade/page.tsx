import { ArcadeHeader } from "@/components/arcade/ArcadeHeader";
import { ArcadeHub } from "@/components/arcade/ArcadeHub";

export const metadata = {
  title: "Math Arcade — Math for AI",
  description: "Play the math behind AI: 3D vector and matrix games, gradient-descent golf, Bayes puzzles. Win medals, then apply it in code.",
};

export default function ArcadePage() {
  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--ink)]">
      <ArcadeHeader />
      <ArcadeHub />
    </div>
  );
}
