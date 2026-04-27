import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET() {
  const avatars = await prisma.avatar.findMany({ orderBy: { createdAt: "desc" } });
  return NextResponse.json(avatars);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as { role?: string }).role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { url, name } = await req.json();
  const avatar = await prisma.avatar.create({ data: { url, name } });
  return NextResponse.json(avatar, { status: 201 });
}

export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as { role?: string }).role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await req.json();
  await prisma.avatar.delete({ where: { id: Number(id) } });
  return NextResponse.json({ success: true });
}
