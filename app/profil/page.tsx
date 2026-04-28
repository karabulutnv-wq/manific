"use client";
import { useSession, signOut } from "next-auth/react";
import { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";

interface Profile { id: number; name: string; avatar?: string | null; isActive: boolean; }
interface Avatar { id: number; url: string; name?: string; }

type View = "select" | "avatarPicker";

export default function ProfilPage() {
  const { data: session, update: updateSession } = useSession();
  const router = useRouter();
  const user = session?.user as { id?: string; role?: string; username?: string; avatar?: string } | undefined;

  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [avatars, setAvatars] = useState<Avatar[]>([]);
  const [view, setView] = useState<View>("select");
  const [editingProfile, setEditingProfile] = useState<Profile | null>(null);
  const [newName, setNewName] = useState("");
  const [addingNew, setAddingNew] = useState(false);
  const [newProfileName, setNewProfileName] = useState("");
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    if (!session) { router.push("/giris"); return; }
    loadProfiles();
    fetch("/api/avatars").then(r => r.json()).then(setAvatars);
  }, [session]);

  async function loadProfiles() {
    const r = await fetch("/api/profiles");
    setProfiles(await r.json());
  }

  async function addProfile() {
    if (!newProfileName.trim()) return;
    setSaving(true);
    const r = await fetch("/api/profiles", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newProfileName.trim() }),
    });
    const d = await r.json();
    if (!r.ok) { setMsg(d.error); } else { setNewProfileName(""); setAddingNew(false); loadProfiles(); }
    setSaving(false);
  }

  async function setActive(id: number) {
    await fetch("/api/profiles", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, setActive: true }) });
    // Aktif profilin bilgilerini al
    const updated = profiles.find(p => p.id === id);
    if (updated) {
      await updateSession({ avatar: updated.avatar || null, activeProfileName: updated.name });
    }
    router.push("/");
  }

  async function saveAvatar(profileId: number, avatarUrl: string) {
    setSaving(true);
    await fetch("/api/profiles", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: profileId, avatar: avatarUrl }) });
    const p = profiles.find(x => x.id === profileId);
    if (p?.isActive) {
      await updateSession({ avatar: avatarUrl, activeProfileName: p.name });
    }
    loadProfiles();
    setView("select");
    setEditingProfile(null);
    setSaving(false);
  }

  async function deleteProfile(id: number) {
    if (!confirm("Bu profili silmek istediğine emin misin?")) return;
    await fetch("/api/profiles", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) });
    loadProfiles();
  }

  async function renameProfile(id: number) {
    if (!newName.trim()) return;
    await fetch("/api/profiles", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, name: newName.trim() }) });
    setNewName(""); setEditingProfile(null); loadProfiles();
  }

  if (!session) return null;

  // Avatar picker view
  if (view === "avatarPicker" && editingProfile) {
    return (
      <div style={{ background: "var(--bg)", minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 24 }}>
        <h2 style={{ fontWeight: 900, fontSize: 22, marginBottom: 6 }}>{editingProfile.name}</h2>
        <p style={{ fontSize: 14, color: "var(--text2)", marginBottom: 32 }}>Avatar seç</p>

        {avatars.length === 0 ? (
          <div style={{ textAlign: "center", color: "var(--muted)" }}>
            <p style={{ fontSize: 36, marginBottom: 12 }}>🖼️</p>
            <p>Admin henüz avatar eklememiş</p>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(100px, 1fr))", gap: 16, maxWidth: 600, width: "100%" }}>
            {avatars.map(av => (
              <button
                key={av.id}
                onClick={() => saveAvatar(editingProfile.id, av.url)}
                disabled={saving}
                style={{
                  position: "relative", aspectRatio: "1", borderRadius: 14, overflow: "hidden",
                  border: editingProfile.avatar === av.url ? "3px solid var(--accent2)" : "2px solid var(--border)",
                  cursor: "pointer", background: "var(--card2)", padding: 0,
                  transform: editingProfile.avatar === av.url ? "scale(1.05)" : "scale(1)",
                  transition: "all 0.2s",
                }}
              >
                <Image src={av.url} alt="avatar" fill style={{ objectFit: "cover" }} />
                {editingProfile.avatar === av.url && (
                  <div style={{ position: "absolute", inset: 0, background: "rgba(124,58,237,0.35)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <svg style={{ width: 24, height: 24, color: "#fff" }} fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
              </button>
            ))}
          </div>
        )}

        <button
          onClick={() => { setView("select"); setEditingProfile(null); }}
          style={{ marginTop: 32, padding: "10px 28px", borderRadius: 12, background: "var(--card2)", border: "1px solid var(--border2)", color: "var(--text2)", cursor: "pointer", fontSize: 14 }}
        >
          ← Geri
        </button>
      </div>
    );
  }

  // Main profile select view
  return (
    <div style={{ background: "var(--bg)", minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <h1 style={{ fontWeight: 900, fontSize: 28, marginBottom: 8 }}>Kim Okuyor?</h1>
      <p style={{ fontSize: 14, color: "var(--text2)", marginBottom: 48 }}>Profilini seç veya düzenle</p>

      {msg && (
        <div style={{ marginBottom: 20, padding: "8px 16px", borderRadius: 10, background: "rgba(239,68,68,0.1)", color: "var(--red)", fontSize: 13, border: "1px solid rgba(239,68,68,0.2)" }}>
          {msg}
        </div>
      )}

      <div style={{ display: "flex", flexWrap: "wrap", gap: 28, justifyContent: "center", maxWidth: 600 }}>
        {profiles.map(p => (
          <div key={p.id} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
            {/* Avatar */}
            <button
              onClick={() => setActive(p.id)}
              style={{
                width: 100, height: 100, borderRadius: 16, overflow: "hidden", position: "relative",
                border: p.isActive ? "3px solid var(--accent2)" : "2px solid var(--border2)",
                boxShadow: p.isActive ? "0 0 20px var(--glow)" : "none",
                cursor: "pointer", background: "var(--card2)", padding: 0,
                transition: "all 0.2s",
              }}
            >
              {p.avatar ? (
                <Image src={p.avatar} alt={p.name} fill style={{ objectFit: "cover" }} />
              ) : (
                <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 36, fontWeight: 900, background: "linear-gradient(135deg, var(--accent), var(--accent2))", color: "#fff" }}>
                  {p.name[0].toUpperCase()}
                </div>
              )}
              {p.isActive && (
                <div style={{ position: "absolute", bottom: 4, right: 4, width: 20, height: 20, borderRadius: "50%", background: "var(--green)", border: "2px solid var(--bg)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <svg style={{ width: 11, height: 11, color: "#fff" }} fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
              )}
            </button>

            {/* Name — click to rename */}
            {editingProfile?.id === p.id && !view.startsWith("avatar") ? (
              <div style={{ display: "flex", gap: 4 }}>
                <input
                  value={newName}
                  onChange={e => setNewName(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && renameProfile(p.id)}
                  autoFocus
                  style={{ width: 80, background: "var(--card2)", border: "1px solid var(--accent3)", color: "var(--text)", outline: "none", borderRadius: 6, padding: "3px 8px", fontSize: 12, textAlign: "center" }}
                />
                <button onClick={() => renameProfile(p.id)} style={{ background: "var(--accent)", border: "none", borderRadius: 6, color: "#fff", cursor: "pointer", padding: "3px 8px", fontSize: 11 }}>✓</button>
              </div>
            ) : (
              <button
                onClick={() => { setEditingProfile(p); setNewName(p.name); }}
                style={{ background: "none", border: "none", cursor: "pointer", fontSize: 13, fontWeight: 600, color: "var(--text)", padding: 0 }}
              >
                {p.name}
              </button>
            )}

            {/* Actions */}
            <div style={{ display: "flex", gap: 6 }}>
              <button
                onClick={() => { setEditingProfile(p); setView("avatarPicker"); }}
                style={{ fontSize: 10, padding: "3px 10px", borderRadius: 6, background: "transparent", border: "1px solid var(--border2)", color: "var(--accent3)", cursor: "pointer" }}
              >
                ✏️ Avatar Değiştir
              </button>
              <button
                onClick={() => deleteProfile(p.id)}
                style={{ fontSize: 10, padding: "3px 8px", borderRadius: 6, background: "transparent", border: "1px solid rgba(239,68,68,0.3)", color: "var(--red)", cursor: "pointer" }}
              >
                ✕
              </button>
            </div>
          </div>
        ))}

        {/* Add profile slot */}
        {profiles.length < 4 && (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
            {addingNew ? (
              <>
                <div style={{ width: 100, height: 100, borderRadius: 16, border: "2px dashed var(--accent3)", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--card2)" }}>
                  <span style={{ fontSize: 36, color: "var(--accent3)" }}>+</span>
                </div>
                <input
                  placeholder="İsim gir..."
                  value={newProfileName}
                  onChange={e => setNewProfileName(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && addProfile()}
                  autoFocus
                  style={{ width: 100, background: "var(--card2)", border: "1px solid var(--accent3)", color: "var(--text)", outline: "none", borderRadius: 8, padding: "5px 8px", fontSize: 12, textAlign: "center" }}
                />
                <div style={{ display: "flex", gap: 4 }}>
                  <button onClick={addProfile} disabled={saving || !newProfileName.trim()} style={{ fontSize: 11, padding: "4px 12px", borderRadius: 6, background: "var(--accent)", border: "none", color: "#fff", cursor: "pointer" }}>
                    {saving ? "..." : "Ekle"}
                  </button>
                  <button onClick={() => { setAddingNew(false); setNewProfileName(""); }} style={{ fontSize: 11, padding: "4px 10px", borderRadius: 6, background: "var(--card2)", border: "1px solid var(--border2)", color: "var(--text2)", cursor: "pointer" }}>
                    İptal
                  </button>
                </div>
              </>
            ) : (
              <>
                <button
                  onClick={() => setAddingNew(true)}
                  style={{ width: 100, height: 100, borderRadius: 16, border: "2px dashed var(--border2)", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--card2)", cursor: "pointer", fontSize: 36, color: "var(--muted)", transition: "all 0.2s" }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = "var(--accent3)"; (e.currentTarget as HTMLElement).style.color = "var(--accent3)"; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = "var(--border2)"; (e.currentTarget as HTMLElement).style.color = "var(--muted)"; }}
                >
                  +
                </button>
                <span style={{ fontSize: 13, color: "var(--muted)" }}>Profil Ekle</span>
              </>
            )}
          </div>
        )}
      </div>

      {/* Bottom actions */}
      <div style={{ display: "flex", gap: 12, marginTop: 48 }}>
        <button onClick={() => router.push("/")} style={{ padding: "9px 24px", borderRadius: 12, background: "var(--card2)", border: "1px solid var(--border2)", color: "var(--text2)", cursor: "pointer", fontSize: 13 }}>
          Ana Sayfaya Dön
        </button>
        <button onClick={() => signOut({ callbackUrl: "/" })} style={{ padding: "9px 24px", borderRadius: 12, background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", color: "var(--red)", cursor: "pointer", fontSize: 13 }}>
          Çıkış Yap
        </button>
      </div>
    </div>
  );
}
