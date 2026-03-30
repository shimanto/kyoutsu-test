import { describe, it, expect } from "vitest";
import { sm2, mapUIToQuality, type ReviewState } from "../src/services/spaced-repetition";

const DEFAULT_STATE: ReviewState = { easeFactor: 2.5, interval: 0, repetitions: 0 };

describe("SM-2 アルゴリズム", () => {
  describe("初回学習", () => {
    it("quality >= 3 で interval=1, repetitions=1", () => {
      const result = sm2(DEFAULT_STATE, 5);
      expect(result.interval).toBe(1);
      expect(result.repetitions).toBe(1);
    });

    it("quality < 3 で interval=1, repetitions=0 (リセット)", () => {
      const result = sm2(DEFAULT_STATE, 2);
      expect(result.interval).toBe(1);
      expect(result.repetitions).toBe(0);
    });
  });

  describe("2回目以降", () => {
    it("2回目正解で interval=6", () => {
      const state: ReviewState = { easeFactor: 2.5, interval: 1, repetitions: 1 };
      const result = sm2(state, 4);
      expect(result.interval).toBe(6);
      expect(result.repetitions).toBe(2);
    });

    it("3回目正解で interval = prev * EF", () => {
      const state: ReviewState = { easeFactor: 2.5, interval: 6, repetitions: 2 };
      const result = sm2(state, 4);
      expect(result.interval).toBe(15); // 6 * 2.5 = 15
      expect(result.repetitions).toBe(3);
    });

    it("不正解でリセット (interval=1, repetitions=0)", () => {
      const state: ReviewState = { easeFactor: 2.6, interval: 15, repetitions: 3 };
      const result = sm2(state, 1);
      expect(result.interval).toBe(1);
      expect(result.repetitions).toBe(0);
      expect(result.easeFactor).toBe(2.4);
    });
  });

  describe("EF (Ease Factor) 更新", () => {
    it("quality=5 で EF上昇", () => {
      const result = sm2(DEFAULT_STATE, 5);
      expect(result.easeFactor).toBeGreaterThan(2.5);
    });

    it("quality=3 で EF低下", () => {
      const result = sm2(DEFAULT_STATE, 3);
      expect(result.easeFactor).toBeLessThan(2.5);
    });

    it("EFは1.3を下回らない", () => {
      const lowEF: ReviewState = { easeFactor: 1.3, interval: 1, repetitions: 0 };
      const result = sm2(lowEF, 0);
      expect(result.easeFactor).toBe(1.3);
    });
  });

  describe("共通テストカスタマイズ", () => {
    it("高難度問題 (difficulty>=4) は interval × 0.8", () => {
      const state: ReviewState = { easeFactor: 2.5, interval: 6, repetitions: 2 };
      const normal = sm2(state, 4, 3);   // 難易度3: 通常
      const hard = sm2(state, 4, 4);     // 難易度4: 短縮
      expect(hard.interval).toBeLessThan(normal.interval);
      expect(hard.interval).toBe(Math.round(normal.interval * 0.8));
    });

    it("直前期 (30日以内) は interval上限14日", () => {
      const state: ReviewState = { easeFactor: 2.5, interval: 30, repetitions: 5 };
      const result = sm2(state, 5, 3, 20); // 残り20日
      expect(result.interval).toBeLessThanOrEqual(14);
    });

    it("直前期でなければ interval上限なし", () => {
      const state: ReviewState = { easeFactor: 2.5, interval: 30, repetitions: 5 };
      const result = sm2(state, 5, 3, 100); // 残り100日
      expect(result.interval).toBeGreaterThan(14);
    });
  });

  describe("連続正解によるinterval延伸", () => {
    it("正解を重ねるとintervalが伸びる", () => {
      let state = DEFAULT_STATE;
      const intervals: number[] = [];
      for (let i = 0; i < 6; i++) {
        state = sm2(state, 4);
        intervals.push(state.interval);
      }
      // 各intervalが前回以上であること
      for (let i = 1; i < intervals.length; i++) {
        expect(intervals[i]).toBeGreaterThanOrEqual(intervals[i - 1]);
      }
    });
  });
});

describe("mapUIToQuality", () => {
  it("正解 + 完璧 → 5", () => {
    expect(mapUIToQuality(true, "perfect")).toBe(5);
  });

  it("正解 + まあまあ → 4", () => {
    expect(mapUIToQuality(true, "good")).toBe(4);
  });

  it("正解 + 微妙 → 3", () => {
    expect(mapUIToQuality(true, "unsure")).toBe(3);
  });

  it("不正解 + forgot → 0", () => {
    expect(mapUIToQuality(false, "forgot")).toBe(0);
  });

  it("不正解 + それ以外 → 2", () => {
    expect(mapUIToQuality(false, "good")).toBe(2);
    expect(mapUIToQuality(false, "unsure")).toBe(2);
  });
});
