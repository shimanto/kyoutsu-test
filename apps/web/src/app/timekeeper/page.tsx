"use client";

import { useState, useMemo } from "react";
import { getAuthUser } from "@/lib/auth";
import {
  generateTiles,
  getTimekeeperMessage,
  DEFAULT_SCHEDULE,
  type DayTile,
  type DayTask,
} from "@/lib/timekeeper-data";

type ViewRange = "day" | "week" | "month" | "quarter" | "all";

const VIEW_CONFIG: Record<ViewRange, { label: string; unit: string; desc: string }> = {
  day:     { label: "今日",       unit: "1時間",  desc: "1時間単位で確認" },
  week:    { label: "1週間",     unit: "1日",    desc: "1日単位で確認" },
  month:   { label: "1か月",     unit: "1週間",  desc: "1週間単位で確認" },
  quarter: { label: "3か月",     unit: "1か月",  desc: "1か月単位で確認" },
  all:     { label: "ゴールまで", unit: "1か月",  desc: "1か月単位で俯瞰" },
};

export default function TimekeeperPage() {
  const [viewRange, setViewRange] = useState<ViewRange>("week");
  const authUser = getAuthUser();
  const examDate = new Date(`${authUser?.examYear || 2027}-01-18`);

  const startDate = new Date();
  startDate.setDate(startDate.getDate() - 5);

  const allTiles = useMemo(() => generateTiles(startDate, examDate), []);
  const todayIdx = allTiles.findIndex((t) => t.status === "today");
  const todayTile = todayIdx >= 0 ? allTiles[todayIdx] : null;
  const remainingDays = allTiles.filter((t) => t.status === "upcoming").length;

  // タスク完了トグル
  const [completedOverrides, setCompletedOverrides] = useState<Set<string>>(new Set());
  const toggleTask = (taskId: string) => {
    setCompletedOverrides((prev) => {
      const next = new Set(prev);
      if (next.has(taskId)) next.delete(taskId); else next.add(taskId);
      return next;
    });
  };
  const isTaskCompleted = (task: DayTask) =>
    completedOverrides.has(task.id) ? !task.completed : task.completed;
  const isTileCleared = (tile: DayTile) => tile.tasks.every((t) => isTaskCompleted(t));
  const totalCompleted = allTiles.filter((t) => t.status === "completed" || isTileCleared(t)).length;

  const timekeeperMsg = todayTile ? getTimekeeperMessage(todayTile, remainingDays) : "準備はいいかい？";

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 pb-16">
      {/* ヘッダー */}
      <header className="sticky top-0 z-40 bg-gray-950/90 backdrop-blur border-b border-gray-800/50 px-3 py-2">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <a href="/" className="text-gray-500 text-sm">←</a>
              <span className="text-base font-bold">🧤⚽ タイムキーパーさん</span>
            </div>
            <div className="text-xs">
              <span className="text-red-400 font-bold">残り{remainingDays}日</span>
              <span className="text-gray-600 ml-1">→ {examDate.toISOString().slice(0, 10)}</span>
            </div>
          </div>

          {/* ビュー切替 */}
          <div className="flex gap-1 mt-2">
            {(Object.keys(VIEW_CONFIG) as ViewRange[]).map((v) => (
              <button key={v} onClick={() => setViewRange(v)}
                className={`flex-1 py-1.5 rounded-lg text-[10px] transition-colors ${
                  viewRange === v ? "bg-green-600 text-white" : "bg-gray-800 text-gray-500 hover:bg-gray-700"
                }`}>
                <div className="font-bold">{VIEW_CONFIG[v].label}</div>
                <div className="opacity-70">{VIEW_CONFIG[v].unit}</div>
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* タイムキーパーさんメッセージ */}
      <div className="max-w-3xl mx-auto px-3 mt-3">
        <div className="bg-gray-900 rounded-xl border border-gray-800 p-3 flex items-center gap-3 mb-3">
          <span className="text-2xl">🧤⚽</span>
          <div>
            <p className="text-sm font-medium">{timekeeperMsg}</p>
            <p className="text-[10px] text-gray-500 mt-0.5">{VIEW_CONFIG[viewRange].desc}</p>
          </div>
        </div>
      </div>

      {/* メインビュー (ビューごとに異なるレンダリング) */}
      <main className="max-w-3xl mx-auto px-3">
        {viewRange === "day" && todayTile && (
          <DayView tile={todayTile} isTaskCompleted={isTaskCompleted} toggleTask={toggleTask} />
        )}
        {viewRange === "week" && (
          <WeekView allTiles={allTiles} todayIdx={todayIdx} isTileCleared={isTileCleared}
                    isTaskCompleted={isTaskCompleted} toggleTask={toggleTask} />
        )}
        {viewRange === "month" && (
          <MonthView allTiles={allTiles} todayIdx={todayIdx} isTileCleared={isTileCleared} />
        )}
        {viewRange === "quarter" && (
          <QuarterView allTiles={allTiles} todayIdx={todayIdx} isTileCleared={isTileCleared} />
        )}
        {viewRange === "all" && (
          <AllView allTiles={allTiles} todayIdx={todayIdx} isTileCleared={isTileCleared} examDate={examDate} />
        )}

        {/* 進捗サマリー */}
        <div className="grid grid-cols-4 gap-2 mt-4">
          <StatBox label="踏破" value={totalCompleted} unit={`/${allTiles.length}日`} color="text-green-400" />
          <StatBox label="残り" value={remainingDays} unit="日" color="text-red-400" />
          <StatBox label="達成率" value={allTiles.length > 0 ? Math.round((totalCompleted / allTiles.length) * 100) : 0} unit="%" color="text-blue-400" />
          <StatBox label="連続" value={5} unit="日" color="text-yellow-400" />
        </div>
      </main>

      {/* ボトムナビ */}
      <nav className="fixed bottom-0 left-0 right-0 bg-gray-900/95 backdrop-blur border-t border-gray-800 z-50">
        <div className="max-w-3xl mx-auto flex justify-around py-1.5">
          <NavItem href="/" icon="▣" label="マップ" />
          <NavItem href="/timekeeper" icon="🏃" label="ロード" active />
          <NavItem href="/timekeeper/daily" icon="⚽" label="台形" />
          <NavItem href="/study" icon="📖" label="学習" />
          <NavItem href="/analytics" icon="📊" label="分析" />
        </div>
      </nav>
    </div>
  );
}

// ═══════════════════════════════════════════════
// 今日ビュー: 1時間単位
// ═══════════════════════════════════════════════
function DayView({ tile, isTaskCompleted, toggleTask }: {
  tile: DayTile; isTaskCompleted: (t: DayTask) => boolean; toggleTask: (id: string) => void;
}) {
  const hours = tile.availableHours;
  const slots = Array.from({ length: hours }, (_, i) => i);
  const tasksPerHour = Math.ceil(tile.tasks.length / Math.max(hours, 1));

  return (
    <div>
      <div className="text-xs text-gray-500 mb-2">{tile.date} — {hours}時間の学習計画</div>

      {/* 1時間ごとのタイムライン */}
      <div className="space-y-1">
        {slots.map((hour) => {
          const hourTasks = tile.tasks.slice(hour * tasksPerHour, (hour + 1) * tasksPerHour);
          const allDone = hourTasks.length > 0 && hourTasks.every((t) => isTaskCompleted(t));
          const someDone = hourTasks.some((t) => isTaskCompleted(t));

          return (
            <div key={hour} className={`rounded-xl border p-3 transition-all ${
              allDone ? "bg-green-900/20 border-green-800/40"
              : someDone ? "bg-blue-900/10 border-blue-800/30"
              : "bg-gray-900 border-gray-800"
            }`}>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-mono text-gray-500 w-12">{hour}:00</span>
                <div className="flex-1 h-1 bg-gray-800 rounded-full overflow-hidden">
                  <div className="h-full bg-green-500 rounded-full transition-all"
                       style={{ width: `${hourTasks.length > 0 ? (hourTasks.filter((t) => isTaskCompleted(t)).length / hourTasks.length) * 100 : 0}%` }} />
                </div>
                {allDone && <span className="text-sm">✅</span>}
              </div>

              {hourTasks.map((task) => {
                const done = isTaskCompleted(task);
                return (
                  <button key={task.id} onClick={() => toggleTask(task.id)}
                    className="w-full flex items-center gap-2 p-2 rounded-lg hover:bg-gray-800/30 text-left transition-colors">
                    <div className={`w-4 h-4 rounded border-2 flex items-center justify-center shrink-0 ${
                      done ? "bg-green-600 border-green-600" : "border-gray-600"
                    }`}>
                      {done && <span className="text-[9px] text-white">✓</span>}
                    </div>
                    <div className="w-1 h-5 rounded-full shrink-0" style={{ backgroundColor: task.subjectColor }} />
                    <span className={`text-sm flex-1 ${done ? "line-through opacity-50" : ""}`}>
                      {task.subject} — {task.fieldName}
                    </span>
                    <span className="text-[10px] text-gray-600">{task.estimatedMinutes}分</span>
                  </button>
                );
              })}

              {hourTasks.length === 0 && (
                <div className="text-xs text-gray-600 pl-14">（空きスロット）</div>
              )}
            </div>
          );
        })}
      </div>

      {/* 今日の詳細リンク */}
      <a href="/timekeeper/daily"
         className="block mt-3 py-2.5 text-center bg-blue-600/20 text-blue-400 rounded-xl text-sm border border-blue-800/30">
        ⚽ 台形ビューで達成度を記録
      </a>
    </div>
  );
}

// ═══════════════════════════════════════════════
// 1週間ビュー: 1日単位
// ═══════════════════════════════════════════════
function WeekView({ allTiles, todayIdx, isTileCleared, isTaskCompleted, toggleTask }: {
  allTiles: DayTile[]; todayIdx: number; isTileCleared: (t: DayTile) => boolean;
  isTaskCompleted: (t: DayTask) => boolean; toggleTask: (id: string) => void;
}) {
  const start = Math.max(0, todayIdx);
  const weekTiles = allTiles.slice(start, start + 7);
  const [selectedDay, setSelectedDay] = useState<number>(0);
  const dayNames = ["日", "月", "火", "水", "木", "金", "土"];

  return (
    <div>
      {/* 7日間のグリッド */}
      <div className="grid grid-cols-7 gap-1 mb-3">
        {weekTiles.map((tile, i) => {
          const cleared = tile.status === "completed" || isTileCleared(tile);
          const isToday = tile.status === "today";
          const tasks = tile.tasks;
          const done = tasks.filter((t) => isTaskCompleted(t)).length;
          const pct = tasks.length > 0 ? done / tasks.length : 0;
          const dayColor = tile.dayOfWeek === 0 ? "text-red-400" : tile.dayOfWeek === 6 ? "text-blue-400" : "text-gray-400";

          return (
            <button key={tile.date} onClick={() => setSelectedDay(i)}
              className={`rounded-xl border p-2 text-center transition-all ${
                selectedDay === i ? "ring-2 ring-yellow-400 ring-offset-1 ring-offset-gray-950" : ""
              } ${cleared ? "bg-green-900/30 border-green-800/40" : isToday ? "bg-blue-900/20 border-blue-700/40" : "bg-gray-900 border-gray-800"}`}>
              <div className={`text-[10px] font-bold ${dayColor}`}>{dayNames[tile.dayOfWeek]}</div>
              <div className="text-xs font-mono">{tile.date.slice(8)}</div>
              {/* ミニ円グラフ的な表現 */}
              <div className="w-8 h-8 mx-auto mt-1 rounded-full border-2 flex items-center justify-center"
                   style={{
                     borderColor: cleared ? "#22c55e" : pct > 0 ? "#3b82f6" : "#374151",
                     background: `conic-gradient(${cleared ? "#22c55e" : "#3b82f6"} ${pct * 360}deg, #1f2937 0deg)`,
                   }}>
                <div className="w-5 h-5 rounded-full bg-gray-950 flex items-center justify-center">
                  <span className="text-[8px] font-mono">{Math.round(pct * 100)}</span>
                </div>
              </div>
              <div className="text-[9px] text-gray-600 mt-1">{tile.availableHours}h</div>
            </button>
          );
        })}
      </div>

      {/* 選択日のタスク詳細 */}
      {weekTiles[selectedDay] && (
        <DayTaskList tile={weekTiles[selectedDay]} isTaskCompleted={isTaskCompleted} toggleTask={toggleTask} />
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════
// 1か月ビュー: 1週間単位
// ═══════════════════════════════════════════════
function MonthView({ allTiles, todayIdx, isTileCleared }: {
  allTiles: DayTile[]; todayIdx: number; isTileCleared: (t: DayTile) => boolean;
}) {
  const start = Math.max(0, todayIdx);
  const monthTiles = allTiles.slice(start, start + 30);

  // 7日ごとにグループ化
  const weeks: DayTile[][] = [];
  for (let i = 0; i < monthTiles.length; i += 7) {
    weeks.push(monthTiles.slice(i, i + 7));
  }

  return (
    <div className="space-y-2">
      {weeks.map((week, wi) => {
        const totalTasks = week.reduce((s, t) => s + t.tasks.length, 0);
        const doneTasks = week.reduce((s, t) => s + t.tasks.filter((tk) => tk.completed).length, 0);
        const cleared = week.reduce((s, t) => s + (t.status === "completed" || isTileCleared(t) ? 1 : 0), 0);
        const pct = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0;
        const totalHours = week.reduce((s, t) => s + t.availableHours, 0);
        const startDate = week[0]?.date.slice(5);
        const endDate = week[week.length - 1]?.date.slice(5);

        return (
          <div key={wi} className="bg-gray-900 rounded-xl border border-gray-800 p-3">
            <div className="flex items-center justify-between mb-2">
              <div>
                <span className="text-sm font-bold">第{wi + 1}週</span>
                <span className="text-xs text-gray-500 ml-2">{startDate} 〜 {endDate}</span>
              </div>
              <div className="text-right">
                <span className="text-xs text-gray-500">{totalHours}h / </span>
                <span className="text-sm font-mono font-bold" style={{ color: pct >= 80 ? "#22c55e" : pct >= 50 ? "#eab308" : "#ef4444" }}>
                  {pct}%
                </span>
              </div>
            </div>

            {/* 7日のミニブロック */}
            <div className="flex gap-0.5">
              {week.map((day) => {
                const dc = day.status === "completed" || isTileCleared(day);
                const dp = day.tasks.length > 0 ? day.tasks.filter((t) => t.completed).length / day.tasks.length : 0;
                return (
                  <div key={day.date} className="flex-1 h-8 rounded-md transition-all"
                    style={{
                      backgroundColor: dc ? "#22c55e33" : dp > 0 ? "#3b82f633" : "#1f2937",
                      border: day.status === "today" ? "2px solid #3b82f6" : "1px solid #374151",
                    }}>
                    <div className="h-full rounded-md" style={{ background: `linear-gradient(to top, ${dc ? "#22c55e" : "#3b82f6"} ${dp * 100}%, transparent ${dp * 100}%)` }} />
                  </div>
                );
              })}
            </div>

            <div className="flex justify-between mt-1.5 text-[9px] text-gray-600">
              <span>{cleared}/{week.length}日 踏破</span>
              <span>{totalTasks}タスク中{doneTasks}完了</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ═══════════════════════════════════════════════
// 3か月ビュー: 1か月単位
// ═══════════════════════════════════════════════
function QuarterView({ allTiles, todayIdx, isTileCleared }: {
  allTiles: DayTile[]; todayIdx: number; isTileCleared: (t: DayTile) => boolean;
}) {
  const start = Math.max(0, todayIdx);
  const qTiles = allTiles.slice(start, start + 90);

  // 月ごとにグループ化
  const months = groupByMonth(qTiles);

  return (
    <div className="space-y-3">
      {months.map((month) => (
        <MonthBlock key={month.label} month={month} isTileCleared={isTileCleared} />
      ))}
    </div>
  );
}

// ═══════════════════════════════════════════════
// ゴールまでビュー: 1か月単位
// ═══════════════════════════════════════════════
function AllView({ allTiles, todayIdx, isTileCleared, examDate }: {
  allTiles: DayTile[]; todayIdx: number; isTileCleared: (t: DayTile) => boolean; examDate: Date;
}) {
  const start = Math.max(0, todayIdx);
  const allFromToday = allTiles.slice(start);
  const months = groupByMonth(allFromToday);

  return (
    <div>
      {/* ゴールまでのプログレス */}
      <div className="bg-gray-900 rounded-xl border border-gray-800 p-3 mb-3">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-bold">🏆 ゴール: {examDate.toISOString().slice(0, 10)}</span>
          <span className="text-xs text-gray-500">{months.length}か月</span>
        </div>
        <div className="h-3 bg-gray-800 rounded-full overflow-hidden">
          {months.map((m, i) => {
            const w = (m.days.length / allFromToday.length) * 100;
            return (
              <div key={m.label} className="h-full inline-block"
                style={{
                  width: `${w}%`,
                  backgroundColor: m.pct >= 80 ? "#22c55e" : m.pct >= 50 ? "#eab308" : m.pct > 0 ? "#3b82f6" : "#374151",
                }} />
            );
          })}
        </div>
      </div>

      {/* 月ブロック (コンパクト) */}
      <div className="space-y-2">
        {months.map((month) => (
          <MonthBlock key={month.label} month={month} isTileCleared={isTileCleared} compact />
        ))}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════
// 共通コンポーネント
// ═══════════════════════════════════════════════

function DayTaskList({ tile, isTaskCompleted, toggleTask }: {
  tile: DayTile; isTaskCompleted: (t: DayTask) => boolean; toggleTask: (id: string) => void;
}) {
  const canToggle = tile.status === "today" || tile.status === "upcoming";
  return (
    <div className="bg-gray-900 rounded-xl border border-gray-800 p-3">
      <div className="text-xs text-gray-500 mb-2">
        {tile.date} ｜ {tile.availableHours}h ｜
        {tile.tasks.filter((t) => isTaskCompleted(t)).length}/{tile.tasks.length}完了
      </div>
      <div className="space-y-1">
        {tile.tasks.map((task) => {
          const done = isTaskCompleted(task);
          return (
            <button key={task.id} onClick={() => canToggle && toggleTask(task.id)} disabled={!canToggle}
              className={`w-full flex items-center gap-2 p-2 rounded-lg text-left transition-colors ${
                done ? "bg-green-900/15" : "hover:bg-gray-800/30"} ${!canToggle ? "opacity-60" : ""}`}>
              <div className={`w-4 h-4 rounded border-2 flex items-center justify-center shrink-0 ${
                done ? "bg-green-600 border-green-600" : "border-gray-600"
              }`}>
                {done && <span className="text-[9px] text-white">✓</span>}
              </div>
              <div className="w-1 h-5 rounded-full shrink-0" style={{ backgroundColor: task.subjectColor }} />
              <span className={`text-sm flex-1 ${done ? "line-through opacity-50" : ""}`}>
                {task.subject} — {task.fieldName}
              </span>
              <span className="text-[10px] text-gray-600">{task.estimatedMinutes}分</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

interface MonthGroup {
  label: string; // "2026/04"
  days: DayTile[];
  totalHours: number;
  totalTasks: number;
  doneTasks: number;
  clearedDays: number;
  pct: number;
}

function groupByMonth(tiles: DayTile[]): MonthGroup[] {
  const map = new Map<string, DayTile[]>();
  for (const t of tiles) {
    const key = t.date.slice(0, 7);
    (map.get(key) || (() => { const a: DayTile[] = []; map.set(key, a); return a; })()).push(t);
  }
  return [...map.entries()].map(([label, days]) => {
    const totalTasks = days.reduce((s, d) => s + d.tasks.length, 0);
    const doneTasks = days.reduce((s, d) => s + d.tasks.filter((t) => t.completed).length, 0);
    return {
      label, days,
      totalHours: days.reduce((s, d) => s + d.availableHours, 0),
      totalTasks, doneTasks,
      clearedDays: days.filter((d) => d.status === "completed").length,
      pct: totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0,
    };
  });
}

function MonthBlock({ month, isTileCleared, compact = false }: {
  month: MonthGroup; isTileCleared: (t: DayTile) => boolean; compact?: boolean;
}) {
  const [y, m] = month.label.split("-");
  const monthNames = ["", "1月", "2月", "3月", "4月", "5月", "6月", "7月", "8月", "9月", "10月", "11月", "12月"];
  const displayName = `${y}年 ${monthNames[Number(m)]}`;

  return (
    <div className="bg-gray-900 rounded-xl border border-gray-800 p-3">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-bold">{displayName}</span>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500">{month.totalHours}h</span>
          <span className="text-sm font-mono font-bold"
            style={{ color: month.pct >= 80 ? "#22c55e" : month.pct >= 50 ? "#eab308" : "#6b7280" }}>
            {month.pct}%
          </span>
        </div>
      </div>

      {/* 日ブロック (カレンダー風ミニマップ) */}
      {!compact ? (
        <div className="flex flex-wrap gap-0.5">
          {month.days.map((day) => {
            const dc = day.status === "completed" || isTileCleared(day);
            const dp = day.tasks.length > 0 ? day.tasks.filter((t) => t.completed).length / day.tasks.length : 0;
            return (
              <div key={day.date} className="w-3 h-3 rounded-sm"
                title={`${day.date} ${Math.round(dp * 100)}%`}
                style={{
                  backgroundColor: dc ? "#22c55e" : dp > 0.5 ? "#eab308" : dp > 0 ? "#3b82f6" : "#1f2937",
                  border: day.status === "today" ? "1px solid #fff" : "none",
                }} />
            );
          })}
        </div>
      ) : (
        <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
          <div className="h-full rounded-full transition-all"
            style={{
              width: `${month.pct}%`,
              backgroundColor: month.pct >= 80 ? "#22c55e" : month.pct >= 50 ? "#eab308" : "#3b82f6",
            }} />
        </div>
      )}

      <div className="flex justify-between mt-1.5 text-[9px] text-gray-600">
        <span>{month.clearedDays}/{month.days.length}日</span>
        <span>{month.doneTasks}/{month.totalTasks}タスク</span>
      </div>
    </div>
  );
}

function StatBox({ label, value, unit, color }: { label: string; value: number; unit: string; color: string }) {
  return (
    <div className="bg-gray-900 rounded-lg border border-gray-800 p-2 text-center">
      <div className="text-[10px] text-gray-500">{label}</div>
      <div className={`text-lg font-mono font-bold ${color}`}>{value}</div>
      <div className="text-[9px] text-gray-600">{unit}</div>
    </div>
  );
}

function NavItem({ href, icon, label, active = false }: { href: string; icon: string; label: string; active?: boolean }) {
  return (
    <a href={href} className={`flex flex-col items-center gap-0.5 text-[10px] px-2 ${active ? "text-green-400" : "text-gray-500"}`}>
      <span className="text-base">{icon}</span><span>{label}</span>
    </a>
  );
}
