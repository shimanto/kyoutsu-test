"use client";

import {
  BRAND, TAGLINE, CATCHCOPY, SEASONAL_COPY, TARGET_TAGLINE,
  STAGE_COPY, ELEVATOR_PITCH, BRAND_VOICE, SNS_ACCOUNTS,
} from "@kyoutsu/shared";
import { LogoMark } from "@/components/brand/LogoMark";

/* ── Color palette ── */
const BRAND_COLORS = [
  { name: "Primary Green",  hex: "#22c55e", usage: "テーマカラー・習得済み" },
  { name: "Dark BG",        hex: "#030712", usage: "背景 (gray-950)" },
  { name: "Slate BG",       hex: "#0f172a", usage: "サブ背景" },
  { name: "Alert Red",      hex: "#dc2626", usage: "弱点・未習得" },
  { name: "Warning Amber",  hex: "#fde68a", usage: "中間状態" },
  { name: "Success Light",  hex: "#4ade80", usage: "高正答率" },
];

const SUBJECT_COLORS = [
  { name: "国語", hex: "#f97316" },
  { name: "数学", hex: "#3b82f6" },
  { name: "英語", hex: "#ec4899" },
  { name: "理科", hex: "#14b8a6" },
  { name: "社会", hex: "#eab308" },
  { name: "情報", hex: "#06b6d4" },
];

const GRID_COLORS = [
  "#dc2626", "#f87171", "#fde68a",
  "#fca5a5", "#bef264", "#4ade80",
  "#86efac", "#22c55e", "#15803d",
];

function rateToColor(rate: number): string {
  if (rate <= 0.5) {
    const t = rate / 0.5;
    return `rgb(${Math.round(220 - t * 30)},${Math.round(38 + t * 185)},38)`;
  }
  const t = (rate - 0.5) / 0.5;
  return `rgb(${Math.round(190 - t * 156)},${Math.round(223 - t * 26)},${Math.round(38 + t * 59)})`;
}

/* ── Section wrapper ── */
function Section({ id, title, children }: { id: string; title: string; children: React.ReactNode }) {
  return (
    <section id={id} className="scroll-mt-20">
      <h2 className="text-lg font-bold mb-6 flex items-center gap-2">
        <span className="w-1 h-5 rounded bg-green-500" />
        {title}
      </h2>
      {children}
    </section>
  );
}

/* ── Copycard ── */
function CopyCard({ label, headline, sub }: { label: string; headline: string; sub?: string }) {
  return (
    <div className="bg-gray-900 rounded-xl border border-gray-800 p-4">
      <span className="text-[10px] text-green-400 font-bold tracking-wider uppercase">{label}</span>
      <p className="font-bold mt-1">{headline}</p>
      {sub && <p className="text-xs text-gray-400 mt-1 leading-relaxed">{sub}</p>}
    </div>
  );
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

export default function BrandGuidePage() {
  const NAV = [
    { id: "logo", label: "ロゴ" },
    { id: "colors", label: "カラー" },
    { id: "tagline", label: "タグライン" },
    { id: "copy", label: "コピー体系" },
    { id: "target", label: "ターゲット別" },
    { id: "seasonal", label: "季節" },
    { id: "voice", label: "ボイス" },
    { id: "sns", label: "SNS" },
  ];

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100">
      {/* ── Header ── */}
      <header className="sticky top-0 z-50 bg-gray-950/95 backdrop-blur-md border-b border-gray-800/50">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <LogoMark className="w-6 h-6" />
            <span className="font-bold text-sm">Brand Guide</span>
          </div>
          <nav className="hidden md:flex items-center gap-1 text-xs">
            {NAV.map((n) => (
              <a key={n.id} href={`#${n.id}`}
                 className="px-2.5 py-1 rounded-md text-gray-400 hover:text-white hover:bg-gray-800 transition-colors">
                {n.label}
              </a>
            ))}
          </nav>
        </div>
      </header>

      {/* ── Hero ── */}
      <div className="max-w-5xl mx-auto px-4 pt-12 pb-8 text-center">
        <LogoMark className="w-20 h-20 mx-auto mb-4" />
        <h1 className="text-3xl md:text-4xl font-black bg-gradient-to-r from-green-400 via-emerald-300 to-blue-400 bg-clip-text text-transparent mb-2">
          {BRAND.NAME}
        </h1>
        <p className="text-gray-400 text-sm">{BRAND.FORMAL}</p>
        <p className="text-green-400 font-bold mt-3">{TAGLINE.PRIMARY}</p>
      </div>

      <main className="max-w-5xl mx-auto px-4 pb-20 space-y-16">

        {/* ════════ 1. LOGO & ICONS ════════ */}
        <Section id="logo" title="ロゴ & アイコン">
          {/* Concept */}
          <div className="bg-gray-900 rounded-xl border border-gray-800 p-5 mb-6">
            <h3 className="text-sm font-bold text-green-400 mb-2">デザインコンセプト</h3>
            <p className="text-sm text-gray-300 leading-relaxed">
              <strong>3x3ヒートマップグリッド</strong>をロゴマークとし、
              「弱点(赤) → 成長(黄) → 習得(緑)」の学習プログレスを視覚化。
              配点ヒートマップという本サービスの核心機能をそのままブランドシンボルにしている。
            </p>
          </div>

          {/* Grid color breakdown */}
          <div className="mb-8">
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Grid Color Map</h3>
            <div className="grid grid-cols-3 gap-2 max-w-xs">
              {["Weak", "Weak", "Growing", "Growing", "Growing", "Advancing", "Advancing", "Mastered", "Mastered"].map((stage, i) => (
                <div key={i} className="rounded-lg p-3 text-center" style={{ backgroundColor: GRID_COLORS[i] }}>
                  <span className="text-[9px] font-mono font-bold" style={{ color: i < 3 ? "#fff" : "#052e16" }}>
                    {GRID_COLORS[i]}
                  </span>
                </div>
              ))}
            </div>
            <div className="flex items-center gap-1 mt-2 text-[10px] text-gray-500">
              <span>弱点</span>
              <div className="flex-1 h-1 rounded bg-gradient-to-r from-red-600 via-yellow-300 to-green-600" />
              <span>習得</span>
            </div>
          </div>

          {/* Asset grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* LogoMark Component */}
            <div className="bg-gray-900 rounded-xl border border-gray-800 p-5 text-center">
              <p className="text-[10px] text-gray-500 mb-3">LogoMark (Component)</p>
              <div className="bg-gray-800 rounded-xl p-6 flex justify-center mb-3">
                <LogoMark className="w-16 h-16" />
              </div>
              <p className="text-[10px] text-gray-600">48x48 viewBox / Scalable</p>
              <p className="text-[10px] text-gray-600">components/brand/LogoMark.tsx</p>
            </div>

            {/* Favicon */}
            <div className="bg-gray-900 rounded-xl border border-gray-800 p-5 text-center">
              <p className="text-[10px] text-gray-500 mb-3">favicon.svg</p>
              <div className="bg-gray-800 rounded-xl p-6 flex justify-center items-center gap-4 mb-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/favicon.svg" alt="favicon 32px" className="w-8 h-8" />
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/favicon.svg" alt="favicon 16px" className="w-4 h-4" />
              </div>
              <p className="text-[10px] text-gray-600">32x32 / 16x16</p>
              <p className="text-[10px] text-gray-600">Minimal 3x3 grid, no text</p>
            </div>

            {/* Icon */}
            <div className="bg-gray-900 rounded-xl border border-gray-800 p-5 text-center">
              <p className="text-[10px] text-gray-500 mb-3">icon.svg (PWA)</p>
              <div className="bg-gray-800 rounded-xl p-4 flex justify-center mb-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/icon.svg" alt="app icon" className="w-20 h-20 rounded-2xl" />
              </div>
              <p className="text-[10px] text-gray-600">512x512</p>
              <p className="text-[10px] text-gray-600">Grid + Brand name + Tagline</p>
            </div>

            {/* OGP */}
            <div className="bg-gray-900 rounded-xl border border-gray-800 p-5 text-center">
              <p className="text-[10px] text-gray-500 mb-3">og-image.svg (OGP)</p>
              <div className="bg-gray-800 rounded-xl p-3 flex justify-center mb-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/og-image.svg" alt="OGP image" className="w-full rounded-lg" />
              </div>
              <p className="text-[10px] text-gray-600">1200x630</p>
              <p className="text-[10px] text-gray-600">Left: Grid / Right: Text</p>
            </div>
          </div>

          {/* Size variations */}
          <div className="mt-6">
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Size Variations</h3>
            <div className="flex items-end gap-6 flex-wrap">
              {[64, 48, 32, 24, 20, 16].map((size) => (
                <div key={size} className="text-center">
                  <LogoMark className={`w-[${size}px] h-[${size}px]`} />
                  <div style={{ width: size, height: size, margin: "0 auto" }}>
                    <LogoMark className="w-full h-full" />
                  </div>
                  <p className="text-[10px] text-gray-600 mt-1">{size}px</p>
                </div>
              ))}
            </div>
          </div>
        </Section>

        {/* ════════ 2. COLORS ════════ */}
        <Section id="colors" title="カラーパレット">
          <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Brand Colors</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-8">
            {BRAND_COLORS.map((c) => (
              <div key={c.hex} className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
                <div className="h-16" style={{ backgroundColor: c.hex }} />
                <div className="p-3">
                  <p className="text-xs font-bold">{c.name}</p>
                  <p className="text-[10px] font-mono text-gray-400">{c.hex}</p>
                  <p className="text-[10px] text-gray-500 mt-0.5">{c.usage}</p>
                </div>
              </div>
            ))}
          </div>

          <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Subject Colors</h3>
          <div className="flex gap-2 flex-wrap">
            {SUBJECT_COLORS.map((c) => (
              <div key={c.name} className="flex items-center gap-2 px-3 py-2 bg-gray-900 rounded-lg border border-gray-800">
                <div className="w-4 h-4 rounded" style={{ backgroundColor: c.hex }} />
                <span className="text-xs font-medium">{c.name}</span>
                <span className="text-[10px] font-mono text-gray-500">{c.hex}</span>
              </div>
            ))}
          </div>

          <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mt-8 mb-3">Heatmap Gradient</h3>
          <div className="flex gap-0.5 items-end">
            {Array.from({ length: 20 }, (_, i) => {
              const rate = i / 19;
              return (
                <div key={i} className="flex-1 rounded" style={{ backgroundColor: rateToColor(rate), height: 32 + i * 1.5 }} />
              );
            })}
          </div>
          <div className="flex justify-between text-[10px] text-gray-500 mt-1">
            <span>0% (弱点)</span>
            <span>50%</span>
            <span>100% (習得)</span>
          </div>
        </Section>

        {/* ════════ 3. TAGLINE ════════ */}
        <Section id="tagline" title="タグライン & エレベーターピッチ">
          <div className="space-y-4">
            <div className="bg-gray-900 rounded-xl border border-green-800/30 p-6 text-center">
              <span className="text-[10px] text-green-400 font-bold tracking-wider uppercase">Primary Tagline</span>
              <p className="text-2xl md:text-3xl font-black mt-2">{TAGLINE.PRIMARY}</p>
            </div>
            <div className="bg-gray-900 rounded-xl border border-gray-800 p-5">
              <span className="text-[10px] text-gray-500 font-bold tracking-wider uppercase">Extended Tagline</span>
              <p className="text-sm font-medium mt-1">{TAGLINE.EXTENDED}</p>
            </div>
            <div className="bg-gray-900 rounded-xl border border-gray-800 p-5">
              <span className="text-[10px] text-gray-500 font-bold tracking-wider uppercase">Elevator Pitch (30sec)</span>
              <p className="text-sm text-gray-300 leading-relaxed mt-1">{ELEVATOR_PITCH.FULL}</p>
            </div>
            <div className="bg-gray-900 rounded-xl border border-gray-800 p-5">
              <span className="text-[10px] text-gray-500 font-bold tracking-wider uppercase">Elevator Pitch (10sec)</span>
              <p className="text-sm text-gray-300 leading-relaxed mt-1">{ELEVATOR_PITCH.SHORT}</p>
            </div>
          </div>
        </Section>

        {/* ════════ 4. COPY SYSTEM ════════ */}
        <Section id="copy" title="キャッチコピー体系">
          <p className="text-xs text-gray-500 mb-4">
            全コピーは <strong>headline + sub</strong> の2層構造。headline は感情に訴え、sub は理性的に補足する。
          </p>
          <div className="grid md:grid-cols-2 gap-3">
            <CopyCard label="Hero" headline={CATCHCOPY.HERO.headline} sub={CATCHCOPY.HERO.sub} />
            <CopyCard label="Features" headline={CATCHCOPY.FEATURES.headline} sub={CATCHCOPY.FEATURES.sub} />
            <CopyCard label="CTA" headline={CATCHCOPY.CTA.headline} sub={CATCHCOPY.CTA.sub} />
            <CopyCard label="Review" headline={CATCHCOPY.REVIEW.headline} sub={CATCHCOPY.REVIEW.sub} />
            <CopyCard label="Weakness" headline={CATCHCOPY.WEAKNESS.headline} sub={CATCHCOPY.WEAKNESS.sub} />
            <CopyCard label="Timekeeper" headline={CATCHCOPY.TIMEKEEPER.headline} sub={CATCHCOPY.TIMEKEEPER.sub} />
            <CopyCard label="Onboarding" headline={CATCHCOPY.ONBOARDING.headline} sub={CATCHCOPY.ONBOARDING.sub} />
            <CopyCard label="Share" headline={CATCHCOPY.SHARE.headline} />
          </div>

          <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mt-8 mb-3">Ads Copy</h3>
          <div className="flex flex-wrap gap-2">
            {CATCHCOPY.ADS.map((ad, i) => (
              <span key={i} className="px-3 py-1.5 bg-gray-900 border border-gray-800 rounded-lg text-xs">
                {ad}
              </span>
            ))}
          </div>

          <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mt-8 mb-3">Stage Copy (by score rate)</h3>
          <div className="grid md:grid-cols-2 gap-3">
            {([
              { label: "0-30%", ...STAGE_COPY.BEGINNER },
              { label: "31-60%", ...STAGE_COPY.GROWING },
              { label: "61-80%", ...STAGE_COPY.ADVANCING },
              { label: "81-100%", ...STAGE_COPY.MASTERED },
            ] as const).map((s) => (
              <CopyCard key={s.label} label={s.label} headline={s.headline} sub={s.encouragement} />
            ))}
          </div>
        </Section>

        {/* ════════ 5. TARGET ════════ */}
        <Section id="target" title="ターゲット別タグライン">
          <div className="grid md:grid-cols-3 gap-3">
            <CopyCard label="Student" headline={TARGET_TAGLINE.STUDENT.headline} sub={TARGET_TAGLINE.STUDENT.sub} />
            <CopyCard label="Parent" headline={TARGET_TAGLINE.PARENT.headline} sub={TARGET_TAGLINE.PARENT.sub} />
            <CopyCard label="Educator" headline={TARGET_TAGLINE.EDUCATOR.headline} sub={TARGET_TAGLINE.EDUCATOR.sub} />
          </div>
        </Section>

        {/* ════════ 6. SEASONAL ════════ */}
        <Section id="seasonal" title="季節キャンペーンコピー">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
            {([
              { label: "Spring (4-6)", ...SEASONAL_COPY.SPRING },
              { label: "Summer (7-8)", ...SEASONAL_COPY.SUMMER },
              { label: "Autumn (9-11)", ...SEASONAL_COPY.AUTUMN },
              { label: "Winter (12-1)", ...SEASONAL_COPY.WINTER },
              { label: "Result (2-3)", ...SEASONAL_COPY.RESULT },
            ] as const).map((s) => (
              <CopyCard key={s.label} label={s.label} headline={s.headline} sub={s.sub} />
            ))}
          </div>
        </Section>

        {/* ════════ 7. BRAND VOICE ════════ */}
        <Section id="voice" title="Brand Voice">
          <div className="bg-gray-900 rounded-xl border border-gray-800 p-5 mb-4">
            <span className="text-[10px] text-gray-500 font-bold tracking-wider uppercase">Tone</span>
            <p className="text-sm text-gray-300 mt-1">{BRAND_VOICE.TONE}</p>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-gray-900 rounded-xl border border-green-800/30 p-5">
              <span className="text-[10px] text-green-400 font-bold tracking-wider uppercase">DO</span>
              <ul className="mt-2 space-y-1.5">
                {BRAND_VOICE.DO.map((item, i) => (
                  <li key={i} className="text-xs text-gray-300 flex gap-2">
                    <span className="text-green-400 shrink-0">+</span>{item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-gray-900 rounded-xl border border-red-800/30 p-5">
              <span className="text-[10px] text-red-400 font-bold tracking-wider uppercase">DON&apos;T</span>
              <ul className="mt-2 space-y-1.5">
                {BRAND_VOICE.DONT.map((item, i) => (
                  <li key={i} className="text-xs text-gray-300 flex gap-2">
                    <span className="text-red-400 shrink-0">-</span>{item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </Section>

        {/* ════════ 8. SNS ════════ */}
        <Section id="sns" title="SNS Accounts">
          <div className="grid md:grid-cols-3 gap-3">
            {Object.values(SNS_ACCOUNTS).map((a) => (
              <div key={a.label} className="bg-gray-900 rounded-xl border border-gray-800 p-4">
                <span className="text-[10px] text-gray-500 font-bold tracking-wider uppercase">{a.label}</span>
                <p className="font-mono text-sm font-bold mt-1">{a.handle}</p>
                <p className="text-xs text-gray-400 mt-1">{a.purpose}</p>
                {a.url ? (
                  <p className="text-[10px] text-green-400 mt-1">Active</p>
                ) : (
                  <p className="text-[10px] text-gray-600 mt-1">Not yet opened</p>
                )}
              </div>
            ))}
          </div>

          <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mt-8 mb-3">Hashtags</h3>
          <div className="flex gap-2">
            {BRAND.HASHTAGS.map((tag) => (
              <span key={tag} className="px-3 py-1.5 bg-gray-900 border border-gray-800 rounded-lg text-xs text-green-400 font-medium">
                {tag}
              </span>
            ))}
          </div>
        </Section>

        {/* ── Brand Info Table ── */}
        <Section id="info" title="Brand Identity">
          <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
            <table className="w-full text-sm">
              <tbody>
                {[
                  ["Name (JP)", BRAND.NAME],
                  ["Name (EN)", BRAND.NAME_EN],
                  ["Formal", BRAND.FORMAL],
                  ["Domain", BRAND.DOMAIN],
                  ["Primary Tagline", TAGLINE.PRIMARY],
                  ["Theme Color", "#22c55e (green-500)"],
                  ["Background", "#030712 (gray-950)"],
                  ["Logo File", "icon.svg (512x512)"],
                  ["Favicon File", "favicon.svg (32x32)"],
                  ["OGP File", "og-image.svg (1200x630)"],
                  ["Component", "LogoMark.tsx"],
                ].map(([key, val]) => (
                  <tr key={key} className="border-b border-gray-800/50 last:border-0">
                    <td className="px-4 py-2.5 text-gray-500 font-medium w-40">{key}</td>
                    <td className="px-4 py-2.5 font-mono text-xs">{val}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Section>

      </main>

      {/* ── Footer ── */}
      <footer className="border-t border-gray-800 py-6">
        <div className="max-w-5xl mx-auto px-4 text-center text-xs text-gray-600">
          <div className="flex items-center justify-center gap-2 mb-2">
            <LogoMark className="w-4 h-4" />
            <span className="font-bold text-gray-400">{BRAND.NAME}</span>
            <span>Brand Guide</span>
          </div>
          <p>Developed by Shimanto AI</p>
        </div>
      </footer>
    </div>
  );
}
