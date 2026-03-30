import { Hono } from "hono";
import { z } from "zod";
import type { Env } from "../types";
import { generatePlan } from "../services/plan-generator";
import { generateId } from "../lib/ulid";

const plans = new Hono<Env>();

const generateSchema = z.object({
  weeklyStudyHours: z.number().min(1).max(80).default(20),
});

/** 学習計画自動生成 */
plans.post("/generate", async (c) => {
  const userId = c.get("userId");
  const body = generateSchema.parse(await c.req.json());

  // ユーザー情報取得
  const user = await c.env.DB.prepare("SELECT * FROM users WHERE id = ?")
    .bind(userId).first<{ exam_year: number; target_total_score: number }>();

  if (!user) return c.json({ error: "User not found" }, 404);

  // 科目別目標取得
  const targets = await c.env.DB.prepare(
    "SELECT subject_id, target_score FROM user_subject_targets WHERE user_id = ?"
  ).bind(userId).all<{ subject_id: string; target_score: number }>();

  const targetScores: Record<string, number> = {};
  for (const t of targets.results) targetScores[t.subject_id] = t.target_score;

  // 現在のスコア推定 (回答データから)
  const scores = await c.env.DB.prepare(`
    SELECT f.subject_id, COUNT(*) as total, SUM(a.is_correct) as correct, s.max_score
    FROM answers a JOIN questions q ON a.question_id = q.id
    JOIN units u ON q.unit_id = u.id JOIN fields f ON u.field_id = f.id
    JOIN subjects s ON f.subject_id = s.id
    WHERE a.user_id = ? GROUP BY f.subject_id
  `).bind(userId).all<{ subject_id: string; total: number; correct: number; max_score: number }>();

  const currentScores: Record<string, number> = {};
  for (const s of scores.results) {
    currentScores[s.subject_id] = Math.round((s.correct / s.total) * s.max_score);
  }

  const examDate = `${user.exam_year}-01-18`; // 共通テスト日 (1月第3土日)
  const plan = generatePlan({
    examDate,
    currentScores,
    targetScores,
    weeklyStudyHours: body.weeklyStudyHours,
  });

  // DB保存
  const planId = generateId();
  await c.env.DB.prepare(
    "UPDATE study_plans SET is_active = 0 WHERE user_id = ? AND is_active = 1"
  ).bind(userId).run();

  await c.env.DB.prepare(
    "INSERT INTO study_plans (id, user_id, exam_date, is_active) VALUES (?, ?, ?, 1)"
  ).bind(planId, userId, examDate).run();

  // タスク保存 (最初の30日分)
  const taskStmt = c.env.DB.prepare(
    `INSERT INTO plan_daily_tasks (id, plan_id, scheduled_date, subject_id, task_type, target_question_count)
     VALUES (?, ?, ?, ?, ?, ?)`
  );
  const batch = plan.tasks.slice(0, 90).map((t) =>
    taskStmt.bind(generateId(), planId, t.date, t.subjectId, t.taskType, t.targetQuestionCount)
  );
  if (batch.length > 0) await c.env.DB.batch(batch);

  return c.json({
    planId,
    phase: plan.phase,
    totalDays: plan.totalDays,
    subjectAllocations: plan.subjectAllocations,
    taskCount: plan.tasks.length,
  });
});

/** 現在の計画取得 */
plans.get("/current", async (c) => {
  const userId = c.get("userId");
  const plan = await c.env.DB.prepare(
    "SELECT * FROM study_plans WHERE user_id = ? AND is_active = 1"
  ).bind(userId).first();

  if (!plan) return c.json({ plan: null, tasks: [] });

  const tasks = await c.env.DB.prepare(
    "SELECT * FROM plan_daily_tasks WHERE plan_id = ? ORDER BY scheduled_date, subject_id"
  ).bind(plan.id).all();

  return c.json({ plan, tasks: tasks.results });
});

/** 今日のタスク */
plans.get("/current/today", async (c) => {
  const userId = c.get("userId");
  const today = new Date().toISOString().slice(0, 10);

  const plan = await c.env.DB.prepare(
    "SELECT id FROM study_plans WHERE user_id = ? AND is_active = 1"
  ).bind(userId).first<{ id: string }>();

  if (!plan) return c.json({ tasks: [] });

  const tasks = await c.env.DB.prepare(
    "SELECT * FROM plan_daily_tasks WHERE plan_id = ? AND scheduled_date = ?"
  ).bind(plan.id, today).all();

  return c.json({ tasks: tasks.results });
});

export default plans;
