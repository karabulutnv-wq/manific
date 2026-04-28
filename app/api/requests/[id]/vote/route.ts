/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

const db = prisma as any;

export async function POST(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Giriş yapman gerekiyor" }, { status: 401 });

  const user = session.user as any;
  const uid = user.role === "admin" ? -1 : Number(user.id);
  const { id } = await params;
  const requestId = Number(id);

  // Daha önce oy vermiş mi?
  const existing = await db.mangaRequestVote.findFirst({
    where: { requestId, userId: uid },
  });

  if (existing) {
    // Oyu geri al
    await db.mangaRequestVote.delete({ where: { id: existing.id } });
    await db.mangaRequest.update({ where: { id: requestId }, data: { votes: { decrement: 1 } } });
    return NextResponse.json({ voted: false });
  }

  // Oy ver
  await db.mangaRequestVote.create({ data: { requestId, userId: uid } });
  await db.mangaRequest.update({ where: { id: requestId }, data: { votes: { increment: 1 } } });
  return NextResponse.json({ voted: true });
}
