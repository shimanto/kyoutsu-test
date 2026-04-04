"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { isLoggedIn, setToken, setAuthUser } from "@/lib/auth";
import { apiDemoLogin, apiLineLogin, apiGetMe } from "@/lib/api";
import { isLiffConfigured, initLiff, isLiffLoggedIn, liffLogin, getLiffIdToken } from "@/lib/liff";
import { LogoMark } from "@/components/brand/LogoMark";

const AUTO_LOGIN_ATTEMPTED_KEY = "kyoutsu_auto_login_attempted";

export default function LoginPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [lineLoading, setLineLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [liffReady, setLiffReady] = useState(false);
  const [liffError, setLiffError] = useState<string | null>(null);
  const liffConfigured = isLiffConfigured();
  const loginFlowInProgress = useRef(false);

  useEffect(() => {
    if (isLoggedIn()) {
      router.replace("/");
      return;
    }

    // ログアウト直後かチェック（自動再ログイン防止）
    const justLoggedOut = sessionStorage.getItem("kyoutsu_just_logged_out");
    if (justLoggedOut) {
      sessionStorage.removeItem("kyoutsu_just_logged_out");
      sessionStorage.removeItem(AUTO_LOGIN_ATTEMPTED_KEY);
      // LIFF初期化はするが自動ログインはしない
      if (liffConfigured) {
        initLiff()
          .then(() => setLiffReady(true))
          .catch((err) => {
            console.error("LIFF init failed:", err);
            setLiffError(err instanceof Error ? err.message : "LIFF初期化エラー");
          });
      }
      return;
    }

    // LIFF SDK 初期化
    if (liffConfigured) {
      initLiff()
        .then(() => {
          setLiffReady(true);
          // LIFF初期化後、既にLINEログイン済みなら自動でアプリログイン
          // ただし既に自動ログインを試行済みならスキップ（ループ防止）
          if (isLiffLoggedIn() && !sessionStorage.getItem(AUTO_LOGIN_ATTEMPTED_KEY)) {
            sessionStorage.setItem(AUTO_LOGIN_ATTEMPTED_KEY, "1");
            handleLineLoginFlow();
          }
        })
        .catch((err) => {
          console.error("LIFF init failed:", err);
          setLiffError(err instanceof Error ? err.message : "LIFF初期化エラー");
        });
    }
  }, [router]); // eslint-disable-line react-hooks/exhaustive-deps

  /** LINE IDトークン → API → JWT → ログイン完了 */
  const handleLineLoginFlow = useCallback(async () => {
    // 既にフロー実行中なら二重実行を防止
    if (loginFlowInProgress.current) return;
    loginFlowInProgress.current = true;

    setLineLoading(true);
    setError(null);

    try {
      const idToken = getLiffIdToken();
      if (!idToken) {
        throw new Error("LINE IDトークンを取得できませんでした");
      }

      // API で LINE ユーザー認証 + JWT取得
      const { token, userId } = await apiLineLogin(idToken);
      setToken(token);

      // ユーザー情報を取得してキャッシュ
      const { user } = await apiGetMe();
      setAuthUser({
        id: userId,
        displayName: user.display_name,
        pictureUrl: user.picture_url,
        targetBunrui: user.target_bunrui,
        targetTotal: user.target_total_score,
        examYear: user.exam_year,
        loginMethod: "line",
      });

      // ログイン成功 → 自動ログイン試行フラグをクリア
      sessionStorage.removeItem(AUTO_LOGIN_ATTEMPTED_KEY);

      // 新規ユーザーはオンボーディングへ、既存ユーザーはホームへ
      if (!user.target_bunrui) {
        router.replace("/onboarding");
      } else {
        router.replace("/");
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : "LINEログインに失敗しました";
      // IDトークン期限切れの場合は自動で再ログイン
      if (msg.includes("expired") || msg.includes("invalid")) {
        liffLogin(); // logout→再login でフレッシュなトークンを取得
        return;
      }
      setError(msg);
      setLineLoading(false);
      loginFlowInProgress.current = false;
    }
  }, [router]);

  /** LINEログインボタン押下 */
  const handleLineLogin = useCallback(() => {
    // 手動クリック時はフラグをリセットしてリトライ可能に
    loginFlowInProgress.current = false;

    if (liffReady && isLiffLoggedIn()) {
      // 既にLINEログイン済み → IDトークン取得してAPI認証
      handleLineLoginFlow();
    } else {
      // LINE認証画面にリダイレクト (LIFF未初期化でもliffLogin内でフォールバック)
      sessionStorage.removeItem(AUTO_LOGIN_ATTEMPTED_KEY);
      liffLogin();
    }
  }, [liffReady, handleLineLoginFlow]);

  /** デモログイン */
  const handleDemoLogin = async () => {
    if (!name.trim()) return;
    setLoading(true);
    setError(null);

    try {
      const { token, userId, displayName } = await apiDemoLogin(name.trim());
      setToken(token);

      const { user } = await apiGetMe();
      setAuthUser({
        id: userId,
        displayName: user.display_name,
        pictureUrl: user.picture_url,
        targetBunrui: user.target_bunrui,
        targetTotal: user.target_total_score,
        examYear: user.exam_year,
        loginMethod: "demo",
      });

      router.replace("/onboarding");
    } catch (e) {
      setError(e instanceof Error ? e.message : "ログインに失敗しました");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-950">
      <div className="w-full max-w-sm">
        {/* ── ブランドヘッダー ── */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-3">
            <LogoMark className="w-14 h-14" />
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text text-transparent">
            大学物語
          </h1>
          <p className="text-sm text-gray-400 mt-1">共通テスト攻略プラットフォーム</p>
          <p className="text-xs text-gray-600 mt-1">
            弱点が見える。だから伸びる。
          </p>
        </div>

        {/* ── エラー表示 ── */}
        {error && (
          <div className="mb-4 p-3 bg-red-900/30 border border-red-800/30 rounded-xl text-xs text-red-400">
            {error}
          </div>
        )}

        {/* ── LINEログイン (メイン) ── */}
        <button
          onClick={liffConfigured ? handleLineLogin : undefined}
          disabled={lineLoading}
          className={`w-full py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2 text-sm mb-4 ${
            liffConfigured
              ? "bg-[#06c755] hover:bg-[#05b64c] text-white hover:scale-[1.02] active:scale-95 shadow-lg shadow-[#06c755]/20"
              : "bg-[#06c755]/30 text-white/50 cursor-not-allowed"
          }`}
        >
          <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
            <path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63h2.386c.346 0 .627.285.627.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.104.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63.346 0 .628.285.628.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.282.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314" />
          </svg>
          {lineLoading
            ? "LINEログイン中..."
            : liffConfigured
              ? "LINEでログイン"
              : "LINEでログイン (準備中)"}
        </button>

        {liffError && (
          <p className="text-[10px] text-red-400 text-center mb-4">
            LINE SDK エラー: {liffError}
          </p>
        )}


        {!liffConfigured && (
          <p className="text-[10px] text-gray-600 text-center mb-4">
            LINE Login は環境変数 NEXT_PUBLIC_LIFF_ID の設定後に有効化されます
          </p>
        )}

        {/* ── 区切り ── */}
        <div className="flex items-center gap-3 mb-4">
          <div className="flex-1 h-px bg-gray-800" />
          <span className="text-[10px] text-gray-600">または</span>
          <div className="flex-1 h-px bg-gray-800" />
        </div>

        {/* ── デモログイン ── */}
        <div className="bg-gray-900 rounded-xl border border-gray-800 p-4">
          <h2 className="text-xs font-bold text-gray-500 mb-2">体験ログイン</h2>
          <div className="flex gap-2">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleDemoLogin()}
              placeholder="名前を入力"
              className="flex-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg
                         focus:border-green-500 focus:outline-none text-sm"
              disabled={loading}
            />
            <button
              onClick={handleDemoLogin}
              disabled={!name.trim() || loading}
              className="px-4 py-2 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 disabled:text-gray-600
                         rounded-lg font-medium transition-colors text-sm whitespace-nowrap"
            >
              {loading ? "..." : "開始"}
            </button>
          </div>
        </div>

        <p className="text-[10px] text-gray-600 mt-6 text-center">
          daigaku-monogatari.pages.dev
        </p>
      </div>
    </div>
  );
}
