"use client";
import { useSession, signOut } from "next-auth/react";
import { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";

interface Profile { id: number; name: string; avatar?: string | null; isActive: boolean; }
interface Avatar { id: number; url: string; name?: string; }

export default function ProfilPage() {
  const { data: session, update: updateSession } = useSession();
  const router = useRouter();
  const user = session?.user as { id?: string; role?: string; username?: string; avatar?: string } | undefined;

  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [avatars, setAvatars] = useState<Avatar[]>([]);
  const [newName, setNewName] = useState("");
  const [adding, setAdding] = useState(false);
  const [editingProfile, setEditingProfile] = useState<Profile | null>(null);
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);
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

  async function addProfile(e: React.FormEvent) {
    e.preventDefault();
    if (!newName.trim()) return;
    setAdding(true);
    const r = await fetch("/api/profiles", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newName.trim() }),
    });
    const d = await r.json();
    if (!r.ok) { setMsg(d.error); } else { setNewName(""); loadProfiles(); }
    setAdding(false);
  }

  async function deleteProfile(id: number) {
    if (!confirm("Bu profili silmek istediğine emin misin?")) return;
    await fetch("/api/profiles", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) });
    loadProfiles();
  }

  async function setActive(id: number) {
    await fetch("/api/profiles", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, setActive: true }) });
    await updateSession();
    loadProfiles();
    setMsg("Aktif profil değiştirildi!");
    setTimeout(() => setMsg(""), 2000);
  }

  async function saveAvatar(profileId: number, avatarUrl: string) {
    setSaving(true);
    await fetch("/api/profiles", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: profileId, avatar: avatarUrl }) });
    await updateSession();
    loadProfiles();
    setShowAvatarPicker(false);
    setEditingProfile(null);
    setSaving(false);
    setMsg("Avatar güncellendi!");
    setTimeout(() => setMsg(""), 2000);
  }

  if (!session) return null;

  const activeProfile = profiles.find(p => p.isActive);

  return (
    <div style={{ background: "var(--bg)", minHeight: "100vh" }}>
      <div style={{ maxWidth: 700, margin: "0 auto", padding: "40px 20px 60px" }}>

        {/* User header */}
        <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 16, padding: "20px 24px", marginBottom: 24, display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ width: 56, height: 56, borderRadius: 14, overflow: "hidden", flexShrink: 0, border: "2px solid var(--accent2)", position: "relative", background: "var(--card2)" }}>
            {activeProfile?.avatar || user?.avatar ? (
              <Image src={activeProfile?.avatar || user?.avatar || ""} alt="avatar" fill style={{ objectFit: "cover" }} />
            ) : (
              <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, fontWeight: 900, background: "linear-gradient(135deg, var(--accent), var(--accent2))", color: "#fff" }}>
                {(user?.username || "?")[0].toUpperCase()}
              </div>
            )}
          </div>
          <div style={{ flex: 1 }}>
            <p style={{ fontWeight: 800, fontSize: 18 }}>{user?.username}</p>
            {activeProfile && <p style={{ fontSize: 12, color: "var(--accent3)", marginTop: 2 }}>Aktif: {activeProfile.name}</p>}
          </div>
          <button onClick={() => signOut({ callbackUrl: "/" })} style={{ padding: "8px 16px", borderRadius: 10, fontSize: 12, background: "rgba(239,68,68,0.08)", color: "var(--red)", border: "1px solid rgba(239,68,68,0.2)", cursor: "pointer" }}>
            Çıkış
          </button>
        </div>

        {msg && (
          <div style={{ padding: "10px 16px", borderRadius: 10, background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.2)", color: "#34d399", fontSize: 13, marginBottom: 16 }}>
            ✓ {msg}
          </div>
        )}

        {/* Profiles */}
        <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 16, padding: "20px 24px", marginBottom: 20 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
            <div>
              <h2 style={{ fontWeight: 800, fontSize: 16 }}>Profiller</h2>
              <p style={{ fontSize: 12, color: "var(--muted)", marginTop: 2 }}>{profiles.length}/4 profil</p>
            </div>
          </div>

          {/* Profile grid */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 20 }}>
            {profiles.map(p => (
              <div key={p.id} style={{ textAlign: "center" }}>
                {/* Avatar */}
                <div
                  onClick={() => setActive(p.id)}
                  style={{
                    width: "100%", aspectRatio: "1", borderRadius: 14, overflow: "hidden",
                    border: p.isActive ? "3px solid var(--accent2)" : "2px solid var(--border)",
                    boxShadow: p.isActive ? "0 0 16px var(--glow)" : "none",
                    cursor: "pointer", position: "relative", background: "var(--card2)",
                    transition: "all 0.2s",
                  }}
                >
                  {p.avatar ? (
                    <Image src={p.avatar} alt={p.name} fill style={{ objectFit: "cover" }} />
                  ) : (
                    <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, fontWeight: 900, background: "linear-gradient(135deg, var(--accent), var(--accent2))", color: "#fff" }}>
                      {p.name[0].toUpperCase()}
                    </div>
                  )}
                  {p.isActive && (
                    <div style={{ position: "absolute", bottom: 4, right: 4, width: 18, height: 18, borderRadius: "50%", background: "var(--green)", border: "2px solid var(--card)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <svg style={{ width: 10, height: 10, color: "#fff" }} fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                  )}
                </div>

                <p style={{ fontSize: 12, fontWeight: 600, marginTop: 6, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.name}</p>

                {/* Actions */}
                <div style={{ display: "flex", gap: 4, marginTop: 6, justifyContent: "center" }}>
                  <button
                    onClick={() => { setEditingProfile(p); setShowAvatarPicker(true); }}
                    style={{ fontSize: 10, padding: "3px 8px", borderRadius: 6, background: "var(--card2)", border: "1px solid var(--border2)", color: "var(--text2)", cursor: "pointer" }}
                  >
                    Fotoğraf
                  </button>
                  <button
                    onClick={() => deleteProfile(p.id)}
                    style={{ fontSize: 10, padding: "3px 8px", borderRadius: 6, background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", color: "var(--red)", cursor: "pointer" }}
                  >
                    Sil
                  </button>
                </div>
              </div>
            ))}

            {/* Add profile slot */}
            {profiles.length < 4 && (
              <div style={{ textAlign: "center" }}>
                <div style={{ width: "100%", aspectRatio: "1", borderRadius: 14, border: "2px dashed var(--border2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, color: "var(--muted)", cursor: "pointer", background: "var(--card2)" }}
                  onClick={() => document.getElementById("new-profile-input")?.focus()}
                >
                  +
                </div>
                <p style={{ fontSize: 11, color: "var(--muted)", marginTop: 6 }}>Yeni Profil</p>
              </div>
            )}
          </div>

          {/* Add profile form */}
          {profiles.length < 4 && (
            <form onSubmit={addProfile} style={{ display: "flex", gap: 8 }}>
              <input
                id="new-profile-input"
                placeholder="Profil adı..."
                value={newName}
                onChange={e => setNewName(e.target.value)}
                style={{ flex: 1, background: "var(--card2)", border: "1px solid var(--border2)", color: "var(--text)", outline: "none", borderRadius: 10, padding: "9px 14px", fontSize: 13 }}
                onFocus={e => (e.target.style.borderColor = "var(--accent3)")}
                onBlur={e => (e.target.style.borderColor = "var(--border2)")}
              />
              <button type="submit" disabled={adding || !newName.trim()} className="btn-purple" style={{ padding: "9px 20px", borderRadius: 10, fontSize: 13 }}>
                {adding ? "..." : "Ekle"}
              </button>
            </form>
          )}
        </div>

        <p style={{ fontSize: 12, color: "var(--muted)", textAlign: "center" }}>
          Bir profile tıklayarak aktif profili değiştirebilirsin. Aktif profilin avatarı yorumlarda ve her yerde görünür.
        </p>
      </div>

      {/* Avatar picker modal */}
      {showAvatarPicker && editingProfile && (
        <div style={{ position: "fixed", inset: 0, zIndex: 200, background: "rgba(0,0,0,0.85)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}
          onClick={() => setShowAvatarPicker(false)}
        >
          <div style={{ background: "var(--card)", border: "1px solid var(--border2)", borderRadius: 20, padding: 28, maxWidth: 480, width: "100%", maxHeight: "80vh", overflowY: "auto" }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
              <h3 style={{ fontWeight: 800, fontSize: 16 }}>{editingProfile.name} — Avatar Seç</h3>
              <button onClick={() => setShowAvatarPicker(false)} style={{ background: "none", border: "none", color: "var(--muted)", cursor: "pointer", fontSize: 20 }}>✕</button>
            </div>

            {avatars.length === 0 ? (
              <p style={{ textAlign: "center", color: "var(--muted)", fontSize: 13, padding: "32px 0" }}>Admin henüz avatar eklememiş</p>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 10 }}>
                {avatars.map(av => (
                  <button
                    key={av.id}
                    onClick={() => saveAvatar(editingProfile.id, av.url)}
                    disabled={saving}
                    style={{
                      aspectRatio: "1", borderRadius: 12, overflow: "hidden", position: "relative",
                      border: editingProfile.avatar === av.url ? "3px solid var(--accent2)" : "2px solid var(--border)",
                      cursor: "pointer", background: "var(--card2)", padding: 0,
                      transform: editingProfile.avatar === av.url ? "scale(1.05)" : "scale(1)",
                      transition: "all 0.2s",
                    }}
                  >
                    <Image src={av.url} alt="avatar" fill style={{ objectFit: "cover" }} />
                    {editingProfile.avatar === av.url && (
                      <div style={{ position: "absolute", inset: 0, background: "rgba(124,58,237,0.3)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <svg style={{ width: 20, height: 20, color: "#fff" }} fill="currentColor" viewBox="0 0 20 20">
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
      )}
    </div>
  );
}
