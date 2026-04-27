import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET() {
  const mangas = await prisma.manga.findMany({
    orderBy: { updatedAt: "desc" },
    include: { _count: { select: { chapters: true } } },
  });
  return NextResponse.json(mangas);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { title, description, genre, status, author, cover } = body;

  if (!title) return NextResponse.json({ error: "Title required" }, { status: 400 });

  const slug = title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .trim();

  const manga = await prisma.manga.create({
    data: { title, slug, description, genre, status, author, cover },
  });
  return NextResponse.json(manga, { status: 201 });
}
