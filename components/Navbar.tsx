"use client";
import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function Navbar() {
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const { data: session } = useSession();
  const router = useRouter();
  const user = session?.user as { role?: string; avatar?: string; username?: string; name?: string } | undefined;

  return (
    <nav style={{
      position: "sticky", top: 0, zIndex: 50,
      background: "rgba(14,14,28,0.92)",
      backdropFilter: "blur(20px)",
      WebkitBackdropFilter: "blur(20px)",
      borderBottom: "1px solid var(--border)",
    }}>
      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 20px", height: 60, display: "flex", alignItems: "center", gap: 16 }}>

        {/* Logo */}
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0, textDecoration: "none" }}>
          <div style={{
            width: 32, height: 32, borderRadius: 8,
            background: "linear-gradient(135deg, #7c3aed, #9333ea)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontWeight: 900, color: "#fff", fontSize: 14,
          }}>M</div>
          <span style={{ fontWeight: 900, fontSize: 17, letterSpacing: "-0.5px", color: "#fff" }}>MANIFIC</span>
        </Link>

        {/* Nav links */}
        <div style={{ display: "flex", gap: 2, marginLeft: 8 }} className="hidden md:flex">
          <Link href="/" className="nav-link">Ana Sayfa</Link>
          <Link href="/?filter=popular" className="nav-link">Keşfet</Link>
          <Link href="/istekler" className="nav-link">İstekler</Link>
        </div>

        {/* Search */}
        <form
          onSubmit={(e) => { e.preventDefault(); if (search.trim()) router.push(`/?q=${encodeURIComponent(search)}`); }}
          style={{ flex: 1, maxWidth: 280, marginLeft: "auto" }}
        >
          <div style={{ position: "relative" }}>
            <svg style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", width: 14, height: 14, color: "var(--muted)", pointerEvents: "none" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Manga ara..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input-base"
              style={{ paddingLeft: 32, paddingRight: 12, paddingTop: 8, paddingBottom: 8, borderRadius: 10, fontSize: 13 }}
            />
          </div>
        </form>

        {/* Auth */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
          {session ? (
            <div style={{ position: "relative" }}>
              <button
                onClick={() => setOpen(!open)}
                style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 10px", borderRadius: 10, background: "transparent", border: "none", cursor: "pointer", color: "var(--text)" }}
              >
                <div style={{ width: 32, height: 32, borderRadius: "50%", overflow: "hidden", border: "2px solid var(--accent3)", flexShrink: 0 }}>
                  {user?.avatar ? (
                    <Image src={user.avatar} alt="av" width={32} height={32} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  ) : (
                    <div style={{ width: "100%", height: "100%", background: "var(--card2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, color: "var(--accent3)" }}>
                      {(user?.username || user?.name || "?")[0].toUpperCase()}
                    </div>
                  )}
                </div>
                <span style={{ fontSize: 13, fontWeight: 500 }} className="hidden sm:block">{user?.username || user?.name}</span>
                <svg style={{ width: 12, height: 12, color: "var(--muted)" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {open && (
                <>
                  <div style={{ position: "fixed", inset: 0, zIndex: 40 }} onClick={() => setOpen(false)} />
                  <div style={{
                    position: "absolute", right: 0, top: "calc(100% + 8px)", width: 180,
                    background: "var(--card2)", border: "1px solid var(--border2)",
                    borderRadius: 12, padding: "6px 0", zIndex: 50,
                    boxShadow: "0 20px 50px rgba(0,0,0,0.7)",
                  }}>
                    {user?.role === "admin" && (
                      <Link href="/admin" onClick={() => setOpen(false)} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 16px", fontSize: 13, color: "var(--text)", textDecoration: "none" }}
                        onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,255,255,0.05)")}
                        onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                      >⚙️ Admin Panel</Link>
                    )}
                    <Link href="/profil" onClick={() => setOpen(false)} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 16px", fontSize: 13, color: "var(--text)", textDecoration: "none" }}
                      onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,255,255,0.05)")}
                      onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                    >👤 Profilim</Link>
                    <div style={{ borderTop: "1px solid var(--border)", margin: "4px 12px" }} />
                    <button
                      onClick={() => { setOpen(false); signOut({ callbackUrl: "/" }); }}
                      style={{ width: "100%", display: "flex", alignItems: "center", gap: 10, padding: "10px 16px", fontSize: 13, color: "var(--red)", background: "transparent", border: "none", cursor: "pointer", textAlign: "left" }}
                      onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,255,255,0.05)") }
                      onMouseLeave={e => (e.currentTarget.style.background = "transparent") }
                    >🚪 Çıkış Yap</button>
                  </div>
                </>
              )}
            </div>
          ) : (
            <>
              <Link href="/giris" className="nav-link" style={{ textDecoration: "none" }}>Giriş Yap</Link>
              <Link href="/kayit" className="btn-purple" style={{ padding: "7px 16px", borderRadius: 10, fontSize: 13, textDecoration: "none" }}>Kayıt Ol</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
