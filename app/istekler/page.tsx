"use client";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface MangaRequest {
  id: number; title: string; slug: string;
  description?: string; requestedByName: string;
  votes: number; status: string; createdAt: string;
}

export default function IsteklerPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [requests, setRequests] = useState<MangaRequest[]>([]);
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [votedIds, setVotedIds] = useState<Set<number>>(new Set());
  const [votingId, setVotingId] = useState<number | null>(null);

  async function load() {
    const r = await fetch("/api/requests");
    setRequests(await r.json());
  }

  useEffect(() => { load(); }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!session) { router.push("/giris"); return; }
    setLoading(true); setError("");

    const r = await fetch("/api/requests", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, description: desc }),
    });
    const data = await r.json();

    if (r.status === 409 && data.existing) {
      // Zaten var, o sayfaya yönlendir
      router.push(`/istekler/${data.slug}`);
      return;
    }
    if (!r.ok) { setError(data.error || "Hata oluştu"); setLoading(false); return; }

    setTitle(""); setDesc(""); setShowForm(false); setLoading(false);
    load();
  }

  async function handleVote(req: MangaRequest) {
    if (!session) { router.push("/giris"); return; }
    setVotingId(req.id);
    const r = await fetch(`/api/requests/${req.id}/vote`, { method: "POST" });
    const data = await r.json();
    setVotedIds(prev => {
      const next = new Set(prev);
      data.voted ? next.add(req.id) : next.delete(req.id);
      return next;
    });
    load();
    setVotingId(null);
  }

  const statusLabel: Record<string, { label: string; color: string; bg: string }> = {
    pending: { label: "Bekliyor", color: "#f97316", bg: "rgba(249,115,22,0.12)" },
    approved: { label: "Onaylandı", color: "#10b981", bg: "rgba(16,185,129,0.12)" },
    rejected: { label: "Reddedildi", color: "#ef4444", bg: "rgba(239,68,68,0.12)" },
    added: { label: "Eklendi", color: "#a855f7", bg: "rgba(168,85,247,0.12)" },
  };

  return (
    <div style={{ background: "var(--bg)", minHeight: "100vh" }}>
      <div style={{ maxWidth: 800, margin: "0 auto", padding: "40px 20px 60px" }}>

        {/* Header */}
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 32, gap: 16 }}>
          <div>
            <h1 style={{ fontWeight: 900, fontSize: 26, marginBottom: 6 }}>Manga İstekleri</h1>
            <p style={{ fontSize: 14, color: "var(--text2)" }}>
              İstediğin mangayı öner, topluluk oylasın. En çok oy alan eklenir!
            </p>
          </div>
          <button
            onClick={() => session ? setShowForm(!showForm) : router.push("/giris")}
            className="btn-purple"
            style={{ padding: "10px 20px", borderRadius: 12, fontSize: 13, flexShrink: 0 }}
          >
            + İstek Ekle
          </button>
        </div>

        {/* Form */}
        {showForm && (
          <div style={{ background: "var(--card)", border: "1px solid var(--border2)", borderRadius: 16, padding: 24, marginBottom: 24 }}>
            <h2 style={{ fontWeight: 700, fontSize: 15, marginBottom: 16 }}>Yeni İstek</h2>
            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div>
                <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: "var(--muted)", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  Manga Adı *
                </label>
                <input
                  placeholder="Örn: Naruto, Bleach..."
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  required
                  style={{ width: "100%", background: "var(--card2)", border: "1px solid var(--border2)", color: "var(--text)", outline: "none", borderRadius: 10, padding: "10px 14px", fontSize: 13 }}
                  onFocus={e => (e.target.style.borderColor = "var(--accent3)")}
                  onBlur={e => (e.target.style.borderColor = "var(--border2)")}
                />
              </div>
              <div>
                <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: "var(--muted)", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  Açıklama (opsiyonel)
                </label>
                <textarea
                  placeholder="Neden bu mangayı istiyorsun?"
                  value={desc}
                  onChange={e => setDesc(e.target.value)}
                  rows={3}
                  style={{ width: "100%", background: "var(--card2)", border: "1px solid var(--border2)", color: "var(--text)", outline: "none", borderRadius: 10, padding: "10px 14px", fontSize: 13, resize: "vertical", fontFamily: "inherit" }}
                  onFocus={e => (e.target.style.borderColor = "var(--accent3)")}
                  onBlur={e => (e.target.style.borderColor = "var(--border2)")}
                />
              </div>
              {error && <p style={{ fontSize: 12, color: "var(--red)" }}>⚠️ {error}</p>}
              <div style={{ display: "flex", gap: 8 }}>
                <button type="submit" disabled={loading || !title.trim()} className="btn-purple" style={{ padding: "9px 24px", borderRadius: 10, fontSize: 13 }}>
                  {loading ? "Gönderiliyor..." : "Gönder"}
                </button>
                <button type="button" onClick={() => setShowForm(false)} className="btn-ghost" style={{ padding: "9px 20px", borderRadius: 10, fontSize: 13 }}>
                  İptal
                </button>
              </div>
            </form>
          </div>
        )}

        {/* List */}
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {requests.length === 0 ? (
            <div style={{ textAlign: "center", padding: "60px 0", color: "var(--muted)" }}>
              <p style={{ fontSize: 36, marginBottom: 12 }}>📬</p>
              <p style={{ fontSize: 15, fontWeight: 600, color: "var(--text2)" }}>Henüz istek yok</p>
              <p style={{ fontSize: 13, marginTop: 4 }}>İlk isteği sen ekle!</p>
            </div>
          ) : (
            requests.map((req, i) => {
              const st = statusLabel[req.status] || statusLabel.pending;
              const hasVoted = votedIds.has(req.id);
              return (
                <div key={req.id} style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 14, padding: "16px 20px", display: "flex", alignItems: "center", gap: 16 }}>
                  {/* Rank */}
                  <span style={{ fontSize: 18, fontWeight: 900, color: "var(--muted)", width: 28, textAlign: "center", flexShrink: 0 }}>
                    {i + 1}
                  </span>

                  {/* Vote button */}
                  <button
                    onClick={() => handleVote(req)}
                    disabled={votingId === req.id}
                    style={{
                      display: "flex", flexDirection: "column", alignItems: "center", gap: 2,
                      padding: "8px 14px", borderRadius: 10, border: "none", cursor: "pointer",
                      background: hasVoted ? "rgba(124,58,237,0.2)" : "var(--card2)",
                      color: hasVoted ? "var(--accent3)" : "var(--text2)",
                      transition: "all 0.2s", flexShrink: 0, minWidth: 52,
                    }}
                  >
                    <svg style={{ width: 16, height: 16 }} fill={hasVoted ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                    </svg>
                    <span style={{ fontSize: 14, fontWeight: 800 }}>{req.votes}</span>
                  </button>

                  {/* Content */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                      <Link href={`/istekler/${req.slug}`} style={{ fontWeight: 700, fontSize: 15, color: "var(--text)", textDecoration: "none" }}
                        onMouseEnter={e => (e.currentTarget.style.color = "var(--accent3)")}
                        onMouseLeave={e => (e.currentTarget.style.color = "var(--text)")}
                      >
                        {req.title}
                      </Link>
                      <span style={{ fontSize: 11, fontWeight: 600, padding: "2px 8px", borderRadius: 6, background: st.bg, color: st.color }}>
                        {st.label}
                      </span>
                    </div>
                    {req.description && (
                      <p style={{ fontSize: 12, color: "var(--muted)", marginTop: 4, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {req.description}
                      </p>
                    )}
                    <p style={{ fontSize: 11, color: "var(--muted)", marginTop: 4 }}>
                      {req.requestedByName} tarafından · {new Date(req.createdAt).toLocaleDateString("tr-TR")}
                    </p>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
