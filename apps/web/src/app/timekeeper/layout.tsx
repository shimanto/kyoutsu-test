import type { Metadata } from "next";
import { PAGE_META, BRAND } from "@kyoutsu/shared";

export const metadata: Metadata = {
  title: PAGE_META.TIMEKEEPER.title,
  description: PAGE_META.TIMEKEEPER.description,
  openGraph: {
    title: `${PAGE_META.TIMEKEEPER.title} | ${BRAND.NAME}`,
    description: PAGE_META.TIMEKEEPER.description,
  },
};

export default function TimekeeperLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
