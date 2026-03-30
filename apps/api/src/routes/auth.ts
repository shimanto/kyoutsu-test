import { Hono } from "hono";
import { SignJWT } from "jose";
import { loginSchema } from "@kyoutsu/shared";
import type { Env } from "../types";
import { generateId } from "../lib/ulid";

const auth = new Hono<Env>();

/** LINE IDトークン検証 → JWT発行 */
auth.post("/line-login", async (c) => {
  const body = await c.req.json();
  const { idToken } = loginSchema.parse(body);

  // LINE IDトークンを検証
  const verifyRes = await fetch("https://api.line.me/oauth2/v2.1/verify", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      id_token: idToken,
      client_id: c.env.LINE_CHANNEL_ID,
    }),
  });

  if (!verifyRes.ok) {
    return c.json({ error: "LINE token verification failed" }, 401);
  }

  const lineProfile = (await verifyRes.json()) as {
    sub: string;
    name: string;
    picture?: string;
  };

  // ユーザー upsert
  const existing = await c.env.DB.prepare(
    "SELECT id, role FROM users WHERE line_user_id = ?"
  )
    .bind(lineProfile.sub)
    .first<{ id: string; role: string }>();

  let userId: string;
  let role: string;

  if (existing) {
    userId = existing.id;
    role = existing.role;
    await c.env.DB.prepare(
      "UPDATE users SET display_name = ?, picture_url = ?, updated_at = datetime('now') WHERE id = ?"
    )
      .bind(lineProfile.name, lineProfile.picture || null, userId)
      .run();
  } else {
    userId = generateId();
    role = "student";
    const currentYear = new Date().getFullYear();
    await c.env.DB.prepare(
      `INSERT INTO users (id, line_user_id, display_name, picture_url, exam_year)
       VALUES (?, ?, ?, ?, ?)`
    )
      .bind(userId, lineProfile.sub, lineProfile.name, lineProfile.picture || null, currentYear + 1)
      .run();
  }

  // JWT発行
  const secret = new TextEncoder().encode(c.env.JWT_SECRET);
  const token = await new SignJWT({ sub: userId, role })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("30d")
    .sign(secret);

  return c.json({ token, userId });
});

export default auth;
