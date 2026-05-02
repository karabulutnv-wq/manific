"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

interface Ban { id: number; ip: string; reason?: string; createdAt: string; }
interface User { id: number; username: string; email: string; lastIp?: string; createdAt: string; }

export default function BanPage() {
  const [bans, setBans] = useState<Ban[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [searchQ, setSearchQ] = useState("");
  const [manualIp, setManualIp] = useState("");
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [tab, setTab] = useState<"users" | "manual" | "list">("users");

  async function loadBans() {
    const r = await fetch("/api/admin/ban");
    setBans(await r.json());
  }

  async function searchUsers(q: string) {
    const r = await fetch(`/api/admin/users?q=${encodeURIComponent(q)}`);
    setUsers(await r.json());
  }

  useEffect(() => {
    loadBans();
    searchUsers("");
  }, []);

  async function banIp(ip: string, r?: string) {
    if (!ip) return;
    setLoading(true); setError("");
    const res = await fetch("/api/admin/ban", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ip, reason: r || reason }),
    });
    if (!res.ok) { const d = await res.json(); setError(d.error); }
    else { setManualIp(""); setReason(""); loadBans(); }
    setLoading(false);
  }

  async function handleRemove(id: number) {
    if (!confirm("Bu IP yasağını kaldırmak istediğine emin misin?")) return;
    await fetch("/api/admin/ban", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    loadBans();
  }

  const bannedIps = new Set(bans.map(b => b.ip));

  const S = {
    input: { background: "var(--card2)", border: "1px solid var(--border2)", color: "var(--text)", outline: "none", borderRadius: 10, padding: "10px 14px", fontSize: 13, width: "100%" } as React.CSSProperties,
    tab: (active: boolean) => ({
      padding: "8px 18px", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: "pointer", border: "none",
      background: active ? "linear-gradient(135deg, var(--accent), var(--accent2))" : "var(--card2)",
      color: active ? "#fff" : "var(--text2)",
    } as React.CSSProperties),
  };

  return (
    <div style={{ maxWidth: 860, margin: "0 auto", padding: "32px 20px", minHeight: "100vh" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 28 }}>
        <Link href="/admin" style={{ fontSize: 13, color: "var(--muted)", textDecoration: "none" }}>← Admin</Link>
        <span style={{ color: "var(--border2)" }}>/</span>
        <h1 style={{ fontWeight: 800, fontSize: 20 }}>IP Ban Yönetimi</h1>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
        <button style={S.tab(tab === "users")} onClick={() => setTab("users")}>👤 Kullanıcıdan Banla</button>
        <button style={S.tab(tab === "manual")} onClick={() => setTab("manual")}>✏️ Manuel IP</button>
        <button style={S.tab(tab === "list")} onClick={() => setTab("list")}>🚫 Yasaklı IP'ler ({bans.length})</button>
      </div>

      {error && (
        <div style={{ padding: "10px 16px", borderRadius: 10, background: "rgba(239,68,68,0.1)", color: "var(--red)", fontSize: 13, border: "1px solid rgba(239,68,68,0.2)", marginBottom: 16 }}>
          ⚠️ {error}
        </div>
      )}

      {/* User search tab */}
      {tab === "users" && (
        <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 14, padding: 20 }}>
          <div style={{ marginBottom: 16 }}>
            <input
              placeholder="Kullanıcı adı veya email ara..."
              value={searchQ}
              onChange={e => { setSearchQ(e.target.value); searchUsers(e.target.value); }}
              style={S.input}
            />
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8, maxHeight: 400, overflowY: "auto" }}>
            {users.map(u => {
              const isBanned = u.lastIp ? bannedIps.has(u.lastIp) : false;
              return (
                <div key={u.id} style={{ display: "flex", alignItems: "center", gap: 14, padding: "12px 16px", background: "var(--card2)", borderRadius: 10 }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <p style={{ fontWeight: 700, fontSize: 14 }}>{u.username}</p>
                      {isBanned && (
                        <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 7px", borderRadius: 4, background: "rgba(239,68,68,0.15)", color: "var(--red)", border: "1px solid rgba(239,68,68,0.3)" }}>
                          BANLANDI
                        </span>
                      )}
                    </div>
                    <p style={{ fontSize: 12, color: "var(--muted)", marginTop: 2 }}>{u.email}</p>
                    <p style={{ fontSize: 11, color: "var(--muted)", marginTop: 1, fontFamily: "monospace" }}>
                      IP: {u.lastIp || <span style={{ color: "var(--border2)" }}>Henüz giriş yapmadı</span>}
                    </p>
                  </div>
                  {u.lastIp ? (
                    isBanned ? (
                      <button
                        onClick={() => { const ban = bans.find(b => b.ip === u.lastIp); if (ban) handleRemove(ban.id); }}
                        style={{ padding: "7px 14px", borderRadius: 8, fontSize: 12, background: "rgba(16,185,129,0.1)", color: "var(--green)", border: "1px solid rgba(16,185,129,0.2)", cursor: "pointer", flexShrink: 0 }}
                      >
                        Yasağı Kaldır
                      </button>
                    ) : (
                      <button
                        onClick={() => banIp(u.lastIp!, `${u.username} kullanıcısı banlandı`)}
                        disabled={loading}
                        style={{ padding: "7px 14px", borderRadius: 8, fontSize: 12, background: "rgba(239,68,68,0.1)", color: "var(--red)", border: "1px solid rgba(239,68,68,0.2)", cursor: "pointer", flexShrink: 0 }}
                      >
                        🚫 Banla
                      </button>
                    )
                  ) : (
                    <span style={{ fontSize: 11, color: "var(--muted)", flexShrink: 0 }}>IP yok</span>
                  )}
                </div>
              );
            })}
            {users.length === 0 && <p style={{ fontSize: 13, color: "var(--muted)", textAlign: "center", padding: "16px 0" }}>Kullanıcı bulunamadı</p>}
          </div>
        </div>
      )}

      {/* Manual IP tab */}
      {tab === "manual" && (
        <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 14, padding: 24 }}>
          <h2 style={{ fontWeight: 700, fontSize: 15, marginBottom: 16 }}>Manuel IP Yasakla</h2>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 14 }}>
            <div>
              <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: "var(--muted)", marginBottom: 6, textTransform: "uppercase" as const, letterSpacing: "0.05em" }}>IP Adresi *</label>
              <input placeholder="192.168.1.1" value={manualIp} onChange={e => setManualIp(e.target.value)} style={S.input} />
            </div>
            <div>
              <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: "var(--muted)", marginBottom: 6, textTransform: "uppercase" as const, letterSpacing: "0.05em" }}>Sebep</label>
              <input placeholder="Spam, kötüye kullanım..." value={reason} onChange={e => setReason(e.target.value)} style={S.input} />
            </div>
          </div>
          <button onClick={() => banIp(manualIp)} disabled={loading || !manualIp.trim()} className="btn-purple" style={{ padding: "10px 24px", borderRadius: 10, fontSize: 13 }}>
            {loading ? "Ekleniyor..." : "Yasakla"}
          </button>
        </div>
      )}

      {/* Ban list tab */}
      {tab === "list" && (
        <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 14, padding: 20 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {bans.map(ban => (
              <div key={ban.id} style={{ display: "flex", alignItems: "center", gap: 14, padding: "12px 16px", background: "var(--card2)", borderRadius: 10 }}>
                <div style={{ flex: 1 }}>
                  <p style={{ fontWeight: 700, fontSize: 14, fontFamily: "monospace", color: "var(--red)" }}>{ban.ip}</p>
                  {ban.reason && <p style={{ fontSize: 12, color: "var(--muted)", marginTop: 2 }}>{ban.reason}</p>}
                  <p style={{ fontSize: 11, color: "var(--muted)", marginTop: 2 }}>{new Date(ban.createdAt).toLocaleString("tr-TR")}</p>
                </div>
                <button onClick={() => handleRemove(ban.id)} style={{ padding: "6px 14px", borderRadius: 8, fontSize: 12, background: "rgba(16,185,129,0.1)", color: "var(--green)", border: "1px solid rgba(16,185,129,0.2)", cursor: "pointer" }}>
                  Kaldır
                </button>
              </div>
            ))}
            {bans.length === 0 && <p style={{ fontSize: 13, color: "var(--muted)", textAlign: "center", padding: "16px 0" }}>Yasaklı IP yok</p>}
          </div>
        </div>
      )}
    </div>
  );
}
