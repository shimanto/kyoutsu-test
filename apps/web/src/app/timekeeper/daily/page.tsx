"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";

// ─── 1日のスケジュール定義 ───
interface DailySubject {
  id: string;
  name: string;
  shortName: string;
  color: string;
  targetMinutes: number; // 目標学習時間(分)
  fieldName: string;     // 今日のメインタスク
}

interface CellState {
  achievement: number; // 0, 25, 50, 75, 100
}

// 今日の学習科目 (4-5科目)
const TODAY_SUBJECTS: DailySubject[] = [
  { id: "chem",  name: "化学",   shortName: "化", color: "#8b5cf6", targetMinutes: 60, fieldName: "有機化学ドリル" },
  { id: "math",  name: "数学",   shortName: "数", color: "#3b82f6", targetMinutes: 60, fieldName: "ベクトル演習" },
  { id: "eng",   name: "英語",   shortName: "英", color: "#ec4899", targetMinutes: 60, fieldName: "リスニング第5問" },
  { id: "phys",  name: "物理",   shortName: "物", color: "#14b8a6", targetMinutes: 30, fieldName: "電磁気復習" },
  { id: "kokugo",name: "国語",   shortName: "国", color: "#f97316", targetMinutes: 30, fieldName: "古文読解" },
];

const SLOT_MINUTES = 30;
const TOTAL_HOURS = 4; // 今日の学習可能時間

/** 達成度の選択肢 */
const ACHIEVEMENT_OPTIONS = [0, 25, 50, 75, 100];

/** 達成度 → 色 */
function achievementColor(pct: number, baseColor: string): string {
  if (pct === 0) return "transparent";
  const opacity = 0.2 + (pct / 100) * 0.8;
  return `color-mix(in srgb, ${baseColor} ${Math.round(opacity * 100)}%, transparent)`;
}

function achievementBorderColor(pct: number, baseColor: string): string {
  if (pct === 0) return "#374151";
  return baseColor;
}

export default function DailyTimekeeperPage() {
  const router = useRouter();
  const today = new Date().toISOString().slice(0, 10);
  const dayNames = ["日", "月", "火", "水", "木", "金", "土"];
  const dayOfWeek = dayNames[new Date().getDay()];

  // 各科目を30分スロットに分割
  const subjectSlots = useMemo(() => {
    return TODAY_SUBJECTS.map((sub) => ({
      ...sub,
      slotCount: Math.max(1, Math.ceil(sub.targetMinutes / SLOT_MINUTES)),
    }));
  }, []);

  // 全体の最大スロット数 (行数)
  const maxSlots = Math.max(...subjectSlots.map((s) => s.slotCount));

  // セル状態管理: key = "subjectId-slotIndex"
  const [cells, setCells] = useState<Record<string, CellState>>(() => {
    const init: Record<string, CellState> = {};
    subjectSlots.forEach((sub) => {
      for (let i = 0; i < sub.slotCount; i++) {
        init[`${sub.id}-${i}`] = { achievement: 0 };
      }
    });
    return init;
  });

  // アクティブなポップオーバー
  const [activeCell, setActiveCell] = useState<string | null>(null);

  const setCellAchievement = (key: string, value: number) => {
    setCells((prev) => ({ ...prev, [key]: { achievement: value } }));
    setActiveCell(null);
  };

  // 全体の達成率
  const totalCells = Object.keys(cells).length;
  const totalAchievement = Object.values(cells).reduce((s, c) => s + c.achievement, 0);
  const overallPct = totalCells > 0 ? Math.round(totalAchievement / totalCells) : 0;

  // 科目別達成率
  const subjectStats = subjectSlots.map((sub) => {
    let sum = 0;
    for (let i = 0; i < sub.slotCount; i++) {
      sum += cells[`${sub.id}-${i}`]?.achievement || 0;
    }
    return {
      ...sub,
      avgAchievement: Math.round(sum / sub.slotCount),
    };
  });

  // 台形のパースペクティブ: 上が狭く、下が広い
  // 各行の幅を計算 (上から下へ広がる)
  const getRowScale = (rowIdx: number): number => {
    if (maxSlots <= 1) return 1;
    const t = rowIdx / (maxSlots - 1); // 0=上(狭い), 1=下(広い)
    return 0.6 + t * 0.4; // 60%〜100%
  };

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 pb-20">
      {/* ヘッダー */}
      <header className="px-4 pt-4 pb-3 md:px-8 max-w-3xl mx-auto">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => router.push("/timekeeper")} className="text-gray-500 hover:text-gray-300 text-sm">
              ← 廊下
            </button>
            <h1 className="text-lg font-bold">タイムキーパーさん — 今日の学習</h1>
          </div>
          <span className="text-sm text-gray-400">{today} ({dayOfWeek})</span>
        </div>

        {/* タイムキーパーさんメッセージ */}
        <div className="mt-3 bg-gray-900 rounded-xl border border-gray-800 p-3 flex items-center gap-3">
          <div className="text-2xl shrink-0">🧤⚽</div>
          <div className="text-sm">
            {overallPct === 100
              ? "パーフェクトセーブ！全セル完了だ！明日の分も先取りしよう！"
              : overallPct >= 75
              ? `あと少し！${100 - overallPct}%で今日のゴールだ！`
              : overallPct >= 25
              ? "いい調子だ！セルをクリックして達成度を記録しよう！"
              : "さあキックオフ！各セルをクリックして学習を始めよう！"}
          </div>
        </div>
      </header>

      {/* ─── 全体達成メーター ─── */}
      <div className="max-w-3xl mx-auto px-4 mb-6">
        <div className="flex items-center gap-3">
          <span className="text-xs text-gray-500 w-12">達成率</span>
          <div className="flex-1 h-6 bg-gray-900 rounded-full border border-gray-800 overflow-hidden relative">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${overallPct}%`,
                background: overallPct >= 80
                  ? "linear-gradient(90deg, #22c55e, #4ade80)"
                  : overallPct >= 50
                  ? "linear-gradient(90deg, #eab308, #facc15)"
                  : "linear-gradient(90deg, #ef4444, #f87171)",
              }}
            />
            <span className="absolute inset-0 flex items-center justify-center text-xs font-mono font-bold">
              {overallPct}%
            </span>
          </div>
          <span className="text-xs text-gray-500 w-12 text-right">{TOTAL_HOURS}h</span>
        </div>
      </div>

      {/* ─── 台形グリッド ─── */}
      <div className="max-w-3xl mx-auto px-4" style={{ perspective: "600px" }}>
        <div
          className="relative"
          style={{
            transformStyle: "preserve-3d",
            transform: "rotateX(8deg)",
            transformOrigin: "center bottom",
          }}
        >
          {/* 科目ヘッダー */}
          <div className="flex justify-center gap-1 mb-2" style={{ transform: `scaleX(${getRowScale(0)})` }}>
            {subjectSlots.map((sub) => (
              <div
                key={sub.id}
                className="text-center flex-1 min-w-0"
                style={{ maxWidth: `${100 / subjectSlots.length}%` }}
              >
                <div
                  className="text-xs font-bold px-1 py-1 rounded-t-lg"
                  style={{ backgroundColor: `${sub.color}33`, color: sub.color }}
                >
                  {sub.shortName}
                </div>
                <div className="text-[9px] text-gray-600 truncate">{sub.fieldName}</div>
              </div>
            ))}
          </div>

          {/* 時間軸ラベル + セルグリッド */}
          {Array.from({ length: maxSlots }).map((_, rowIdx) => {
            const scale = getRowScale(rowIdx);
            const timeLabel = `${Math.floor((rowIdx * SLOT_MINUTES) / 60)}:${String((rowIdx * SLOT_MINUTES) % 60).padStart(2, "0")}`;

            return (
              <div key={rowIdx} className="flex items-stretch justify-center mb-0.5" style={{ transform: `scaleX(${scale})` }}>
                {/* 時間ラベル */}
                <div className="w-10 shrink-0 flex items-center justify-end pr-1.5">
                  <span className="text-[9px] text-gray-600 font-mono">{timeLabel}</span>
                </div>

                {/* 各科目セル */}
                <div className="flex gap-0.5 flex-1">
                  {subjectSlots.map((sub) => {
                    const key = `${sub.id}-${rowIdx}`;
                    const hasSlot = rowIdx < sub.slotCount;
                    const cell = cells[key];

                    if (!hasSlot) {
                      return (
                        <div key={key} className="flex-1 h-16 rounded-md bg-gray-900/30 border border-gray-900/20" />
                      );
                    }

                    const pct = cell?.achievement || 0;
                    const isActive = activeCell === key;

                    return (
                      <div key={key} className="flex-1 relative">
                        <button
                          onClick={() => setActiveCell(isActive ? null : key)}
                          className="w-full h-16 rounded-md border-2 transition-all duration-200
                                     flex flex-col items-center justify-center gap-0.5
                                     hover:brightness-125 active:scale-95 cursor-pointer"
                          style={{
                            backgroundColor: achievementColor(pct, sub.color),
                            borderColor: achievementBorderColor(pct, sub.color),
                          }}
                        >
                          {/* 達成パーセント */}
                          <span
                            className="text-sm font-mono font-bold"
                            style={{ color: pct > 0 ? sub.color : "#4b5563" }}
                          >
                            {pct > 0 ? `${pct}%` : "—"}
                          </span>
                          <span className="text-[8px] text-gray-500">30min</span>
                        </button>

                        {/* 達成度セレクター (ポップオーバー) */}
                        {isActive && (
                          <div className="absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-2
                                          bg-gray-900 border border-gray-700 rounded-xl p-2 shadow-2xl
                                          min-w-[140px]">
                            <div className="text-[10px] text-gray-500 text-center mb-1.5">
                              {sub.name} — {timeLabel}〜
                            </div>
                            <div className="flex flex-col gap-1">
                              {ACHIEVEMENT_OPTIONS.map((opt) => (
                                <button
                                  key={opt}
                                  onClick={() => setCellAchievement(key, opt)}
                                  className={`flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs transition-colors
                                             ${pct === opt ? "ring-2 ring-offset-1 ring-offset-gray-900" : "hover:bg-gray-800"}`}
                                  style={{
                                    backgroundColor: opt > 0 ? achievementColor(opt, sub.color) : undefined,
                                    outlineColor: pct === opt ? sub.color : undefined,
                                  }}
                                >
                                  <div
                                    className="w-8 h-3 rounded-sm border"
                                    style={{
                                      backgroundColor: achievementColor(opt, sub.color),
                                      borderColor: opt > 0 ? sub.color : "#4b5563",
                                    }}
                                  />
                                  <span className="font-mono font-bold" style={{ color: opt > 0 ? sub.color : "#6b7280" }}>
                                    {opt}%
                                  </span>
                                  <span className="text-gray-500 ml-auto">
                                    {opt === 0 ? "未着手" : opt === 25 ? "少し" : opt === 50 ? "半分" : opt === 75 ? "ほぼ" : "完了！"}
                                  </span>
                                </button>
                              ))}
                            </div>
                            <div className="border-t border-gray-800 mt-1.5 pt-1.5">
                              <button
                                onClick={() => setActiveCell(null)}
                                className="w-full text-center text-[10px] text-gray-600 hover:text-gray-400"
                              >
                                閉じる
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* 右側ラベル (終了時刻) */}
                <div className="w-10 shrink-0 flex items-center pl-1.5">
                  {rowIdx === maxSlots - 1 && (
                    <span className="text-[9px] text-gray-600 font-mono">
                      {Math.floor(((rowIdx + 1) * SLOT_MINUTES) / 60)}:{String(((rowIdx + 1) * SLOT_MINUTES) % 60).padStart(2, "0")}
                    </span>
                  )}
                </div>
              </div>
            );
          })}

          {/* 台形の底辺ライン */}
          <div className="flex justify-center mt-1">
            <div className="h-1 rounded-full bg-gradient-to-r from-transparent via-green-500 to-transparent" style={{ width: "100%" }} />
          </div>
        </div>
      </div>

      {/* ─── 科目別サマリー ─── */}
      <div className="max-w-3xl mx-auto px-4 mt-8">
        <h2 className="text-sm font-bold text-gray-400 mb-3">科目別達成率</h2>
        <div className="grid grid-cols-5 gap-2">
          {subjectStats.map((sub) => (
            <div
              key={sub.id}
              className="bg-gray-900 rounded-lg border p-3 text-center transition-all"
              style={{
                borderColor: sub.avgAchievement >= 75 ? sub.color : "#1f2937",
                boxShadow: sub.avgAchievement >= 75 ? `0 0 12px ${sub.color}22` : "none",
              }}
            >
              <div className="text-lg font-bold" style={{ color: sub.color }}>{sub.shortName}</div>
              <div className="text-xs text-gray-500 mt-0.5">{sub.targetMinutes}分</div>
              <div className="mt-2 relative w-full h-1.5 bg-gray-800 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{ width: `${sub.avgAchievement}%`, backgroundColor: sub.color }}
                />
              </div>
              <div className="text-sm font-mono font-bold mt-1" style={{ color: sub.avgAchievement > 0 ? sub.color : "#4b5563" }}>
                {sub.avgAchievement}%
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ─── 面積可視化 (学習量バー) ─── */}
      <div className="max-w-3xl mx-auto px-4 mt-6">
        <h2 className="text-sm font-bold text-gray-400 mb-3">学習量 (面積)</h2>
        <div className="space-y-2">
          {subjectStats.map((sub) => {
            const filledArea = sub.avgAchievement;
            const targetArea = 100;
            return (
              <div key={sub.id} className="flex items-center gap-2">
                <span className="w-6 text-center text-xs font-bold" style={{ color: sub.color }}>{sub.shortName}</span>
                <div className="flex-1 h-6 bg-gray-900 rounded-lg border border-gray-800 overflow-hidden relative">
                  {/* 目標ライン (100%) */}
                  <div
                    className="absolute h-full transition-all duration-500 rounded-lg"
                    style={{
                      width: `${filledArea}%`,
                      background: `linear-gradient(90deg, ${sub.color}66, ${sub.color})`,
                    }}
                  />
                  <div className="absolute inset-0 flex items-center px-2 justify-between">
                    <span className="text-[10px] font-mono text-white/80">
                      {Math.round(sub.targetMinutes * filledArea / 100)}分 / {sub.targetMinutes}分
                    </span>
                    <span className="text-[10px] font-mono font-bold" style={{ color: sub.color }}>
                      {filledArea}%
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        {/* 合計 */}
        <div className="mt-3 pt-3 border-t border-gray-800 flex items-center gap-2">
          <span className="w-6 text-center text-xs font-bold text-white">計</span>
          <div className="flex-1 h-8 bg-gray-900 rounded-lg border border-gray-700 overflow-hidden relative">
            <div
              className="absolute h-full transition-all duration-700 rounded-lg"
              style={{
                width: `${overallPct}%`,
                background: overallPct >= 80
                  ? "linear-gradient(90deg, #22c55e88, #22c55e)"
                  : overallPct >= 50
                  ? "linear-gradient(90deg, #eab30888, #eab308)"
                  : "linear-gradient(90deg, #ef444488, #ef4444)",
              }}
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-sm font-mono font-bold text-white">
                {Math.round(TOTAL_HOURS * 60 * overallPct / 100)}分 / {TOTAL_HOURS * 60}分 ({overallPct}%)
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ─── 使い方 ─── */}
      <div className="max-w-3xl mx-auto px-4 mt-8 mb-4">
        <div className="bg-gray-900/50 rounded-lg border border-gray-800/50 p-3 text-xs text-gray-500 space-y-1">
          <p>💡 各セルをクリックして達成度(0/25/50/75/100%)を記録</p>
          <p>💡 台形の面積 = 学習量。上が狭く(スタート)、下が広い(ゴール)</p>
          <p>💡 全セル100%でパーフェクトセーブ達成！</p>
        </div>
      </div>

      {/* ボトムナビ */}
      <nav className="fixed bottom-0 left-0 right-0 bg-gray-900/95 backdrop-blur border-t border-gray-800 px-4 py-2
                       flex justify-around items-center z-50">
        <NavItem href="/" label="マップ" icon="▣" />
        <NavItem href="/timekeeper" label="廊下" icon="🏃" />
        <NavItem href="/timekeeper/daily" label="今日" icon="⚽" active />
        <NavItem href="/study" label="学習" icon="📖" />
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
