import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import ChapterReader from "@/components/ChapterReader";

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

  const currentChapter = manga.chapters.find((c) => c.number === chapterNum);
  if (!currentChapter) notFound();

  const pages: string[] = JSON.parse(currentChapter.pages || "[]");
  const currentIndex = manga.chapters.findIndex((c) => c.number === chapterNum);
  const prevChapter = manga.chapters[currentIndex - 1];
  const nextChapter = manga.chapters[currentIndex + 1];

  return (
    <div>
      {/* Top nav */}
      <div
        className="sticky top-14 z-40 flex items-center justify-between px-4 py-2 text-sm"
        style={{ background: "var(--surface)", borderBottom: "1px solid var(--border)" }}
      >
        <Link href={`/manga/${slug}`} className="hover:opacity-80">
          ← {manga.title}
        </Link>
        <span className="font-medium">
          Bölüm {currentChapter.number}
          {currentChapter.title ? ` - ${currentChapter.title}` : ""}
        </span>
        <div className="flex gap-2">
          {prevChapter && (
            <Link
              href={`/manga/${slug}/${prevChapter.number}`}
              className="px-3 py-1 rounded text-xs"
              style={{ background: "var(--border)" }}
            >
              ← Önceki
            </Link>
          )}
          {nextChapter && (
            <Link
              href={`/manga/${slug}/${nextChapter.number}`}
              className="px-3 py-1 rounded text-xs"
              style={{ background: "var(--accent)", color: "#fff" }}
            >
              Sonraki →
            </Link>
          )}
        </div>
      </div>

      <ChapterReader pages={pages} />

      {/* Bottom nav */}
      <div className="flex justify-center gap-4 py-8">
        {prevChapter && (
          <Link
            href={`/manga/${slug}/${prevChapter.number}`}
            className="px-6 py-2 rounded"
            style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
          >
            ← Önceki Bölüm
          </Link>
        )}
        {nextChapter && (
          <Link
            href={`/manga/${slug}/${nextChapter.number}`}
            className="px-6 py-2 rounded"
            style={{ background: "var(--accent)", color: "#fff" }}
          >
            Sonraki Bölüm →
          </Link>
        )}
      </div>
    </div>
  );
}
