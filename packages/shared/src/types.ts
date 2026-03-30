import type { Bunrui, QuestionType, SessionType, WeaknessPriority } from "./constants";

// ============================================================
// User
// ============================================================
export interface User {
  id: string;
  lineUserId: string;
  displayName: string;
  pictureUrl: string | null;
  targetBunrui: Bunrui;
  targetTotalScore: number;
  examYear: number;
  role: "student" | "admin";
  createdAt: string;
  updatedAt: string;
}

export interface UserSubjectTarget {
  id: string;
  userId: string;
  subjectId: string;
  targetScore: number;
}

// ============================================================
// Content hierarchy
// ============================================================
export interface Subject {
  id: string;
  name: string;
  maxScore: number;
  displayOrder: number;
}

export interface Field {
  id: string;
  subjectId: string;
  name: string;
  displayOrder: number;
}

export interface Unit {
  id: string;
  fieldId: string;
  name: string;
  displayOrder: number;
}

// ============================================================
// Question
// ============================================================
export interface Question {
  id: string;
  unitId: string;
  year: number | null;
  questionNumber: string | null;
  body: string;
  imageUrl: string | null;
  questionType: QuestionType;
  difficulty: number; // 1-5
  points: number;
  explanation: string | null;
  source: string | null;
  createdAt: string;
}

export interface Choice {
  id: string;
  questionId: string;
  label: string;
  body: string;
  isCorrect: boolean;
  displayOrder: number;
}

// ============================================================
// Study session & answers
// ============================================================
export interface StudySession {
  id: string;
  userId: string;
  sessionType: SessionType;
  subjectId: string | null;
  fieldId: string | null;
  startedAt: string;
  finishedAt: string | null;
  totalQuestions: number;
  correctCount: number;
}

export interface Answer {
  id: string;
  userId: string;
  sessionId: string | null;
  questionId: string;
  chosenChoiceId: string | null;
  numericAnswer: string | null;
  isCorrect: boolean;
  timeSpentMs: number | null;
  answeredAt: string;
}

// ============================================================
// Spaced Repetition
// ============================================================
export interface ReviewSchedule {
  id: string;
  userId: string;
  questionId: string;
  easeFactor: number;
  intervalDays: number;
  repetitions: number;
  quality: number | null;
  nextReviewDate: string;
  lastReviewedAt: string | null;
  createdAt: string;
}

// ============================================================
// Study Plan
// ============================================================
export interface StudyPlan {
  id: string;
  userId: string;
  generatedAt: string;
  examDate: string;
  isActive: boolean;
}

export interface PlanDailyTask {
  id: string;
  planId: string;
  scheduledDate: string;
  subjectId: string;
  fieldId: string | null;
  taskType: "new_learn" | "review" | "weakness" | "exam";
  targetQuestionCount: number;
  completedCount: number;
  status: "pending" | "in_progress" | "completed" | "skipped";
}

// ============================================================
// Exam
// ============================================================
export interface Exam {
  id: string;
  title: string;
  year: number;
  examType: "honshiken" | "tsuishiken" | "moshi";
  timeLimitMinutes: number | null;
  totalScore: number;
  createdAt: string;
}

export interface ExamAttempt {
  id: string;
  userId: string;
  examId: string;
  startedAt: string;
  finishedAt: string | null;
  totalScore: number | null;
  scoreBreakdown: Record<string, number> | null;
}

// ============================================================
// Analytics
// ============================================================
export interface WeakPoint {
  fieldId: string;
  fieldName: string;
  subjectId: string;
  correctRate: number;
  attemptCount: number;
  recentTrend: number;
  weaknessScore: number;
  priority: WeaknessPriority;
}

export interface SubjectScore {
  subjectId: string;
  estimatedScore: number;
  correctRate: number;
  totalAnswered: number;
  targetScore: number;
}
