import type { Metadata } from "next";
import "@/styles/globals.css";
import { AuthGuard } from "@/components/layout/AuthGuard";

export const metadata: Metadata = {
  title: "大学物語 - 共通テスト攻略プラットフォーム",
  description: "共通テストに特化した学習プラットフォーム。忘却曲線×弱点検出×学習計画で志望大学合格を目指す。",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <body className="bg-gray-950 text-gray-100 min-h-screen">
        <AuthGuard>{children}</AuthGuard>
      </body>
    </html>
  );
}
