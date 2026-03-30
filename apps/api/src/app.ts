import { Hono } from "hono";
import type { Env } from "./types";
import { corsMiddleware } from "./middleware/cors";
import { errorHandler } from "./middleware/error-handler";
import { authMiddleware } from "./middleware/auth";
import auth from "./routes/auth";
import users from "./routes/users";
import subjects from "./routes/subjects";
import questions from "./routes/questions";
import studySessions from "./routes/study-sessions";
import reviews from "./routes/reviews";
import analytics from "./routes/analytics";

const app = new Hono<Env>();

// Global middleware
app.use("*", corsMiddleware);
app.onError(errorHandler);

// Health check
app.get("/", (c) => c.json({ status: "ok", service: "kyoutsu-api" }));

// Public routes
app.route("/auth", auth);

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

export type AppType = typeof app;
export default app;
