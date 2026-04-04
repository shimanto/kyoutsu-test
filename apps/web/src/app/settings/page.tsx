"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { LogoMark } from "@/components/brand/LogoMark";
import { generateOverviewFromDeviation, deviationLabel } from "@/lib/deviation-generator";
import { getAuthUser } from "@/lib/auth";

const DEVIATION_KEY = "kyoutsu_deviation";
const SUBJECT_STRENGTH_KEY = "kyoutsu_subject_strength";

interface SubjectStrength {
  id: string;
  label: string;
  color: string;
  /** -2=大の苦手, -1=苦手, 0=普通, 1=得意, 2=大の得意 */
  value: number;
}

const DEFAULT_STRENGTHS: SubjectStrength[] = [
  { id: "math",    label: "数学",  color: "#3b82f6", value: 0 },
  { id: "science", label: "理科",  color: "#14b8a6", value: 0 },
  { id: "english", label: "英語",  color: "#ec4899", value: 0 },
  { id: "kokugo",  label: "国語",  color: "#f97316", value: 0 },
  { id: "social",  label: "社会",  color: "#eab308", value: 0 },
];

const STRENGTH_LABELS: Record<number, { text: string; color: string }> = {
  [-2]: { text: "大の苦手", color: "text-red-500" },
  [-1]: { text: "苦手", color: "text-red-400" },
  [0]:  { text: "普通", color: "text-gray-400" },
  [1]:  { text: "得意", color: "text-green-400" },
  [2]:  { text: "大の得意", color: "text-green-500" },
};

function loadDeviation(): number {
  if (typeof window === "undefined") return 60;
  return Number(localStorage.getItem(DEVIATION_KEY)) || 60;
}

function loadStrengths(): SubjectStrength[] {
  if (typeof window === "undefined") return DEFAULT_STRENGTHS;
  try {
    const raw = localStorage.getItem(SUBJECT_STRENGTH_KEY);
    if (!raw) return DEFAULT_STRENGTHS;
    const saved = JSON.parse(raw) as Record<string, number>;
    return DEFAULT_STRENGTHS.map((s) => ({ ...s, value: saved[s.id] ?? 0 }));
  } catch {
    return DEFAULT_STRENGTHS;
  }
}

export default function SettingsPage() {
  const router = useRouter();
  const authUser = getAuthUser();
  const [deviation, setDeviation] = useState(loadDeviation);
  const [strengths, setStrengths] = useState<SubjectStrength[]>(loadStrengths);
  const [saved, setSaved] = useState(false);

  // 偏差値変更時にlocalStorageとヒートマップデータを更新
  const handleDeviationChange = (val: number) => {
    setDeviation(val);
    localStorage.setItem(DEVIATION_KEY, String(val));
    setSaved(false);
  };

  const handleStrengthChange = (id: string, delta: number) => {
    setStrengths((prev) =>
      prev.map((s) =>
        s.id === id ? { ...s, value: Math.max(-2, Math.min(2, s.value + delta)) } : s
      )
    );
    setSaved(false);
  };

  const handleSave = () => {
    localStorage.setItem(DEVIATION_KEY, String(deviation));
    const strengthMap: Record<string, number> = {};
    strengths.forEach((s) => { strengthMap[s.id] = s.value; });
    localStorage.setItem(SUBJECT_STRENGTH_KEY, JSON.stringify(strengthMap));
    setSaved(true);
    // 2秒後にトップへ遷移
    setTimeout(() => router.push("/"), 1500);
  };

  // 推定得点を偏差値+教科強弱から算出
  const baseRate = 0.58 + 0.35 * (2 / (1 + Math.exp(-1.5 * (deviation - 50) / 10)) - 1);
  const estimatedTotal = Math.round(baseRate * 900);

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100">
      {/* ヘッダー */}
      <header className="sticky top-0 z-40 bg-gray-950/90 backdrop-blur-md border-b border-gray-800/50 px-3 py-2">
        <div className="max-w-lg mx-auto flex items-center justify-between">
          <button onClick={() => router.back()} className="text-gray-500 hover:text-gray-300 text-sm">← 戻る</button>
          <span className="font-bold text-sm flex items-center gap-1.5">
            <LogoMark className="w-4 h-4" />
            学力設定
          </span>
          <div className="w-10" />
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-6 space-y-8">
        {/* ユーザー情報 */}
        {authUser && (
          <div className="text-center text-sm text-gray-500">
            {authUser.displayName} さんの学力設定
          </div>
        )}

        {/* ── 偏差値設定 ── */}
        <section>
          <h2 className="text-sm font-bold mb-4 flex items-center gap-2">
            <span className="w-1 h-4 rounded bg-green-500" />
            偏差値
          </h2>
          <div className="bg-gray-900 rounded-xl border border-gray-800 p-5">
            <div className="text-center mb-4">
              <span className="text-5xl font-mono font-bold text-green-400">{deviation}</span>
              <p className="text-xs text-gray-500 mt-1">{deviationLabel(deviation)}</p>
            </div>
            <input
              type="range" min={35} max={80} value={deviation}
              onChange={(e) => handleDeviationChange(Number(e.target.value))}
              className="w-full h-2 bg-gray-800 rounded-full appearance-none cursor-pointer
                         [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-6
                         [&::-webkit-slider-thumb]:h-6 [&::-webkit-slider-thumb]:bg-green-500
                         [&::-webkit-slider-thumb]:rounded-full"
            />
            <div className="flex justify-between text-[10px] text-gray-600 mt-1">
              <span>35</span><span>50</span><span>60</span><span>70</span><span>80</span>
            </div>
            <div className="text-center mt-3 text-xs text-gray-400">
              推定得点: <span className="font-mono font-bold text-white">{estimatedTotal}</span> / 900
            </div>
          </div>
        </section>

        {/* ── 5教科 得意不得意スイッチ ── */}
        <section>
          <h2 className="text-sm font-bold mb-4 flex items-center gap-2">
            <span className="w-1 h-4 rounded bg-blue-500" />
            教科の得意・不得意
          </h2>
          <div className="space-y-3">
            {strengths.map((subj) => {
              const info = STRENGTH_LABELS[subj.value] || STRENGTH_LABELS[0];
              return (
                <div key={subj.id} className="bg-gray-900 rounded-xl border border-gray-800 p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded" style={{ backgroundColor: subj.color }} />
                      <span className="font-medium text-sm">{subj.label}</span>
                    </div>
                    <span className={`text-xs font-bold ${info.color}`}>{info.text}</span>
                  </div>
                  {/* 5段階スイッチ */}
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleStrengthChange(subj.id, -1)}
                      disabled={subj.value <= -2}
                      className="px-2 py-1 rounded bg-gray-800 hover:bg-gray-700 disabled:opacity-30 text-xs"
                    >−</button>
                    <div className="flex-1 flex gap-0.5">
                      {[-2, -1, 0, 1, 2].map((level) => (
                        <div
                          key={level}
                          className={`flex-1 h-3 rounded-sm transition-all ${
                            level <= subj.value
                              ? level >= 1 ? "bg-green-500" : level === 0 ? "bg-gray-500" : "bg-red-500"
                              : "bg-gray-800"
                          }`}
                        />
                      ))}
                    </div>
                    <button
                      onClick={() => handleStrengthChange(subj.id, 1)}
                      disabled={subj.value >= 2}
                      className="px-2 py-1 rounded bg-gray-800 hover:bg-gray-700 disabled:opacity-30 text-xs"
                    >+</button>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* ── 保存ボタン ── */}
        <button
          onClick={handleSave}
          className={`w-full py-3 rounded-xl font-bold transition-all text-sm ${
            saved
              ? "bg-green-600/20 text-green-400 border border-green-600/30"
              : "bg-green-600 hover:bg-green-700 text-white"
          }`}
        >
          {saved ? "保存しました！ トップに戻ります..." : "保存してヒートマップに反映"}
        </button>

        {/* 志望校変更リンク */}
        <div className="text-center">
          <button onClick={() => router.push("/onboarding")}
            className="text-xs text-gray-500 hover:text-gray-300 transition-colors">
            志望校を変更する →
          </button>
        </div>
      </main>
    </div>
  );
}
