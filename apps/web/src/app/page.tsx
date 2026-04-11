"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { TOTAL_MAX_SCORE, SUBJECTS, BRAND, CATCHCOPY, STATUS_COPY, getSeasonalCopy, getStageCopy } from "@kyoutsu/shared";
import { LogoMark } from "@/components/brand/LogoMark";
import { ScoreGauge } from "@/components/charts/ScoreGauge";
import { ShareButton } from "@/components/share/ShareButton";
import { getAuthUser, logout } from "@/lib/auth";
import { apiGetOverview, apiGetDueCount } from "@/lib/api";
import { SAMPLE_FIELD_STATS } from "@/lib/sample-data";
import { generateOverviewFromDeviation, deviationLabel } from "@/lib/deviation-generator";

interface FieldStat {
  field_id: string;
  field_name: string;
  subject_id: string;
  total: number;
  correct: number;
  points: number;
}

interface OverviewData {
  subjectStats: { subject_id: string; total: number; correct: number }[];
  fieldStats: FieldStat[];
  targets: { subject_id: string; target_score: number }[];
}

const SUBJECT_GROUPS = [
  { id: "kokugo",  label: "国語", subjectIds: ["kokugo"], maxScore: 200, color: "#f97316" },
  { id: "math",    label: "数学", subjectIds: ["math1a", "math2bc"], maxScore: 200, color: "#3b82f6" },
  { id: "english", label: "英語", subjectIds: ["eng_read", "eng_listen"], maxScore: 200, color: "#ec4899" },
  { id: "science", label: "理科", subjectIds: ["physics", "chemistry"], maxScore: 200, color: "#14b8a6" },
  { id: "social",  label: "社会", subjectIds: ["social"], maxScore: 100, color: "#eab308" },
  { id: "info",    label: "情報", subjectIds: ["info1"], maxScore: 100, color: "#06b6d4" },
];

const SUBJECT_MAX: Record<string, number> = {};
SUBJECTS.forEach((s) => { SUBJECT_MAX[s.id] = s.maxScore; });

/** APIデータがない場合にサンプルデータから OverviewData を生成 */
function buildFallbackOverview(): OverviewData {
  const subjectMap = new Map<string, { total: number; correct: number }>();
  for (const f of SAMPLE_FIELD_STATS) {
    const prev = subjectMap.get(f.subjectId) || { total: 0, correct: 0 };
    subjectMap.set(f.subjectId, { total: prev.total + f.total, correct: prev.correct + f.correct });
  }
  return {
    subjectStats: Array.from(subjectMap.entries()).map(([sid, s]) => ({
      subject_id: sid, total: s.total, correct: s.correct,
    })),
    fieldStats: SAMPLE_FIELD_STATS.map((f) => ({
      field_id: f.fieldId, field_name: f.fieldName, subject_id: f.subjectId,
      total: f.total, correct: f.correct, points: f.points,
    })),
    targets: [],
  };
}

function daysUntil(year: number): number {
  return Math.max(0, Math.ceil((new Date(`${year}-01-18`).getTime() - Date.now()) / 86400000));
}

function rateToColor(rate: number, total: number): string {
  if (total < 1) return "#374151";
  if (rate <= 0.5) {
    const t = rate / 0.5;
    return `rgb(${Math.round(220 - t * 30)},${Math.round(38 + t * 185)},38)`;
  }
  const t = (rate - 0.5) / 0.5;
  return `rgb(${Math.round(190 - t * 156)},${Math.round(223 - t * 26)},${Math.round(38 + t * 59)})`;
}

function rateToTextColor(rate: number): string {
  return rate > 0.6 ? "#052e16" : "#ffffff";
}

const DEVIATION_STORAGE_KEY = "kyoutsu_deviation";

function getSavedDeviation(): number {
  if (typeof window === "undefined") return 60;
  const saved = localStorage.getItem(DEVIATION_STORAGE_KEY);
  return saved ? Number(saved) : 60;
}

export default function Home() {
  const router = useRouter();
  const authUser = getAuthUser();
  const [overview, setOverview] = useState<OverviewData | null>(null);
  const [reviewCount, setReviewCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [deviation, setDeviation] = useState(getSavedDeviation);
  const [showDeviationPanel, setShowDeviationPanel] = useState(false);
  const [useApiData, setUseApiData] = useState(false);

  const remainingDays = daysUntil(authUser?.examYear || 2027);
  const targetTotal = authUser?.targetTotal || 780;

  useEffect(() => {
    Promise.all([
      apiGetOverview().catch(() => null),
      apiGetDueCount().catch(() => ({ count: 0 })),
    ]).then(([ov, rc]) => {
      if (ov && ov.fieldStats && ov.fieldStats.length > 0) {
        // APIデータがある場合: 回答データがある分野はAPIデータ、ない分野はクライアント補完
        const clientData = generateOverviewFromDeviation(deviation);
        const hasAnyAnswer = ov.fieldStats.some((f: FieldStat) => f.total > 0);

        if (hasAnyAnswer) {
          // APIデータを優先し、total=0の分野はクライアントデータで補完
          const clientMap = new Map(clientData.fieldStats.map((f) => [f.field_id, f]));
          const merged: FieldStat[] = ov.fieldStats.map((f: FieldStat) => {
            if (f.total > 0) return f;
            const fallback = clientMap.get(f.field_id);
            return fallback ? { ...f, total: fallback.total, correct: fallback.correct } : f;
          });
          setOverview({ ...ov, fieldStats: merged });
          setUseApiData(true);
        } else {
          // API分野構造はあるが回答なし → クライアントデータで全分野補完
          setOverview(clientData);
        }
      } else {
        setOverview(generateOverviewFromDeviation(deviation));
      }
      setReviewCount(rc?.count || 0);
      setLoading(false);
    });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  /** 偏差値変更時にヒートマップを再生成 */
  const handleDeviationChange = (newDev: number) => {
    setDeviation(newDev);
    localStorage.setItem(DEVIATION_STORAGE_KEY, String(newDev));
    if (!useApiData) {
      setOverview(generateOverviewFromDeviation(newDev));
    }
  };

  const currentTotal = overview?.subjectStats.reduce((sum, s) => {
    const max = SUBJECT_MAX[s.subject_id] || 100;
    const rate = s.total > 0 ? s.correct / s.total : 0;
    return sum + Math.round(rate * max);
  }, 0) || 0;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="flex justify-center animate-pulse mb-2">
            <LogoMark className="w-10 h-10" />
          </div>
          <p className="text-sm text-gray-500">{STATUS_COPY.LOADING.headline}</p>
          <p className="text-[10px] text-gray-600 mt-1">{STATUS_COPY.LOADING.sub}</p>
        </div>
      </div>
    );
  }

  if (!overview) {
    const seasonal = getSeasonalCopy(new Date().getMonth() + 1);
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center max-w-sm">
          <div className="flex justify-center mb-4">
            <LogoMark className="w-12 h-12" />
          </div>
          <h1 className="text-xl font-bold mb-2">{CATCHCOPY.ONBOARDING.headline}</h1>
          <p className="text-gray-400 text-sm mb-4">{CATCHCOPY.ONBOARDING.sub}</p>
          <p className="text-[10px] text-green-400/70 mb-6">{seasonal.headline}</p>
          <button onClick={() => router.push("/onboarding")}
            className="w-full py-3 bg-green-600 hover:bg-green-700 rounded-lg font-medium">偏差値を入力してスタート</button>
        </div>
      </div>
    );
  }

  const weakFields = overview.fieldStats
    .filter((f) => f.total >= 5)
    .map((f) => ({ ...f, rate: f.correct / f.total }))
    .sort((a, b) => a.rate - b.rate)
    .slice(0, 3);

  return (
    <div className="min-h-screen pb-16">
      {/* ── ヘッダー ── */}
      <header className="sticky top-0 z-40 bg-gray-950/90 backdrop-blur-md border-b border-gray-800/50 px-3 py-2">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1.5 font-bold text-base">
                <LogoMark />
                大学物語
              </span>
              <span className="text-[10px] px-1.5 py-0.5 bg-gray-800 rounded text-gray-400">{authUser?.displayName}</span>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <span className="text-red-400 font-bold">{remainingDays}日</span>
              <a href="/settings"
                className="px-2 py-1 rounded-md text-gray-500 hover:text-blue-400 hover:bg-blue-900/20 transition-colors text-[10px]">
                設定
              </a>
              <button
                onClick={logout}
                className="px-2 py-1 rounded-md text-gray-500 hover:text-red-400 hover:bg-red-900/20 transition-colors text-[10px]"
              >
                ログアウト
              </button>
            </div>
          </div>
          <div className="flex items-center gap-2 mt-1.5">
            <span className="text-lg font-mono font-bold">{currentTotal}</span>
            <div className="flex-1"><ScoreGauge current={currentTotal} target={targetTotal} max={TOTAL_MAX_SCORE} /></div>
            <span className="text-xs text-gray-500">/{TOTAL_MAX_SCORE}</span>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-3 pt-3">
        {/* クイックアクション */}
        <div className="flex gap-2 mb-3 overflow-x-auto pb-1">
          <QuickBtn href="/timekeeper/daily" icon="⚽" label="今日のタスク" accent="#22c55e" />
          <QuickBtn href="/study" icon="🔄" label={`復習${reviewCount}問`} accent="#eab308" />
          <QuickBtn href="/timekeeper" icon="🏃" label="ロードマップ" accent="#3b82f6" />
          <QuickBtn href="/analytics" icon="📊" label="分析" accent="#8b5cf6" />
          <QuickBtn href="/admin" icon="⚙" label="管理" accent="#6b7280" />
          <ShareButton currentScore={currentTotal} targetScore={targetTotal} />
        </div>

        {/* 弱点アラート */}
        {weakFields.length > 0 && (
          <div className="mb-3 p-2.5 bg-red-950/30 border border-red-900/30 rounded-xl">
            <div className="text-[10px] text-red-400 font-bold mb-1.5">{CATCHCOPY.WEAKNESS.headline} — クリックで強化</div>
            <div className="flex gap-1.5">
              {weakFields.map((wf) => (
                <button key={wf.field_id} onClick={() => router.push(`/drill/${wf.field_id}`)}
                  className="flex-1 p-2 rounded-lg text-center transition-all active:scale-95 bg-gray-900/50 border border-gray-800">
                  <div className="text-xs font-medium truncate">{wf.field_name}</div>
                  <div className="text-lg font-mono font-bold" style={{ color: rateToColor(wf.rate, wf.total) }}>
                    {Math.round(wf.rate * 100)}%
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ステージ別メッセージ */}
        {(() => {
          const overallRate = currentTotal / TOTAL_MAX_SCORE;
          const stage = getStageCopy(overallRate);
          return (
            <div className="mb-3 px-3 py-2 bg-gray-900/50 border border-gray-800/50 rounded-xl">
              <p className="text-xs font-bold text-green-400/80">{stage.headline}</p>
              <p className="text-[10px] text-gray-500 mt-0.5">{stage.encouragement}</p>
            </div>
          );
        })()}

        {/* ════ 配点ヒートマップ ════ */}
        <section>
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-sm font-bold">学習マップ</h2>
            <div className="flex items-center gap-2">
              <div className="flex gap-0.5">
                {["#dc2626","#f87171","#fde68a","#4ade80","#22c55e"].map((c,i) => (
                  <div key={i} className="w-3 h-2 rounded-sm" style={{backgroundColor:c}} />
                ))}
              </div>
              <button
                onClick={() => setShowDeviationPanel((v) => !v)}
                className="text-[10px] text-green-400 hover:text-green-300 font-medium"
              >
                偏差値 {deviation} {showDeviationPanel ? "▲" : "▼"}
              </button>
            </div>
          </div>

          {/* 偏差値変更パネル */}
          {showDeviationPanel && (
            <div className="mb-3 p-3 bg-gray-900 border border-gray-800 rounded-xl">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-gray-400">偏差値を変更</span>
                <span className="text-xs text-gray-500">{deviationLabel(deviation)}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-[10px] text-gray-600 w-6">35</span>
                <input
                  type="range"
                  min={35}
                  max={80}
                  value={deviation}
                  onChange={(e) => handleDeviationChange(Number(e.target.value))}
                  className="flex-1 h-2 bg-gray-800 rounded-full appearance-none cursor-pointer
                             [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5
                             [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:bg-green-500
                             [&::-webkit-slider-thumb]:rounded-full"
                />
                <span className="text-[10px] text-gray-600 w-6">80</span>
              </div>
              <div className="flex items-center justify-between mt-2">
                <span className="text-2xl font-mono font-bold text-green-400">{deviation}</span>
                <span className="text-xs text-gray-500">
                  推定得点 約{Math.round((0.58 + 0.35 * (2 / (1 + Math.exp(-1.5 * (deviation - 50) / 10)) - 1)) * 900)}/900
                </span>
              </div>
              {useApiData && (
                <p className="text-[10px] text-yellow-500 mt-2">
                  APIデータが有効です。偏差値変更はAPIデータなし時に反映されます。
                </p>
              )}
            </div>
          )}

          {/* 6ブロック グリッド */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {SUBJECT_GROUPS.map((group) => {
              const gFields = overview.fieldStats.filter((f) => group.subjectIds.includes(f.subject_id));
              const gTotal = gFields.reduce((s, f) => s + f.total, 0);
              const gCorrect = gFields.reduce((s, f) => s + f.correct, 0);
              const gRate = gTotal > 0 ? gCorrect / gTotal : 0;
              const estScore = Math.round(gRate * group.maxScore);

              // 弱点分野を特定
              const weakest = [...gFields].sort((a, b) => {
                const rA = a.total > 0 ? a.correct / a.total : 1;
                const rB = b.total > 0 ? b.correct / b.total : 1;
                return rA - rB;
              })[0];

              return (
                <div key={group.id} className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
                  {/* グループヘッダー (クリックで教科詳細へ) */}
                  <button
                    onClick={() => router.push(`/subject/${group.id}`)}
                    className="w-full px-2.5 py-1.5 border-b border-gray-800/50 flex justify-between items-center
                               hover:bg-gray-800/50 transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-1.5">
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: group.color }} />
                      <span className="font-bold text-sm">{group.label}</span>
                      <span className="text-[9px] text-gray-600">▶</span>
                    </div>
                    <span className="text-xs">
                      <span className="font-mono font-bold" style={{ color: rateToColor(gRate, gTotal) }}>{estScore}</span>
                      <span className="text-gray-600">/{group.maxScore}</span>
                    </span>
                  </button>

                  {/* 分野ブロック (配点比例 treemap) */}
                  <div className="p-1.5 flex flex-wrap gap-1">
                    {gFields.map((field) => {
                      const rate = field.total > 0 ? field.correct / field.total : 0;
                      const bgColor = rateToColor(rate, field.total);
                      const textColor = rateToTextColor(rate);

                      const totalPoints = gFields.reduce((s, f) => s + f.points, 0) || 1;
                      const sizeRatio = field.points / totalPoints;
                      const widthPercent = Math.max(28, Math.min(98, sizeRatio * 200));

                      return (
                        <button
                          key={field.field_id}
                          onClick={() => router.push(`/drill/${field.field_id}`)}
                          className="rounded-md px-1.5 py-1.5 text-left transition-all duration-200
                                     hover:brightness-125 hover:scale-[1.02] active:scale-95
                                     cursor-pointer relative group"
                          style={{
                            backgroundColor: bgColor,
                            color: textColor,
                            width: `calc(${widthPercent}% - 4px)`,
                            minHeight: "44px",
                          }}
                        >
                          <div className="text-[10px] font-medium leading-tight truncate">{field.field_name}</div>
                          <div className="text-[10px] font-mono font-bold opacity-90 mt-0.5">
                            {field.total > 0 ? `${Math.round(rate * 100)}%` : "—"}
                          </div>
                          <div className="text-[8px] opacity-50">{field.points}点</div>

                          {/* ツールチップ */}
                          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2
                                          bg-gray-900 border border-gray-700 rounded-lg px-3 py-2
                                          text-white text-xs whitespace-nowrap
                                          opacity-0 group-hover:opacity-100 pointer-events-none
                                          transition-opacity z-10 shadow-xl">
                            <div className="font-bold">{field.field_name}</div>
                            <div>正答率: {Math.round(rate * 100)}% ({field.correct}/{field.total})</div>
                            <div>配点: {field.points}点</div>
                            <div className="text-gray-400 mt-1">クリックで強化ドリルへ</div>
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  {/* 教科詳細リンク */}
                  <button
                    onClick={() => router.push(`/subject/${group.id}`)}
                    className="w-full py-1.5 text-[10px] border-t border-gray-800/50 transition-colors
                               hover:bg-gray-800/30 flex items-center justify-center gap-1"
                    style={{ color: group.color }}
                  >
                    {group.label}の詳細ヒートマップ →
                  </button>
                </div>
              );
            })}
          </div>

          {/* 凡例 */}
          <div className="mt-2 flex items-center gap-2 justify-center text-[10px] text-gray-600">
            <span>弱い</span>
            <div className="flex gap-0.5">
              {["#dc2626","#ef4444","#f87171","#fca5a5","#fde68a","#bef264","#4ade80","#22c55e"].map((c,i) => (
                <div key={i} className="w-4 h-2.5 rounded-sm" style={{backgroundColor:c}} />
              ))}
            </div>
            <span>習得済み</span>
            <span className="ml-2">ブロックサイズ = 配点</span>
          </div>
        </section>

        {/* フッターリンク */}
        <div className="mt-6 mb-4 flex items-center justify-center gap-4 text-[10px] text-gray-600">
          <a href="/lp" className="hover:text-gray-400 transition-colors">サービス紹介</a>
          <span>|</span>
          <a href="/brand" className="hover:text-gray-400 transition-colors">ブランドガイド</a>
        </div>
      </main>

      {/* ボトムナビ */}
      <nav className="fixed bottom-0 left-0 right-0 bg-gray-900/95 backdrop-blur border-t border-gray-800 z-50">
        <div className="max-w-5xl mx-auto flex justify-around py-1.5">
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

function QuickBtn({ href, icon, label, accent }: { href: string; icon: string; label: string; accent: string }) {
  return (
    <a href={href} className="flex items-center gap-1.5 px-3 py-2 rounded-xl border whitespace-nowrap text-xs shrink-0 active:scale-95"
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
