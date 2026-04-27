"use client";
import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";

interface SliderManga {
  id: number; title: string; slug: string;
  cover?: string | null; description?: string | null;
  genre?: string | null; status: string;
  _count?: { chapters: number };
}

export default function HeroSlider({ mangas }: { mangas: SliderManga[] }) {
  const [cur, setCur] = useState(0);
  const next = useCallback(() => setCur(c => (c + 1) % mangas.length), [mangas.length]);
  const prev = () => setCur(c => (c - 1 + mangas.length) % mangas.length);

  useEffect(() => {
    if (mangas.length <= 1) return;
    const t = setInterval(next, 5500);
    return () => clearInterval(t);
  }, [mangas.length, next]);

  if (!mangas.length) return null;
  const m = mangas[cur];

  return (
    <div className="hero-wrap" style={{ marginBottom: 28 }}>
      {/* BG image */}
      {m.cover
        ? <Image src={m.cover} alt={m.title} fill style={{ objectFit: "cover" }} priority />
        : <div style={{ position: "absolute", inset: 0, background: "linear-gradient(135deg, var(--card2), var(--border))" }} />
      }

      {/* Overlays */}
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to right, rgba(10,10,20,0.96) 0%, rgba(10,10,20,0.65) 55%, rgba(10,10,20,0.15) 100%)" }} />
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(10,10,20,0.8) 0%, transparent 40%)" }} />

      {/* Content */}
      <div key={cur} className="anim-up" style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", justifyContent: "flex-end", padding: "36px 40px" }}>
        <div style={{ maxWidth: 520 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
            <span style={{ background: "linear-gradient(135deg, var(--accent), var(--accent2))", color: "#fff", fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 20, letterSpacing: "0.05em" }}>⭐ ÖNE ÇIKAN</span>
            {m.genre && <span style={{ background: "rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.75)", fontSize: 11, fontWeight: 600, padding: "3px 10px", borderRadius: 20 }}>{m.genre}</span>}
          </div>

          <h2 style={{ fontSize: "clamp(1.6rem, 4vw, 2.4rem)", fontWeight: 900, color: "#fff", lineHeight: 1.15, marginBottom: 10 }}>{m.title}</h2>

          {m.description && (
            <p style={{ fontSize: 13, color: "rgba(255,255,255,0.6)", lineHeight: 1.6, marginBottom: 20, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{m.description}</p>
          )}

          <div style={{ display: "flex", gap: 10 }}>
            <Link href={`/manga/${m.slug}`} className="btn-purple" style={{ padding: "10px 22px", borderRadius: 10, fontSize: 13, textDecoration: "none" }}>
              <svg style={{ width: 15, height: 15 }} fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
              </svg>
              Hemen Oku
            </Link>
            <Link href={`/manga/${m.slug}`} className="btn-ghost" style={{ padding: "10px 22px", borderRadius: 10, fontSize: 13, textDecoration: "none" }}>
              <svg style={{ width: 15, height: 15 }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Detaylar
            </Link>
          </div>
        </div>
      </div>

      {/* Controls */}
      {mangas.length > 1 && (
        <div style={{ position: "absolute", bottom: 20, right: 24, display: "flex", alignItems: "center", gap: 8 }}>
          <button onClick={prev} style={{ width: 30, height: 30, borderRadius: "50%", background: "rgba(255,255,255,0.12)", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff" }}>
            <svg style={{ width: 14, height: 14 }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          </button>
          <div style={{ display: "flex", gap: 5 }}>
            {mangas.map((_, i) => (
              <button key={i} onClick={() => setCur(i)} className={`dot-indicator${i === cur ? " active" : ""}`} />
            ))}
          </div>
          <button onClick={next} style={{ width: 30, height: 30, borderRadius: "50%", background: "rgba(255,255,255,0.12)", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff" }}>
            <svg style={{ width: 14, height: 14 }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
          </button>
        </div>
      )}
    </div>
  );
}
