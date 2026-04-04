"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiGetDueReviews, apiStartSession } from "@/lib/api";

interface ReviewItem {
  question_id: string;
  body: string;
  difficulty: number;
  field_name: string;
  subject_id: string;
  next_review_date: string;
}

export default function ReviewStartPage() {
  const router = useRouter();
  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState(false);

  useEffect(() => {
    apiGetDueReviews()
      .then((data) => setReviews(data.reviews as ReviewItem[]))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleStart = async () => {
    if (starting) return;
    setStarting(true);
    try {
      const { sessionId } = await apiStartSession({
        sessionType: "review",
        questionCount: Math.min(reviews.length, 20),
      });
      router.push(`/study/${sessionId}`);
    } catch (e) {
      console.error("Failed to start review session:", e);
      setStarting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-400 animate-pulse">復習データを確認中...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 md:p-8 max-w-2xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <a href="/study" className="text-gray-500 text-sm">← 戻る</a>
        <h1 className="text-xl font-bold">復習セッション</h1>
      </div>

      {reviews.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-5xl mb-4">🎉</div>
          <h2 className="text-lg font-bold mb-2">復習完了！</h2>
          <p className="text-gray-400 text-sm">今日の復習対象はありません。素晴らしい！</p>
          <a href="/study" className="mt-6 inline-block px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm transition-colors">
            学習メニューに戻る
          </a>
        </div>
      ) : (
        <>
          <div className="bg-amber-900/20 border border-amber-700/30 rounded-xl p-4 mb-6">
            <div className="text-3xl font-mono font-bold text-amber-400 mb-1">
              {reviews.length}<span className="text-sm text-gray-400 ml-1">問</span>
            </div>
            <p className="text-sm text-gray-400">忘却曲線に基づく今日の復習対象です</p>
          </div>

          {/* 復習対象の分野別内訳 */}
          <div className="bg-gray-900 rounded-xl border border-gray-800 p-4 mb-6">
            <h3 className="text-sm font-bold mb-3">分野別内訳</h3>
            <div className="space-y-2">
              {Object.entries(
                reviews.reduce<Record<string, number>>((acc, r) => {
                  acc[r.field_name] = (acc[r.field_name] || 0) + 1;
                  return acc;
                }, {})
              ).sort(([, a], [, b]) => b - a).map(([field, count]) => (
                <div key={field} className="flex items-center justify-between text-sm">
                  <span>{field}</span>
                  <span className="text-gray-500">{count}問</span>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={handleStart}
            disabled={starting}
            className="w-full py-3 bg-amber-600 hover:bg-amber-700 disabled:bg-gray-800
                       rounded-lg font-medium transition-colors"
          >
            {starting ? "セッション作成中..." : `復習を開始する（${Math.min(reviews.length, 20)}問）`}
          </button>
        </>
      )}
    </div>
  );
}
