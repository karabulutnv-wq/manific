"use client";
import { useSession, signOut } from "next-auth/react";
import { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";

interface Avatar { id: number; url: string; name?: string; }

export default function ProfilPage() {
  const { data: session, update } = useSession();
  const router = useRouter();
  const user = session?.user as { role?: string; avatar?: string; username?: string; id?: string } | undefined;

  const [avatars, setAvatars] = useState<Avatar[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!session) { router.push("/giris"); return; }
    if (user?.role === "admin") { router.push("/admin"); return; }
    fetch("/api/avatars").then((r) => r.json()).then(setAvatars);
    setSelected(user?.avatar || null);
  }, [session, router, user?.role, user?.avatar]);

  async function saveAvatar() {
    if (!selected) return;
    setSaving(true);
    await fetch("/api/user/avatar", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ avatarUrl: selected }),
    });
    await update({ avatar: selected });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  if (!session) return null;

  return (
    <div style={{ background: "var(--bg)", minHeight: "100vh" }}>
      <div className="max-w-2xl mx-auto px-4 py-10 fade-up">
        {/* Profile card */}
        <div className="rounded-2xl p-6 mb-5 flex items-center gap-5" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
          <div
            className="relative w-20 h-20 rounded-2xl overflow-hidden flex-shrink-0 pulse-glow"
            style={{ border: "2px solid var(--accent2)" }}
          >
            {selected ? (
              <Image src={selected} alt="avatar" fill className="object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-3xl font-black" style={{ background: "linear-gradient(135deg, var(--accent), var(--accent2))" }}>
                {(user?.username || "?")[0].toUpperCase()}
              </div>
            )}
          </div>
          <div className="flex-1">
            <h1 className="text-xl font-black">{user?.username}</h1>
            <span className="badge mt-1 inline-block" style={{ background: "rgba(108,60,225,0.2)", color: "var(--accent3)", border: "1px solid rgba(108,60,225,0.3)" }}>ÜYE</span>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="text-sm px-4 py-2 rounded-xl transition-colors hover:bg-white/5 flex-shrink-0"
            style={{ color: "var(--danger)", border: "1px solid rgba(239,68,68,0.2)" }}
          >
            Çıkış
          </button>
        </div>

        {/* Avatar picker */}
        <div className="rounded-2xl p-6" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="font-bold">Profil Fotoğrafı</h2>
              <p className="text-xs mt-0.5" style={{ color: "var(--muted)" }}>{avatars.length} avatar mevcut</p>
            </div>
            {selected && selected !== user?.avatar && (
              <button onClick={saveAvatar} disabled={saving} className="btn-primary px-5 py-2 rounded-xl text-sm">
                {saving ? "Kaydediliyor..." : "Kaydet"}
              </button>
            )}
            {saved && (
              <span className="text-sm font-semibold flex items-center gap-1" style={{ color: "var(--success)" }}>
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                Kaydedildi
              </span>
            )}
          </div>

          {avatars.length === 0 ? (
            <div className="text-center py-12" style={{ color: "var(--muted)" }}>
              <p className="text-4xl mb-3">🖼️</p>
              <p className="text-sm">Henüz avatar eklenmemiş</p>
              <p className="text-xs mt-1">Admin panelden avatar eklenebilir</p>
            </div>
          ) : (
            <div className="grid grid-cols-5 sm:grid-cols-7 gap-3">
              {avatars.map((av) => (
                <button
                  key={av.id}
                  onClick={() => setSelected(av.url)}
                  className="relative aspect-square rounded-xl overflow-hidden transition-all"
                  style={{
                    border: selected === av.url ? "2px solid var(--accent2)" : "2px solid var(--border)",
                    boxShadow: selected === av.url ? "0 0 16px var(--accent-glow)" : "none",
                    transform: selected === av.url ? "scale(1.08)" : "scale(1)",
                  }}
                >
                  <Image src={av.url} alt={av.name || "avatar"} fill className="object-cover" />
                  {selected === av.url && (
                    <div className="absolute inset-0 flex items-center justify-center" style={{ background: "rgba(108,60,225,0.35)" }}>
                      <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
