import { Hono } from "hono";
import type { Env } from "../types";

const subjects = new Hono<Env>();

subjects.get("/", async (c) => {
  const result = await c.env.DB.prepare(
    "SELECT * FROM subjects ORDER BY display_order"
  ).all();
  return c.json({ subjects: result.results });
});

subjects.get("/:id", async (c) => {
  const id = c.req.param("id");
  const subject = await c.env.DB.prepare("SELECT * FROM subjects WHERE id = ?")
    .bind(id)
    .first();

  if (!subject) return c.json({ error: "Subject not found" }, 404);

  const fields = await c.env.DB.prepare(
    "SELECT * FROM fields WHERE subject_id = ? ORDER BY display_order"
  )
    .bind(id)
    .all();

  return c.json({ subject, fields: fields.results });
});

subjects.get("/:id/fields", async (c) => {
  const id = c.req.param("id");
  const fields = await c.env.DB.prepare(
    "SELECT * FROM fields WHERE subject_id = ? ORDER BY display_order"
  )
    .bind(id)
    .all();
  return c.json({ fields: fields.results });
});

subjects.get("/fields/:fieldId/units", async (c) => {
  const fieldId = c.req.param("fieldId");
  const units = await c.env.DB.prepare(
    "SELECT * FROM units WHERE field_id = ? ORDER BY display_order"
  )
    .bind(fieldId)
    .all();
  return c.json({ units: units.results });
});

export default subjects;
