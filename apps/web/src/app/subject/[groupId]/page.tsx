"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { SUBJECTS } from "@kyoutsu/shared";
import {
  apiGetOverview,
  apiGetFieldDetail,
} from "@/lib/api";
import { SUBJECT_COLORS } from "@/lib/hierarchy-data";
import { SAMPLE_QUESTIONS_BY_FIELD } from "@/lib/sample-data";
import { getFieldQuestions } from "@/lib/question-generator";

/** 正答率 → 色 (赤→黄→緑) */
function rateToColor(rate: number, total: number): string {
  if (total < 3) return "#374151";
  if (rate <= 0.5) {
    const t = rate / 0.5;
    return `rgb(${Math.round(220 - t * 30)},${Math.round(38 + t * 185)},38)`;
  }
  const t = (rate - 0.5) / 0.5;
  return `rgb(${Math.round(190 - t * 156)},${Math.round(223 - t * 26)},${Math.round(38 + t * 59)})`;
}

function rateToTextColor(rate: number): string {
  return rate > 0.65 ? "#052e16" : "#ffffff";
}

/** グループ定義 */
const SUBJECT_GROUPS = [
  { id: "kokugo", label: "国語", subjectIds: ["kokugo"], maxScore: 200 },
  { id: "math", label: "数学", subjectIds: ["math1a", "math2bc"], maxScore: 200 },
  { id: "english", label: "英語", subjectIds: ["eng_read", "eng_listen"], maxScore: 200 },
  { id: "science", label: "理科", subjectIds: ["physics", "chemistry"], maxScore: 200 },
  { id: "social", label: "社会", subjectIds: ["social"], maxScore: 100 },
  { id: "info", label: "情報", subjectIds: ["info1"], maxScore: 100 },
];

interface FieldStat {
  fieldId: string;
  fieldName: string;
  subjectId: string;
  total: number;
  correct: number;
  points: number;
}

interface UnitDetail {
  unit_id: string;
  unit_name: string;
  total: number;
  correct: number;
  avg_difficulty: number | null;
  question_count: number;
  review_due: number;
}

type SortKey = "points" | "rate" | "weak";

export default function SubjectDetailPage() {
  const params = useParams();
  const router = useRouter();
  const groupId = params.groupId as string;
  const group = SUBJECT_GROUPS.find((g) => g.id === groupId);
  const color = SUBJECT_COLORS[groupId] || "#6b7280";

  const [fields, setFields] = useState<FieldStat[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedField, setExpandedField] = useState<string | null>(null);
  const [unitDetails, setUnitDetails] = useState<Record<string, UnitDetail[]>>({});
  const [unitLoading, setUnitLoading] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<SortKey>("points");

  useEffect(() => {
    if (!group) return;
    async function load() {
      try {
        const overview = await apiGetOverview();
        const groupFields = overview.fieldStats
          .filter((f) => group!.subjectIds.includes(f.subject_id))
          .map((f) => ({
            fieldId: f.field_id,
            fieldName: f.field_name,
            subjectId: f.subject_id,
            total: f.total,
            correct: f.correct,
            points: f.points,
          }));
        setFields(groupFields);
      } catch (e) {
        console.error("Failed to load subject detail:", e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [group]);

  const handleFieldExpand = useCallback(async (fieldId: string) => {
    if (expandedField === fieldId) {
      setExpandedField(null);
      return;
    }
    setExpandedField(fieldId);
    if (unitDetails[fieldId]) return;

    setUnitLoading(fieldId);
    try {
      const detail = await apiGetFieldDetail(fieldId);
      setUnitDetails((prev) => ({ ...prev, [fieldId]: detail.unitStats }));
    } catch (e) {
      console.error("Failed to load field detail:", e);
    } finally {
      setUnitLoading(null);
    }
  }, [expandedField, unitDetails]);

  const handleDrill = useCallback((fieldId: string) => {
    router.push(`/drill/${fieldId}`);
  }, [router]);

  if (!group) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-400">教科が見つかりません</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-400 animate-pulse">読み込み中...</div>
      </div>
    );
  }

  const totalQ = fields.reduce((s, f) => s + f.total, 0);
  const correctQ = fields.reduce((s, f) => s + f.correct, 0);
  const rate = totalQ > 0 ? correctQ / totalQ : 0;
  const estimatedScore = Math.round(rate * group.maxScore);

  // 分野ごとの収録問題数 (手書き + テンプレート生成)
  const questionCountMap: Record<string, number> = {};
  for (const f of fields) {
    const handwritten = SAMPLE_QUESTIONS_BY_FIELD[f.fieldId] || [];
    questionCountMap[f.fieldId] = getFieldQuestions(f.fieldId, handwritten).length;
  }
  const totalAvailable = Object.values(questionCountMap).reduce((s, n) => s + n, 0);

  // ソート
  const sortedFields = [...fields].sort((a, b) => {
    if (sortBy === "rate") {
      const rA = a.total > 0 ? a.correct / a.total : 0;
      const rB = b.total > 0 ? b.correct / b.total : 0;
      return rB - rA;
    }
    if (sortBy === "weak") {
      const rA = a.total > 0 ? a.correct / a.total : 1;
      const rB = b.total > 0 ? b.correct / b.total : 1;
      return rA - rB;
    }
    return b.points - a.points;
  });

  // 弱点分野 (正答率下位2)
  const weakFields = [...fields]
    .filter((f) => f.total >= 3)
    .sort((a, b) => (a.correct / a.total) - (b.correct / b.total))
    .slice(0, 2);

  const weakestField = weakFields[0];
  const totalPoints = fields.reduce((s, f) => s + f.points, 0);

  return (
    <div className="min-h-screen pb-20">
      {/* ヘッダー */}
      <header className="sticky top-0 z-40 bg-gray-950/90 backdrop-blur border-b border-gray-800/50 px-3 py-2.5">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center gap-3">
            <button onClick={() => router.push("/")} className="text-gray-500 text-sm hover:text-gray-300 transition-colors">
              ← マップ
            </button>
            <div className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold"
                 style={{ backgroundColor: `${color}22`, color }}>
              {group.label.charAt(0)}
            </div>
            <div className="flex-1">
              <h1 className="text-lg font-bold">{group.label}</h1>
              <div className="text-[10px] text-gray-500">
                {group.subjectIds.map((id) => SUBJECTS.find((s) => s.id === id)?.name).filter(Boolean).join(" / ")}
                {totalAvailable > 0 && <span className="ml-1">・問題{totalAvailable}問</span>}
              </div>
            </div>
            <div className="text-right">
              <div className="text-xl font-mono font-bold" style={{ color }}>
                {estimatedScore}<span className="text-gray-600 text-sm">/{group.maxScore}</span>
              </div>
              <div className="text-[10px] text-gray-500">
                {totalQ > 0 ? `${Math.round(rate * 100)}% 正答率` : "未回答"}
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-3 pt-4 space-y-3">
        {/* 弱点アラート */}
        {weakFields.length > 0 && (
          <div className="p-2.5 bg-red-950/30 border border-red-900/30 rounded-xl">
            <div className="text-[10px] text-red-400 font-bold mb-1.5">弱点分野 — クリックで集中ドリル</div>
            <div className="flex gap-1.5">
              {weakFields.map((wf) => {
                const wRate = wf.total > 0 ? wf.correct / wf.total : 0;
                return (
                  <button key={wf.fieldId} onClick={() => handleDrill(wf.fieldId)}
                    className="flex-1 p-2 rounded-lg text-center transition-all active:scale-95 bg-gray-900/50 border border-gray-800">
                    <div className="text-xs font-medium truncate">{wf.fieldName}</div>
                    <div className="text-lg font-mono font-bold" style={{ color: rateToColor(wRate, wf.total) }}>
                      {Math.round(wRate * 100)}%
                    </div>
                    <div className="text-[9px] text-gray-500">{questionCountMap[wf.fieldId] || 0}問収録</div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* ソートボタン */}
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] text-gray-500">並び替え:</span>
          {([
            { key: "points" as const, label: "配点順" },
            { key: "rate" as const, label: "正答率順" },
            { key: "weak" as const, label: "弱点順" },
          ]).map((s) => (
            <button
              key={s.key}
              onClick={() => setSortBy(s.key)}
              className={`text-[10px] px-2 py-1 rounded-md transition-colors ${
                sortBy === s.key ? "text-white" : "text-gray-500 hover:text-gray-300"
              }`}
              style={sortBy === s.key ? { backgroundColor: `${color}33`, color } : {}}
            >
              {s.label}
            </button>
          ))}
        </div>

        {/* 分野ヒートマップ (グリッド + 展開式) */}
        <div className="grid grid-cols-2 gap-2">
          {sortedFields.map((field) => {
            const fRate = field.total > 0 ? field.correct / field.total : 0;
            const bg = rateToColor(fRate, field.total);
            const txt = rateToTextColor(fRate);
            const pct = Math.round(fRate * 100);
            const heightRatio = totalPoints > 0 ? field.points / totalPoints : 0;
            const h = Math.max(80, Math.round(heightRatio * 400));
            const isExpanded = expandedField === field.fieldId;
            const units = unitDetails[field.fieldId];
            const isLoadingUnits = unitLoading === field.fieldId;
            const qCount = questionCountMap[field.fieldId] || 0;

            return (
              <div key={field.fieldId} className={`${isExpanded ? "col-span-2" : ""}`}>
                <button
                  onClick={() => handleFieldExpand(field.fieldId)}
                  className="w-full rounded-xl border-2 p-3 text-left transition-all active:scale-[0.97] hover:brightness-110 relative overflow-hidden"
                  style={{
                    backgroundColor: bg,
                    borderColor: isExpanded ? color : `${color}44`,
                    color: txt,
                    minHeight: isExpanded ? undefined : `${h}px`,
                  }}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="text-sm font-bold">{field.fieldName}</div>
                      <div className="text-2xl font-mono font-bold mt-1">
                        {field.total > 0 ? `${pct}%` : "---"}
                      </div>
                      <div className="text-[10px] opacity-70 mt-0.5">
                        {field.correct}/{field.total}問 | {field.points}点
                      </div>
                      {qCount > 0 && (
                        <div className="text-[10px] opacity-60">{qCount}問収録</div>
                      )}
                    </div>
                    <span className="text-xs opacity-60 mt-1">
                      {isExpanded ? "▼" : "▶"}
                    </span>
                  </div>
                </button>

                {/* 展開: 単元レベルの詳細 */}
                {isExpanded && (
                  <div className="mt-1 rounded-xl border border-gray-800 bg-gray-900/80 overflow-hidden">
                    {isLoadingUnits ? (
                      <div className="p-4 text-center text-gray-400 text-sm animate-pulse">
                        単元データ読み込み中...
                      </div>
                    ) : units && units.length > 0 ? (
                      <div className="divide-y divide-gray-800/50">
                        {units.map((unit) => {
                          const uRate = unit.total > 0 ? unit.correct / unit.total : 0;
                          const uBg = rateToColor(uRate, unit.total);
                          const diffStars = unit.avg_difficulty
                            ? Math.round(unit.avg_difficulty)
                            : 3;
                          return (
                            <div key={unit.unit_id} className="flex items-center gap-2 p-3">
                              <div className="w-2 h-8 rounded-full shrink-0" style={{ backgroundColor: uBg }} />
                              <div className="flex-1 min-w-0">
                                <div className="text-sm font-medium truncate">{unit.unit_name}</div>
                                <div className="text-[10px] text-gray-500 mt-0.5">
                                  {"★".repeat(diffStars)}{"☆".repeat(5 - diffStars)}
                                  {" | "}問題{unit.question_count}問
                                  {unit.review_due > 0 && (
                                    <span className="text-amber-400 ml-2">復習{unit.review_due}問</span>
                                  )}
                                </div>
                              </div>
                              <div className="text-right shrink-0">
                                <div className="text-lg font-mono font-bold" style={{ color: uBg }}>
                                  {unit.total > 0 ? `${Math.round(uRate * 100)}%` : "---"}
                                </div>
                                <div className="text-[9px] text-gray-500">
                                  {unit.correct}/{unit.total}
                                </div>
                              </div>
                              <div className="w-16 h-1.5 bg-gray-800 rounded-full overflow-hidden shrink-0">
                                <div
                                  className="h-full rounded-full transition-all"
                                  style={{
                                    width: `${unit.total > 0 ? uRate * 100 : 0}%`,
                                    backgroundColor: uBg,
                                  }}
                                />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="p-4 text-center text-gray-500 text-sm">
                        単元データがありません
                      </div>
                    )}

                    {/* 分野ドリルボタン */}
                    <div className="p-3 border-t border-gray-800/50">
                      <button
                        onClick={() => handleDrill(field.fieldId)}
                        className="w-full py-2.5 rounded-lg font-medium text-sm transition-colors hover:brightness-110"
                        style={{ backgroundColor: color, color: "#fff" }}
                      >
                        {field.fieldName} のドリル開始{qCount > 0 ? ` (${qCount}問)` : ""}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* 全体サマリーバー */}
        {fields.length > 0 && (
          <div className="p-3 bg-gray-900 rounded-xl border border-gray-800">
            <div className="text-xs text-gray-400 mb-2">{group.label} 分野別正答率</div>
            <div className="space-y-1.5">
              {fields.map((field) => {
                const fRate = field.total > 0 ? field.correct / field.total : 0;
                const pct = Math.round(fRate * 100);
                return (
                  <div key={field.fieldId} className="flex items-center gap-2">
                    <span className="text-[10px] w-24 truncate text-gray-400">{field.fieldName}</span>
                    <div className="flex-1 h-2 bg-gray-800 rounded-full overflow-hidden">
                      <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: rateToColor(fRate, field.total) }} />
                    </div>
                    <span className="text-[10px] font-mono w-8 text-right" style={{ color: rateToColor(fRate, field.total) }}>
                      {field.total > 0 ? `${pct}%` : "--"}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* アクションボタン */}
        <div className="flex gap-2">
          {weakestField && (
            <button
              onClick={() => handleDrill(weakestField.fieldId)}
              className="flex-1 py-3 rounded-xl font-medium text-sm transition-colors hover:brightness-110"
              style={{ backgroundColor: color, color: "#fff" }}
            >
              弱点ドリルを開始 ({weakestField.fieldName})
            </button>
          )}
          {fields.length > 0 && (
            <button
              onClick={() => {
                const randomField = fields[Math.floor(Math.random() * fields.length)];
                handleDrill(randomField.fieldId);
              }}
              className="py-3 px-4 rounded-xl font-medium text-sm border transition-colors"
              style={{ borderColor: `${color}44`, color }}
            >
              ランダム
            </button>
          )}
        </div>

        {/* 凡例 */}
        <div className="flex items-center gap-2 justify-center text-xs text-gray-400 pt-2">
          <span>弱い</span>
          <div className="flex gap-0.5">
            {["#dc2626", "#ef4444", "#f87171", "#fca5a5", "#fde68a", "#bef264", "#4ade80", "#22c55e"].map((c, i) => (
              <div key={i} className="w-4 h-2.5 rounded-sm" style={{ backgroundColor: c }} />
            ))}
          </div>
          <span>習得済み</span>
        </div>
      </main>

      {/* ボトムナビ */}
      <nav className="fixed bottom-0 left-0 right-0 bg-gray-900/95 backdrop-blur border-t border-gray-800 z-50">
        <div className="max-w-3xl mx-auto flex justify-around py-1.5">
          <NavItem href="/" icon="▣" label="マップ" />
          <NavItem href="/timekeeper" icon="🏃" label="ロード" />
          <NavItem href="/timekeeper/daily" icon="⚽" label="今日" />
          <NavItem href="/study" icon="📖" label="学習" />
          <NavItem href="/analytics" icon="📊" label="分析" />
        </div>
      </nav>
    </div>
  );
}

function NavItem({ href, icon, label, active = false }: { href: string; icon: string; label: string; active?: boolean }) {
  return (
    <a href={href} className={`flex flex-col items-center gap-0.5 text-[10px] px-2 ${active ? "text-green-400" : "text-gray-500"}`}>
      <span className="text-base">{icon}</span>
      <span>{label}</span>
    </a>
  );
}
