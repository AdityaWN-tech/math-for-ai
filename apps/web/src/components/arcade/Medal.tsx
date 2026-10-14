import type { MedalTier } from "@/lib/progress";
import { cn } from "@/lib/cn";

const TIER_COLORS: Record<MedalTier, { face: string; rim: string; ribbon: string }> = {
  bronze: { face: "#d08a4e", rim: "#8c5328", ribbon: "#c0392b" },
  silver: { face: "#d9dde3", rim: "#8a919c", ribbon: "#3553ff" },
  gold: { face: "#f5c542", rim: "#b8870f", ribbon: "#1a7f4b" },
};

export function Medal({
  tier,
  size = 40,
  className,
  label,
}: {
  tier: MedalTier | null;
  size?: number;
  className?: string;
  label?: string;
}) {
  const c = tier ? TIER_COLORS[tier] : { face: "transparent", rim: "currentColor", ribbon: "currentColor" };
  return (
    <svg
      viewBox="0 0 40 48"
      width={size}
      height={(size * 48) / 40}
      className={cn(!tier && "text-[var(--ink-mute)] opacity-40", className)}
      role="img"
      aria-label={label ?? (tier ? `${tier} medal` : "no medal yet")}
    >
      <path d="M10 0 L18 18 L14 20 L4 2 Z" fill={c.ribbon} opacity={tier ? 1 : 0.4} />
      <path d="M30 0 L22 18 L26 20 L36 2 Z" fill={c.ribbon} opacity={tier ? 0.8 : 0.4} />
      <circle cx="20" cy="31" r="14" fill={c.face} stroke={c.rim} strokeWidth="3" strokeDasharray={tier ? undefined : "3 3"} />
      {tier && (
        <>
          <circle cx="20" cy="31" r="9" fill="none" stroke={c.rim} strokeWidth="1.2" opacity="0.6" />
          <path
            d="M20 24.5 l1.9 3.9 4.3.6 -3.1 3 .7 4.3 -3.8-2 -3.8 2 .7-4.3 -3.1-3 4.3-.6z"
            fill={c.rim}
            opacity="0.85"
          />
        </>
      )}
    </svg>
  );
}
