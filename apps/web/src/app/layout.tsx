import type { Metadata } from "next";
import "@/styles/globals.css";

export const metadata: Metadata = {
  title: "共通テスト攻略 - 東大理系合格へ",
  description: "共通テストに特化した学習プラットフォーム。忘却曲線×弱点検出×学習計画で東大理系合格を目指す。",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <body className="bg-gray-950 text-gray-100 min-h-screen">
        {children}
      </body>
    </html>
  );
}
