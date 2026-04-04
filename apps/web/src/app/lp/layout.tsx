import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "大学物語 — 弱点が見える。だから伸びる。",
  description:
    "共通テスト全9科目900点をS&P500スタイルのヒートマップで可視化。忘却曲線(SM-2)×弱点自動検出で東大・難関大合格への最短ルートを自動生成する無料学習プラットフォーム。",
  openGraph: {
    title: "大学物語 — 弱点が見える。だから伸びる。",
    description:
      "共通テスト全9科目900点をヒートマップで可視化。忘却曲線×弱点自動検出で合格への最短ルートを自動生成。",
    url: "https://daigaku-monogatari.pages.dev/lp",
  },
};

export default function LpLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
