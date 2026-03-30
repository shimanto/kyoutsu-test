"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { TOTAL_MAX_SCORE, SUBJECTS } from "@kyoutsu/shared";
import { MobileHeatmap } from "@/components/charts/MobileHeatmap";
import { ScoreGauge } from "@/components/charts/ScoreGauge";
import { getAuthUser, logout } from "@/lib/auth";
import { apiGetOverview, apiGetDueCount } from "@/lib/api";

interface OverviewData {
  subjectStats: { subject_id: string; total: number; correct: number }[];
  fieldStats: { field_id: string; field_name: string; subject_id: string; total: number; correct: number }[];
  targets: { subject_id: string; target_score: number }[];
}

function daysUntil(year: number): number {
  const examDate = new Date(`${year}-01-18`);
  return Math.max(0, Math.ceil((examDate.getTime() - Date.now()) / 86400000));
}

export default function Home() {
  const router = useRouter();
  const authUser = getAuthUser();
  const [overview, setOverview] = useState<OverviewData | null>(null);
  const [reviewCount, setReviewCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const remainingDays = daysUntil(authUser?.examYear || 2027);
  const targetTotal = authUser?.targetTotal || 780;

  useEffect(() => {
    Promise.all([
      apiGetOverview().catch(() => null),
      apiGetDueCount().catch(() => ({ count: 0 })),
    ]).then(([ov, rc]) => {
      if (ov) setOverview(ov);
      setReviewCount(rc?.count || 0);
      setLoading(false);
    });
  }, []);

  // スコア計算
  const SUBJECT_MAX: Record<string, number> = {};
  SUBJECTS.forEach((s) => { SUBJECT_MAX[s.id] = s.maxScore; });

  const currentTotal = overview?.subjectStats.reduce((sum, s) => {
    const max = SUBJECT_MAX[s.subject_id] || 100;
    const rate = s.total > 0 ? s.correct / s.total : 0;
    return sum + Math.round(rate * max);
  }, 0) || 0;

  // 弱点TOP3
  const weakFields = (overview?.fieldStats || [])
    .filter((f) => f.total >= 5)
    .map((f) => ({ ...f, rate: f.correct / f.total }))
    .sort((a, b) => a.rate - b.rate)
    .slice(0, 3);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl animate-pulse mb-2">📚</div>
          <p className="text-sm text-gray-500">学習マップを読み込み中...</p>
        </div>
      </div>
    );
  }

  // データがない場合はオンボーディングへ
  if (!overview || overview.subjectStats.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center max-w-sm">
          <div className="text-5xl mb-4">📚🎯</div>
          <h1 className="text-xl font-bold mb-2">学習を始めよう</h1>
          <p className="text-gray-400 text-sm mb-6">
            まずは偏差値を入力して、あなたの現在地を把握しましょう。
          </p>
          <button onClick={() => router.push("/onboarding")}
            className="w-full py-3 bg-green-600 hover:bg-green-700 rounded-lg font-medium transition-colors">
            偏差値を入力してスタート
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-16">
      {/* ヘッダー */}
      <header className="sticky top-0 z-40 bg-gray-950/90 backdrop-blur-md border-b border-gray-800/50 px-3 py-2">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-base font-bold">📚 大学物語</span>
              <span className="text-[10px] px-1.5 py-0.5 bg-gray-800 rounded text-gray-400">
                {authUser?.displayName}
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <span className="text-red-400 font-bold">{remainingDays}日</span>
              <button onClick={logout} className="text-gray-600 hover:text-gray-400">⏏</button>
            </div>
          </div>
          <div className="flex items-center gap-2 mt-1.5">
            <span className="text-lg font-mono font-bold">{currentTotal}</span>
            <div className="flex-1">
              <ScoreGauge current={currentTotal} target={targetTotal} max={TOTAL_MAX_SCORE} />
            </div>
            <span className="text-xs text-gray-500">/{TOTAL_MAX_SCORE}</span>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-3 pt-3">
        {/* クイックアクション */}
        <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
          <QuickBtn href="/timekeeper/daily" icon="⚽" label="今日のタスク" accent="#22c55e" />
          <QuickBtn href="/study" icon="🔄" label={`復習${reviewCount}問`} accent="#eab308" />
          <QuickBtn href="/timekeeper" icon="🏃" label="ロードマップ" accent="#3b82f6" />
          <QuickBtn href="/analytics" icon="📊" label="分析" accent="#8b5cf6" />
        </div>

        {/* 弱点アラート */}
        {weakFields.length > 0 && (
          <div className="mb-4 p-2.5 bg-red-950/30 border border-red-900/30 rounded-xl">
            <div className="text-[10px] text-red-400 font-bold mb-1.5">弱点 — クリックで強化</div>
            <div className="flex gap-1.5">
              {weakFields.map((wf) => (
                <button key={wf.field_id}
                  onClick={() => router.push(`/drill/${wf.field_id}`)}
                  className="flex-1 p-2 rounded-lg text-center transition-all active:scale-95 bg-gray-900/50 border border-gray-800">
                  <div className="text-xs font-medium truncate">{wf.field_name}</div>
                  <div className="text-lg font-mono font-bold" style={{ color: rateColor(wf.rate) }}>
                    {Math.round(wf.rate * 100)}%
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ヒートマップ (API版はfieldStatsから構築) */}
        <section>
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-sm font-bold">学習マップ</h2>
            <button onClick={() => router.push("/onboarding")} className="text-[10px] text-gray-500 hover:text-gray-300">
              偏差値を変更
            </button>
          </div>
          <ApiHeatmap
            fieldStats={overview.fieldStats}
            targets={overview.targets}
            onDrill={(fieldId) => router.push(`/drill/${fieldId}`)}
          />
        </section>
      </main>

      {/* ボトムナビ */}
      <nav className="fixed bottom-0 left-0 right-0 bg-gray-900/95 backdrop-blur border-t border-gray-800 z-50">
        <div className="max-w-3xl mx-auto flex justify-around py-1.5">
          <NavItem href="/" icon="▣" label="マップ" active />
          <NavItem href="/timekeeper" icon="🏃" label="ロード" />
          <NavItem href="/timekeeper/daily" icon="⚽" label="今日" />
          <NavItem href="/study" icon="📖" label="学習" />
          <NavItem href="/analytics" icon="📊" label="分析" />
        </div>
      </nav>
    </div>
  );
}

/** D1データからヒートマップを描画 */
function ApiHeatmap({ fieldStats, targets, onDrill }: {
  fieldStats: OverviewData["fieldStats"];
  targets: OverviewData["targets"];
  onDrill: (fieldId: string) => void;
}) {
  const GROUPS = [
    { id: "kokugo", label: "国語", color: "#f97316", subjectIds: ["kokugo"], maxScore: 200 },
    { id: "math", label: "数学", color: "#3b82f6", subjectIds: ["math1a", "math2bc"], maxScore: 200 },
    { id: "english", label: "英語", color: "#ec4899", subjectIds: ["eng_read", "eng_listen"], maxScore: 200 },
    { id: "science", label: "理科", color: "#14b8a6", subjectIds: ["physics", "chemistry"], maxScore: 200 },
    { id: "social", label: "社会", color: "#eab308", subjectIds: ["social"], maxScore: 100 },
    { id: "info", label: "情報", color: "#06b6d4", subjectIds: ["info1"], maxScore: 100 },
  ];

  return (
    <div className="space-y-2">
      {GROUPS.map((group) => {
        const gFields = fieldStats.filter((f) => group.subjectIds.includes(f.subject_id));
        const gTotal = gFields.reduce((s, f) => s + f.total, 0);
        const gCorrect = gFields.reduce((s, f) => s + f.correct, 0);
        const gRate = gTotal > 0 ? gCorrect / gTotal : 0;
        const estScore = Math.round(gRate * group.maxScore);

        return (
          <div key={group.id} className="bg-gray-900/50 rounded-xl border border-gray-800/50 overflow-hidden">
            <div className="flex items-center gap-2 p-2.5">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold shrink-0"
                   style={{ backgroundColor: `${group.color}22`, color: group.color }}>
                {group.label.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline gap-1.5">
                  <span className="text-sm font-bold">{group.label}</span>
                  <span className="text-xs font-mono" style={{ color: group.color }}>
                    {estScore}<span className="text-gray-600">/{group.maxScore}</span>
                  </span>
                </div>
                <div className="flex gap-0.5 mt-1">
                  {gFields.map((f) => {
                    const fRate = f.total > 0 ? f.correct / f.total : 0;
                    return (
                      <button key={f.field_id} onClick={() => onDrill(f.field_id)}
                        className="h-5 rounded-sm flex-1 relative group cursor-pointer hover:brightness-125 transition-all"
                        style={{ backgroundColor: heatColor(fRate, f.total) }}>
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 bg-gray-900 border border-gray-700
                                        rounded px-2 py-1 text-[10px] whitespace-nowrap opacity-0 group-hover:opacity-100
                                        pointer-events-none z-10 text-white">
                          {f.field_name} {Math.round(fRate * 100)}%
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
              <span className="text-xs text-gray-500">{Math.round(gRate * 100)}%</span>
            </div>
          </div>
        );
      })}
      {/* 凡例 */}
      <div className="flex items-center gap-1.5 justify-center text-[10px] text-gray-600 mt-1">
        <span>弱い</span>
        {["#dc2626","#f87171","#fde68a","#4ade80","#22c55e"].map((c,i) => (
          <div key={i} className="w-3 h-2 rounded-sm" style={{backgroundColor:c}} />
        ))}
        <span>習得済み</span>
        <span className="ml-2">クリックでドリル</span>
      </div>
    </div>
  );
}

function heatColor(rate: number, total: number): string {
  if (total < 3) return "#374151";
  if (rate <= 0.5) {
    const t = rate / 0.5;
    return `rgb(${Math.round(220 - t * 30)},${Math.round(38 + t * 185)},38)`;
  }
  const t = (rate - 0.5) / 0.5;
  return `rgb(${Math.round(190 - t * 156)},${Math.round(223 - t * 26)},${Math.round(38 + t * 59)})`;
}

function rateColor(rate: number): string {
  if (rate >= 0.8) return "#22c55e";
  if (rate >= 0.65) return "#eab308";
  if (rate >= 0.5) return "#f97316";
  return "#ef4444";
}

function QuickBtn({ href, icon, label, accent }: { href: string; icon: string; label: string; accent: string }) {
  return (
    <a href={href}
       className="flex items-center gap-1.5 px-3 py-2 rounded-xl border whitespace-nowrap text-xs shrink-0 transition-colors active:scale-95"
       style={{ borderColor: `${accent}33`, color: accent }}>
      <span>{icon}</span><span>{label}</span>
    </a>
  );
}

function NavItem({ href, icon, label, active = false }: { href: string; icon: string; label: string; active?: boolean }) {
  return (
    <a href={href} className={`flex flex-col items-center gap-0.5 text-[10px] px-2 ${active ? "text-green-400" : "text-gray-500"}`}>
      <span className="text-base">{icon}</span><span>{label}</span>
    </a>
  );
}
