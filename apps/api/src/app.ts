import { Hono } from "hono";
import type { Env } from "./types";
import { corsMiddleware } from "./middleware/cors";
import { errorHandler } from "./middleware/error-handler";
import { rateLimitMiddleware } from "./middleware/rate-limit";
import { authMiddleware } from "./middleware/auth";
import auth from "./routes/auth";
import users from "./routes/users";
import subjects from "./routes/subjects";
import questions from "./routes/questions";
import studySessions from "./routes/study-sessions";
import reviews from "./routes/reviews";
import analytics from "./routes/analytics";
import admin from "./routes/admin";
import plans from "./routes/plans";
import setup from "./routes/setup";
import aiQuestions from "./routes/ai-questions";
import feedback from "./routes/feedback";
import growth from "./routes/growth";
import webhook from "./routes/webhook";
import { adminMiddleware } from "./middleware/auth";

const app = new Hono<Env>();

// Global middleware
app.use("*", corsMiddleware);
app.use("*", rateLimitMiddleware);
app.onError(errorHandler);

// Health check
app.get("/", (c) => c.json({ status: "ok", service: "kyoutsu-api" }));

// Public routes
app.route("/auth", auth);
app.route("/webhook", webhook);

// Protected routes
app.use("/users/*", authMiddleware);
app.use("/subjects/*", authMiddleware);
app.use("/questions/*", authMiddleware);
app.use("/study-sessions/*", authMiddleware);
app.use("/reviews/*", authMiddleware);
app.use("/analytics/*", authMiddleware);

app.route("/users", users);
app.route("/subjects", subjects);
app.route("/questions", questions);
app.route("/study-sessions", studySessions);
app.route("/reviews", reviews);
app.route("/analytics", analytics);

app.use("/plans/*", authMiddleware);
app.route("/plans", plans);

app.use("/setup/*", authMiddleware);
app.route("/setup", setup);

app.use("/ai-questions/*", authMiddleware);
app.route("/ai-questions", aiQuestions);

app.use("/feedback/*", authMiddleware);
app.route("/feedback", feedback);

// Admin routes (認証 + 管理者権限)
app.use("/admin/*", authMiddleware);
app.use("/admin/*", adminMiddleware);
app.route("/admin", admin);
app.route("/admin/growth", growth);

export type AppType = typeof app;
export default app;
