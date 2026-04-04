"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  apiStartSession,
  apiSubmitAnswer,
  apiFinishSession,
  apiRecordReview,
  apiGetQuestion,
} from "@/lib/api";

type SelfRating = "perfect" | "good" | "unsure" | "forgot";

interface Choice {
  id: string;
  label: string;
  body: string;
  is_correct: number;
}

interface Question {
  id: string;
  body: string;
  difficulty: number;
  explanation: string | null;
  fieldName?: string;
  subjectName?: string;
  choices: Choice[];
}

const RATING_TO_QUALITY: Record<SelfRating, number> = {
  perfect: 5,
  good: 4,
  unsure: 2,
  forgot: 1,
};

export default function StudySessionPage() {
  const params = useParams();
  const router = useRouter();
  const sessionId = params.sessionId as string;

  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [phase, setPhase] = useState<"loading" | "question" | "result" | "finished">("loading");
  const [selectedChoiceId, setSelectedChoiceId] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState(false);
  const [explanation, setExplanation] = useState<string | null>(null);
  const [elapsedMs, setElapsedMs] = useState(0);
  const [results, setResults] = useState<{ correct: number; total: number }>({
    correct: 0,
    total: 0,
  });

  // セッションの問題一覧を取得
  useEffect(() => {
    async function loadSession() {
      try {
        // sessionId が "new-drill" の場合はドリルセッション開始
        // それ以外は既存セッションの問題を取得
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL || "https://kyoutsu-api.miyata-d23.workers.dev"}/study-sessions/${sessionId}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("kyoutsu_token")}`,
            },
          }
        );

        if (!res.ok) throw new Error("Session load failed");

        const data = await res.json() as { session: Record<string, unknown>; questions?: Record<string, unknown>[] };

        // セッションに紐づく問題を取得 (問題IDリストから選択肢も含めて取得)
        if (data.questions && data.questions.length > 0) {
          const loaded: Question[] = [];
          for (const q of data.questions) {
            try {
              const detail = await apiGetQuestion(q.id as string);
              loaded.push({
                id: detail.question.id,
                body: detail.question.body,
                difficulty: detail.question.difficulty,
                explanation: detail.question.explanation,
                choices: detail.choices.map((c) => ({
                  id: c.id,
                  label: c.label,
                  body: c.body,
                  is_correct: c.is_correct,
                })),
              });
            } catch {
              // 個別問題の取得失敗は無視
            }
          }
          setQuestions(loaded);
          setPhase(loaded.length > 0 ? "question" : "finished");
        } else {
          setPhase("finished");
        }
      } catch (e) {
        console.error("Session load error:", e);
        setPhase("finished");
      }
    }
    loadSession();
  }, [sessionId]);

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

  const handleAnswer = useCallback(async () => {
    if (!selectedChoiceId || !question) return;

    try {
      const result = await apiSubmitAnswer(sessionId, {
        questionId: question.id,
        chosenChoiceId: selectedChoiceId,
        timeSpentMs: elapsedMs,
      });

      setIsCorrect(result.isCorrect);
      setExplanation(result.explanation);
      setResults((prev) => ({
        correct: prev.correct + (result.isCorrect ? 1 : 0),
        total: prev.total + 1,
      }));
      setPhase("result");
    } catch (e) {
      console.error("Submit answer error:", e);
      // フォールバック: ローカル判定
      const correct = question.choices.find((c) => c.id === selectedChoiceId)?.is_correct === 1;
      setIsCorrect(correct);
      setExplanation(question.explanation);
      setResults((prev) => ({
        correct: prev.correct + (correct ? 1 : 0),
        total: prev.total + 1,
      }));
      setPhase("result");
    }
  }, [selectedChoiceId, question, sessionId, elapsedMs]);

  const handleRating = async (rating: SelfRating) => {
    if (!question) return;

    // SM-2レビュー記録をAPIに送信
    try {
      await apiRecordReview({
        questionId: question.id,
        quality: RATING_TO_QUALITY[rating],
      });
    } catch (e) {
      console.error("Review record error:", e);
    }

    handleNext();
  };

  const handleNext = () => {
    if (currentIndex < totalQuestions - 1) {
      setCurrentIndex((i) => i + 1);
      setSelectedChoiceId(null);
      setExplanation(null);
      setPhase("question");
    } else {
      // セッション終了
      apiFinishSession(sessionId).catch(console.error);
      setPhase("finished");
    }
  };

  if (phase === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-400 animate-pulse">問題を読み込み中...</div>
      </div>
    );
  }

  if (phase === "finished" || !question) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">🎉</div>
          <h2 className="text-xl font-bold mb-2">セッション完了</h2>
          <p className="text-gray-400 mb-2">
            {results.total > 0
              ? `${results.correct}/${results.total} 正解 (${Math.round((results.correct / results.total) * 100)}%)`
              : "問題がありませんでした"}
          </p>
          <button
            onClick={() => router.push("/dashboard")}
            className="mt-4 px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
          >
            ダッシュボードに戻る
          </button>
        </div>
      </div>
    );
  }

  const difficultyStars = "★".repeat(question.difficulty) + "☆".repeat(5 - question.difficulty);
  const displayExplanation = explanation || question.explanation;

  return (
    <div className="min-h-screen p-4 md:p-8 max-w-2xl mx-auto pb-24">
      {/* ヘッダー */}
      <div className="flex items-center justify-between mb-4">
        <div className="text-sm text-gray-400">
          {question.subjectName && (
            <>
              <span className="text-gray-300">{question.subjectName}</span>
              <span className="mx-1">›</span>
            </>
          )}
          <span>{question.fieldName || `問題 ${currentIndex + 1}`}</span>
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
            if (choice.is_correct === 1) {
              choiceStyle = "border-green-500 bg-green-500/10";
            } else if (choice.id === selectedChoiceId && choice.is_correct !== 1) {
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
          {displayExplanation && (
            <div className="bg-gray-900 rounded-lg border border-gray-800 p-4 mb-4">
              <h3 className="text-sm font-bold text-gray-400 mb-2">解説</h3>
              <p className="text-sm leading-relaxed">{displayExplanation}</p>
            </div>
          )}

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
