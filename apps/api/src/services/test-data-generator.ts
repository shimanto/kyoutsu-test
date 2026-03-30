/**
 * 偏差値ベースのランダム学習データ生成
 *
 * 偏差値 → 科目別正答率 → 分野別バラつき → 回答レコード生成
 *
 * 偏差値と共通テスト得点率の目安:
 *   75 → 95%  (東大理三確実)
 *   70 → 88%  (東大理一安全圏)
 *   65 → 80%  (旧帝大上位)
 *   60 → 73%  (旧帝大)
 *   55 → 65%  (国公立中堅)
 *   50 → 58%  (平均)
 *   45 → 50%  (平均以下)
 *   40 → 42%  (基礎固め段階)
 */

/** 偏差値→ベース正答率 */
export function deviationToBaseRate(deviation: number): number {
  // シグモイド的な変換 (偏差値50=58%, 70=88%)
  const x = (deviation - 50) / 10;
  return 0.58 + 0.35 * (2 / (1 + Math.exp(-1.5 * x)) - 1);
}

/** 科目ごとの得意・苦手バラつきを生成 (理系プロファイル) */
export interface SubjectProfile {
  subjectId: string;
  baseRate: number;     // 正答率
  variance: number;     // 分野内バラつき
}

export function generateSubjectProfiles(
  deviation: number,
  bunrui: string = "rika1"
): SubjectProfile[] {
  const base = deviationToBaseRate(deviation);
  const rng = seedRandom(deviation * 137);

  // 理系プロファイル: 数学・理科やや高め、国語・社会やや低め
  const offsets: Record<string, number> = {
    kokugo:     -0.05 + rng() * 0.04,
    math1a:      0.05 + rng() * 0.04,
    math2bc:     0.03 + rng() * 0.04,
    eng_read:    0.00 + rng() * 0.04,
    eng_listen: -0.03 + rng() * 0.06,
    physics:     0.04 + rng() * 0.04,
    chemistry:  -0.02 + rng() * 0.06,
    social:     -0.08 + rng() * 0.04,
    info1:       0.00 + rng() * 0.04,
  };

  return Object.entries(offsets).map(([subjectId, offset]) => ({
    subjectId,
    baseRate: clamp(base + offset, 0.15, 0.98),
    variance: 0.08 + rng() * 0.12, // 分野内バラつき幅
  }));
}

/** 分野別正答率を生成 */
export interface FieldResult {
  fieldId: string;
  subjectId: string;
  total: number;
  correct: number;
}

export function generateFieldResults(
  profiles: SubjectProfile[],
  fieldsBySubject: Record<string, string[]>,
  deviation: number
): FieldResult[] {
  const rng = seedRandom(deviation * 251);
  const results: FieldResult[] = [];

  for (const profile of profiles) {
    const fields = fieldsBySubject[profile.subjectId] || [];
    for (let i = 0; i < fields.length; i++) {
      // 分野ごとに正答率をバラけさせる
      const fieldOffset = (rng() - 0.5) * profile.variance * 2;
      const fieldRate = clamp(profile.baseRate + fieldOffset, 0.1, 0.98);

      // 解答数: 偏差値高い人ほど多く解いている
      const baseCount = 10 + Math.floor(deviation / 5);
      const total = baseCount + Math.floor(rng() * 15);
      const correct = Math.round(total * fieldRate);

      results.push({
        fieldId: fields[i],
        subjectId: profile.subjectId,
        total,
        correct: Math.min(correct, total),
      });
    }
  }

  return results;
}

/** 回答レコード生成 */
export interface AnswerRecord {
  questionId: string;
  isCorrect: boolean;
  timeSpentMs: number;
}

export function generateAnswerRecords(
  fieldResults: FieldResult[],
  questionsByField: Record<string, string[]>,
  deviation: number
): AnswerRecord[] {
  const rng = seedRandom(deviation * 373);
  const records: AnswerRecord[] = [];

  for (const fr of fieldResults) {
    const questions = questionsByField[fr.fieldId] || [];
    if (questions.length === 0) continue;

    const rate = fr.total > 0 ? fr.correct / fr.total : 0.5;

    for (const qId of questions) {
      const isCorrect = rng() < rate;
      // 回答時間: 正解時は短め、不正解時は長め
      const baseTime = 30000 + Math.floor(rng() * 60000); // 30-90秒
      const timeSpentMs = isCorrect ? Math.floor(baseTime * 0.8) : Math.floor(baseTime * 1.3);

      records.push({ questionId: qId, isCorrect, timeSpentMs });
    }
  }

  return records;
}

// ─── ユーティリティ ───

function clamp(v: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, v));
}

/** 決定論的乱数 (偏差値ごとに同じデータを再現可能) */
function seedRandom(seed: number): () => number {
  let s = seed | 0;
  return () => {
    s = (s * 1664525 + 1013904223) | 0;
    return ((s >>> 0) / 4294967296);
  };
}
