/**
 * 認証管理 (クライアントサイド)
 * デモモード: 名前入力でログイン
 * LINE Login: LIFF_ID設定後に有効化
 */

const AUTH_KEY = "kyoutsu_auth";

export interface AuthUser {
  id: string;
  displayName: string;
  pictureUrl: string | null;
  targetBunrui: string;
  targetTotal: number;
  examYear: number;
  loginMethod: "demo" | "line";
  createdAt: string;
}

export function getAuthUser(): AuthUser | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(AUTH_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as AuthUser;
  } catch {
    return null;
  }
}

export function setAuthUser(user: AuthUser): void {
  localStorage.setItem(AUTH_KEY, JSON.stringify(user));
}

export function logout(): void {
  localStorage.removeItem(AUTH_KEY);
  window.location.href = "/login";
}

export function demoLogin(displayName: string): AuthUser {
  const user: AuthUser = {
    id: `demo-${Date.now()}`,
    displayName,
    pictureUrl: null,
    targetBunrui: "rika1",
    targetTotal: 780,
    examYear: 2027,
    loginMethod: "demo",
    createdAt: new Date().toISOString(),
  };
  setAuthUser(user);
  return user;
}

export function isLoggedIn(): boolean {
  return getAuthUser() !== null;
}
