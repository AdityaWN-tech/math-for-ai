"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { track } from "@/lib/analytics";

export function WaitlistForm({ className }: { className?: string }) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [message, setMessage] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    setMessage("");

    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed");

      setStatus("done");
      setMessage("You're on the list. We'll email you when Pro + Deploy tiers open.");
      track("waitlist_signup", { email_domain: email.split("@")[1] });
      setEmail("");
    } catch (err) {
      setStatus("error");
      setMessage(err instanceof Error ? err.message : "Something went wrong");
    }
  }

  return (
    <form onSubmit={submit} className={className}>
      <div className="flex flex-col gap-2 sm:flex-row">
        <input
          type="email"
          required
          placeholder="you@company.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={status === "loading" || status === "done"}
          className="h-10 flex-1 rounded-md border border-[var(--rule-soft)] bg-[var(--bg)] px-3 font-mono text-sm outline-none focus:border-[var(--blueprint)]"
        />
        <Button type="submit" disabled={status === "loading" || status === "done"}>
          {status === "loading" ? "Joining…" : status === "done" ? "Joined" : "Join waitlist"}
        </Button>
      </div>
      {message && (
        <p
          className={`mt-2 font-body text-sm ${status === "error" ? "text-red-600" : "text-[var(--ink-soft)]"}`}
        >
          {message}
        </p>
      )}
    </form>
  );
}
