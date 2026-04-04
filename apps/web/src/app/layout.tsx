import type { Metadata, Viewport } from "next";
import "@/styles/globals.css";
import { AuthGuard } from "@/components/layout/AuthGuard";
import { ServiceWorkerRegister } from "@/components/layout/ServiceWorkerRegister";
import { ErrorReporterInit } from "@/components/layout/ErrorReporterInit";
import { JsonLd } from "@/components/seo/JsonLd";

// #7 OGP/SEO — ブランディング強化版
export const metadata: Metadata = {
  title: {
    default: "大学物語 — 共通テスト攻略プラットフォーム",
    template: "%s | 大学物語",
  },
  description:
    "忘却曲線(SM-2)×弱点自動検出×S&P500スタイル学習マップで共通テスト全9科目を可視化。東大・難関大合格に向けた最短ルートを自動生成。",
  keywords: [
    "共通テスト", "大学受験", "東大", "東京大学", "学習プラットフォーム",
    "忘却曲線", "SM-2", "弱点検出", "学習マップ", "大学物語",
    "受験勉強", "共通テスト対策", "理系", "9科目",
  ],
  openGraph: {
    title: "大学物語 — 共通テスト攻略プラットフォーム",
    description:
      "忘却曲線×弱点自動検出×学習マップで全9科目900点を可視化。志望大学合格への最短ルートを自動生成。",
    url: "https://daigaku-monogatari.pages.dev",
    siteName: "大学物語",
    locale: "ja_JP",
    type: "website",
    images: [
      {
        url: "https://daigaku-monogatari.pages.dev/og-image.svg",
        width: 1200,
        height: 630,
        alt: "大学物語 — S&P500スタイル学習マップで共通テスト攻略",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "大学物語 — 共通テスト攻略マップ",
    description: "忘却曲線×弱点検出×学習マップで東大合格を目指す",
    images: ["https://daigaku-monogatari.pages.dev/og-image.svg"],
  },
  robots: { index: true, follow: true },
  // #5 PWA
  manifest: "/manifest.json",
  appleWebApp: { capable: true, title: "大学物語", statusBarStyle: "black-translucent" },
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
          content="default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; connect-src 'self' https://kyoutsu-api.miyata-d23.workers.dev https://*.ingest.sentry.io; img-src 'self' data: https:; font-src 'self' data:;"
        />
        <link rel="icon" href="/icon.svg" type="image/svg+xml" />
        <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>📚</text></svg>" type="image/svg+xml" sizes="any" />
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
