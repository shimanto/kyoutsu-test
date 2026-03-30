"use client";

import { useState, useEffect, useCallback } from "react";

// デモデータ
const DEMO_QUESTIONS = [
  {
    id: "q1",
    body: "確率変数 X が二項分布 B(10, 0.3) に従うとき、E(X) の値を求めよ。",
    difficulty: 3,
    choices: [
      { id: "c1", label: "1", body: "2.1", isCorrect: false },
      { id: "c2", label: "2", body: "3.0", isCorrect: true },
      { id: "c3", label: "3", body: "3.3", isCorrect: false },
      { id: "c4", label: "4", body: "7.0", isCorrect: false },
    ],
    explanation: "二項分布 B(n, p) の期待値は E(X) = np = 10 × 0.3 = 3.0",
    fieldName: "データの分析",
    subjectName: "数学I・A",
  },
  {
    id: "q2",
    body: "次の英文の空所に入れるのに最も適当なものを選べ。\n\nThe researcher found that the results were (    ) with the previous study.",
    difficulty: 2,
    choices: [
      { id: "c5", label: "1", body: "consistent", isCorrect: true },
      { id: "c6", label: "2", body: "considerate", isCorrect: false },
      { id: "c7", label: "3", body: "considerable", isCorrect: false },
      { id: "c8", label: "4", body: "conscious", isCorrect: false },
    ],
    explanation: "consistent with 〜 で「〜と一致した」という意味。be consistent with は頻出表現。",
    fieldName: "第2問",
    subjectName: "英語R",
  },
  {
    id: "q3",
    body: "質量 2.0kg の物体が水平面上で 3.0m/s² の加速度で運動している。物体に働く合力の大きさは何 N か。",
    difficulty: 1,
    choices: [
      { id: "c9", label: "1", body: "1.5 N", isCorrect: false },
      { id: "c10", label: "2", body: "5.0 N", isCorrect: false },
      { id: "c11", label: "3", body: "6.0 N", isCorrect: true },
      { id: "c12", label: "4", body: "9.8 N", isCorrect: false },
    ],
    explanation: "運動方程式 F = ma = 2.0 × 3.0 = 6.0 N",
    fieldName: "力学",
    subjectName: "物理",
  },
];

type Phase = "question" | "result";
type SelfRating = "perfect" | "good" | "unsure" | "forgot";

export default function StudySessionPage() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [phase, setPhase] = useState<Phase>("question");
  const [selectedChoiceId, setSelectedChoiceId] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState(false);
  const [elapsedMs, setElapsedMs] = useState(0);
  const [results, setResults] = useState<{ correct: number; total: number }>({
    correct: 0,
    total: 0,
  });

  const question = DEMO_QUESTIONS[currentIndex];
  const totalQuestions = DEMO_QUESTIONS.length;

  // タイマー
  useEffect(() => {
    if (phase !== "question") return;
    setElapsedMs(0);
    const interval = setInterval(() => setElapsedMs((ms) => ms + 1000), 1000);
    return () => clearInterval(interval);
  }, [currentIndex, phase]);

  const formatTime = (ms: number) => {
    const s = Math.floor(ms / 1000);
    return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
  };

  const handleAnswer = useCallback(() => {
    if (!selectedChoiceId) return;
    const correct = question.choices.find((c) => c.id === selectedChoiceId)?.isCorrect || false;
    setIsCorrect(correct);
    setResults((prev) => ({
      correct: prev.correct + (correct ? 1 : 0),
      total: prev.total + 1,
    }));
    setPhase("result");
  }, [selectedChoiceId, question]);

  const handleRating = (rating: SelfRating) => {
    // TODO: SM-2レビュー記録をAPIに送信
    console.log("Rating:", rating, "Question:", question.id);
    handleNext();
  };

  const handleNext = () => {
    if (currentIndex < totalQuestions - 1) {
      setCurrentIndex((i) => i + 1);
      setSelectedChoiceId(null);
      setPhase("question");
    }
  };

  const difficultyStars = "★".repeat(question.difficulty) + "☆".repeat(5 - question.difficulty);

  return (
    <div className="min-h-screen p-4 md:p-8 max-w-2xl mx-auto pb-24">
      {/* ヘッダー */}
      <div className="flex items-center justify-between mb-4">
        <div className="text-sm text-gray-400">
          <span className="text-gray-300">{question.subjectName}</span>
          <span className="mx-1">›</span>
          <span>{question.fieldName}</span>
        </div>
        <div className="font-mono text-sm text-gray-400">{formatTime(elapsedMs)}</div>
      </div>

      {/* プログレス */}
      <div className="flex items-center gap-2 mb-6">
        <div className="flex-1 h-1.5 bg-gray-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-green-500 rounded-full transition-all"
            style={{ width: `${((currentIndex + (phase === "result" ? 1 : 0)) / totalQuestions) * 100}%` }}
          />
        </div>
        <span className="text-xs text-gray-500">
          {currentIndex + 1}/{totalQuestions}
        </span>
      </div>

      {/* 問題文 */}
      <div className="bg-gray-900 rounded-lg border border-gray-800 p-5 mb-4">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-xs text-yellow-500">{difficultyStars}</span>
          <span className="text-xs text-gray-600">難易度 {question.difficulty}</span>
        </div>
        <p className="text-base leading-relaxed whitespace-pre-wrap">{question.body}</p>
      </div>

      {/* 選択肢 */}
      <div className="space-y-2 mb-6">
        {question.choices.map((choice) => {
          let choiceStyle = "border-gray-700 bg-gray-900 hover:border-gray-500";

          if (phase === "result") {
            if (choice.isCorrect) {
              choiceStyle = "border-green-500 bg-green-500/10";
            } else if (choice.id === selectedChoiceId && !choice.isCorrect) {
              choiceStyle = "border-red-500 bg-red-500/10";
            } else {
              choiceStyle = "border-gray-800 bg-gray-900/50 opacity-50";
            }
          } else if (choice.id === selectedChoiceId) {
            choiceStyle = "border-blue-500 bg-blue-500/10";
          }

          return (
            <button
              key={choice.id}
              onClick={() => phase === "question" && setSelectedChoiceId(choice.id)}
              disabled={phase === "result"}
              className={`w-full text-left px-4 py-3 rounded-lg border transition-all ${choiceStyle}`}
            >
              <span className="inline-block w-6 text-gray-500">{choice.label}.</span>
              <span>{choice.body}</span>
            </button>
          );
        })}
      </div>

      {/* 回答ボタン or 結果表示 */}
      {phase === "question" ? (
        <button
          onClick={handleAnswer}
          disabled={!selectedChoiceId}
          className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-800 disabled:text-gray-600
                     rounded-lg font-medium transition-colors"
        >
          回答する
        </button>
      ) : (
        <div>
          {/* 正誤表示 */}
          <div
            className={`text-center py-3 rounded-lg mb-4 font-bold ${
              isCorrect ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"
            }`}
          >
            {isCorrect ? "正解！" : "不正解"}
          </div>

          {/* 解説 */}
          <div className="bg-gray-900 rounded-lg border border-gray-800 p-4 mb-4">
            <h3 className="text-sm font-bold text-gray-400 mb-2">解説</h3>
            <p className="text-sm leading-relaxed">{question.explanation}</p>
          </div>

          {/* 理解度入力 (SM-2 quality) */}
          <div className="mb-4">
            <p className="text-xs text-gray-500 mb-2 text-center">この問題の理解度は？</p>
            <div className="grid grid-cols-4 gap-2">
              {isCorrect ? (
                <>
                  <RatingButton label="完璧" color="green" onClick={() => handleRating("perfect")} />
                  <RatingButton label="まあまあ" color="blue" onClick={() => handleRating("good")} />
                  <RatingButton label="微妙" color="yellow" onClick={() => handleRating("unsure")} />
                  <RatingButton label="まぐれ" color="red" onClick={() => handleRating("forgot")} />
                </>
              ) : (
                <>
                  <RatingButton label="理解した" color="blue" onClick={() => handleRating("good")} />
                  <RatingButton label="なんとなく" color="yellow" onClick={() => handleRating("unsure")} />
                  <RatingButton label="全然" color="red" onClick={() => handleRating("forgot")} />
                  <button
                    onClick={handleNext}
                    className="py-2 rounded-lg text-sm border border-gray-700 hover:bg-gray-800 transition-colors"
                  >
                    スキップ
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* セッション成績 */}
      <div className="fixed bottom-0 left-0 right-0 bg-gray-900/90 backdrop-blur border-t border-gray-800 px-4 py-2
                       flex justify-center gap-6 text-xs text-gray-400">
        <span>正解: <span className="text-green-400 font-bold">{results.correct}</span></span>
        <span>不正解: <span className="text-red-400 font-bold">{results.total - results.correct}</span></span>
        <span>正答率: <span className="text-white font-bold">
          {results.total > 0 ? Math.round((results.correct / results.total) * 100) : 0}%
        </span></span>
      </div>
    </div>
  );
}

function RatingButton({ label, color, onClick }: {
  label: string; color: string; onClick: () => void;
}) {
  const colors: Record<string, string> = {
    green: "border-green-700 text-green-400 hover:bg-green-900/30",
    blue: "border-blue-700 text-blue-400 hover:bg-blue-900/30",
    yellow: "border-yellow-700 text-yellow-400 hover:bg-yellow-900/30",
    red: "border-red-700 text-red-400 hover:bg-red-900/30",
  };

  return (
    <button
      onClick={onClick}
      className={`py-2 rounded-lg text-sm border transition-colors ${colors[color]}`}
    >
      {label}
    </button>
  );
}
