/** 簡易ULID生成 (crypto.randomUUID fallback) */
export function generateId(): string {
  return crypto.randomUUID().replace(/-/g, "");
}
