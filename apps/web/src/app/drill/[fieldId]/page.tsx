"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  SAMPLE_FIELD_STATS,
  SAMPLE_QUESTIONS_BY_FIELD,
  SUBJECT_NAMES,
  type SampleQuestion,
} from "@/lib/sample-data";

type Phase = "question" | "result" | "complete";

export default function DrillPage() {
  const params = useParams();
  const router = useRouter();
  const fieldId = params.fieldId as string;

  // 分野情報
  const fieldStat = SAMPLE_FIELD_STATS.find((f) => f.fieldId === fieldId);
  const questions: SampleQuestion[] = SAMPLE_QUESTIONS_BY_FIELD[fieldId] || [];
  const subjectName = fieldStat ? SUBJECT_NAMES[fieldStat.subjectId] || "" : "";
  const fieldName = fieldStat?.fieldName || fieldId;
  const currentRate = fieldStat ? Math.round((fieldStat.correct / fieldStat.total) * 100) : 0;

  // 問題がない分野の場合
  if (questions.length === 0) {
    return (
      <div className="min-h-screen p-4 md:p-8 max-w-2xl mx-auto flex flex-col items-center justify-center gap-4">
        <div className="text-6xl">📝</div>
        <h1 className="text-xl font-bold">{subjectName} › {fieldName}</h1>
        <p className="text-gray-400 text-center">
          この分野のコンテンツは準備中です。<br />
          PDFやXMLでコンテンツを追加してください。
        </p>
        <div className="bg-gray-900 rounded-lg border border-gray-800 p-4 text-center">
          <div className="text-xs text-gray-500">現在の正答率</div>
          <div className="text-3xl font-mono font-bold mt-1" style={{ color: rateColor(currentRate) }}>
            {currentRate}%
          </div>
          <div className="text-xs text-gray-500 mt-1">
            ({fieldStat?.correct || 0}/{fieldStat?.total || 0} 問正解)
          </div>
        </div>
        <button
          onClick={() => router.push("/")}
          className="mt-4 px-6 py-2 border border-gray-700 rounded-lg hover:bg-gray-900 transition-colors"
        >
          マップに戻る
        </button>
      </div>
    );
  }

  return <DrillSession
    questions={questions}
    fieldName={fieldName}
    subjectName={subjectName}
    currentRate={currentRate}
    fieldStat={fieldStat}
    onBack={() => router.push("/")}
  />;
}

function DrillSession({
  questions, fieldName, subjectName, currentRate, fieldStat, onBack,
}: {
  questions: SampleQuestion[];
  fieldName: string;
  subjectName: string;
  currentRate: number;
  fieldStat: typeof SAMPLE_FIELD_STATS[number] | undefined;
  onBack: () => void;
}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [phase, setPhase] = useState<Phase>("question");
  const [selectedChoiceId, setSelectedChoiceId] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState(false);
  const [elapsedMs, setElapsedMs] = useState(0);
  const [results, setResults] = useState<{ correct: number; total: number }>({ correct: 0, total: 0 });

  const question = questions[currentIndex];
  const totalQuestions = questions.length;

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
    if (!selectedChoiceId || !question) return;
    const correct = question.choices.find((c) => c.id === selectedChoiceId)?.isCorrect || false;
    setIsCorrect(correct);
    setResults((prev) => ({
      correct: prev.correct + (correct ? 1 : 0),
      total: prev.total + 1,
    }));
    setPhase("result");
  }, [selectedChoiceId, question]);

  const handleNext = () => {
    if (currentIndex < totalQuestions - 1) {
      setCurrentIndex((i) => i + 1);
      setSelectedChoiceId(null);
      setPhase("question");
    } else {
      setPhase("complete");
    }
  };

  // 完了画面
  if (phase === "complete") {
    const sessionRate = results.total > 0 ? Math.round((results.correct / results.total) * 100) : 0;
    return (
      <div className="min-h-screen p-4 md:p-8 max-w-2xl mx-auto flex flex-col items-center justify-center gap-6">
        <div className="text-5xl">{sessionRate >= 80 ? "🎉" : sessionRate >= 60 ? "💪" : "📚"}</div>
        <h1 className="text-xl font-bold">{subjectName} › {fieldName}</h1>
        <p className="text-gray-400">ドリル完了！</p>

        <div className="grid grid-cols-3 gap-4 w-full max-w-sm">
          <div className="bg-gray-900 rounded-lg border border-gray-800 p-4 text-center">
            <div className="text-xs text-gray-500">正解</div>
            <div className="text-2xl font-mono font-bold text-green-400">{results.correct}</div>
          </div>
          <div className="bg-gray-900 rounded-lg border border-gray-800 p-4 text-center">
            <div className="text-xs text-gray-500">不正解</div>
            <div className="text-2xl font-mono font-bold text-red-400">{results.total - results.correct}</div>
          </div>
          <div className="bg-gray-900 rounded-lg border border-gray-800 p-4 text-center">
            <div className="text-xs text-gray-500">正答率</div>
            <div className="text-2xl font-mono font-bold" style={{ color: rateColor(sessionRate) }}>
              {sessionRate}%
            </div>
          </div>
        </div>

        {/* Before → After */}
        <div className="bg-gray-900 rounded-lg border border-gray-800 p-4 w-full max-w-sm">
          <div className="text-xs text-gray-500 mb-2 text-center">この分野の正答率推移</div>
          <div className="flex items-center justify-center gap-4">
            <div className="text-center">
              <div className="text-xs text-gray-600">Before</div>
              <div className="text-xl font-mono font-bold" style={{ color: rateColor(currentRate) }}>
                {currentRate}%
              </div>
            </div>
            <span className="text-gray-600 text-lg">→</span>
            <div className="text-center">
              <div className="text-xs text-gray-600">After (推定)</div>
              <div className="text-xl font-mono font-bold" style={{ color: rateColor(estimateNewRate(fieldStat, results)) }}>
                {estimateNewRate(fieldStat, results)}%
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-3 w-full max-w-sm">
          <button
            onClick={() => {
              setCurrentIndex(0);
              setSelectedChoiceId(null);
              setResults({ correct: 0, total: 0 });
              setPhase("question");
            }}
            className="flex-1 py-3 border border-gray-700 rounded-lg hover:bg-gray-900 transition-colors text-sm"
          >
            もう一度
          </button>
          <button
            onClick={onBack}
            className="flex-1 py-3 bg-green-600 hover:bg-green-700 rounded-lg font-medium transition-colors text-sm"
          >
            マップに戻る
          </button>
        </div>
      </div>
    );
  }

  if (!question) return null;

  const difficultyStars = "★".repeat(question.difficulty) + "☆".repeat(5 - question.difficulty);

  return (
    <div className="min-h-screen p-4 md:p-8 max-w-2xl mx-auto pb-24">
      {/* ヘッダー */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <button onClick={onBack} className="text-gray-500 hover:text-gray-300 text-sm mr-2">← 戻る</button>
          <span className="text-sm text-gray-300">{subjectName}</span>
          <span className="text-gray-600 mx-1">›</span>
          <span className="text-sm text-white font-medium">{fieldName}</span>
        </div>
        <div className="font-mono text-sm text-gray-400">{formatTime(elapsedMs)}</div>
      </div>

      {/* 分野の現在正答率 */}
      <div className="flex items-center gap-3 mb-4 px-3 py-2 bg-gray-900/50 rounded-lg border border-gray-800/50">
        <span className="text-xs text-gray-500">現在の正答率</span>
        <div className="flex-1 h-2 bg-gray-800 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all"
            style={{
              width: `${currentRate}%`,
              backgroundColor: rateColor(currentRate),
            }}
          />
        </div>
        <span className="text-xs font-mono font-bold" style={{ color: rateColor(currentRate) }}>
          {currentRate}%
        </span>
      </div>

      {/* プログレス */}
      <div className="flex items-center gap-2 mb-6">
        <div className="flex-1 h-1.5 bg-gray-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-green-500 rounded-full transition-all"
            style={{ width: `${((currentIndex + (phase === "result" ? 1 : 0)) / totalQuestions) * 100}%` }}
          />
        </div>
        <span className="text-xs text-gray-500">{currentIndex + 1}/{totalQuestions}</span>
      </div>

      {/* 問題文 */}
      <div className="bg-gray-900 rounded-lg border border-gray-800 p-5 mb-4">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-xs text-yellow-500">{difficultyStars}</span>
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

      {/* 回答ボタン or 結果 */}
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
          <div className={`text-center py-3 rounded-lg mb-4 font-bold ${
            isCorrect ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"
          }`}>
            {isCorrect ? "正解！" : "不正解"}
          </div>

          <div className="bg-gray-900 rounded-lg border border-gray-800 p-4 mb-4">
            <h3 className="text-sm font-bold text-gray-400 mb-2">解説</h3>
            <p className="text-sm leading-relaxed">{question.explanation}</p>
          </div>

          <div className="mb-4">
            <p className="text-xs text-gray-500 mb-2 text-center">理解度は？</p>
            <div className="grid grid-cols-4 gap-2">
              {isCorrect ? (
                <>
                  <RatingButton label="完璧" color="green" onClick={handleNext} />
                  <RatingButton label="まあまあ" color="blue" onClick={handleNext} />
                  <RatingButton label="微妙" color="yellow" onClick={handleNext} />
                  <RatingButton label="まぐれ" color="red" onClick={handleNext} />
                </>
              ) : (
                <>
                  <RatingButton label="理解した" color="blue" onClick={handleNext} />
                  <RatingButton label="なんとなく" color="yellow" onClick={handleNext} />
                  <RatingButton label="全然" color="red" onClick={handleNext} />
                  <button onClick={handleNext} className="py-2 rounded-lg text-sm border border-gray-700 hover:bg-gray-800">
                    スキップ
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* セッション成績バー */}
      <div className="fixed bottom-0 left-0 right-0 bg-gray-900/95 backdrop-blur border-t border-gray-800 px-4 py-2
                       flex justify-center gap-6 text-xs text-gray-400 z-50">
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
    <button onClick={onClick} className={`py-2 rounded-lg text-sm border transition-colors ${colors[color]}`}>
      {label}
    </button>
  );
}

function rateColor(rate: number): string {
  if (rate >= 80) return "#22c55e";
  if (rate >= 65) return "#eab308";
  if (rate >= 50) return "#f97316";
  return "#ef4444";
}

function estimateNewRate(
  fieldStat: typeof SAMPLE_FIELD_STATS[number] | undefined,
  results: { correct: number; total: number }
): number {
  if (!fieldStat) return 0;
  const newTotal = fieldStat.total + results.total;
  const newCorrect = fieldStat.correct + results.correct;
  return Math.round((newCorrect / newTotal) * 100);
}
