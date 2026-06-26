import { NextResponse } from "next/server";
import { mkdir, appendFile } from "fs/promises";
import path from "path";
import { getPool } from "@/lib/db";

export const dynamic = "force-dynamic";

async function saveToFile(email: string) {
  const dir = path.join(process.cwd(), "data");
  await mkdir(dir, { recursive: true });
  const line = JSON.stringify({ email, at: new Date().toISOString() }) + "\n";
  await appendFile(path.join(dir, "waitlist.jsonl"), line, "utf8");
}

async function saveToDb(email: string) {
  const client = await getPool().connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS waitlist (
        id SERIAL PRIMARY KEY,
        email TEXT NOT NULL UNIQUE,
        created_at TIMESTAMPTZ DEFAULT NOW()
      )
    `);
    await client.query(
      `INSERT INTO waitlist (email) VALUES ($1) ON CONFLICT (email) DO NOTHING`,
      [email],
    );
    return true;
  } finally {
    client.release();
  }
}

export async function POST(request: Request) {
  let body: { email?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON" }, { status: 400 });
  }

  const email = body.email?.trim().toLowerCase();
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ ok: false, error: "Valid email required" }, { status: 400 });
  }

  try {
    await saveToDb(email);
    return NextResponse.json({ ok: true, storage: "postgres" });
  } catch {
    await saveToFile(email);
    return NextResponse.json({ ok: true, storage: "file" });
  }
}
