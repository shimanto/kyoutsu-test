import type { Metadata } from "next";
import { PAGE_META, BRAND } from "@kyoutsu/shared";

export const metadata: Metadata = {
  title: PAGE_META.ANALYTICS.title,
  description: PAGE_META.ANALYTICS.description,
  openGraph: {
    title: `${PAGE_META.ANALYTICS.title} | ${BRAND.NAME}`,
    description: PAGE_META.ANALYTICS.description,
  },
};

export default function AnalyticsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
