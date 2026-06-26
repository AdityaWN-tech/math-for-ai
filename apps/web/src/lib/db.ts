import { Pool } from "pg";

let pool: Pool | null = null;

export function getPool(): Pool {
  if (!pool) {
    const connectionString =
      process.env.DATABASE_URL ?? "postgresql://m4ai:m4ai@localhost:5433/m4ai";
    pool = new Pool({ connectionString, max: 5, connectionTimeoutMillis: 5000 });
  }
  return pool;
}

export async function pingDatabase(): Promise<{
  ok: boolean;
  latencyMs: number;
  version?: string;
  error?: string;
}> {
  const start = Date.now();
  try {
    const client = await getPool().connect();
    try {
      const result = await client.query("SELECT version()");
      return {
        ok: true,
        latencyMs: Date.now() - start,
        version: String(result.rows[0]?.version ?? "").split(" ")[1],
      };
    } finally {
      client.release();
    }
  } catch (error) {
    return {
      ok: false,
      latencyMs: Date.now() - start,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

export async function provisionLearnerWorkspace(learnerId: string): Promise<{
  ok: boolean;
  table: string;
  rowCount: number;
  error?: string;
}> {
  const table = "learner_workspace";
  try {
    const client = await getPool().connect();
    try {
      await client.query(`
        CREATE TABLE IF NOT EXISTS ${table} (
          id SERIAL PRIMARY KEY,
          learner_id TEXT NOT NULL,
          lesson_id TEXT NOT NULL,
          artifact JSONB DEFAULT '{}',
          deployed_at TIMESTAMPTZ DEFAULT NOW(),
          UNIQUE (learner_id, lesson_id)
        )
      `);
      await client.query(
        `INSERT INTO ${table} (learner_id, lesson_id, artifact)
         VALUES ($1, $2, $3)
         ON CONFLICT (learner_id, lesson_id)
         DO UPDATE SET deployed_at = NOW(), artifact = EXCLUDED.artifact`,
        [learnerId, "07-docker-for-ai", JSON.stringify({ stack: "postgres+pgvector" })],
      );
      const count = await client.query(`SELECT COUNT(*)::int AS n FROM ${table}`);
      return { ok: true, table, rowCount: Number(count.rows[0]?.n ?? 0) };
    } finally {
      client.release();
    }
  } catch (error) {
    return {
      ok: false,
      table,
      rowCount: 0,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}
