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

export async function POST(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Giriş yapman gerekiyor" }, { status: 401 });

  const user = session.user as { id?: string; role?: string };
  const uid = user.role === "admin" ? -1 : Number(user.id);
  const { id } = await params;
  const requestId = Number(id);

  const db = getDb();
  try {
    const existing = await db.execute({
      sql: "SELECT id FROM MangaRequestVote WHERE requestId = ? AND userId = ?",
      args: [requestId, uid],
    });

    if (existing.rows.length > 0) {
      // Oyu geri al
      await db.execute({
        sql: "DELETE FROM MangaRequestVote WHERE requestId = ? AND userId = ?",
        args: [requestId, uid],
      });
      await db.execute({
        sql: "UPDATE MangaRequest SET votes = MAX(0, votes - 1) WHERE id = ?",
        args: [requestId],
      });
      return NextResponse.json({ voted: false });
    }

    // Oy ver
    await db.execute({
      sql: "INSERT OR IGNORE INTO MangaRequestVote (requestId, userId) VALUES (?, ?)",
      args: [requestId, uid],
    });
    await db.execute({
      sql: "UPDATE MangaRequest SET votes = votes + 1 WHERE id = ?",
      args: [requestId],
    });
    return NextResponse.json({ voted: true });
  } finally {
    db.close();
  }
}
