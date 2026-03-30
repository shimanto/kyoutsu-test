import { Hono } from "hono";
import { z } from "zod";
import type { Env } from "../types";
import { generateId } from "../lib/ulid";
import {
  generateSubjectProfiles,
  generateFieldResults,
  generateAnswerRecords,
  deviationToBaseRate,
} from "../services/test-data-generator";

const setup = new Hono<Env>();

const setupSchema = z.object({
  deviation: z.number().int().min(30).max(80),
  targetBunrui: z.enum(["rika1", "rika2", "rika3"]).default("rika1"),
  targetTotal: z.number().int().min(400).max(900).default(780),
  examYear: z.number().int().default(2027),
});

/**
 * POST /setup/generate-test-data
 * 偏差値を入力 → そのユーザー用のランダム学習データをD1に一括投入
 */
setup.post("/generate-test-data", async (c) => {
  const userId = c.get("userId");
  const body = setupSchema.parse(await c.req.json());

  // 1. ユーザープロフィール更新
  await c.env.DB.prepare(
    `UPDATE users SET target_bunrui = ?, target_total_score = ?, exam_year = ?, updated_at = datetime('now') WHERE id = ?`
  ).bind(body.targetBunrui, body.targetTotal, body.examYear, userId).run();

  // 2. 科目別プロファイル生成
  const profiles = generateSubjectProfiles(body.deviation, body.targetBunrui);

  // 3. 科目別目標点を保存
  const SUBJECT_MAX: Record<string, number> = {
    kokugo: 200, math1a: 100, math2bc: 100, eng_read: 100, eng_listen: 100,
    physics: 100, chemistry: 100, social: 100, info1: 100,
  };

  const targetStmt = c.env.DB.prepare(
    `INSERT INTO user_subject_targets (id, user_id, subject_id, target_score)
     VALUES (?, ?, ?, ?) ON CONFLICT(user_id, subject_id) DO UPDATE SET target_score = excluded.target_score`
  );
  const targetBatch = profiles.map((p) => {
    const max = SUBJECT_MAX[p.subjectId] || 100;
    const targetRate = Math.min(0.95, p.baseRate + 0.12); // 現在+12%が目標
    const targetScore = Math.round(targetRate * max);
    return targetStmt.bind(generateId(), userId, p.subjectId, targetScore);
  });
  await c.env.DB.batch(targetBatch);

  // 4. 分野リスト取得
  const fieldsResult = await c.env.DB.prepare(
    "SELECT f.id, f.subject_id FROM fields f ORDER BY f.subject_id, f.display_order"
  ).all<{ id: string; subject_id: string }>();

  const fieldsBySubject: Record<string, string[]> = {};
  for (const f of fieldsResult.results) {
    (fieldsBySubject[f.subject_id] ||= []).push(f.id);
  }

  // 5. 分野別結果生成
  const fieldResults = generateFieldResults(profiles, fieldsBySubject, body.deviation);

  // 6. DB の問題を取得
  const questionsResult = await c.env.DB.prepare(
    "SELECT q.id, u.field_id FROM questions q JOIN units u ON q.unit_id = u.id"
  ).all<{ id: string; field_id: string }>();

  const questionsByField: Record<string, string[]> = {};
  for (const q of questionsResult.results) {
    (questionsByField[q.field_id] ||= []).push(q.id);
  }

  // 7. 既存の回答データを削除 (このユーザーの)
  await c.env.DB.prepare("DELETE FROM answers WHERE user_id = ?").bind(userId).run();
  await c.env.DB.prepare("DELETE FROM study_sessions WHERE user_id = ?").bind(userId).run();
  await c.env.DB.prepare("DELETE FROM review_schedules WHERE user_id = ?").bind(userId).run();

  // 8. 学習セッション + 回答データ投入
  const answerRecords = generateAnswerRecords(fieldResults, questionsByField, body.deviation);

  if (answerRecords.length > 0) {
    const sessionId = generateId();
    await c.env.DB.prepare(
      `INSERT INTO study_sessions (id, user_id, session_type, total_questions, correct_count, finished_at)
       VALUES (?, ?, 'drill', ?, ?, datetime('now'))`
    ).bind(sessionId, userId, answerRecords.length, answerRecords.filter((a) => a.isCorrect).length).run();

    // バッチで回答投入 (D1は500件制限があるので分割)
    const answerStmt = c.env.DB.prepare(
      `INSERT INTO answers (id, user_id, session_id, question_id, is_correct, time_spent_ms)
       VALUES (?, ?, ?, ?, ?, ?)`
    );

    for (let i = 0; i < answerRecords.length; i += 50) {
      const chunk = answerRecords.slice(i, i + 50);
      await c.env.DB.batch(chunk.map((a) =>
        answerStmt.bind(generateId(), userId, sessionId, a.questionId, a.isCorrect ? 1 : 0, a.timeSpentMs)
      ));
    }
  }

  // 9. サマリーを返す
  const totalScore = profiles.reduce((sum, p) => {
    const max = SUBJECT_MAX[p.subjectId] || 100;
    return sum + Math.round(p.baseRate * max);
  }, 0);

  return c.json({
    deviation: body.deviation,
    estimatedTotal: totalScore,
    subjectScores: profiles.map((p) => ({
      subjectId: p.subjectId,
      rate: Math.round(p.baseRate * 100),
      estimatedScore: Math.round(p.baseRate * (SUBJECT_MAX[p.subjectId] || 100)),
    })),
    answersGenerated: answerRecords.length,
    message: `偏差値${body.deviation}のテストデータを生成しました (推定${totalScore}/900点)`,
  });
});

export default setup;
