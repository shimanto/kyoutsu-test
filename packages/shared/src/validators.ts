import { z } from "zod";

export const loginSchema = z.object({
  idToken: z.string().min(1),
});

export const updateProfileSchema = z.object({
  displayName: z.string().min(1).max(100).optional(),
  targetBunrui: z.enum(["rika1", "rika2", "rika3"]).optional(),
  targetTotalScore: z.number().int().min(0).max(900).optional(),
  examYear: z.number().int().min(2025).max(2035).optional(),
});

export const updateTargetsSchema = z.object({
  targets: z.array(
    z.object({
      subjectId: z.string().min(1),
      targetScore: z.number().int().min(0).max(200),
    })
  ),
});

export const startSessionSchema = z.object({
  sessionType: z.enum(["drill", "review", "exam", "weakness"]),
  subjectId: z.string().optional(),
  fieldId: z.string().optional(),
  questionCount: z.number().int().min(1).max(100).default(10),
});

export const submitAnswerSchema = z.object({
  questionId: z.string().min(1),
  chosenChoiceId: z.string().optional(),
  numericAnswer: z.string().optional(),
  timeSpentMs: z.number().int().min(0).optional(),
});

export const recordReviewSchema = z.object({
  questionId: z.string().min(1),
  quality: z.number().int().min(0).max(5),
});

export const generatePlanSchema = z.object({
  weeklyStudyHours: z.number().min(1).max(80).default(20),
});

export const submitFeedbackSchema = z.object({
  category: z.enum(["general", "bug", "feature", "content", "ui"]).default("general"),
  rating: z.number().int().min(1).max(5),
  body: z.string().min(1).max(2000),
  pageUrl: z.string().max(500).optional(),
});
