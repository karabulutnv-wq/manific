/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

const db = prisma as any;

function makeSlug(title: string) {
  return title.toLowerCase().replace(/[^a-z0-9\s]/g, "").replace(/\s+/g, "-").trim();
}

export async function GET() {
  const requests = await db.mangaRequest.findMany({
    orderBy: { votes: "desc" },
  });
  return NextResponse.json(requests);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Giriş yapman gerekiyor" }, { status: 401 });

  const user = session.user as any;
  const uid = user.role === "admin" ? -1 : Number(user.id);

  const { title, description } = await req.json();
  if (!title?.trim()) return NextResponse.json({ error: "Başlık gerekli" }, { status: 400 });

  const slug = makeSlug(title.trim());

  // Aynı isimde istek var mı?
  const existing = await db.mangaRequest.findUnique({ where: { slug } });
  if (existing) {
    return NextResponse.json({ existing: true, id: existing.id, slug: existing.slug }, { status: 409 });
  }

  const request = await db.mangaRequest.create({
    data: {
      title: title.trim(),
      slug,
      description: description?.trim() || null,
      requestedBy: uid,
      requestedByName: user.username || user.name || "Kullanıcı",
      votes: 1,
    },
  });

  // İlk oyu oluşturana ver
  await db.mangaRequestVote.create({
    data: { requestId: request.id, userId: uid },
  });

  return NextResponse.json(request, { status: 201 });
}
