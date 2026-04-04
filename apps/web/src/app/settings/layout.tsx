import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "学力設定",
  description: "偏差値と教科の得意・不得意を設定して、ヒートマップに反映します。",
};

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
