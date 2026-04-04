import { createMiddleware } from "hono/factory";
import type { Env } from "../types";

/** 簡易レートリミット (メモリベース、Workers再起動でリセット) */
const requests = new Map<string, { count: number; resetAt: number }>();
const WINDOW_MS = 60_000; // 1分
const MAX_REQUESTS = 60;  // 1分あたり60リクエスト
let lastCleanup = Date.now();
const CLEANUP_INTERVAL = 60_000; // 1分ごとにクリーンアップ

export const rateLimitMiddleware = createMiddleware<Env>(async (c, next) => {
  const ip = c.req.header("cf-connecting-ip") || "unknown";
  const now = Date.now();
  const entry = requests.get(ip);

  if (entry && entry.resetAt > now) {
    if (entry.count >= MAX_REQUESTS) {
      return c.json({ error: "Too many requests" }, 429);
    }
    entry.count++;
  } else {
    // 期限切れ or 新規 → リセット
    requests.set(ip, { count: 1, resetAt: now + WINDOW_MS });
  }

  // 定期クリーンアップ (時間ベース、サイズ肥大を防止)
  if (now - lastCleanup > CLEANUP_INTERVAL) {
    lastCleanup = now;
    const expired: string[] = [];
    for (const [k, v] of requests) {
      if (v.resetAt <= now) expired.push(k);
    }
    for (const k of expired) requests.delete(k);
  }

  await next();
});
