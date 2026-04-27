import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";
import SessionWrapper from "@/components/SessionWrapper";
import { ReadLimitWidget } from "@/components/ReadLimit";

export const metadata: Metadata = {
  title: "MANIFIC — Türkçe Manga Okuma Sitesi",
  description: "En güncel mangaları ücretsiz oku",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="tr">
      <body>
        <SessionWrapper>
          <Navbar />
          <main>{children}</main>
          <ReadLimitWidget />
          <footer style={{ borderTop: "1px solid var(--border)", background: "var(--nav)", marginTop: 0 }}>
            <div style={{ maxWidth: 1280, margin: "0 auto", padding: "24px 20px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ width: 26, height: 26, borderRadius: 6, background: "linear-gradient(135deg, #7c3aed, #9333ea)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, color: "#fff", fontSize: 11 }}>M</div>
                <span style={{ fontWeight: 900, fontSize: 14, letterSpacing: "-0.3px" }}>MANIFIC</span>
              </div>
              <p style={{ fontSize: 12, color: "var(--muted)" }}>© 2026 MANIFIC — Tüm hakları saklıdır</p>
            </div>
          </footer>
        </SessionWrapper>
      </body>
    </html>
  );
}
