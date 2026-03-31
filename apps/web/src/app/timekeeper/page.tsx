"use client";

import { useState, useMemo } from "react";
import { getAuthUser } from "@/lib/auth";
import {
  generateTiles,
  getTimekeeperMessage,
  type DayTile,
  type DayTask,
} from "@/lib/timekeeper-data";

type ViewRange = "day" | "week" | "month" | "quarter" | "all";

const VIEW_CONFIG: Record<ViewRange, { label: string; unit: string; step: number }> = {
  day:     { label: "今日",       unit: "1時間", step: 1 },
  week:    { label: "1週間",     unit: "1日",   step: 7 },
  month:   { label: "1か月",     unit: "1週間", step: 30 },
  quarter: { label: "3か月",     unit: "1か月", step: 90 },
  all:     { label: "ゴールまで", unit: "1か月", step: 0 },
};

export default function TimekeeperPage() {
  const [viewRange, setViewRange] = useState<ViewRange>("week");
  const [offset, setOffset] = useState(0); // todayIdxからの日数オフセット
  const authUser = getAuthUser();
  const examDate = new Date(`${authUser?.examYear || 2027}-01-18`);
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - 90); // 過去90日分も生成

  const allTiles = useMemo(() => generateTiles(startDate, examDate), []);
  const todayIdx = allTiles.findIndex((t) => t.status === "today");
  const remainingDays = allTiles.filter((t) => t.status === "upcoming").length;
  const todayTile = todayIdx >= 0 ? allTiles[todayIdx] : null;

  // ビュー切替時にオフセットリセット
  const handleViewChange = (v: ViewRange) => { setViewRange(v); setOffset(0); };

  // オフセットで表示範囲を計算
  const currentIdx = todayIdx + offset;
  const step = VIEW_CONFIG[viewRange].step;

  const navigate = (dir: -1 | 1) => {
    const newOffset = offset + dir * step;
    // 過去は開始日まで、未来は試験日まで
    const newIdx = todayIdx + newOffset;
    if (newIdx >= 0 && newIdx < allTiles.length) setOffset(newOffset);
  };

  // 表示対象のタイル
  const visibleTiles = useMemo(() => {
    const idx = Math.max(0, Math.min(currentIdx, allTiles.length - 1));
    switch (viewRange) {
      case "day": return allTiles.slice(idx, idx + 1);
      case "week": return allTiles.slice(idx, idx + 7);
      case "month": return allTiles.slice(idx, idx + 30);
      case "quarter": return allTiles.slice(idx, idx + 90);
      case "all": return allTiles.slice(Math.max(0, todayIdx), allTiles.length);
    }
  }, [allTiles, currentIdx, todayIdx, viewRange]);

  // パンくず用の日付情報
  const breadcrumb = useMemo(() => {
    if (visibleTiles.length === 0) return { label: "", isFuture: false, isPast: false, isToday: false };
    const first = visibleTiles[0];
    const last = visibleTiles[visibleTiles.length - 1];
    const today = new Date().toISOString().slice(0, 10);
    const isToday = first.date <= today && last.date >= today;
    const isPast = last.date < today;
    const isFuture = first.date > today;

    let label = "";
    switch (viewRange) {
      case "day":
        label = formatDate(first.date);
        break;
      case "week":
        label = `${first.date.slice(5)} 〜 ${last.date.slice(5)}`;
        break;
      case "month":
        label = `${first.date.slice(0, 7)}`;
        break;
      case "quarter":
        label = `${first.date.slice(0, 7)} 〜 ${last.date.slice(0, 7)}`;
        break;
      case "all":
        label = `全期間`;
        break;
    }
    return { label, isFuture, isPast, isToday };
  }, [visibleTiles, viewRange]);

  // タスク完了トグル
  const [completedOverrides, setCompletedOverrides] = useState<Set<string>>(new Set());
  const toggleTask = (taskId: string) => {
    setCompletedOverrides((prev) => {
      const next = new Set(prev); if (next.has(taskId)) next.delete(taskId); else next.add(taskId); return next;
    });
  };
  const isTaskCompleted = (task: DayTask) => completedOverrides.has(task.id) ? !task.completed : task.completed;
  const isTileCleared = (tile: DayTile) => tile.tasks.every((t) => isTaskCompleted(t));
  const totalCompleted = allTiles.filter((t) => t.status === "completed" || isTileCleared(t)).length;
  const timekeeperMsg = todayTile ? getTimekeeperMessage(todayTile, remainingDays) : "準備はいいかい？";

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 pb-16">
      {/* ── ヘッダー ── */}
      <header className="sticky top-0 z-40 bg-gray-950/90 backdrop-blur border-b border-gray-800/50 px-3 py-2">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <a href="/" className="text-gray-500 text-sm">←</a>
              <span className="text-base font-bold">🧤⚽ タイムキーパーさん</span>
            </div>
            <div className="text-xs">
              <span className="text-red-400 font-bold">残り{remainingDays}日</span>
            </div>
          </div>

          {/* ビュー切替 */}
          <div className="flex gap-1 mt-2">
            {(Object.keys(VIEW_CONFIG) as ViewRange[]).map((v) => (
              <button key={v} onClick={() => handleViewChange(v)}
                className={`flex-1 py-1 rounded-lg text-[10px] transition-colors ${
                  viewRange === v ? "bg-green-600 text-white" : "bg-gray-800 text-gray-500 hover:bg-gray-700"
                }`}>
                <div className="font-bold">{VIEW_CONFIG[v].label}</div>
              </button>
            ))}
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-3 mt-2">
        {/* ══ パンくずリスト + 前後ナビ ══ */}
        {viewRange !== "all" && (
          <div className="flex items-center gap-1 mb-3">
            {/* ◀ 過去へ */}
            <button onClick={() => navigate(-1)}
              disabled={currentIdx <= 0}
              className="w-8 h-8 rounded-lg bg-gray-800 hover:bg-gray-700 disabled:opacity-30 flex items-center justify-center text-sm transition-colors">
              ◀
            </button>

            {/* パンくずリスト */}
            <div className="flex-1 flex items-center justify-center gap-1.5 text-xs overflow-hidden">
              {/* 全期間 */}
              <button onClick={() => handleViewChange("all")}
                className="text-gray-600 hover:text-gray-400 shrink-0">全期間</button>
              <span className="text-gray-700">/</span>

              {/* 上位ビューへの遷移 */}
              {(viewRange === "day" || viewRange === "week") && visibleTiles[0] && (
                <>
                  <button onClick={() => { setViewRange("month"); setOffset(Math.floor(offset / 30) * 30); }}
                    className="text-gray-500 hover:text-gray-300 shrink-0">
                    {visibleTiles[0].date.slice(0, 7).replace("-", "/")}
                  </button>
                  <span className="text-gray-700">/</span>
                </>
              )}
              {viewRange === "day" && visibleTiles[0] && (
                <>
                  <button onClick={() => {
                    const weekStart = offset - (new Date(visibleTiles[0].date).getDay());
                    setViewRange("week"); setOffset(weekStart);
                  }}
                    className="text-gray-500 hover:text-gray-300 shrink-0">
                    {(() => {
                      const d = new Date(visibleTiles[0].date);
                      const weekStart = new Date(d); weekStart.setDate(d.getDate() - d.getDay());
                      const weekEnd = new Date(weekStart); weekEnd.setDate(weekStart.getDate() + 6);
                      return `${weekStart.toISOString().slice(5, 10)}〜${weekEnd.toISOString().slice(5, 10)}`;
                    })()}
                  </button>
                  <span className="text-gray-700">/</span>
                </>
              )}

              {/* 現在の期間 (太字) */}
              <span className={`font-bold shrink-0 ${
                breadcrumb.isToday ? "text-blue-400" : breadcrumb.isPast ? "text-gray-400" : "text-green-400"
              }`}>
                {breadcrumb.label}
              </span>

              {/* 過去/未来ラベル */}
              {breadcrumb.isPast && <span className="text-[9px] px-1 py-0.5 bg-gray-800 rounded text-gray-500">過去</span>}
              {breadcrumb.isFuture && <span className="text-[9px] px-1 py-0.5 bg-blue-900/30 rounded text-blue-400">予定</span>}
              {breadcrumb.isToday && <span className="text-[9px] px-1 py-0.5 bg-green-900/30 rounded text-green-400">現在</span>}
            </div>

            {/* ▶ 未来へ */}
            <button onClick={() => navigate(1)}
              disabled={currentIdx + step >= allTiles.length}
              className="w-8 h-8 rounded-lg bg-gray-800 hover:bg-gray-700 disabled:opacity-30 flex items-center justify-center text-sm transition-colors">
              ▶
            </button>

            {/* 今日に戻る */}
            {offset !== 0 && (
              <button onClick={() => setOffset(0)}
                className="px-2 h-8 rounded-lg bg-blue-600/20 text-blue-400 text-[10px] hover:bg-blue-600/30 transition-colors shrink-0">
                今日
              </button>
            )}
          </div>
        )}

        {/* タイムキーパーさんメッセージ */}
        <div className="bg-gray-900 rounded-xl border border-gray-800 p-3 flex items-center gap-3 mb-3">
          <span className="text-2xl">🧤⚽</span>
          <div>
            <p className="text-sm font-medium">{offset === 0 ? timekeeperMsg : breadcrumb.isPast ? "過去の記録を振り返り中…" : "未来の予定を確認中…"}</p>
            <p className="text-[10px] text-gray-500 mt-0.5">
              {VIEW_CONFIG[viewRange].unit}単位で表示中
              {offset !== 0 && ` ｜ ${offset > 0 ? `${offset}日後` : `${Math.abs(offset)}日前`}`}
            </p>
          </div>
        </div>

        {/* ── メインビュー ── */}
        {viewRange === "day" && visibleTiles[0] && (
          <DayView tile={visibleTiles[0]} isTaskCompleted={isTaskCompleted} toggleTask={toggleTask}
                   onDrillDay={(dayOffset) => { setViewRange("day"); setOffset(offset + dayOffset); }} />
        )}
        {viewRange === "week" && (
          <WeekView tiles={visibleTiles} isTileCleared={isTileCleared}
                    isTaskCompleted={isTaskCompleted} toggleTask={toggleTask}
                    onDrillDay={(date) => {
                      const idx = allTiles.findIndex((t) => t.date === date);
                      if (idx >= 0) { setViewRange("day"); setOffset(idx - todayIdx); }
                    }} />
        )}
        {viewRange === "month" && (
          <MonthView tiles={visibleTiles} isTileCleared={isTileCleared}
                     onDrillWeek={(weekOffset) => { setViewRange("week"); setOffset(offset + weekOffset); }} />
        )}
        {viewRange === "quarter" && (
          <QuarterView tiles={visibleTiles} isTileCleared={isTileCleared}
                       onDrillMonth={(monthOffset) => { setViewRange("month"); setOffset(offset + monthOffset); }} />
        )}
        {viewRange === "all" && (
          <AllView tiles={visibleTiles} todayIdx={todayIdx - Math.max(0, todayIdx)} isTileCleared={isTileCleared} examDate={examDate}
                   onDrillMonth={(monthIdx) => {
                     setViewRange("month"); setOffset(monthIdx * 30);
                   }} />
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

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  const dayNames = ["日", "月", "火", "水", "木", "金", "土"];
  return `${dateStr.slice(5)} (${dayNames[d.getDay()]})`;
}

// ═══════════════════════════════════════════
// 今日ビュー: 1時間単位
// ═══════════════════════════════════════════
function DayView({ tile, isTaskCompleted, toggleTask, onDrillDay }: {
  tile: DayTile; isTaskCompleted: (t: DayTask) => boolean; toggleTask: (id: string) => void;
  onDrillDay: (offset: number) => void;
}) {
  const hours = tile.availableHours;
  const slots = Array.from({ length: Math.max(hours, 1) }, (_, i) => i);
  const tasksPerHour = Math.ceil(tile.tasks.length / Math.max(hours, 1));
  const isPast = tile.status === "completed" || tile.status === "past_incomplete";

  return (
    <div>
      {isPast && (
        <div className="mb-2 p-2 bg-gray-800/50 rounded-lg text-xs text-gray-500 text-center">
          📋 この日の実績記録
        </div>
      )}
      {tile.status === "upcoming" && (
        <div className="mb-2 p-2 bg-blue-900/20 rounded-lg text-xs text-blue-400 text-center">
          📅 この日の学習予定
        </div>
      )}

      <div className="space-y-1">
        {slots.map((hour) => {
          const hourTasks = tile.tasks.slice(hour * tasksPerHour, (hour + 1) * tasksPerHour);
          const allDone = hourTasks.length > 0 && hourTasks.every((t) => isTaskCompleted(t));
          const someDone = hourTasks.some((t) => isTaskCompleted(t));
          return (
            <div key={hour} className={`rounded-xl border p-3 transition-all ${
              allDone ? "bg-green-900/20 border-green-800/40" : someDone ? "bg-blue-900/10 border-blue-800/30" : "bg-gray-900 border-gray-800"
            }`}>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-mono text-gray-500 w-12">{hour}:00</span>
                <div className="flex-1 h-1 bg-gray-800 rounded-full overflow-hidden">
                  <div className="h-full bg-green-500 rounded-full" style={{ width: `${hourTasks.length > 0 ? (hourTasks.filter((t) => isTaskCompleted(t)).length / hourTasks.length) * 100 : 0}%` }} />
                </div>
                {allDone && <span className="text-sm">✅</span>}
              </div>
              {hourTasks.map((task) => {
                const done = isTaskCompleted(task);
                const canToggle = tile.status === "today" || tile.status === "upcoming";
                return (
                  <button key={task.id} onClick={() => canToggle && toggleTask(task.id)} disabled={!canToggle}
                    className={`w-full flex items-center gap-2 p-1.5 rounded-lg text-left transition-colors ${!canToggle ? "opacity-60" : "hover:bg-gray-800/30"}`}>
                    <div className={`w-4 h-4 rounded border-2 flex items-center justify-center shrink-0 ${done ? "bg-green-600 border-green-600" : "border-gray-600"}`}>
                      {done && <span className="text-[9px] text-white">✓</span>}
                    </div>
                    <div className="w-1 h-4 rounded-full shrink-0" style={{ backgroundColor: task.subjectColor }} />
                    <span className={`text-sm flex-1 ${done ? "line-through opacity-50" : ""}`}>{task.subject} — {task.fieldName}</span>
                    <span className="text-[10px] text-gray-600">{task.estimatedMinutes}分</span>
                  </button>
                );
              })}
              {hourTasks.length === 0 && <div className="text-xs text-gray-600 pl-14">（空きスロット）</div>}
            </div>
          );
        })}
      </div>

      <a href="/timekeeper/daily" className="block mt-3 py-2 text-center bg-blue-600/20 text-blue-400 rounded-xl text-sm border border-blue-800/30">
        ⚽ 台形ビューで達成度を記録
      </a>
    </div>
  );
}

// ═══════════════════════════════════════════
// 1週間ビュー: 1日単位 (クリックでDayにドリル)
// ═══════════════════════════════════════════
function WeekView({ tiles, isTileCleared, isTaskCompleted, toggleTask, onDrillDay }: {
  tiles: DayTile[]; isTileCleared: (t: DayTile) => boolean;
  isTaskCompleted: (t: DayTask) => boolean; toggleTask: (id: string) => void;
  onDrillDay: (date: string) => void;
}) {
  const [selectedDay, setSelectedDay] = useState(0);
  const dayNames = ["日", "月", "火", "水", "木", "金", "土"];

  return (
    <div>
      <div className="grid grid-cols-7 gap-1 mb-3">
        {tiles.map((tile, i) => {
          const cleared = tile.status === "completed" || isTileCleared(tile);
          const isToday = tile.status === "today";
          const done = tile.tasks.filter((t) => isTaskCompleted(t)).length;
          const pct = tile.tasks.length > 0 ? done / tile.tasks.length : 0;
          const dayColor = tile.dayOfWeek === 0 ? "text-red-400" : tile.dayOfWeek === 6 ? "text-blue-400" : "text-gray-400";
          const isPast = tile.status === "completed" || tile.status === "past_incomplete";

          return (
            <button key={tile.date} onClick={() => setSelectedDay(i)}
              onDoubleClick={() => onDrillDay(tile.date)}
              className={`rounded-xl border p-1.5 text-center transition-all ${
                selectedDay === i ? "ring-2 ring-yellow-400 ring-offset-1 ring-offset-gray-950" : ""
              } ${cleared ? "bg-green-900/30 border-green-800/40" : isToday ? "bg-blue-900/20 border-blue-700/40" : isPast ? "bg-gray-900/50 border-gray-800/50" : "bg-gray-900 border-gray-800"}`}>
              <div className={`text-[10px] font-bold ${dayColor}`}>{dayNames[tile.dayOfWeek]}</div>
              <div className="text-xs font-mono">{tile.date.slice(8)}</div>
              <div className="w-7 h-7 mx-auto mt-1 rounded-full border-2 flex items-center justify-center"
                style={{
                  borderColor: cleared ? "#22c55e" : pct > 0 ? "#3b82f6" : "#374151",
                  background: `conic-gradient(${cleared ? "#22c55e" : "#3b82f6"} ${pct * 360}deg, #1f2937 0deg)`,
                }}>
                <div className="w-4 h-4 rounded-full bg-gray-950 flex items-center justify-center">
                  <span className="text-[7px] font-mono">{Math.round(pct * 100)}</span>
                </div>
              </div>
              <div className="text-[8px] text-gray-600 mt-0.5">{tile.availableHours}h</div>
            </button>
          );
        })}
      </div>
      {tiles[selectedDay] && (
        <DayTaskList tile={tiles[selectedDay]} isTaskCompleted={isTaskCompleted} toggleTask={toggleTask} />
      )}
      <p className="text-[9px] text-gray-600 mt-2 text-center">日をダブルクリックで1日ビューへ</p>
    </div>
  );
}

// ═══════════════════════════════════════════
// 1か月ビュー: 1週間単位 (クリックでWeekにドリル)
// ═══════════════════════════════════════════
function MonthView({ tiles, isTileCleared, onDrillWeek }: {
  tiles: DayTile[]; isTileCleared: (t: DayTile) => boolean;
  onDrillWeek: (weekOffset: number) => void;
}) {
  const weeks: DayTile[][] = [];
  for (let i = 0; i < tiles.length; i += 7) weeks.push(tiles.slice(i, i + 7));

  return (
    <div className="space-y-2">
      {weeks.map((week, wi) => {
        const totalTasks = week.reduce((s, t) => s + t.tasks.length, 0);
        const doneTasks = week.reduce((s, t) => s + t.tasks.filter((tk) => tk.completed).length, 0);
        const cleared = week.filter((t) => t.status === "completed" || isTileCleared(t)).length;
        const pct = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0;
        const totalHours = week.reduce((s, t) => s + t.availableHours, 0);
        const hasToday = week.some((t) => t.status === "today");
        const isPast = week.every((t) => t.status === "completed" || t.status === "past_incomplete");

        return (
          <button key={wi} onClick={() => onDrillWeek(wi * 7)}
            className={`w-full text-left bg-gray-900 rounded-xl border p-3 transition-all hover:brightness-110 active:scale-[0.99] ${
              hasToday ? "border-blue-700/40" : isPast ? "border-gray-800/50" : "border-gray-800"
            }`}>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold">第{wi + 1}週</span>
                <span className="text-xs text-gray-500">{week[0]?.date.slice(5)} 〜 {week[week.length - 1]?.date.slice(5)}</span>
                {hasToday && <span className="text-[9px] px-1.5 py-0.5 bg-blue-600/20 text-blue-400 rounded">現在</span>}
                {isPast && <span className="text-[9px] px-1.5 py-0.5 bg-gray-800 text-gray-500 rounded">実績</span>}
              </div>
              <span className="text-sm font-mono font-bold" style={{ color: pct >= 80 ? "#22c55e" : pct >= 50 ? "#eab308" : "#6b7280" }}>{pct}%</span>
            </div>
            <div className="flex gap-0.5">
              {week.map((day) => {
                const dc = day.status === "completed" || isTileCleared(day);
                const dp = day.tasks.length > 0 ? day.tasks.filter((t) => t.completed).length / day.tasks.length : 0;
                return (
                  <div key={day.date} className="flex-1 h-7 rounded-md overflow-hidden"
                    style={{ backgroundColor: "#1f2937", border: day.status === "today" ? "2px solid #3b82f6" : "1px solid #374151" }}>
                    <div className="w-full rounded-md" style={{ height: `${dp * 100}%`, backgroundColor: dc ? "#22c55e" : "#3b82f6", marginTop: "auto" }} />
                  </div>
                );
              })}
            </div>
            <div className="flex justify-between mt-1.5 text-[9px] text-gray-600">
              <span>{cleared}/{week.length}日踏破 ｜ {totalHours}h</span>
              <span className="text-gray-500">クリックで週表示 →</span>
            </div>
          </button>
        );
      })}
    </div>
  );
}

// ═══════════════════════════════════════════
// 3か月 / ゴールまでビュー: 1か月単位 (クリックでMonthにドリル)
// ═══════════════════════════════════════════
function QuarterView({ tiles, isTileCleared, onDrillMonth }: {
  tiles: DayTile[]; isTileCleared: (t: DayTile) => boolean;
  onDrillMonth: (monthOffset: number) => void;
}) {
  const months = groupByMonth(tiles);
  return (
    <div className="space-y-3">
      {months.map((month, mi) => (
        <MonthBlock key={month.label} month={month} isTileCleared={isTileCleared}
                    onClick={() => onDrillMonth(mi * 30)} />
      ))}
    </div>
  );
}

function AllView({ tiles, todayIdx, isTileCleared, examDate, onDrillMonth }: {
  tiles: DayTile[]; todayIdx: number; isTileCleared: (t: DayTile) => boolean;
  examDate: Date; onDrillMonth: (monthIdx: number) => void;
}) {
  const months = groupByMonth(tiles);
  return (
    <div>
      <div className="bg-gray-900 rounded-xl border border-gray-800 p-3 mb-3">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-bold">🏆 ゴール: {examDate.toISOString().slice(0, 10)}</span>
          <span className="text-xs text-gray-500">{months.length}か月</span>
        </div>
        <div className="h-3 bg-gray-800 rounded-full overflow-hidden flex">
          {months.map((m) => {
            const w = (m.days.length / tiles.length) * 100;
            return (
              <div key={m.label} className="h-full" style={{ width: `${w}%`, backgroundColor: m.pct >= 80 ? "#22c55e" : m.pct >= 50 ? "#eab308" : m.pct > 0 ? "#3b82f6" : "#374151" }} />
            );
          })}
        </div>
      </div>
      <div className="space-y-2">
        {months.map((month, mi) => (
          <MonthBlock key={month.label} month={month} isTileCleared={isTileCleared} compact
                      onClick={() => onDrillMonth(mi)} />
        ))}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════
// 共通コンポーネント
// ═══════════════════════════════════════════

function DayTaskList({ tile, isTaskCompleted, toggleTask }: {
  tile: DayTile; isTaskCompleted: (t: DayTask) => boolean; toggleTask: (id: string) => void;
}) {
  const canToggle = tile.status === "today" || tile.status === "upcoming";
  const isPast = tile.status === "completed" || tile.status === "past_incomplete";
  return (
    <div className="bg-gray-900 rounded-xl border border-gray-800 p-3">
      <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
        <span>{tile.date}</span>
        <span>｜ {tile.availableHours}h</span>
        <span>｜ {tile.tasks.filter((t) => isTaskCompleted(t)).length}/{tile.tasks.length}完了</span>
        {isPast && <span className="ml-auto text-[9px] px-1.5 py-0.5 bg-gray-800 rounded">実績</span>}
      </div>
      <div className="space-y-1">
        {tile.tasks.map((task) => {
          const done = isTaskCompleted(task);
          return (
            <button key={task.id} onClick={() => canToggle && toggleTask(task.id)} disabled={!canToggle}
              className={`w-full flex items-center gap-2 p-2 rounded-lg text-left transition-colors ${done ? "bg-green-900/15" : "hover:bg-gray-800/30"} ${!canToggle ? "opacity-60" : ""}`}>
              <div className={`w-4 h-4 rounded border-2 flex items-center justify-center shrink-0 ${done ? "bg-green-600 border-green-600" : "border-gray-600"}`}>
                {done && <span className="text-[9px] text-white">✓</span>}
              </div>
              <div className="w-1 h-5 rounded-full shrink-0" style={{ backgroundColor: task.subjectColor }} />
              <span className={`text-sm flex-1 ${done ? "line-through opacity-50" : ""}`}>{task.subject} — {task.fieldName}</span>
              <span className="text-[10px] text-gray-600">{task.estimatedMinutes}分</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

interface MonthGroup { label: string; days: DayTile[]; totalHours: number; totalTasks: number; doneTasks: number; clearedDays: number; pct: number; hasToday: boolean }

function groupByMonth(tiles: DayTile[]): MonthGroup[] {
  const map = new Map<string, DayTile[]>();
  for (const t of tiles) { const k = t.date.slice(0, 7); (map.get(k) || (() => { const a: DayTile[] = []; map.set(k, a); return a; })()).push(t); }
  return [...map.entries()].map(([label, days]) => {
    const totalTasks = days.reduce((s, d) => s + d.tasks.length, 0);
    const doneTasks = days.reduce((s, d) => s + d.tasks.filter((t) => t.completed).length, 0);
    return { label, days, totalHours: days.reduce((s, d) => s + d.availableHours, 0), totalTasks, doneTasks,
      clearedDays: days.filter((d) => d.status === "completed").length,
      pct: totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0,
      hasToday: days.some((d) => d.status === "today") };
  });
}

function MonthBlock({ month, isTileCleared, compact = false, onClick }: {
  month: MonthGroup; isTileCleared: (t: DayTile) => boolean; compact?: boolean; onClick?: () => void;
}) {
  const [y, m] = month.label.split("-");
  const monthNames = ["","1月","2月","3月","4月","5月","6月","7月","8月","9月","10月","11月","12月"];
  const isPast = month.days.every((d) => d.status === "completed" || d.status === "past_incomplete");

  return (
    <button onClick={onClick} className="w-full text-left bg-gray-900 rounded-xl border border-gray-800 p-3 hover:brightness-110 active:scale-[0.99] transition-all">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold">{monthNames[Number(m)]}</span>
          {month.hasToday && <span className="text-[9px] px-1.5 py-0.5 bg-blue-600/20 text-blue-400 rounded">現在</span>}
          {isPast && <span className="text-[9px] px-1.5 py-0.5 bg-gray-800 text-gray-500 rounded">実績</span>}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500">{month.totalHours}h</span>
          <span className="text-sm font-mono font-bold" style={{ color: month.pct >= 80 ? "#22c55e" : month.pct >= 50 ? "#eab308" : "#6b7280" }}>{month.pct}%</span>
        </div>
      </div>
      {!compact ? (
        <div className="flex flex-wrap gap-0.5">
          {month.days.map((day) => {
            const dp = day.tasks.length > 0 ? day.tasks.filter((t) => t.completed).length / day.tasks.length : 0;
            return (
              <div key={day.date} className="w-3 h-3 rounded-sm" title={`${day.date} ${Math.round(dp*100)}%`}
                style={{ backgroundColor: dp >= 0.8 ? "#22c55e" : dp >= 0.5 ? "#eab308" : dp > 0 ? "#3b82f6" : "#1f2937",
                  border: day.status === "today" ? "1px solid #fff" : "none" }} />
            );
          })}
        </div>
      ) : (
        <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
          <div className="h-full rounded-full" style={{ width: `${month.pct}%`, backgroundColor: month.pct >= 80 ? "#22c55e" : month.pct >= 50 ? "#eab308" : "#3b82f6" }} />
        </div>
      )}
      <div className="flex justify-between mt-1.5 text-[9px] text-gray-600">
        <span>{month.clearedDays}/{month.days.length}日 ｜ {month.doneTasks}/{month.totalTasks}タスク</span>
        <span className="text-gray-500">クリックで詳細 →</span>
      </div>
    </button>
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
