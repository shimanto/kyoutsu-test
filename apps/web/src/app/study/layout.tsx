import type { Metadata } from "next";
import { PAGE_META, BRAND } from "@kyoutsu/shared";

export const metadata: Metadata = {
  title: PAGE_META.STUDY.title,
  description: PAGE_META.STUDY.description,
  openGraph: {
    title: `${PAGE_META.STUDY.title} | ${BRAND.NAME}`,
    description: PAGE_META.STUDY.description,
  },
};

export default function StudyLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
