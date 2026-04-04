import type { Metadata } from "next";
import { PAGE_META, BRAND } from "@kyoutsu/shared";

export const metadata: Metadata = {
  title: PAGE_META.LP.title,
  description: PAGE_META.LP.description,
  openGraph: {
    title: PAGE_META.LP.title,
    description: PAGE_META.LP.description,
    url: `https://${BRAND.DOMAIN}/lp`,
  },
};

export default function LpLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
