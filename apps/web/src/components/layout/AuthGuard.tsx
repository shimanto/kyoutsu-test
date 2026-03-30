"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { getAuthUser, type AuthUser } from "@/lib/auth";

const PUBLIC_PATHS = ["/login"];

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<AuthUser | null | "loading">("loading");

  useEffect(() => {
    const u = getAuthUser();
    if (!u && !PUBLIC_PATHS.includes(pathname)) {
      router.replace("/login");
    } else {
      setUser(u);
    }
  }, [pathname, router]);

  if (user === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-950 text-gray-400">
        <div className="text-center">
          <div className="text-4xl mb-2 animate-pulse">📚</div>
          <p className="text-sm">読み込み中...</p>
        </div>
      </div>
    );
  }

  if (!user && !PUBLIC_PATHS.includes(pathname)) {
    return null;
  }

  return <>{children}</>;
}
