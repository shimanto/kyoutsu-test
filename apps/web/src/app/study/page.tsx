"use client";

import { useEffect, useState } from "react";
import { SUBJECTS } from "@kyoutsu/shared";
import { apiGetDueCount } from "@/lib/api";

const SUBJECT_GROUPS = [
  { label: "国語", subjects: SUBJECTS.filter((s) => s.id === "kokugo") },
  { label: "数学", subjects: SUBJECTS.filter((s) => s.id.startsWith("math")) },
  { label: "英語", subjects: SUBJECTS.filter((s) => s.id.startsWith("eng")) },
  { label: "理科", subjects: SUBJECTS.filter((s) => ["physics", "chemistry"].includes(s.id)) },
  { label: "社会", subjects: SUBJECTS.filter((s) => s.id === "social") },
  { label: "情報", subjects: SUBJECTS.filter((s) => s.id === "info1") },
];

export default function StudySelectPage() {
  const [reviewCount, setReviewCount] = useState<number | null>(null);

  useEffect(() => {
    apiGetDueCount()
      .then((data) => setReviewCount(data.count))
      .catch(() => setReviewCount(0));
  }, []);

  return (
    <div className="min-h-screen p-4 md:p-8 max-w-3xl mx-auto">
      <h1 className="text-xl font-bold mb-6">学習セッション</h1>

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
              <h2 className="font-bold text-red-400">弱点ドリル</h2>
              <p className="text-sm text-gray-400 mt-1">
                正答率が低い分野を集中強化
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
                href={`/study/drill?subject=${group.subjects[0]?.id}`}
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
