"use client";

import { useState, useEffect } from "react";
import { SUBJECTS } from "@kyoutsu/shared";
import { apiGetOverview, apiGetHistory } from "@/lib/api";
import { getAuthUser } from "@/lib/auth";

interface SubjectScore {
  subjectId: string;
  score: number;
  maxScore: number;
}

interface ExamEntry {
  date: string;
  total: number;
  title: string;
}

export default function AnalyticsPage() {
  const authUser = getAuthUser();
  const targetTotal = authUser?.targetTotal || 780;

  const [subjectScores, setSubjectScores] = useState<SubjectScore[]>([]);
  const [currentTotal, setCurrentTotal] = useState(0);
  const [examHistory, setExamHistory] = useState<ExamEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [overview, history] = await Promise.all([
          apiGetOverview(),
          apiGetHistory(),
        ]);

        // 科目別スコア算出
        const subjectMap = new Map<string, { total: number; correct: number }>();
        for (const s of overview.subjectStats) {
          subjectMap.set(s.subject_id, { total: s.total, correct: s.correct });
        }

        const scores: SubjectScore[] = [];
        let total = 0;
        for (const subj of SUBJECTS) {
          const s = subjectMap.get(subj.id);
          const score = s && s.total > 0
            ? Math.round((s.correct / s.total) * subj.maxScore)
            : 0;
          scores.push({ subjectId: subj.id, score, maxScore: subj.maxScore });
          total += score;
        }
        setSubjectScores(scores);
        setCurrentTotal(total);

        // 模試履歴
        const exams: ExamEntry[] = (history.examHistory as Record<string, unknown>[]).map((e) => ({
          date: (e.finished_at as string || "").slice(0, 10),
          total: e.total_score as number,
          title: e.title as string,
        }));
        setExamHistory(exams);
      } catch (e) {
        console.error("Analytics load error:", e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-400 animate-pulse">読み込み中...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 md:p-8 max-w-4xl mx-auto">
      <h1 className="text-xl font-bold mb-6">詳細分析</h1>

      {/* 模試スコア推移 */}
      {examHistory.length > 0 && (
        <div className="bg-gray-900 rounded-lg border border-gray-800 p-4 mb-6">
          <h2 className="font-bold text-sm mb-4">模試スコア推移</h2>
          <div className="space-y-2">
            {examHistory.map((h, i) => (
              <div key={i} className="flex items-center gap-3">
                <span className="text-xs text-gray-500 w-20 shrink-0">{h.date}</span>
                <div className="flex-1 h-5 bg-gray-800 rounded-full overflow-hidden relative">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-blue-600 to-blue-400 transition-all"
                    style={{ width: `${(h.total / 900) * 100}%` }}
                  />
                  <div
                    className="absolute top-0 h-full border-l border-dashed border-green-500/50"
                    style={{ left: `${(targetTotal / 900) * 100}%` }}
                  />
                </div>
                <span className="text-sm font-mono w-12 text-right">{h.total}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 科目別比較 */}
      <div className="bg-gray-900 rounded-lg border border-gray-800 p-4 mb-6">
        <h2 className="font-bold text-sm mb-4">科目別スコア (推定)</h2>
        <div className="space-y-3">
          {SUBJECTS.map((subject) => {
            const data = subjectScores.find((s) => s.subjectId === subject.id);
            const score = data?.score || 0;
            const rate = score / subject.maxScore;
            const barColor =
              rate >= 0.8 ? "bg-green-500" : rate >= 0.65 ? "bg-yellow-500" : "bg-red-500";

            return (
              <div key={subject.id} className="flex items-center gap-3">
                <span className="text-xs text-gray-400 w-10 shrink-0">{subject.shortName}</span>
                <div className="flex-1 h-4 bg-gray-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${barColor} transition-all`}
                    style={{ width: `${rate * 100}%` }}
                  />
                </div>
                <span className="text-sm font-mono w-14 text-right">
                  {score}/{subject.maxScore}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* 目標との差分 */}
      <div className="bg-gray-900 rounded-lg border border-gray-800 p-4">
        <h2 className="font-bold text-sm mb-4">目標達成に必要な得点アップ</h2>
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-2xl font-mono font-bold text-white">{currentTotal}</div>
            <div className="text-xs text-gray-500">現在 (推定)</div>
          </div>
          <div>
            <div className="text-2xl font-mono font-bold text-green-400">{targetTotal}</div>
            <div className="text-xs text-gray-500">目標</div>
          </div>
          <div>
            <div className={`text-2xl font-mono font-bold ${currentTotal >= targetTotal ? "text-green-400" : "text-red-400"}`}>
              {currentTotal >= targetTotal ? "達成!" : `+${targetTotal - currentTotal}`}
            </div>
            <div className="text-xs text-gray-500">
              {currentTotal >= targetTotal ? "目標到達" : "残り"}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
