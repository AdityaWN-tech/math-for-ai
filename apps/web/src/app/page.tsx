import Link from "next/link";
import { ArrowRight, CheckCircle2, Code2, Database, Rocket } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--ink)]">
      <header className="mx-auto flex max-w-5xl items-center justify-between px-6 py-6">
        <p className="font-display text-2xl text-[var(--blueprint)]">Math for AI</p>
        <Link href="/demo">
          <Button size="sm">Try demo</Button>
        </Link>
      </header>

      <main className="mx-auto max-w-5xl px-6 pb-20">
        <section className="py-12">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-[var(--ink-mute)]">
            Read it · Build it · Deploy it · Own it
          </p>
          <h1 className="mt-4 max-w-3xl font-body text-4xl font-semibold leading-tight sm:text-5xl">
            Learn AI engineering in one flow — from linear algebra to live SaaS.
          </h1>
          <p className="mt-6 max-w-2xl font-body text-lg leading-relaxed text-[var(--ink-soft)]">
            No tab switching. No vibe coding. No disconnected textbooks. One workspace where you read,
            code, pass tests, deploy with a real database, and ship capstone products you own.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
          <Link href="/demo">
            <Button>
              Start free demo
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
            <Link href="/lessons">
              <Button variant="secondary">Browse catalog</Button>
            </Link>
          </div>
        </section>

        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { icon: Code2, title: "In-flow editor", desc: "Scrimba-style shell — code is the lesson." },
            { icon: CheckCircle2, title: "Mastery gates", desc: "Boot.dev-style tests before you advance." },
            { icon: Database, title: "Real deploy", desc: "Postgres, APIs, URLs — not toy sandboxes." },
            { icon: Rocket, title: "SaaS capstones", desc: "17+ production templates in your portfolio." },
          ].map(({ icon: Icon, title, desc }) => (
            <div
              key={title}
              className="rounded-md border border-[var(--rule-soft)] bg-[var(--bg-surface)] p-4 shadow-[var(--shadow-hard)]"
            >
              <Icon className="h-5 w-5 text-[var(--blueprint)]" />
              <h2 className="mt-3 font-body font-semibold">{title}</h2>
              <p className="mt-1 font-body text-sm text-[var(--ink-soft)]">{desc}</p>
            </div>
          ))}
        </section>

        <section className="mt-16 rounded-md border border-[var(--rule-soft)] bg-[var(--blueprint-tint)] p-8">
          <h2 className="font-body text-2xl font-semibold">Vertical slice live</h2>
          <p className="mt-2 max-w-xl font-body text-[var(--ink-soft)]">
            Lesson 01 — Linear Algebra Intuition: motto → problem → interactive figure → implement{" "}
            <code className="font-mono text-sm">dot_product</code> in Pyodide → ship artifact.
          </p>
          <Link href="/demo" className="mt-6 inline-block">
            <Button variant="secondary">Open lesson demo (~8 min)</Button>
          </Link>
        </section>
      </main>
    </div>
  );
}
