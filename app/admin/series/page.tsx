"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";

interface Manga {
  id: number; title: string; slug: string; cover?: string;
  genre?: string; status: string; author?: string; description?: string;
  _count?: { chapters: number };
}

const empty = { title: "", description: "", genre: "", status: "ongoing", author: "", cover: "" };

const S = {
  card: { background: "var(--card)", border: "1px solid var(--border)", borderRadius: 14, padding: 24 } as React.CSSProperties,
  input: { background: "var(--card2)", border: "1px solid var(--border2)", color: "var(--text)", outline: "none", borderRadius: 10, padding: "10px 14px", fontSize: 13, width: "100%" } as React.CSSProperties,
  label: { display: "block", fontSize: 11, fontWeight: 600, color: "var(--muted)", marginBottom: 6, textTransform: "uppercase" as const, letterSpacing: "0.05em" },
};

export default function SeriesPage() {
  const [mangas, setMangas] = useState<Manga[]>([]);
  const [form, setForm] = useState(empty);
  const [editing, setEditing] = useState<Manga | null>(null);
  const [loading, setLoading] = useState(false);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState("");

  const fetch_ = async () => { const r = await fetch("/api/manga"); setMangas(await r.json()); };
  useEffect(() => { fetch_(); }, []);

  async function uploadCover() {
    if (!coverFile) return form.cover || null;
    const fd = new FormData(); fd.append("files", coverFile); fd.append("folder", "covers");
    const r = await fetch("/api/upload", { method: "POST", body: fd });
    return (await r.json()).urls?.[0] || null;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault(); setLoading(true);
    const cover = await uploadCover();
    const payload = { ...form, cover };
    if (editing) {
      await fetch(`/api/manga/${editing.slug}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
    } else {
      await fetch("/api/manga", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
    }
    setForm(empty); setEditing(null); setCoverFile(null); setCoverPreview(""); setLoading(false); fetch_();
  }

  function startEdit(m: Manga) {
    setEditing(m);
    setForm({ title: m.title, description: m.description || "", genre: m.genre || "", status: m.status, author: m.author || "", cover: m.cover || "" });
    setCoverPreview(m.cover || "");
  }

  async function del(slug: string) {
    if (!confirm("Bu seriyi silmek istediğinize emin misiniz?")) return;
    await fetch(`/api/manga/${slug}`, { method: "DELETE" }); fetch_();
  }

  return (
    <div style={{ maxWidth: 960, margin: "0 auto", padding: "32px 20px", minHeight: "100vh" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 28 }}>
        <Link href="/admin" style={{ fontSize: 13, color: "var(--muted)", textDecoration: "none" }}>← Admin</Link>
        <span style={{ color: "var(--border2)" }}>/</span>
        <h1 style={{ fontWeight: 800, fontSize: 20 }}>Seri Yönetimi</h1>
      </div>

      {/* Form */}
      <div style={S.card} className="anim-up" >
        <h2 style={{ fontWeight: 700, fontSize: 15, marginBottom: 20 }}>{editing ? "✏️ Seri Düzenle" : "➕ Yeni Seri Ekle"}</h2>
        <form onSubmit={handleSubmit}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>
            <div>
              <label style={S.label}>Başlık *</label>
              <input style={S.input} placeholder="Manga başlığı" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required />
            </div>
            <div>
              <label style={S.label}>Yazar</label>
              <input style={S.input} placeholder="Yazar adı" value={form.author} onChange={e => setForm({ ...form, author: e.target.value })} />
            </div>
            <div>
              <label style={S.label}>Tür</label>
              <input style={S.input} placeholder="Aksiyon, Romantik..." value={form.genre} onChange={e => setForm({ ...form, genre: e.target.value })} />
            </div>
            <div>
              <label style={S.label}>Durum</label>
              <select style={S.input} value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}>
                <option value="ongoing">Devam Ediyor</option>
                <option value="completed">Tamamlandı</option>
              </select>
            </div>
            <div style={{ gridColumn: "1 / -1" }}>
              <label style={S.label}>Açıklama</label>
              <textarea style={{ ...S.input, resize: "vertical", minHeight: 80 }} placeholder="Manga açıklaması..." value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
            </div>
            <div style={{ gridColumn: "1 / -1" }}>
              <label style={S.label}>Kapak Görseli</label>
              <input type="file" accept="image/*,.avif" onChange={e => { const f = e.target.files?.[0]; if (f) { setCoverFile(f); setCoverPreview(URL.createObjectURL(f)); } }} style={{ fontSize: 13, color: "var(--text2)" }} />
              {coverPreview && (
                <div style={{ position: "relative", width: 72, height: 100, borderRadius: 8, overflow: "hidden", marginTop: 10, border: "1px solid var(--border2)" }}>
                  <Image src={coverPreview} alt="preview" fill style={{ objectFit: "cover" }} />
                </div>
              )}
            </div>
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <button type="submit" disabled={loading} className="btn-purple" style={{ padding: "10px 24px", borderRadius: 10, fontSize: 13 }}>
              {loading ? "Kaydediliyor..." : editing ? "Güncelle" : "Ekle"}
            </button>
            {editing && (
              <button type="button" onClick={() => { setEditing(null); setForm(empty); setCoverPreview(""); }} className="btn-ghost" style={{ padding: "10px 20px", borderRadius: 10, fontSize: 13 }}>
                İptal
              </button>
            )}
          </div>
        </form>
      </div>

      {/* List */}
      <div style={{ marginTop: 24 }}>
        <p style={{ fontSize: 13, fontWeight: 600, color: "var(--muted)", marginBottom: 12 }}>SERİLER ({mangas.length})</p>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {mangas.map(m => (
            <div key={m.id} style={{ display: "flex", alignItems: "center", gap: 14, padding: "12px 16px", background: "var(--card)", border: "1px solid var(--border)", borderRadius: 12 }}>
              <div style={{ width: 38, height: 52, borderRadius: 6, overflow: "hidden", flexShrink: 0, background: "var(--card2)", position: "relative" }}>
                {m.cover ? <Image src={m.cover} alt={m.title} fill style={{ objectFit: "cover" }} /> : <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>📚</div>}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontWeight: 600, fontSize: 14, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{m.title}</p>
                <p style={{ fontSize: 12, color: "var(--muted)", marginTop: 2 }}>{m.genre || "—"} · {m._count?.chapters ?? 0} bölüm</p>
              </div>
              <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
                <button onClick={() => startEdit(m)} className="btn-ghost" style={{ padding: "6px 14px", borderRadius: 8, fontSize: 12 }}>Düzenle</button>
                <button onClick={() => del(m.slug)} style={{ padding: "6px 14px", borderRadius: 8, fontSize: 12, background: "rgba(239,68,68,0.1)", color: "var(--red)", border: "1px solid rgba(239,68,68,0.2)", cursor: "pointer" }}>Sil</button>
              </div>
            </div>
          ))}
          {mangas.length === 0 && <p style={{ textAlign: "center", padding: "32px 0", fontSize: 13, color: "var(--muted)" }}>Henüz seri yok</p>}
        </div>
      </div>
    </div>
  );
}
