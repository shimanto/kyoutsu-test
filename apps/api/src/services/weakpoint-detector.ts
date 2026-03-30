export interface FieldStat {
  fieldId: string;
  fieldName: string;
  subjectId: string;
  total: number;
  correct: number;
}

export interface WeakPoint {
  fieldId: string;
  fieldName: string;
  subjectId: string;
  correctRate: number;
  attemptCount: number;
  weaknessScore: number;
  priority: "critical" | "warning" | "watch" | "ok";
}

export function detectWeakPoints(stats: FieldStat[]): WeakPoint[] {
  return stats
    .filter((f) => f.total >= 5)
    .map((f) => {
      const correctRate = f.total > 0 ? f.correct / f.total : 0;
      const confidence = Math.min(1, f.total / 10);
      const weaknessScore = (1 - correctRate) * confidence;

      let priority: WeakPoint["priority"];
      if (correctRate < 0.5) priority = "critical";
      else if (correctRate < 0.65) priority = "warning";
      else if (correctRate < 0.75) priority = "watch";
      else priority = "ok";

      return {
        fieldId: f.fieldId,
        fieldName: f.fieldName,
        subjectId: f.subjectId,
        correctRate,
        attemptCount: f.total,
        weaknessScore,
        priority,
      };
    })
    .sort((a, b) => b.weaknessScore - a.weaknessScore);
}
