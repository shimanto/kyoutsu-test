"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import { SAMPLE_USER } from "@/lib/sample-data";
import {
  generateTiles,
  getTimekeeperMessage,
  type DayTile,
  type DayTask,
} from "@/lib/timekeeper-data";

type ViewRange = "day" | "week" | "month" | "quarter" | "all";

const VIEW_LABELS: Record<ViewRange, string> = {
  day: "今日",
  week: "1週間",
  month: "1か月",
  quarter: "3か月",
  all: "ゴールまで",
};

export default function TimekeeperPage() {
  const [viewRange, setViewRange] = useState<ViewRange>("week");
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const corridorRef = useRef<HTMLDivElement>(null);

  const startDate = new Date();
  startDate.setDate(startDate.getDate() - 5); // 5日前から
  const examDate = new Date(SAMPLE_USER.examDate);

  const allTiles = useMemo(
    () => generateTiles(startDate, examDate),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  // 今日のインデックス
  const todayIdx = allTiles.findIndex((t) => t.status === "today");
  const todayTile = todayIdx >= 0 ? allTiles[todayIdx] : null;
  const remainingDays = allTiles.filter((t) => t.status === "upcoming").length;

  // 表示範囲
  const visibleTiles = useMemo(() => {
    const start = Math.max(0, todayIdx - 2);
    let count: number;
    switch (viewRange) {
      case "day": count = 1; break;
      case "week": count = 9; break;   // 前2日 + 今日 + 後6日
      case "month": count = 32; break;
      case "quarter": count = 92; break;
      case "all": count = allTiles.length - start; break;
    }
    return allTiles.slice(start, start + count);
  }, [allTiles, todayIdx, viewRange]);

  const selectedTile = selectedDate
    ? allTiles.find((t) => t.date === selectedDate)
    : todayTile;

  const timekeeperMsg = selectedTile
    ? getTimekeeperMessage(selectedTile, remainingDays)
    : "準備はいいかい？";

  // タスク完了トグル（デモ用）
  const [completedOverrides, setCompletedOverrides] = useState<Set<string>>(new Set());
  const toggleTask = (taskId: string) => {
    setCompletedOverrides((prev) => {
      const next = new Set(prev);
      if (next.has(taskId)) next.delete(taskId);
      else next.add(taskId);
      return next;
    });
  };

  const isTaskCompleted = (task: DayTask) =>
    completedOverrides.has(task.id) ? !task.completed : task.completed;

  // 全タスク完了でタイル踏破
  const isTileCleared = (tile: DayTile) =>
    tile.tasks.every((t) => isTaskCompleted(t));

  // 進捗率
  const totalCompleted = allTiles.filter((t) => t.status === "completed" || isTileCleared(t)).length;
  const totalDays = allTiles.length;

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100">
      {/* ヘッダー */}
      <header className="px-4 pt-4 pb-2 md:px-8">
        <div className="flex items-center justify-between max-w-6xl mx-auto">
          <div className="flex items-center gap-3">
            <a href="/" className="text-gray-500 hover:text-gray-300 text-sm">← マップ</a>
            <h1 className="text-lg font-bold">タイムキーパーさん</h1>
          </div>
          <div className="text-right text-sm">
            <span className="text-red-400 font-bold">残り {remainingDays}日</span>
            <span className="text-gray-600 ml-2">{SAMPLE_USER.examDate}</span>
          </div>
        </div>

        {/* ビュー切替 */}
        <div className="max-w-6xl mx-auto mt-3 flex gap-1">
          {(Object.keys(VIEW_LABELS) as ViewRange[]).map((v) => (
            <button
              key={v}
              onClick={() => setViewRange(v)}
              className={`px-3 py-1 rounded-full text-xs transition-colors ${
                viewRange === v
                  ? "bg-green-600 text-white"
                  : "bg-gray-800 text-gray-400 hover:bg-gray-700"
              }`}
            >
              {VIEW_LABELS[v]}
            </button>
          ))}
          <a
            href="/timekeeper/daily"
            className="px-3 py-1 rounded-full text-xs bg-blue-600 text-white hover:bg-blue-700 transition-colors ml-auto"
          >
            ⚽ 今日の詳細
          </a>
        </div>
      </header>

      {/* ============ 3D 遠近法廊下 ============ */}
      <div className="relative overflow-hidden" style={{ perspective: "800px", perspectiveOrigin: "50% 30%" }}>
        <div
          ref={corridorRef}
          className="relative mx-auto"
          style={{
            transformStyle: "preserve-3d",
            transform: "rotateX(45deg)",
            width: "600px",
            maxWidth: "90vw",
            paddingTop: "40px",
            paddingBottom: "20px",
          }}
        >
          {/* ゴール */}
          <div
            className="mx-auto mb-2 text-center"
            style={{
              transform: `translateZ(0px) scale(${viewRange === "day" ? 0.9 : viewRange === "week" ? 0.5 : 0.2})`,
              transformOrigin: "center top",
            }}
          >
            <div className="text-2xl">🏆</div>
            <div className="text-[10px] text-yellow-400 font-bold">GOAL {SAMPLE_USER.examDate}</div>
          </div>

          {/* タイル列（奥=ゴール → 手前=今日） */}
          <div className="flex flex-col-reverse items-center gap-0">
            {visibleTiles.map((tile, i) => {
              const totalVisible = visibleTiles.length;
              // 遠近スケール: 手前(最後)が最大、奥(最初)が最小
              const reverseI = totalVisible - 1 - i;
              const depthRatio = reverseI / Math.max(totalVisible - 1, 1); // 0=奥, 1=手前
              const scale = 0.3 + depthRatio * 0.7;
              const opacity = 0.4 + depthRatio * 0.6;

              const isToday = tile.status === "today";
              const cleared = tile.status === "completed" || isTileCleared(tile);
              const isSelected = selectedDate === tile.date || (!selectedDate && isToday);
              const isPastIncomplete = tile.status === "past_incomplete" && !isTileCleared(tile);

              // タイル色
              let tileColor = "bg-gray-800 border-gray-700";
              if (cleared) tileColor = "bg-green-900/60 border-green-700/50";
              else if (isToday) tileColor = "bg-blue-900/60 border-blue-500";
              else if (isPastIncomplete) tileColor = "bg-red-900/40 border-red-700/50";

              const completedTasks = tile.tasks.filter((t) => isTaskCompleted(t)).length;
              const progress = tile.tasks.length > 0 ? completedTasks / tile.tasks.length : 0;

              const dayNames = ["日", "月", "火", "水", "木", "金", "土"];
              const dayColor = tile.dayOfWeek === 0 ? "text-red-400" : tile.dayOfWeek === 6 ? "text-blue-400" : "text-gray-400";

              return (
                <button
                  key={tile.date}
                  onClick={() => setSelectedDate(tile.date === selectedDate ? null : tile.date)}
                  className={`relative border rounded-lg transition-all duration-200 cursor-pointer
                              hover:brightness-125 ${tileColor}
                              ${isSelected ? "ring-2 ring-yellow-400 ring-offset-1 ring-offset-gray-950" : ""}`}
                  style={{
                    transform: `scale(${scale})`,
                    opacity,
                    width: "100%",
                    maxWidth: "500px",
                    marginTop: viewRange === "day" ? "0" : `-${Math.max(0, (1 - scale) * 20)}px`,
                    zIndex: Math.round(depthRatio * 100),
                    padding: scale > 0.6 ? "8px 12px" : "4px 8px",
                  }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {isToday && <span className="text-[10px] bg-blue-600 px-1.5 py-0.5 rounded font-bold">TODAY</span>}
                      <span className="text-xs font-mono">{tile.date.slice(5)}</span>
                      <span className={`text-[10px] ${dayColor}`}>({dayNames[tile.dayOfWeek]})</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-gray-500">{tile.availableHours}h</span>
                      {/* ミニ進捗バー */}
                      <div className="w-16 h-1.5 bg-gray-700 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${cleared ? "bg-green-500" : "bg-blue-500"}`}
                          style={{ width: `${progress * 100}%` }}
                        />
                      </div>
                      <span className="text-[10px] text-gray-500">{completedTasks}/{tile.tasks.length}</span>
                      {cleared && <span className="text-sm">✅</span>}
                    </div>
                  </div>

                  {/* 展開時: タスク科目カラーバー */}
                  {scale > 0.5 && (
                    <div className="flex gap-0.5 mt-1.5">
                      {tile.tasks.map((task) => (
                        <div
                          key={task.id}
                          className="h-2 rounded-sm flex-1 transition-all"
                          style={{
                            backgroundColor: isTaskCompleted(task) ? task.subjectColor : `${task.subjectColor}33`,
                            border: `1px solid ${task.subjectColor}66`,
                          }}
                          title={`${task.subject} ${task.fieldName}`}
                        />
                      ))}
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {/* スタート地点 */}
          <div className="text-center mt-2">
            <div className="text-lg">🧤⚽</div>
            <div className="text-xs text-gray-400 font-bold">START</div>
          </div>
        </div>
      </div>

      {/* ============ タイムキーパーさんパネル ============ */}
      <div className="max-w-2xl mx-auto px-4 pb-8">
        {/* タイムキーパーさんメッセージ */}
        <div className="bg-gray-900 rounded-xl border border-gray-800 p-4 mb-4 flex items-start gap-3">
          <div className="text-3xl shrink-0">🧤⚽</div>
          <div>
            <div className="text-xs text-gray-500 mb-1">タイムキーパーさん</div>
            <p className="text-sm font-medium">{timekeeperMsg}</p>
            {selectedTile && selectedTile.status === "today" && (
              <p className="text-xs text-gray-500 mt-1">
                今日の学習時間: {selectedTile.availableHours}時間 ｜ 全タスク完了で明日の分も先取り可能！
              </p>
            )}
          </div>
        </div>

        {/* 進捗サマリー */}
        <div className="grid grid-cols-4 gap-2 mb-4">
          <div className="bg-gray-900 rounded-lg border border-gray-800 p-3 text-center">
            <div className="text-xs text-gray-500">踏破</div>
            <div className="text-xl font-mono font-bold text-green-400">{totalCompleted}</div>
            <div className="text-[10px] text-gray-600">/ {totalDays}日</div>
          </div>
          <div className="bg-gray-900 rounded-lg border border-gray-800 p-3 text-center">
            <div className="text-xs text-gray-500">残り</div>
            <div className="text-xl font-mono font-bold text-red-400">{remainingDays}</div>
            <div className="text-[10px] text-gray-600">日</div>
          </div>
          <div className="bg-gray-900 rounded-lg border border-gray-800 p-3 text-center">
            <div className="text-xs text-gray-500">達成率</div>
            <div className="text-xl font-mono font-bold text-blue-400">
              {totalDays > 0 ? Math.round((totalCompleted / totalDays) * 100) : 0}%
            </div>
          </div>
          <div className="bg-gray-900 rounded-lg border border-gray-800 p-3 text-center">
            <div className="text-xs text-gray-500">連続</div>
            <div className="text-xl font-mono font-bold text-yellow-400">5</div>
            <div className="text-[10px] text-gray-600">日</div>
          </div>
        </div>

        {/* 選択日のタスク詳細 */}
        {selectedTile && (
          <div className="bg-gray-900 rounded-xl border border-gray-800 p-4">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="font-bold text-sm">
                  {selectedTile.date}
                  {selectedTile.status === "today" && (
                    <span className="ml-2 text-xs bg-blue-600 px-1.5 py-0.5 rounded">TODAY</span>
                  )}
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  学習可能: {selectedTile.availableHours}時間 ｜
                  {selectedTile.tasks.reduce((s, t) => s + t.estimatedMinutes, 0)}分のタスク
                </p>
              </div>
              <div className="text-right">
                <span className="text-xs text-gray-500">
                  {selectedTile.tasks.filter((t) => isTaskCompleted(t)).length}/{selectedTile.tasks.length} 完了
                </span>
              </div>
            </div>

            <div className="space-y-2">
              {selectedTile.tasks.map((task) => {
                const completed = isTaskCompleted(task);
                const canToggle = selectedTile.status === "today" || selectedTile.status === "upcoming";
                const taskTypeLabel = { new_learn: "学習", review: "復習", weakness: "弱点", exam: "模試" }[task.taskType];

                return (
                  <button
                    key={task.id}
                    onClick={() => canToggle && toggleTask(task.id)}
                    disabled={!canToggle}
                    className={`w-full flex items-center gap-3 p-3 rounded-lg border transition-all text-left
                               ${completed
                                 ? "bg-green-900/20 border-green-800/30"
                                 : "bg-gray-800/50 border-gray-700/50 hover:border-gray-600"
                               }
                               ${!canToggle ? "opacity-60 cursor-default" : "cursor-pointer"}`}
                  >
                    {/* チェックボックス */}
                    <div
                      className={`w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-colors ${
                        completed ? "bg-green-600 border-green-600" : "border-gray-600"
                      }`}
                    >
                      {completed && <span className="text-xs text-white font-bold">✓</span>}
                    </div>

                    {/* 科目カラーバー */}
                    <div className="w-1 h-8 rounded-full shrink-0" style={{ backgroundColor: task.subjectColor }} />

                    {/* タスク内容 */}
                    <div className="flex-1">
                      <div className={`text-sm font-medium ${completed ? "line-through opacity-60" : ""}`}>
                        {task.subject} — {task.fieldName}
                      </div>
                      <div className="text-[10px] text-gray-500 flex gap-2 mt-0.5">
                        <span className="px-1.5 py-0.5 rounded bg-gray-800">{taskTypeLabel}</span>
                        {task.questionCount > 0 && <span>{task.questionCount}問</span>}
                        <span>{task.estimatedMinutes}分</span>
                      </div>
                    </div>

                    {/* ステータス */}
                    {completed && <span className="text-green-400 text-sm">完了</span>}
                  </button>
                );
              })}
            </div>

            {/* 全完了メッセージ */}
            {selectedTile.tasks.every((t) => isTaskCompleted(t)) && selectedTile.tasks.length > 0 && (
              <div className="mt-3 p-3 bg-green-900/20 border border-green-800/30 rounded-lg text-center">
                <p className="text-sm text-green-400 font-bold">🎉 全タスク完了！タイル踏破！</p>
                {selectedTile.status === "today" && (
                  <p className="text-xs text-gray-500 mt-1">
                    余裕があれば次の日のタイルをクリックして先取り学習しよう
                  </p>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* ボトムナビ */}
      <nav className="fixed bottom-0 left-0 right-0 bg-gray-900/95 backdrop-blur border-t border-gray-800 px-4 py-2
                       flex justify-around items-center z-50">
        <NavItem href="/" label="マップ" icon="▣" />
        <NavItem href="/timekeeper" label="タイムキーパー" icon="⚽" active />
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
