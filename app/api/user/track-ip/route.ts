import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { createClient } from "@libsql/client";

function getDb() {
  return createClient({
    url: process.env.TURSO_DATABASE_URL!,
    authToken: process.env.TURSO_AUTH_TOKEN,
  });
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ ok: false });

  const user = session.user as { id?: string; role?: string };
  if (user.role === "admin" || !user.id) return NextResponse.json({ ok: true });

  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "unknown";

  if (ip === "unknown") return NextResponse.json({ ok: true });

  const db = getDb();
  try {
    await db.execute({
      sql: "UPDATE SiteUser SET lastIp = ? WHERE id = ?",
      args: [ip, Number(user.id)],
    });
  } finally {
    db.close();
  }

  return NextResponse.json({ ok: true });
}
