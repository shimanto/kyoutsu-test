"use client";

import { useState } from "react";
import { SUBJECTS, TODAI_RIKA_CUTOFF_ESTIMATE } from "@kyoutsu/shared";

// 大学プリセット
const UNIVERSITY_PRESETS = [
  { id: "todai_rika1", name: "東京大学 理科一類", targetTotal: 780, bunrui: "rika1" },
  { id: "todai_rika2", name: "東京大学 理科二類", targetTotal: 770, bunrui: "rika2" },
  { id: "todai_rika3", name: "東京大学 理科三類", targetTotal: 830, bunrui: "rika3" },
  { id: "custom", name: "その他の大学", targetTotal: 700, bunrui: "custom" },
];

type UniversityPreset = (typeof UNIVERSITY_PRESETS)[number];

interface MockExamScore {
  subjectId: string;
  score: number;
}

export default function OnboardingPage() {
  const [step, setStep] = useState(1);
  const [selectedUniv, setSelectedUniv] = useState(UNIVERSITY_PRESETS[0]);
  const [examDate, setExamDate] = useState("");
  const [examName, setExamName] = useState("");
  const [scores, setScores] = useState<MockExamScore[]>(
    SUBJECTS.map((s) => ({ subjectId: s.id, score: 0 }))
  );

  const totalScore = scores.reduce((sum, s) => sum + s.score, 0);
  const totalMax = SUBJECTS.reduce((sum, s) => sum + s.maxScore, 0);

  const handleScoreChange = (subjectId: string, value: string) => {
    const subject = SUBJECTS.find((s) => s.id === subjectId);
    const num = Math.min(Number(value) || 0, subject?.maxScore || 100);
    setScores((prev) =>
      prev.map((s) => (s.subjectId === subjectId ? { ...s, score: num } : s))
    );
  };

  const handleSubmit = () => {
    // TODO: API連携 - 模試スコア保存 → ダッシュボードへ遷移
    const data = {
      university: selectedUniv,
      examDate,
      examName,
      scores,
      totalScore,
    };
    console.log("Onboarding data:", data);
    // router.push("/dashboard");
    window.location.href = "/";
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        {/* プログレス */}
        <div className="flex gap-2 mb-8">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={`h-1.5 flex-1 rounded-full ${
                s <= step ? "bg-green-500" : "bg-gray-800"
              }`}
            />
          ))}
        </div>

        {/* Step 1: 志望大学選択 */}
        {step === 1 && (
          <div>
            <h1 className="text-2xl font-bold mb-2">志望大学を選択</h1>
            <p className="text-gray-400 text-sm mb-6">
              目標点数と学習計画の基準になります
            </p>
            <div className="space-y-3">
              {UNIVERSITY_PRESETS.map((univ) => (
                <button
                  key={univ.id}
                  onClick={() => setSelectedUniv(univ)}
                  className={`w-full text-left px-4 py-3 rounded-lg border transition-all ${
                    selectedUniv.id === univ.id
                      ? "border-green-500 bg-green-500/10"
                      : "border-gray-700 bg-gray-900 hover:border-gray-600"
                  }`}
                >
                  <div className="font-medium">{univ.name}</div>
                  <div className="text-sm text-gray-400">
                    目標: {univ.targetTotal} / {totalMax}
                  </div>
                </button>
              ))}
            </div>
            <button
              onClick={() => setStep(2)}
              className="w-full mt-6 py-3 bg-green-600 hover:bg-green-700 rounded-lg font-medium transition-colors"
            >
              次へ
            </button>
          </div>
        )}

        {/* Step 2: 模試情報 */}
        {step === 2 && (
          <div>
            <h1 className="text-2xl font-bold mb-2">直近の模試情報</h1>
            <p className="text-gray-400 text-sm mb-6">
              現在の実力を把握するため、直近の模試結果を入力してください
            </p>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">模試名</label>
                <input
                  type="text"
                  value={examName}
                  onChange={(e) => setExamName(e.target.value)}
                  placeholder="例: 第3回全統共通テスト模試"
                  className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg
                             focus:border-green-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">実施日</label>
                <input
                  type="date"
                  value={examDate}
                  onChange={(e) => setExamDate(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg
                             focus:border-green-500 focus:outline-none"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setStep(1)}
                className="flex-1 py-3 border border-gray-700 rounded-lg hover:bg-gray-900 transition-colors"
              >
                戻る
              </button>
              <button
                onClick={() => setStep(3)}
                className="flex-1 py-3 bg-green-600 hover:bg-green-700 rounded-lg font-medium transition-colors"
              >
                次へ
              </button>
            </div>
          </div>
        )}

        {/* Step 3: 科目別スコア入力 */}
        {step === 3 && (
          <div>
            <h1 className="text-2xl font-bold mb-2">科目別スコア入力</h1>
            <p className="text-gray-400 text-sm mb-6">
              各科目の得点を入力してください
            </p>

            <div className="space-y-3">
              {SUBJECTS.map((subject) => {
                const score = scores.find((s) => s.subjectId === subject.id)?.score || 0;
                const rate = score / subject.maxScore;
                const barColor =
                  rate >= 0.8 ? "bg-green-500" : rate >= 0.6 ? "bg-yellow-500" : "bg-red-500";

                return (
                  <div key={subject.id} className="flex items-center gap-3">
                    <div className="w-20 text-sm text-gray-300 shrink-0">
                      {subject.shortName}
                    </div>
                    <div className="flex-1 relative">
                      <div className="h-8 bg-gray-800 rounded-lg overflow-hidden">
                        <div
                          className={`h-full ${barColor} transition-all duration-300 rounded-lg`}
                          style={{ width: `${rate * 100}%` }}
                        />
                      </div>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <input
                        type="number"
                        min={0}
                        max={subject.maxScore}
                        value={score || ""}
                        onChange={(e) => handleScoreChange(subject.id, e.target.value)}
                        className="w-16 px-2 py-1 bg-gray-900 border border-gray-700 rounded text-center
                                   focus:border-green-500 focus:outline-none text-sm"
                      />
                      <span className="text-xs text-gray-500">/ {subject.maxScore}</span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* 合計 */}
            <div className="mt-6 p-4 bg-gray-900 rounded-lg border border-gray-700">
              <div className="flex justify-between items-center">
                <span className="text-gray-400">合計</span>
                <span className="text-2xl font-mono font-bold">
                  <span
                    className={
                      totalScore >= selectedUniv.targetTotal
                        ? "text-green-400"
                        : totalScore >= TODAI_RIKA_CUTOFF_ESTIMATE
                        ? "text-yellow-400"
                        : "text-red-400"
                    }
                  >
                    {totalScore}
                  </span>
                  <span className="text-gray-500 text-lg"> / {totalMax}</span>
                </span>
              </div>
              <div className="mt-2 text-xs text-gray-500">
                目標 {selectedUniv.targetTotal} まであと{" "}
                <span className="text-white font-bold">
                  {Math.max(0, selectedUniv.targetTotal - totalScore)}点
                </span>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setStep(2)}
                className="flex-1 py-3 border border-gray-700 rounded-lg hover:bg-gray-900 transition-colors"
              >
                戻る
              </button>
              <button
                onClick={handleSubmit}
                className="flex-1 py-3 bg-green-600 hover:bg-green-700 rounded-lg font-medium transition-colors"
              >
                学習を開始する
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
