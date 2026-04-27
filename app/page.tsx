import { prisma } from "@/lib/prisma";
import Link from "next/link";
import Image from "next/image";
import MangaCard from "@/components/MangaCard";
import HeroSlider from "@/components/HeroSlider";

export const dynamic = "force-dynamic";

function timeAgo(date: Date) {
  const d = Date.now() - new Date(date).getTime();
  const m = Math.floor(d / 60000);
  if (m < 1) return "Az önce";
  if (m < 60) return `${m} dk önce`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} sa önce`;
  return `${Math.floor(h / 24)} gün önce`;
}

const cats = [
  { icon: "🔥", color: "#f97316", bg: "rgba(249,115,22,0.12)", border: "rgba(249,115,22,0.25)", label: "En Popüler", sub: "En çok okunanlar", href: "/?filter=popular" },
  { icon: "✨", color: "#10b981", bg: "rgba(16,185,129,0.12)", border: "rgba(16,185,129,0.25)", label: "Yeni Eklenen", sub: "Son güncellenenler", href: "/?filter=new" },
  { icon: "✅", color: "#a855f7", bg: "rgba(168,85,247,0.12)", border: "rgba(168,85,247,0.25)", label: "Tamamlanan", sub: "Bitmiş seriler", href: "/?filter=completed" },
  { icon: "🎲", color: "#ec4899", bg: "rgba(236,72,153,0.12)", border: "rgba(236,72,153,0.25)", label: "Keşfet", sub: "Rastgele manga", href: "/?filter=random" },
];

export default async function HomePage({ searchParams }: { searchParams: Promise<{ q?: string; filter?: string }> }) {
  const { q, filter } = await searchParams;

  const allMangas = await prisma.manga.findMany({
    where: q
      ? { OR: [{ title: { contains: q } }, { genre: { contains: q } }, { author: { contains: q } }] }
      : filter === "completed" ? { status: "completed" } : undefined,
    orderBy: { updatedAt: "desc" },
    include: { _count: { select: { chapters: true } } },
  });

  const heroMangas = allMangas.filter(m => m.cover).slice(0, 5);

  const recentMangas = await prisma.manga.findMany({
    orderBy: { updatedAt: "desc" },
    take: 8,
    include: { chapters: { orderBy: { number: "desc" }, take: 1 } },
  });

  // Search results page
  if (q) {
    return (
      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "32px 20px", minHeight: "80vh" }}>
        <p style={{ fontSize: 14, color: "var(--text2)", marginBottom: 24 }}>
          <span style={{ color: "var(--text)", fontWeight: 600 }}>&quot;{q}&quot;</span> için {allMangas.length} sonuç
        </p>
        {allMangas.length === 0 ? (
          <div style={{ textAlign: "center", padding: "80px 0", color: "var(--muted)" }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>🔍</div>
            <p style={{ fontSize: 16, fontWeight: 600, color: "var(--text2)" }}>Sonuç bulunamadı</p>
            <p style={{ fontSize: 13, marginTop: 6 }}>Farklı bir arama deneyin</p>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))", gap: 16 }}>
            {allMangas.map(m => <MangaCard key={m.id} manga={m} />)}
          </div>
        )}
      </div>
    );
  }

  return (
    <div style={{ background: "var(--bg)", minHeight: "100vh" }}>
      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "24px 20px 60px" }}>

        {/* Hero */}
        {heroMangas.length > 0 && <HeroSlider mangas={heroMangas} />}

        {/* Empty hero placeholder */}
        {heroMangas.length === 0 && (
          <div style={{ width: "100%", height: 320, borderRadius: 16, background: "linear-gradient(135deg, var(--card2) 0%, var(--border) 100%)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", marginBottom: 28, border: "1px solid var(--border2)" }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>📚</div>
            <p style={{ fontWeight: 700, fontSize: 18, color: "var(--text2)" }}>MANIFIC&apos;e Hoş Geldin</p>
            <p style={{ fontSize: 13, color: "var(--muted)", marginTop: 6 }}>Admin panelden manga ekleyerek başla</p>
          </div>
        )}

        {/* Category tiles */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 40 }} className="grid-cols-2 md:grid-cols-4">
          {cats.map(c => (
            <Link key={c.label} href={c.href} className="cat-tile" style={{ textDecoration: "none" }}>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: c.bg, border: `1px solid ${c.border}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0 }}>{c.icon}</div>
              <div style={{ minWidth: 0 }}>
                <p style={{ fontWeight: 700, fontSize: 13, color: "var(--text)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{c.label}</p>
                <p style={{ fontSize: 11, color: "var(--muted)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{c.sub}</p>
              </div>
            </Link>
          ))}
        </div>

        {/* Popular */}
        {allMangas.length > 0 && (
          <section style={{ marginBottom: 44 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
              <div className="section-bar">
                <h2 style={{ fontWeight: 800, fontSize: 17 }}>Popüler Mangalar</h2>
              </div>
              <Link href="/?filter=popular" style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 13, fontWeight: 600, color: "var(--accent3)", textDecoration: "none" }}>
                Tümünü Gör
                <svg style={{ width: 14, height: 14 }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
              </Link>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))", gap: 14 }}>
              {allMangas.slice(0, 5).map((m, i) => <MangaCard key={m.id} manga={m} rank={i + 1} />)}
            </div>
          </section>
        )}

        {/* Recent updates */}
        {recentMangas.length > 0 && (
          <section style={{ marginBottom: 44 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
              <div className="section-bar">
                <h2 style={{ fontWeight: 800, fontSize: 17 }}>Son Güncellenenler</h2>
              </div>
              <Link href="/?filter=new" style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 13, fontWeight: 600, color: "var(--accent3)", textDecoration: "none" }}>
                Tümünü Gör
                <svg style={{ width: 14, height: 14 }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
              </Link>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 10 }}>
              {recentMangas.map(m => {
                const ch = m.chapters[0];
                return (
                  <Link key={m.id} href={`/manga/${m.slug}`} className="recent-row" style={{ textDecoration: "none" }}>
                    <div style={{ width: 46, height: 62, borderRadius: 8, overflow: "hidden", flexShrink: 0, background: "var(--card2)", position: "relative" }}>
                      {m.cover
                        ? <Image src={m.cover} alt={m.title} fill style={{ objectFit: "cover" }} />
                        : <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>📚</div>
                      }
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontWeight: 600, fontSize: 13, color: "var(--text)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{m.title}</p>
                      {ch && (
                        <span style={{ display: "inline-block", fontSize: 11, fontWeight: 600, padding: "2px 8px", borderRadius: 5, background: "rgba(124,58,237,0.18)", color: "var(--accent3)", marginTop: 4 }}>
                          Bölüm {ch.number}
                        </span>
                      )}
                      <p style={{ fontSize: 11, color: "var(--muted)", marginTop: 4 }}>{timeAgo(m.updatedAt)}</p>
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>
        )}

        {/* All mangas */}
        {allMangas.length > 5 && (
          <section>
            <div style={{ marginBottom: 16 }}>
              <div className="section-bar">
                <h2 style={{ fontWeight: 800, fontSize: 17 }}>Tüm Mangalar</h2>
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))", gap: 14 }}>
              {allMangas.map(m => <MangaCard key={m.id} manga={m} />)}
            </div>
          </section>
        )}

        {allMangas.length === 0 && heroMangas.length === 0 && (
          <div style={{ textAlign: "center", padding: "40px 0", color: "var(--muted)" }}>
            <p style={{ fontSize: 13 }}>Admin panelden manga ekleyerek başla</p>
          </div>
        )}
      </div>
    </div>
  );
}
