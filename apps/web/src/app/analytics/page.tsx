"use client";

import { SUBJECTS } from "@kyoutsu/shared";

// デモデータ: 月別スコア推移
const DEMO_HISTORY = [
  { month: "2026/07", total: 520, kokugo: 120, math1a: 55, math2bc: 50, eng_read: 60, eng_listen: 55, physics: 55, chemistry: 50, social: 45, info1: 30 },
  { month: "2026/08", total: 580, kokugo: 130, math1a: 62, math2bc: 55, eng_read: 65, eng_listen: 58, physics: 60, chemistry: 55, social: 55, info1: 40 },
  { month: "2026/09", total: 620, kokugo: 140, math1a: 68, math2bc: 60, eng_read: 70, eng_listen: 62, physics: 62, chemistry: 58, social: 58, info1: 42 },
  { month: "2026/10", total: 650, kokugo: 145, math1a: 72, math2bc: 65, eng_read: 72, eng_listen: 65, physics: 65, chemistry: 60, social: 62, info1: 44 },
  { month: "2026/11", total: 682, kokugo: 155, math1a: 75, math2bc: 68, eng_read: 75, eng_listen: 68, physics: 68, chemistry: 62, social: 65, info1: 46 },
];

export default function AnalyticsPage() {
  const latest = DEMO_HISTORY[DEMO_HISTORY.length - 1];
  const prev = DEMO_HISTORY[DEMO_HISTORY.length - 2];

  return (
    <div className="min-h-screen p-4 md:p-8 max-w-4xl mx-auto">
      <h1 className="text-xl font-bold mb-6">詳細分析</h1>

      {/* スコア推移 (簡易テキストグラフ) */}
      <div className="bg-gray-900 rounded-lg border border-gray-800 p-4 mb-6">
        <h2 className="font-bold text-sm mb-4">合計スコア推移</h2>
        <div className="space-y-2">
          {DEMO_HISTORY.map((h) => (
            <div key={h.month} className="flex items-center gap-3">
              <span className="text-xs text-gray-500 w-16 shrink-0">{h.month}</span>
              <div className="flex-1 h-5 bg-gray-800 rounded-full overflow-hidden relative">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-blue-600 to-blue-400 transition-all"
                  style={{ width: `${(h.total / 900) * 100}%` }}
                />
                {/* 目標ライン */}
                <div
                  className="absolute top-0 h-full border-l border-dashed border-green-500/50"
                  style={{ left: `${(780 / 900) * 100}%` }}
                />
              </div>
              <span className="text-sm font-mono w-12 text-right">{h.total}</span>
            </div>
          ))}
        </div>
      </div>

      {/* 科目別比較 */}
      <div className="bg-gray-900 rounded-lg border border-gray-800 p-4 mb-6">
        <h2 className="font-bold text-sm mb-4">科目別スコア (最新)</h2>
        <div className="space-y-3">
          {SUBJECTS.map((subject) => {
            const score = (latest as Record<string, unknown>)[subject.id] as number | undefined;
            const prevScore = (prev as Record<string, unknown>)[subject.id] as number | undefined;
            if (score === undefined) return null;

            const rate = score / subject.maxScore;
            const diff = prevScore !== undefined ? score - prevScore : 0;
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
                <span
                  className={`text-xs w-10 text-right ${
                    diff > 0 ? "text-green-400" : diff < 0 ? "text-red-400" : "text-gray-600"
                  }`}
                >
                  {diff > 0 ? `+${diff}` : diff === 0 ? "±0" : diff}
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
            <div className="text-2xl font-mono font-bold text-white">{latest.total}</div>
            <div className="text-xs text-gray-500">現在</div>
          </div>
          <div>
            <div className="text-2xl font-mono font-bold text-green-400">780</div>
            <div className="text-xs text-gray-500">目標</div>
          </div>
          <div>
            <div className="text-2xl font-mono font-bold text-red-400">
              +{780 - latest.total}
            </div>
            <div className="text-xs text-gray-500">残り</div>
          </div>
        </div>
      </div>
    </div>
  );
}
