import { Hono } from "hono";
import { z } from "zod";
import type { Env } from "../types";
import { generateId } from "../lib/ulid";

const admin = new Hono<Env>();

const questionSchema = z.object({
  unitId: z.string().min(1),
  body: z.string().min(1),
  questionType: z.enum(["choice", "numeric", "text"]).default("choice"),
  difficulty: z.number().int().min(1).max(5).default(3),
  points: z.number().int().min(1).default(4),
  explanation: z.string().optional(),
  source: z.string().optional(),
  year: z.number().int().optional(),
  choices: z.array(z.object({
    label: z.string(),
    body: z.string(),
    isCorrect: z.boolean(),
  })).optional(),
});

/** 問題一覧 (管理者用) */
admin.get("/questions", async (c) => {
  const limit = Math.min(Number(c.req.query("limit") || 50), 200);
  const offset = Number(c.req.query("offset") || 0);
  const unitId = c.req.query("unitId");

  let sql = "SELECT q.*, u.name as unit_name, f.name as field_name, f.subject_id FROM questions q JOIN units u ON q.unit_id = u.id JOIN fields f ON u.field_id = f.id";
  const params: unknown[] = [];
  if (unitId) { sql += " WHERE q.unit_id = ?"; params.push(unitId); }
  sql += " ORDER BY q.created_at DESC LIMIT ? OFFSET ?";
  params.push(limit, offset);

  const result = await c.env.DB.prepare(sql).bind(...params).all();

  const count = await c.env.DB.prepare(
    unitId ? "SELECT COUNT(*) as c FROM questions WHERE unit_id = ?" : "SELECT COUNT(*) as c FROM questions"
  ).bind(...(unitId ? [unitId] : [])).first<{ c: number }>();

  return c.json({ questions: result.results, total: count?.c || 0 });
});

/** 問題作成 */
admin.post("/questions", async (c) => {
  const body = questionSchema.parse(await c.req.json());
  const qId = generateId();

  await c.env.DB.prepare(
    `INSERT INTO questions (id, unit_id, body, question_type, difficulty, points, explanation, source, year)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
  ).bind(qId, body.unitId, body.body, body.questionType, body.difficulty, body.points,
    body.explanation || null, body.source || null, body.year || null).run();

  if (body.choices?.length) {
    const stmt = c.env.DB.prepare(
      "INSERT INTO choices (id, question_id, label, body, is_correct, display_order) VALUES (?, ?, ?, ?, ?, ?)"
    );
    await c.env.DB.batch(body.choices.map((ch, i) =>
      stmt.bind(generateId(), qId, ch.label, ch.body, ch.isCorrect ? 1 : 0, i + 1)
    ));
  }

  return c.json({ id: qId }, 201);
});

/** 問題削除 */
admin.delete("/questions/:id", async (c) => {
  const id = c.req.param("id");
  await c.env.DB.batch([
    c.env.DB.prepare("DELETE FROM choices WHERE question_id = ?").bind(id),
    c.env.DB.prepare("DELETE FROM questions WHERE id = ?").bind(id),
  ]);
  return c.json({ ok: true });
});

/** 全分野・単元ツリー取得 */
admin.get("/content-tree", async (c) => {
  const subjects = await c.env.DB.prepare("SELECT * FROM subjects ORDER BY display_order").all();
  const fields = await c.env.DB.prepare("SELECT * FROM fields ORDER BY display_order").all();
  const units = await c.env.DB.prepare("SELECT * FROM units ORDER BY display_order").all();
  const counts = await c.env.DB.prepare(
    "SELECT unit_id, COUNT(*) as count FROM questions GROUP BY unit_id"
  ).all();

  return c.json({
    subjects: subjects.results,
    fields: fields.results,
    units: units.results,
    questionCounts: counts.results,
  });
});

export default admin;
