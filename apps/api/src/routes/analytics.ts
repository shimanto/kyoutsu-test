import { Hono } from "hono";
import type { Env } from "../types";

const analytics = new Hono<Env>();

/** 配点マップ (分野→配点。seed-questions等で定義がないため固定値で持つ) */
const FIELD_POINTS: Record<string, number> = {
  kokugo_gendai: 110, kokugo_kobun: 50, kokugo_kanbun: 40,
  m1a_suushiki: 15, m1a_niji: 15, m1a_zukei: 20, m1a_data: 15, m1a_jougo: 20, m1a_seishitsu: 15,
  m2bc_shiki: 15, m2bc_kansuu: 20, m2bc_bibun: 20, m2bc_suuretsu: 15, m2bc_vector: 15, m2bc_toukei: 15,
  engr_q1: 10, engr_q2: 20, engr_q3: 15, engr_q4: 16, engr_q5: 15, engr_q6: 24,
  engl_q1: 25, engl_q2: 16, engl_q3: 18, engl_q4: 12, engl_q5: 15, engl_q6: 14,
  phys_rikigaku: 30, phys_netsuri: 15, phys_hadou: 20, phys_denki: 25, phys_genshi: 10,
  chem_riron: 35, chem_muki: 20, chem_yuuki: 30, chem_koubun: 15,
  soc_shizen: 20, soc_shigen: 25, soc_jinkou: 20, soc_chiiki: 20, soc_chizu: 15,
  info_joho: 15, info_comm: 20, info_comp: 30, info_network: 15, info_data: 20,
};

/** 全体概要 (科目別スコア推定 + ヒートマップ用データ) */
analytics.get("/overview", async (c) => {
  const userId = c.get("userId");

  // 科目別正答率
  const subjectStats = await c.env.DB.prepare(`
    SELECT f.subject_id,
           COUNT(*) as total,
           SUM(a.is_correct) as correct
    FROM answers a
    JOIN questions q ON a.question_id = q.id
    JOIN units u ON q.unit_id = u.id
    JOIN fields f ON u.field_id = f.id
    WHERE a.user_id = ?
    GROUP BY f.subject_id
  `).bind(userId).all();

  // 分野別正答率 (全分野を返す。回答がない分野も含む)
  const allFields = await c.env.DB.prepare(
    "SELECT id, name, subject_id FROM fields ORDER BY subject_id, display_order"
  ).all<{ id: string; name: string; subject_id: string }>();

  const answerStats = await c.env.DB.prepare(`
    SELECT f.id as field_id,
           COUNT(*) as total,
           SUM(a.is_correct) as correct
    FROM answers a
    JOIN questions q ON a.question_id = q.id
    JOIN units u ON q.unit_id = u.id
    JOIN fields f ON u.field_id = f.id
    WHERE a.user_id = ?
    GROUP BY f.id
  `).bind(userId).all<{ field_id: string; total: number; correct: number }>();

  const answerMap = new Map(answerStats.results.map((a) => [a.field_id, a]));

  const fieldStats = allFields.results.map((f) => {
    const a = answerMap.get(f.id);
    return {
      field_id: f.id,
      field_name: f.name,
      subject_id: f.subject_id,
      total: a?.total || 0,
      correct: a?.correct || 0,
      points: FIELD_POINTS[f.id] || 15,
    };
  });

  // 目標点
  const targets = await c.env.DB.prepare(
    "SELECT subject_id, target_score FROM user_subject_targets WHERE user_id = ?"
  ).bind(userId).all();

  return c.json({
    subjectStats: subjectStats.results,
    fieldStats,
    targets: targets.results,
  });
});

/** 科目別詳細分析 */
analytics.get("/subject/:subjectId", async (c) => {
  const userId = c.get("userId");
  const subjectId = c.req.param("subjectId");

  const fieldStats = await c.env.DB.prepare(`
    SELECT f.id as field_id, f.name as field_name,
           COUNT(*) as total, SUM(a.is_correct) as correct,
           AVG(a.time_spent_ms) as avg_time_ms
    FROM answers a JOIN questions q ON a.question_id = q.id
    JOIN units u ON q.unit_id = u.id JOIN fields f ON u.field_id = f.id
    WHERE a.user_id = ? AND f.subject_id = ?
    GROUP BY f.id ORDER BY f.display_order
  `).bind(userId, subjectId).all();

  const difficultyStats = await c.env.DB.prepare(`
    SELECT q.difficulty, COUNT(*) as total, SUM(a.is_correct) as correct
    FROM answers a JOIN questions q ON a.question_id = q.id
    JOIN units u ON q.unit_id = u.id JOIN fields f ON u.field_id = f.id
    WHERE a.user_id = ? AND f.subject_id = ?
    GROUP BY q.difficulty ORDER BY q.difficulty
  `).bind(userId, subjectId).all();

  return c.json({ fieldStats: fieldStats.results, difficultyStats: difficultyStats.results });
});

/** 時系列推移 */
analytics.get("/history", async (c) => {
  const userId = c.get("userId");

  const history = await c.env.DB.prepare(`
    SELECT date(s.started_at) as date, s.subject_id,
           SUM(s.total_questions) as total, SUM(s.correct_count) as correct
    FROM study_sessions s
    WHERE s.user_id = ? AND s.finished_at IS NOT NULL
    GROUP BY date(s.started_at), s.subject_id
    ORDER BY date(s.started_at)
  `).bind(userId).all();

  const examHistory = await c.env.DB.prepare(`
    SELECT ea.finished_at, ea.total_score, ea.score_breakdown, e.title
    FROM exam_attempts ea JOIN exams e ON ea.exam_id = e.id
    WHERE ea.user_id = ? AND ea.finished_at IS NOT NULL
    ORDER BY ea.finished_at
  `).bind(userId).all();

  return c.json({ dailyHistory: history.results, examHistory: examHistory.results });
});

export default analytics;
