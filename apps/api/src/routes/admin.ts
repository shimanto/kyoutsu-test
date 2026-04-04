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

export default admin;
