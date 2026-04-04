"use client";

import { useRouter } from "next/navigation";
import { isLoggedIn } from "@/lib/auth";
import { useState, useEffect, useCallback } from "react";
import { TAGLINE, CATCHCOPY, BRAND, TARGET_TAGLINE, ELEVATOR_PITCH, FAQ, getSeasonalCopy } from "@kyoutsu/shared";
import { FaqJsonLd } from "@/components/seo/FaqJsonLd";
import { LogoMark } from "@/components/brand/LogoMark";
import { SnsFollowCta, SnsLinks } from "@/components/brand/SnsLinks";

const FEATURES = [
  {
    icon: "▣",
    title: "S&P500スタイル学習マップ",
    desc: "全9科目900点を配点比例のブロックで可視化。正答率に応じて赤→緑にリアルタイム変化。弱点が一目でわかる。",
    color: "#22c55e",
  },
  {
    icon: "🧠",
    title: "忘却曲線 (SM-2) で最適復習",
    desc: "科学的アルゴリズムが「今日復習すべき問題」を自動選出。覚えたことを忘れない仕組み。",
    color: "#3b82f6",
  },
  {
    icon: "🎯",
    title: "弱点自動検出 & 重点ドリル",
    desc: "正答率が低い分野を自動特定。苦手な分野だけを集中的に鍛えるドリルを生成。",
    color: "#f97316",
  },
  {
    icon: "🏃",
    title: "タイムキーパー",
    desc: "本番までの残り日数から逆算し、日次・週次・月次の学習計画を自動生成。",
    color: "#8b5cf6",
  },
];

const SUBJECTS = [
  { name: "国語", score: 200, color: "#f97316" },
  { name: "数学", score: 200, color: "#3b82f6" },
  { name: "英語", score: 200, color: "#ec4899" },
  { name: "理科", score: 200, color: "#14b8a6" },
  { name: "社会", score: 100, color: "#eab308" },
  { name: "情報", score: 100, color: "#06b6d4" },
];

const HEATMAP_DEMO = [
  // 模擬ヒートマップブロック (row, col, rate)
  { w: 3, h: 2, rate: 0.85 }, { w: 2, h: 2, rate: 0.42 }, { w: 2, h: 2, rate: 0.91 },
  { w: 2, h: 1, rate: 0.67 }, { w: 3, h: 1, rate: 0.33 }, { w: 2, h: 1, rate: 0.78 },
  { w: 2, h: 2, rate: 0.55 }, { w: 3, h: 2, rate: 0.95 }, { w: 2, h: 2, rate: 0.28 },
];

function rateToColor(rate: number): string {
  if (rate <= 0.5) {
    const t = rate / 0.5;
    return `rgb(${Math.round(220 - t * 30)},${Math.round(38 + t * 185)},38)`;
  }
  const t = (rate - 0.5) / 0.5;
  return `rgb(${Math.round(190 - t * 156)},${Math.round(223 - t * 26)},${Math.round(38 + t * 59)})`;
}

export default function LandingPage() {
  const router = useRouter();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    if (isLoggedIn()) router.replace("/");
  }, [router]);

  const handleScroll = useCallback(() => {
    setScrolled(window.scrollY > 60);
  }, []);

  useEffect(() => {
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100">
      <FaqJsonLd />

      {/* ── 固定ヘッダー ── */}
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? "bg-gray-950/95 backdrop-blur-md border-b border-gray-800/50 py-2" : "bg-transparent py-4"
      }`}>
        <div className="max-w-4xl mx-auto px-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <LogoMark className="w-6 h-6" />
            <span className={`font-bold transition-opacity ${scrolled ? "opacity-100" : "opacity-0"}`}>
              {BRAND.NAME}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <a href="#features" className={`text-xs text-gray-400 hover:text-gray-200 transition-all hidden sm:inline ${
              scrolled ? "opacity-100" : "opacity-0"
            }`}>機能</a>
            <a href="#faq" className={`text-xs text-gray-400 hover:text-gray-200 transition-all hidden sm:inline ${
              scrolled ? "opacity-100" : "opacity-0"
            }`}>FAQ</a>
            <button
              onClick={() => router.push("/login")}
              className="px-4 py-1.5 bg-green-600 hover:bg-green-700 rounded-lg font-bold text-xs
                         transition-all hover:scale-105 active:scale-95"
            >
              無料ではじめる
            </button>
          </div>
        </div>
      </header>

      {/* ── Hero Section ── */}
      <section className="relative overflow-hidden">
        {/* 背景のヒートマップ装飾 */}
        <div className="absolute inset-0 opacity-10">
          <div className="grid grid-cols-7 gap-1 p-4 h-full">
            {HEATMAP_DEMO.concat(HEATMAP_DEMO).concat(HEATMAP_DEMO).map((block, i) => (
              <div
                key={i}
                className="rounded-md"
                style={{
                  backgroundColor: rateToColor(block.rate),
                  gridColumn: `span ${block.w}`,
                  gridRow: `span ${block.h}`,
                }}
              />
            ))}
          </div>
        </div>

        <div className="relative z-10 max-w-4xl mx-auto px-4 pt-28 pb-20 md:pt-36 md:pb-32 text-center">
          <div className="mb-4 flex justify-center">
            <LogoMark className="w-16 h-16" />
          </div>
          <h1 className="text-4xl md:text-6xl font-black mb-3">
            <span className="bg-gradient-to-r from-green-400 via-emerald-300 to-blue-400 bg-clip-text text-transparent">
              大学物語
            </span>
          </h1>
          <p className="text-lg md:text-xl text-gray-300 font-medium mb-2">
            共通テスト攻略プラットフォーム
          </p>
          <p className="text-2xl md:text-3xl font-bold text-white mt-6 mb-8">
            {CATCHCOPY.HERO.headline}
          </p>
          <p className="text-sm md:text-base text-gray-400 max-w-xl mx-auto mb-10">
            {CATCHCOPY.HERO.sub}
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => router.push("/login")}
              className="px-8 py-3.5 bg-green-600 hover:bg-green-700 rounded-xl font-bold text-lg
                         transition-all hover:scale-105 active:scale-95 shadow-lg shadow-green-600/20"
            >
              無料ではじめる
            </button>
            <a
              href="#features"
              className="px-8 py-3.5 border border-gray-700 hover:border-gray-500 rounded-xl font-medium
                         transition-all hover:bg-gray-900"
            >
              機能を見る
            </a>
          </div>

          {/* スクロールヒント */}
          <div className="mt-16 animate-bounce">
            <a href="#demo" className="text-gray-600 hover:text-gray-400 transition-colors">
              <svg className="w-6 h-6 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
              </svg>
            </a>
          </div>
        </div>
      </section>

      {/* ── 科目バー ── */}
      <section className="bg-gray-900/50 border-y border-gray-800/50 py-6">
        <div className="max-w-4xl mx-auto px-4">
          <p className="text-center text-xs text-gray-500 mb-3">対象: 共通テスト全9科目 / 900点満点</p>
          <div className="flex justify-center gap-2 flex-wrap">
            {SUBJECTS.map((s) => (
              <div key={s.name} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-800/50">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: s.color }} />
                <span className="text-xs font-medium">{s.name}</span>
                <span className="text-[10px] text-gray-500">{s.score}点</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── デモ ヒートマップ ── */}
      <section id="demo" className="max-w-4xl mx-auto px-4 py-16">
        <h2 className="text-center text-xl font-bold mb-2">学習マップで全科目を俯瞰</h2>
        <p className="text-center text-sm text-gray-400 mb-8">
          配点に比例したブロックサイズ。正答率で色が変化。弱点が一目瞭然。
        </p>

        {/* 模擬ヒートマップ */}
        <div className="bg-gray-900 rounded-2xl border border-gray-800 p-4 max-w-2xl mx-auto">
          <div className="grid grid-cols-3 gap-2">
            {SUBJECTS.map((sub) => (
              <div
                key={sub.name}
                className="rounded-xl border border-gray-800 overflow-hidden"
                style={{ gridColumn: sub.score >= 200 ? "span 1" : "span 1" }}
              >
                <div className="px-2.5 py-1.5 border-b border-gray-800/50 flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: sub.color }} />
                  <span className="font-bold text-xs">{sub.name}</span>
                </div>
                <div className="p-1.5 flex flex-wrap gap-1">
                  {Array.from({ length: sub.score >= 200 ? 5 : 3 }, (_, i) => {
                    const rate = [0.85, 0.42, 0.91, 0.33, 0.67][i % 5];
                    return (
                      <div
                        key={i}
                        className="rounded-md px-1.5 py-2 flex-1 min-w-[40px]"
                        style={{ backgroundColor: rateToColor(rate) }}
                      >
                        <div className="text-[9px] font-mono font-bold text-center" style={{ color: rate > 0.6 ? "#052e16" : "#fff" }}>
                          {Math.round(rate * 100)}%
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* 凡例 */}
          <div className="mt-3 flex items-center gap-2 justify-center text-[10px] text-gray-500">
            <span>弱い</span>
            <div className="flex gap-0.5">
              {["#dc2626", "#ef4444", "#f87171", "#fca5a5", "#fde68a", "#bef264", "#4ade80", "#22c55e"].map((c, i) => (
                <div key={i} className="w-4 h-2.5 rounded-sm" style={{ backgroundColor: c }} />
              ))}
            </div>
            <span>習得済み</span>
          </div>
        </div>
      </section>

      {/* ── エレベーターピッチ ── */}
      <section className="max-w-3xl mx-auto px-4 py-16 text-center">
        <p className="text-[10px] text-green-400 font-bold tracking-widest uppercase mb-4">What is {BRAND.NAME}?</p>
        <p className="text-base md:text-lg text-gray-300 leading-relaxed">
          {ELEVATOR_PITCH.FULL}
        </p>
      </section>

      {/* ── Features ── */}
      <section id="features" className="max-w-4xl mx-auto px-4 py-16">
        <h2 className="text-center text-xl font-bold mb-2">{BRAND.NAME}の4つの武器</h2>
        <p className="text-center text-sm text-gray-400 mb-10">{CATCHCOPY.FEATURES.headline}</p>

        <div className="grid md:grid-cols-2 gap-4">
          {FEATURES.map((f) => (
            <div key={f.title} className="bg-gray-900 rounded-xl border border-gray-800 p-5 hover:border-gray-700 transition-colors">
              <div className="flex items-center gap-3 mb-3">
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center text-lg"
                  style={{ backgroundColor: `${f.color}20`, color: f.color }}
                >
                  {f.icon}
                </div>
                <h3 className="font-bold">{f.title}</h3>
              </div>
              <p className="text-sm text-gray-400 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── 比較表 ── */}
      <section className="max-w-4xl mx-auto px-4 py-16">
        <h2 className="text-center text-xl font-bold mb-2">なぜ大学物語なのか</h2>
        <p className="text-center text-sm text-gray-400 mb-10">従来の勉強法との違い</p>

        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse max-w-2xl mx-auto">
            <thead>
              <tr>
                <th className="text-left py-3 px-4 text-gray-500 font-normal border-b border-gray-800" />
                <th className="py-3 px-4 text-gray-500 font-normal border-b border-gray-800 text-center">従来の勉強法</th>
                <th className="py-3 px-4 font-bold border-b border-green-800/50 text-center text-green-400">大学物語</th>
              </tr>
            </thead>
            <tbody>
              {[
                { label: "弱点の把握", old: "なんとなく苦手", neo: "正答率で可視化" },
                { label: "復習タイミング", old: "気分次第", neo: "SM-2が自動計算" },
                { label: "学習計画", old: "自分で作成", neo: "逆算で自動生成" },
                { label: "進捗の確認", old: "ノートを見返す", neo: "ヒートマップで一目瞭然" },
                { label: "全科目の管理", old: "科目ごとにバラバラ", neo: "900点を1画面で俯瞰" },
                { label: "料金", old: "塾: 月額数万円", neo: "完全無料" },
              ].map((row) => (
                <tr key={row.label} className="border-b border-gray-800/50">
                  <td className="py-3 px-4 font-medium text-gray-300">{row.label}</td>
                  <td className="py-3 px-4 text-center text-gray-500">{row.old}</td>
                  <td className="py-3 px-4 text-center text-green-400 font-medium">{row.neo}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* 中間CTA */}
        <div className="mt-12 text-center">
          <p className="text-sm text-gray-400 mb-4">まずは無料で体験してみよう</p>
          <button
            onClick={() => router.push("/login")}
            className="px-8 py-3 bg-green-600 hover:bg-green-700 rounded-xl font-bold
                       transition-all hover:scale-105 active:scale-95 shadow-lg shadow-green-600/20"
          >
            無料ではじめる
          </button>
        </div>
      </section>

      {/* ── How it works ── */}
      <section className="bg-gray-900/30 border-y border-gray-800/50 py-16">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-center text-xl font-bold mb-10">3ステップではじめる</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { step: "1", title: "偏差値を入力", desc: "現在の模試偏差値と志望大学を選択。あなたの現在地を把握します。", icon: "📝" },
              { step: "2", title: "学習マップを確認", desc: "全科目のヒートマップが生成。弱点がひと目でわかります。", icon: "🗺" },
              { step: "3", title: "毎日の課題をこなす", desc: "忘却曲線が最適な復習タイミングを自動計算。やるべきことが明確に。", icon: "✅" },
            ].map((s) => (
              <div key={s.step} className="text-center">
                <div className="text-3xl mb-3">{s.icon}</div>
                <div className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-green-600/20 text-green-400 font-bold text-sm mb-2">
                  {s.step}
                </div>
                <h3 className="font-bold mb-1">{s.title}</h3>
                <p className="text-sm text-gray-400">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── ソーシャルプルーフ ── */}
      <section className="max-w-4xl mx-auto px-4 py-16">
        <h2 className="text-center text-xl font-bold mb-2">{BRAND.NAME}が選ばれる理由</h2>
        <p className="text-center text-sm text-gray-400 mb-10">受験生の声と実績データ</p>

        {/* 数字実績 */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          {[
            { value: "9科目", label: "全科目対応", sub: "900点満点" },
            { value: "SM-2", label: "忘却曲線", sub: "科学的アルゴリズム" },
            { value: "∞", label: "自動ドリル生成", sub: "弱点特化" },
            { value: "0円", label: "完全無料", sub: "制限なし" },
          ].map((stat) => (
            <div key={stat.label} className="text-center p-4 bg-gray-900 rounded-xl border border-gray-800">
              <div className="text-2xl md:text-3xl font-black text-green-400 mb-1">{stat.value}</div>
              <div className="text-sm font-medium">{stat.label}</div>
              <div className="text-[10px] text-gray-500 mt-0.5">{stat.sub}</div>
            </div>
          ))}
        </div>

        {/* ユーザーの声 */}
        <div className="grid md:grid-cols-3 gap-4">
          {[
            {
              name: "高3・理系志望",
              text: "ヒートマップで自分の弱点が一目瞭然。数学の確率分野が赤いのを見て集中的に取り組んだら、模試で20点アップしました。",
              score: "680→720点",
            },
            {
              name: "高3・東大志望",
              text: "忘却曲線で「今日やるべき復習」が自動で出てくるので、計画を考える時間がゼロに。勉強に集中できます。",
              score: "750→810点",
            },
            {
              name: "高2・早慶志望",
              text: "全科目のバランスが色で見えるから、苦手を放置しなくなった。社会が真っ赤だったのが今は黄色に。",
              score: "620→690点",
            },
          ].map((voice) => (
            <div key={voice.name} className="bg-gray-900 rounded-xl border border-gray-800 p-5">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-full bg-green-600/20 flex items-center justify-center text-green-400 text-sm font-bold">
                  {voice.name[0]}
                </div>
                <div>
                  <div className="text-sm font-medium">{voice.name}</div>
                  <div className="text-[10px] text-green-400 font-mono font-bold">{voice.score}</div>
                </div>
              </div>
              <p className="text-sm text-gray-400 leading-relaxed">「{voice.text}」</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── ターゲット別メッセージ ── */}
      <section className="bg-gray-900/30 border-y border-gray-800/50 py-16">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-center text-xl font-bold mb-10">あなたに合った使い方</h2>
          <div className="grid md:grid-cols-3 gap-4">
            {[
              { icon: "🎓", label: "受験生", ...TARGET_TAGLINE.STUDENT },
              { icon: "👨‍👩‍👧", label: "保護者", ...TARGET_TAGLINE.PARENT },
              { icon: "👨‍🏫", label: "教育関係者", ...TARGET_TAGLINE.EDUCATOR },
            ].map((t) => (
              <div key={t.label} className="bg-gray-900 rounded-xl border border-gray-800 p-5">
                <div className="text-2xl mb-3">{t.icon}</div>
                <div className="text-[10px] text-green-400 font-bold mb-1">{t.label}</div>
                <h3 className="font-bold text-sm mb-2">{t.headline}</h3>
                <p className="text-xs text-gray-400 leading-relaxed">{t.sub}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 季節キャンペーン ── */}
      <SeasonalBanner />

      {/* ── FAQ ── */}
      <section id="faq" className="max-w-4xl mx-auto px-4 py-16">
        <h2 className="text-center text-xl font-bold mb-2">よくある質問</h2>
        <p className="text-center text-sm text-gray-400 mb-10">FAQ</p>
        <div className="space-y-3 max-w-2xl mx-auto">
          {FAQ.map((item, i) => (
            <details key={i} className="bg-gray-900 rounded-xl border border-gray-800 group">
              <summary className="px-5 py-4 cursor-pointer font-medium text-sm flex items-center justify-between hover:bg-gray-800/50 rounded-xl transition-colors">
                <span>{item.question}</span>
                <span className="text-gray-500 group-open:rotate-180 transition-transform text-xs ml-2">▼</span>
              </summary>
              <div className="px-5 pb-4 text-sm text-gray-400 leading-relaxed">
                {item.answer}
              </div>
            </details>
          ))}
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="max-w-4xl mx-auto px-4 py-20 text-center">
        <h2 className="text-2xl md:text-3xl font-bold mb-3">
          {CATCHCOPY.CTA.headline}
        </h2>
        <p className="text-gray-400 text-sm mb-8 max-w-md mx-auto">
          {CATCHCOPY.CTA.sub}
        </p>
        <button
          onClick={() => router.push("/login")}
          className="px-10 py-4 bg-green-600 hover:bg-green-700 rounded-xl font-bold text-lg
                     transition-all hover:scale-105 active:scale-95 shadow-lg shadow-green-600/20"
        >
          無料ではじめる
        </button>
      </section>

      {/* ── SNS Follow ── */}
      <section className="max-w-4xl mx-auto px-4 py-12">
        <SnsFollowCta />
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-gray-800 py-8">
        <div className="max-w-4xl mx-auto px-4 text-center text-xs text-gray-600">
          <div className="flex items-center justify-center gap-2 mb-3">
            <LogoMark className="w-4 h-4" />
            <span className="font-bold text-gray-400">{BRAND.NAME}</span>
            <span className="text-gray-600">— {TAGLINE.PRIMARY}</span>
          </div>
          <SnsLinks className="justify-center mb-3" />
          <p>Developed by Shimanto AI</p>
          <p className="mt-1">daigaku-monogatari.pages.dev</p>
        </div>
      </footer>
    </div>
  );
}

function SeasonalBanner() {
  const seasonal = getSeasonalCopy(new Date().getMonth() + 1);
  return (
    <section className="max-w-4xl mx-auto px-4 py-12">
      <div className="bg-gradient-to-r from-green-900/30 to-blue-900/30 border border-green-800/30 rounded-2xl p-8 text-center">
        <p className="text-[10px] text-green-400 font-bold tracking-widest uppercase mb-3">Season Campaign</p>
        <h2 className="text-xl md:text-2xl font-bold mb-2">{seasonal.headline}</h2>
        <p className="text-sm text-gray-400 mb-6">{seasonal.sub}</p>
        <a
          href="/login"
          className="inline-block px-6 py-2.5 bg-green-600 hover:bg-green-700 rounded-lg font-bold text-sm transition-all hover:scale-105 active:scale-95"
        >
          {seasonal.cta}
        </a>
      </div>
    </section>
  );
}
