import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { mangaId, number, title, pages } = body;

  if (!mangaId || !number || !pages) {
    return NextResponse.json({ error: "mangaId, number and pages required" }, { status: 400 });
  }

  const chapter = await prisma.chapter.create({
    data: {
      mangaId: Number(mangaId),
      number: Number(number),
      title,
      pages: JSON.stringify(pages),
    },
  });

  await prisma.manga.update({
    where: { id: Number(mangaId) },
    data: { updatedAt: new Date() },
  });

  return NextResponse.json(chapter, { status: 201 });
}
