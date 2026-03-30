"use client";

import { useState } from "react";
import { SUBJECTS, TOTAL_MAX_SCORE } from "@kyoutsu/shared";
import { SubjectHeatmap } from "@/components/charts/SubjectHeatmap";
import { ScoreGauge } from "@/components/charts/ScoreGauge";
import { ReviewAlert } from "@/components/dashboard/ReviewAlert";
import { WeakPointList } from "@/components/dashboard/WeakPointList";
import { TodayTasks } from "@/components/dashboard/TodayTasks";

// デモデータ (後でAPI連携に置き換え)
const DEMO_USER = {
  displayName: "テストユーザー",
  targetBunrui: "rika1" as const,
  targetTotal: 780,
  examDate: "2027-01-16",
  currentTotal: 682,
};

const DEMO_FIELD_STATS = generateDemoFieldStats();

function generateDemoFieldStats() {
  // 実際はAPIから取得
  return [
    { fieldId: "kokugo_gendai", fieldName: "現代文", subjectId: "kokugo", total: 30, correct: 24, points: 110 },
    { fieldId: "kokugo_kobun", fieldName: "古文", subjectId: "kokugo", total: 20, correct: 10, points: 50 },
    { fieldId: "kokugo_kanbun", fieldName: "漢文", subjectId: "kokugo", total: 15, correct: 6, points: 40 },
    { fieldId: "m1a_suushiki", fieldName: "数と式", subjectId: "math1a", total: 20, correct: 16, points: 15 },
    { fieldId: "m1a_niji", fieldName: "2次関数", subjectId: "math1a", total: 18, correct: 13, points: 15 },
    { fieldId: "m1a_zukei", fieldName: "図形計量", subjectId: "math1a", total: 15, correct: 9, points: 20 },
    { fieldId: "m1a_data", fieldName: "データ", subjectId: "math1a", total: 12, correct: 10, points: 15 },
    { fieldId: "m1a_jougo", fieldName: "確率", subjectId: "math1a", total: 25, correct: 12, points: 20 },
    { fieldId: "m1a_seishitsu", fieldName: "図形性質", subjectId: "math1a", total: 10, correct: 7, points: 15 },
    { fieldId: "m2bc_shiki", fieldName: "式と証明", subjectId: "math2bc", total: 15, correct: 10, points: 15 },
    { fieldId: "m2bc_kansuu", fieldName: "三角指数", subjectId: "math2bc", total: 20, correct: 11, points: 20 },
    { fieldId: "m2bc_bibun", fieldName: "微積分", subjectId: "math2bc", total: 22, correct: 13, points: 20 },
    { fieldId: "m2bc_suuretsu", fieldName: "数列", subjectId: "math2bc", total: 18, correct: 14, points: 15 },
    { fieldId: "m2bc_vector", fieldName: "ベクトル", subjectId: "math2bc", total: 16, correct: 8, points: 15 },
    { fieldId: "m2bc_toukei", fieldName: "統計", subjectId: "math2bc", total: 10, correct: 7, points: 15 },
    { fieldId: "engr_q1", fieldName: "第1問", subjectId: "eng_read", total: 15, correct: 13, points: 10 },
    { fieldId: "engr_q2", fieldName: "第2問", subjectId: "eng_read", total: 15, correct: 12, points: 20 },
    { fieldId: "engr_q3", fieldName: "第3問", subjectId: "eng_read", total: 12, correct: 9, points: 15 },
    { fieldId: "engr_q4", fieldName: "第4問", subjectId: "eng_read", total: 14, correct: 8, points: 16 },
    { fieldId: "engr_q5", fieldName: "第5問", subjectId: "eng_read", total: 10, correct: 5, points: 15 },
    { fieldId: "engr_q6", fieldName: "第6問", subjectId: "eng_read", total: 12, correct: 6, points: 24 },
    { fieldId: "engl_q1", fieldName: "第1問", subjectId: "eng_listen", total: 12, correct: 10, points: 25 },
    { fieldId: "engl_q2", fieldName: "第2問", subjectId: "eng_listen", total: 12, correct: 9, points: 16 },
    { fieldId: "engl_q3", fieldName: "第3問", subjectId: "eng_listen", total: 10, correct: 7, points: 18 },
    { fieldId: "engl_q4", fieldName: "第4問", subjectId: "eng_listen", total: 10, correct: 6, points: 12 },
    { fieldId: "engl_q5", fieldName: "第5問", subjectId: "eng_listen", total: 8, correct: 4, points: 15 },
    { fieldId: "engl_q6", fieldName: "第6問", subjectId: "eng_listen", total: 8, correct: 5, points: 14 },
    { fieldId: "phys_rikigaku", fieldName: "力学", subjectId: "physics", total: 25, correct: 18, points: 30 },
    { fieldId: "phys_netsuri", fieldName: "熱力学", subjectId: "physics", total: 12, correct: 7, points: 15 },
    { fieldId: "phys_hadou", fieldName: "波動", subjectId: "physics", total: 15, correct: 9, points: 20 },
    { fieldId: "phys_denki", fieldName: "電磁気", subjectId: "physics", total: 20, correct: 10, points: 25 },
    { fieldId: "phys_genshi", fieldName: "原子", subjectId: "physics", total: 8, correct: 5, points: 10 },
    { fieldId: "chem_riron", fieldName: "理論化学", subjectId: "chemistry", total: 25, correct: 15, points: 35 },
    { fieldId: "chem_muki", fieldName: "無機化学", subjectId: "chemistry", total: 15, correct: 11, points: 20 },
    { fieldId: "chem_yuuki", fieldName: "有機化学", subjectId: "chemistry", total: 18, correct: 8, points: 30 },
    { fieldId: "chem_koubun", fieldName: "高分子", subjectId: "chemistry", total: 10, correct: 6, points: 15 },
    { fieldId: "soc_shizen", fieldName: "自然環境", subjectId: "social", total: 15, correct: 12, points: 20 },
    { fieldId: "soc_shigen", fieldName: "資源産業", subjectId: "social", total: 12, correct: 9, points: 25 },
    { fieldId: "soc_jinkou", fieldName: "人口都市", subjectId: "social", total: 10, correct: 6, points: 20 },
    { fieldId: "soc_chiiki", fieldName: "生活文化", subjectId: "social", total: 12, correct: 8, points: 20 },
    { fieldId: "soc_chizu", fieldName: "地図地域", subjectId: "social", total: 8, correct: 6, points: 15 },
    { fieldId: "info_joho", fieldName: "情報社会", subjectId: "info1", total: 10, correct: 8, points: 15 },
    { fieldId: "info_comm", fieldName: "情報デザイン", subjectId: "info1", total: 10, correct: 7, points: 20 },
    { fieldId: "info_comp", fieldName: "プログラミング", subjectId: "info1", total: 15, correct: 10, points: 30 },
    { fieldId: "info_network", fieldName: "ネットワーク", subjectId: "info1", total: 8, correct: 5, points: 15 },
    { fieldId: "info_data", fieldName: "データ活用", subjectId: "info1", total: 10, correct: 7, points: 20 },
  ];
}

function daysUntil(dateStr: string): number {
  const target = new Date(dateStr);
  const now = new Date();
  return Math.ceil((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

export default function DashboardPage() {
  const remainingDays = daysUntil(DEMO_USER.examDate);

  const handleFieldClick = (fieldId: string, subjectId: string) => {
    // TODO: 弱点ドリルへ遷移
    console.log("Start drill:", fieldId, subjectId);
  };

  return (
    <div className="min-h-screen p-4 md:p-8 max-w-7xl mx-auto">
      {/* ヘッダー */}
      <header className="mb-6">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold">共通テスト攻略マップ</h1>
          <div className="flex items-center gap-3">
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
          <span className="px-2 py-0.5 bg-gray-800 rounded text-xs">東大理一</span>
          <span>目標: {DEMO_USER.targetTotal} / {TOTAL_MAX_SCORE}</span>
          <span className="font-mono font-bold text-lg text-white">
            {DEMO_USER.currentTotal}
          </span>
          <span className="text-red-400">残り {remainingDays}日</span>
        </div>

        {/* プログレスバー */}
        <ScoreGauge
          current={DEMO_USER.currentTotal}
          target={DEMO_USER.targetTotal}
          max={TOTAL_MAX_SCORE}
        />
      </header>

      {/* メインヒートマップ */}
      <SubjectHeatmap
        fieldStats={DEMO_FIELD_STATS}
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
        <ReviewAlert count={23} />
        <WeakPointList
          weakPoints={[
            { fieldName: "漢文", rate: 0.40, subjectName: "国語" },
            { fieldName: "有機化学", rate: 0.44, subjectName: "化学" },
            { fieldName: "確率", rate: 0.48, subjectName: "数IA" },
            { fieldName: "電磁気", rate: 0.50, subjectName: "物理" },
            { fieldName: "ベクトル", rate: 0.50, subjectName: "数IIB" },
          ]}
        />
        <TodayTasks
          tasks={[
            { subject: "物理", task: "電磁気 弱点ドリル 10問", done: false },
            { subject: "化学", task: "有機化学 復習 8問", done: false },
            { subject: "数IA", task: "確率 演習 10問", done: true },
            { subject: "英語R", task: "第6問 長文演習", done: false },
          ]}
        />
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
