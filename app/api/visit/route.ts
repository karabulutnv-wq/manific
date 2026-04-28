/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

const db = prisma as any;

function toDate(d: Date) {
  return d.toISOString().split("T")[0]; // "2026-04-28"
}

export async function POST() {
  const today = toDate(new Date());
  try {
    await db.pageVisit.upsert({
      where: { date: today },
      update: { count: { increment: 1 } },
      create: { date: today, count: 1 },
    });
  } catch {
    // ignore
  }
  return NextResponse.json({ ok: true });
}

export async function GET() {
  const session = await getServerSession(authOptions);
  const user = session?.user as any;
  if (!session || user?.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = new Date();
  const todayStr = toDate(now);

  const weekAgo = new Date(now); weekAgo.setDate(now.getDate() - 7);
  const monthAgo = new Date(now); monthAgo.setDate(now.getDate() - 30);
  const yearAgo = new Date(now); yearAgo.setFullYear(now.getFullYear() - 1);

  const all: { date: string; count: number }[] = await db.pageVisit.findMany({
    orderBy: { date: "asc" },
  });

  const sum = (from: Date) => all
    .filter(r => r.date >= toDate(from))
    .reduce((a, b) => a + b.count, 0);

  const today = all.find(r => r.date === todayStr)?.count ?? 0;
  const weekly = sum(weekAgo);
  const monthly = sum(monthAgo);
  const yearly = sum(yearAgo);
  const total = all.reduce((a, b) => a + b.count, 0);

  // Last 30 days for chart
  const chart = Array.from({ length: 30 }, (_, i) => {
    const d = new Date(now);
    d.setDate(now.getDate() - (29 - i));
    const key = toDate(d);
    return { date: key, count: all.find(r => r.date === key)?.count ?? 0 };
  });

  return NextResponse.json({ today, weekly, monthly, yearly, total, chart });
}
