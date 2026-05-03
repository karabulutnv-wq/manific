"use client";
import { useState, useEffect } from "react";
import ChapterReader from "./ChapterReader";
import BookReader from "./BookReader";

const MODE_KEY = "manific_reader_mode";

export default function ReaderWrapper({ pages }: { pages: string[] }) {
  const [mode, setMode] = useState<"scroll" | "book">("scroll");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem(MODE_KEY);
    if (saved === "book" || saved === "scroll") setMode(saved);
  }, []);

  function toggleMode(m: "scroll" | "book") {
    setMode(m);
    localStorage.setItem(MODE_KEY, m);
  }

  if (!mounted) return <ChapterReader pages={pages} />;

  return (
    <div>
      {/* Mode toggle */}
      <div style={{ display: "flex", justifyContent: "center", gap: 8, padding: "16px 0 8px" }}>
        <button
          onClick={() => toggleMode("scroll")}
          style={{
            padding: "6px 16px", borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: "pointer", border: "none",
            background: mode === "scroll" ? "linear-gradient(135deg, var(--accent), var(--accent2))" : "var(--card2)",
            color: mode === "scroll" ? "#fff" : "var(--text2)",
          }}
        >
          📜 Kaydırma
        </button>
        <button
          onClick={() => toggleMode("book")}
          style={{
            padding: "6px 16px", borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: "pointer", border: "none",
            background: mode === "book" ? "linear-gradient(135deg, var(--accent), var(--accent2))" : "var(--card2)",
            color: mode === "book" ? "#fff" : "var(--text2)",
          }}
        >
          📖 Kitap Modu
        </button>
      </div>

      {mode === "scroll" ? (
        <ChapterReader pages={pages} />
      ) : (
        <BookReader pages={pages} />
      )}
    </div>
  );
}
