import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@libsql/client";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

function getDb() {
  return createClient({
    url: process.env.TURSO_DATABASE_URL!,
    authToken: process.env.TURSO_AUTH_TOKEN,
  });
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getUid(session: any): number | null {
  const user = session?.user;
  if (!user) return null;
  if (user.role === "admin") return -1;
  return user.id ? Number(user.id) : null;
}

export async function GET() {
  const session = await getServerSession(authOptions);
  const uid = getUid(session);
  if (uid === null) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const db = getDb();
  try {
    const r = await db.execute({ sql: "SELECT * FROM Profile WHERE userId = ? ORDER BY createdAt ASC", args: [uid] });
    const profiles = r.rows.map(row => ({
      id: row[0], userId: row[1], name: row[2], avatar: row[3],
      isActive: Boolean(row[4]), createdAt: row[5],
    }));
    return NextResponse.json(profiles);
  } finally { db.close(); }
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  const uid = getUid(session);
  if (uid === null) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const db = getDb();
  try {
    const count = await db.execute({ sql: "SELECT COUNT(*) FROM Profile WHERE userId = ?", args: [uid] });
    if (Number(count.rows[0][0]) >= 4) return NextResponse.json({ error: "Maksimum 4 profil ekleyebilirsin" }, { status: 400 });

    const { name } = await req.json();
    if (!name?.trim()) return NextResponse.json({ error: "İsim gerekli" }, { status: 400 });

    const r = await db.execute({ sql: "INSERT INTO Profile (userId, name) VALUES (?, ?)", args: [uid, name.trim()] });
    return NextResponse.json({ id: Number(r.lastInsertRowid), userId: uid, name: name.trim(), avatar: null, isActive: false }, { status: 201 });
  } finally { db.close(); }
}

export async function PUT(req: NextRequest) {
  const session = await getServerSession(authOptions);
  const uid = getUid(session);
  if (uid === null) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id, name, avatar, setActive } = await req.json();
  const db = getDb();
  try {
    const check = await db.execute({ sql: "SELECT userId FROM Profile WHERE id = ?", args: [id] });
    if (!check.rows.length || Number(check.rows[0][0]) !== uid) return NextResponse.json({ error: "Bulunamadı" }, { status: 404 });

    if (setActive) {
      await db.execute({ sql: "UPDATE Profile SET isActive = 0 WHERE userId = ?", args: [uid] });
      await db.execute({ sql: "UPDATE Profile SET isActive = 1 WHERE id = ?", args: [id] });
      const updated = await db.execute({ sql: "SELECT avatar FROM Profile WHERE id = ?", args: [id] });
      const av = updated.rows[0]?.[0] as string | null;
      if (uid > 0 && av) await prisma.siteUser.update({ where: { id: uid }, data: { avatar: av } });
      return NextResponse.json({ success: true });
    }

    if (name) await db.execute({ sql: "UPDATE Profile SET name = ? WHERE id = ?", args: [name, id] });
    if (avatar !== undefined) {
      await db.execute({ sql: "UPDATE Profile SET avatar = ? WHERE id = ?", args: [avatar, id] });
      const isActive = await db.execute({ sql: "SELECT isActive FROM Profile WHERE id = ?", args: [id] });
      if (uid > 0 && Number(isActive.rows[0]?.[0]) === 1) {
        await prisma.siteUser.update({ where: { id: uid }, data: { avatar } });
      }
    }
    return NextResponse.json({ success: true });
  } finally { db.close(); }
}

export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions);
  const uid = getUid(session);
  if (uid === null) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await req.json();
  const db = getDb();
  try {
    const check = await db.execute({ sql: "SELECT userId FROM Profile WHERE id = ?", args: [id] });
    if (!check.rows.length || Number(check.rows[0][0]) !== uid) return NextResponse.json({ error: "Bulunamadı" }, { status: 404 });
    await db.execute({ sql: "DELETE FROM Profile WHERE id = ?", args: [id] });
    return NextResponse.json({ success: true });
  } finally { db.close(); }
}
