/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

const db = prisma as any;

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

  const profiles = await db.profile.findMany({
    where: { userId: uid },
    orderBy: { createdAt: "asc" },
  });
  return NextResponse.json(profiles);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  const uid = getUid(session);
  if (uid === null) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const count = await db.profile.count({ where: { userId: uid } });
  if (count >= 4) return NextResponse.json({ error: "Maksimum 4 profil ekleyebilirsin" }, { status: 400 });

  const { name } = await req.json();
  if (!name?.trim()) return NextResponse.json({ error: "İsim gerekli" }, { status: 400 });

  const profile = await db.profile.create({
    data: { userId: uid, name: name.trim() },
  });
  return NextResponse.json(profile, { status: 201 });
}

export async function PUT(req: NextRequest) {
  const session = await getServerSession(authOptions);
  const uid = getUid(session);
  if (uid === null) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id, name, avatar, setActive } = await req.json();
  const profile = await db.profile.findUnique({ where: { id: Number(id) } });
  if (!profile || profile.userId !== uid) {
    return NextResponse.json({ error: "Bulunamadı" }, { status: 404 });
  }

  if (setActive) {
    await db.profile.updateMany({ where: { userId: uid }, data: { isActive: false } });
    const updated = await db.profile.update({ where: { id: Number(id) }, data: { isActive: true } });
    if (uid > 0 && updated.avatar) {
      await prisma.siteUser.update({ where: { id: uid }, data: { avatar: updated.avatar } });
    }
    return NextResponse.json({ success: true });
  }

  const updated = await db.profile.update({
    where: { id: Number(id) },
    data: { ...(name && { name }), ...(avatar !== undefined && { avatar }) },
  });

  if (uid > 0 && updated.isActive && avatar) {
    await prisma.siteUser.update({ where: { id: uid }, data: { avatar } });
  }

  return NextResponse.json(updated);
}

export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions);
  const uid = getUid(session);
  if (uid === null) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await req.json();
  const profile = await db.profile.findUnique({ where: { id: Number(id) } });
  if (!profile || profile.userId !== uid) {
    return NextResponse.json({ error: "Bulunamadı" }, { status: 404 });
  }

  await db.profile.delete({ where: { id: Number(id) } });
  return NextResponse.json({ success: true });
}
