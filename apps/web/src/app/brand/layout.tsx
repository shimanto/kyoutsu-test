import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "ブランドガイド",
  description: "大学物語のロゴ・アイコン・カラーパレット・キャッチコピー体系を一覧で確認できるブランドガイドページ。",
};

export default function BrandLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
