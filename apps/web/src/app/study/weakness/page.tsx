"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { SUBJECTS } from "@kyoutsu/shared";
import { apiGetOverview, apiStartSession } from "@/lib/api";

interface WeakField {
  fieldId: string;
  fieldName: string;
  subjectId: string;
  rate: number;
  total: number;
}

export default function WeaknessStartPage() {
  const router = useRouter();
  const [weakFields, setWeakFields] = useState<WeakField[]>([]);
  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState(false);

  useEffect(() => {
    apiGetOverview()
      .then((overview) => {
        const weak = overview.fieldStats
          .filter((f) => f.total >= 5)
          .map((f) => ({
            fieldId: f.field_id,
            fieldName: f.field_name,
            subjectId: f.subject_id,
            rate: f.total > 0 ? f.correct / f.total : 0,
            total: f.total,
          }))
          .sort((a, b) => a.rate - b.rate)
          .slice(0, 10);
        setWeakFields(weak);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleStart = async (fieldId: string, subjectId: string) => {
    if (starting) return;
    setStarting(true);
    try {
      const { sessionId } = await apiStartSession({
        sessionType: "weakness",
        subjectId,
        fieldId,
        questionCount: 10,
      });
      router.push(`/study/${sessionId}`);
    } catch (e) {
      console.error("Failed to start weakness drill:", e);
      setStarting(false);
    }
  };

  const handleAutoStart = async () => {
    if (starting || weakFields.length === 0) return;
    // 最も弱い分野でドリル開始
    const weakest = weakFields[0];
    handleStart(weakest.fieldId, weakest.subjectId);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-400 animate-pulse">弱点を分析中...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 md:p-8 max-w-2xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <a href="/study" className="text-gray-500 text-sm">← 戻る</a>
        <h1 className="text-xl font-bold">弱点ドリル</h1>
      </div>

      {weakFields.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-5xl mb-4">💪</div>
          <h2 className="text-lg font-bold mb-2">弱点なし！</h2>
          <p className="text-gray-400 text-sm">十分な回答データがないか、全分野で高い正答率です</p>
          <a href="/study" className="mt-6 inline-block px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm transition-colors">
            学習メニューに戻る
          </a>
        </div>
      ) : (
        <>
          {/* 自動スタート */}
          <button
            onClick={handleAutoStart}
            disabled={starting}
            className="w-full py-3 mb-6 bg-red-600 hover:bg-red-700 disabled:bg-gray-800
                       rounded-lg font-medium transition-colors"
          >
            {starting ? "セッション作成中..." : "最弱分野から自動スタート"}
          </button>

          {/* 弱点一覧 */}
          <div className="bg-gray-900 rounded-xl border border-gray-800 p-4">
            <h3 className="text-sm font-bold mb-3">弱点分野 TOP10</h3>
            <div className="space-y-2">
              {weakFields.map((wf, i) => {
                const subjectName = SUBJECTS.find((s) => s.id === wf.subjectId)?.shortName || wf.subjectId;
                const barColor = wf.rate < 0.5 ? "bg-red-500" : "bg-yellow-500";

                return (
                  <button
                    key={wf.fieldId}
                    onClick={() => handleStart(wf.fieldId, wf.subjectId)}
                    disabled={starting}
                    className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-gray-800/50 transition-colors text-left"
                  >
                    <span className="text-xs text-gray-600 w-4">{i + 1}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm truncate">{wf.fieldName}</span>
                        <span className="text-xs text-gray-500 shrink-0 ml-2">{subjectName}</span>
                      </div>
                      <div className="h-1.5 bg-gray-800 rounded-full">
                        <div className={`h-full rounded-full ${barColor}`} style={{ width: `${wf.rate * 100}%` }} />
                      </div>
                    </div>
                    <span className="text-xs font-mono text-red-400 w-12 text-right shrink-0">
                      {Math.round(wf.rate * 100)}%
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
