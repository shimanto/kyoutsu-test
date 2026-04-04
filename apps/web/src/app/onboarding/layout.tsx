import type { Metadata } from "next";
import { PAGE_META, BRAND } from "@kyoutsu/shared";

export const metadata: Metadata = {
  title: PAGE_META.ONBOARDING.title,
  description: PAGE_META.ONBOARDING.description,
  openGraph: {
    title: `${PAGE_META.ONBOARDING.title} | ${BRAND.NAME}`,
    description: PAGE_META.ONBOARDING.description,
  },
};

export default function OnboardingLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
