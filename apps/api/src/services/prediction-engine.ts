/**
 * 出題予想エンジン
 *
 * 過去の出題パターンから各単元の出題可能性スコアを算出する。
 *
 * スコア算出要素:
 * 1. 出題頻度 (過去10年で何回出たか)
 * 2. 直近出題間隔 (しばらく出てないと出やすい)
 * 3. 新課程対応 (2025年度新課程の重点分野)
 * 4. 配点傾向 (高配点分野は必ず出る)
 * 5. 手動タグ (管理者の予想タグ)
 */

export interface ExamHistoryEntry {
  unit_id: string;
  year: number;
  points: number | null;
  difficulty: number | null;
}

export interface PredictionInput {
  unitId: string;
  examHistory: ExamHistoryEntry[];
  hasPredictionTag: boolean;
  hasNewCurriculumTag: boolean;
  hasHighFrequencyTag: boolean;
  targetYear: number;
}

export interface PredictionResult {
  unitId: string;
  score: number;          // 0-100
  reasoning: string;
  factors: {
    frequency: number;    // 出題頻度スコア 0-30
    interval: number;     // 出題間隔スコア 0-25
    curriculum: number;   // 新課程スコア 0-20
    manual: number;       // 管理者タグスコア 0-25
  };
}

export function calculatePrediction(input: PredictionInput): PredictionResult {
  const { unitId, examHistory, hasPredictionTag, hasNewCurriculumTag, hasHighFrequencyTag, targetYear } = input;

  // この単元の出題履歴
  const unitHistory = examHistory.filter((h) => h.unit_id === unitId);
  const yearsAppeared = [...new Set(unitHistory.map((h) => h.year))].sort();

  const reasons: string[] = [];

  // 1. 出題頻度 (過去10年で何回出たか) → 0-30点
  const recentYears = yearsAppeared.filter((y) => y >= targetYear - 10);
  const frequency = Math.min(30, recentYears.length * 5);
  if (recentYears.length >= 5) reasons.push(`過去10年で${recentYears.length}回出題（頻出）`);
  else if (recentYears.length >= 3) reasons.push(`過去10年で${recentYears.length}回出題`);
  else if (recentYears.length > 0) reasons.push(`過去10年で${recentYears.length}回のみ`);
  else reasons.push("過去10年出題なし");

  // 2. 直近出題間隔 (しばらく出てないと出やすい) → 0-25点
  let interval = 0;
  if (yearsAppeared.length > 0) {
    const lastYear = Math.max(...yearsAppeared);
    const gap = targetYear - lastYear;
    if (gap >= 5) { interval = 25; reasons.push(`${gap}年間未出題（出題サイクル的に要注意）`); }
    else if (gap >= 3) { interval = 18; reasons.push(`${gap}年ぶりの出題可能性`); }
    else if (gap >= 2) { interval = 10; reasons.push(`前回出題: ${lastYear}年`); }
    else { interval = 5; reasons.push(`直近${lastYear}年に出題済み`); }
  } else {
    interval = 15; // 履歴なし→新分野の可能性
    reasons.push("出題履歴データなし");
  }

  // 3. 新課程対応 → 0-20点
  let curriculum = 0;
  if (hasNewCurriculumTag) {
    curriculum = 20;
    reasons.push("新課程重点分野");
  }

  // 4. 管理者タグ → 0-25点
  let manual = 0;
  if (hasPredictionTag) { manual += 25; reasons.push("管理者が出題予想に指定"); }
  if (hasHighFrequencyTag && manual < 15) { manual += 10; reasons.push("頻出タグ付き"); }

  const score = Math.min(100, frequency + interval + curriculum + manual);

  return {
    unitId,
    score,
    reasoning: reasons.join("。"),
    factors: { frequency, interval, curriculum, manual },
  };
}

/** 全単元の出題予想を一括算出 */
export function calculateAllPredictions(
  unitIds: string[],
  examHistory: ExamHistoryEntry[],
  unitTags: { unit_id: string; tag_name: string }[],
  targetYear: number
): PredictionResult[] {
  return unitIds.map((unitId) => {
    const tags = unitTags.filter((t) => t.unit_id === unitId);
    return calculatePrediction({
      unitId,
      examHistory,
      hasPredictionTag: tags.some((t) => t.tag_name === `prediction_${targetYear}`),
      hasNewCurriculumTag: tags.some((t) => t.tag_name === "new_curriculum"),
      hasHighFrequencyTag: tags.some((t) => t.tag_name === "high_frequency"),
      targetYear,
    });
  }).sort((a, b) => b.score - a.score);
}
