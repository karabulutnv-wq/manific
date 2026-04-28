"use client";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";

interface MangaRequest {
  id: number; title: string; slug: string;
  description?: string; requestedByName: string;
  votes: number; status: string; createdAt: string;
}

export default function RequestDetailPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const params = useParams();
  const slug = params.slug as string;

  const [req, setReq] = useState<MangaRequest | null>(null);
  const [hasVoted, setHasVoted] = useState(false);
  const [voting, setVoting] = useState(false);

  async function load() {
    const r = await fetch("/api/requests");
    const all: MangaRequest[] = await r.json();
    const found = all.find(x => x.slug === slug);
    if (!found) { router.push("/istekler"); return; }
    setReq(found);
  }

  useEffect(() => { load(); }, [slug]);

  async function handleVote() {
    if (!session) { router.push("/giris"); return; }
    if (!req) return;
    setVoting(true);
    const r = await fetch(`/api/requests/${req.id}/vote`, { method: "POST" });
    const data = await r.json();
    setHasVoted(data.voted);
    load();
    setVoting(false);
  }

  const statusLabel: Record<string, { label: string; color: string; bg: string }> = {
    pending: { label: "Bekliyor", color: "#f97316", bg: "rgba(249,115,22,0.12)" },
    approved: { label: "Onaylandı", color: "#10b981", bg: "rgba(16,185,129,0.12)" },
    rejected: { label: "Reddedildi", color: "#ef4444", bg: "rgba(239,68,68,0.12)" },
    added: { label: "Eklendi", color: "#a855f7", bg: "rgba(168,85,247,0.12)" },
  };

  if (!req) return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--muted)" }}>
      Yükleniyor...
    </div>
  );

  const st = statusLabel[req.status] || statusLabel.pending;

  return (
    <div style={{ background: "var(--bg)", minHeight: "100vh" }}>
      <div style={{ maxWidth: 600, margin: "0 auto", padding: "40px 20px 60px" }}>
        <Link href="/istekler" style={{ fontSize: 13, color: "var(--muted)", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 6, marginBottom: 24 }}>
          <svg style={{ width: 14, height: 14 }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Tüm İstekler
        </Link>

        <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 20, padding: 32 }}>
          <div style={{ display: "flex", alignItems: "flex-start", gap: 20 }}>
            {/* Vote */}
            <button
              onClick={handleVote}
              disabled={voting}
              style={{
                display: "flex", flexDirection: "column", alignItems: "center", gap: 4,
                padding: "14px 18px", borderRadius: 14, border: "none", cursor: "pointer",
                background: hasVoted ? "rgba(124,58,237,0.2)" : "var(--card2)",
                color: hasVoted ? "var(--accent3)" : "var(--text2)",
                transition: "all 0.2s", flexShrink: 0,
              }}
            >
              <svg style={{ width: 20, height: 20 }} fill={hasVoted ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
              </svg>
              <span style={{ fontSize: 22, fontWeight: 900 }}>{req.votes}</span>
              <span style={{ fontSize: 10, fontWeight: 600, letterSpacing: "0.05em" }}>OY</span>
            </button>

            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8, flexWrap: "wrap" }}>
                <h1 style={{ fontWeight: 900, fontSize: 22 }}>{req.title}</h1>
                <span style={{ fontSize: 11, fontWeight: 600, padding: "3px 10px", borderRadius: 6, background: st.bg, color: st.color }}>
                  {st.label}
                </span>
              </div>

              {req.description && (
                <p style={{ fontSize: 14, color: "var(--text2)", lineHeight: 1.7, marginBottom: 16 }}>
                  {req.description}
                </p>
              )}

              <p style={{ fontSize: 12, color: "var(--muted)" }}>
                {req.requestedByName} tarafından istendi · {new Date(req.createdAt).toLocaleDateString("tr-TR")}
              </p>
            </div>
          </div>

          {!session && (
            <div style={{ marginTop: 24, padding: "14px 18px", borderRadius: 12, background: "var(--card2)", border: "1px solid var(--border2)", textAlign: "center" }}>
              <p style={{ fontSize: 13, color: "var(--text2)" }}>
                Oy vermek için{" "}
                <Link href="/giris" style={{ color: "var(--accent3)", fontWeight: 600 }}>giriş yap</Link>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
