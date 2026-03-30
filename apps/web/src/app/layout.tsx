import type { Metadata, Viewport } from "next";
import "@/styles/globals.css";
import { AuthGuard } from "@/components/layout/AuthGuard";
import { ServiceWorkerRegister } from "@/components/layout/ServiceWorkerRegister";
import { ErrorReporterInit } from "@/components/layout/ErrorReporterInit";

// #7 OGP/SEO
export const metadata: Metadata = {
  title: "大学物語 - 共通テスト攻略プラットフォーム",
  description: "忘却曲線×弱点検出×学習計画で志望大学合格を目指す。S&P500スタイルの学習マップで全科目を可視化。",
  keywords: ["共通テスト", "大学受験", "東大", "学習", "忘却曲線", "SM-2"],
  openGraph: {
    title: "大学物語 - 共通テスト攻略プラットフォーム",
    description: "忘却曲線×弱点検出×学習計画で志望大学合格を目指す",
    url: "https://daigaku-monogatari.pages.dev",
    siteName: "大学物語",
    locale: "ja_JP",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "大学物語 - 共通テスト攻略",
    description: "忘却曲線×弱点検出×学習計画で合格を目指す",
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
        <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>📚</text></svg>" />
        <link rel="apple-touch-icon" href="/icon-192.png" />
      </head>
      <body className="bg-gray-950 text-gray-100 min-h-screen">
        <AuthGuard>{children}</AuthGuard>
        <ServiceWorkerRegister />
        <ErrorReporterInit />
      </body>
    </html>
  );
}
