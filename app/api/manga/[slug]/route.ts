import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(_: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const manga = await prisma.manga.findUnique({
    where: { slug },
    include: { chapters: { orderBy: { number: "asc" } } },
  });
  if (!manga) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(manga);
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { slug } = await params;
  const body = await req.json();
  const manga = await prisma.manga.update({
    where: { slug },
    data: body,
  });
  return NextResponse.json(manga);
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { slug } = await params;
  await prisma.manga.delete({ where: { slug } });
  return NextResponse.json({ success: true });
}
