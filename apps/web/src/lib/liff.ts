/**
 * LIFF (LINE Frontend Framework) 初期化・ユーティリティ
 *
 * LIFF SDKをクライアントサイドで初期化し、LINEログイン機能を提供する。
 * LIFF_ID が未設定の場合は全機能を無効化する。
 */

import liff from "@line/liff";

const LIFF_ID = process.env.NEXT_PUBLIC_LIFF_ID || "";

let initialized = false;
let initPromise: Promise<void> | null = null;

/** LIFF_ID が設定されているか */
export function isLiffConfigured(): boolean {
  return LIFF_ID.length > 0;
}

/** LIFF SDK を初期化する (1回だけ実行) */
export async function initLiff(): Promise<void> {
  if (!isLiffConfigured()) {
    throw new Error("LIFF_ID が設定されていません");
  }

  if (initialized) return;

  if (initPromise) return initPromise;

  initPromise = liff
    .init({ liffId: LIFF_ID })
    .then(() => {
      initialized = true;
    })
    .catch((err) => {
      // "Unable to load client features" は外部ブラウザでの非致命的エラー
      // ログインリダイレクト機能は引き続き使用可能
      if (err?.message?.includes("client features")) {
        initialized = true;
        return;
      }
      initPromise = null;
      throw err;
    });

  return initPromise;
}

/** LIFF SDK が初期化済みか */
export function isLiffInitialized(): boolean {
  return initialized;
}

/** LINE にログイン済みか */
export function isLiffLoggedIn(): boolean {
  return initialized && liff.isLoggedIn();
}

/** LIFF 環境内 (LINEアプリ内ブラウザ) で実行されているか */
export function isInLiffClient(): boolean {
  return initialized && liff.isInClient();
}

/**
 * LINE ログインを実行する
 * - LIFF環境外: LINE認証画面にリダイレクト
 * - LIFF環境内: 自動的にログイン済み
 */
export function liffLogin(): void {
  if (!initialized) {
    window.location.href = `https://liff.line.me/${LIFF_ID}`;
    return;
  }

  // 既にログイン済みでもIDトークンが期限切れの可能性がある
  // 一度ログアウトしてから再ログインすることでフレッシュなトークンを取得
  if (liff.isLoggedIn()) {
    liff.logout();
  }
  liff.login({ redirectUri: window.location.origin + "/login" });
}

/**
 * LINE ID トークンを取得する
 * バックエンドの /auth/line-login に送信して JWT に交換する。
 */
export function getLiffIdToken(): string | null {
  if (!initialized || !liff.isLoggedIn()) return null;
  return liff.getIDToken();
}

/** LINE プロフィール情報を取得する */
export async function getLiffProfile() {
  if (!initialized || !liff.isLoggedIn()) return null;
  const profile = await liff.getProfile();
  return {
    userId: profile.userId,
    displayName: profile.displayName,
    pictureUrl: profile.pictureUrl || null,
  };
}

/** LIFF ログアウト */
export function liffLogout(): void {
  if (initialized && liff.isLoggedIn()) {
    liff.logout();
  }
}
