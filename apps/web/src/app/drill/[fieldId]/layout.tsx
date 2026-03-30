import { SAMPLE_FIELD_STATS } from "@/lib/sample-data";

export function generateStaticParams() {
  return SAMPLE_FIELD_STATS.map((f) => ({ fieldId: f.fieldId }));
}

export default function DrillLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
