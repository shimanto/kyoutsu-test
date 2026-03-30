export interface SubjectDef {
  id: string;
  name: string;
  shortName: string;
  maxScore: number;
  displayOrder: number;
  /** 上達難易度係数 (計画生成用) */
  difficultyFactor: number;
}

export const SUBJECTS: SubjectDef[] = [
  { id: "kokugo", name: "国語", shortName: "国", maxScore: 200, displayOrder: 1, difficultyFactor: 1.2 },
  { id: "math1a", name: "数学I・A", shortName: "数IA", maxScore: 100, displayOrder: 2, difficultyFactor: 1.3 },
  { id: "math2bc", name: "数学II・B・C", shortName: "数IIB", maxScore: 100, displayOrder: 3, difficultyFactor: 1.3 },
  { id: "eng_read", name: "英語リーディング", shortName: "英R", maxScore: 100, displayOrder: 4, difficultyFactor: 1.1 },
  { id: "eng_listen", name: "英語リスニング", shortName: "英L", maxScore: 100, displayOrder: 5, difficultyFactor: 1.1 },
  { id: "physics", name: "物理", shortName: "物", maxScore: 100, displayOrder: 6, difficultyFactor: 1.0 },
  { id: "chemistry", name: "化学", shortName: "化", maxScore: 100, displayOrder: 7, difficultyFactor: 1.0 },
  { id: "social", name: "社会", shortName: "社", maxScore: 100, displayOrder: 8, difficultyFactor: 0.8 },
  { id: "info1", name: "情報I", shortName: "情", maxScore: 100, displayOrder: 9, difficultyFactor: 0.7 },
] as const;

export const SUBJECT_MAP = Object.fromEntries(
  SUBJECTS.map((s) => [s.id, s])
) as Record<string, SubjectDef>;

/** 共通テスト満点 */
export const TOTAL_MAX_SCORE = SUBJECTS.reduce((sum, s) => sum + s.maxScore, 0); // 900

/** 東大理系足切り目安 */
export const TODAI_RIKA_CUTOFF_ESTIMATE = 750;
