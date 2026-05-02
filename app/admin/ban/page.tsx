"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

interface Ban { id: number; ip: string; reason?: string; createdAt: string; }

export default function BanPage() {
  const [bans, setBans] = useState<Ban[]>([]);
  const [ip, setIp] = useState("");
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function load() {
    const r = await fetch("/api/admin/ban");
    setBans(await r.json());
  }

  useEffect(() => { load(); }, []);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true); setError("");
    const r = await fetch("/api/admin/ban", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ip, reason }),
    });
    if (!r.ok) { const d = await r.json(); setError(d.error); }
    else { setIp(""); setReason(""); load(); }
    setLoading(false);
  }

  async function handleRemove(id: number) {
    if (!confirm("Bu IP yasağını kaldırmak istediğine emin misin?")) return;
    await fetch("/api/admin/ban", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    load();
  }

  const S = {
    input: { background: "var(--card2)", border: "1px solid var(--border2)", color: "var(--text)", outline: "none", borderRadius: 10, padding: "10px 14px", fontSize: 13, width: "100%" } as React.CSSProperties,
    label: { display: "block", fontSize: 11, fontWeight: 600, color: "var(--muted)", marginBottom: 6, textTransform: "uppercase" as const, letterSpacing: "0.05em" },
  };

  return (
    <div style={{ maxWidth: 800, margin: "0 auto", padding: "32px 20px", minHeight: "100vh" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 28 }}>
        <Link href="/admin" style={{ fontSize: 13, color: "var(--muted)", textDecoration: "none" }}>← Admin</Link>
        <span style={{ color: "var(--border2)" }}>/</span>
        <h1 style={{ fontWeight: 800, fontSize: 20 }}>IP Ban Yönetimi</h1>
      </div>

      {/* Add form */}
      <form onSubmit={handleAdd} style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 14, padding: 24, marginBottom: 24 }}>
        <h2 style={{ fontWeight: 700, fontSize: 15, marginBottom: 16 }}>🚫 IP Yasakla</h2>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 14 }}>
          <div>
            <label style={S.label}>IP Adresi *</label>
            <input
              placeholder="192.168.1.1"
              value={ip}
              onChange={e => setIp(e.target.value)}
              required
              style={S.input}
            />
          </div>
          <div>
            <label style={S.label}>Sebep (opsiyonel)</label>
            <input
              placeholder="Spam, kötüye kullanım..."
              value={reason}
              onChange={e => setReason(e.target.value)}
              style={S.input}
            />
          </div>
        </div>
        {error && <p style={{ fontSize: 12, color: "var(--red)", marginBottom: 10 }}>⚠️ {error}</p>}
        <button type="submit" disabled={loading || !ip.trim()} className="btn-purple" style={{ padding: "10px 24px", borderRadius: 10, fontSize: 13 }}>
          {loading ? "Ekleniyor..." : "Yasakla"}
        </button>
      </form>

      {/* Ban list */}
      <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 14, padding: 20 }}>
        <p style={{ fontWeight: 700, fontSize: 14, marginBottom: 14 }}>Yasaklı IP'ler ({bans.length})</p>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {bans.map(ban => (
            <div key={ban.id} style={{ display: "flex", alignItems: "center", gap: 14, padding: "12px 16px", background: "var(--card2)", borderRadius: 10 }}>
              <div style={{ flex: 1 }}>
                <p style={{ fontWeight: 700, fontSize: 14, fontFamily: "monospace", color: "var(--red)" }}>{ban.ip}</p>
                {ban.reason && <p style={{ fontSize: 12, color: "var(--muted)", marginTop: 2 }}>{ban.reason}</p>}
                <p style={{ fontSize: 11, color: "var(--muted)", marginTop: 2 }}>{new Date(ban.createdAt).toLocaleString("tr-TR")}</p>
              </div>
              <button
                onClick={() => handleRemove(ban.id)}
                style={{ padding: "6px 14px", borderRadius: 8, fontSize: 12, background: "rgba(16,185,129,0.1)", color: "var(--green)", border: "1px solid rgba(16,185,129,0.2)", cursor: "pointer" }}
              >
                Kaldır
              </button>
            </div>
          ))}
          {bans.length === 0 && <p style={{ fontSize: 13, color: "var(--muted)", textAlign: "center", padding: "16px 0" }}>Yasaklı IP yok</p>}
        </div>
      </div>
    </div>
  );
}
