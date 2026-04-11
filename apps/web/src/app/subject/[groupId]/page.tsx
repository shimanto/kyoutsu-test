"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { SUBJECTS } from "@kyoutsu/shared";
import {
  apiGetOverview,
  apiGetFieldDetail,
  apiStartSession,
} from "@/lib/api";
import { SUBJECT_COLORS } from "@/lib/hierarchy-data";

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

  const handleDrill = useCallback(async (fieldId: string, subjectId: string) => {
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

  // 弱点順にソート
  const weakestField = [...fields].sort((a, b) => {
    const rateA = a.total > 0 ? a.correct / a.total : 0.5;
    const rateB = b.total > 0 ? b.correct / b.total : 0.5;
    return rateA - rateB;
  })[0];

  return (
    <div className="min-h-screen pb-20">
      {/* ヘッダー */}
      <header className="sticky top-0 z-40 bg-gray-950/90 backdrop-blur border-b border-gray-800/50 px-3 py-2.5">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center gap-3">
            <button onClick={() => router.push("/dashboard")} className="text-gray-500 text-sm hover:text-gray-300 transition-colors">
              &#8592; マップ
            </button>
            <div className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold"
                 style={{ backgroundColor: `${color}22`, color }}>
              {group.label.charAt(0)}
            </div>
            <div className="flex-1">
              <h1 className="text-lg font-bold">{group.label}</h1>
              <div className="text-[10px] text-gray-500">
                {group.subjectIds.map((id) => SUBJECTS.find((s) => s.id === id)?.name).filter(Boolean).join(" / ")}
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

      <main className="max-w-3xl mx-auto px-3 pt-4 space-y-2">
        {/* 分野ヒートマップ (グリッド + 展開式) */}
        <div className="grid grid-cols-2 gap-2">
          {fields.map((field) => {
            const fRate = field.total > 0 ? field.correct / field.total : 0;
            const bg = rateToColor(fRate, field.total);
            const txt = rateToTextColor(fRate);
            const pct = Math.round(fRate * 100);
            const totalPoints = fields.reduce((s, f) => s + f.points, 0);
            const heightRatio = field.points / totalPoints;
            const h = Math.max(80, Math.round(heightRatio * 400));
            const isExpanded = expandedField === field.fieldId;
            const units = unitDetails[field.fieldId];
            const isLoadingUnits = unitLoading === field.fieldId;

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
                    </div>
                    <span className="text-xs opacity-60 mt-1">
                      {isExpanded ? "&#9660;" : "&#9654;"}
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
                              {/* 正答率バー */}
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
                        onClick={() => handleDrill(field.fieldId, field.subjectId)}
                        className="w-full py-2.5 rounded-lg font-medium text-sm transition-colors hover:brightness-110"
                        style={{ backgroundColor: color, color: "#fff" }}
                      >
                        {field.fieldName} のドリル開始
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* 弱点ドリルボタン */}
        {weakestField && (
          <button
            onClick={() => handleDrill(weakestField.fieldId, weakestField.subjectId)}
            className="w-full mt-4 py-3 rounded-xl font-medium text-sm transition-colors hover:brightness-110"
            style={{ backgroundColor: color, color: "#fff" }}
          >
            {group.label}の弱点ドリルを開始 ({weakestField.fieldName})
          </button>
        )}

        {/* 凡例 */}
        <div className="mt-6 flex items-center gap-2 justify-center text-xs text-gray-400">
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
          <NavItem href="/dashboard" icon="&#9635;" label="マップ" />
          <NavItem href="/study" icon="&#128214;" label="学習" />
          <NavItem href="/analytics" icon="&#128202;" label="分析" />
          <NavItem href="/settings" icon="&#9881;" label="設定" />
        </div>
      </nav>
    </div>
  );
}

function NavItem({ href, icon, label, active = false }: { href: string; icon: string; label: string; active?: boolean }) {
  return (
    <a href={href} className={`flex flex-col items-center gap-0.5 text-[10px] px-2 ${active ? "text-green-400" : "text-gray-500"}`}>
      <span className="text-base" dangerouslySetInnerHTML={{ __html: icon }} />
      <span>{label}</span>
    </a>
  );
}
