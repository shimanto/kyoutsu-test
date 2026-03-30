"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { HIERARCHY_DATA, rateToColor, rateToTextColor, type FieldDetail, type SubjectGroup, type UnitStat } from "@/lib/hierarchy-data";

export default function SubjectDetailPage() {
  const params = useParams();
  const router = useRouter();
  const groupId = params.groupId as string;
  const group = HIERARCHY_DATA.find((g) => g.groupId === groupId);
  const [unitModal, setUnitModal] = useState<FieldDetail | null>(null);

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

  return (
    <div className="min-h-screen pb-16">
      {/* ヘッダー */}
      <header className="sticky top-0 z-40 bg-gray-950/90 backdrop-blur border-b border-gray-800/50 px-3 py-2.5">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center gap-3">
            <button onClick={() => router.push("/")} className="text-gray-500 text-sm">← マップ</button>
            <div className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold"
                 style={{ backgroundColor: `${group.color}22`, color: group.color }}>
              {group.label.charAt(0)}
            </div>
            <div className="flex-1">
              <h1 className="text-lg font-bold">{group.label}</h1>
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
        {/* 分野ヒートマップ (グリッド) */}
        <div className="grid grid-cols-2 gap-2">
          {group.fields.map((field) => {
            const fRate = field.total > 0 ? field.correct / field.total : 0;
            const bg = rateToColor(fRate, field.total);
            const txt = rateToTextColor(fRate);
            const pct = Math.round(fRate * 100);
            const totalPoints = group.fields.reduce((s, f) => s + f.points, 0);
            // 配点に比例した高さ
            const heightRatio = field.points / totalPoints;
            const minH = 80;
            const h = Math.max(minH, Math.round(heightRatio * 400));

            return (
              <button
                key={field.fieldId}
                onClick={() => setUnitModal(field)}
                className="rounded-xl border-2 p-3 text-left transition-all active:scale-[0.97] hover:brightness-110 relative overflow-hidden"
                style={{ backgroundColor: bg, borderColor: `${group.color}44`, color: txt, minHeight: `${h}px` }}
              >
                <div className="text-sm font-bold">{field.fieldName}</div>
                <div className="text-2xl font-mono font-bold mt-1">{pct}%</div>
                <div className="text-[10px] opacity-70 mt-0.5">{field.correct}/{field.total}問 ｜ {field.points}点</div>

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
                {field.units.some((u) => u.reviewDue > 0) && (
                  <div className="absolute top-2 right-2 text-[9px] px-1.5 py-0.5 rounded-full bg-amber-500 text-black font-bold">
                    復習{field.units.reduce((s, u) => s + u.reviewDue, 0)}
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* ドリルボタン */}
        <button
          onClick={() => router.push(`/drill/${group.fields.sort((a, b) => (a.correct / a.total) - (b.correct / b.total))[0]?.fieldId}`)}
          className="w-full mt-4 py-3 rounded-xl font-medium text-sm transition-colors"
          style={{ backgroundColor: group.color, color: "#fff" }}
        >
          {group.label}の弱点ドリルを開始
        </button>
      </main>

      {/* 単元モーダル */}
      {unitModal && (
        <UnitModal field={unitModal} group={group} onClose={() => setUnitModal(null)} onDrill={(fId) => { router.push(`/drill/${fId}`); }} />
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

function UnitModal({ field, group, onClose, onDrill }: {
  field: FieldDetail; group: SubjectGroup; onClose: () => void; onDrill: (fId: string) => void;
}) {
  const fRate = field.total > 0 ? field.correct / field.total : 0;
  return (
    <div className="fixed inset-0 z-[100] flex items-end md:items-center justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-lg max-h-[85vh] overflow-y-auto bg-gray-900 border-t md:border border-gray-700 rounded-t-2xl md:rounded-2xl p-4 z-10">
        <div className="md:hidden w-10 h-1 bg-gray-700 rounded-full mx-auto mb-3" />
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="text-xs" style={{ color: group.color }}>{group.label}</div>
            <h2 className="text-lg font-bold">{field.fieldName}</h2>
          </div>
          <div className="text-2xl font-mono font-bold" style={{ color: rateToColor(fRate, field.total) }}>
            {Math.round(fRate * 100)}%
          </div>
        </div>
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
                      {"★".repeat(unit.difficulty)}{"☆".repeat(5 - unit.difficulty)} ｜ 最終{unit.lastStudied?.slice(5) || "—"}
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
        <div className="mt-4 flex gap-2">
          <button onClick={onClose} className="flex-1 py-2.5 border border-gray-700 rounded-xl text-sm">閉じる</button>
          <button onClick={() => { onDrill(field.fieldId); onClose(); }}
                  className="flex-1 py-2.5 rounded-xl text-sm font-medium" style={{ backgroundColor: group.color, color: "#fff" }}>
            ドリル開始
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
