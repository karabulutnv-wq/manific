"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

interface Manga { id: number; title: string; slug: string; }
interface Chapter { id: number; number: number; title?: string; createdAt: string; }

const S = {
  card: { background: "var(--card)", border: "1px solid var(--border)", borderRadius: 14, padding: 20 } as React.CSSProperties,
  input: { background: "var(--card2)", border: "1px solid var(--border2)", color: "var(--text)", outline: "none", borderRadius: 10, padding: "10px 14px", fontSize: 13, width: "100%" } as React.CSSProperties,
  label: { display: "block", fontSize: 11, fontWeight: 600, color: "var(--muted)", marginBottom: 6, textTransform: "uppercase" as const, letterSpacing: "0.05em" },
};

export default function ChaptersPage() {
  const [mangas, setMangas] = useState<Manga[]>([]);
  const [sel, setSel] = useState<Manga | null>(null);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [num, setNum] = useState(""); const [title, setTitle] = useState(""); const [pages, setPages] = useState<File[]>([]);
  const [loading, setLoading] = useState(false); const [progress, setProgress] = useState("");

  useEffect(() => { fetch("/api/manga").then(r => r.json()).then(setMangas); }, []);

  async function loadChapters(m: Manga) {
    setSel(m);
    const r = await fetch(`/api/manga/${m.slug}`);
    setChapters((await r.json()).chapters || []);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!sel || !num || !pages.length) return;
    setLoading(true); setProgress("Sayfalar yükleniyor...");

    // Upload in chunks of 10 to avoid Vercel 4.5MB limit
    const allUrls: string[] = [];
    const chunkSize = 10;
    for (let i = 0; i < pages.length; i += chunkSize) {
      const chunk = pages.slice(i, i + chunkSize);
      setProgress(`Sayfalar yükleniyor... (${Math.min(i + chunkSize, pages.length)}/${pages.length})`);
      const fd = new FormData();
      chunk.forEach(f => fd.append("files", f));
      fd.append("folder", `chapters/${sel.slug}/${num}`);
      const { urls } = await (await fetch("/api/upload", { method: "POST", body: fd })).json();
      allUrls.push(...urls);
    }

    setProgress("Bölüm kaydediliyor...");
    await fetch("/api/chapters", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ mangaId: sel.id, number: parseFloat(num), title: title || undefined, pages: allUrls }) });
    setNum(""); setTitle(""); setPages([]); setProgress(""); setLoading(false); loadChapters(sel);
  }

  async function delChapter(id: number) {
    if (!confirm("Bu bölümü silmek istediğinize emin misiniz?")) return;
    await fetch(`/api/chapters/${id}`, { method: "DELETE" }); if (sel) loadChapters(sel);
  }

  return (
    <div style={{ maxWidth: 960, margin: "0 auto", padding: "32px 20px", minHeight: "100vh" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 28 }}>
        <Link href="/admin" style={{ fontSize: 13, color: "var(--muted)", textDecoration: "none" }}>← Admin</Link>
        <span style={{ color: "var(--border2)" }}>/</span>
        <h1 style={{ fontWeight: 800, fontSize: 20 }}>Bölüm Yönetimi</h1>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "220px 1fr", gap: 16 }}>
        {/* Manga list */}
        <div style={S.card}>
          <p style={S.label}>Seri Seç</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 4, maxHeight: 420, overflowY: "auto" }}>
            {mangas.map(m => (
              <button key={m.id} onClick={() => loadChapters(m)} style={{
                textAlign: "left", padding: "9px 12px", borderRadius: 8, fontSize: 13, border: "none", cursor: "pointer",
                background: sel?.id === m.id ? "linear-gradient(135deg, var(--accent), var(--accent2))" : "transparent",
                color: sel?.id === m.id ? "#fff" : "var(--text2)",
                fontWeight: sel?.id === m.id ? 600 : 400,
              }}>{m.title}</button>
            ))}
            {!mangas.length && <p style={{ fontSize: 12, color: "var(--muted)", padding: "8px 0" }}>Önce seri ekleyin</p>}
          </div>
        </div>

        {/* Right panel */}
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {sel ? (
            <>
              {/* Add form */}
              <div style={S.card}>
                <p style={{ fontWeight: 700, fontSize: 14, marginBottom: 16 }}>
                  <span style={{ color: "var(--accent3)" }}>{sel.title}</span> — Yeni Bölüm
                </p>
                <form onSubmit={handleSubmit}>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 14 }}>
                    <div>
                      <label style={S.label}>Bölüm No *</label>
                      <input type="number" step="0.1" placeholder="1" value={num} onChange={e => setNum(e.target.value)} required style={S.input} />
                    </div>
                    <div>
                      <label style={S.label}>Başlık (opsiyonel)</label>
                      <input placeholder="Bölüm başlığı" value={title} onChange={e => setTitle(e.target.value)} style={S.input} />
                    </div>
                  </div>
                  <div style={{ marginBottom: 14 }}>
                    <label style={S.label}>Sayfa Görselleri * ({pages.length} dosya)</label>
                    <div style={{ border: `2px dashed ${pages.length ? "var(--accent3)" : "var(--border2)"}`, borderRadius: 10, padding: "20px", textAlign: "center", transition: "border-color 0.2s" }}>
                      <input type="file" accept="image/*" multiple onChange={e => setPages(Array.from(e.target.files || []))} id="pg" style={{ display: "none" }} />
                      <label htmlFor="pg" style={{ cursor: "pointer" }}>
                        <p style={{ fontSize: 22, marginBottom: 6 }}>🖼️</p>
                        <p style={{ fontSize: 13, fontWeight: 500, color: pages.length ? "var(--accent3)" : "var(--text2)" }}>
                          {pages.length ? `${pages.length} sayfa seçildi` : "Dosyaları seç veya sürükle"}
                        </p>
                        <p style={{ fontSize: 11, color: "var(--muted)", marginTop: 4 }}>Çoklu seçim · Sıralamaya dikkat et</p>
                      </label>
                    </div>
                  </div>
                  {progress && <p style={{ fontSize: 12, color: "var(--accent3)", marginBottom: 12 }}>⏳ {progress}</p>}
                  <button type="submit" disabled={loading || !num || !pages.length} className="btn-purple" style={{ padding: "10px 24px", borderRadius: 10, fontSize: 13 }}>
                    {loading ? "Yükleniyor..." : "Bölüm Ekle"}
                  </button>
                </form>
              </div>

              {/* Chapter list */}
              <div style={S.card}>
                <p style={{ fontWeight: 700, fontSize: 14, marginBottom: 14 }}>Mevcut Bölümler ({chapters.length})</p>
                <div style={{ display: "flex", flexDirection: "column", gap: 6, maxHeight: 280, overflowY: "auto" }}>
                  {chapters.map(ch => (
                    <div key={ch.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 12px", background: "var(--card2)", borderRadius: 8 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <span style={{ width: 28, height: 28, borderRadius: 6, background: "var(--border)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, color: "var(--accent3)", flexShrink: 0 }}>{ch.number}</span>
                        <span style={{ fontSize: 13 }}>{ch.title || `Bölüm ${ch.number}`}</span>
                      </div>
                      <button onClick={() => delChapter(ch.id)} style={{ padding: "4px 12px", borderRadius: 6, fontSize: 11, background: "rgba(239,68,68,0.1)", color: "var(--red)", border: "1px solid rgba(239,68,68,0.2)", cursor: "pointer" }}>Sil</button>
                    </div>
                  ))}
                  {!chapters.length && <p style={{ fontSize: 13, color: "var(--muted)", textAlign: "center", padding: "16px 0" }}>Henüz bölüm yok</p>}
                </div>
              </div>
            </>
          ) : (
            <div style={{ ...S.card, textAlign: "center", padding: "60px 20px", color: "var(--muted)" }}>
              <p style={{ fontSize: 32, marginBottom: 12 }}>👈</p>
              <p style={{ fontSize: 14 }}>Sol taraftan bir seri seçin</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
