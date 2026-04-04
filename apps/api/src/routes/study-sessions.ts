import { Hono } from "hono";
import { startSessionSchema, submitAnswerSchema } from "@kyoutsu/shared";
import type { Env } from "../types";
import { generateId } from "../lib/ulid";

const studySessions = new Hono<Env>();

/** セッション開始 */
studySessions.post("/", async (c) => {
  const userId = c.get("userId");
  const body = startSessionSchema.parse(await c.req.json());

  const sessionId = generateId();
  await c.env.DB.prepare(
    `INSERT INTO study_sessions (id, user_id, session_type, subject_id, field_id)
     VALUES (?, ?, ?, ?, ?)`
  )
    .bind(sessionId, userId, body.sessionType, body.subjectId || null, body.fieldId || null)
    .run();

  // セッション用の問題を取得
  let sql: string;
  const params: unknown[] = [];

  if (body.fieldId) {
    sql = `SELECT q.* FROM questions q JOIN units u ON q.unit_id = u.id
           WHERE u.field_id = ? ORDER BY RANDOM() LIMIT ?`;
    params.push(body.fieldId, body.questionCount);
  } else if (body.subjectId) {
    sql = `SELECT q.* FROM questions q JOIN units u ON q.unit_id = u.id JOIN fields f ON u.field_id = f.id
           WHERE f.subject_id = ? ORDER BY RANDOM() LIMIT ?`;
    params.push(body.subjectId, body.questionCount);
  } else {
    sql = `SELECT * FROM questions ORDER BY RANDOM() LIMIT ?`;
    params.push(body.questionCount);
  }

  const questions = await c.env.DB.prepare(sql).bind(...params).all();

  if (questions.results.length === 0) {
    // 空セッションをロールバック
    await c.env.DB.prepare("DELETE FROM study_sessions WHERE id = ?").bind(sessionId).run();
    return c.json({ error: "この分野には問題が登録されていません" }, 400);
  }

  return c.json({ sessionId, questions: questions.results });
});

/** セッション詳細 */
studySessions.get("/:id", async (c) => {
  const sessionId = c.req.param("id");
  const userId = c.get("userId");

  const session = await c.env.DB.prepare(
    "SELECT * FROM study_sessions WHERE id = ? AND user_id = ?"
  )
    .bind(sessionId, userId)
    .first();

  if (!session) return c.json({ error: "Session not found" }, 404);

  const answers = await c.env.DB.prepare(
    "SELECT * FROM answers WHERE session_id = ? ORDER BY answered_at"
  )
    .bind(sessionId)
    .all();

  return c.json({ session, answers: answers.results });
});

/** 回答送信 */
studySessions.post("/:id/answer", async (c) => {
  const sessionId = c.req.param("id");
  const userId = c.get("userId");
  const body = submitAnswerSchema.parse(await c.req.json());

  // 正解判定
  let isCorrect = 0;
  if (body.chosenChoiceId) {
    const choice = await c.env.DB.prepare(
      "SELECT is_correct FROM choices WHERE id = ? AND question_id = ?"
    )
      .bind(body.chosenChoiceId, body.questionId)
      .first<{ is_correct: number }>();
    isCorrect = choice?.is_correct || 0;
  }

  const answerId = generateId();
  await c.env.DB.prepare(
    `INSERT INTO answers (id, user_id, session_id, question_id, chosen_choice_id, numeric_answer, is_correct, time_spent_ms)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
  )
    .bind(
      answerId, userId, sessionId, body.questionId,
      body.chosenChoiceId || null, body.numericAnswer || null,
      isCorrect, body.timeSpentMs || null
    )
    .run();

  // セッション集計更新
  await c.env.DB.prepare(
    `UPDATE study_sessions SET total_questions = total_questions + 1,
     correct_count = correct_count + ? WHERE id = ?`
  )
    .bind(isCorrect, sessionId)
    .run();

  // 解説取得
  const question = await c.env.DB.prepare(
    "SELECT explanation FROM questions WHERE id = ?"
  )
    .bind(body.questionId)
    .first<{ explanation: string | null }>();

  const correctChoice = await c.env.DB.prepare(
    "SELECT * FROM choices WHERE question_id = ? AND is_correct = 1"
  )
    .bind(body.questionId)
    .first();

  return c.json({
    answerId,
    isCorrect: isCorrect === 1,
    explanation: question?.explanation,
    correctChoice,
  });
});

/** セッション終了 */
studySessions.post("/:id/finish", async (c) => {
  const sessionId = c.req.param("id");
  const userId = c.get("userId");

  await c.env.DB.prepare(
    "UPDATE study_sessions SET finished_at = datetime('now') WHERE id = ? AND user_id = ?"
  )
    .bind(sessionId, userId)
    .run();

  const session = await c.env.DB.prepare(
    "SELECT * FROM study_sessions WHERE id = ?"
  )
    .bind(sessionId)
    .first();

  return c.json({ session });
});

export default studySessions;
