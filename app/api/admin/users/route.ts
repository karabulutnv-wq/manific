import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@libsql/client";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

function getDb() {
  return createClient({
    url: process.env.TURSO_DATABASE_URL!,
    authToken: process.env.TURSO_AUTH_TOKEN,
  });
}

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if ((session?.user as { role?: string })?.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const q = req.nextUrl.searchParams.get("q") || "";
  const db = getDb();
  try {
    const r = await db.execute({
      sql: q
        ? "SELECT id, username, email, lastIp, createdAt FROM SiteUser WHERE username LIKE ? OR email LIKE ? ORDER BY createdAt DESC"
        : "SELECT id, username, email, lastIp, createdAt FROM SiteUser ORDER BY createdAt DESC LIMIT 50",
      args: q ? [`%${q}%`, `%${q}%`] : [],
    });
    return NextResponse.json(r.rows.map(row => ({
      id: row[0], username: row[1], email: row[2], lastIp: row[3], createdAt: row[4],
    })));
  } finally {
    db.close();
  }
}
