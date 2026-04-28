import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const chapterId = req.nextUrl.searchParams.get("chapterId");
  if (!chapterId) return NextResponse.json({ error: "chapterId required" }, { status: 400 });

  const comments = await prisma.comment.findMany({
    where: { chapterId: Number(chapterId) },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(comments);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Giriş yapman gerekiyor" }, { status: 401 });

  const user = session.user as { id?: string; username?: string; name?: string; avatar?: string; role?: string; activeProfileName?: string };
  // Admin de yorum yapabilir

  const { chapterId, content } = await req.json();
  if (!chapterId || !content?.trim()) {
    return NextResponse.json({ error: "Yorum boş olamaz" }, { status: 400 });
  }

  // Aktif profil avatarını kullan
  let avatarToUse = user.avatar || null;
  if (user.id && user.role !== "admin") {
    const activeProfile = await prisma.profile.findFirst({
      where: { userId: Number(user.id), isActive: true },
    });
    if (activeProfile?.avatar) avatarToUse = activeProfile.avatar;
  }

  const comment = await prisma.comment.create({
    data: {
      chapterId: Number(chapterId),
      userId: user.role === "admin" ? 0 : Number(user.id),
      username: user.username || user.name || user.activeProfileName || "Admin",
      avatar: avatarToUse,
      content: content.trim(),
    },
  });
  return NextResponse.json(comment, { status: 201 });
}

export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await req.json();
  const user = session.user as { id?: string; role?: string };
  const comment = await prisma.comment.findUnique({ where: { id: Number(id) } });

  if (!comment) return NextResponse.json({ error: "Bulunamadı" }, { status: 404 });
  if (user.role !== "admin" && comment.userId !== Number(user.id)) {
    return NextResponse.json({ error: "Yetkisiz" }, { status: 403 });
  }

  await prisma.comment.delete({ where: { id: Number(id) } });
  return NextResponse.json({ success: true });
}
