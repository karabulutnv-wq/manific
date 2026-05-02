"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import JSZip from "jszip";

interface Manga { id: number; title: string; slug: string; }
interface Chapter { id: number; number: number; title?: string; createdAt: string; }

const S = {
  card: { background: "var(--card)", border: "1px solid var(--border)", borderRadius: 14, padding: 20 } as React.CSSProperties,
  input: { background: "var(--card2)", border: "1px solid var(--border2)", color: "var(--text)", outline: "none", borderRadius: 10, padding: "10px 14px", fontSize: 13, width: "100%" } as React.CSSProperties,
  label: { display: "block", fontSize: 11, fontWeight: 600, color: "var(--muted)", marginBottom: 6, textTransform: "uppercase" as const, letterSpacing: "0.05em" },
};

const IMAGE_EXTS = ["jpg", "jpeg", "png", "webp", "gif", "avif"];

export default function ChaptersPage() {
  const [mangas, setMangas] = useState<Manga[]>([]);
  const [sel, setSel] = useState<Manga | null>(null);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [num, setNum] = useState("");
  const [title, setTitle] = useState("");
  const [pages, setPages] = useState<File[]>([]);
  const [uploadMode, setUploadMode] = useState<"files" | "zip">("files");
  const [zipFile, setZipFile] = useState<File | null>(null);
  const [zipPreview, setZipPreview] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState("");

  useEffect(() => { fetch("/api/manga").then(r => r.json()).then(setMangas); }, []);

  async function loadChapters(m: Manga) {
    setSel(m);
    const r = await fetch(`/api/manga/${m.slug}`);
    setChapters((await r.json()).chapters || []);
  }

  async function handleZipSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setZipFile(file);
    setProgress("ZIP açılıyor...");

    const zip = await JSZip.loadAsync(file);
    const names: string[] = [];
    zip.forEach((path) => {
      const ext = path.split(".").pop()?.toLowerCase() || "";
      if (IMAGE_EXTS.includes(ext) && !path.startsWith("__MACOSX")) {
        names.push(path);
      }
    });
    names.sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
    setZipPreview(names);
    setProgress("");
  }

  async function extractZipToFiles(): Promise<File[]> {
    if (!zipFile) return [];
    const zip = await JSZip.loadAsync(zipFile);
    const names: string[] = [];
    zip.forEach((path) => {
      const ext = path.split(".").pop()?.toLowerCase() || "";
      if (IMAGE_EXTS.includes(ext) && !path.startsWith("__MACOSX")) names.push(path);
    });
    names.sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));

    const files: File[] = [];
    for (const name of names) {
      const blob = await zip.file(name)!.async("blob");
      const ext = name.split(".").pop() || "jpg";
      const f = new File([blob], name.split("/").pop() || name, { type: `image/${ext}` });
      files.push(f);
    }
    return files;
  }

  async function uploadPages(filesToUpload: File[]): Promise<string[]> {
    const allUrls: string[] = [];
    const chunkSize = 10;
    for (let i = 0; i < filesToUpload.length; i += chunkSize) {
      const chunk = filesToUpload.slice(i, i + chunkSize);
      setProgress(`Yükleniyor... (${Math.min(i + chunkSize, filesToUpload.length)}/${filesToUpload.length})`);
      const fd = new FormData();
      chunk.forEach(f => fd.append("files", f));
      fd.append("folder", `chapters/${sel!.slug}/${num}`);
      const { urls } = await (await fetch("/api/upload", { method: "POST", body: fd })).json();
      allUrls.push(...urls);
    }
    return allUrls;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!sel || !num) return;
    if (uploadMode === "files" && !pages.length) return;
    if (uploadMode === "zip" && !zipFile) return;

    setLoading(true);

    let filesToUpload = pages;
    if (uploadMode === "zip") {
      setProgress("ZIP dosyası açılıyor...");
      filesToUpload = await extractZipToFiles();
    }

    const allUrls = await uploadPages(filesToUpload);

    setProgress("Bölüm kaydediliyor...");
    await fetch("/api/chapters", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mangaId: sel.id, number: parseFloat(num), title: title || undefined, pages: allUrls }),
    });

    setNum(""); setTitle(""); setPages([]); setZipFile(null); setZipPreview([]);
    setProgress(""); setLoading(false);
    loadChapters(sel);
  }

  async function delChapter(id: number) {
    if (!confirm("Bu bölümü silmek istediğinize emin misiniz?")) return;
    await fetch(`/api/chapters/${id}`, { method: "DELETE" });
    if (sel) loadChapters(sel);
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

                  {/* Upload mode toggle */}
                  <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
                    {(["files", "zip"] as const).map(mode => (
                      <button
                        key={mode}
                        type="button"
                        onClick={() => { setUploadMode(mode); setPages([]); setZipFile(null); setZipPreview([]); }}
                        style={{
                          padding: "7px 16px", borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: "pointer", border: "none",
                          background: uploadMode === mode ? "linear-gradient(135deg, var(--accent), var(--accent2))" : "var(--card2)",
                          color: uploadMode === mode ? "#fff" : "var(--text2)",
                        }}
                      >
                        {mode === "files" ? "🖼️ Resim Dosyaları" : "🗜️ ZIP Dosyası"}
                      </button>
                    ))}
                  </div>

                  {/* File upload */}
                  {uploadMode === "files" && (
                    <div style={{ marginBottom: 14 }}>
                      <label style={S.label}>Sayfa Görselleri * ({pages.length} dosya)</label>
                      <div style={{ border: `2px dashed ${pages.length ? "var(--accent3)" : "var(--border2)"}`, borderRadius: 10, padding: "20px", textAlign: "center" }}>
                        <input type="file" accept="image/*,.avif" multiple onChange={e => setPages(Array.from(e.target.files || []))} id="pg" style={{ display: "none" }} />
                        <label htmlFor="pg" style={{ cursor: "pointer" }}>
                          <p style={{ fontSize: 22, marginBottom: 6 }}>🖼️</p>
                          <p style={{ fontSize: 13, fontWeight: 500, color: pages.length ? "var(--accent3)" : "var(--text2)" }}>
                            {pages.length ? `${pages.length} sayfa seçildi` : "Dosyaları seç veya sürükle"}
                          </p>
                          <p style={{ fontSize: 11, color: "var(--muted)", marginTop: 4 }}>Çoklu seçim · Sıralamaya dikkat et</p>
                        </label>
                      </div>
                    </div>
                  )}

                  {/* ZIP upload */}
                  {uploadMode === "zip" && (
                    <div style={{ marginBottom: 14 }}>
                      <label style={S.label}>ZIP Dosyası *</label>
                      <div style={{ border: `2px dashed ${zipFile ? "var(--accent3)" : "var(--border2)"}`, borderRadius: 10, padding: "20px", textAlign: "center" }}>
                        <input type="file" accept=".zip" onChange={handleZipSelect} id="zip" style={{ display: "none" }} />
                        <label htmlFor="zip" style={{ cursor: "pointer" }}>
                          <p style={{ fontSize: 22, marginBottom: 6 }}>🗜️</p>
                          <p style={{ fontSize: 13, fontWeight: 500, color: zipFile ? "var(--accent3)" : "var(--text2)" }}>
                            {zipFile ? zipFile.name : "ZIP dosyası seç"}
                          </p>
                          <p style={{ fontSize: 11, color: "var(--muted)", marginTop: 4 }}>
                            ZIP içindeki resimler otomatik sıralanır
                          </p>
                        </label>
                      </div>

                      {/* ZIP preview */}
                      {zipPreview.length > 0 && (
                        <div style={{ marginTop: 10, padding: "10px 14px", background: "var(--card2)", borderRadius: 8 }}>
                          <p style={{ fontSize: 12, color: "var(--accent3)", fontWeight: 600, marginBottom: 6 }}>
                            ✓ {zipPreview.length} resim bulundu
                          </p>
                          <div style={{ maxHeight: 100, overflowY: "auto" }}>
                            {zipPreview.slice(0, 5).map((name, i) => (
                              <p key={i} style={{ fontSize: 11, color: "var(--muted)", lineHeight: 1.8 }}>
                                {i + 1}. {name.split("/").pop()}
                              </p>
                            ))}
                            {zipPreview.length > 5 && (
                              <p style={{ fontSize: 11, color: "var(--muted)" }}>... ve {zipPreview.length - 5} dosya daha</p>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {progress && (
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                      <div style={{ width: 14, height: 14, borderRadius: "50%", border: "2px solid var(--accent3)", borderTopColor: "transparent", animation: "spin 0.8s linear infinite" }} />
                      <p style={{ fontSize: 12, color: "var(--accent3)" }}>{progress}</p>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={loading || !num || (uploadMode === "files" ? !pages.length : !zipFile)}
                    className="btn-purple"
                    style={{ padding: "10px 24px", borderRadius: 10, fontSize: 13 }}
                  >
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

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
