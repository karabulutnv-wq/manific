"use client";
import Link from "next/link";
import { signOut } from "next-auth/react";

const cards = [
  { href: "/admin/series", icon: "📚", label: "Seri Yönetimi", desc: "Manga serisi ekle, düzenle, sil", color: "#7c3aed", bg: "rgba(124,58,237,0.12)", border: "rgba(124,58,237,0.25)" },
  { href: "/admin/chapters", icon: "📄", label: "Bölüm Yönetimi", desc: "Bölüm ekle, sayfaları yükle", color: "#10b981", bg: "rgba(16,185,129,0.12)", border: "rgba(16,185,129,0.25)" },
  { href: "/admin/avatars", icon: "🖼️", label: "Avatar Yönetimi", desc: "Kullanıcı avatarlarını yönet", color: "#f97316", bg: "rgba(249,115,22,0.12)", border: "rgba(249,115,22,0.25)" },
  { href: "/admin/istatistik", icon: "📊", label: "İstatistikler", desc: "Ziyaretçi ve trafik verileri", color: "#06b6d4", bg: "rgba(6,182,212,0.12)", border: "rgba(6,182,212,0.25)" },
  { href: "/admin/ban", icon: "🚫", label: "IP Ban", desc: "IP yasakla ve yönet", color: "#ef4444", bg: "rgba(239,68,68,0.12)", border: "rgba(239,68,68,0.25)" },
  { href: "/admin/kullanicilar", icon: "👥", label: "Kullanıcılar", desc: "Hesap sil, kullanıcı yönet", color: "#06b6d4", bg: "rgba(6,182,212,0.12)", border: "rgba(6,182,212,0.25)" },
];

export default function AdminDashboard() {
  return (
    <div style={{ maxWidth: 800, margin: "0 auto", padding: "48px 20px", minHeight: "100vh" }}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 40 }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
            <div style={{ width: 28, height: 28, borderRadius: 7, background: "linear-gradient(135deg, #7c3aed, #9333ea)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, color: "#fff", fontSize: 12 }}>M</div>
            <span style={{ fontSize: 12, fontWeight: 700, color: "var(--muted)", letterSpacing: "0.08em" }}>MANIFIC</span>
          </div>
          <h1 style={{ fontWeight: 900, fontSize: 26 }}>Admin Paneli</h1>
          <p style={{ fontSize: 13, color: "var(--muted)", marginTop: 4 }}>Siteyi buradan yönetiyorsun</p>
        </div>
        <button
          onClick={() => signOut({ callbackUrl: "/" })}
          style={{ padding: "8px 18px", borderRadius: 10, fontSize: 13, background: "rgba(239,68,68,0.08)", color: "var(--red)", border: "1px solid rgba(239,68,68,0.2)", cursor: "pointer", fontWeight: 500 }}
        >
          Çıkış Yap
        </button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14 }}>
        {cards.map(c => (
          <Link key={c.href} href={c.href} style={{ textDecoration: "none", display: "block", background: "var(--card)", border: "1px solid var(--border)", borderRadius: 14, padding: 22, transition: "border-color 0.2s, transform 0.2s" }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = "var(--border2)"; (e.currentTarget as HTMLElement).style.transform = "translateY(-3px)"; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = "var(--border)"; (e.currentTarget as HTMLElement).style.transform = "translateY(0)"; }}
          >
            <div style={{ width: 44, height: 44, borderRadius: 11, background: c.bg, border: `1px solid ${c.border}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, marginBottom: 16 }}>{c.icon}</div>
            <p style={{ fontWeight: 700, fontSize: 14, marginBottom: 5 }}>{c.label}</p>
            <p style={{ fontSize: 12, color: "var(--muted)", lineHeight: 1.5 }}>{c.desc}</p>
            <div style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 16, fontSize: 12, fontWeight: 600, color: "var(--accent3)" }}>
              Yönet
              <svg style={{ width: 12, height: 12 }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
