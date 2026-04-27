import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(req: NextRequest) {
  const { username, email, password } = await req.json();

  if (!username || !email || !password) {
    return NextResponse.json({ error: "Tüm alanlar zorunlu" }, { status: 400 });
  }
  if (password.length < 6) {
    return NextResponse.json({ error: "Şifre en az 6 karakter olmalı" }, { status: 400 });
  }

  const exists = await prisma.siteUser.findFirst({
    where: { OR: [{ email }, { username }] },
  });
  if (exists) {
    return NextResponse.json({ error: "Bu email veya kullanıcı adı zaten kullanılıyor" }, { status: 409 });
  }

  const hashed = await bcrypt.hash(password, 10);
  const user = await prisma.siteUser.create({
    data: { username, email, password: hashed },
  });

  return NextResponse.json({ id: user.id, username: user.username }, { status: 201 });
}
