"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { getToken, getAuthUser, setAuthUser, type AuthUser } from "@/lib/auth";
import { apiGetMe } from "@/lib/api";

const PUBLIC_PATHS = ["/login", "/lp", "/brand"];

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const token = getToken();

    if (!token && !PUBLIC_PATHS.includes(pathname)) {
      router.replace("/lp");
      return;
    }

    if (token && !getAuthUser()) {
      // トークンはあるがキャッシュがない → APIから取得
      apiGetMe()
        .then(({ user }) => {
          setAuthUser({
            id: user.id,
            displayName: user.display_name,
            pictureUrl: user.picture_url,
            targetBunrui: user.target_bunrui,
            targetTotal: user.target_total_score,
            examYear: user.exam_year,
            loginMethod: "demo",
          });
          setReady(true);
        })
        .catch(() => {
          // トークン無効
          localStorage.removeItem("kyoutsu_token");
          localStorage.removeItem("kyoutsu_user_cache");
          router.replace("/login");
        });
    } else {
      setReady(true);
    }
  }, [pathname, router]);

  if (!ready && !PUBLIC_PATHS.includes(pathname)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-950 text-gray-400">
        <div className="text-center">
          <div className="flex justify-center animate-pulse mb-2">
            <svg viewBox="0 0 48 48" className="w-10 h-10" aria-hidden="true">
              <rect width="48" height="48" rx="10" fill="#030712"/>
              <rect x="4" y="4" width="12" height="11" rx="2" fill="#dc2626"/>
              <rect x="18" y="4" width="12" height="11" rx="2" fill="#f87171"/>
              <rect x="32" y="4" width="12" height="11" rx="2" fill="#fde68a"/>
              <rect x="4" y="17" width="12" height="11" rx="2" fill="#fca5a5"/>
              <rect x="18" y="17" width="12" height="11" rx="2" fill="#bef264"/>
              <rect x="32" y="17" width="12" height="11" rx="2" fill="#4ade80"/>
              <rect x="4" y="30" width="12" height="11" rx="2" fill="#86efac"/>
              <rect x="18" y="30" width="12" height="11" rx="2" fill="#22c55e"/>
              <rect x="32" y="30" width="12" height="11" rx="2" fill="#15803d"/>
              <rect x="4" y="43" width="40" height="2" rx="1" fill="#22c55e"/>
            </svg>
          </div>
          <p className="text-sm">読み込み中...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
