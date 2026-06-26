import { NextResponse } from "next/server";
import { pingDatabase } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  const ping = await pingDatabase();
  return NextResponse.json(
    {
      service: "math-for-ai-db",
      status: ping.ok ? "healthy" : "unavailable",
      latencyMs: ping.latencyMs,
      postgres: ping.version,
      error: ping.error,
    },
    { status: ping.ok ? 200 : 503 },
  );
}
