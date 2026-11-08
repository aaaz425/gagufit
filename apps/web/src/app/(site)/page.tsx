import type { Metadata } from "next";
import { Features } from "@/site/Features";
import { Hero } from "@/site/Hero";
import { HowItWorks } from "@/site/HowItWorks";
import { HEADLINE, SITE_DESCRIPTION, SITE_NAME } from "@/site/constants";

export const metadata: Metadata = {
  title: { absolute: `${SITE_NAME} - ${HEADLINE}` },
  description: SITE_DESCRIPTION,
};

export default function Home() {
  return (
    <main>
      <Hero />
      <HowItWorks />
      <Features />
    </main>
  );
}
