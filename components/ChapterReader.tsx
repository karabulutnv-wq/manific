"use client";
import Image from "next/image";

export default function ChapterReader({ pages }: { pages: string[] }) {
  if (pages.length === 0) {
    return (
      <div className="text-center py-20" style={{ color: "var(--muted)" }}>
        Bu bölümde sayfa yok.
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-1 py-4">
      {pages.map((src, i) => (
        <div key={i} className="relative w-full max-w-2xl">
          <Image
            src={src}
            alt={`Sayfa ${i + 1}`}
            width={800}
            height={1200}
            className="w-full h-auto"
            priority={i < 3}
          />
        </div>
      ))}
    </div>
  );
}
