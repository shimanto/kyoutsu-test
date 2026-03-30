"use client";

import { useRouter } from "next/navigation";
import { TOTAL_MAX_SCORE } from "@kyoutsu/shared";
import { MobileHeatmap } from "@/components/charts/MobileHeatmap";
import { ScoreGauge } from "@/components/charts/ScoreGauge";
import { getAuthUser, logout } from "@/lib/auth";
import { SAMPLE_USER, SAMPLE_TOTAL_SCORE, SAMPLE_REVIEW_DUE_COUNT } from "@/lib/sample-data";
import { HIERARCHY_DATA } from "@/lib/hierarchy-data";

function daysUntil(dateStr: string): number {
  return Math.ceil((new Date(dateStr).getTime() - Date.now()) / 86400000);
}

export default function Home() {
  const router = useRouter();
  const authUser = getAuthUser();
  const remainingDays = daysUntil(SAMPLE_USER.examDate);

  // 弱点TOP3 を階層データから計算
  const weakFields = HIERARCHY_DATA.flatMap((g) =>
    g.fields.filter((f) => f.total >= 10).map((f) => ({
      ...f, groupColor: g.color, groupLabel: g.label,
      rate: f.correct / f.total,
    }))
  ).sort((a, b) => a.rate - b.rate).slice(0, 3);

  return (
    <div className="min-h-screen pb-16">
      {/* ── ヘッダー (コンパクト) ── */}
      <header className="sticky top-0 z-40 bg-gray-950/90 backdrop-blur-md border-b border-gray-800/50 px-3 py-2">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-base font-bold">📚 大学物語</span>
              <span className="text-[10px] px-1.5 py-0.5 bg-gray-800 rounded text-gray-400">東大理一</span>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <span className="text-red-400 font-bold">{remainingDays}日</span>
              <button onClick={logout} className="text-gray-600 hover:text-gray-400">⏏</button>
            </div>
          </div>

          {/* スコアバー */}
          <div className="flex items-center gap-2 mt-1.5">
            <span className="text-lg font-mono font-bold">{SAMPLE_TOTAL_SCORE}</span>
            <div className="flex-1">
              <ScoreGauge current={SAMPLE_TOTAL_SCORE} target={SAMPLE_USER.targetTotal} max={TOTAL_MAX_SCORE} />
            </div>
            <span className="text-xs text-gray-500">/{TOTAL_MAX_SCORE}</span>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-3 pt-3">
        {/* ── クイックアクション ── */}
        <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
          <QuickBtn href="/timekeeper/daily" icon="⚽" label="今日のタスク" accent="#22c55e" />
          <QuickBtn href="/study" icon="🔄" label={`復習${SAMPLE_REVIEW_DUE_COUNT}問`} accent="#eab308" />
          <QuickBtn href="/timekeeper" icon="🏃" label="ロードマップ" accent="#3b82f6" />
          <QuickBtn href="/analytics" icon="📊" label="分析" accent="#8b5cf6" />
        </div>

        {/* ── 弱点アラート ── */}
        {weakFields.length > 0 && (
          <div className="mb-4 p-2.5 bg-red-950/30 border border-red-900/30 rounded-xl">
            <div className="text-[10px] text-red-400 font-bold mb-1.5">弱点 — クリックで強化</div>
            <div className="flex gap-1.5">
              {weakFields.map((wf) => (
                <button
                  key={wf.fieldId}
                  onClick={() => router.push(`/drill/${wf.fieldId}`)}
                  className="flex-1 p-2 rounded-lg text-center transition-all active:scale-95"
                  style={{ backgroundColor: `${wf.groupColor}15`, border: `1px solid ${wf.groupColor}33` }}
                >
                  <div className="text-xs font-medium truncate">{wf.fieldName}</div>
                  <div className="text-lg font-mono font-bold" style={{ color: rateColor(wf.rate) }}>
                    {Math.round(wf.rate * 100)}%
                  </div>
                  <div className="text-[9px] text-gray-500">{wf.groupLabel}</div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ── 学習マップ (ヒートマップ) ── */}
        <section>
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-sm font-bold">学習マップ</h2>
            <div className="flex gap-1">
              {["#dc2626","#f87171","#fde68a","#4ade80","#22c55e"].map((c,i) => (
                <div key={i} className="w-3 h-2 rounded-sm" style={{backgroundColor:c}} />
              ))}
            </div>
          </div>
          <MobileHeatmap onDrill={(fieldId) => router.push(`/drill/${fieldId}`)} />
        </section>
      </main>

      {/* ── ボトムナビ ── */}
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

function rateColor(rate: number): string {
  if (rate >= 0.8) return "#22c55e";
  if (rate >= 0.65) return "#eab308";
  if (rate >= 0.5) return "#f97316";
  return "#ef4444";
}
