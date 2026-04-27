import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

function getUser(session: ReturnType<typeof Object.create>) {
  return session?.user as { id?: string; role?: string } | undefined;
}

export async function GET() {
  const session = await getServerSession(authOptions);
  const user = getUser(session);
  if (!session || !user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const profiles = await prisma.profile.findMany({
    where: { userId: Number(user.id) },
    orderBy: { createdAt: "asc" },
  });
  return NextResponse.json(profiles);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  const user = getUser(session);
  if (!session || !user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const count = await prisma.profile.count({ where: { userId: Number(user.id) } });
  if (count >= 4) return NextResponse.json({ error: "Maksimum 4 profil ekleyebilirsin" }, { status: 400 });

  const { name } = await req.json();
  if (!name?.trim()) return NextResponse.json({ error: "İsim gerekli" }, { status: 400 });

  const profile = await prisma.profile.create({
    data: { userId: Number(user.id), name: name.trim() },
  });
  return NextResponse.json(profile, { status: 201 });
}

export async function PUT(req: NextRequest) {
  const session = await getServerSession(authOptions);
  const user = getUser(session);
  if (!session || !user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id, name, avatar, setActive } = await req.json();
  const profile = await prisma.profile.findUnique({ where: { id: Number(id) } });
  if (!profile || profile.userId !== Number(user.id)) {
    return NextResponse.json({ error: "Bulunamadı" }, { status: 404 });
  }

  if (setActive) {
    // Önce hepsini pasif yap
    await prisma.profile.updateMany({ where: { userId: Number(user.id) }, data: { isActive: false } });
    await prisma.profile.update({ where: { id: Number(id) }, data: { isActive: true } });
    // Aktif profilin avatarını SiteUser'a da yaz
    const updated = await prisma.profile.findUnique({ where: { id: Number(id) } });
    if (updated?.avatar) {
      await prisma.siteUser.update({ where: { id: Number(user.id) }, data: { avatar: updated.avatar } });
    }
    return NextResponse.json({ success: true });
  }

  const updated = await prisma.profile.update({
    where: { id: Number(id) },
    data: { ...(name && { name }), ...(avatar !== undefined && { avatar }) },
  });

  // Eğer aktif profil ise SiteUser avatar'ını da güncelle
  if (updated.isActive && avatar) {
    await prisma.siteUser.update({ where: { id: Number(user.id) }, data: { avatar } });
  }

  return NextResponse.json(updated);
}

export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions);
  const user = getUser(session);
  if (!session || !user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await req.json();
  const profile = await prisma.profile.findUnique({ where: { id: Number(id) } });
  if (!profile || profile.userId !== Number(user.id)) {
    return NextResponse.json({ error: "Bulunamadı" }, { status: 404 });
  }

  await prisma.profile.delete({ where: { id: Number(id) } });
  return NextResponse.json({ success: true });
}
