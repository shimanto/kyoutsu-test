/**
 * #10 学習計画自動生成
 *
 * 残り日数 × 目標スコア × 現在スコア から日別タスクを生成
 */

import { SUBJECTS, type SubjectDef } from "@kyoutsu/shared";

export interface PlanInput {
  examDate: string;            // 共通テスト日 YYYY-MM-DD
  currentScores: Record<string, number>;  // { kokugo: 138, math1a: 78, ... }
  targetScores: Record<string, number>;   // { kokugo: 175, math1a: 90, ... }
  weeklyStudyHours: number;    // 週の学習可能時間
}

export interface DailyTask {
  date: string;
  subjectId: string;
  taskType: "new_learn" | "review" | "weakness" | "exam";
  targetQuestionCount: number;
}

export interface GeneratedPlan {
  tasks: DailyTask[];
  totalDays: number;
  phase: "foundation" | "application" | "practice" | "crunch";
  subjectAllocations: { subjectId: string; weeklyHours: number; priority: number }[];
}

function daysBetween(a: Date, b: Date): number {
  return Math.ceil((b.getTime() - a.getTime()) / 86400000);
}

function getPhase(remainingDays: number): GeneratedPlan["phase"] {
  if (remainingDays > 180) return "foundation";
  if (remainingDays > 90) return "application";
  if (remainingDays > 30) return "practice";
  return "crunch";
}

export function generatePlan(input: PlanInput): GeneratedPlan {
  const today = new Date();
  const examDate = new Date(input.examDate);
  const remainingDays = daysBetween(today, examDate);
  const phase = getPhase(remainingDays);

  // 1. 科目別ギャップと重み計算
  const allocations = SUBJECTS.map((sub: SubjectDef) => {
    const current = input.currentScores[sub.id] || 0;
    const target = input.targetScores[sub.id] || Math.round(sub.maxScore * 0.85);
    const gap = Math.max(0, target - current);
    const gapRatio = gap / sub.maxScore;
    const currentRate = current / sub.maxScore;

    // 優先度: ギャップ大 + 低得点科目を重視
    const priorityMultiplier = currentRate < 0.5 ? 1.5 : currentRate < 0.7 ? 1.2 : 0.8;
    const weight = gapRatio * sub.difficultyFactor * priorityMultiplier;

    return { subjectId: sub.id, weight, gap, gapRatio };
  }).filter((a) => a.gap > 0);

  const totalWeight = allocations.reduce((s, a) => s + a.weight, 0) || 1;

  const subjectAllocations = allocations.map((a) => ({
    subjectId: a.subjectId,
    weeklyHours: Math.round((a.weight / totalWeight) * input.weeklyStudyHours * 10) / 10,
    priority: Math.round((a.weight / totalWeight) * 100),
  }));

  // 2. 日別タスク生成
  const tasks: DailyTask[] = [];
  const dailyHours = input.weeklyStudyHours / 7;

  for (let d = 0; d < Math.min(remainingDays, 90); d++) {
    const date = new Date(today);
    date.setDate(date.getDate() + d);
    const dateStr = date.toISOString().slice(0, 10);
    const dayOfWeek = date.getDay();

    // 日曜は模試デー (月1)
    if (dayOfWeek === 0 && d % 28 < 7) {
      tasks.push({ date: dateStr, subjectId: "exam", taskType: "exam", targetQuestionCount: 0 });
      continue;
    }

    // 1日2-3科目を割り当て
    const todaySubjects = subjectAllocations
      .sort((a, b) => b.priority - a.priority)
      .slice(0, dailyHours >= 3 ? 3 : 2);

    for (const sub of todaySubjects) {
      // フェーズに応じたタスクタイプ
      let taskType: DailyTask["taskType"];
      if (phase === "crunch") taskType = d % 3 === 0 ? "review" : "weakness";
      else if (phase === "practice") taskType = d % 4 === 0 ? "exam" : d % 2 === 0 ? "weakness" : "new_learn";
      else if (phase === "application") taskType = d % 3 === 0 ? "weakness" : "new_learn";
      else taskType = "new_learn";

      // 復習混入 (3日に1回)
      if (d % 3 === 1) taskType = "review";

      const questionCount = Math.round((sub.weeklyHours / 7) * 60 / 4); // 4分/問想定
      tasks.push({
        date: dateStr,
        subjectId: sub.subjectId,
        taskType,
        targetQuestionCount: Math.max(5, questionCount),
      });
    }
  }

  return { tasks, totalDays: remainingDays, phase, subjectAllocations };
}
