"use client";

import { useState } from "react";
import { HIERARCHY_DATA, rateToColor, rateToTextColor, type SubjectGroup, type FieldDetail, type UnitStat } from "@/lib/hierarchy-data";

interface MobileHeatmapProps {
  onDrill?: (fieldId: string) => void;
}

export function MobileHeatmap({ onDrill }: MobileHeatmapProps) {
  const [expandedGroup, setExpandedGroup] = useState<string | null>(null);
  const [unitModal, setUnitModal] = useState<{ field: FieldDetail; group: SubjectGroup } | null>(null);

  return (
    <>
      {/* Level 1: 教科ブロック (縦1列) */}
      <div className="space-y-2">
        {HIERARCHY_DATA.map((group) => {
          const totalQ = group.fields.reduce((s, f) => s + f.total, 0);
          const correctQ = group.fields.reduce((s, f) => s + f.correct, 0);
          const rate = totalQ > 0 ? correctQ / totalQ : 0;
          const estimatedScore = Math.round(rate * group.maxScore);
          const isExpanded = expandedGroup === group.groupId;

          return (
            <div key={group.groupId}>
              {/* 教科ヘッダー (タップで展開) */}
              <button
                onClick={() => setExpandedGroup(isExpanded ? null : group.groupId)}
                className="w-full flex items-center gap-2 p-2.5 rounded-xl border transition-all active:scale-[0.99]"
                style={{
                  borderColor: isExpanded ? group.color : "#1f2937",
                  backgroundColor: isExpanded ? `${group.color}08` : "#111827",
                }}
              >
                {/* 教科名 + スコア */}
                <div className="w-10 h-10 rounded-lg flex items-center justify-center text-sm font-bold shrink-0"
                     style={{ backgroundColor: `${group.color}22`, color: group.color }}>
                  {group.label.charAt(0)}
                </div>
                <div className="flex-1 text-left min-w-0">
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-sm font-bold">{group.label}</span>
                    <span className="text-xs font-mono" style={{ color: group.color }}>
                      {estimatedScore}<span className="text-gray-600">/{group.maxScore}</span>
                    </span>
                  </div>
                  {/* ミニヒートマップバー (分野を横一列に) */}
                  <div className="flex gap-0.5 mt-1">
                    {group.fields.map((f) => {
                      const fRate = f.total > 0 ? f.correct / f.total : 0;
                      return (
                        <div
                          key={f.fieldId}
                          className="h-2 rounded-sm"
                          style={{
                            flex: f.points,
                            backgroundColor: rateToColor(fRate, f.total),
                          }}
                          title={`${f.fieldName} ${Math.round(fRate * 100)}%`}
                        />
                      );
                    })}
                  </div>
                </div>
                <div className="text-xs text-gray-500 shrink-0">{Math.round(rate * 100)}%</div>
                <span className="text-gray-600 text-xs">{isExpanded ? "▲" : "▼"}</span>
              </button>

              {/* Level 2: 分野ブロック (展開時) */}
              {isExpanded && (
                <div className="mt-1 ml-2 mr-1 space-y-1 animate-in">
                  {group.fields.map((field) => {
                    const fRate = field.total > 0 ? field.correct / field.total : 0;
                    const bgColor = rateToColor(fRate, field.total);
                    const txtColor = rateToTextColor(fRate);
                    const pctText = Math.round(fRate * 100);

                    return (
                      <button
                        key={field.fieldId}
                        onClick={() => setUnitModal({ field, group })}
                        className="w-full flex items-center gap-2 p-2 rounded-lg border transition-all
                                   hover:brightness-110 active:scale-[0.98]"
                        style={{
                          backgroundColor: bgColor,
                          borderColor: `${group.color}44`,
                          color: txtColor,
                        }}
                      >
                        <div className="flex-1 text-left min-w-0">
                          <div className="text-xs font-medium truncate">{field.fieldName}</div>
                          <div className="text-[10px] opacity-70">{field.points}点配点</div>
                        </div>
                        <div className="text-right shrink-0">
                          <div className="text-sm font-mono font-bold">{pctText}%</div>
                          <div className="text-[10px] opacity-60">{field.correct}/{field.total}</div>
                        </div>
                        {/* 単元数インジケータ */}
                        <div className="flex flex-col gap-0.5 shrink-0">
                          {field.units.map((u) => {
                            const uRate = u.total > 0 ? u.correct / u.total : 0;
                            return (
                              <div key={u.unitId} className="w-1.5 h-1.5 rounded-full"
                                   style={{ backgroundColor: rateToColor(uRate, u.total) }} />
                            );
                          })}
                        </div>
                      </button>
                    );
                  })}
                  {/* アクションボタン */}
                  <div className="flex gap-1.5">
                    <a
                      href={`/subject/${group.groupId}`}
                      className="flex-1 py-2 text-xs text-center rounded-lg border transition-colors"
                      style={{ borderColor: `${group.color}44`, color: group.color }}
                    >
                      詳細ヒートマップ →
                    </a>
                    <button
                      onClick={() => onDrill?.(group.fields[0]?.fieldId || "")}
                      className="flex-1 py-2 text-xs rounded-lg transition-colors text-white"
                      style={{ backgroundColor: group.color }}
                    >
                      弱点ドリル
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Level 3: 単元モーダル */}
      {unitModal && (
        <UnitDetailModal
          field={unitModal.field}
          group={unitModal.group}
          onClose={() => setUnitModal(null)}
          onDrill={onDrill}
        />
      )}
    </>
  );
}

/** 単元詳細モーダル (Level 3) */
function UnitDetailModal({
  field, group, onClose, onDrill,
}: {
  field: FieldDetail;
  group: SubjectGroup;
  onClose: () => void;
  onDrill?: (fieldId: string) => void;
}) {
  const fRate = field.total > 0 ? field.correct / field.total : 0;

  return (
    <div className="fixed inset-0 z-[100] flex items-end md:items-center justify-center">
      {/* オーバーレイ */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      {/* モーダル本体 */}
      <div className="relative w-full max-w-lg max-h-[85vh] overflow-y-auto bg-gray-900 border-t md:border
                       border-gray-700 rounded-t-2xl md:rounded-2xl p-4 md:p-5 z-10">
        {/* ハンドル (モバイル) */}
        <div className="md:hidden w-10 h-1 bg-gray-700 rounded-full mx-auto mb-3" />

        {/* ヘッダー */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="text-xs" style={{ color: group.color }}>{group.label}</div>
            <h2 className="text-lg font-bold">{field.fieldName}</h2>
          </div>
          <div className="text-right">
            <div className="text-2xl font-mono font-bold" style={{ color: rateToColor(fRate, field.total) }}>
              {Math.round(fRate * 100)}%
            </div>
            <div className="text-xs text-gray-500">{field.correct}/{field.total}問 ｜ {field.points}点配点</div>
          </div>
        </div>

        {/* 単元ヒートマップ */}
        <div className="space-y-2">
          {field.units.map((unit) => {
            const uRate = unit.total > 0 ? unit.correct / unit.total : 0;
            const bgColor = rateToColor(uRate, unit.total);
            const pct = Math.round(uRate * 100);

            return (
              <div
                key={unit.unitId}
                className="rounded-xl border overflow-hidden"
                style={{ borderColor: `${group.color}33` }}
              >
                {/* 単元バー */}
                <div className="flex items-center gap-2 p-3" style={{ backgroundColor: `${bgColor}22` }}>
                  <div className="w-3 h-full rounded-full shrink-0" style={{ backgroundColor: bgColor }}>
                    <div className="w-3 h-8 rounded-full" style={{ backgroundColor: bgColor }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium">{unit.unitName}</div>
                    <div className="flex gap-3 mt-1 text-[10px] text-gray-500">
                      <span>難易度 {"★".repeat(unit.difficulty)}{"☆".repeat(5 - unit.difficulty)}</span>
                      <span>最終: {unit.lastStudied?.slice(5) || "—"}</span>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-lg font-mono font-bold" style={{ color: bgColor }}>{pct}%</div>
                    <div className="text-[10px] text-gray-500">{unit.correct}/{unit.total}</div>
                  </div>
                </div>

                {/* 正答率バー */}
                <div className="h-1.5 bg-gray-800">
                  <div className="h-full transition-all" style={{ width: `${pct}%`, backgroundColor: bgColor }} />
                </div>

                {/* 復習待ち / アクション */}
                <div className="flex items-center justify-between px-3 py-1.5 bg-gray-900/50 text-[10px]">
                  {unit.reviewDue > 0 ? (
                    <span className="text-amber-400">復習待ち {unit.reviewDue}問</span>
                  ) : (
                    <span className="text-green-500">復習完了</span>
                  )}
                  <button
                    onClick={() => { onDrill?.(field.fieldId); onClose(); }}
                    className="px-2 py-0.5 rounded text-[10px] transition-colors"
                    style={{ backgroundColor: `${group.color}22`, color: group.color }}
                  >
                    ドリル開始
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* フッターアクション */}
        <div className="mt-4 flex gap-2">
          <button onClick={onClose} className="flex-1 py-2.5 border border-gray-700 rounded-xl text-sm">
            閉じる
          </button>
          <button
            onClick={() => { onDrill?.(field.fieldId); onClose(); }}
            className="flex-1 py-2.5 rounded-xl text-sm font-medium"
            style={{ backgroundColor: group.color, color: "#fff" }}
          >
            {field.fieldName}をドリル
          </button>
        </div>
      </div>
    </div>
  );
}
