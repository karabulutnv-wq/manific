import Link from "next/link";
import Image from "next/image";

interface Props {
  manga: {
    id: number; title: string; slug: string;
    cover?: string | null; genre?: string | null; status: string;
    _count?: { chapters: number };
  };
  rank?: number;
}

export default function MangaCard({ manga, rank }: Props) {
  return (
    <Link href={`/manga/${manga.slug}`} style={{ textDecoration: "none", display: "block" }}>
      <div className="manga-card-wrap">
        <div style={{ position: "relative", aspectRatio: "2/3", overflow: "hidden" }}>
          {manga.cover ? (
            <Image src={manga.cover} alt={manga.title} fill className="manga-img" style={{ objectFit: "cover" }} />
          ) : (
            <div style={{ width: "100%", height: "100%", background: "linear-gradient(135deg, var(--card2), var(--border))", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 36 }}>📚</div>
          )}

          {/* Bottom gradient */}
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0,0,0,0.75) 0%, transparent 50%)" }} />

          {/* Status */}
          <span className={manga.status === "ongoing" ? "badge-ongoing" : "badge-done"} style={{ position: "absolute", top: 8, left: 8 }}>
            {manga.status === "ongoing" ? "DEVAM" : "BİTTİ"}
          </span>

          {/* Rank ghost */}
          {rank !== undefined && <span className="rank-ghost">{rank}</span>}

          {/* Chapter count */}
          <div style={{ position: "absolute", bottom: 6, left: 8, display: "flex", alignItems: "center", gap: 4 }}>
            <svg style={{ width: 11, height: 11, color: "rgba(255,255,255,0.55)" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            <span style={{ fontSize: 11, color: "rgba(255,255,255,0.65)", fontWeight: 600 }}>{manga._count?.chapters ?? 0}</span>
          </div>
        </div>

        <div style={{ padding: "10px 10px 8px" }}>
          <p style={{ fontWeight: 600, fontSize: 13, color: "var(--text)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", lineHeight: 1.3 }}>{manga.title}</p>
          <p style={{ fontSize: 11, color: "var(--muted)", marginTop: 3, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{manga.genre || "Genel"}</p>
        </div>
      </div>
    </Link>
  );
}
