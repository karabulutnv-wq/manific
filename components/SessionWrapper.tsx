"use client";
import { SessionProvider, useSession } from "next-auth/react";
import { useEffect } from "react";

function IpTracker() {
  const { data: session } = useSession();
  const user = session?.user as { role?: string } | undefined;

  useEffect(() => {
    if (session && user?.role !== "admin") {
      fetch("/api/user/track-ip", { method: "POST" }).catch(() => {});
    }
  }, [session?.user]);

  return null;
}

export default function SessionWrapper({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <IpTracker />
      {children}
    </SessionProvider>
  );
}
