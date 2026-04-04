"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { SUBJECTS, TOTAL_MAX_SCORE } from "@kyoutsu/shared";
import { SubjectHeatmap } from "@/components/charts/SubjectHeatmap";
import { ScoreGauge } from "@/components/charts/ScoreGauge";
import { ReviewAlert } from "@/components/dashboard/ReviewAlert";
import { WeakPointList } from "@/components/dashboard/WeakPointList";
import { TodayTasks } from "@/components/dashboard/TodayTasks";
import { getAuthUser } from "@/lib/auth";
import {
  apiGetOverview,
  apiGetDueCount,
  apiGetTodayTasks,
  apiStartSession,
} from "@/lib/api";

interface FieldStat {
  fieldId: string;
  fieldName: string;
  subjectId: string;
  total: number;
  correct: number;
  points: number;
}

interface WeakPoint {
  fieldName: string;
  rate: number;
  subjectName: string;
  fieldId: string;
}

interface TodayTask {
  subject: string;
  task: string;
  done: boolean;
}

function daysUntil(year: number): number {
  // 共通テスト: 1月第3土曜日 (概算で1月18日)
  const target = new Date(year, 0, 18);
  const now = new Date();
  return Math.ceil((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

export default function DashboardPage() {
  const router = useRouter();
  const authUser = getAuthUser();

  const [fieldStats, setFieldStats] = useState<FieldStat[]>([]);
  const [currentTotal, setCurrentTotal] = useState(0);
  const [reviewCount, setReviewCount] = useState(0);
  const [weakPoints, setWeakPoints] = useState<WeakPoint[]>([]);
  const [todayTasks, setTodayTasks] = useState<TodayTask[]>([]);
  const [loading, setLoading] = useState(true);

  const targetTotal = authUser?.targetTotal || 780;
  const examYear = authUser?.examYear || new Date().getFullYear() + 1;
  const remainingDays = daysUntil(examYear);

  useEffect(() => {
    async function load() {
      try {
        const [overview, dueCount, tasks] = await Promise.all([
          apiGetOverview(),
          apiGetDueCount(),
          apiGetTodayTasks().catch(() => ({ tasks: [] as Record<string, unknown>[] })),
        ]);

        // フィールド統計をヒートマップ用に変換
        const stats: FieldStat[] = overview.fieldStats.map((f) => ({
          fieldId: f.field_id,
          fieldName: f.field_name,
          subjectId: f.subject_id,
          total: f.total,
          correct: f.correct,
          points: f.points,
        }));
        setFieldStats(stats);

        // 現在の推定合計点を計算
        const subjectMap = new Map<string, { total: number; correct: number }>();
        for (const s of overview.subjectStats) {
          subjectMap.set(s.subject_id, { total: s.total, correct: s.correct });
        }
        let total = 0;
        for (const subj of SUBJECTS) {
          const s = subjectMap.get(subj.id);
          if (s && s.total > 0) {
            total += Math.round((s.correct / s.total) * subj.maxScore);
          }
        }
        setCurrentTotal(total);

        // 復習件数
        setReviewCount(dueCount.count);

        // 弱点抽出 (正答率の低い分野TOP5、最低5問以上回答)
        const weak = stats
          .filter((f) => f.total >= 5)
          .map((f) => ({
            fieldName: f.fieldName,
            rate: f.total > 0 ? f.correct / f.total : 0,
            subjectName: SUBJECTS.find((s) => s.id === f.subjectId)?.shortName || "",
            fieldId: f.fieldId,
          }))
          .sort((a, b) => a.rate - b.rate)
          .slice(0, 5);
        setWeakPoints(weak);

        // 今日のタスク
        const subjectNameMap = Object.fromEntries(SUBJECTS.map((s) => [s.id, s.shortName]));
        const taskTypeLabels: Record<string, string> = {
          new_learn: "新規学習",
          review: "復習",
          weakness: "弱点ドリル",
          exam: "模試演習",
        };
        const todayTaskList: TodayTask[] = (tasks.tasks as Record<string, unknown>[]).map((t) => ({
          subject: subjectNameMap[t.subject_id as string] || String(t.subject_id),
          task: `${taskTypeLabels[t.task_type as string] || t.task_type} ${t.target_question_count || 10}問`,
          done: !!(t.completed_at),
        }));
        setTodayTasks(todayTaskList);
      } catch (e) {
        console.error("Dashboard load error:", e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const handleFieldClick = useCallback(async (fieldId: string, subjectId: string) => {
    try {
      const { sessionId } = await apiStartSession({
        sessionType: "weakness",
        subjectId,
        fieldId,
        questionCount: 10,
      });
      router.push(`/study/${sessionId}`);
    } catch (e) {
      console.error("Failed to start drill:", e);
    }
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-400 animate-pulse">読み込み中...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 md:p-8 max-w-7xl mx-auto">
      {/* ヘッダー */}
      <header className="mb-6">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold">共通テスト攻略マップ</h1>
          <div className="flex items-center gap-3">
            <a
              href="/feedback"
              className="text-xs text-green-500/70 hover:text-green-400 transition-colors"
            >
              ご意見
            </a>
            <a
              href="/onboarding"
              className="text-xs text-gray-500 hover:text-gray-300 transition-colors"
            >
              模試スコア更新
            </a>
            <div className="w-8 h-8 rounded-full bg-gray-700" />
          </div>
        </div>
        <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-gray-400">
          <span className="px-2 py-0.5 bg-gray-800 rounded text-xs">
            {authUser?.targetBunrui === "rika1" ? "東大理一" : authUser?.targetBunrui || "東大理一"}
          </span>
          <span>目標: {targetTotal} / {TOTAL_MAX_SCORE}</span>
          <span className="font-mono font-bold text-lg text-white">
            {currentTotal}
          </span>
          <span className="text-red-400">残り {remainingDays}日</span>
        </div>

        {/* プログレスバー */}
        <ScoreGauge
          current={currentTotal}
          target={targetTotal}
          max={TOTAL_MAX_SCORE}
        />
      </header>

      {/* メインヒートマップ */}
      <SubjectHeatmap
        fieldStats={fieldStats}
        onFieldClick={handleFieldClick}
      />

      {/* 凡例 */}
      <div className="mt-4 flex items-center gap-2 justify-center text-xs text-gray-400">
        <span>弱い</span>
        <div className="flex gap-0.5">
          {["#dc2626", "#ef4444", "#f87171", "#fca5a5", "#fde68a", "#bef264", "#4ade80", "#22c55e"].map((c, i) => (
            <div key={i} className="w-5 h-3 rounded-sm" style={{ backgroundColor: c }} />
          ))}
        </div>
        <span>習得済み</span>
        <span className="ml-4 text-gray-600">ブロックサイズ = 配点</span>
      </div>

      {/* サブパネル */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
        <ReviewAlert count={reviewCount} />
        <WeakPointList
          weakPoints={weakPoints}
          onFieldClick={(fieldId) => {
            const stat = fieldStats.find((f) => f.fieldId === fieldId);
            if (stat) handleFieldClick(fieldId, stat.subjectId);
          }}
        />
        <TodayTasks tasks={todayTasks} />
      </div>

      {/* ボトムナビ */}
      <nav className="fixed bottom-0 left-0 right-0 bg-gray-900 border-t border-gray-800 px-4 py-2
                       flex justify-around items-center md:hidden">
        <NavItem href="/dashboard" icon="grid" label="マップ" active />
        <NavItem href="/study" icon="book" label="学習" />
        <NavItem href="/exams" icon="edit" label="模試" />
        <NavItem href="/analytics" icon="chart" label="分析" />
        <NavItem href="/settings" icon="gear" label="設定" />
      </nav>
    </div>
  );
}

function NavItem({ href, icon, label, active = false }: {
  href: string; icon: string; label: string; active?: boolean;
}) {
  const iconMap: Record<string, string> = {
    grid: "▣", book: "📖", edit: "✏️", chart: "📊", gear: "⚙",
  };
  return (
    <a
      href={href}
      className={`flex flex-col items-center gap-0.5 text-xs ${
        active ? "text-green-400" : "text-gray-500 hover:text-gray-300"
      }`}
    >
      <span className="text-lg">{iconMap[icon]}</span>
      <span>{label}</span>
    </a>
  );
}
