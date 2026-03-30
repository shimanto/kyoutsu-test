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
  window.location.href = "/login";
}
