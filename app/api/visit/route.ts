import { NextResponse } from "next/server";
import { createClient } from "@libsql/client";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

function getDb() {
  return createClient({
    url: process.env.TURSO_DATABASE_URL!,
    authToken: process.env.TURSO_AUTH_TOKEN,
  });
}

function toDate(d: Date) {
  return d.toISOString().split("T")[0];
}

export async function POST() {
  const db = getDb();
  const today = toDate(new Date());
  try {
    await db.execute({
      sql: `INSERT INTO PageVisit (date, count) VALUES (?, 1)
            ON CONFLICT(date) DO UPDATE SET count = count + 1`,
      args: [today],
    });
  } catch {
    // ignore
  } finally {
    db.close();
  }
  return NextResponse.json({ ok: true });
}

export async function GET() {
  const session = await getServerSession(authOptions);
  const user = session?.user as { role?: string } | undefined;
  if (!session || user?.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const db = getDb();
  try {
    const result = await db.execute("SELECT date, count FROM PageVisit ORDER BY date ASC");
    const all = result.rows.map(r => ({ date: r[0] as string, count: Number(r[1]) }));

    const now = new Date();
    const todayStr = toDate(now);

    const weekAgo = new Date(now); weekAgo.setDate(now.getDate() - 7);
    const monthAgo = new Date(now); monthAgo.setDate(now.getDate() - 30);
    const yearAgo = new Date(now); yearAgo.setFullYear(now.getFullYear() - 1);

    const sum = (from: Date) => all
      .filter(r => r.date >= toDate(from))
      .reduce((a, b) => a + b.count, 0);

    const today = all.find(r => r.date === todayStr)?.count ?? 0;
    const weekly = sum(weekAgo);
    const monthly = sum(monthAgo);
    const yearly = sum(yearAgo);
    const total = all.reduce((a, b) => a + b.count, 0);

    const chart = Array.from({ length: 30 }, (_, i) => {
      const d = new Date(now);
      d.setDate(now.getDate() - (29 - i));
      const key = toDate(d);
      return { date: key, count: all.find(r => r.date === key)?.count ?? 0 };
    });

    return NextResponse.json({ today, weekly, monthly, yearly, total, chart });
  } finally {
    db.close();
  }
}
