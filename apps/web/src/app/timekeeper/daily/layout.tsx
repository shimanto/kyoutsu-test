import type { Metadata } from "next";
import { PAGE_META, BRAND } from "@kyoutsu/shared";

export const metadata: Metadata = {
  title: PAGE_META.TIMEKEEPER_DAILY.title,
  description: PAGE_META.TIMEKEEPER_DAILY.description,
  openGraph: {
    title: `${PAGE_META.TIMEKEEPER_DAILY.title} | ${BRAND.NAME}`,
    description: PAGE_META.TIMEKEEPER_DAILY.description,
  },
};

export default function TimekeeperDailyLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
