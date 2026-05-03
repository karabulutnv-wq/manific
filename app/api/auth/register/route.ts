import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createClient } from "@libsql/client";
import bcrypt from "bcryptjs";

function getDb() {
  return createClient({
    url: process.env.TURSO_DATABASE_URL!,
    authToken: process.env.TURSO_AUTH_TOKEN,
  });
}

export async function POST(req: NextRequest) {
  const { username, email, password, code } = await req.json();

  if (!username || !email || !password || !code) {
    return NextResponse.json({ error: "Tüm alanlar zorunlu" }, { status: 400 });
  }
  if (password.length < 6) {
    return NextResponse.json({ error: "Şifre en az 6 karakter olmalı" }, { status: 400 });
  }

  const db = getDb();
  try {
    // Kodu doğrula
    const verify = await db.execute({
      sql: "SELECT code, expiresAt FROM EmailVerify WHERE email = ?",
      args: [email.toLowerCase()],
    });

    if (verify.rows.length === 0) {
      return NextResponse.json({ error: "Doğrulama kodu bulunamadı. Tekrar gönder." }, { status: 400 });
    }

    const { code: savedCode, expiresAt } = verify.rows[0] as { code: string; expiresAt: string };

    if (new Date(expiresAt) < new Date()) {
      return NextResponse.json({ error: "Doğrulama kodu süresi dolmuş. Tekrar gönder." }, { status: 400 });
    }

    if (savedCode !== code.trim()) {
      return NextResponse.json({ error: "Doğrulama kodu hatalı" }, { status: 400 });
    }

    // Kullanıcı adı/email kontrolü
    const exists = await prisma.siteUser.findFirst({
      where: { OR: [{ email: email.toLowerCase() }, { username }] },
    });
    if (exists) {
      return NextResponse.json({ error: "Bu email veya kullanıcı adı zaten kullanılıyor" }, { status: 409 });
    }

    const hashed = await bcrypt.hash(password, 10);
    const user = await prisma.siteUser.create({
      data: { username, email: email.toLowerCase(), password: hashed },
    });

    // Kodu sil
    await db.execute({ sql: "DELETE FROM EmailVerify WHERE email = ?", args: [email.toLowerCase()] });

    return NextResponse.json({ id: user.id, username: user.username }, { status: 201 });
  } finally {
    db.close();
  }
}
