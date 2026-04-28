"use client";
import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

export default function VisitTracker() {
  const pathname = usePathname();
  const lastPath = useRef<string | null>(null);

  useEffect(() => {
    // Admin sayfalarını sayma
    if (pathname.startsWith("/admin")) return;
    // Aynı sayfayı tekrar sayma
    if (lastPath.current === pathname) return;
    lastPath.current = pathname;

    fetch("/api/visit", { method: "POST" }).catch(() => {});
  }, [pathname]);

  return null;
}
