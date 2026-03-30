"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { demoLogin, isLoggedIn } from "@/lib/auth";

export default function LoginPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isLoggedIn()) router.replace("/");
  }, [router]);

  const handleDemoLogin = () => {
    if (!name.trim()) return;
    setLoading(true);
    demoLogin(name.trim());
    router.replace("/onboarding");
  };

  const handleLineLogin = () => {
    // LINE LIFF SDKが設定されたら有効化
    // liff.init({ liffId: process.env.NEXT_PUBLIC_LIFF_ID })
    //   .then(() => liff.login())
    alert("LINE Login は設定後に有効化されます。\nまずはデモログインをお試しください。");
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-950">
      <div className="w-full max-w-sm">
        {/* ロゴ */}
        <div className="text-center mb-8">
          <div className="text-5xl mb-3">📚🎯</div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text text-transparent">
            大学物語
          </h1>
          <p className="text-sm text-gray-400 mt-1">共通テスト攻略プラットフォーム</p>
          <p className="text-xs text-gray-600 mt-1">
            忘却曲線 × 弱点検出 × 学習計画で合格を目指す
          </p>
        </div>

        {/* デモログイン */}
        <div className="bg-gray-900 rounded-xl border border-gray-800 p-5 mb-4">
          <h2 className="text-sm font-bold text-gray-300 mb-3">ログイン</h2>
          <div className="space-y-3">
            <div>
              <label className="block text-xs text-gray-500 mb-1">名前を入力してスタート</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleDemoLogin()}
                placeholder="例: 山田太郎"
                className="w-full px-3 py-2.5 bg-gray-800 border border-gray-700 rounded-lg
                           focus:border-green-500 focus:outline-none text-sm"
                autoFocus
              />
            </div>
            <button
              onClick={handleDemoLogin}
              disabled={!name.trim() || loading}
              className="w-full py-2.5 bg-green-600 hover:bg-green-700 disabled:bg-gray-800 disabled:text-gray-600
                         rounded-lg font-medium transition-colors text-sm"
            >
              {loading ? "ログイン中..." : "はじめる"}
            </button>
          </div>
        </div>

        {/* LINE Login */}
        <button
          onClick={handleLineLogin}
          className="w-full py-2.5 bg-[#06c755] hover:bg-[#05b64c] text-white rounded-lg
                     font-medium transition-colors flex items-center justify-center gap-2 text-sm"
        >
          <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor">
            <path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63h2.386c.346 0 .627.285.627.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.104.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63.346 0 .628.285.628.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.282.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314" />
          </svg>
          LINEでログイン
        </button>

        <p className="text-[10px] text-gray-600 mt-4 text-center">
          daigaku-monogatari.pages.dev
        </p>
      </div>
    </div>
  );
}
