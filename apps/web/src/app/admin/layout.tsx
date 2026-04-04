import type { Metadata } from "next";
import { PAGE_META, BRAND } from "@kyoutsu/shared";

export const metadata: Metadata = {
  title: PAGE_META.ADMIN.title,
  description: PAGE_META.ADMIN.description,
  openGraph: {
    title: `${PAGE_META.ADMIN.title} | ${BRAND.NAME}`,
    description: PAGE_META.ADMIN.description,
  },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
