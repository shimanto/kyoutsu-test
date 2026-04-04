import { cors } from "hono/cors";

export const corsMiddleware = cors({
  origin: (origin) => {
    const allowed = [
      "http://localhost:3000",
      "https://daigaku-monogatari.pages.dev",
      "https://kanri-daimono.pages.dev",
    ];
    if (allowed.includes(origin)) return origin;
    // Cloudflare Pages プレビューデプロイ対応
    if (/^https:\/\/[a-z0-9-]+\.daigaku-monogatari\.pages\.dev$/.test(origin)) return origin;
    if (/^https:\/\/[a-z0-9-]+\.kanri-daimono\.pages\.dev$/.test(origin)) return origin;
    return null;
  },
  allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowHeaders: ["Content-Type", "Authorization"],
  credentials: true,
});
