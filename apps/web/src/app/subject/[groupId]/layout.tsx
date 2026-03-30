import { HIERARCHY_DATA } from "@/lib/hierarchy-data";

export function generateStaticParams() {
  return HIERARCHY_DATA.map((g) => ({ groupId: g.groupId }));
}

export default function SubjectLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
