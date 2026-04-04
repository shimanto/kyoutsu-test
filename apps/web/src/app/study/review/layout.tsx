import type { Metadata } from "next";
import { PAGE_META, BRAND } from "@kyoutsu/shared";

export const metadata: Metadata = {
  title: PAGE_META.STUDY_REVIEW.title,
  description: PAGE_META.STUDY_REVIEW.description,
  openGraph: {
    title: `${PAGE_META.STUDY_REVIEW.title} | ${BRAND.NAME}`,
    description: PAGE_META.STUDY_REVIEW.description,
  },
};

export default function StudyReviewLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
