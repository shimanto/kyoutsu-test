import { Hono } from "hono";
import type { Env } from "../types";

const analytics = new Hono<Env>();

/** 全体概要 (科目別スコア推定 + ヒートマップ用データ) */
analytics.get("/overview", async (c) => {
  const userId = c.get("userId");

  // 科目別正答率
  const subjectStats = await c.env.DB.prepare(`
    SELECT f.subject_id,
           COUNT(*) as total,
           SUM(a.is_correct) as correct
    FROM answers a
    JOIN questions q ON a.question_id = q.id
    JOIN units u ON q.unit_id = u.id
    JOIN fields f ON u.field_id = f.id
    WHERE a.user_id = ?
    GROUP BY f.subject_id
  `)
    .bind(userId)
    .all();

  // 分野別正答率 (ヒートマップ用)
  const fieldStats = await c.env.DB.prepare(`
    SELECT f.id as field_id,
           f.name as field_name,
           f.subject_id,
           COUNT(*) as total,
           SUM(a.is_correct) as correct
    FROM answers a
    JOIN questions q ON a.question_id = q.id
    JOIN units u ON q.unit_id = u.id
    JOIN fields f ON u.field_id = f.id
    WHERE a.user_id = ?
    GROUP BY f.id
  `)
    .bind(userId)
    .all();

  // 目標点
  const targets = await c.env.DB.prepare(
    "SELECT subject_id, target_score FROM user_subject_targets WHERE user_id = ?"
  )
    .bind(userId)
    .all();

  return c.json({
    subjectStats: subjectStats.results,
    fieldStats: fieldStats.results,
    targets: targets.results,
  });
});

/** 科目別詳細分析 */
analytics.get("/subject/:subjectId", async (c) => {
  const userId = c.get("userId");
  const subjectId = c.req.param("subjectId");

  // 分野別正答率
  const fieldStats = await c.env.DB.prepare(`
    SELECT f.id as field_id,
           f.name as field_name,
           COUNT(*) as total,
           SUM(a.is_correct) as correct,
           AVG(a.time_spent_ms) as avg_time_ms
    FROM answers a
    JOIN questions q ON a.question_id = q.id
    JOIN units u ON q.unit_id = u.id
    JOIN fields f ON u.field_id = f.id
    WHERE a.user_id = ? AND f.subject_id = ?
    GROUP BY f.id
    ORDER BY f.display_order
  `)
    .bind(userId, subjectId)
    .all();

  // 難易度別正答率
  const difficultyStats = await c.env.DB.prepare(`
    SELECT q.difficulty,
           COUNT(*) as total,
           SUM(a.is_correct) as correct
    FROM answers a
    JOIN questions q ON a.question_id = q.id
    JOIN units u ON q.unit_id = u.id
    JOIN fields f ON u.field_id = f.id
    WHERE a.user_id = ? AND f.subject_id = ?
    GROUP BY q.difficulty
    ORDER BY q.difficulty
  `)
    .bind(userId, subjectId)
    .all();

  return c.json({
    fieldStats: fieldStats.results,
    difficultyStats: difficultyStats.results,
  });
});

/** 時系列推移 (セッション単位) */
analytics.get("/history", async (c) => {
  const userId = c.get("userId");

  const history = await c.env.DB.prepare(`
    SELECT date(s.started_at) as date,
           s.subject_id,
           SUM(s.total_questions) as total,
           SUM(s.correct_count) as correct
    FROM study_sessions s
    WHERE s.user_id = ? AND s.finished_at IS NOT NULL
    GROUP BY date(s.started_at), s.subject_id
    ORDER BY date(s.started_at)
  `)
    .bind(userId)
    .all();

  // 模試スコア推移
  const examHistory = await c.env.DB.prepare(`
    SELECT ea.finished_at, ea.total_score, ea.score_breakdown, e.title
    FROM exam_attempts ea
    JOIN exams e ON ea.exam_id = e.id
    WHERE ea.user_id = ? AND ea.finished_at IS NOT NULL
    ORDER BY ea.finished_at
  `)
    .bind(userId)
    .all();

  return c.json({
    dailyHistory: history.results,
    examHistory: examHistory.results,
  });
});

export default analytics;
