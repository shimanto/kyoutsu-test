/**
 * API Client — kyoutsu-api Workers に接続
 */

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "https://kyoutsu-api.miyata-d23.workers.dev";

function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("kyoutsu_token");
}

async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string> || {}),
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });

  if (res.status === 401) {
    // トークン無効 → ログアウト
    localStorage.removeItem("kyoutsu_token");
    localStorage.removeItem("kyoutsu_auth");
    if (typeof window !== "undefined") window.location.href = "/login";
    throw new Error("Unauthorized");
  }

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error((body as { error?: string }).error || `API error ${res.status}`);
  }

  return res.json() as Promise<T>;
}

// ─── Auth ───
export async function apiDemoLogin(displayName: string) {
  return apiFetch<{ token: string; userId: string; displayName: string }>(
    "/auth/demo-login",
    { method: "POST", body: JSON.stringify({ displayName }) }
  );
}

// ─── Users ───
export async function apiGetMe() {
  return apiFetch<{
    user: {
      id: string; display_name: string; picture_url: string | null;
      target_bunrui: string; target_total_score: number; exam_year: number;
    };
    targets: { subject_id: string; target_score: number }[];
  }>("/users/me");
}

export async function apiUpdateProfile(data: {
  displayName?: string; targetBunrui?: string; targetTotalScore?: number; examYear?: number;
}) {
  return apiFetch<{ ok: boolean }>("/users/me", { method: "PUT", body: JSON.stringify(data) });
}

export async function apiUpdateTargets(targets: { subjectId: string; targetScore: number }[]) {
  return apiFetch<{ ok: boolean }>("/users/me/targets", { method: "PUT", body: JSON.stringify({ targets }) });
}

// ─── Subjects ───
export async function apiGetSubjects() {
  return apiFetch<{
    subjects: { id: string; name: string; max_score: number; display_order: number }[];
  }>("/subjects");
}

export async function apiGetSubjectDetail(id: string) {
  return apiFetch<{
    subject: { id: string; name: string; max_score: number };
    fields: { id: string; name: string; display_order: number }[];
  }>(`/subjects/${id}`);
}

// ─── Study Sessions ───
export async function apiStartSession(data: {
  sessionType: string; subjectId?: string; fieldId?: string; questionCount?: number;
}) {
  return apiFetch<{ sessionId: string; questions: unknown[] }>(
    "/study-sessions",
    { method: "POST", body: JSON.stringify(data) }
  );
}

export async function apiSubmitAnswer(sessionId: string, data: {
  questionId: string; chosenChoiceId?: string; numericAnswer?: string; timeSpentMs?: number;
}) {
  return apiFetch<{
    answerId: string; isCorrect: boolean; explanation: string | null; correctChoice: unknown;
  }>(`/study-sessions/${sessionId}/answer`, { method: "POST", body: JSON.stringify(data) });
}

export async function apiFinishSession(sessionId: string) {
  return apiFetch<{ session: unknown }>(`/study-sessions/${sessionId}/finish`, { method: "POST" });
}

// ─── Reviews ───
export async function apiGetDueReviews() {
  return apiFetch<{ reviews: unknown[] }>("/reviews/due");
}

export async function apiGetDueCount() {
  return apiFetch<{ count: number }>("/reviews/due/count");
}

export async function apiRecordReview(data: { questionId: string; quality: number }) {
  return apiFetch<{ nextReviewDate: string; interval: number; easeFactor: number }>(
    "/reviews/record",
    { method: "POST", body: JSON.stringify(data) }
  );
}

// ─── Analytics ───
export async function apiGetOverview() {
  return apiFetch<{
    subjectStats: { subject_id: string; total: number; correct: number }[];
    fieldStats: { field_id: string; field_name: string; subject_id: string; total: number; correct: number }[];
    targets: { subject_id: string; target_score: number }[];
  }>("/analytics/overview");
}

export async function apiGetHistory() {
  return apiFetch<{
    dailyHistory: unknown[];
    examHistory: unknown[];
  }>("/analytics/history");
}

// ─── Setup (テストデータ生成) ───
export async function apiGenerateTestData(data: {
  deviation: number;
  targetBunrui?: string;
  targetTotal?: number;
  examYear?: number;
}) {
  return apiFetch<{
    deviation: number;
    estimatedTotal: number;
    subjectScores: { subjectId: string; rate: number; estimatedScore: number }[];
    answersGenerated: number;
    message: string;
  }>("/setup/generate-test-data", { method: "POST", body: JSON.stringify(data) });
}

// ─── Plans ───
export async function apiGeneratePlan(weeklyStudyHours: number = 20) {
  return apiFetch<{
    planId: string;
    phase: string;
    totalDays: number;
    subjectAllocations: { subjectId: string; weeklyHours: number; priority: number }[];
    taskCount: number;
  }>("/plans/generate", { method: "POST", body: JSON.stringify({ weeklyStudyHours }) });
}

export async function apiGetCurrentPlan() {
  return apiFetch<{ plan: unknown; tasks: unknown[] }>("/plans/current");
}

export async function apiGetTodayTasks() {
  return apiFetch<{ tasks: unknown[] }>("/plans/current/today");
}

// ─── Content Tree ───
export async function apiGetContentTree() {
  return apiFetch<{
    subjects: { id: string; name: string; max_score: number; display_order: number }[];
    fields: { id: string; subject_id: string; name: string; display_order: number }[];
    units: { id: string; field_id: string; name: string; display_order: number }[];
    questionCounts: { unit_id: string; count: number }[];
  }>("/admin/content-tree");
}

// ─── Subject Detail (分野+回答統計) ───
export async function apiGetSubjectAnalysis(subjectId: string) {
  return apiFetch<{
    fieldStats: { field_id: string; field_name: string; total: number; correct: number; avg_time_ms: number }[];
    difficultyStats: { difficulty: number; total: number; correct: number }[];
  }>(`/analytics/subject/${subjectId}`);
}

// ─── Questions (DB問題取得) ───
export async function apiGetQuestions(params: { fieldId?: string; subjectId?: string; limit?: number }) {
  const q = new URLSearchParams();
  if (params.fieldId) q.set("fieldId", params.fieldId);
  if (params.subjectId) q.set("subjectId", params.subjectId);
  if (params.limit) q.set("limit", String(params.limit));
  return apiFetch<{ questions: { id: string; body: string; difficulty: number; points: number; explanation: string }[] }>(
    `/questions?${q.toString()}`
  );
}

export async function apiGetQuestion(id: string) {
  return apiFetch<{
    question: { id: string; body: string; difficulty: number; explanation: string };
    choices: { id: string; label: string; body: string; is_correct: number; display_order: number }[];
  }>(`/questions/${id}`);
}
