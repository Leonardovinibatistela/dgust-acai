import { db } from "@/db";
import { sql } from "drizzle-orm";
import { seedIfEmpty } from "@/db/seed";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    // Ensure the database connection works
    await db.execute(sql`select 1`);
    
    // Auto seed database if it's empty
    await seedIfEmpty();

    return Response.json({ ok: true, seeded: true });
  } catch (error: any) {
    return Response.json({ ok: false, error: error?.message || error }, { status: 500 });
  }
}
