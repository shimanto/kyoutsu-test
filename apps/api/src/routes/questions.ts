import { Hono } from "hono";
import type { Env } from "../types";

const questions = new Hono<Env>();

questions.get("/", async (c) => {
  const unitId = c.req.query("unitId");
  const fieldId = c.req.query("fieldId");
  const subjectId = c.req.query("subjectId");
  const difficulty = c.req.query("difficulty");
  const limit = Math.min(Number(c.req.query("limit") || 20), 100);
  const offset = Number(c.req.query("offset") || 0);

  let sql = `SELECT q.* FROM questions q`;
  const joins: string[] = [];
  const wheres: string[] = [];
  const params: unknown[] = [];

  if (subjectId) {
    joins.push("JOIN units u ON q.unit_id = u.id JOIN fields f ON u.field_id = f.id");
    wheres.push("f.subject_id = ?");
    params.push(subjectId);
  } else if (fieldId) {
    joins.push("JOIN units u ON q.unit_id = u.id");
    wheres.push("u.field_id = ?");
    params.push(fieldId);
  } else if (unitId) {
    wheres.push("q.unit_id = ?");
    params.push(unitId);
  }

  if (difficulty) {
    wheres.push("q.difficulty = ?");
    params.push(Number(difficulty));
  }

  if (joins.length) sql += " " + joins.join(" ");
  if (wheres.length) sql += " WHERE " + wheres.join(" AND ");
  sql += " ORDER BY q.created_at DESC LIMIT ? OFFSET ?";
  params.push(limit, offset);

  const result = await c.env.DB.prepare(sql).bind(...params).all();
  return c.json({ questions: result.results });
});

questions.get("/:id", async (c) => {
  const id = c.req.param("id");
  const question = await c.env.DB.prepare("SELECT * FROM questions WHERE id = ?")
    .bind(id)
    .first();

  if (!question) return c.json({ error: "Question not found" }, 404);

  const choices = await c.env.DB.prepare(
    "SELECT * FROM choices WHERE question_id = ? ORDER BY display_order"
  )
    .bind(id)
    .all();

  return c.json({ question, choices: choices.results });
});

export default questions;
