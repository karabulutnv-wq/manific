"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";

interface Avatar { id: number; url: string; name?: string; }

export default function AvatarsPage() {
  const [avatars, setAvatars] = useState<Avatar[]>([]);
  const [files, setFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [previews, setPreviews] = useState<string[]>([]);

  async function fetchAvatars() {
    const res = await fetch("/api/avatars");
    setAvatars(await res.json());
  }

  useEffect(() => { fetchAvatars(); }, []);

  function handleFiles(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = Array.from(e.target.files || []);
    setFiles(selected);
    setPreviews(selected.map((f) => URL.createObjectURL(f)));
  }

  async function handleUpload(e: React.FormEvent) {
    e.preventDefault();
    if (!files.length) return;
    setLoading(true);

    const fd = new FormData();
    files.forEach((f) => fd.append("files", f));
    fd.append("folder", "avatars");
    const uploadRes = await fetch("/api/upload", { method: "POST", body: fd });
    const { urls } = await uploadRes.json();

    for (const url of urls) {
      await fetch("/api/avatars", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });
    }

    setFiles([]);
    setPreviews([]);
    setLoading(false);
    fetchAvatars();
  }

  async function handleDelete(id: number) {
    if (!confirm("Bu avatarı silmek istediğinize emin misiniz?")) return;
    await fetch("/api/avatars", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    fetchAvatars();
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 fade-in">
      <div className="flex items-center gap-4 mb-6">
        <Link href="/admin" className="text-sm hover:opacity-80" style={{ color: "var(--muted)" }}>← Admin</Link>
        <h1 className="text-2xl font-bold">Avatar Yönetimi</h1>
      </div>

      {/* Upload form */}
      <form
        onSubmit={handleUpload}
        className="glass rounded-2xl p-6 mb-6"
      >
        <h2 className="font-semibold mb-4">Yeni Avatar Yükle</h2>
        <div
          className="border-2 border-dashed rounded-xl p-6 text-center mb-4 transition-colors"
          style={{ borderColor: files.length ? "var(--accent)" : "var(--border)" }}
        >
          <input
            type="file"
            accept="image/*,.avif"
            multiple
            onChange={handleFiles}
            className="hidden"
            id="avatar-upload"
          />
          <label htmlFor="avatar-upload" className="cursor-pointer">
            <p className="text-3xl mb-2">🖼️</p>
            <p className="text-sm font-medium">Dosya seç veya sürükle</p>
            <p className="text-xs mt-1" style={{ color: "var(--muted)" }}>PNG, JPG, GIF, WebP</p>
          </label>
        </div>

        {previews.length > 0 && (
          <div className="flex flex-wrap gap-3 mb-4">
            {previews.map((p, i) => (
              <div key={i} className="relative w-16 h-16 rounded-xl overflow-hidden" style={{ border: "1px solid var(--border)" }}>
                <Image src={p} alt="preview" fill className="object-cover" />
              </div>
            ))}
          </div>
        )}

        <button
          type="submit"
          disabled={loading || !files.length}
          className="btn-accent px-6 py-2.5 rounded-xl font-semibold text-sm"
        >
          {loading ? "Yükleniyor..." : `${files.length} Dosya Yükle`}
        </button>
      </form>

      {/* Avatar grid */}
      <div className="glass rounded-2xl p-6">
        <h2 className="font-semibold mb-4">Mevcut Avatarlar ({avatars.length})</h2>
        {avatars.length === 0 ? (
          <p className="text-center py-8 text-sm" style={{ color: "var(--muted)" }}>Henüz avatar yok</p>
        ) : (
          <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-3">
            {avatars.map((av) => (
              <div key={av.id} className="group relative aspect-square rounded-xl overflow-hidden" style={{ border: "1px solid var(--border)" }}>
                <Image src={av.url} alt="avatar" fill className="object-cover" />
                <button
                  onClick={() => handleDelete(av.id)}
                  className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  style={{ background: "rgba(239,68,68,0.7)" }}
                >
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
