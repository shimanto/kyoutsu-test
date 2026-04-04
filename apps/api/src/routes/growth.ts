import { Hono } from "hono";
import type { Env } from "../types";

const growth = new Hono<Env>();

/** 成長KPIダッシュボード (管理者用) */
growth.get("/kpis", async (c) => {
  const now = new Date();
  const today = now.toISOString().split("T")[0];
  const d7ago = new Date(now.getTime() - 7 * 86400000).toISOString().split("T")[0];
  const d30ago = new Date(now.getTime() - 30 * 86400000).toISOString().split("T")[0];

  const [
    totalUsers,
    newUsersWeek,
    newUsersMonth,
    wau,
    mau,
    totalSessions,
    totalAnswers,
    feedbackStats,
  ] = await Promise.all([
    // 総ユーザー数
    c.env.DB.prepare("SELECT COUNT(*) as count FROM users").first<{ count: number }>(),

    // 週間新規登録
    c.env.DB.prepare(
      "SELECT COUNT(*) as count FROM users WHERE created_at >= ?"
    ).bind(d7ago).first<{ count: number }>(),

    // 月間新規登録
    c.env.DB.prepare(
      "SELECT COUNT(*) as count FROM users WHERE created_at >= ?"
    ).bind(d30ago).first<{ count: number }>(),

    // WAU (週間アクティブ学習者)
    c.env.DB.prepare(`
      SELECT COUNT(DISTINCT user_id) as count
      FROM study_sessions
      WHERE started_at >= ? AND finished_at IS NOT NULL
    `).bind(d7ago).first<{ count: number }>(),

    // MAU (月間アクティブ学習者)
    c.env.DB.prepare(`
      SELECT COUNT(DISTINCT user_id) as count
      FROM study_sessions
      WHERE started_at >= ? AND finished_at IS NOT NULL
    `).bind(d30ago).first<{ count: number }>(),

    // 総学習セッション数
    c.env.DB.prepare(
      "SELECT COUNT(*) as count FROM study_sessions WHERE finished_at IS NOT NULL"
    ).first<{ count: number }>(),

    // 総回答数
    c.env.DB.prepare("SELECT COUNT(*) as count FROM answers").first<{ count: number }>(),

    // フィードバック集計
    c.env.DB.prepare(`
      SELECT COUNT(*) as total,
             AVG(rating) as avg_rating,
             SUM(CASE WHEN rating >= 4 THEN 1 ELSE 0 END) as promoters,
             SUM(CASE WHEN rating <= 2 THEN 1 ELSE 0 END) as detractors
      FROM feedback
    `).first<{ total: number; avg_rating: number; promoters: number; detractors: number }>(),
  ]);

  // NPS 計算 (promoters% - detractors%)
  const fbTotal = feedbackStats?.total || 0;
  const nps = fbTotal > 0
    ? Math.round(((feedbackStats!.promoters || 0) / fbTotal - (feedbackStats!.detractors || 0) / fbTotal) * 100)
    : null;

  return c.json({
    snapshot: today,
    acquisition: {
      totalUsers: totalUsers?.count || 0,
      newUsersWeek: newUsersWeek?.count || 0,
      newUsersMonth: newUsersMonth?.count || 0,
    },
    engagement: {
      wau: wau?.count || 0,
      mau: mau?.count || 0,
      totalSessions: totalSessions?.count || 0,
      totalAnswers: totalAnswers?.count || 0,
    },
    satisfaction: {
      feedbackCount: fbTotal,
      avgRating: feedbackStats?.avg_rating ? Number(feedbackStats.avg_rating.toFixed(2)) : null,
      nps,
    },
  });
});

/** 日別ユーザー登録推移 */
growth.get("/registrations", async (c) => {
  const days = Math.min(Number(c.req.query("days") || 30), 90);
  const since = new Date(Date.now() - days * 86400000).toISOString().split("T")[0];

  const result = await c.env.DB.prepare(`
    SELECT date(created_at) as date, COUNT(*) as count
    FROM users
    WHERE created_at >= ?
    GROUP BY date(created_at)
    ORDER BY date(created_at)
  `).bind(since).all();

  return c.json({ registrations: result.results });
});

/** D7 / D30 リテンション */
growth.get("/retention", async (c) => {
  // 7日前に登録したユーザーのうち、その後も学習しているか
  const d7cohort = await c.env.DB.prepare(`
    SELECT
      COUNT(DISTINCT u.id) as cohort_size,
      COUNT(DISTINCT s.user_id) as retained
    FROM users u
    LEFT JOIN study_sessions s ON u.id = s.user_id
      AND s.started_at >= datetime(u.created_at, '+7 days')
      AND s.finished_at IS NOT NULL
    WHERE u.created_at <= datetime('now', '-7 days')
      AND u.created_at >= datetime('now', '-37 days')
  `).first<{ cohort_size: number; retained: number }>();

  const d30cohort = await c.env.DB.prepare(`
    SELECT
      COUNT(DISTINCT u.id) as cohort_size,
      COUNT(DISTINCT s.user_id) as retained
    FROM users u
    LEFT JOIN study_sessions s ON u.id = s.user_id
      AND s.started_at >= datetime(u.created_at, '+30 days')
      AND s.finished_at IS NOT NULL
    WHERE u.created_at <= datetime('now', '-30 days')
      AND u.created_at >= datetime('now', '-60 days')
  `).first<{ cohort_size: number; retained: number }>();

  return c.json({
    d7: {
      cohortSize: d7cohort?.cohort_size || 0,
      retained: d7cohort?.retained || 0,
      rate: d7cohort && d7cohort.cohort_size > 0
        ? Number((d7cohort.retained / d7cohort.cohort_size).toFixed(3))
        : null,
    },
    d30: {
      cohortSize: d30cohort?.cohort_size || 0,
      retained: d30cohort?.retained || 0,
      rate: d30cohort && d30cohort.cohort_size > 0
        ? Number((d30cohort.retained / d30cohort.cohort_size).toFixed(3))
        : null,
    },
  });
});

/** 科目別学習量ランキング */
growth.get("/subject-engagement", async (c) => {
  const result = await c.env.DB.prepare(`
    SELECT s.subject_id,
           COUNT(DISTINCT s.user_id) as unique_learners,
           COUNT(*) as session_count,
           SUM(s.total_questions) as total_questions,
           AVG(s.correct_count * 100.0 / NULLIF(s.total_questions, 0)) as avg_accuracy
    FROM study_sessions s
    WHERE s.finished_at IS NOT NULL
    GROUP BY s.subject_id
    ORDER BY session_count DESC
  `).all();

  return c.json({ subjectEngagement: result.results });
});

export default growth;
