import { SM2 } from "@kyoutsu/shared";

export interface ReviewState {
  easeFactor: number;
  interval: number;
  repetitions: number;
}

/**
 * SM-2 アルゴリズム
 * @param state 現在の復習状態
 * @param quality ユーザー自己評価 0-5
 * @param difficulty 問題の難易度 1-5
 * @param daysUntilExam 試験までの残り日数
 */
export function sm2(
  state: ReviewState,
  quality: number,
  difficulty: number = 3,
  daysUntilExam: number = 365
): ReviewState {
  // quality < 3 → 不正解: リセット
  if (quality < 3) {
    return {
      easeFactor: Math.max(SM2.MIN_EASE_FACTOR, state.easeFactor - 0.2),
      interval: 1,
      repetitions: 0,
    };
  }

  // 正解: interval延伸
  let newInterval: number;
  if (state.repetitions === 0) {
    newInterval = 1;
  } else if (state.repetitions === 1) {
    newInterval = 6;
  } else {
    newInterval = Math.round(state.interval * state.easeFactor);
  }

  // EF更新
  const newEF =
    state.easeFactor +
    (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));

  // 共通テスト向けカスタマイズ
  // 高難度問題: intervalを短縮
  if (difficulty >= 4) {
    newInterval = Math.round(newInterval * SM2.HARD_QUESTION_INTERVAL_RATIO);
  }

  // 直前期: interval上限を制限
  if (daysUntilExam <= SM2.CRUNCH_TIME_DAYS) {
    newInterval = Math.min(newInterval, SM2.CRUNCH_TIME_MAX_INTERVAL);
  }

  return {
    easeFactor: Math.max(SM2.MIN_EASE_FACTOR, newEF),
    interval: Math.max(1, newInterval),
    repetitions: state.repetitions + 1,
  };
}

/** quality UIマッピング */
export function mapUIToQuality(
  isCorrect: boolean,
  selfRating: "perfect" | "good" | "unsure" | "forgot"
): number {
  if (!isCorrect) {
    return selfRating === "forgot" ? 0 : 2;
  }
  switch (selfRating) {
    case "perfect": return 5;
    case "good": return 4;
    case "unsure": return 3;
    default: return 3;
  }
}
