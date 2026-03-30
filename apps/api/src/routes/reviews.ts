import { Hono } from "hono";
import { recordReviewSchema } from "@kyoutsu/shared";
import type { Env } from "../types";
import { sm2, type ReviewState } from "../services/spaced-repetition";
import { generateId } from "../lib/ulid";

const reviews = new Hono<Env>();

/** 今日の復習対象一覧 */
reviews.get("/due", async (c) => {
  const userId = c.get("userId");
  const today = new Date().toISOString().slice(0, 10);

  const result = await c.env.DB.prepare(`
    SELECT rs.*, q.body, q.difficulty, q.question_type,
           f.subject_id, f.name as field_name
    FROM review_schedules rs
    JOIN questions q ON rs.question_id = q.id
    JOIN units u ON q.unit_id = u.id
    JOIN fields f ON u.field_id = f.id
    WHERE rs.user_id = ? AND rs.next_review_date <= ?
    ORDER BY rs.next_review_date
    LIMIT 50
  `)
    .bind(userId, today)
    .all();

  return c.json({ reviews: result.results });
});

/** 復習件数 */
reviews.get("/due/count", async (c) => {
  const userId = c.get("userId");
  const today = new Date().toISOString().slice(0, 10);

  const result = await c.env.DB.prepare(`
    SELECT COUNT(*) as count FROM review_schedules
    WHERE user_id = ? AND next_review_date <= ?
  `)
    .bind(userId, today)
    .first<{ count: number }>();

  return c.json({ count: result?.count || 0 });
});

/** 復習結果記録 (SM-2更新) */
reviews.post("/record", async (c) => {
  const userId = c.get("userId");
  const body = recordReviewSchema.parse(await c.req.json());

  // 問題の難易度を取得
  const question = await c.env.DB.prepare(
    "SELECT difficulty FROM questions WHERE id = ?"
  )
    .bind(body.questionId)
    .first<{ difficulty: number }>();

  // 既存のレビュースケジュール取得
  const existing = await c.env.DB.prepare(
    "SELECT * FROM review_schedules WHERE user_id = ? AND question_id = ?"
  )
    .bind(userId, body.questionId)
    .first<{
      id: string;
      ease_factor: number;
      interval_days: number;
      repetitions: number;
    }>();

  const currentState: ReviewState = existing
    ? {
        easeFactor: existing.ease_factor,
        interval: existing.interval_days,
        repetitions: existing.repetitions,
      }
    : { easeFactor: 2.5, interval: 0, repetitions: 0 };

  const newState = sm2(currentState, body.quality, question?.difficulty || 3);

  const today = new Date();
  const nextReview = new Date(today);
  nextReview.setDate(today.getDate() + newState.interval);
  const nextReviewDate = nextReview.toISOString().slice(0, 10);

  if (existing) {
    await c.env.DB.prepare(`
      UPDATE review_schedules
      SET ease_factor = ?, interval_days = ?, repetitions = ?,
          quality = ?, next_review_date = ?, last_reviewed_at = datetime('now')
      WHERE id = ?
    `)
      .bind(
        newState.easeFactor, newState.interval, newState.repetitions,
        body.quality, nextReviewDate, existing.id
      )
      .run();
  } else {
    await c.env.DB.prepare(`
      INSERT INTO review_schedules (id, user_id, question_id, ease_factor, interval_days, repetitions, quality, next_review_date, last_reviewed_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
    `)
      .bind(
        generateId(), userId, body.questionId,
        newState.easeFactor, newState.interval, newState.repetitions,
        body.quality, nextReviewDate
      )
      .run();
  }

  return c.json({ nextReviewDate, interval: newState.interval, easeFactor: newState.easeFactor });
});

export default reviews;
