import { Hono } from "hono";
import { submitFeedbackSchema } from "@kyoutsu/shared";
import type { Env } from "../types";
import { generateId } from "../lib/ulid";

const feedback = new Hono<Env>();

/** フィードバック送信 */
feedback.post("/", async (c) => {
  const userId = c.get("userId");
  const body = submitFeedbackSchema.parse(await c.req.json());
  const id = generateId();

  await c.env.DB.prepare(`
    INSERT INTO feedback (id, user_id, category, rating, body, page_url)
    VALUES (?, ?, ?, ?, ?, ?)
  `)
    .bind(id, userId, body.category, body.rating, body.body, body.pageUrl || null)
    .run();

  return c.json({ id }, 201);
});

/** 自分のフィードバック一覧 */
feedback.get("/mine", async (c) => {
  const userId = c.get("userId");
  const result = await c.env.DB.prepare(`
    SELECT id, category, rating, body, page_url, status, created_at
    FROM feedback WHERE user_id = ?
    ORDER BY created_at DESC LIMIT 50
  `)
    .bind(userId)
    .all();

  return c.json({ feedback: result.results });
});

/** 管理者: 全フィードバック一覧 */
feedback.get("/all", async (c) => {
  const status = c.req.query("status") || "new";
  const limit = Math.min(Number(c.req.query("limit")) || 50, 200);

  const result = await c.env.DB.prepare(`
    SELECT f.id, f.user_id, u.display_name, f.category, f.rating,
           f.body, f.page_url, f.status, f.admin_note, f.created_at
    FROM feedback f
    JOIN users u ON f.user_id = u.id
    WHERE f.status = ?
    ORDER BY f.created_at DESC
    LIMIT ?
  `)
    .bind(status, limit)
    .all();

  return c.json({ feedback: result.results });
});

/** 管理者: ステータス更新 */
feedback.patch("/:id", async (c) => {
  const id = c.req.param("id");
  const { status, adminNote } = await c.req.json<{
    status?: string;
    adminNote?: string;
  }>();

  const sets: string[] = [];
  const values: (string | null)[] = [];
  if (status) {
    sets.push("status = ?");
    values.push(status);
  }
  if (adminNote !== undefined) {
    sets.push("admin_note = ?");
    values.push(adminNote);
  }
  if (sets.length === 0) return c.json({ error: "No fields to update" }, 400);

  values.push(id);
  await c.env.DB.prepare(`UPDATE feedback SET ${sets.join(", ")} WHERE id = ?`)
    .bind(...values)
    .run();

  return c.json({ ok: true });
});

/** フィードバック集計 (管理者用) */
feedback.get("/stats", async (c) => {
  const [byCategory, byRating, byStatus] = await Promise.all([
    c.env.DB.prepare(`
      SELECT category, COUNT(*) as count, ROUND(AVG(rating), 1) as avg_rating
      FROM feedback GROUP BY category
    `).all(),
    c.env.DB.prepare(`
      SELECT rating, COUNT(*) as count FROM feedback GROUP BY rating ORDER BY rating
    `).all(),
    c.env.DB.prepare(`
      SELECT status, COUNT(*) as count FROM feedback GROUP BY status
    `).all(),
  ]);

  return c.json({
    byCategory: byCategory.results,
    byRating: byRating.results,
    byStatus: byStatus.results,
  });
});

export default feedback;
