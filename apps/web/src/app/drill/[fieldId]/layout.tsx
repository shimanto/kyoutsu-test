import type { Metadata } from "next";
import { PAGE_META, BRAND } from "@kyoutsu/shared";
import { SAMPLE_FIELD_STATS } from "@/lib/sample-data";

export const metadata: Metadata = {
  title: PAGE_META.DRILL.title,
  description: PAGE_META.DRILL.description,
  openGraph: {
    title: `${PAGE_META.DRILL.title} | ${BRAND.NAME}`,
    description: PAGE_META.DRILL.description,
  },
};

export function generateStaticParams() {
  return SAMPLE_FIELD_STATS.map((f) => ({ fieldId: f.fieldId }));
}

export default function DrillLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
