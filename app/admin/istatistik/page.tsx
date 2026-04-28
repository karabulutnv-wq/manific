"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

interface Stats {
  today: number; weekly: number; monthly: number;
  yearly: number; total: number;
  chart: { date: string; count: number }[];
}

export default function IstatistikPage() {
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    fetch("/api/visit").then(r => r.json()).then(setStats);
  }, []);

  if (!stats) return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--muted)" }}>
      Yükleniyor...
    </div>
  );

  const cards = [
    { label: "Bugün", value: stats.today, color: "#10b981", bg: "rgba(16,185,129,0.12)", icon: "📅" },
    { label: "Bu Hafta", value: stats.weekly, color: "#6c3ce1", bg: "rgba(108,60,225,0.12)", icon: "📆" },
    { label: "Bu Ay", value: stats.monthly, color: "#f97316", bg: "rgba(249,115,22,0.12)", icon: "🗓️" },
    { label: "Bu Yıl", value: stats.yearly, color: "#06b6d4", bg: "rgba(6,182,212,0.12)", icon: "📊" },
    { label: "Tüm Zamanlar", value: stats.total, color: "#a855f7", bg: "rgba(168,85,247,0.12)", icon: "🌐" },
  ];

  const maxCount = Math.max(...stats.chart.map(d => d.count), 1);

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: "32px 20px", minHeight: "100vh" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 28 }}>
        <Link href="/admin" style={{ fontSize: 13, color: "var(--muted)", textDecoration: "none" }}>← Admin</Link>
        <span style={{ color: "var(--border2)" }}>/</span>
        <h1 style={{ fontWeight: 800, fontSize: 20 }}>Site İstatistikleri</h1>
      </div>

      {/* Stat cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: 12, marginBottom: 28 }}>
        {cards.map(c => (
          <div key={c.label} style={{ background: "var(--card)", border: `1px solid ${c.color}33`, borderRadius: 14, padding: "18px 20px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: c.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>
                {c.icon}
              </div>
              <span style={{ fontSize: 12, fontWeight: 600, color: "var(--muted)" }}>{c.label}</span>
            </div>
            <p style={{ fontSize: 28, fontWeight: 900, color: c.color }}>{c.value.toLocaleString("tr-TR")}</p>
            <p style={{ fontSize: 11, color: "var(--muted)", marginTop: 2 }}>ziyaret</p>
          </div>
        ))}
      </div>

      {/* Chart — last 30 days */}
      <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 16, padding: "20px 24px" }}>
        <h2 style={{ fontWeight: 700, fontSize: 15, marginBottom: 20 }}>Son 30 Gün</h2>
        <div style={{ display: "flex", alignItems: "flex-end", gap: 3, height: 120 }}>
          {stats.chart.map((d, i) => {
            const h = maxCount > 0 ? Math.max((d.count / maxCount) * 100, d.count > 0 ? 4 : 0) : 0;
            const date = new Date(d.date);
            const isToday = d.date === new Date().toISOString().split("T")[0];
            return (
              <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4, height: "100%", justifyContent: "flex-end" }} title={`${d.date}: ${d.count} ziyaret`}>
                <div style={{
                  width: "100%", borderRadius: "3px 3px 0 0",
                  height: `${h}%`, minHeight: d.count > 0 ? 4 : 0,
                  background: isToday ? "var(--accent2)" : "var(--accent)",
                  opacity: isToday ? 1 : 0.6,
                  transition: "height 0.3s ease",
                }} />
              </div>
            );
          })}
        </div>
        {/* X axis labels */}
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8 }}>
          {[0, 6, 13, 20, 29].map(i => {
            const d = stats.chart[i];
            if (!d) return null;
            const date = new Date(d.date);
            return (
              <span key={i} style={{ fontSize: 10, color: "var(--muted)" }}>
                {date.getDate()}/{date.getMonth() + 1}
              </span>
            );
          })}
        </div>
      </div>
    </div>
  );
}
