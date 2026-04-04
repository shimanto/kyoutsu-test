import type { Metadata } from "next";
import { BRAND } from "@kyoutsu/shared";

export const metadata: Metadata = {
  title: `成長ダッシュボード | ${BRAND.NAME}`,
  description: "ユーザー獲得・エンゲージメント・リテンションのKPIを追跡",
};

export default function GrowthLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
