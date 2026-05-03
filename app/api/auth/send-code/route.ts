import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@libsql/client";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

function getDb() {
  return createClient({
    url: process.env.TURSO_DATABASE_URL!,
    authToken: process.env.TURSO_AUTH_TOKEN,
  });
}

function generateCode() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function POST(req: NextRequest) {
  const { email } = await req.json();
  if (!email?.trim()) return NextResponse.json({ error: "Email gerekli" }, { status: 400 });

  const db = getDb();
  try {
    // Email zaten kayıtlı mı?
    const existing = await db.execute({
      sql: "SELECT id FROM SiteUser WHERE email = ?",
      args: [email.toLowerCase()],
    });
    if (existing.rows.length > 0) {
      return NextResponse.json({ error: "Bu email zaten kayıtlı" }, { status: 409 });
    }

    const code = generateCode();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 dakika

    // Eski kodları sil
    await db.execute({ sql: "DELETE FROM EmailVerify WHERE email = ?", args: [email.toLowerCase()] });

    // Yeni kodu kaydet
    await db.execute({
      sql: "INSERT INTO EmailVerify (email, code, expiresAt) VALUES (?, ?, ?)",
      args: [email.toLowerCase(), code, expiresAt.toISOString()],
    });

    // Email gönder
    await resend.emails.send({
      from: "MANIFIC <onboarding@resend.dev>",
      to: email,
      subject: "MANIFIC — Doğrulama Kodu",
      html: `
        <div style="background:#0a0a14;color:#f0f0ff;font-family:system-ui;padding:40px;max-width:480px;margin:0 auto;border-radius:16px">
          <div style="text-align:center;margin-bottom:32px">
            <div style="width:56px;height:56px;background:linear-gradient(135deg,#7c3aed,#9333ea);border-radius:14px;display:inline-flex;align-items:center;justify-content:center;font-size:24px;font-weight:900;color:#fff">M</div>
            <h1 style="font-size:22px;font-weight:900;margin:12px 0 4px">MANIFIC</h1>
          </div>
          <p style="color:#a0a0c0;margin-bottom:24px;text-align:center">Hesap oluşturmak için doğrulama kodun:</p>
          <div style="background:#16162a;border:1px solid #252545;border-radius:12px;padding:24px;text-align:center;margin-bottom:24px">
            <span style="font-size:40px;font-weight:900;letter-spacing:12px;color:#a855f7">${code}</span>
          </div>
          <p style="color:#5a5a80;font-size:13px;text-align:center">Bu kod 10 dakika geçerlidir. Eğer kayıt olmadıysan bu emaili görmezden gel.</p>
        </div>
      `,
    });

    return NextResponse.json({ success: true });
  } finally {
    db.close();
  }
}
