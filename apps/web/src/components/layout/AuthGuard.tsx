"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { getToken, getAuthUser, setAuthUser, type AuthUser } from "@/lib/auth";
import { apiGetMe } from "@/lib/api";

const PUBLIC_PATHS = ["/login", "/lp"];

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
          <div className="text-4xl mb-2 animate-pulse">📚</div>
          <p className="text-sm">読み込み中...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
