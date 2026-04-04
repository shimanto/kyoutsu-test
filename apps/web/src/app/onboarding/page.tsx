"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { SUBJECTS } from "@kyoutsu/shared";
import { apiGenerateTestData, apiGeneratePlan } from "@/lib/api";
import { getAuthUser, setAuthUser } from "@/lib/auth";

const TODAI_PRESETS = [
  { id: "todai_rika1", name: "東京大学 理科一類", targetTotal: 780, bunrui: "rika1" },
  { id: "todai_rika2", name: "東京大学 理科二類", targetTotal: 770, bunrui: "rika2" },
  { id: "todai_rika3", name: "東京大学 理科三類", targetTotal: 830, bunrui: "rika3" },
];

/** 関東圏 理系 難関国公立 上位10 */
const KANTO_RIKA_PRESETS = [
  { id: "titech",     name: "東京工業大学",         targetTotal: 720, bunrui: "rika1" },
  { id: "hitotsubashi_sci", name: "一橋大学 (理系併願)", targetTotal: 740, bunrui: "rika1" },
  { id: "tohoku",     name: "東北大学 理学部",       targetTotal: 700, bunrui: "rika1" },
  { id: "tsukuba",    name: "筑波大学 理工学群",     targetTotal: 690, bunrui: "rika1" },
  { id: "chiba",      name: "千葉大学 工学部",       targetTotal: 670, bunrui: "rika1" },
  { id: "yokohama",   name: "横浜国立大学 理工学部", targetTotal: 670, bunrui: "rika1" },
  { id: "ochanomizu", name: "お茶の水女子大学 理学部", targetTotal: 680, bunrui: "rika1" },
  { id: "noukou",     name: "東京農工大学 工学部",   targetTotal: 650, bunrui: "rika1" },
  { id: "denki",      name: "電気通信大学",         targetTotal: 640, bunrui: "rika1" },
  { id: "gakugei",    name: "東京学芸大学 理系",     targetTotal: 630, bunrui: "rika1" },
];

const UNIVERSITY_PRESETS = [
  ...TODAI_PRESETS,
  { id: "other", name: "その他の難関国公立（理系）", targetTotal: 700, bunrui: "rika1" },
];

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [selectedUniv, setSelectedUniv] = useState(UNIVERSITY_PRESETS[0]);
  const [deviation, setDeviation] = useState(60);
  const [showKanto, setShowKanto] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    estimatedTotal: number;
    subjectScores: { subjectId: string; rate: number; estimatedScore: number }[];
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const totalMax = SUBJECTS.reduce((s, sub) => s + sub.maxScore, 0);

  const handleGenerate = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiGenerateTestData({
        deviation,
        targetBunrui: selectedUniv.bunrui,
        targetTotal: selectedUniv.targetTotal,
        examYear: 2027,
      });
      setResult(res);

      // ユーザーキャッシュ更新
      const user = getAuthUser();
      if (user) {
        setAuthUser({ ...user, targetBunrui: selectedUniv.bunrui, targetTotal: selectedUniv.targetTotal });
      }

      // 学習計画も自動生成
      await apiGeneratePlan(20).catch(() => {});

      setStep(3);
    } catch (e) {
      setError(e instanceof Error ? e.message : "データ生成に失敗しました");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        {/* プログレス */}
        <div className="flex gap-2 mb-8">
          {[1, 2, 3].map((s) => (
            <div key={s} className={`h-1.5 flex-1 rounded-full ${s <= step ? "bg-green-500" : "bg-gray-800"}`} />
          ))}
        </div>

        {/* Step 1: 志望大学選択 */}
        {step === 1 && (
          <div>
            <h1 className="text-2xl font-bold mb-2">志望大学を選択</h1>
            <p className="text-gray-400 text-sm mb-6">目標点数と学習計画の基準になります</p>

            {!showKanto ? (
              <>
                {/* 東大 + その他 */}
                <div className="space-y-2">
                  {TODAI_PRESETS.map((univ) => (
                    <button key={univ.id}
                      onClick={() => { setSelectedUniv(univ); setShowKanto(false); }}
                      className={`w-full text-left px-4 py-3 rounded-lg border transition-all ${
                        selectedUniv.id === univ.id ? "border-green-500 bg-green-500/10" : "border-gray-700 bg-gray-900 hover:border-gray-600"
                      }`}>
                      <div className="font-medium">{univ.name}</div>
                      <div className="text-sm text-gray-400">目標: {univ.targetTotal} / {totalMax}</div>
                    </button>
                  ))}
                </div>
                <button onClick={() => setShowKanto(true)}
                  className="w-full mt-3 text-left px-4 py-3 rounded-lg border border-blue-700/50 bg-blue-900/10 hover:bg-blue-900/20 transition-colors">
                  <div className="font-medium text-blue-400">その他の難関国公立（理系）</div>
                  <div className="text-sm text-gray-500">関東圏の理系難関10校から選択</div>
                </button>
              </>
            ) : (
              <>
                {/* 関東圏理系難関10校 */}
                <button onClick={() => setShowKanto(false)}
                  className="text-sm text-gray-500 hover:text-gray-300 mb-3 flex items-center gap-1">
                  ← 東京大学に戻る
                </button>
                <p className="text-xs text-blue-400 font-bold mb-3">関東圏 理系 難関国公立 上位10</p>
                <div className="space-y-2 max-h-[400px] overflow-y-auto">
                  {KANTO_RIKA_PRESETS.map((univ) => (
                    <button key={univ.id}
                      onClick={() => setSelectedUniv(univ)}
                      className={`w-full text-left px-4 py-3 rounded-lg border transition-all ${
                        selectedUniv.id === univ.id ? "border-blue-500 bg-blue-500/10" : "border-gray-700 bg-gray-900 hover:border-gray-600"
                      }`}>
                      <div className="font-medium">{univ.name}</div>
                      <div className="text-sm text-gray-400">目標: {univ.targetTotal} / {totalMax}</div>
                    </button>
                  ))}
                </div>
              </>
            )}

            <button onClick={() => setStep(2)}
              className="w-full mt-6 py-3 bg-green-600 hover:bg-green-700 rounded-lg font-medium transition-colors">
              次へ
            </button>
          </div>
        )}

        {/* Step 2: 偏差値入力 */}
        {step === 2 && (
          <div>
            <h1 className="text-2xl font-bold mb-2">現在の偏差値を入力</h1>
            <p className="text-gray-400 text-sm mb-6">
              直近の模試の偏差値を入力してください。あなたの実力に合ったサンプルデータを生成します。
            </p>

            {error && (
              <div className="mb-4 p-3 bg-red-900/30 border border-red-800/30 rounded-lg text-sm text-red-400">{error}</div>
            )}

            {/* 偏差値スライダー */}
            <div className="bg-gray-900 rounded-xl border border-gray-800 p-6 mb-6">
              <div className="text-center mb-4">
                <span className="text-5xl font-mono font-bold text-green-400">{deviation}</span>
                <span className="text-gray-500 text-lg ml-1">偏差値</span>
              </div>

              <input
                type="range" min={35} max={80} value={deviation}
                onChange={(e) => setDeviation(Number(e.target.value))}
                className="w-full h-2 bg-gray-800 rounded-full appearance-none cursor-pointer
                           [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-6
                           [&::-webkit-slider-thumb]:h-6 [&::-webkit-slider-thumb]:bg-green-500
                           [&::-webkit-slider-thumb]:rounded-full"
              />
              <div className="flex justify-between text-xs text-gray-600 mt-1">
                <span>35</span><span>50</span><span>60</span><span>70</span><span>80</span>
              </div>

              {/* 目安表示 */}
              <div className="mt-4 text-center text-sm text-gray-400">
                {deviation >= 75 ? "東大理三 確実圏" :
                 deviation >= 70 ? "東大理一 安全圏" :
                 deviation >= 65 ? "旧帝大 上位" :
                 deviation >= 60 ? "旧帝大レベル" :
                 deviation >= 55 ? "国公立中堅" :
                 deviation >= 50 ? "平均" : "基礎固め段階"}
                ・推定得点 約{Math.round((0.58 + 0.35 * (2 / (1 + Math.exp(-1.5 * (deviation - 50) / 10)) - 1)) * 900)}/900
              </div>
            </div>

            <div className="flex gap-3">
              <button onClick={() => setStep(1)}
                className="flex-1 py-3 border border-gray-700 rounded-lg hover:bg-gray-900 transition-colors">戻る</button>
              <button onClick={handleGenerate} disabled={loading}
                className="flex-1 py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-800 rounded-lg font-medium transition-colors">
                {loading ? "データ生成中..." : "テストデータを生成"}
              </button>
            </div>
          </div>
        )}

        {/* Step 3: 結果表示 */}
        {step === 3 && result && (
          <div>
            <h1 className="text-2xl font-bold mb-2">準備完了！</h1>
            <p className="text-gray-400 text-sm mb-6">
              偏差値{deviation}のデータが生成されました。さっそく学習マップを確認しましょう。
            </p>

            <div className="bg-gray-900 rounded-xl border border-gray-800 p-4 mb-4">
              <div className="text-center mb-4">
                <div className="text-3xl font-mono font-bold text-white">{result.estimatedTotal}</div>
                <div className="text-xs text-gray-500">推定合計 / {totalMax}</div>
              </div>

              <div className="space-y-2">
                {result.subjectScores.map((s) => {
                  const sub = SUBJECTS.find((x) => x.id === s.subjectId);
                  const barColor = s.rate >= 80 ? "bg-green-500" : s.rate >= 65 ? "bg-yellow-500" : "bg-red-500";
                  return (
                    <div key={s.subjectId} className="flex items-center gap-2">
                      <span className="text-xs text-gray-400 w-10 shrink-0">{sub?.shortName || s.subjectId}</span>
                      <div className="flex-1 h-3 bg-gray-800 rounded-full overflow-hidden">
                        <div className={`h-full ${barColor} rounded-full`} style={{ width: `${s.rate}%` }} />
                      </div>
                      <span className="text-xs font-mono w-14 text-right">{s.estimatedScore}/{sub?.maxScore || 100}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            <button onClick={() => router.replace("/")}
              className="w-full py-3 bg-green-600 hover:bg-green-700 rounded-lg font-medium transition-colors">
              学習マップへ
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
