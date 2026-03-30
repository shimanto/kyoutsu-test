"use client";

import { useRouter } from "next/navigation";
import { TOTAL_MAX_SCORE } from "@kyoutsu/shared";
import { SubjectHeatmap } from "@/components/charts/SubjectHeatmap";
import { ScoreGauge } from "@/components/charts/ScoreGauge";
import { ReviewAlert } from "@/components/dashboard/ReviewAlert";
import { WeakPointList } from "@/components/dashboard/WeakPointList";
import { TodayTasks } from "@/components/dashboard/TodayTasks";
import {
  SAMPLE_USER,
  SAMPLE_TOTAL_SCORE,
  SAMPLE_FIELD_STATS,
  SAMPLE_REVIEW_DUE_COUNT,
  SAMPLE_TODAY_TASKS,
  getWeakPoints,
  SUBJECT_NAMES,
} from "@/lib/sample-data";

function daysUntil(dateStr: string): number {
  const target = new Date(dateStr);
  const now = new Date();
  return Math.ceil((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

export default function Home() {
  const router = useRouter();
  const remainingDays = daysUntil(SAMPLE_USER.examDate);
  const weakPoints = getWeakPoints(SAMPLE_FIELD_STATS, 5);

  const handleFieldClick = (fieldId: string, subjectId: string) => {
    router.push(`/drill/${fieldId}`);
  };

  return (
    <div className="min-h-screen p-4 md:p-8 max-w-7xl mx-auto pb-20">
      {/* ヘッダー */}
      <header className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">共通テスト攻略マップ</h1>
            <p className="text-xs text-gray-500 mt-0.5">
              {SAMPLE_USER.displayName} — 偏差値60サンプル
            </p>
          </div>
          <div className="text-right">
            <div className="text-xs text-gray-500">東大理科一類</div>
            <div className="text-red-400 text-sm font-bold">残り {remainingDays}日</div>
          </div>
        </div>

        {/* スコアサマリー */}
        <div className="mt-4 grid grid-cols-3 gap-3">
          <div className="bg-gray-900 rounded-lg border border-gray-800 p-3 text-center">
            <div className="text-xs text-gray-500">現在スコア</div>
            <div className="text-2xl font-mono font-bold text-white">{SAMPLE_TOTAL_SCORE}</div>
            <div className="text-[10px] text-gray-600">/ {TOTAL_MAX_SCORE}</div>
          </div>
          <div className="bg-gray-900 rounded-lg border border-gray-800 p-3 text-center">
            <div className="text-xs text-gray-500">目標</div>
            <div className="text-2xl font-mono font-bold text-green-400">{SAMPLE_USER.targetTotal}</div>
            <div className="text-[10px] text-gray-600">/ {TOTAL_MAX_SCORE}</div>
          </div>
          <div className="bg-gray-900 rounded-lg border border-gray-800 p-3 text-center">
            <div className="text-xs text-gray-500">あと</div>
            <div className="text-2xl font-mono font-bold text-amber-400">
              +{SAMPLE_USER.targetTotal - SAMPLE_TOTAL_SCORE}
            </div>
            <div className="text-[10px] text-gray-600">点必要</div>
          </div>
        </div>

        {/* プログレスバー */}
        <ScoreGauge
          current={SAMPLE_TOTAL_SCORE}
          target={SAMPLE_USER.targetTotal}
          max={TOTAL_MAX_SCORE}
        />
      </header>

      {/* ============ S&P500スタイル ヒートマップ ============ */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-bold">学習マップ</h2>
          <p className="text-[10px] text-gray-600">ブロックサイズ = 配点 ｜ 色 = 正答率 ｜ クリックで強化ドリルへ</p>
        </div>
        <SubjectHeatmap
          fieldStats={SAMPLE_FIELD_STATS}
          onFieldClick={handleFieldClick}
        />
        {/* 凡例 */}
        <div className="mt-3 flex items-center gap-2 justify-center text-xs text-gray-500">
          <span>弱い</span>
          <div className="flex gap-0.5">
            {["#dc2626", "#ef4444", "#f87171", "#fca5a5", "#fde68a", "#bef264", "#4ade80", "#22c55e"].map((c, i) => (
              <div key={i} className="w-5 h-3 rounded-sm" style={{ backgroundColor: c }} />
            ))}
          </div>
          <span>習得済み</span>
        </div>
      </section>

      {/* ============ サブパネル ============ */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
        <ReviewAlert count={SAMPLE_REVIEW_DUE_COUNT} />
        <WeakPointList
          weakPoints={weakPoints.map((wp) => ({
            fieldName: wp.fieldName,
            rate: wp.rate,
            subjectName: SUBJECT_NAMES[wp.subjectId] || wp.subjectId,
            fieldId: wp.fieldId,
          }))}
          onFieldClick={(fieldId) => router.push(`/drill/${fieldId}`)}
        />
        <TodayTasks tasks={SAMPLE_TODAY_TASKS} />
      </div>

      {/* ============ ボトムナビ ============ */}
      <nav className="fixed bottom-0 left-0 right-0 bg-gray-900/95 backdrop-blur border-t border-gray-800 px-4 py-2
                       flex justify-around items-center z-50">
        <NavItem href="/" label="マップ" icon="▣" active />
        <NavItem href="/timekeeper" label="タイムキーパー" icon="⚽" />
        <NavItem href="/study" label="学習" icon="📖" />
        <NavItem href="/analytics" label="分析" icon="📊" />
      </nav>
    </div>
  );
}

function NavItem({ href, icon, label, active = false }: {
  href: string; icon: string; label: string; active?: boolean;
}) {
  return (
    <a
      href={href}
      className={`flex flex-col items-center gap-0.5 text-xs transition-colors ${
        active ? "text-green-400" : "text-gray-500 hover:text-gray-300"
      }`}
    >
      <span className="text-lg">{icon}</span>
      <span>{label}</span>
    </a>
  );
}
