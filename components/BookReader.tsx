"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";

interface Props {
  pages: string[];
}

export default function BookReader({ pages }: Props) {
  const [current, setCurrent] = useState(0);
  const [flipping, setFlipping] = useState(false);
  const [flipDir, setFlipDir] = useState<"next" | "prev">("next");
  const touchStartX = useRef<number | null>(null);

  const goNext = useCallback(() => {
    if (flipping || current >= pages.length - 1) return;
    setFlipDir("next");
    setFlipping(true);
    setTimeout(() => {
      setCurrent(c => c + 1);
      setFlipping(false);
    }, 400);
  }, [flipping, current, pages.length]);

  const goPrev = useCallback(() => {
    if (flipping || current <= 0) return;
    setFlipDir("prev");
    setFlipping(true);
    setTimeout(() => {
      setCurrent(c => c - 1);
      setFlipping(false);
    }, 400);
  }, [flipping, current]);

  // Keyboard
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") goNext();
      if (e.key === "ArrowLeft") goPrev();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [goNext, goPrev]);

  // Touch swipe
  function onTouchStart(e: React.TouchEvent) {
    touchStartX.current = e.touches[0].clientX;
  }
  function onTouchEnd(e: React.TouchEvent) {
    if (touchStartX.current === null) return;
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) {
      diff > 0 ? goNext() : goPrev();
    }
    touchStartX.current = null;
  }

  if (!pages.length) return (
    <div style={{ textAlign: "center", padding: "60px 0", color: "var(--muted)" }}>Bu bölümde sayfa yok.</div>
  );

  const prevPage = pages[current - 1];
  const currPage = pages[current];
  const nextPage = pages[current + 1];

  return (
    <div
      style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "24px 16px", userSelect: "none" }}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      {/* Book container */}
      <div style={{ perspective: "1200px", width: "100%", maxWidth: 520, position: "relative" }}>
        {/* Page counter */}
        <div style={{ textAlign: "center", marginBottom: 12, fontSize: 13, color: "var(--muted)", fontWeight: 600 }}>
          {current + 1} / {pages.length}
        </div>

        {/* Book */}
        <div style={{ position: "relative", width: "100%", aspectRatio: "2/3" }}>

          {/* Shadow / book spine effect */}
          <div style={{
            position: "absolute", inset: 0, borderRadius: 4,
            boxShadow: "0 20px 60px rgba(0,0,0,0.7), inset -4px 0 12px rgba(0,0,0,0.4)",
            pointerEvents: "none", zIndex: 5,
          }} />

          {/* Current page (back — shows next) */}
          {nextPage && (
            <div style={{ position: "absolute", inset: 0, borderRadius: 4, overflow: "hidden", background: "#111" }}>
              <Image src={nextPage} alt="next" fill style={{ objectFit: "cover" }} />
            </div>
          )}

          {/* Current page (front) */}
          <div
            className={flipping ? (flipDir === "next" ? "page-flip-next" : "page-flip-prev") : ""}
            style={{
              position: "absolute", inset: 0, borderRadius: 4, overflow: "hidden",
              background: "#111", transformOrigin: flipDir === "next" ? "left center" : "right center",
              transformStyle: "preserve-3d",
              backfaceVisibility: "hidden",
              zIndex: 3,
            }}
          >
            <Image src={currPage} alt={`Sayfa ${current + 1}`} fill style={{ objectFit: "cover" }} priority />

            {/* Page curl shadow */}
            <div style={{
              position: "absolute", inset: 0, pointerEvents: "none",
              background: "linear-gradient(to right, rgba(0,0,0,0.15) 0%, transparent 8%, transparent 92%, rgba(0,0,0,0.1) 100%)",
            }} />
          </div>

          {/* Left click zone */}
          <button
            onClick={goPrev}
            disabled={current === 0}
            style={{
              position: "absolute", left: 0, top: 0, bottom: 0, width: "35%",
              background: "transparent", border: "none", cursor: current === 0 ? "default" : "pointer",
              zIndex: 10, display: "flex", alignItems: "center", justifyContent: "flex-start", paddingLeft: 12,
            }}
          >
            {current > 0 && (
              <div style={{
                width: 36, height: 36, borderRadius: "50%",
                background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)",
                display: "flex", alignItems: "center", justifyContent: "center",
                opacity: 0.7, transition: "opacity 0.2s",
              }}>
                <svg style={{ width: 18, height: 18, color: "#fff" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
                </svg>
              </div>
            )}
          </button>

          {/* Right click zone */}
          <button
            onClick={goNext}
            disabled={current >= pages.length - 1}
            style={{
              position: "absolute", right: 0, top: 0, bottom: 0, width: "35%",
              background: "transparent", border: "none", cursor: current >= pages.length - 1 ? "default" : "pointer",
              zIndex: 10, display: "flex", alignItems: "center", justifyContent: "flex-end", paddingRight: 12,
            }}
          >
            {current < pages.length - 1 && (
              <div style={{
                width: 36, height: 36, borderRadius: "50%",
                background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)",
                display: "flex", alignItems: "center", justifyContent: "center",
                opacity: 0.7, transition: "opacity 0.2s",
              }}>
                <svg style={{ width: 18, height: 18, color: "#fff" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            )}
          </button>
        </div>

        {/* Progress bar */}
        <div style={{ height: 3, background: "var(--border)", borderRadius: 2, marginTop: 16, overflow: "hidden" }}>
          <div style={{
            height: "100%", borderRadius: 2,
            background: "linear-gradient(to right, var(--accent), var(--accent2))",
            width: `${((current + 1) / pages.length) * 100}%`,
            transition: "width 0.3s ease",
          }} />
        </div>

        {/* Keyboard hint */}
        <p style={{ textAlign: "center", fontSize: 11, color: "var(--muted)", marginTop: 10 }}>
          ← → tuşları veya ekrana tıkla · Mobilde kaydır
        </p>
      </div>

      <style>{`
        @keyframes flipNext {
          0%   { transform: rotateY(0deg); box-shadow: none; }
          50%  { transform: rotateY(-90deg); box-shadow: -20px 0 40px rgba(0,0,0,0.5); }
          100% { transform: rotateY(-180deg); opacity: 0; }
        }
        @keyframes flipPrev {
          0%   { transform: rotateY(0deg); box-shadow: none; }
          50%  { transform: rotateY(90deg); box-shadow: 20px 0 40px rgba(0,0,0,0.5); }
          100% { transform: rotateY(180deg); opacity: 0; }
        }
        .page-flip-next {
          animation: flipNext 0.4s ease-in-out forwards;
          transform-origin: left center;
        }
        .page-flip-prev {
          animation: flipPrev 0.4s ease-in-out forwards;
          transform-origin: right center;
        }
      `}</style>
    </div>
  );
}
