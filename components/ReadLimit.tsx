"use client";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";

const LIMIT = 10;
const KEY = "manific_reads";

export function useReadLimit() {
  const getCount = () => {
    if (typeof window === "undefined") return 0;
    return parseInt(localStorage.getItem(KEY) || "0", 10);
  };
  const increment = () => {
    const n = getCount() + 1;
    localStorage.setItem(KEY, String(n));
    return n;
  };
  const remaining = () => Math.max(0, LIMIT - getCount());
  const isBlocked = () => getCount() >= LIMIT;
  return { getCount, increment, remaining, isBlocked };
}

// Widget — sol alt köşede sabit durur
export function ReadLimitWidget() {
  const { data: session, status } = useSession();
  const [remaining, setRemaining] = useState(LIMIT);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const count = parseInt(localStorage.getItem(KEY) || "0", 10);
    setRemaining(Math.max(0, LIMIT - count));

    // Listen for storage changes (when a chapter is read)
    const handler = () => {
      const c = parseInt(localStorage.getItem(KEY) || "0", 10);
      setRemaining(Math.max(0, LIMIT - c));
    };
    window.addEventListener("storage", handler);
    window.addEventListener("manific_read", handler);
    return () => {
      window.removeEventListener("storage", handler);
      window.removeEventListener("manific_read", handler);
    };
  }, []);

  // Giriş yapmış kullanıcılara gösterme
  if (!mounted || status === "loading") return null;
  if (session) return null;

  const pct = (remaining / LIMIT) * 100;
  const color = remaining <= 2 ? "#ef4444" : remaining <= 5 ? "#f97316" : "#10b981";

  return (
    <div style={{
      position: "fixed", bottom: 20, left: 20, zIndex: 100,
      background: "var(--card2)", border: `1px solid ${color}44`,
      borderRadius: 14, padding: "12px 16px", minWidth: 180,
      boxShadow: `0 4px 24px rgba(0,0,0,0.5), 0 0 0 1px ${color}22`,
    }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
        <span style={{ fontSize: 11, fontWeight: 700, color: "var(--muted)", letterSpacing: "0.05em", textTransform: "uppercase" }}>Ücretsiz Okuma</span>
        <span style={{ fontSize: 16, fontWeight: 900, color }}>{remaining}</span>
      </div>

      {/* Progress bar */}
      <div style={{ height: 4, background: "var(--border)", borderRadius: 2, overflow: "hidden", marginBottom: 10 }}>
        <div style={{ height: "100%", width: `${pct}%`, background: color, borderRadius: 2, transition: "width 0.4s ease" }} />
      </div>

      <p style={{ fontSize: 11, color: "var(--muted)", marginBottom: 10, lineHeight: 1.4 }}>
        {remaining === 0
          ? "Limitin doldu!"
          : remaining <= 3
          ? `Son ${remaining} bölüm hakkın kaldı!`
          : `${remaining} bölüm hakkın var`}
      </p>

      <Link href="/kayit" style={{
        display: "block", textAlign: "center", padding: "7px 0",
        borderRadius: 8, fontSize: 12, fontWeight: 700,
        background: "linear-gradient(135deg, var(--accent), var(--accent2))",
        color: "#fff", textDecoration: "none",
      }}>
        Sınırsız Oku →
      </Link>
    </div>
  );
}

// Blocker — limit dolduğunda bölümü kapatır
export function ReadLimitBlocker({ chapterId }: { chapterId: number }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [blocked, setBlocked] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (status === "loading") return;
    if (session) return; // giriş yapmışsa serbest

    const count = parseInt(localStorage.getItem(KEY) || "0", 10);

    if (count >= LIMIT) {
      setBlocked(true);
      return;
    }

    // Bu bölümü daha önce saydık mı?
    const readKey = `manific_read_${chapterId}`;
    if (!localStorage.getItem(readKey)) {
      localStorage.setItem(readKey, "1");
      const newCount = count + 1;
      localStorage.setItem(KEY, String(newCount));
      window.dispatchEvent(new Event("manific_read"));
      if (newCount >= LIMIT) setBlocked(true);
    }
  }, [session, status, chapterId]);

  if (!mounted || status === "loading" || session) return null;
  if (!blocked) return null;

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 200,
      background: "rgba(10,10,20,0.97)",
      display: "flex", alignItems: "center", justifyContent: "center",
      padding: 20,
    }}>
      <div style={{
        background: "var(--card)", border: "1px solid var(--border2)",
        borderRadius: 20, padding: "40px 32px", maxWidth: 400, width: "100%",
        textAlign: "center",
      }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>🔒</div>
        <h2 style={{ fontWeight: 900, fontSize: 22, marginBottom: 10 }}>Limit Doldu</h2>
        <p style={{ fontSize: 14, color: "var(--text2)", lineHeight: 1.6, marginBottom: 28 }}>
          Ücretsiz okuma limitin doldu. Sınırsız manga okumak için ücretsiz hesap oluştur!
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <Link href="/kayit" style={{
            display: "block", padding: "12px 0", borderRadius: 12,
            background: "linear-gradient(135deg, var(--accent), var(--accent2))",
            color: "#fff", fontWeight: 700, fontSize: 15, textDecoration: "none",
          }}>
            Ücretsiz Kayıt Ol
          </Link>
          <Link href="/giris" style={{
            display: "block", padding: "12px 0", borderRadius: 12,
            background: "var(--card2)", border: "1px solid var(--border2)",
            color: "var(--text2)", fontWeight: 600, fontSize: 14, textDecoration: "none",
          }}>
            Giriş Yap
          </Link>
          <button onClick={() => router.back()} style={{
            padding: "10px 0", borderRadius: 12, background: "transparent",
            border: "none", color: "var(--muted)", fontSize: 13, cursor: "pointer",
          }}>
            Geri Dön
          </button>
        </div>
      </div>
    </div>
  );
}
