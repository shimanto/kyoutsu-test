import { Hono } from "hono";
import { updateProfileSchema, updateTargetsSchema } from "@kyoutsu/shared";
import type { Env } from "../types";
import { generateId } from "../lib/ulid";

const users = new Hono<Env>();

users.get("/me", async (c) => {
  const userId = c.get("userId");
  const user = await c.env.DB.prepare("SELECT * FROM users WHERE id = ?")
    .bind(userId)
    .first();

  if (!user) return c.json({ error: "User not found" }, 404);

  const targets = await c.env.DB.prepare(
    "SELECT subject_id, target_score FROM user_subject_targets WHERE user_id = ?"
  )
    .bind(userId)
    .all();

  return c.json({ user, targets: targets.results });
});

users.put("/me", async (c) => {
  const userId = c.get("userId");
  const body = updateProfileSchema.parse(await c.req.json());

  const sets: string[] = [];
  const values: unknown[] = [];

  if (body.displayName !== undefined) { sets.push("display_name = ?"); values.push(body.displayName); }
  if (body.targetBunrui !== undefined) { sets.push("target_bunrui = ?"); values.push(body.targetBunrui); }
  if (body.targetTotalScore !== undefined) { sets.push("target_total_score = ?"); values.push(body.targetTotalScore); }
  if (body.examYear !== undefined) { sets.push("exam_year = ?"); values.push(body.examYear); }

  if (sets.length === 0) return c.json({ ok: true });

  sets.push("updated_at = datetime('now')");
  values.push(userId);

  await c.env.DB.prepare(`UPDATE users SET ${sets.join(", ")} WHERE id = ?`)
    .bind(...values)
    .run();

  return c.json({ ok: true });
});

users.put("/me/targets", async (c) => {
  const userId = c.get("userId");
  const { targets } = updateTargetsSchema.parse(await c.req.json());

  const stmt = c.env.DB.prepare(
    `INSERT INTO user_subject_targets (id, user_id, subject_id, target_score)
     VALUES (?, ?, ?, ?)
     ON CONFLICT(user_id, subject_id) DO UPDATE SET target_score = excluded.target_score`
  );

  const batch = targets.map((t) =>
    stmt.bind(generateId(), userId, t.subjectId, t.targetScore)
  );
  await c.env.DB.batch(batch);

  return c.json({ ok: true });
});

export default users;
