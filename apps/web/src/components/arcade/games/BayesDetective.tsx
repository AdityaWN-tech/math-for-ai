"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { GameHUD, type GameProps, pick, shuffle, Slider, useThemeColors } from "@/components/arcade/games/shared";

const CASE_POINTS = 20;
const POPULATION = 1000;
const COLS = 40;

interface CaseTemplate {
  title: string;
  icon: string;
  setup: (p: CaseNumbers) => string;
  hypothesis: string; // "the email is spam"
  priors: number[];
  sensitivities: number[];
  falseAlarms: number[];
}

interface CaseNumbers {
  prior: number;
  sens: number;
  fpr: number;
}

const pct = (v: number) => `${+(v * 100).toFixed(1)}%`;

const TEMPLATES: CaseTemplate[] = [
  {
    title: "The Rare Disease",
    icon: "🩺",
    hypothesis: "the patient is sick",
    setup: ({ prior, sens, fpr }) =>
      `${pct(prior)} of people have the disease. The test catches ${pct(sens)} of sick people, but also flags ${pct(fpr)} of healthy people. A patient tests positive.`,
    priors: [0.01, 0.02, 0.005],
    sensitivities: [0.9, 0.95, 0.99],
    falseAlarms: [0.05, 0.09, 0.03],
  },
  {
    title: "The Suspicious Email",
    icon: "📧",
    hypothesis: "the email is spam",
    setup: ({ prior, sens, fpr }) =>
      `${pct(prior)} of inbox mail is spam. The word "FREE" appears in ${pct(sens)} of spam and ${pct(fpr)} of normal mail. This email says FREE.`,
    priors: [0.3, 0.4, 0.2],
    sensitivities: [0.4, 0.5, 0.6],
    falseAlarms: [0.05, 0.1, 0.08],
  },
  {
    title: "The Fraud Alarm",
    icon: "💳",
    hypothesis: "the payment is fraud",
    setup: ({ prior, sens, fpr }) =>
      `Only ${pct(prior)} of payments are fraud. The model flags ${pct(sens)} of fraud, and ${pct(fpr)} of honest payments by mistake. A payment gets flagged.`,
    priors: [0.005, 0.01, 0.002],
    sensitivities: [0.95, 0.9],
    falseAlarms: [0.02, 0.01, 0.05],
  },
  {
    title: "The AI Essay Detector",
    icon: "🤖",
    hypothesis: "the essay is AI-written",
    setup: ({ prior, sens, fpr }) =>
      `${pct(prior)} of essays in this class are AI-written. The detector flags ${pct(sens)} of those, and ${pct(fpr)} of human essays too. An essay is flagged.`,
    priors: [0.2, 0.1, 0.3],
    sensitivities: [0.8, 0.9, 0.7],
    falseAlarms: [0.1, 0.15, 0.05],
  },
  {
    title: "The Night Taxi",
    icon: "🚕",
    hypothesis: "the taxi really was blue",
    setup: ({ prior, sens, fpr }) =>
      `${pct(prior)} of the city's taxis are blue, the rest green. A witness says "blue". Witnesses say blue for ${pct(sens)} of blue taxis and ${pct(fpr)} of green ones.`,
    priors: [0.15, 0.2, 0.1],
    sensitivities: [0.8, 0.85],
    falseAlarms: [0.2, 0.15],
  },
];

function posterior({ prior, sens, fpr }: CaseNumbers) {
  return (sens * prior) / (sens * prior + fpr * (1 - prior));
}

export default function BayesDetective({ onFinish }: GameProps) {
  const colors = useThemeColors();
  const cases = useMemo(
    () =>
      shuffle(TEMPLATES).map((t) => ({
        t,
        n: { prior: pick(t.priors), sens: pick(t.sensitivities), fpr: pick(t.falseAlarms) },
      })),
    [],
  );
  const [round, setRound] = useState(0);
  const [score, setScore] = useState(0);
  const [guess, setGuess] = useState(50);
  const [revealed, setRevealed] = useState<number | null>(null);

  const { t, n } = cases[Math.min(round, cases.length - 1)];
  const truth = posterior(n);

  const counts = useMemo(() => {
    const guilty = Math.round(POPULATION * n.prior);
    const tp = Math.round(guilty * n.sens);
    const fp = Math.round((POPULATION - guilty) * n.fpr);
    return { guilty, tp, fn: guilty - tp, fp, tn: POPULATION - guilty - fp };
  }, [n]);

  const lockIn = () => {
    const err = Math.abs(guess / 100 - truth);
    const pts = Math.round(CASE_POINTS * Math.max(0, 1 - Math.max(0, err - 0.03) / 0.25));
    setScore((s) => s + pts);
    setRevealed(pts);
  };

  const next = () => {
    if (round + 1 >= cases.length) {
      onFinish(score);
      return;
    }
    setRound(round + 1);
    setGuess(50);
    setRevealed(null);
  };

  // dot order: true positives, false negatives, false positives, true negatives
  const dotColor = (i: number) => {
    if (i < counts.tp) return { fill: colors.b, stroke: "none" };
    if (i < counts.guilty) return { fill: "none", stroke: colors.b };
    if (i < counts.guilty + counts.fp) return { fill: colors.gold, stroke: "none" };
    return { fill: colors.mute, stroke: "none", opacity: 0.25 };
  };

  return (
    <div className="space-y-3">
      <GameHUD round={round} rounds={cases.length} score={score} />
      <div className="grid gap-4 lg:grid-cols-[1fr_340px]">
        <div className="rounded-md border border-[var(--rule-soft)] bg-[var(--bg-surface)] p-5">
          <p className="font-mono text-[10px] uppercase tracking-widest text-[var(--blueprint)]">
            Case {round + 1} · {t.icon} {t.title}
          </p>
          <p className="mt-2 font-body text-lg leading-relaxed">{t.setup(n)}</p>
          <p className="mt-3 font-body font-semibold">What&apos;s the chance {t.hypothesis}?</p>

          {revealed !== null && (
            <div className="m4ai-pop mt-5">
              <svg viewBox={`0 0 ${COLS * 10} ${(POPULATION / COLS) * 10}`} className="w-full" role="img" aria-label="1000 cases as dots">
                {Array.from({ length: POPULATION }, (_, i) => {
                  const c = dotColor(i);
                  return (
                    <circle
                      key={i}
                      cx={(i % COLS) * 10 + 5}
                      cy={Math.floor(i / COLS) * 10 + 5}
                      r={3.4}
                      fill={c.fill}
                      stroke={c.stroke}
                      strokeWidth={1.2}
                      opacity={c.opacity ?? 1}
                    />
                  );
                })}
              </svg>
              <div className="mt-3 grid grid-cols-2 gap-2 font-mono text-xs">
                <span style={{ color: colors.b }}>● {counts.tp} true alarms</span>
                <span style={{ color: colors.gold }}>● {counts.fp} false alarms</span>
                <span style={{ color: colors.b }}>○ {counts.fn} missed</span>
                <span className="text-[var(--ink-mute)]">● {counts.tn} quiet & innocent</span>
              </div>
              <p className="mt-3 font-body">
                Of the <strong>{counts.tp + counts.fp}</strong> alarms, only <strong>{counts.tp}</strong> are real:{" "}
                {counts.tp} / {counts.tp + counts.fp} ≈ <strong>{pct(truth)}</strong>.
              </p>
            </div>
          )}
        </div>

        <div className="space-y-4 rounded-md border border-[var(--rule-soft)] p-4">
          <Slider
            label="your estimate"
            value={guess}
            min={0}
            max={100}
            step={1}
            onChange={setGuess}
            format={(v) => `${v}%`}
            disabled={revealed !== null}
          />
          {revealed === null ? (
            <Button className="w-full" onClick={lockIn}>
              Accuse
            </Button>
          ) : (
            <>
              <div className="rounded-md bg-[var(--blueprint-tint)] p-3 font-mono text-sm">
                <p>truth: {pct(truth)}</p>
                <p>you: {guess}%</p>
                <p className="font-semibold text-[var(--blueprint)]">+{revealed} pts</p>
              </div>
              <Button className="w-full" onClick={next}>
                {round + 1 >= cases.length ? "Close the case file" : "Next case"}
              </Button>
            </>
          )}
          <p className="font-mono text-[11px] leading-relaxed text-[var(--ink-mute)]">
            P(H|E) = P(E|H)·P(H) / P(E)
            <br />
            Tip: picture 1,000 cases. Count the true alarms and the false alarms.
          </p>
        </div>
      </div>
    </div>
  );
}
