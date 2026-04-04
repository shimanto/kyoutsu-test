import type { Metadata } from "next";
import { PAGE_META, BRAND } from "@kyoutsu/shared";

export const metadata: Metadata = {
  title: PAGE_META.DASHBOARD.title,
  description: PAGE_META.DASHBOARD.description,
  openGraph: {
    title: `${PAGE_META.DASHBOARD.title} | ${BRAND.NAME}`,
    description: PAGE_META.DASHBOARD.description,
  },
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
