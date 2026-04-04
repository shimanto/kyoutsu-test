/**
 * 大学物語 料金プラン定義
 *
 * 成長戦略ロードマップ (docs/growth-roadmap.md) と同期すること。
 */

export const PRICING_PLANS = {
  FREE: {
    id: "free",
    name: "Free",
    nameJa: "フリー",
    monthlyPrice: 0,
    yearlyPrice: 0,
    features: [
      "ヒートマップ閲覧",
      "1日10問ドリル",
      "基本統計",
    ],
    limits: {
      dailyDrillQuestions: 10,
      aiQuestions: false,
      detailedAnalytics: false,
      studyPlan: false,
      universityTargets: false,
      examPrediction: false,
    },
  },
  STANDARD: {
    id: "standard",
    name: "Standard",
    nameJa: "スタンダード",
    monthlyPrice: 980,
    yearlyPrice: 9800,
    features: [
      "無制限ドリル",
      "AI変形問題",
      "詳細分析",
      "復習スケジュール",
    ],
    limits: {
      dailyDrillQuestions: Infinity,
      aiQuestions: true,
      detailedAnalytics: true,
      studyPlan: false,
      universityTargets: false,
      examPrediction: false,
    },
  },
  PREMIUM: {
    id: "premium",
    name: "Premium",
    nameJa: "プレミアム",
    monthlyPrice: 1980,
    yearlyPrice: 19800,
    features: [
      "Standardの全機能",
      "弱点集中プラン自動生成",
      "大学別攻略ヒートマップ",
      "模試予測スコア",
    ],
    limits: {
      dailyDrillQuestions: Infinity,
      aiQuestions: true,
      detailedAnalytics: true,
      studyPlan: true,
      universityTargets: true,
      examPrediction: true,
    },
  },
} as const;

export type PlanId = keyof typeof PRICING_PLANS;

/** プランIDから情報を取得 */
export function getPlan(planId: string) {
  const key = planId.toUpperCase() as PlanId;
  return PRICING_PLANS[key] ?? PRICING_PLANS.FREE;
}

/** 年額割引率を表示用に計算 */
export function getYearlyDiscount(planId: PlanId): number {
  const plan = PRICING_PLANS[planId];
  if (plan.monthlyPrice === 0) return 0;
  const fullYear = plan.monthlyPrice * 12;
  return Math.round((1 - plan.yearlyPrice / fullYear) * 100);
}

/** 成長フェーズ定義 */
export const GROWTH_PHASES = {
  PHASE_0: {
    id: "phase_0",
    name: "MVP検証",
    period: "2026年4月〜5月",
    kpis: { targetUsers: 100, targetWau: 50 },
  },
  PHASE_1: {
    id: "phase_1",
    name: "PMF達成",
    period: "2026年6月〜8月",
    kpis: { targetUsers: 1000, targetWau: 400, targetD7Retention: 0.4 },
  },
  PHASE_2: {
    id: "phase_2",
    name: "グロース",
    period: "2026年9月〜11月",
    kpis: { targetMau: 5000, targetConversion: 0.05, targetQuestions: 3000 },
  },
  PHASE_3: {
    id: "phase_3",
    name: "収益化",
    period: "2026年12月〜2027年3月",
    kpis: { targetMrr: 500000, targetMau: 15000, targetNps: 50 },
  },
  PHASE_4: {
    id: "phase_4",
    name: "スケール",
    period: "2027年4月〜",
    kpis: { targetMau: 50000, targetArr: 12000000 },
  },
} as const;

export type GrowthPhaseId = keyof typeof GROWTH_PHASES;
