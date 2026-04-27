import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function MangaDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const manga = await prisma.manga.findUnique({
    where: { slug },
    include: { chapters: { orderBy: { number: "desc" } } },
  });
  if (!manga) notFound();

  const firstChapter = manga.chapters[manga.chapters.length - 1];
  const lastChapter = manga.chapters[0];

  return (
    <div style={{ background: "var(--bg)", minHeight: "100vh" }}>
      {/* Banner blur bg */}
      <div className="relative h-56 overflow-hidden">
        {manga.cover && (
          <Image src={manga.cover} alt="" fill className="object-cover scale-110 blur-md opacity-25" />
        )}
        <div className="absolute inset-0" style={{ background: "linear-gradient(to bottom, transparent 0%, var(--bg) 100%)" }} />
      </div>

      <div className="max-w-4xl mx-auto px-4 -mt-32 relative z-10 pb-16">
        <div className="flex gap-5 mb-8">
          {/* Cover */}
          <div
            className="relative w-32 h-48 sm:w-40 sm:h-60 flex-shrink-0 rounded-xl overflow-hidden"
            style={{ border: "2px solid var(--border)", boxShadow: "0 16px 40px rgba(0,0,0,0.6)" }}
          >
            {manga.cover ? (
              <Image src={manga.cover} alt={manga.title} fill className="object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-5xl" style={{ background: "var(--surface2)" }}>📚</div>
            )}
          </div>

          {/* Info */}
          <div className="flex-1 pt-20 sm:pt-24">
            <div className="flex flex-wrap gap-2 mb-2">
              <span className={`badge ${manga.status === "ongoing" ? "badge-ongoing" : "badge-completed"}`}>
                {manga.status === "ongoing" ? "DEVAM EDİYOR" : "TAMAMLANDI"}
              </span>
              {manga.genre && (
                <span className="badge" style={{ background: "rgba(108,60,225,0.2)", color: "var(--accent3)", border: "1px solid rgba(108,60,225,0.3)" }}>
                  {manga.genre}
                </span>
              )}
            </div>
            <h1 className="text-2xl sm:text-3xl font-black mb-1">{manga.title}</h1>
            {manga.author && <p className="text-sm mb-3" style={{ color: "var(--text2)" }}>✍️ {manga.author}</p>}
            {manga.description && (
              <p className="text-sm leading-relaxed mb-4" style={{ color: "var(--text2)" }}>{manga.description}</p>
            )}
            <div className="flex gap-2 flex-wrap">
              {firstChapter && (
                <Link href={`/manga/${slug}/${firstChapter.number}`} className="btn-primary px-5 py-2.5 rounded-xl text-sm">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                  </svg>
                  İlk Bölüm
                </Link>
              )}
              {lastChapter && lastChapter.id !== firstChapter?.id && (
                <Link href={`/manga/${slug}/${lastChapter.number}`} className="btn-secondary px-5 py-2.5 rounded-xl text-sm">
                  Son Bölüm
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          {[
            { label: "Bölüm", value: manga.chapters.length },
            { label: "Durum", value: manga.status === "ongoing" ? "Devam" : "Bitti" },
            { label: "Tür", value: manga.genre || "—" },
          ].map((s) => (
            <div key={s.label} className="text-center py-3 rounded-xl" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
              <p className="font-bold text-lg">{s.value}</p>
              <p className="text-xs mt-0.5" style={{ color: "var(--muted)" }}>{s.label}</p>
            </div>
          ))}
        </div>

        {/* Chapter list */}
        <div className="rounded-2xl overflow-hidden" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
          <div className="px-5 py-4" style={{ borderBottom: "1px solid var(--border)" }}>
            <div className="section-title">
              <h2 className="font-bold">Bölümler</h2>
              <span className="text-xs px-2 py-0.5 rounded-full ml-1" style={{ background: "var(--surface2)", color: "var(--muted)" }}>
                {manga.chapters.length}
              </span>
            </div>
          </div>

          {manga.chapters.length === 0 ? (
            <p className="text-sm text-center py-10" style={{ color: "var(--muted)" }}>Henüz bölüm eklenmemiş.</p>
          ) : (
            <div className="divide-y" style={{ borderColor: "var(--border)" }}>
              {manga.chapters.map((ch: { id: number; number: number; title: string | null; createdAt: Date }) => (
                <Link
                  key={ch.id}
                  href={`/manga/${slug}/${ch.number}`}
                  className="flex items-center justify-between px-5 py-3.5 transition-colors hover:bg-white/3 group"
                >
                  <div className="flex items-center gap-3">
                    <span
                      className="w-9 h-9 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0"
                      style={{ background: "var(--surface2)", color: "var(--accent3)" }}
                    >
                      {ch.number}
                    </span>
                    <span className="text-sm font-medium group-hover:text-purple-400 transition-colors">
                      {ch.title || `Bölüm ${ch.number}`}
                    </span>
                  </div>
                  <span className="text-xs flex-shrink-0" style={{ color: "var(--muted)" }}>
                    {new Date(ch.createdAt).toLocaleDateString("tr-TR")}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
