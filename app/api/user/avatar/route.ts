import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PUT(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as { role?: string }).role !== "user") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { avatarUrl } = await req.json();
  const userId = Number((session.user as { id?: string }).id);

  await prisma.siteUser.update({
    where: { id: userId },
    data: { avatar: avatarUrl },
  });

  return NextResponse.json({ success: true });
}
