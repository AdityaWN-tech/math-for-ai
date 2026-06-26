import { mkdir, readFile, writeFile } from "fs/promises";
import path from "path";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const DATA_DIR = path.join(process.cwd(), ".data", "progress");

async function filePath(deviceId: string) {
  const safe = deviceId.replace(/[^a-zA-Z0-9-]/g, "");
  await mkdir(DATA_DIR, { recursive: true });
  return path.join(DATA_DIR, `${safe}.json`);
}

export async function GET(req: Request) {
  const deviceId = new URL(req.url).searchParams.get("deviceId");
  if (!deviceId) {
    return NextResponse.json({ ok: false, error: "deviceId required" }, { status: 400 });
  }

  try {
    const raw = await readFile(await filePath(deviceId), "utf8");
    return NextResponse.json({ ok: true, state: JSON.parse(raw) });
  } catch {
    return NextResponse.json({ ok: true, state: null });
  }
}

export async function POST(req: Request) {
  let body: { deviceId?: string; state?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON" }, { status: 400 });
  }

  const { deviceId, state } = body;
  if (!deviceId || !state || typeof state !== "object") {
    return NextResponse.json({ ok: false, error: "deviceId and state required" }, { status: 400 });
  }

  try {
    const fp = await filePath(deviceId);
    const payload = { ...(state as object), syncedAt: Date.now() };
    await writeFile(fp, JSON.stringify(payload, null, 2), "utf8");
    return NextResponse.json({ ok: true, syncedAt: payload.syncedAt });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "write failed";
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}
