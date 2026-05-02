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

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if ((session?.user as { role?: string })?.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const userId = Number(id);
  const db = getDb();

  try {
    // Kullanıcıya ait tüm verileri sil
    await db.execute({ sql: "DELETE FROM Profile WHERE userId = ?", args: [userId] });
    await db.execute({ sql: "DELETE FROM MangaRequestVote WHERE userId = ?", args: [userId] });
    // Yorumları sil
    await prisma.comment.deleteMany({ where: { userId } });
    // Kullanıcıyı sil
    await prisma.siteUser.delete({ where: { id: userId } });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Kullanıcı silinemedi" }, { status: 500 });
  } finally {
    db.close();
  }
}
