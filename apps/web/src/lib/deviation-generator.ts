/**
 * 偏差値ベースのヒートマップデータ生成 (クライアント版)
 *
 * apps/api/src/services/test-data-generator.ts と同じアルゴリズムを
 * クライアントサイドで実行し、偏差値変更時にリアルタイム反映する。
 */

import { SAMPLE_FIELD_STATS } from "./sample-data";

/** 偏差値 → ベース正答率 */
function deviationToBaseRate(deviation: number): number {
  const x = (deviation - 50) / 10;
  return 0.58 + 0.35 * (2 / (1 + Math.exp(-1.5 * x)) - 1);
}

function clamp(v: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, v));
}

function seedRandom(seed: number): () => number {
  let s = seed | 0;
  return () => {
    s = (s * 1664525 + 1013904223) | 0;
    return (s >>> 0) / 4294967296;
  };
}

/** 科目ごとのオフセット (理系プロファイル) */
const SUBJECT_OFFSETS: Record<string, number> = {
  kokugo: -0.05,
  math1a: 0.05,
  math2bc: 0.03,
  eng_read: 0.00,
  eng_listen: -0.03,
  physics: 0.04,
  chemistry: -0.02,
  social: -0.08,
  info1: 0.00,
};

export interface GeneratedFieldStat {
  field_id: string;
  field_name: string;
  subject_id: string;
  total: number;
  correct: number;
  points: number;
}

export interface GeneratedOverview {
  subjectStats: { subject_id: string; total: number; correct: number }[];
  fieldStats: GeneratedFieldStat[];
  targets: { subject_id: string; target_score: number }[];
}

/** 教科の得意不得意をlocalStorageから読み取る */
function loadSubjectStrengths(): Record<string, number> {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem("kyoutsu_subject_strength");
    return raw ? JSON.parse(raw) : {};
  } catch { return {}; }
}

/** 教科IDから強弱グループを解決 */
const SUBJECT_TO_GROUP: Record<string, string> = {
  kokugo: "kokugo", math1a: "math", math2bc: "math",
  eng_read: "english", eng_listen: "english",
  physics: "science", chemistry: "science",
  social: "social", info1: "social",
};

/**
 * 偏差値からヒートマップ用の OverviewData を生成
 * 教科の得意不得意設定も反映する
 */
export function generateOverviewFromDeviation(deviation: number): GeneratedOverview {
  const base = deviationToBaseRate(deviation);
  const rng = seedRandom(deviation * 137);
  const strengths = loadSubjectStrengths();

  // 科目別ベースレート（得意不得意を反映: -2〜+2 → -0.10〜+0.10 の補正）
  const subjectRates: Record<string, number> = {};
  for (const [sid, offset] of Object.entries(SUBJECT_OFFSETS)) {
    const group = SUBJECT_TO_GROUP[sid] || sid;
    const strengthBonus = (strengths[group] || 0) * 0.05;
    subjectRates[sid] = clamp(base + offset + strengthBonus + rng() * 0.04, 0.15, 0.98);
  }

  // 分野別バラつき生成
  const rng2 = seedRandom(deviation * 251);
  const fieldStats: GeneratedFieldStat[] = SAMPLE_FIELD_STATS.map((f) => {
    const subjectRate = subjectRates[f.subjectId] || base;
    const variance = 0.08 + rng2() * 0.12;
    const fieldOffset = (rng2() - 0.5) * variance * 2;
    const fieldRate = clamp(subjectRate + fieldOffset, 0.1, 0.98);

    const baseCount = 10 + Math.floor(deviation / 5);
    const total = baseCount + Math.floor(rng2() * 15);
    const correct = Math.min(Math.round(total * fieldRate), total);

    return {
      field_id: f.fieldId,
      field_name: f.fieldName,
      subject_id: f.subjectId,
      total,
      correct,
      points: f.points,
    };
  });

  // 科目別集計
  const subjectMap = new Map<string, { total: number; correct: number }>();
  for (const f of fieldStats) {
    const prev = subjectMap.get(f.subject_id) || { total: 0, correct: 0 };
    subjectMap.set(f.subject_id, {
      total: prev.total + f.total,
      correct: prev.correct + f.correct,
    });
  }

  return {
    subjectStats: Array.from(subjectMap.entries()).map(([sid, s]) => ({
      subject_id: sid,
      total: s.total,
      correct: s.correct,
    })),
    fieldStats,
    targets: [],
  };
}

/** 偏差値の目安テキスト */
export function deviationLabel(d: number): string {
  if (d >= 75) return "東大理三 確実圏";
  if (d >= 70) return "東大理一 安全圏";
  if (d >= 65) return "旧帝大 上位";
  if (d >= 60) return "旧帝大レベル";
  if (d >= 55) return "国公立中堅";
  if (d >= 50) return "平均";
  return "基礎固め段階";
}
