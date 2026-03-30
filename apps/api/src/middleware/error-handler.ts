import type { ErrorHandler } from "hono";
import type { Env } from "../types";

export const errorHandler: ErrorHandler<Env> = (err, c) => {
  console.error(`[Error] ${err.message}`, err.stack);
  return c.json({ error: err.message || "Internal Server Error" }, 500);
};
