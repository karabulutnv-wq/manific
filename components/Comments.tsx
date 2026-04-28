"use client";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";

interface Comment {
  id: number;
  userId: number;
  username: string;
  avatar?: string | null;
  content: string;
  createdAt: string;
}

function timeAgo(date: string) {
  const d = Date.now() - new Date(date).getTime();
  const m = Math.floor(d / 60000);
  if (m < 1) return "Az önce";
  if (m < 60) return `${m} dk önce`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} sa önce`;
  return `${Math.floor(h / 24)} gün önce`;
}

export default function Comments({ chapterId }: { chapterId: number }) {
  const { data: session } = useSession();
  const user = session?.user as { id?: string; role?: string; username?: string; name?: string; activeProfileName?: string } | undefined;
  const displayName = user?.activeProfileName || user?.username || user?.name || "?";

  const [comments, setComments] = useState<Comment[]>([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function load() {
    const res = await fetch(`/api/comments?chapterId=${chapterId}`);
    setComments(await res.json());
  }

  useEffect(() => { load(); }, [chapterId]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!text.trim()) return;
    setLoading(true); setError("");
    const res = await fetch("/api/comments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chapterId, content: text }),
    });
    if (!res.ok) {
      const d = await res.json();
      setError(d.error || "Hata oluştu");
    } else {
      setText("");
      load();
    }
    setLoading(false);
  }

  async function handleDelete(id: number) {
    await fetch("/api/comments", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    load();
  }

  return (
    <div style={{ maxWidth: 720, margin: "0 auto", padding: "32px 20px 60px" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 24 }}>
        <div style={{ width: 4, height: 18, borderRadius: 2, background: "linear-gradient(to bottom, var(--orange), #fb923c)", flexShrink: 0 }} />
        <h2 style={{ fontWeight: 800, fontSize: 16 }}>Yorumlar</h2>
        <span style={{ fontSize: 12, fontWeight: 600, padding: "2px 8px", borderRadius: 20, background: "var(--card2)", color: "var(--muted)" }}>{comments.length}</span>
      </div>

      {/* Input */}
      {session ? (
        <form onSubmit={handleSubmit} style={{ marginBottom: 28 }}>
          <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
            <div style={{ width: 36, height: 36, borderRadius: "50%", overflow: "hidden", flexShrink: 0, border: "2px solid var(--border2)", background: "var(--card2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700, color: "var(--accent3)" }}>
              {displayName[0].toUpperCase()}
            </div>
            <div style={{ flex: 1 }}>
              <textarea
                value={text}
                onChange={e => setText(e.target.value)}
                placeholder="Yorumunu yaz..."
                rows={3}
                style={{ width: "100%", background: "var(--card)", border: "1px solid var(--border2)", color: "var(--text)", borderRadius: 12, padding: "10px 14px", fontSize: 13, outline: "none", resize: "vertical", fontFamily: "inherit" }}
                onFocus={e => (e.target.style.borderColor = "var(--accent3)")}
                onBlur={e => (e.target.style.borderColor = "var(--border2)")}
              />
              {error && <p style={{ fontSize: 12, color: "var(--red)", marginTop: 4 }}>{error}</p>}
              <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 8 }}>
                <button
                  type="submit"
                  disabled={loading || !text.trim()}
                  className="btn-purple"
                  style={{ padding: "8px 20px", borderRadius: 10, fontSize: 13 }}
                >
                  {loading ? "Gönderiliyor..." : "Gönder"}
                </button>
              </div>
            </div>
          </div>
        </form>
      ) : !session ? (
        <div style={{ marginBottom: 28, padding: "16px 20px", borderRadius: 12, background: "var(--card)", border: "1px solid var(--border)", textAlign: "center" }}>
          <p style={{ fontSize: 13, color: "var(--text2)" }}>
            Yorum yapmak için{" "}
            <Link href="/giris" style={{ color: "var(--accent3)", fontWeight: 600 }}>giriş yap</Link>
            {" "}veya{" "}
            <Link href="/kayit" style={{ color: "var(--accent3)", fontWeight: 600 }}>kayıt ol</Link>
          </p>
        </div>
      ) : null}

      {/* Comments list */}
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {comments.length === 0 ? (
          <div style={{ textAlign: "center", padding: "32px 0", color: "var(--muted)" }}>
            <p style={{ fontSize: 28, marginBottom: 8 }}>💬</p>
            <p style={{ fontSize: 13 }}>Henüz yorum yok. İlk yorumu sen yap!</p>
          </div>
        ) : (
          comments.map(c => (
            <div key={c.id} style={{ display: "flex", gap: 12 }}>
              {/* Avatar */}
              <div style={{ width: 36, height: 36, borderRadius: "50%", overflow: "hidden", flexShrink: 0, border: "2px solid var(--border)", background: "var(--card2)", position: "relative" }}>
                {c.avatar ? (
                  <Image src={c.avatar} alt={c.username} fill style={{ objectFit: "cover" }} />
                ) : (
                  <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700, color: "var(--accent3)" }}>
                    {c.username[0].toUpperCase()}
                  </div>
                )}
              </div>

              {/* Content */}
              <div style={{ flex: 1, background: "var(--card)", border: "1px solid var(--border)", borderRadius: 12, padding: "10px 14px" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ fontWeight: 700, fontSize: 13 }}>{c.username}</span>
                    <span style={{ fontSize: 11, color: "var(--muted)" }}>{timeAgo(c.createdAt)}</span>
                  </div>
                  {(user?.role === "admin" || String(user?.id) === String(c.userId)) && (
                    <button
                      onClick={() => handleDelete(c.id)}
                      style={{ background: "none", border: "none", cursor: "pointer", color: "var(--muted)", fontSize: 11, padding: "2px 6px", borderRadius: 6 }}
                      onMouseEnter={e => (e.currentTarget.style.color = "var(--red)")}
                      onMouseLeave={e => (e.currentTarget.style.color = "var(--muted)")}
                    >
                      Sil
                    </button>
                  )}
                </div>
                <p style={{ fontSize: 13, color: "var(--text2)", lineHeight: 1.6, whiteSpace: "pre-wrap" }}>{c.content}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
