"use client";
import { useState } from "react";
import Link from "next/link";

interface Chapter {
  id: number;
  number: number;
  title: string | null;
  createdAt: Date | string;
}

export default function ChapterList({ chapters, slug }: { chapters: Chapter[]; slug: string }) {
  const [query, setQuery] = useState("");

  const filtered = query.trim()
    ? chapters.filter(ch => {
        const q = query.trim();
        const num = parseFloat(q);
        if (!isNaN(num)) return ch.number === num || String(ch.number).startsWith(q);
        return ch.title?.toLowerCase().includes(q.toLowerCase());
      })
    : chapters;

  return (
    <div style={{ borderRadius: 16, overflow: "hidden", background: "var(--card)", border: "1px solid var(--border)" }}>
      {/* Header */}
      <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 4, height: 18, borderRadius: 2, background: "linear-gradient(to bottom, var(--orange), #fb923c)", flexShrink: 0 }} />
          <h2 style={{ fontWeight: 800, fontSize: 15 }}>Bölümler</h2>
          <span style={{ fontSize: 11, fontWeight: 600, padding: "2px 8px", borderRadius: 20, background: "var(--card2)", color: "var(--muted)" }}>
            {chapters.length}
          </span>
        </div>

        {/* Search input */}
        {chapters.length > 5 && (
          <div style={{ position: "relative", flexShrink: 0 }}>
            <svg style={{ position: "absolute", left: 9, top: "50%", transform: "translateY(-50%)", width: 13, height: 13, color: "var(--muted)", pointerEvents: "none" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Bölüm ara..."
              value={query}
              onChange={e => setQuery(e.target.value)}
              style={{
                background: "var(--card2)", border: "1px solid var(--border2)",
                color: "var(--text)", outline: "none", borderRadius: 10,
                padding: "7px 12px 7px 28px", fontSize: 12, width: 150,
                transition: "border-color 0.2s",
              }}
              onFocus={e => (e.target.style.borderColor = "var(--accent3)")}
              onBlur={e => (e.target.style.borderColor = "var(--border2)")}
            />
          </div>
        )}
      </div>

      {/* List */}
      {chapters.length === 0 ? (
        <p style={{ textAlign: "center", padding: "40px 0", fontSize: 13, color: "var(--muted)" }}>
          Henüz bölüm eklenmemiş.
        </p>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: "center", padding: "32px 0", color: "var(--muted)" }}>
          <p style={{ fontSize: 22, marginBottom: 8 }}>🔍</p>
          <p style={{ fontSize: 13 }}>
            <span style={{ color: "var(--text)", fontWeight: 600 }}>{query}</span> bulunamadı
          </p>
        </div>
      ) : (
        <div>
          {filtered.map((ch, i) => (
            <Link
              key={ch.id}
              href={`/manga/${slug}/${ch.number}`}
              style={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                padding: "12px 20px", textDecoration: "none",
                borderTop: i > 0 ? "1px solid var(--border)" : "none",
                transition: "background 0.15s",
              }}
              onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,255,255,0.03)")}
              onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <span style={{
                  width: 36, height: 36, borderRadius: 8, flexShrink: 0,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 11, fontWeight: 700,
                  background: "var(--card2)", color: "var(--accent3)",
                }}>
                  {ch.number}
                </span>
                <span style={{ fontSize: 13, fontWeight: 500, color: "var(--text)" }}>
                  {ch.title || `Bölüm ${ch.number}`}
                </span>
              </div>
              <span style={{ fontSize: 11, color: "var(--muted)", flexShrink: 0 }}>
                {new Date(ch.createdAt).toLocaleDateString("tr-TR")}
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
