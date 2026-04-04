"use client";

import { useEffect, useState } from "react";
import { SUBJECTS, CATCHCOPY, PAGE_META, getStageCopy } from "@kyoutsu/shared";
import { apiGetDueCount, apiGetOverview } from "@/lib/api";

const SUBJECT_GROUPS = [
  { label: "国語", groupId: "kokugo", subjects: SUBJECTS.filter((s) => s.id === "kokugo") },
  { label: "数学", groupId: "math", subjects: SUBJECTS.filter((s) => s.id.startsWith("math")) },
  { label: "英語", groupId: "english", subjects: SUBJECTS.filter((s) => s.id.startsWith("eng")) },
  { label: "理科", groupId: "science", subjects: SUBJECTS.filter((s) => ["physics", "chemistry"].includes(s.id)) },
  { label: "社会", groupId: "social", subjects: SUBJECTS.filter((s) => s.id === "social") },
  { label: "情報", groupId: "info", subjects: SUBJECTS.filter((s) => s.id === "info1") },
];

export default function StudySelectPage() {
  const [reviewCount, setReviewCount] = useState<number | null>(null);
  const [overallRate, setOverallRate] = useState<number | null>(null);

  useEffect(() => {
    Promise.all([
      apiGetDueCount().catch(() => ({ count: 0 })),
      apiGetOverview().catch(() => null),
    ]).then(([rc, ov]) => {
      setReviewCount(rc?.count || 0);
      if (ov?.subjectStats) {
        const total = ov.subjectStats.reduce((s: number, x: { total: number }) => s + x.total, 0);
        const correct = ov.subjectStats.reduce((s: number, x: { correct: number }) => s + x.correct, 0);
        setOverallRate(total > 0 ? correct / total : 0);
      }
    });
  }, []);

  const stage = overallRate !== null ? getStageCopy(overallRate) : null;

  return (
    <div className="min-h-screen p-4 md:p-8 max-w-3xl mx-auto">
      <h1 className="text-xl font-bold mb-1">{PAGE_META.STUDY.title}</h1>
      {stage ? (
        <>
          <p className="text-xs text-green-400 font-medium mb-1">{stage.headline}</p>
          <p className="text-[10px] text-gray-600 mb-2">{stage.sub}</p>
          <p className="text-[10px] text-gray-500 italic mb-6">{stage.encouragement}</p>
        </>
      ) : (
        <>
          <p className="text-xs text-gray-500 mb-1">{CATCHCOPY.REVIEW.headline}</p>
          <p className="text-[10px] text-gray-600 mb-6">{CATCHCOPY.REVIEW.sub}</p>
        </>
      )}

      <div className="space-y-6">
        {/* 復習セッション */}
        <a
          href="/study/review"
          className="block p-4 bg-amber-900/20 border border-amber-700/30 rounded-lg
                     hover:bg-amber-900/30 transition-colors"
        >
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-bold text-amber-400">復習セッション</h2>
              <p className="text-sm text-gray-400 mt-1">
                忘却曲線に基づく今日の復習対象
              </p>
            </div>
            <span className="text-2xl font-mono font-bold text-amber-400">
              {reviewCount !== null ? `${reviewCount}問` : "..."}
            </span>
          </div>
        </a>

        {/* 弱点ドリル */}
        <a
          href="/study/weakness"
          className="block p-4 bg-red-900/20 border border-red-700/30 rounded-lg
                     hover:bg-red-900/30 transition-colors"
        >
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-bold text-red-400">{CATCHCOPY.WEAKNESS.headline}</h2>
              <p className="text-sm text-gray-400 mt-1">
                {CATCHCOPY.WEAKNESS.sub}
              </p>
            </div>
            <span className="text-sm text-red-400">AUTO</span>
          </div>
        </a>

        {/* 科目別ドリル */}
        <div>
          <h2 className="text-sm text-gray-500 mb-3">科目別ドリル</h2>
          <div className="grid grid-cols-2 gap-3">
            {SUBJECT_GROUPS.map((group) => (
              <a
                key={group.label}
                href={`/subject/${group.groupId}`}
                className="p-3 bg-gray-900 border border-gray-800 rounded-lg
                           hover:border-gray-600 transition-colors"
              >
                <div className="font-medium text-sm">{group.label}</div>
                <div className="text-xs text-gray-500 mt-1">
                  {group.subjects.map((s) => s.shortName).join(" / ")}
                </div>
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
