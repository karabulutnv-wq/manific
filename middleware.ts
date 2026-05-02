import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@libsql/client";

export async function middleware(req: NextRequest) {
  // Sadece sayfa isteklerini kontrol et, API ve static dosyaları atla
  const { pathname } = req.nextUrl;
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/favicon") ||
    pathname.startsWith("/uploads")
  ) {
    return NextResponse.next();
  }

  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "unknown";

  if (ip === "unknown") return NextResponse.next();

  try {
    const db = createClient({
      url: process.env.TURSO_DATABASE_URL!,
      authToken: process.env.TURSO_AUTH_TOKEN,
    });
    const result = await db.execute({
      sql: "SELECT id FROM IpBan WHERE ip = ?",
      args: [ip],
    });
    db.close();

    if (result.rows.length > 0) {
      return new NextResponse(
        `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Erişim Engellendi</title></head>
        <body style="background:#0a0a14;color:#f0f0ff;font-family:system-ui;display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0;flex-direction:column;gap:16px">
          <div style="font-size:48px">🚫</div>
          <h1 style="font-size:24px;font-weight:900">Erişim Engellendi</h1>
          <p style="color:#6b6b8a;font-size:14px">IP adresiniz bu siteden yasaklanmıştır.</p>
        </body></html>`,
        { status: 403, headers: { "Content-Type": "text/html" } }
      );
    }
  } catch {
    // DB hatası olursa geçir
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon).*)"],
};
