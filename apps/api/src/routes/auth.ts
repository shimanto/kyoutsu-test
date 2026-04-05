import { Hono } from "hono";
import { SignJWT } from "jose";
import { loginSchema } from "@kyoutsu/shared";
import { z } from "zod";
import type { Env } from "../types";
import { generateId } from "../lib/ulid";
import { notifyAdminLogin } from "../lib/line-notify";

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

  const isNewUser = !existing;

  const secret = new TextEncoder().encode(c.env.JWT_SECRET);
  const token = await new SignJWT({ sub: userId, role })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("30d")
    .sign(secret);

  // 管理者にLINEログイン通知（非同期・ノンブロッキング）
  c.executionCtx.waitUntil(
    notifyAdminLogin({
      db: c.env.DB,
      token: c.env.LINE_MESSAGING_CHANNEL_ACCESS_TOKEN,
      displayName: lineProfile.name,
      lineUserId: lineProfile.sub,
      isNewUser,
    })
  );

  return c.json({ token, userId });
});

/** 管理者ログイン (パスワード認証) */
auth.post("/admin-login", async (c) => {
  const body = z.object({
    password: z.string().min(1),
  }).parse(await c.req.json());

  // 管理者パスワードは JWT_SECRET の先頭16文字をハッシュ代わりに使用
  const adminPass = c.env.JWT_SECRET.slice(0, 16);
  if (body.password !== adminPass) {
    return c.json({ error: "Invalid admin password" }, 401);
  }

  // 管理者ユーザーを取得 or 作成
  let admin = await c.env.DB.prepare(
    "SELECT id FROM users WHERE role = 'admin' LIMIT 1"
  ).first<{ id: string }>();

  if (!admin) {
    const adminId = generateId();
    await c.env.DB.prepare(
      `INSERT INTO users (id, line_user_id, display_name, role, exam_year)
       VALUES (?, ?, ?, 'admin', ?)`
    ).bind(adminId, `admin-${adminId}`, "管理者", new Date().getFullYear() + 1).run();
    admin = { id: adminId };
  }

  const secret = new TextEncoder().encode(c.env.JWT_SECRET);
  const token = await new SignJWT({ sub: admin.id, role: "admin" })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("7d")
    .sign(secret);

  return c.json({ token, userId: admin.id });
});

export default auth;
