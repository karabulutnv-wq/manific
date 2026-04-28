import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";
import SessionWrapper from "@/components/SessionWrapper";
import { ReadLimitWidget } from "@/components/ReadLimit";
import Script from "next/script";

export const metadata: Metadata = {
  title: "MANIFIC — Türkçe Manga Okuma Sitesi",
  description: "En güncel mangaları ücretsiz oku",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
      <body>
        <Script src="https://pl29285113.profitablecpmratenetwork.com/b0/a8/2e/b0a82e11a4264a4fa275704394902db0.js" strategy="afterInteractive" />
        <Script src="https://pl29285114.profitablecpmratenetwork.com/7d/97/e6/7d97e61cf3d84ff9ce9a9d7286cd3337.js" strategy="afterInteractive" />
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
