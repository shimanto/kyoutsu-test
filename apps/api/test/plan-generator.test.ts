import { describe, it, expect } from "vitest";
import { generatePlan, type PlanInput } from "../src/services/plan-generator";

const BASE_INPUT: PlanInput = {
  examDate: "2027-01-16",
  currentScores: { kokugo: 138, math1a: 78, math2bc: 72, eng_read: 74, eng_listen: 68, physics: 76, chemistry: 68, social: 62, info1: 72 },
  targetScores: { kokugo: 175, math1a: 90, math2bc: 85, eng_read: 85, eng_listen: 80, physics: 85, chemistry: 80, social: 75, info1: 80 },
  weeklyStudyHours: 20,
};

describe("学習計画自動生成", () => {
  it("計画が生成される", () => {
    const plan = generatePlan(BASE_INPUT);
    expect(plan.tasks.length).toBeGreaterThan(0);
    expect(plan.totalDays).toBeGreaterThan(0);
    expect(plan.subjectAllocations.length).toBeGreaterThan(0);
  });

  it("科目配分の合計が週間学習時間に近い", () => {
    const plan = generatePlan(BASE_INPUT);
    const totalHours = plan.subjectAllocations.reduce((s, a) => s + a.weeklyHours, 0);
    expect(totalHours).toBeGreaterThan(BASE_INPUT.weeklyStudyHours * 0.8);
    expect(totalHours).toBeLessThanOrEqual(BASE_INPUT.weeklyStudyHours * 1.2);
  });

  it("ギャップの大きい科目ほど優先度が高い", () => {
    const plan = generatePlan(BASE_INPUT);
    // 国語: gap=37, 社会: gap=13 → 国語の方が優先度高いはず
    const kokugo = plan.subjectAllocations.find((a) => a.subjectId === "kokugo");
    const info = plan.subjectAllocations.find((a) => a.subjectId === "info1");
    expect(kokugo!.priority).toBeGreaterThanOrEqual(info!.priority);
  });

  it("直前期(30日以内)はcrunchフェーズ", () => {
    const plan = generatePlan({
      ...BASE_INPUT,
      examDate: new Date(Date.now() + 20 * 86400000).toISOString().slice(0, 10),
    });
    expect(plan.phase).toBe("crunch");
  });

  it("180日以上はfoundationフェーズ", () => {
    const plan = generatePlan({
      ...BASE_INPUT,
      examDate: new Date(Date.now() + 200 * 86400000).toISOString().slice(0, 10),
    });
    expect(plan.phase).toBe("foundation");
  });

  it("タスクに日曜模試デーが含まれる", () => {
    const plan = generatePlan(BASE_INPUT);
    const examTasks = plan.tasks.filter((t) => t.taskType === "exam");
    expect(examTasks.length).toBeGreaterThan(0);
  });

  it("各タスクの問題数が5以上", () => {
    const plan = generatePlan(BASE_INPUT);
    const nonExamTasks = plan.tasks.filter((t) => t.taskType !== "exam");
    for (const t of nonExamTasks) {
      expect(t.targetQuestionCount).toBeGreaterThanOrEqual(5);
    }
  });
});
