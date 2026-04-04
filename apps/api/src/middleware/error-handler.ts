import { HTTPException } from "hono/http-exception";
import type { ErrorHandler } from "hono";
import type { Env } from "../types";

export const errorHandler: ErrorHandler<Env> = (err, c) => {
  console.error(`[Error] ${err.message}`, err.stack);

  // HTTPException はステータスコード付きの意図的エラー → メッセージをそのまま返す
  if (err instanceof HTTPException) {
    return c.json({ error: err.message }, err.status);
  }

  // Zod バリデーションエラー
  if (err.name === "ZodError") {
    return c.json({ error: "Validation error", details: JSON.parse(err.message) }, 400);
  }

  // それ以外は内部エラー → 詳細を隠す
  return c.json({ error: "Internal Server Error" }, 500);
};
