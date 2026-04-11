"use client";

import { SUBJECTS } from "@kyoutsu/shared";

interface FieldStat {
  fieldId: string;
  fieldName: string;
  subjectId: string;
  total: number;
  correct: number;
  points: number; // 配点 (ブロックサイズに比例)
}

interface SubjectHeatmapProps {
  fieldStats: FieldStat[];
  onFieldClick?: (fieldId: string, subjectId: string) => void;
  onGroupClick?: (groupId: string) => void;
}

/** 正答率 → 色 (赤→黄→緑グラデーション) */
function rateToColor(rate: number, total: number): string {
  // データ不足の場合はグレー
  if (total < 3) return "#374151";

  // 0.0 → 深い赤, 0.5 → 黄, 1.0 → 濃い緑
  if (rate <= 0.5) {
    // 赤→黄: 0~0.5
    const t = rate / 0.5;
    const r = Math.round(220 - t * 30);
    const g = Math.round(38 + t * 185);
    const b = Math.round(38);
    return `rgb(${r},${g},${b})`;
  } else {
    // 黄→緑: 0.5~1.0
    const t = (rate - 0.5) / 0.5;
    const r = Math.round(190 - t * 156);
    const g = Math.round(223 - t * 26);
    const b = Math.round(38 + t * 59);
    return `rgb(${r},${g},${b})`;
  }
}

/** 正答率 → テキスト色 */
function rateToTextColor(rate: number): string {
  return rate > 0.6 ? "#052e16" : "#ffffff";
}

// 6大ブロックにグループ化 (英語R+Lは「英語」として統合表示、理科は物理+化学)
const SUBJECT_GROUPS = [
  { id: "kokugo", label: "国語", subjectIds: ["kokugo"], maxScore: 200 },
  { id: "math", label: "数学", subjectIds: ["math1a", "math2bc"], maxScore: 200 },
  { id: "english", label: "英語", subjectIds: ["eng_read", "eng_listen"], maxScore: 200 },
  { id: "science", label: "理科", subjectIds: ["physics", "chemistry"], maxScore: 200 },
  { id: "social", label: "社会", subjectIds: ["social"], maxScore: 100 },
  { id: "info", label: "情報", subjectIds: ["info1"], maxScore: 100 },
];

export function SubjectHeatmap({ fieldStats, onFieldClick, onGroupClick }: SubjectHeatmapProps) {
  return (
    <div className="grid grid-cols-3 grid-rows-2 gap-2 md:gap-3">
      {SUBJECT_GROUPS.map((group) => {
        const groupFields = fieldStats.filter((f) =>
          group.subjectIds.includes(f.subjectId)
        );

        // グループ全体の正答率
        const groupTotal = groupFields.reduce((s, f) => s + f.total, 0);
        const groupCorrect = groupFields.reduce((s, f) => s + f.correct, 0);
        const groupRate = groupTotal > 0 ? groupCorrect / groupTotal : 0;
        const groupPoints = groupFields.reduce((s, f) => s + f.points, 0);
        const estimatedScore = Math.round(groupRate * group.maxScore);

        return (
          <div
            key={group.id}
            className="bg-gray-900 rounded-lg border border-gray-800 overflow-hidden"
          >
            {/* グループヘッダー (クリックでドリルダウン) */}
            <button
              onClick={() => onGroupClick?.(group.id)}
              className="w-full px-3 py-1.5 border-b border-gray-800 flex justify-between items-center
                         hover:bg-gray-800/50 transition-colors cursor-pointer text-left"
            >
              <span className="font-bold text-sm">{group.label}
                <span className="text-[10px] text-gray-500 ml-1">&#9654;</span>
              </span>
              <span className="text-xs text-gray-400">
                <span
                  className="font-mono font-bold text-sm"
                  style={{ color: rateToColor(groupRate, groupTotal) }}
                >
                  {estimatedScore}
                </span>
                <span className="text-gray-600"> / {group.maxScore}</span>
              </span>
            </button>

            {/* 分野ブロック (treemap-like) */}
            <div className="p-1.5 flex flex-wrap gap-1">
              {groupFields.map((field) => {
                const rate = field.total > 0 ? field.correct / field.total : 0;
                const bgColor = rateToColor(rate, field.total);
                const textColor = rateToTextColor(rate);

                // 配点に比例したサイズ (最小40px, 最大に応じてスケール)
                const totalPoints = groupFields.reduce((s, f) => s + f.points, 0);
                const sizeRatio = field.points / totalPoints;
                // 面積比をwidthに変換 (2行想定)
                const widthPercent = Math.max(25, Math.min(98, sizeRatio * 200));

                return (
                  <button
                    key={field.fieldId}
                    onClick={() => onFieldClick?.(field.fieldId, field.subjectId)}
                    className="rounded-md px-2 py-2 text-left transition-all duration-300
                               hover:brightness-125 hover:scale-[1.02] active:scale-95
                               cursor-pointer relative group"
                    style={{
                      backgroundColor: bgColor,
                      color: textColor,
                      width: `calc(${widthPercent}% - 4px)`,
                      minHeight: "52px",
                    }}
                  >
                    <div className="text-[11px] font-medium leading-tight truncate">
                      {field.fieldName}
                    </div>
                    <div className="text-[10px] opacity-80 mt-0.5">
                      {Math.round(rate * 100)}%
                    </div>
                    <div className="text-[9px] opacity-60">
                      {field.points}点
                    </div>

                    {/* ホバーツールチップ */}
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2
                                    bg-gray-900 border border-gray-700 rounded-lg px-3 py-2
                                    text-white text-xs whitespace-nowrap
                                    opacity-0 group-hover:opacity-100 pointer-events-none
                                    transition-opacity z-10 shadow-xl">
                      <div className="font-bold">{field.fieldName}</div>
                      <div>正答率: {Math.round(rate * 100)}% ({field.correct}/{field.total})</div>
                      <div>配点: {field.points}点</div>
                      <div className="text-gray-400 mt-1">クリックで強化ドリルへ</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
