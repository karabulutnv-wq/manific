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

function isAdmin(session: ReturnType<typeof Object.create>) {
  return (session?.user as { role?: string })?.role === "admin";
}

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!isAdmin(session)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const db = getDb();
  try {
    const r = await db.execute("SELECT * FROM IpBan ORDER BY createdAt DESC");
    return NextResponse.json(r.rows.map(row => ({ id: row[0], ip: row[1], reason: row[2], createdAt: row[3] })));
  } finally { db.close(); }
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!isAdmin(session)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { ip, reason } = await req.json();
  if (!ip?.trim()) return NextResponse.json({ error: "IP gerekli" }, { status: 400 });

  const db = getDb();
  try {
    await db.execute({
      sql: "INSERT OR IGNORE INTO IpBan (ip, reason) VALUES (?, ?)",
      args: [ip.trim(), reason?.trim() || null],
    });
    return NextResponse.json({ success: true });
  } finally { db.close(); }
}

export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!isAdmin(session)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await req.json();
  const db = getDb();
  try {
    await db.execute({ sql: "DELETE FROM IpBan WHERE id = ?", args: [id] });
    return NextResponse.json({ success: true });
  } finally { db.close(); }
}
