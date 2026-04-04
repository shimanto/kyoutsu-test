"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  SAMPLE_FIELD_STATS,
  SAMPLE_QUESTIONS_BY_FIELD,
  SUBJECT_NAMES,
  type SampleQuestion,
} from "@/lib/sample-data";
import { getFieldQuestions } from "@/lib/question-generator";
import { apiGenerateAiQuestion, apiGenerateVariantQuestion } from "@/lib/api";


type Phase = "question" | "result" | "complete";

export default function DrillPage() {
  const params = useParams();
  const router = useRouter();
  const fieldId = params.fieldId as string;

  // 分野情報
  const fieldStat = SAMPLE_FIELD_STATS.find((f) => f.fieldId === fieldId);
  const handwritten: SampleQuestion[] = SAMPLE_QUESTIONS_BY_FIELD[fieldId] || [];
  const questions: SampleQuestion[] = getFieldQuestions(fieldId, handwritten);
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
    fieldId={fieldId}
    fieldName={fieldName}
    subjectName={subjectName}
    currentRate={currentRate}
    fieldStat={fieldStat}
    onBack={() => router.push("/")}
  />;
}

/**
 * 問題が変形可能かどうかを判定する
 * 数値計算・公式適用系は不正解選択肢を正解にできないため変形不可
 */
function canCreateVariant(q: SampleQuestion): boolean {
  const body = q.body;
  // 計算結果を問う問題（「求めよ」「何〜か」「値は」等）
  if (/求めよ|を求め|何\s*[m秒Ω℃%kg]|の値は|いくらか|何度か|何\s*mol|何\s*[JNW]/.test(body)) return false;
  // プログラム出力系
  if (/出力結果|print|output/.test(body)) return false;
  // 明確な数値が正解の場合
  const correctBody = q.choices.find((c) => c.isCorrect)?.body || "";
  if (/^[\d.√π×÷+\-/()%\s]+$/.test(correctBody.replace(/[a-zA-Z]/g, ""))) return false;
  return true;
}

/**
 * 正解だった問題を別の選択肢が正解の変形問題に書き換える。
 * 同期で対応できるパターン:
 *   1. 「正しいもの」⇔「誤っているもの」の反転
 *   2. 問題文中に元の正解テキストが含まれる場合、新しい正解テキストで置換
 * それ以外は null を返し、AI生成にフォールバックする。
 */
function createVariantSync(q: SampleQuestion, retryCount: number): SampleQuestion | null {
  if (!canCreateVariant(q)) return null;

  const wrongChoices = q.choices.filter((c) => !c.isCorrect);
  if (wrongChoices.length === 0) return null;

  const newCorrect = wrongChoices[retryCount % wrongChoices.length];
  const oldCorrect = q.choices.find((c) => c.isCorrect)!;

  const newChoices = q.choices.map((c) => {
    if (c.id === newCorrect.id) return { ...c, isCorrect: true };
    if (c.id === oldCorrect.id) return { ...c, isCorrect: false };
    return { ...c };
  });

  let newBody: string | null = null;

  // パターン1: 「正しいもの」⇔「誤っているもの」の反転
  if (q.body.includes("正しいもの")) {
    newBody = q.body.replace("正しいもの", "誤っているもの");
  } else if (q.body.includes("誤っているもの") || q.body.includes("適切でないもの")) {
    newBody = q.body.replace(/誤っているもの|適切でないもの/, "正しいもの");
  }

  // パターン2: 解説文から選択肢に対応するキーワードを抽出して設問文を書き換える
  // 例: 解説に「Af = 熱帯雨林気候」「Cs = 地中海性気候」等のマッピングがある場合
  if (!newBody) {
    const keywordMap = extractKeywordMapping(q.explanation, q.choices);
    const oldKeyword = keywordMap.get(oldCorrect.body);
    const newKeyword = keywordMap.get(newCorrect.body);
    if (oldKeyword && newKeyword && q.body.includes(oldKeyword)) {
      newBody = q.body.replace(oldKeyword, newKeyword);
    }
  }

  // パターン3: 問題文中に元の正解テキストがそのまま含まれている場合は直接置換
  if (!newBody && q.body.includes(oldCorrect.body)) {
    newBody = q.body.replace(oldCorrect.body, newCorrect.body);
  }

  if (!newBody) return null; // AI生成が必要

  return {
    ...q,
    id: `${q.id}_v${retryCount}`,
    body: newBody,
    choices: newChoices,
    explanation: `【変形問題の解説】正解は「${newCorrect.body}」。元の問題では「${oldCorrect.body}」が正解でした。\n\n${q.explanation}`,
  };
}

/**
 * 解説文から「キーワード = 選択肢テキスト」のマッピングを抽出する。
 * 例: 「Af = 熱帯雨林気候」→ Map { "熱帯雨林気候" => "Af" }
 * 例: 「Awがサバナ気候」→ Map { "サバナ気候" => "Aw" }
 */
function extractKeywordMapping(
  explanation: string,
  choices: SampleQuestion["choices"],
): Map<string, string> {
  const mapping = new Map<string, string>();

  for (const choice of choices) {
    // 「X = 選択肢」「X＝選択肢」パターン
    const eqPattern = new RegExp(`([A-Za-z][A-Za-z0-9/]*(?:\\s*[A-Za-z0-9/]+)?)\\s*[=＝]\\s*${escapeRegex(choice.body)}`);
    const eqMatch = explanation.match(eqPattern);
    if (eqMatch) {
      mapping.set(choice.body, eqMatch[1].trim());
      continue;
    }

    // 「Xが選択肢」「Xは選択肢」パターン
    const gaPattern = new RegExp(`([A-Za-z][A-Za-z0-9/]*(?:\\s*[A-Za-z0-9/]+)?)\\s*[がはの]\\s*${escapeRegex(choice.body)}`);
    const gaMatch = explanation.match(gaPattern);
    if (gaMatch) {
      mapping.set(choice.body, gaMatch[1].trim());
      continue;
    }

    // 「選択肢はX」「選択肢＝X」パターン（逆順）
    const revPattern = new RegExp(`${escapeRegex(choice.body)}\\s*[はが=＝]\\s*([A-Za-z][A-Za-z0-9/]*(?:\\s*[A-Za-z0-9/]+)?)`);
    const revMatch = explanation.match(revPattern);
    if (revMatch) {
      mapping.set(choice.body, revMatch[1].trim());
    }
  }

  return mapping;
}

/**
 * AI応答の変形問題文が有効かチェックする。
 * メタ的な表現や元の問題文がそのまま残っている場合は無効。
 */
function isValidVariantBody(newBody: string, originalBody: string): boolean {
  // メタ的な表現が含まれていたら無効
  if (/変形|解き直し|正解となる|次のうち.*が正解/.test(newBody)) return false;
  // 元の問題文がそのまま含まれていたら無効（改行で連結されただけ）
  if (newBody.includes(originalBody)) return false;
  // 元の問題文とほぼ同一（90%以上一致）なら無効
  if (newBody.trim() === originalBody.trim()) return false;
  // 空や短すぎる場合は無効
  if (newBody.trim().length < 5) return false;
  // 「?」マークだけや選択肢の羅列だけの場合は無効
  if (!/[かどれなぜいつ？。]/.test(newBody)) return false;
  return true;
}

/**
 * AIを使って変形問題を生成する。
 * 問題文を書き換えて、指定した選択肢が正解になるようにする。
 */
async function createVariantWithAI(
  q: SampleQuestion,
  retryCount: number,
  subjectName: string,
  fieldName: string,
): Promise<SampleQuestion | null> {
  const wrongChoices = q.choices.filter((c) => !c.isCorrect);
  if (wrongChoices.length === 0) return null;

  const newCorrect = wrongChoices[retryCount % wrongChoices.length];
  const oldCorrect = q.choices.find((c) => c.isCorrect)!;

  try {
    const res = await apiGenerateVariantQuestion({
      originalBody: q.body,
      choices: q.choices.map((c) => ({ label: c.label, body: c.body, isCorrect: c.isCorrect })),
      newCorrectBody: newCorrect.body,
      subjectName,
      fieldName,
    });

    // AI応答のバリデーション
    if (!res.body || !isValidVariantBody(res.body, q.body)) {
      return null;
    }

    const newChoices = q.choices.map((c) => {
      if (c.id === newCorrect.id) return { ...c, isCorrect: true };
      if (c.id === oldCorrect.id) return { ...c, isCorrect: false };
      return { ...c };
    });

    return {
      ...q,
      id: `${q.id}_v${retryCount}`,
      body: res.body,
      choices: newChoices,
      explanation: res.explanation || `【変形問題の解説】正解は「${newCorrect.body}」。元の問題では「${oldCorrect.body}」が正解でした。\n\n${q.explanation}`,
    };
  } catch {
    return null;
  }
}

function DrillSession({
  questions, fieldId, fieldName, subjectName, currentRate, fieldStat, onBack,
}: {
  questions: SampleQuestion[];
  fieldId: string;
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
  const [activeQuestions, setActiveQuestions] = useState<SampleQuestion[]>(questions);
  const [retryRound, setRetryRound] = useState(0);
  const [questionResults, setQuestionResults] = useState<Map<string, boolean>>(new Map());
  const [retryLoading, setRetryLoading] = useState(false);

  const question = activeQuestions[currentIndex];
  const totalQuestions = activeQuestions.length;

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
    // 問題ごとの正解/不正解を記録
    setQuestionResults((prev) => new Map(prev).set(question.id, correct));
    setPhase("result");
    requestAnimationFrame(() => {
      window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
    });
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

        {/* 不正解数カウント */}
        {(() => {
          const wrongCount = Array.from(questionResults.values()).filter((v) => !v).length;
          const correctCount = Array.from(questionResults.values()).filter((v) => v).length;
          return wrongCount > 0 ? (
            <div className="bg-gray-900 rounded-lg border border-gray-800 p-3 w-full max-w-sm text-center">
              <p className="text-xs text-gray-400">
                「もう一度」で: 不正解 <span className="text-red-400 font-bold">{wrongCount}</span> 問はそのまま再出題、
                正解 <span className="text-blue-400 font-bold">{correctCount}</span> 問は変形問題で再出題
              </p>
            </div>
          ) : null;
        })()}

        <div className="flex gap-3 w-full max-w-sm">
          <button
            disabled={retryLoading}
            onClick={async () => {
              setRetryLoading(true);
              const nextRound = retryRound + 1;
              // 出題済み問題IDを収集
              const usedIds = new Set(activeQuestions.map((q) => q.id.replace(/_v\d+$/, "")));
              // 全問プールから未使用問題を取得
              const allPool = getFieldQuestions(fieldId, SAMPLE_QUESTIONS_BY_FIELD[fieldId] || []);
              const unusedPool = allPool.filter((q) => !usedIds.has(q.id));

              const retryList: SampleQuestion[] = [];
              const aiPending: Promise<SampleQuestion | null>[] = [];

              for (const q of activeQuestions) {
                const wasCorrect = questionResults.get(q.id);
                if (wasCorrect === false) {
                  retryList.push(q);
                } else if (wasCorrect === true) {
                  // 正解 → 同期変形（正しいもの⇔誤っているもの反転）を試す
                  const syncVariant = createVariantSync(q, nextRound);
                  if (syncVariant) {
                    retryList.push(syncVariant);
                  } else if (canCreateVariant(q)) {
                    // 問題文の書き換えが必要 → AI変形生成
                    const idx = retryList.length;
                    retryList.push(q); // プレースホルダー
                    aiPending.push(
                      createVariantWithAI(q, nextRound, subjectName, fieldName)
                        .then((v) => v ? { ...v, _idx: idx } as SampleQuestion & { _idx: number } : null)
                        .catch(() => null)
                    );
                  } else if (unusedPool.length > 0) {
                    // 変形不可（計算系等）→ 未使用問題から代替
                    const alt = unusedPool.shift()!;
                    usedIds.add(alt.id);
                    retryList.push(alt);
                  } else {
                    // 最終手段: AI新問題生成
                    const idx = retryList.length;
                    retryList.push(q);
                    aiPending.push(
                      apiGenerateAiQuestion({
                        fieldName: fieldName,
                        subjectName: subjectName,
                        difficulty: q.difficulty,
                        excludeBody: q.body,
                      }).then((res) => ({ ...res.question, _idx: idx } as SampleQuestion & { _idx: number }))
                        .catch(() => null)
                    );
                  }
                } else {
                  retryList.push(q);
                }
              }

              // AI生成結果を反映
              if (aiPending.length > 0) {
                const aiResults = await Promise.all(aiPending);
                for (const r of aiResults) {
                  if (r && "_idx" in r) {
                    const idx = (r as unknown as { _idx: number })._idx;
                    const { _idx, ...question } = r as SampleQuestion & { _idx: number };
                    retryList[idx] = question;
                  }
                }
              }

              setActiveQuestions(retryList);
              setRetryRound(nextRound);
              setCurrentIndex(0);
              setSelectedChoiceId(null);
              setResults({ correct: 0, total: 0 });
              setQuestionResults(new Map());
              setRetryLoading(false);
              setPhase("question");
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            className="flex-1 py-3 border border-gray-700 rounded-lg hover:bg-gray-900 disabled:opacity-50 transition-colors text-sm"
          >
            {retryLoading ? "問題を準備中..." : <>もう一度 {retryRound > 0 && <span className="text-[10px] text-gray-500 ml-1">({retryRound + 1}回目)</span>}</>}
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
            <p className="text-sm leading-relaxed">
              <HighlightedExplanation text={question.explanation} choices={question.choices} />
            </p>

            {/* 各選択肢の個別解説 */}
            <div className="mt-4 pt-3 border-t border-gray-800 space-y-2">
              <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-1">選択肢の詳細</p>
              {question.choices.map((c) => {
                const wasSelected = c.id === selectedChoiceId;
                return (
                  <div key={c.id} className={`flex gap-2 text-xs rounded-lg px-3 py-2 ${
                    c.isCorrect ? "bg-blue-900/20 border border-blue-800/30" : "bg-gray-800/50"
                  }`}>
                    <span className={`font-bold shrink-0 ${c.isCorrect ? "text-blue-400" : "text-red-400"}`}>
                      {c.label}. {c.isCorrect ? "○" : "×"}
                    </span>
                    <div>
                      <span className={`font-medium ${c.isCorrect ? "text-blue-300" : "text-red-300"}`}>
                        {c.body}
                      </span>
                      {wasSelected && !c.isCorrect && (
                        <span className="ml-1 text-[10px] text-red-500">← あなたの回答</span>
                      )}
                      {c.isCorrect && (
                        <span className="ml-1 text-[10px] text-blue-500">← 正解</span>
                      )}
                      <p className="text-gray-400 mt-0.5">
                        {c.isCorrect
                          ? "正解。" + getCorrectReason(question.explanation, c.body)
                          : getWrongReason(c.body, question.choices.find((x) => x.isCorrect)?.body || "", question.explanation)}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
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

/** 解説テキスト中の選択肢テキストをハイライト表示 */
function HighlightedExplanation({ text, choices }: {
  text: string;
  choices: SampleQuestion["choices"];
}) {
  // 正解と不正解の選択肢テキストを長い順にソート（部分一致の誤検出を防ぐ）
  const correctBodies = choices.filter((c) => c.isCorrect).map((c) => c.body);
  const wrongBodies = choices.filter((c) => !c.isCorrect).map((c) => c.body);
  const allBodies = [...correctBodies, ...wrongBodies].sort((a, b) => b.length - a.length);

  // 短すぎるテキスト（1文字以下）はハイライト対象外
  const targets = allBodies.filter((b) => b.length > 1);
  if (targets.length === 0) return <>{text}</>;

  // テキストを分割してハイライト
  const pattern = new RegExp(`(${targets.map(escapeRegex).join("|")})`, "g");
  const parts = text.split(pattern);

  return (
    <>
      {parts.map((part, i) => {
        if (correctBodies.includes(part)) {
          return <span key={i} className="text-blue-400 font-bold">{part}</span>;
        }
        if (wrongBodies.includes(part)) {
          return <span key={i} className="text-red-400">{part}</span>;
        }
        return <span key={i}>{part}</span>;
      })}
    </>
  );
}

function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/** 正解の補足理由を解説テキストから抽出 */
function getCorrectReason(explanation: string, correctBody: string): string {
  // 解説中に正解テキストが含まれる文を探す
  const sentences = explanation.split(/[。．\n]/).filter(Boolean);
  // 「正解は「○○」」のようなメタ的な文はスキップ
  const match = sentences.find((s) => s.includes(correctBody) && !/正解は[「『]/.test(s));
  if (match && match.length > correctBody.length + 5) {
    return match.replace(correctBody, "").trim().replace(/^[、。が]/,"");
  }
  // メタ文しかない場合、変形問題の解説から元の解説部分を探す
  const afterMeta = explanation.split(/\n\n/).slice(1).join("\n\n");
  if (afterMeta) {
    const metaSentences = afterMeta.split(/[。．\n]/).filter(Boolean);
    const metaMatch = metaSentences.find((s) => s.includes(correctBody));
    if (metaMatch && metaMatch.length > correctBody.length + 5) {
      return metaMatch.replace(correctBody, "").trim().replace(/^[、。が]/,"");
    }
  }
  return "";
}

/** 不正解の補足理由を生成 */
function getWrongReason(wrongBody: string, correctBody: string, explanation: string): string {
  // 解説中に不正解テキストの言及があるか探す
  const sentences = explanation.split(/[。．\n]/).filter(Boolean);
  const match = sentences.find((s) => s.includes(wrongBody));
  if (match) {
    return match.trim() + "。";
  }
  return `この選択肢は不正解。正解は「${correctBody}」。`;
}
