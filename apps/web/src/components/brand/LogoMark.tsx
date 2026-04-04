/**
 * 大学物語 ロゴマーク
 *
 * 3x3ヒートマップグリッドで「弱点(赤)→成長(黄)→習得(緑)」の
 * 学習プログレスを象徴するブランドアイコン。
 *
 * デザイン仕様:
 * - favicon.svg / icon.svg / og-image.svg と同一のグリッド配色
 * - 下部に緑のアクセントバー(ブランドカラー)
 */
export function LogoMark({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" className={className} aria-hidden="true" role="img">
      <rect width="48" height="48" rx="10" fill="#030712" />
      {/* Row 1: Weak (red) */}
      <rect x="4"  y="4"  width="12" height="11" rx="2" fill="#dc2626" />
      <rect x="18" y="4"  width="12" height="11" rx="2" fill="#f87171" />
      <rect x="32" y="4"  width="12" height="11" rx="2" fill="#fde68a" />
      {/* Row 2: Growing (yellow-green) */}
      <rect x="4"  y="17" width="12" height="11" rx="2" fill="#fca5a5" />
      <rect x="18" y="17" width="12" height="11" rx="2" fill="#bef264" />
      <rect x="32" y="17" width="12" height="11" rx="2" fill="#4ade80" />
      {/* Row 3: Mastered (green) */}
      <rect x="4"  y="30" width="12" height="11" rx="2" fill="#86efac" />
      <rect x="18" y="30" width="12" height="11" rx="2" fill="#22c55e" />
      <rect x="32" y="30" width="12" height="11" rx="2" fill="#15803d" />
      {/* Accent bar */}
      <rect x="4"  y="43" width="40" height="2" rx="1" fill="#22c55e" />
    </svg>
  );
}
