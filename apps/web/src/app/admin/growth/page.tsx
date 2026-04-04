"use client";

import { useState, useEffect } from "react";
import { GROWTH_PHASES } from "@kyoutsu/shared";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "https://kyoutsu-api.miyata-d23.workers.dev";

function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("kyoutsu_token");
}

async function fetchGrowth<T>(path: string): Promise<T> {
  const token = getToken();
  const res = await fetch(`${API_BASE}/admin/growth${path}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  if (!res.ok) throw new Error(`API error ${res.status}`);
  return res.json() as Promise<T>;
}

interface KpiData {
  snapshot: string;
  acquisition: { totalUsers: number; newUsersWeek: number; newUsersMonth: number };
  engagement: { wau: number; mau: number; totalSessions: number; totalAnswers: number };
  satisfaction: { feedbackCount: number; avgRating: number | null; nps: number | null };
}

interface RetentionData {
  d7: { cohortSize: number; retained: number; rate: number | null };
  d30: { cohortSize: number; retained: number; rate: number | null };
}

interface SubjectEngagement {
  subject_id: string;
  unique_learners: number;
  session_count: number;
  total_questions: number;
  avg_accuracy: number | null;
}

function KpiCard({ label, value, sub, color }: {
  label: string; value: string | number; sub?: string; color?: string;
}) {
  return (
    <div className="rounded-xl border border-gray-800 bg-gray-900/50 p-5">
      <p className="text-xs text-gray-400 uppercase tracking-wider">{label}</p>
      <p className={`text-3xl font-bold mt-1 ${color || "text-white"}`}>{value}</p>
      {sub && <p className="text-xs text-gray-500 mt-1">{sub}</p>}
    </div>
  );
}

function PhaseTimeline() {
  const phases = Object.values(GROWTH_PHASES);
  const now = new Date();
  // Phase 0 が現在と仮定 (2026年4月)
  const currentIdx = now < new Date("2026-06-01") ? 0
    : now < new Date("2026-09-01") ? 1
    : now < new Date("2026-12-01") ? 2
    : now < new Date("2027-04-01") ? 3 : 4;

  return (
    <div className="rounded-xl border border-gray-800 bg-gray-900/50 p-6">
      <h2 className="text-lg font-semibold text-white mb-4">成長フェーズ</h2>
      <div className="flex items-center gap-0">
        {phases.map((phase, i) => (
          <div key={phase.id} className="flex-1 relative">
            <div className="flex items-center">
              <div className={`w-4 h-4 rounded-full border-2 z-10 ${
                i < currentIdx ? "bg-green-500 border-green-500"
                : i === currentIdx ? "bg-blue-500 border-blue-500 ring-4 ring-blue-500/30"
                : "bg-gray-700 border-gray-600"
              }`} />
              {i < phases.length - 1 && (
                <div className={`flex-1 h-0.5 ${i < currentIdx ? "bg-green-500" : "bg-gray-700"}`} />
              )}
            </div>
            <div className="mt-2">
              <p className={`text-xs font-medium ${i === currentIdx ? "text-blue-400" : "text-gray-400"}`}>
                Phase {i}
              </p>
              <p className={`text-sm ${i === currentIdx ? "text-white font-semibold" : "text-gray-500"}`}>
                {phase.name}
              </p>
              <p className="text-xs text-gray-600">{phase.period}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function RetentionCard({ data }: { data: RetentionData | null }) {
  if (!data) return null;
  return (
    <div className="rounded-xl border border-gray-800 bg-gray-900/50 p-6">
      <h2 className="text-lg font-semibold text-white mb-4">リテンション</h2>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="text-xs text-gray-400">D7 継続率</p>
          <p className="text-2xl font-bold text-emerald-400">
            {data.d7.rate !== null ? `${(data.d7.rate * 100).toFixed(1)}%` : "—"}
          </p>
          <p className="text-xs text-gray-500">
            {data.d7.retained}/{data.d7.cohortSize} ユーザー
          </p>
          <div className="mt-2 h-2 bg-gray-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-emerald-500 rounded-full"
              style={{ width: `${(data.d7.rate || 0) * 100}%` }}
            />
          </div>
          <p className="text-xs text-gray-600 mt-1">目標: 40%</p>
        </div>
        <div>
          <p className="text-xs text-gray-400">D30 継続率</p>
          <p className="text-2xl font-bold text-blue-400">
            {data.d30.rate !== null ? `${(data.d30.rate * 100).toFixed(1)}%` : "—"}
          </p>
          <p className="text-xs text-gray-500">
            {data.d30.retained}/{data.d30.cohortSize} ユーザー
          </p>
          <div className="mt-2 h-2 bg-gray-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-500 rounded-full"
              style={{ width: `${(data.d30.rate || 0) * 100}%` }}
            />
          </div>
          <p className="text-xs text-gray-600 mt-1">目標: 20%</p>
        </div>
      </div>
    </div>
  );
}

function SubjectTable({ data }: { data: SubjectEngagement[] }) {
  if (!data.length) return null;
  return (
    <div className="rounded-xl border border-gray-800 bg-gray-900/50 p-6">
      <h2 className="text-lg font-semibold text-white mb-4">科目別エンゲージメント</h2>
      <table className="w-full text-sm">
        <thead>
          <tr className="text-gray-400 text-xs border-b border-gray-800">
            <th className="text-left py-2">科目</th>
            <th className="text-right py-2">学習者</th>
            <th className="text-right py-2">セッション</th>
            <th className="text-right py-2">問題数</th>
            <th className="text-right py-2">正答率</th>
          </tr>
        </thead>
        <tbody>
          {data.map((s) => (
            <tr key={s.subject_id} className="border-b border-gray-800/50">
              <td className="py-2 text-white">{s.subject_id}</td>
              <td className="py-2 text-right text-gray-300">{s.unique_learners}</td>
              <td className="py-2 text-right text-gray-300">{s.session_count}</td>
              <td className="py-2 text-right text-gray-300">{s.total_questions}</td>
              <td className="py-2 text-right">
                <span className={s.avg_accuracy && s.avg_accuracy >= 70 ? "text-green-400" : "text-amber-400"}>
                  {s.avg_accuracy ? `${s.avg_accuracy.toFixed(1)}%` : "—"}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function GrowthDashboardPage() {
  const [kpis, setKpis] = useState<KpiData | null>(null);
  const [retention, setRetention] = useState<RetentionData | null>(null);
  const [subjects, setSubjects] = useState<SubjectEngagement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const [kpiData, retData, subData] = await Promise.all([
          fetchGrowth<KpiData>("/kpis"),
          fetchGrowth<RetentionData>("/retention"),
          fetchGrowth<{ subjectEngagement: SubjectEngagement[] }>("/subject-engagement"),
        ]);
        setKpis(kpiData);
        setRetention(retData);
        setSubjects(subData.subjectEngagement);
      } catch (e) {
        setError(e instanceof Error ? e.message : "データ取得に失敗しました");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-950 p-8">
        <div className="bg-red-900/30 border border-red-700 rounded-xl p-4 text-red-300">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 p-6 md:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* ヘッダー */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">成長ダッシュボード</h1>
            <p className="text-sm text-gray-400">
              スナップショット: {kpis?.snapshot || "—"}
            </p>
          </div>
          <a
            href="/admin"
            className="text-sm text-gray-400 hover:text-white transition-colors"
          >
            ← 管理画面
          </a>
        </div>

        {/* フェーズタイムライン */}
        <PhaseTimeline />

        {/* North Star + 主要KPI */}
        <div>
          <h2 className="text-xs text-gray-500 uppercase tracking-wider mb-3">
            North Star: 週間アクティブ学習者 (WAU)
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <KpiCard
              label="WAU"
              value={kpis?.engagement.wau || 0}
              color="text-green-400"
              sub="週間アクティブ"
            />
            <KpiCard
              label="MAU"
              value={kpis?.engagement.mau || 0}
              color="text-blue-400"
              sub="月間アクティブ"
            />
            <KpiCard
              label="総ユーザー"
              value={kpis?.acquisition.totalUsers || 0}
              sub={`今週 +${kpis?.acquisition.newUsersWeek || 0}`}
            />
            <KpiCard
              label="NPS"
              value={kpis?.satisfaction.nps ?? "—"}
              color={
                (kpis?.satisfaction.nps ?? -1) >= 50
                  ? "text-green-400"
                  : (kpis?.satisfaction.nps ?? -1) >= 0
                  ? "text-amber-400"
                  : "text-red-400"
              }
              sub={`回答数: ${kpis?.satisfaction.feedbackCount || 0}`}
            />
          </div>
        </div>

        {/* エンゲージメント */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <KpiCard
            label="総セッション"
            value={kpis?.engagement.totalSessions || 0}
          />
          <KpiCard
            label="総回答数"
            value={kpis?.engagement.totalAnswers || 0}
          />
          <KpiCard
            label="月間新規"
            value={kpis?.acquisition.newUsersMonth || 0}
            color="text-purple-400"
          />
          <KpiCard
            label="平均評価"
            value={kpis?.satisfaction.avgRating ?? "—"}
            sub="/5.0"
          />
        </div>

        {/* リテンション + 科目別 */}
        <div className="grid md:grid-cols-2 gap-6">
          <RetentionCard data={retention} />
          <SubjectTable data={subjects} />
        </div>

        {/* ロードマップリンク */}
        <div className="rounded-xl border border-gray-800 bg-gray-900/50 p-6">
          <h2 className="text-lg font-semibold text-white mb-2">成長戦略ロードマップ</h2>
          <p className="text-sm text-gray-400 mb-3">
            Phase 0〜4 の詳細な戦略・KPI目標・収益シミュレーションは
            ロードマップドキュメントを参照してください。
          </p>
          <div className="flex flex-wrap gap-3 text-xs">
            <span className="px-3 py-1 rounded-full bg-green-900/30 border border-green-700 text-green-400">
              Phase 0: MVP検証 (4-5月)
            </span>
            <span className="px-3 py-1 rounded-full bg-blue-900/30 border border-blue-700 text-blue-400">
              Phase 1: PMF達成 (6-8月)
            </span>
            <span className="px-3 py-1 rounded-full bg-purple-900/30 border border-purple-700 text-purple-400">
              Phase 2: グロース (9-11月)
            </span>
            <span className="px-3 py-1 rounded-full bg-amber-900/30 border border-amber-700 text-amber-400">
              Phase 3: 収益化 (12-3月)
            </span>
            <span className="px-3 py-1 rounded-full bg-gray-800 border border-gray-600 text-gray-300">
              Phase 4: スケール (2027年4月〜)
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
