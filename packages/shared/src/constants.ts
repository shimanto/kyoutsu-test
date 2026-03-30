/** SM-2 アルゴリズム定数 */
export const SM2 = {
  DEFAULT_EASE_FACTOR: 2.5,
  MIN_EASE_FACTOR: 1.3,
  /** 直前期(30日前)のinterval上限 */
  CRUNCH_TIME_MAX_INTERVAL: 14,
  CRUNCH_TIME_DAYS: 30,
  /** 高難度問題のinterval補正 */
  HARD_QUESTION_INTERVAL_RATIO: 0.8,
  /** 科目別1日あたり復習上限 */
  DAILY_REVIEW_LIMIT_PER_SUBJECT: 15,
} as const;

/** 弱点検出閾値 */
export const WEAKNESS = {
  CRITICAL_RATE: 0.5,
  WARNING_RATE: 0.65,
  WATCH_RATE: 0.75,
  /** 信頼度に必要な最低回答数 */
  MIN_ATTEMPTS_FOR_CONFIDENCE: 10,
} as const;

/** 学習計画フェーズ(残り日数) */
export const PLAN_PHASES = {
  FOUNDATION: 180,  // 基礎固め: 180日以上
  APPLICATION: 90,  // 応用: 90-180日
  PRACTICE: 30,     // 実践: 30-90日
  CRUNCH: 0,        // 直前: 30日未満
} as const;

/** 志望科類 */
export const BUNRUI = {
  RIKA1: "rika1",
  RIKA2: "rika2",
  RIKA3: "rika3",
} as const;

export type Bunrui = (typeof BUNRUI)[keyof typeof BUNRUI];

/** 問題タイプ */
export const QUESTION_TYPES = {
  CHOICE: "choice",
  NUMERIC: "numeric",
  TEXT: "text",
} as const;

export type QuestionType = (typeof QUESTION_TYPES)[keyof typeof QUESTION_TYPES];

/** セッションタイプ */
export const SESSION_TYPES = {
  DRILL: "drill",
  REVIEW: "review",
  EXAM: "exam",
  WEAKNESS: "weakness",
} as const;

export type SessionType = (typeof SESSION_TYPES)[keyof typeof SESSION_TYPES];

/** 弱点優先度 */
export type WeaknessPriority = "critical" | "warning" | "watch";
