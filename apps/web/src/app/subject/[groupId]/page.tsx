"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { HIERARCHY_DATA, rateToColor, rateToTextColor, type FieldDetail, type SubjectGroup, type UnitStat } from "@/lib/hierarchy-data";
import { SAMPLE_QUESTIONS_BY_FIELD } from "@/lib/sample-data";
import { getFieldQuestions } from "@/lib/question-generator";

export default function SubjectDetailPage() {
  const params = useParams();
  const router = useRouter();
  const groupId = params.groupId as string;
  const group = HIERARCHY_DATA.find((g) => g.groupId === groupId);
  const [unitModal, setUnitModal] = useState<FieldDetail | null>(null);
  const [sortBy, setSortBy] = useState<"points" | "rate" | "weak">("points");

  if (!group) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-400">教科が見つかりません</p>
      </div>
    );
  }

  const totalQ = group.fields.reduce((s, f) => s + f.total, 0);
  const correctQ = group.fields.reduce((s, f) => s + f.correct, 0);
  const rate = totalQ > 0 ? correctQ / totalQ : 0;
  const estimatedScore = Math.round(rate * group.maxScore);

  // 分野ごとの問題数を計算
  const fieldQuestionCounts = group.fields.map((f) => {
    const handwritten = SAMPLE_QUESTIONS_BY_FIELD[f.fieldId] || [];
    const all = getFieldQuestions(f.fieldId, handwritten);
    return { fieldId: f.fieldId, count: all.length };
  });
  const questionCountMap = Object.fromEntries(fieldQuestionCounts.map((fq) => [fq.fieldId, fq.count]));
  const totalAvailable = fieldQuestionCounts.reduce((s, fq) => s + fq.count, 0);

  // ソート
  const sortedFields = [...group.fields].sort((a, b) => {
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

  // 弱点分野
  const weakFields = [...group.fields]
    .filter((f) => f.total >= 3)
    .sort((a, b) => (a.correct / a.total) - (b.correct / b.total))
    .slice(0, 2);

  // 復習待ち合計
  const totalReviewDue = group.fields.reduce(
    (s, f) => s + f.units.reduce((us, u) => us + u.reviewDue, 0), 0
  );

  return (
    <div className="min-h-screen pb-16">
      {/* ヘッダー */}
      <header className="sticky top-0 z-40 bg-gray-950/90 backdrop-blur border-b border-gray-800/50 px-3 py-2.5">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center gap-3">
            <button onClick={() => router.push("/")} className="text-gray-500 text-sm hover:text-gray-300 transition-colors">← マップ</button>
            <div className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold"
                 style={{ backgroundColor: `${group.color}22`, color: group.color }}>
              {group.label.charAt(0)}
            </div>
            <div className="flex-1">
              <h1 className="text-lg font-bold">{group.label}</h1>
              <div className="text-[10px] text-gray-500">
                {group.fields.length}分野 ・ 問題{totalAvailable}問
                {totalReviewDue > 0 && <span className="text-amber-400 ml-1">・復習待ち{totalReviewDue}問</span>}
              </div>
            </div>
            <div className="text-right">
              <div className="text-xl font-mono font-bold" style={{ color: group.color }}>
                {estimatedScore}<span className="text-gray-600 text-sm">/{group.maxScore}</span>
              </div>
              <div className="text-[10px] text-gray-500">{Math.round(rate * 100)}% 正答率</div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-3 pt-4">
        {/* 弱点アラート */}
        {weakFields.length > 0 && (
          <div className="mb-3 p-2.5 bg-red-950/30 border border-red-900/30 rounded-xl">
            <div className="text-[10px] text-red-400 font-bold mb-1.5">弱点分野 — クリックで集中ドリル</div>
            <div className="flex gap-1.5">
              {weakFields.map((wf) => {
                const wRate = wf.total > 0 ? wf.correct / wf.total : 0;
                return (
                  <button key={wf.fieldId} onClick={() => router.push(`/drill/${wf.fieldId}`)}
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
        <div className="flex items-center gap-1.5 mb-3">
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
                sortBy === s.key
                  ? "text-white"
                  : "text-gray-500 hover:text-gray-300"
              }`}
              style={sortBy === s.key ? { backgroundColor: `${group.color}33`, color: group.color } : {}}
            >
              {s.label}
            </button>
          ))}
        </div>

        {/* 分野ヒートマップ (グリッド) */}
        <div className="grid grid-cols-2 gap-2">
          {sortedFields.map((field) => {
            const fRate = field.total > 0 ? field.correct / field.total : 0;
            const bg = rateToColor(fRate, field.total);
            const txt = rateToTextColor(fRate);
            const pct = Math.round(fRate * 100);
            const totalPoints = group.fields.reduce((s, f) => s + f.points, 0);
            // 配点に比例した高さ
            const heightRatio = field.points / totalPoints;
            const minH = 80;
            const h = Math.max(minH, Math.round(heightRatio * 400));
            const qCount = questionCountMap[field.fieldId] || 0;
            const fieldReviewDue = field.units.reduce((s, u) => s + u.reviewDue, 0);

            return (
              <button
                key={field.fieldId}
                onClick={() => setUnitModal(field)}
                className="rounded-xl border-2 p-3 text-left transition-all active:scale-[0.97] hover:brightness-110 relative overflow-hidden"
                style={{ backgroundColor: bg, borderColor: `${group.color}44`, color: txt, minHeight: `${h}px` }}
              >
                <div className="text-sm font-bold">{field.fieldName}</div>
                <div className="text-2xl font-mono font-bold mt-1">{pct}%</div>
                <div className="text-[10px] opacity-70 mt-0.5">{field.correct}/{field.total}問 | {field.points}点</div>
                <div className="text-[10px] opacity-60">{qCount}問収録</div>

                {/* 単元ミニドット */}
                <div className="flex gap-1 mt-2">
                  {field.units.map((u) => {
                    const uRate = u.total > 0 ? u.correct / u.total : 0;
                    return (
                      <div key={u.unitId} className="flex-1">
                        <div className="h-1.5 rounded-full" style={{ backgroundColor: rateToColor(uRate, u.total) }} />
                        <div className="text-[8px] mt-0.5 truncate opacity-60">{u.unitName}</div>
                      </div>
                    );
                  })}
                </div>

                {/* 復習待ちバッジ */}
                {fieldReviewDue > 0 && (
                  <div className="absolute top-2 right-2 text-[9px] px-1.5 py-0.5 rounded-full bg-amber-500 text-black font-bold">
                    復習{fieldReviewDue}
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* 全体サマリーバー */}
        <div className="mt-4 p-3 bg-gray-900 rounded-xl border border-gray-800">
          <div className="text-xs text-gray-400 mb-2">{group.label} 分野別正答率</div>
          <div className="space-y-1.5">
            {group.fields.map((field) => {
              const fRate = field.total > 0 ? field.correct / field.total : 0;
              const pct = Math.round(fRate * 100);
              return (
                <div key={field.fieldId} className="flex items-center gap-2">
                  <span className="text-[10px] w-24 truncate text-gray-400">{field.fieldName}</span>
                  <div className="flex-1 h-2 bg-gray-800 rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: rateToColor(fRate, field.total) }} />
                  </div>
                  <span className="text-[10px] font-mono w-8 text-right" style={{ color: rateToColor(fRate, field.total) }}>{pct}%</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* ドリルボタン */}
        <div className="mt-4 flex gap-2">
          <button
            onClick={() => router.push(`/drill/${[...group.fields].sort((a, b) => (a.correct / a.total) - (b.correct / b.total))[0]?.fieldId}`)}
            className="flex-1 py-3 rounded-xl font-medium text-sm transition-colors"
            style={{ backgroundColor: group.color, color: "#fff" }}
          >
            弱点ドリルを開始
          </button>
          <button
            onClick={() => {
              const randomField = group.fields[Math.floor(Math.random() * group.fields.length)];
              router.push(`/drill/${randomField.fieldId}`);
            }}
            className="py-3 px-4 rounded-xl font-medium text-sm border transition-colors"
            style={{ borderColor: `${group.color}44`, color: group.color }}
          >
            ランダム
          </button>
        </div>
      </main>

      {/* 単元モーダル */}
      {unitModal && (
        <UnitModal field={unitModal} group={group} onClose={() => setUnitModal(null)} onDrill={(fId) => { router.push(`/drill/${fId}`); }}
                   questionCount={questionCountMap[unitModal.fieldId] || 0} />
      )}

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

function UnitModal({ field, group, onClose, onDrill, questionCount }: {
  field: FieldDetail; group: SubjectGroup; onClose: () => void; onDrill: (fId: string) => void; questionCount: number;
}) {
  const fRate = field.total > 0 ? field.correct / field.total : 0;
  const totalReview = field.units.reduce((s, u) => s + u.reviewDue, 0);

  return (
    <div className="fixed inset-0 z-[100] flex items-end md:items-center justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-lg max-h-[85vh] overflow-y-auto bg-gray-900 border-t md:border border-gray-700 rounded-t-2xl md:rounded-2xl p-4 z-10">
        <div className="md:hidden w-10 h-1 bg-gray-700 rounded-full mx-auto mb-3" />

        {/* ヘッダー */}
        <div className="flex items-center justify-between mb-2">
          <div>
            <div className="text-xs" style={{ color: group.color }}>{group.label}</div>
            <h2 className="text-lg font-bold">{field.fieldName}</h2>
          </div>
          <div className="text-right">
            <div className="text-2xl font-mono font-bold" style={{ color: rateToColor(fRate, field.total) }}>
              {Math.round(fRate * 100)}%
            </div>
            <div className="text-[10px] text-gray-500">{field.correct}/{field.total}問 | {field.points}点配点</div>
          </div>
        </div>

        {/* 問題数・復習情報 */}
        <div className="flex gap-2 mb-3">
          <div className="flex-1 p-2 bg-gray-800 rounded-lg text-center">
            <div className="text-lg font-mono font-bold" style={{ color: group.color }}>{questionCount}</div>
            <div className="text-[10px] text-gray-500">収録問題数</div>
          </div>
          <div className="flex-1 p-2 bg-gray-800 rounded-lg text-center">
            <div className="text-lg font-mono font-bold text-amber-400">{totalReview}</div>
            <div className="text-[10px] text-gray-500">復習待ち</div>
          </div>
          <div className="flex-1 p-2 bg-gray-800 rounded-lg text-center">
            <div className="text-lg font-mono font-bold text-gray-300">{field.units.length}</div>
            <div className="text-[10px] text-gray-500">単元数</div>
          </div>
        </div>

        {/* 単元ヒートマップ */}
        <div className="space-y-2">
          {field.units.map((unit) => {
            const uRate = unit.total > 0 ? unit.correct / unit.total : 0;
            const bg = rateToColor(uRate, unit.total);
            return (
              <div key={unit.unitId} className="rounded-xl border overflow-hidden" style={{ borderColor: `${group.color}33` }}>
                <div className="flex items-center gap-2 p-3" style={{ backgroundColor: `${bg}15` }}>
                  <div className="w-2 h-8 rounded-full shrink-0" style={{ backgroundColor: bg }} />
                  <div className="flex-1">
                    <div className="text-sm font-medium">{unit.unitName}</div>
                    <div className="text-[10px] text-gray-500 mt-0.5">
                      {"★".repeat(unit.difficulty)}{"☆".repeat(5 - unit.difficulty)} | 最終{unit.lastStudied?.slice(5) || "—"}
                      {unit.reviewDue > 0 && <span className="text-amber-400 ml-2">復習{unit.reviewDue}問</span>}
                    </div>
                  </div>
                  <div className="text-lg font-mono font-bold" style={{ color: bg }}>{Math.round(uRate * 100)}%</div>
                </div>
                <div className="h-1 bg-gray-800"><div className="h-full" style={{ width: `${uRate * 100}%`, backgroundColor: bg }} /></div>
              </div>
            );
          })}
        </div>

        {/* アクションボタン */}
        <div className="mt-4 flex gap-2">
          <button onClick={onClose} className="flex-1 py-2.5 border border-gray-700 rounded-xl text-sm">閉じる</button>
          <button onClick={() => { onDrill(field.fieldId); onClose(); }}
                  className="flex-1 py-2.5 rounded-xl text-sm font-medium" style={{ backgroundColor: group.color, color: "#fff" }}>
            {field.fieldName}のドリル ({questionCount}問)
          </button>
        </div>
      </div>
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
