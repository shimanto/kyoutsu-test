import { Hono } from "hono";
import { SignJWT } from "jose";
import { loginSchema } from "@kyoutsu/shared";
import { z } from "zod";
import type { Env } from "../types";
import { generateId } from "../lib/ulid";

const auth = new Hono<Env>();

const demoLoginSchema = z.object({
  displayName: z.string().min(1).max(100),
});

/** デモログイン → ユーザー作成 + JWT発行 */
auth.post("/demo-login", async (c) => {
  const body = await c.req.json();
  const { displayName } = demoLoginSchema.parse(body);

  const userId = generateId();
  const currentYear = new Date().getFullYear();

  await c.env.DB.prepare(
    `INSERT INTO users (id, line_user_id, display_name, exam_year)
     VALUES (?, ?, ?, ?)`
  )
    .bind(userId, `demo-${userId}`, displayName, currentYear + 1)
    .run();

  const secret = new TextEncoder().encode(c.env.JWT_SECRET);
  const token = await new SignJWT({ sub: userId, role: "student" })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("30d")
    .sign(secret);

  return c.json({ token, userId, displayName });
});

/** LINE IDトークン検証 → JWT発行 */
auth.post("/line-login", async (c) => {
  const body = await c.req.json();
  const { idToken } = loginSchema.parse(body);

  const verifyRes = await fetch("https://api.line.me/oauth2/v2.1/verify", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      id_token: idToken,
      client_id: c.env.LINE_CHANNEL_ID,
    }),
  });

  if (!verifyRes.ok) {
    const errBody = await verifyRes.text().catch(() => "unknown");
    return c.json({ error: `LINE token verification failed: ${errBody}` }, 401);
  }

  const lineProfile = (await verifyRes.json()) as {
    sub: string;
    name: string;
    picture?: string;
  };

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

  const secret = new TextEncoder().encode(c.env.JWT_SECRET);
  const token = await new SignJWT({ sub: userId, role })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("30d")
    .sign(secret);

  return c.json({ token, userId });
});

export default auth;
