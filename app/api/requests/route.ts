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

function makeSlug(title: string) {
  return title.toLowerCase().replace(/[^a-z0-9\s]/g, "").replace(/\s+/g, "-").trim();
}

export async function GET() {
  const db = getDb();
  try {
    const result = await db.execute("SELECT * FROM MangaRequest ORDER BY votes DESC");
    const rows = result.rows.map(r => ({
      id: r[0], title: r[1], slug: r[2], description: r[3],
      requestedBy: r[4], requestedByName: r[5], votes: r[6],
      status: r[7], createdAt: r[8],
    }));
    return NextResponse.json(rows);
  } finally {
    db.close();
  }
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Giriş yapman gerekiyor" }, { status: 401 });

  const user = session.user as { id?: string; role?: string; username?: string; name?: string };
  const uid = user.role === "admin" ? -1 : Number(user.id);
  const username = user.username || user.name || "Kullanıcı";

  const { title, description } = await req.json();
  if (!title?.trim()) return NextResponse.json({ error: "Başlık gerekli" }, { status: 400 });

  const slug = makeSlug(title.trim());
  const db = getDb();

  try {
    // Aynı slug var mı?
    const existing = await db.execute({ sql: "SELECT id, slug FROM MangaRequest WHERE slug = ?", args: [slug] });
    if (existing.rows.length > 0) {
      const row = existing.rows[0];
      return NextResponse.json({ existing: true, id: row[0], slug: row[1] }, { status: 409 });
    }

    // Yeni istek oluştur
    const insert = await db.execute({
      sql: `INSERT INTO MangaRequest (title, slug, description, requestedBy, requestedByName, votes, status)
            VALUES (?, ?, ?, ?, ?, 1, 'pending')`,
      args: [title.trim(), slug, description?.trim() || null, uid, username],
    });

    const requestId = Number(insert.lastInsertRowid);

    // İlk oyu ver
    await db.execute({
      sql: "INSERT OR IGNORE INTO MangaRequestVote (requestId, userId) VALUES (?, ?)",
      args: [requestId, uid],
    });

    return NextResponse.json({ id: requestId, title: title.trim(), slug }, { status: 201 });
  } finally {
    db.close();
  }
}

export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions);
  const user = session?.user as { role?: string } | undefined;
  if (!session || user?.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await req.json();
  const db = getDb();
  try {
    await db.execute({ sql: "DELETE FROM MangaRequestVote WHERE requestId = ?", args: [id] });
    await db.execute({ sql: "DELETE FROM MangaRequest WHERE id = ?", args: [id] });
    return NextResponse.json({ success: true });
  } finally {
    db.close();
  }
}
