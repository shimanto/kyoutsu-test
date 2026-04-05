/**
 * 認証管理 — API (D1) 連携版
 * JWT トークンを localStorage に保存
 * ユーザー情報は API から取得してキャッシュ
 */

const TOKEN_KEY = "kyoutsu_token";
const USER_CACHE_KEY = "kyoutsu_user_cache";

export interface AuthUser {
  id: string;
  displayName: string;
  pictureUrl: string | null;
  targetBunrui: string;
  targetTotal: number;
  examYear: number;
  loginMethod: "demo" | "line";
}

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

export function getAuthUser(): AuthUser | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(USER_CACHE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as AuthUser;
  } catch {
    return null;
  }
}

export function setAuthUser(user: AuthUser): void {
  localStorage.setItem(USER_CACHE_KEY, JSON.stringify(user));
}

export function isLoggedIn(): boolean {
  return getToken() !== null;
}

export function logout(): void {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_CACHE_KEY);
  // LIFF ログアウトフラグを立てて、ログインページでの自動再ログインを防止
  sessionStorage.setItem("kyoutsu_just_logged_out", "1");
  sessionStorage.removeItem("kyoutsu_auto_login_attempted");
  // LIFF SDKのセッションもクリア（動的importで安全にアクセス）
  try {
    import("@line/liff").then((mod) => {
      const liff = mod.default;
      if (liff.isLoggedIn()) liff.logout();
    }).catch(() => { /* LIFF未読込の場合は無視 */ });
  } catch { /* LIFF未読込の場合は無視 */ }
  window.location.href = "/login";
}
