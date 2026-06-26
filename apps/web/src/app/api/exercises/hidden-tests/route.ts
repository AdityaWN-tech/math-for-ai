import { readFile } from "fs/promises";
import path from "path";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const HIDDEN_DIR = path.join(process.cwd(), "src/content/exercises/hidden");

export async function POST(req: Request) {
  let body: { lessonId?: string; visiblePassed?: boolean };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON" }, { status: 400 });
  }

  const { lessonId, visiblePassed } = body;
  if (!lessonId || !visiblePassed) {
    return NextResponse.json(
      { ok: false, error: "lessonId and visiblePassed required" },
      { status: 400 },
    );
  }

  const safe = lessonId.replace(/[^a-zA-Z0-9-]/g, "");
  const filePath = path.join(HIDDEN_DIR, `${safe}.json`);

  try {
    const raw = await readFile(filePath, "utf8");
    const data = JSON.parse(raw) as { tests: string };
    return NextResponse.json({ ok: true, tests: data.tests });
  } catch {
    return NextResponse.json({ ok: false, error: "No hidden harness for lesson" }, { status: 404 });
  }
}
