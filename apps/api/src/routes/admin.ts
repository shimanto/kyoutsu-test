import { Hono } from "hono";
import { z } from "zod";
import type { Env } from "../types";
import { generateId } from "../lib/ulid";
import { calculateAllPredictions } from "../services/prediction-engine";

const admin = new Hono<Env>();

// ─── カリキュラムツリー ───

/** 全構造取得 (科目→分野→単元→章、問題数・出題予想付き) */
admin.get("/content-tree", async (c) => {
  const [subjects, fields, units, chapters, qCounts, predictions, tags, unitTagsRes] = await Promise.all([
    c.env.DB.prepare("SELECT * FROM subjects ORDER BY display_order").all(),
    c.env.DB.prepare("SELECT * FROM fields ORDER BY subject_id, display_order").all(),
    c.env.DB.prepare("SELECT * FROM units ORDER BY field_id, display_order").all(),
    c.env.DB.prepare("SELECT * FROM chapters ORDER BY unit_id, display_order").all(),
    c.env.DB.prepare("SELECT unit_id, COUNT(*) as count FROM questions GROUP BY unit_id").all(),
    c.env.DB.prepare("SELECT * FROM prediction_scores WHERE target_year = 2027 ORDER BY score DESC").all(),
    c.env.DB.prepare("SELECT * FROM trend_tags ORDER BY name").all(),
    c.env.DB.prepare("SELECT ut.unit_id, ut.tag_id, t.label, t.color FROM unit_tags ut JOIN trend_tags t ON ut.tag_id = t.id").all(),
  ]);

  return c.json({
    subjects: subjects.results,
    fields: fields.results,
    units: units.results,
    chapters: chapters.results,
    questionCounts: qCounts.results,
    predictions: predictions.results,
    tags: tags.results,
    unitTags: unitTagsRes.results,
  });
});

// ─── 単元 CRUD ───

admin.post("/units", async (c) => {
  const body = z.object({
    fieldId: z.string(), name: z.string(), displayOrder: z.number().default(0),
  }).parse(await c.req.json());
  const id = generateId();
  await c.env.DB.prepare("INSERT INTO units (id, field_id, name, display_order) VALUES (?, ?, ?, ?)")
    .bind(id, body.fieldId, body.name, body.displayOrder).run();
  return c.json({ id }, 201);
});

admin.put("/units/:id", async (c) => {
  const id = c.req.param("id");
  const body = z.object({ name: z.string().optional(), displayOrder: z.number().optional() }).parse(await c.req.json());
  const sets: string[] = []; const vals: unknown[] = [];
  if (body.name !== undefined) { sets.push("name = ?"); vals.push(body.name); }
  if (body.displayOrder !== undefined) { sets.push("display_order = ?"); vals.push(body.displayOrder); }
  if (sets.length === 0) return c.json({ ok: true });
  vals.push(id);
  await c.env.DB.prepare(`UPDATE units SET ${sets.join(", ")} WHERE id = ?`).bind(...vals).run();
  return c.json({ ok: true });
});

admin.delete("/units/:id", async (c) => {
  const id = c.req.param("id");

  // 先にこの単元に属する問題IDを取得
  const qResult = await c.env.DB.prepare(
    "SELECT id FROM questions WHERE unit_id = ?"
  ).bind(id).all<{ id: string }>();
  const qIds = qResult.results.map((q) => q.id);

  // 問題に紐づくデータを削除
  if (qIds.length > 0) {
    for (let i = 0; i < qIds.length; i += 50) {
      const chunk = qIds.slice(i, i + 50);
      const placeholders = chunk.map(() => "?").join(",");
      await c.env.DB.batch([
        c.env.DB.prepare(`DELETE FROM answers WHERE question_id IN (${placeholders})`).bind(...chunk),
        c.env.DB.prepare(`DELETE FROM review_schedules WHERE question_id IN (${placeholders})`).bind(...chunk),
        c.env.DB.prepare(`DELETE FROM choices WHERE question_id IN (${placeholders})`).bind(...chunk),
        c.env.DB.prepare(`DELETE FROM question_tags WHERE question_id IN (${placeholders})`).bind(...chunk),
        c.env.DB.prepare(`DELETE FROM questions WHERE id IN (${placeholders})`).bind(...chunk),
      ]);
    }
  }

  // 単元自体と関連データを削除
  await c.env.DB.batch([
    c.env.DB.prepare("DELETE FROM chapters WHERE unit_id = ?").bind(id),
    c.env.DB.prepare("DELETE FROM unit_tags WHERE unit_id = ?").bind(id),
    c.env.DB.prepare("DELETE FROM prediction_scores WHERE unit_id = ?").bind(id),
    c.env.DB.prepare("DELETE FROM units WHERE id = ?").bind(id),
  ]);
  return c.json({ ok: true });
});

// ─── 章 CRUD ───

admin.post("/chapters", async (c) => {
  const body = z.object({
    unitId: z.string(), name: z.string(), description: z.string().optional(),
    textbookRef: z.string().optional(), displayOrder: z.number().default(0),
  }).parse(await c.req.json());
  const id = generateId();
  await c.env.DB.prepare(
    "INSERT INTO chapters (id, unit_id, name, description, textbook_ref, display_order) VALUES (?, ?, ?, ?, ?, ?)"
  ).bind(id, body.unitId, body.name, body.description || null, body.textbookRef || null, body.displayOrder).run();
  return c.json({ id }, 201);
});

admin.delete("/chapters/:id", async (c) => {
  await c.env.DB.prepare("DELETE FROM chapters WHERE id = ?").bind(c.req.param("id")).run();
  return c.json({ ok: true });
});

// ─── 問題 CRUD ───

const questionSchema = z.object({
  unitId: z.string(), body: z.string(), questionType: z.enum(["choice", "numeric", "text"]).default("choice"),
  difficulty: z.number().int().min(1).max(5).default(3), points: z.number().int().min(1).default(4),
  explanation: z.string().optional(), source: z.string().optional(), year: z.number().int().optional(),
  choices: z.array(z.object({ label: z.string(), body: z.string(), isCorrect: z.boolean() })).optional(),
  tagIds: z.array(z.string()).optional(),
});

admin.get("/questions", async (c) => {
  const limit = Math.min(Number(c.req.query("limit") || 50), 200);
  const offset = Number(c.req.query("offset") || 0);
  const unitId = c.req.query("unitId");
  const fieldId = c.req.query("fieldId");

  let sql = `SELECT q.*, u.name as unit_name, f.name as field_name, f.subject_id
             FROM questions q JOIN units u ON q.unit_id = u.id JOIN fields f ON u.field_id = f.id`;
  const params: unknown[] = [];
  const wheres: string[] = [];
  if (unitId) { wheres.push("q.unit_id = ?"); params.push(unitId); }
  if (fieldId) { wheres.push("u.field_id = ?"); params.push(fieldId); }
  if (wheres.length) sql += " WHERE " + wheres.join(" AND ");
  sql += " ORDER BY q.created_at DESC LIMIT ? OFFSET ?";
  params.push(limit, offset);

  const result = await c.env.DB.prepare(sql).bind(...params).all();

  // 各問題のタグも取得
  const qIds = result.results.map((q) => (q as { id: string }).id);
  let questionTags: { question_id: string; tag_id: string; label: string; color: string }[] = [];
  if (qIds.length > 0) {
    const tagResult = await c.env.DB.prepare(
      `SELECT qt.question_id, t.id as tag_id, t.label, t.color
       FROM question_tags qt JOIN trend_tags t ON qt.tag_id = t.id
       WHERE qt.question_id IN (${qIds.map(() => "?").join(",")})`)
      .bind(...qIds).all<{ question_id: string; tag_id: string; label: string; color: string }>();
    questionTags = tagResult.results;
  }

  return c.json({ questions: result.results, questionTags });
});

admin.post("/questions", async (c) => {
  const body = questionSchema.parse(await c.req.json());
  const qId = generateId();

  await c.env.DB.prepare(
    `INSERT INTO questions (id, unit_id, body, question_type, difficulty, points, explanation, source, year)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
  ).bind(qId, body.unitId, body.body, body.questionType, body.difficulty, body.points,
    body.explanation || null, body.source || null, body.year || null).run();

  const batch: ReturnType<ReturnType<typeof c.env.DB.prepare>["bind"]>[] = [];
  if (body.choices?.length) {
    const stmt = c.env.DB.prepare(
      "INSERT INTO choices (id, question_id, label, body, is_correct, display_order) VALUES (?, ?, ?, ?, ?, ?)"
    );
    body.choices.forEach((ch, i) => batch.push(stmt.bind(generateId(), qId, ch.label, ch.body, ch.isCorrect ? 1 : 0, i + 1)));
  }
  if (body.tagIds?.length) {
    const tagStmt = c.env.DB.prepare("INSERT OR IGNORE INTO question_tags (question_id, tag_id) VALUES (?, ?)");
    body.tagIds.forEach((tId) => batch.push(tagStmt.bind(qId, tId)));
  }
  if (batch.length > 0) await c.env.DB.batch(batch);

  return c.json({ id: qId }, 201);
});

admin.delete("/questions/:id", async (c) => {
  const id = c.req.param("id");
  await c.env.DB.batch([
    c.env.DB.prepare("DELETE FROM choices WHERE question_id = ?").bind(id),
    c.env.DB.prepare("DELETE FROM question_tags WHERE question_id = ?").bind(id),
    c.env.DB.prepare("DELETE FROM answers WHERE question_id = ?").bind(id),
    c.env.DB.prepare("DELETE FROM questions WHERE id = ?").bind(id),
  ]);
  return c.json({ ok: true });
});

// ─── 出題履歴 ───

admin.get("/exam-history", async (c) => {
  const unitId = c.req.query("unitId");
  const limit = Math.min(Number(c.req.query("limit") || 100), 500);
  const offset = Number(c.req.query("offset") || 0);
  let sql = "SELECT eh.*, u.name as unit_name FROM exam_history eh JOIN units u ON eh.unit_id = u.id";
  const params: unknown[] = [];
  if (unitId) { sql += " WHERE eh.unit_id = ?"; params.push(unitId); }
  sql += " ORDER BY eh.year DESC LIMIT ? OFFSET ?";
  params.push(limit, offset);
  const result = await c.env.DB.prepare(sql).bind(...params).all();
  return c.json({ history: result.results });
});

admin.post("/exam-history", async (c) => {
  const body = z.object({
    unitId: z.string(), year: z.number().int(), examType: z.enum(["honshiken", "tsuishiken"]),
    questionNumber: z.string().optional(), points: z.number().int().optional(),
    difficulty: z.number().int().min(1).max(5).optional(), notes: z.string().optional(),
  }).parse(await c.req.json());
  const id = generateId();
  await c.env.DB.prepare(
    `INSERT INTO exam_history (id, unit_id, year, exam_type, question_number, points, difficulty, notes)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
  ).bind(id, body.unitId, body.year, body.examType, body.questionNumber || null,
    body.points || null, body.difficulty || null, body.notes || null).run();
  return c.json({ id }, 201);
});

// ─── タグ管理 ───

admin.get("/tags", async (c) => {
  const result = await c.env.DB.prepare("SELECT * FROM trend_tags ORDER BY name").all();
  return c.json({ tags: result.results });
});

admin.post("/unit-tags", async (c) => {
  const body = z.object({ unitId: z.string(), tagId: z.string() }).parse(await c.req.json());
  await c.env.DB.prepare("INSERT OR IGNORE INTO unit_tags (unit_id, tag_id) VALUES (?, ?)")
    .bind(body.unitId, body.tagId).run();
  return c.json({ ok: true });
});

admin.delete("/unit-tags/:unitId/:tagId", async (c) => {
  await c.env.DB.prepare("DELETE FROM unit_tags WHERE unit_id = ? AND tag_id = ?")
    .bind(c.req.param("unitId"), c.req.param("tagId")).run();
  return c.json({ ok: true });
});

// ─── 出題予想スコア ───

admin.get("/predictions", async (c) => {
  const year = Number(c.req.query("year") || 2027);
  const result = await c.env.DB.prepare(`
    SELECT ps.*, u.name as unit_name, f.name as field_name, f.subject_id
    FROM prediction_scores ps
    JOIN units u ON ps.unit_id = u.id
    JOIN fields f ON u.field_id = f.id
    WHERE ps.target_year = ?
    ORDER BY ps.score DESC
  `).bind(year).all();
  return c.json({ predictions: result.results });
});

admin.put("/predictions", async (c) => {
  const body = z.object({
    unitId: z.string(), targetYear: z.number().int(), score: z.number().min(0).max(100),
    reasoning: z.string().optional(),
  }).parse(await c.req.json());
  const id = generateId();
  await c.env.DB.prepare(`
    INSERT INTO prediction_scores (id, unit_id, target_year, score, reasoning, updated_at)
    VALUES (?, ?, ?, ?, ?, datetime('now'))
    ON CONFLICT(unit_id, target_year) DO UPDATE SET score = excluded.score, reasoning = excluded.reasoning, updated_at = datetime('now')
  `).bind(id, body.unitId, body.targetYear, body.score, body.reasoning || null).run();
  return c.json({ ok: true });
});

// ─── 出題予想一括算出 ───

admin.post("/predictions/calculate", async (c) => {
  const body = z.object({ targetYear: z.number().int().default(2027) }).parse(await c.req.json());

  const [unitsRes, historyRes, unitTagsRes] = await Promise.all([
    c.env.DB.prepare("SELECT id FROM units").all<{ id: string }>(),
    c.env.DB.prepare("SELECT unit_id, year, points, difficulty FROM exam_history").all(),
    c.env.DB.prepare("SELECT ut.unit_id, t.name as tag_name FROM unit_tags ut JOIN trend_tags t ON ut.tag_id = t.id").all(),
  ]);

  const unitIds = unitsRes.results.map((u) => u.id);
  const predictions = calculateAllPredictions(
    unitIds,
    historyRes.results as { unit_id: string; year: number; points: number | null; difficulty: number | null }[],
    unitTagsRes.results as { unit_id: string; tag_name: string }[],
    body.targetYear
  );

  // DB に保存
  const stmt = c.env.DB.prepare(`
    INSERT INTO prediction_scores (id, unit_id, target_year, score, reasoning, updated_at)
    VALUES (?, ?, ?, ?, ?, datetime('now'))
    ON CONFLICT(unit_id, target_year) DO UPDATE SET score = excluded.score, reasoning = excluded.reasoning, updated_at = datetime('now')
  `);

  for (let i = 0; i < predictions.length; i += 50) {
    const chunk = predictions.slice(i, i + 50);
    await c.env.DB.batch(chunk.map((p) =>
      stmt.bind(generateId(), p.unitId, body.targetYear, p.score, p.reasoning)
    ));
  }

  return c.json({
    calculated: predictions.length,
    topPredictions: predictions.slice(0, 10),
  });
});

// ─── ユーザー管理 ───

admin.get("/users", async (c) => {
  const limit = Math.min(Number(c.req.query("limit") || 50), 200);
  const offset = Number(c.req.query("offset") || 0);
  const result = await c.env.DB.prepare(`
    SELECT id, line_user_id, display_name, picture_url, target_bunrui,
           target_total_score, exam_year, role, created_at, updated_at
    FROM users ORDER BY created_at DESC LIMIT ? OFFSET ?
  `).bind(limit, offset).all();
  const countRes = await c.env.DB.prepare("SELECT COUNT(*) as total FROM users").first<{ total: number }>();
  return c.json({ users: result.results, total: countRes?.total || 0 });
});

admin.get("/users/:id/stats", async (c) => {
  const userId = c.req.param("id");
  const [sessions, answers, reviews] = await Promise.all([
    c.env.DB.prepare("SELECT COUNT(*) as count FROM study_sessions WHERE user_id = ?").bind(userId).first(),
    c.env.DB.prepare("SELECT COUNT(*) as total, SUM(CASE WHEN is_correct=1 THEN 1 ELSE 0 END) as correct FROM answers WHERE user_id = ?").bind(userId).first(),
    c.env.DB.prepare("SELECT COUNT(*) as count FROM review_schedules WHERE user_id = ?").bind(userId).first(),
  ]);
  return c.json({ sessions, answers, reviews });
});

// ─── ログイン履歴 (usersテーブルのcreated_at/updated_atで代用) ───

admin.get("/login-history", async (c) => {
  const limit = Math.min(Number(c.req.query("limit") || 100), 500);
  const result = await c.env.DB.prepare(`
    SELECT id, display_name, line_user_id,
           CASE WHEN line_user_id LIKE 'demo-%' THEN 'demo' ELSE 'line' END as login_method,
           created_at as first_login, updated_at as last_active
    FROM users ORDER BY updated_at DESC LIMIT ?
  `).bind(limit).all();
  return c.json({ history: result.results });
});

// ─── LINE Messaging API ───

admin.post("/line-notify", async (c) => {
  const body = z.object({
    targetUserIds: z.array(z.string()).optional(),
    broadcast: z.boolean().default(false),
    message: z.string().min(1).max(2000),
  }).parse(await c.req.json());

  const token = c.env.LINE_MESSAGING_CHANNEL_ACCESS_TOKEN;
  if (!token) {
    return c.json({ error: "LINE Messaging API token not configured" }, 400);
  }

  const headers = {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${token}`,
  };

  if (body.broadcast) {
    // 全ユーザーに送信
    const res = await fetch("https://api.line.me/v2/bot/message/broadcast", {
      method: "POST", headers,
      body: JSON.stringify({ messages: [{ type: "text", text: body.message }] }),
    });
    return c.json({ ok: res.ok, status: res.status });
  }

  if (body.targetUserIds?.length) {
    // LINEユーザーIDを取得
    const placeholders = body.targetUserIds.map(() => "?").join(",");
    const users = await c.env.DB.prepare(
      `SELECT line_user_id FROM users WHERE id IN (${placeholders}) AND line_user_id NOT LIKE 'demo-%'`
    ).bind(...body.targetUserIds).all<{ line_user_id: string }>();

    const lineUserIds = users.results.map((u) => u.line_user_id);
    if (lineUserIds.length === 0) {
      return c.json({ error: "No LINE users found in selection" }, 400);
    }

    // multicast (最大500人)
    const res = await fetch("https://api.line.me/v2/bot/message/multicast", {
      method: "POST", headers,
      body: JSON.stringify({
        to: lineUserIds.slice(0, 500),
        messages: [{ type: "text", text: body.message }],
      }),
    });
    return c.json({ ok: res.ok, status: res.status, sentTo: lineUserIds.length });
  }

  return c.json({ error: "targetUserIds or broadcast required" }, 400);
});

// ─── ダッシュボード統計 ───

admin.get("/dashboard", async (c) => {
  const [userCount, sessionCount, answerStats, recentUsers] = await Promise.all([
    c.env.DB.prepare("SELECT COUNT(*) as count FROM users").first<{ count: number }>(),
    c.env.DB.prepare("SELECT COUNT(*) as count FROM study_sessions").first<{ count: number }>(),
    c.env.DB.prepare("SELECT COUNT(*) as total, SUM(CASE WHEN is_correct=1 THEN 1 ELSE 0 END) as correct FROM answers").first<{ total: number; correct: number }>(),
    c.env.DB.prepare("SELECT id, display_name, created_at FROM users ORDER BY created_at DESC LIMIT 5").all(),
  ]);
  return c.json({
    totalUsers: userCount?.count || 0,
    totalSessions: sessionCount?.count || 0,
    totalAnswers: answerStats?.total || 0,
    correctAnswers: answerStats?.correct || 0,
    recentUsers: recentUsers.results,
  });
});

export default admin;
