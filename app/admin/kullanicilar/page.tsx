"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

interface User {
  id: number; username: string; email: string;
  lastIp?: string; createdAt: string;
}

export default function KullanicilarPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [q, setQ] = useState("");
  const [deleting, setDeleting] = useState<number | null>(null);
  const [msg, setMsg] = useState("");

  async function load(query = "") {
    const r = await fetch(`/api/admin/users?q=${encodeURIComponent(query)}`);
    setUsers(await r.json());
  }

  useEffect(() => { load(); }, []);

  async function handleDelete(user: User) {
    if (!confirm(`"${user.username}" kullanıcısını silmek istediğine emin misin?\nBu işlem geri alınamaz.`)) return;
    setDeleting(user.id);
    const r = await fetch(`/api/admin/users/${user.id}`, { method: "DELETE" });
    if (r.ok) {
      setMsg(`"${user.username}" silindi`);
      setTimeout(() => setMsg(""), 3000);
      load(q);
    }
    setDeleting(null);
  }

  return (
    <div style={{ maxWidth: 860, margin: "0 auto", padding: "32px 20px", minHeight: "100vh" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 28 }}>
        <Link href="/admin" style={{ fontSize: 13, color: "var(--muted)", textDecoration: "none" }}>← Admin</Link>
        <span style={{ color: "var(--border2)" }}>/</span>
        <h1 style={{ fontWeight: 800, fontSize: 20 }}>Kullanıcı Yönetimi</h1>
      </div>

      {msg && (
        <div style={{ padding: "10px 16px", borderRadius: 10, background: "rgba(16,185,129,0.1)", color: "var(--green)", fontSize: 13, border: "1px solid rgba(16,185,129,0.2)", marginBottom: 16 }}>
          ✓ {msg}
        </div>
      )}

      {/* Search */}
      <div style={{ marginBottom: 16 }}>
        <input
          placeholder="Kullanıcı adı veya email ara..."
          value={q}
          onChange={e => { setQ(e.target.value); load(e.target.value); }}
          style={{ width: "100%", background: "var(--card2)", border: "1px solid var(--border2)", color: "var(--text)", outline: "none", borderRadius: 10, padding: "10px 14px", fontSize: 13 }}
          onFocus={e => (e.target.style.borderColor = "var(--accent3)")}
          onBlur={e => (e.target.style.borderColor = "var(--border2)")}
        />
      </div>

      {/* User list */}
      <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 14, padding: 16 }}>
        <p style={{ fontSize: 12, fontWeight: 600, color: "var(--muted)", marginBottom: 12, paddingLeft: 4 }}>
          {users.length} KULLANICI
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {users.map(u => (
            <div
              key={u.id}
              style={{ display: "flex", alignItems: "center", gap: 14, padding: "12px 16px", background: "var(--card2)", borderRadius: 10 }}
            >
              {/* Avatar placeholder */}
              <div style={{
                width: 40, height: 40, borderRadius: 10, flexShrink: 0,
                background: "linear-gradient(135deg, var(--accent), var(--accent2))",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontWeight: 900, fontSize: 16, color: "#fff",
              }}>
                {u.username[0].toUpperCase()}
              </div>

              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontWeight: 700, fontSize: 14 }}>{u.username}</p>
                <p style={{ fontSize: 12, color: "var(--muted)", marginTop: 1 }}>{u.email}</p>
                <div style={{ display: "flex", gap: 12, marginTop: 3 }}>
                  {u.lastIp && (
                    <span style={{ fontSize: 11, color: "var(--muted)", fontFamily: "monospace" }}>
                      IP: {u.lastIp}
                    </span>
                  )}
                  <span style={{ fontSize: 11, color: "var(--muted)" }}>
                    Kayıt: {new Date(u.createdAt).toLocaleDateString("tr-TR")}
                  </span>
                </div>
              </div>

              <button
                onClick={() => handleDelete(u)}
                disabled={deleting === u.id}
                style={{
                  padding: "7px 16px", borderRadius: 8, fontSize: 12, fontWeight: 600,
                  background: "rgba(239,68,68,0.1)", color: "var(--red)",
                  border: "1px solid rgba(239,68,68,0.2)", cursor: "pointer", flexShrink: 0,
                  opacity: deleting === u.id ? 0.5 : 1,
                }}
              >
                {deleting === u.id ? "Siliniyor..." : "Hesabı Sil"}
              </button>
            </div>
          ))}
          {users.length === 0 && (
            <p style={{ fontSize: 13, color: "var(--muted)", textAlign: "center", padding: "24px 0" }}>
              Kullanıcı bulunamadı
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
