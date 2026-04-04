import type { Metadata } from "next";
import { PAGE_META, BRAND } from "@kyoutsu/shared";

export const metadata: Metadata = {
  title: PAGE_META.STUDY_WEAKNESS.title,
  description: PAGE_META.STUDY_WEAKNESS.description,
  openGraph: {
    title: `${PAGE_META.STUDY_WEAKNESS.title} | ${BRAND.NAME}`,
    description: PAGE_META.STUDY_WEAKNESS.description,
  },
};

export default function StudyWeaknessLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
