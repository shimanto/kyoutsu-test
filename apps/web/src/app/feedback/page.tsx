"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getAuthUser } from "@/lib/auth";
import { apiSubmitFeedback, apiGetMyFeedback } from "@/lib/api";

const CATEGORIES = [
  { value: "general", label: "全般", icon: "💬" },
  { value: "bug", label: "バグ報告", icon: "🐛" },
  { value: "feature", label: "機能要望", icon: "💡" },
  { value: "content", label: "問題内容", icon: "📝" },
  { value: "ui", label: "使いやすさ", icon: "🎨" },
] as const;

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  new: { label: "受付中", color: "text-blue-400 bg-blue-400/10" },
  reviewing: { label: "確認中", color: "text-yellow-400 bg-yellow-400/10" },
  resolved: { label: "対応済み", color: "text-green-400 bg-green-400/10" },
  declined: { label: "見送り", color: "text-gray-400 bg-gray-400/10" },
};

interface MyFeedback {
  id: string;
  category: string;
  rating: number;
  body: string;
  page_url: string | null;
  status: string;
  created_at: string;
}

export default function FeedbackPage() {
  const router = useRouter();
  const authUser = getAuthUser();

  const [category, setCategory] = useState("general");
  const [rating, setRating] = useState(0);
  const [body, setBody] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [myFeedback, setMyFeedback] = useState<MyFeedback[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(true);

  useEffect(() => {
    if (!authUser) {
      router.push("/login");
      return;
    }
    apiGetMyFeedback()
      .then((res) => setMyFeedback(res.feedback))
      .catch(() => {})
      .finally(() => setLoadingHistory(false));
  }, [authUser, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) {
      setError("満足度を選択してください");
      return;
    }
    if (!body.trim()) {
      setError("内容を入力してください");
      return;
    }

    setSubmitting(true);
    setError("");
    try {
      await apiSubmitFeedback({
        category,
        rating,
        body: body.trim(),
        pageUrl: typeof window !== "undefined" ? window.location.href : undefined,
      });
      setSubmitted(true);
      setBody("");
      setRating(0);
      setCategory("general");
      // 履歴を更新
      const res = await apiGetMyFeedback();
      setMyFeedback(res.feedback);
    } catch (err) {
      setError(err instanceof Error ? err.message : "送信に失敗しました");
    } finally {
      setSubmitting(false);
    }
  };

  if (!authUser) return null;

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100">
      <header className="sticky top-0 z-50 bg-gray-950/95 backdrop-blur-md border-b border-gray-800/50">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-3">
          <a href="/dashboard" className="text-gray-400 hover:text-white transition-colors">
            &larr;
          </a>
          <h1 className="font-bold">フィードバック</h1>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-8 space-y-8">
        {/* 送信完了メッセージ */}
        {submitted && (
          <div className="bg-green-900/30 border border-green-800/50 rounded-xl p-4 text-center">
            <p className="text-green-400 font-bold">フィードバックを送信しました</p>
            <p className="text-sm text-gray-400 mt-1">
              ご意見ありがとうございます。改善に活用させていただきます。
            </p>
            <button
              onClick={() => setSubmitted(false)}
              className="mt-3 text-sm text-green-400 underline hover:no-underline"
            >
              続けてフィードバックを送る
            </button>
          </div>
        )}

        {/* フィードバックフォーム */}
        {!submitted && (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="bg-gray-900 rounded-xl border border-gray-800 p-5">
              <h2 className="text-sm font-bold mb-1">あなたの声を聞かせてください</h2>
              <p className="text-xs text-gray-500 mb-5">
                学習体験の改善にご協力ください。バグ報告・機能要望・ご感想など何でもOKです。
              </p>

              {/* カテゴリ選択 */}
              <div className="mb-5">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-2">
                  カテゴリ
                </label>
                <div className="flex flex-wrap gap-2">
                  {CATEGORIES.map((cat) => (
                    <button
                      key={cat.value}
                      type="button"
                      onClick={() => setCategory(cat.value)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors border ${
                        category === cat.value
                          ? "bg-green-500/20 border-green-500/50 text-green-400"
                          : "bg-gray-800 border-gray-700 text-gray-400 hover:border-gray-600"
                      }`}
                    >
                      {cat.icon} {cat.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* 満足度 */}
              <div className="mb-5">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-2">
                  満足度
                </label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <button
                      key={n}
                      type="button"
                      onClick={() => setRating(n)}
                      className={`w-10 h-10 rounded-lg text-lg transition-all ${
                        rating >= n
                          ? "bg-green-500/20 border border-green-500/50 scale-110"
                          : "bg-gray-800 border border-gray-700 hover:border-gray-600"
                      }`}
                    >
                      {rating >= n ? "★" : "☆"}
                    </button>
                  ))}
                  <span className="flex items-center ml-2 text-xs text-gray-500">
                    {rating === 0 && "選択してください"}
                    {rating === 1 && "不満"}
                    {rating === 2 && "やや不満"}
                    {rating === 3 && "普通"}
                    {rating === 4 && "満足"}
                    {rating === 5 && "とても満足"}
                  </span>
                </div>
              </div>

              {/* 本文 */}
              <div className="mb-5">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-2">
                  内容
                </label>
                <textarea
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  placeholder="具体的にお聞かせください（例：復習機能がとても使いやすい / ○○の問題が間違っている / △△機能がほしい）"
                  rows={5}
                  maxLength={2000}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 text-sm
                             placeholder:text-gray-600 focus:border-green-500 focus:outline-none resize-none"
                />
                <div className="flex justify-end mt-1">
                  <span className="text-[10px] text-gray-600">{body.length} / 2000</span>
                </div>
              </div>

              {error && (
                <p className="text-red-400 text-xs mb-3">{error}</p>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-2.5 rounded-lg font-bold text-sm transition-colors
                           bg-green-600 hover:bg-green-500 disabled:bg-gray-700 disabled:text-gray-500"
              >
                {submitting ? "送信中..." : "フィードバックを送信"}
              </button>
            </div>
          </form>
        )}

        {/* 過去のフィードバック */}
        <div>
          <h2 className="text-sm font-bold mb-3 flex items-center gap-2">
            <span className="w-1 h-4 rounded bg-green-500" />
            あなたのフィードバック履歴
          </h2>

          {loadingHistory ? (
            <p className="text-gray-500 text-sm animate-pulse">読み込み中...</p>
          ) : myFeedback.length === 0 ? (
            <p className="text-gray-600 text-sm">まだフィードバックはありません</p>
          ) : (
            <div className="space-y-3">
              {myFeedback.map((fb) => {
                const cat = CATEGORIES.find((c) => c.value === fb.category);
                const st = STATUS_LABELS[fb.status] || STATUS_LABELS.new;
                return (
                  <div
                    key={fb.id}
                    className="bg-gray-900 rounded-xl border border-gray-800 p-4"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs">{cat?.icon}</span>
                      <span className="text-xs text-gray-400">{cat?.label}</span>
                      <span className="flex gap-0.5 text-xs">
                        {Array.from({ length: 5 }, (_, i) => (
                          <span key={i} className={i < fb.rating ? "text-green-400" : "text-gray-700"}>
                            ★
                          </span>
                        ))}
                      </span>
                      <span className={`ml-auto px-2 py-0.5 rounded-full text-[10px] font-bold ${st.color}`}>
                        {st.label}
                      </span>
                    </div>
                    <p className="text-sm text-gray-300 leading-relaxed">{fb.body}</p>
                    <p className="text-[10px] text-gray-600 mt-2">
                      {new Date(fb.created_at).toLocaleDateString("ja-JP")}
                    </p>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
