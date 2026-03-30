import { createMiddleware } from "hono/factory";
import { jwtVerify } from "jose";
import type { Env } from "../types";

export const authMiddleware = createMiddleware<Env>(async (c, next) => {
  const header = c.req.header("Authorization");
  if (!header?.startsWith("Bearer ")) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  const token = header.slice(7);
  try {
    const secret = new TextEncoder().encode(c.env.JWT_SECRET);
    const { payload } = await jwtVerify(token, secret);
    c.set("userId", payload.sub as string);
    c.set("userRole", (payload.role as string) || "student");
  } catch {
    return c.json({ error: "Invalid token" }, 401);
  }

  await next();
});

export const adminMiddleware = createMiddleware<Env>(async (c, next) => {
  if (c.get("userRole") !== "admin") {
    return c.json({ error: "Forbidden" }, 403);
  }
  await next();
});
