import { describe, it, expect } from "vitest";
import { detectWeakPoints, type FieldStat } from "../src/services/weakpoint-detector";

const makeStat = (
  overrides: Partial<FieldStat> & { fieldId: string }
): FieldStat => ({
  fieldName: `分野${overrides.fieldId}`,
  subjectId: "sub-1",
  total: 10,
  correct: 5,
  ...overrides,
});

describe("弱点検出 (detectWeakPoints)", () => {
  describe("優先度判定", () => {
    it("正答率50%未満は critical", () => {
      const stats = [makeStat({ fieldId: "f1", total: 10, correct: 4 })];
      const result = detectWeakPoints(stats);
      expect(result).toHaveLength(1);
      expect(result[0].priority).toBe("critical");
      expect(result[0].correctRate).toBe(0.4);
    });

    it("正答率50%は warning（境界値）", () => {
      const stats = [makeStat({ fieldId: "f1", total: 10, correct: 5 })];
      const result = detectWeakPoints(stats);
      expect(result[0].priority).toBe("warning");
      expect(result[0].correctRate).toBe(0.5);
    });

    it("正答率50-65%は warning", () => {
      const stats = [makeStat({ fieldId: "f1", total: 20, correct: 12 })];
      const result = detectWeakPoints(stats);
      expect(result[0].priority).toBe("warning");
      expect(result[0].correctRate).toBe(0.6);
    });

    it("正答率65%は watch（境界値）", () => {
      const stats = [makeStat({ fieldId: "f1", total: 20, correct: 13 })];
      const result = detectWeakPoints(stats);
      expect(result[0].priority).toBe("watch");
      expect(result[0].correctRate).toBe(0.65);
    });

    it("正答率65-75%は watch", () => {
      const stats = [makeStat({ fieldId: "f1", total: 10, correct: 7 })];
      const result = detectWeakPoints(stats);
      expect(result[0].priority).toBe("watch");
      expect(result[0].correctRate).toBe(0.7);
    });

    it("正答率75%は ok（境界値）", () => {
      const stats = [makeStat({ fieldId: "f1", total: 20, correct: 15 })];
      const result = detectWeakPoints(stats);
      expect(result[0].priority).toBe("ok");
      expect(result[0].correctRate).toBe(0.75);
    });

    it("正答率75%以上は ok", () => {
      const stats = [makeStat({ fieldId: "f1", total: 10, correct: 9 })];
      const result = detectWeakPoints(stats);
      expect(result[0].priority).toBe("ok");
      expect(result[0].correctRate).toBe(0.9);
    });
  });

  describe("フィルタリング", () => {
    it("解答数5未満はフィルタアウトされる", () => {
      const stats = [
        makeStat({ fieldId: "f1", total: 4, correct: 1 }),
        makeStat({ fieldId: "f2", total: 3, correct: 0 }),
      ];
      const result = detectWeakPoints(stats);
      expect(result).toHaveLength(0);
    });

    it("解答数5はフィルタを通過する（境界値）", () => {
      const stats = [makeStat({ fieldId: "f1", total: 5, correct: 2 })];
      const result = detectWeakPoints(stats);
      expect(result).toHaveLength(1);
    });

    it("解答数5未満と5以上が混在する場合、5以上のみ返す", () => {
      const stats = [
        makeStat({ fieldId: "f1", total: 4, correct: 1 }),
        makeStat({ fieldId: "f2", total: 10, correct: 3 }),
      ];
      const result = detectWeakPoints(stats);
      expect(result).toHaveLength(1);
      expect(result[0].fieldId).toBe("f2");
    });
  });

  describe("弱点スコアとソート", () => {
    it("弱点スコア降順でソートされる", () => {
      const stats = [
        makeStat({ fieldId: "ok", total: 10, correct: 9 }),
        makeStat({ fieldId: "critical", total: 10, correct: 1 }),
        makeStat({ fieldId: "warning", total: 10, correct: 6 }),
      ];
      const result = detectWeakPoints(stats);
      expect(result[0].fieldId).toBe("critical");
      expect(result[1].fieldId).toBe("warning");
      expect(result[2].fieldId).toBe("ok");
      // スコアが実際に降順であることを確認
      for (let i = 0; i < result.length - 1; i++) {
        expect(result[i].weaknessScore).toBeGreaterThanOrEqual(
          result[i + 1].weaknessScore
        );
      }
    });

    it("弱点スコア = (1 - correctRate) * confidence で計算される", () => {
      // total=10 → confidence = min(1, 10/10) = 1.0
      const stats = [makeStat({ fieldId: "f1", total: 10, correct: 3 })];
      const result = detectWeakPoints(stats);
      // correctRate = 0.3, confidence = 1.0, score = 0.7 * 1.0 = 0.7
      expect(result[0].weaknessScore).toBeCloseTo(0.7);
    });

    it("解答数10未満は confidence が割引される", () => {
      // total=5 → confidence = min(1, 5/10) = 0.5
      const stats = [makeStat({ fieldId: "f1", total: 5, correct: 1 })];
      const result = detectWeakPoints(stats);
      // correctRate = 0.2, confidence = 0.5, score = 0.8 * 0.5 = 0.4
      expect(result[0].weaknessScore).toBeCloseTo(0.4);
    });
  });

  describe("エッジケース", () => {
    it("空配列を渡すと空配列が返る", () => {
      const result = detectWeakPoints([]);
      expect(result).toEqual([]);
    });

    it("返却オブジェクトのフィールドが正しくマッピングされる", () => {
      const stats = [
        makeStat({
          fieldId: "f1",
          fieldName: "微分積分",
          subjectId: "math-1",
          total: 10,
          correct: 3,
        }),
      ];
      const result = detectWeakPoints(stats);
      expect(result[0]).toMatchObject({
        fieldId: "f1",
        fieldName: "微分積分",
        subjectId: "math-1",
        correctRate: 0.3,
        attemptCount: 10,
        priority: "critical",
      });
    });
  });
});
