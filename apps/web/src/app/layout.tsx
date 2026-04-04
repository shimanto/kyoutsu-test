import type { Metadata, Viewport } from "next";
import "@/styles/globals.css";
import { AuthGuard } from "@/components/layout/AuthGuard";
import { ServiceWorkerRegister } from "@/components/layout/ServiceWorkerRegister";
import { ErrorReporterInit } from "@/components/layout/ErrorReporterInit";
import { JsonLd } from "@/components/seo/JsonLd";
import { BRAND, TAGLINE, CATCHCOPY } from "@kyoutsu/shared";

// #7 OGP/SEO — ブランディング強化版 + キャッチコピー体系反映
export const metadata: Metadata = {
  title: {
    default: BRAND.FORMAL,
    template: `%s | ${BRAND.NAME}`,
  },
  description:
    `${TAGLINE.PRIMARY} — 忘却曲線(SM-2)×弱点自動検出×S&P500スタイル学習マップで共通テスト全9科目900点を可視化。東大・難関大合格に向けた最短ルートを自動生成。`,
  keywords: [
    "共通テスト", "共通テスト対策", "大学受験", "東大", "東京大学",
    "学習プラットフォーム", "忘却曲線", "SM-2", "弱点検出", "学習マップ",
    "大学物語", "受験勉強", "理系", "9科目", "ヒートマップ",
    "受験アプリ", "共通テスト アプリ", "大学受験 無料",
    "弱点克服", "復習計画", "受験計画",
    "弱点が見える", "弱点可視化",
  ],
  openGraph: {
    title: BRAND.FORMAL,
    description:
      `${TAGLINE.PRIMARY} — ${CATCHCOPY.HERO.sub}`,
    url: `https://${BRAND.DOMAIN}`,
    siteName: BRAND.NAME,
    locale: "ja_JP",
    type: "website",
    images: [
      {
        url: `https://${BRAND.DOMAIN}/og-image.png`,
        width: 1200,
        height: 630,
        alt: `${BRAND.NAME} — S&P500スタイル学習マップで共通テスト攻略`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${BRAND.NAME} — ${TAGLINE.PRIMARY}`,
    description: `${CATCHCOPY.FEATURES.sub}`,
    images: [`https://${BRAND.DOMAIN}/og-image.png`],
  },
  robots: { index: true, follow: true },
  // #5 PWA
  manifest: "/manifest.json",
  appleWebApp: { capable: true, title: BRAND.NAME, statusBarStyle: "black-translucent" },
};

export const viewport: Viewport = {
  themeColor: "#22c55e",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <head>
        {/* #6 CSP */}
        <meta
          httpEquiv="Content-Security-Policy"
          content="default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; connect-src 'self' https://kyoutsu-api.miyata-d23.workers.dev https://*.ingest.sentry.io https://api.line.me https://liff.line.me https://*.line-scdn.net; img-src 'self' data: https:; font-src 'self' data:;"
        />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="icon" href="/icon.svg" type="image/svg+xml" sizes="any" />
        <link rel="apple-touch-icon" href="/icon-192.png" />
      </head>
      <body className="bg-gray-950 text-gray-100 min-h-screen">
        <JsonLd />
        <AuthGuard>{children}</AuthGuard>
        <ServiceWorkerRegister />
        <ErrorReporterInit />
      </body>
    </html>
  );
}
