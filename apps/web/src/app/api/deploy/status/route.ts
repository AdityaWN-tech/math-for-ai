import { NextResponse } from "next/server";
import { pingDatabase } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  const ping = await pingDatabase();
  return NextResponse.json({
    database: ping,
    composeHint: "Run `npm run infra:up` from the project root if Postgres is not running.",
  });
}
