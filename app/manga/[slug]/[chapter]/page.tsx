import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import ChapterReader from "@/components/ChapterReader";
import Comments from "@/components/Comments";
import { ReadLimitBlocker } from "@/components/ReadLimit";

export const dynamic = "force-dynamic";

export default async function ChapterPage({
  params,
}: {
  params: Promise<{ slug: string; chapter: string }>;
}) {
  const { slug, chapter } = await params;
  const chapterNum = parseFloat(chapter);

  const manga = await prisma.manga.findUnique({
    where: { slug },
    include: { chapters: { orderBy: { number: "asc" } } },
  });

  if (!manga) notFound();

  const currentChapter = manga.chapters.find((c: { number: number }) => c.number === chapterNum);
  if (!currentChapter) notFound();

  const pages: string[] = JSON.parse(currentChapter.pages || "[]");
  const currentIndex = manga.chapters.findIndex((c: { number: number }) => c.number === chapterNum);
  const prevChapter = manga.chapters[currentIndex - 1];
  const nextChapter = manga.chapters[currentIndex + 1];

  return (
    <div style={{ background: "var(--bg)", minHeight: "100vh" }}>
      <ReadLimitBlocker chapterId={currentChapter.id} />
      {/* Top nav */}
      <div style={{
        position: "sticky", top: 60, zIndex: 40,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "10px 20px", fontSize: 13,
        background: "rgba(14,14,28,0.95)", backdropFilter: "blur(12px)",
        borderBottom: "1px solid var(--border)",
      }}>
        <Link href={`/manga/${slug}`} style={{ color: "var(--text2)", textDecoration: "none", display: "flex", alignItems: "center", gap: 6 }}>
          <svg style={{ width: 14, height: 14 }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          {manga.title}
        </Link>
        <span style={{ fontWeight: 600 }}>
          Bölüm {currentChapter.number}
          {currentChapter.title ? ` — ${currentChapter.title}` : ""}
        </span>
        <div style={{ display: "flex", gap: 8 }}>
          {prevChapter && (
            <Link href={`/manga/${slug}/${prevChapter.number}`} className="btn-ghost" style={{ padding: "5px 12px", borderRadius: 8, fontSize: 12, textDecoration: "none" }}>
              ← Önceki
            </Link>
          )}
          {nextChapter && (
            <Link href={`/manga/${slug}/${nextChapter.number}`} className="btn-purple" style={{ padding: "5px 12px", borderRadius: 8, fontSize: 12, textDecoration: "none" }}>
              Sonraki →
            </Link>
          )}
        </div>
      </div>

      {/* Pages */}
      <ChapterReader pages={pages} />

      {/* Bottom nav */}
      <div style={{ display: "flex", justifyContent: "center", gap: 12, padding: "24px 20px" }}>
        {prevChapter && (
          <Link href={`/manga/${slug}/${prevChapter.number}`} className="btn-ghost" style={{ padding: "10px 24px", borderRadius: 10, fontSize: 13, textDecoration: "none" }}>
            ← Önceki Bölüm
          </Link>
        )}
        {nextChapter && (
          <Link href={`/manga/${slug}/${nextChapter.number}`} className="btn-purple" style={{ padding: "10px 24px", borderRadius: 10, fontSize: 13, textDecoration: "none" }}>
            Sonraki Bölüm →
          </Link>
        )}
      </div>

      {/* Divider */}
      <div style={{ borderTop: "1px solid var(--border)", margin: "0 20px" }} />

      {/* Comments */}
      <Comments chapterId={currentChapter.id} />
    </div>
  );
}
