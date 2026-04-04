import type { Metadata } from "next";
import { PAGE_META, BRAND } from "@kyoutsu/shared";

export const metadata: Metadata = {
  title: PAGE_META.LOGIN.title,
  description: PAGE_META.LOGIN.description,
  openGraph: {
    title: `${PAGE_META.LOGIN.title} | ${BRAND.NAME}`,
    description: PAGE_META.LOGIN.description,
  },
};

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
