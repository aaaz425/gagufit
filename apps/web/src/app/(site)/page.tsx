import type { Metadata } from "next";
import { Features } from "@/site/Features";
import { Hero } from "@/site/Hero";
import { HowItWorks } from "@/site/HowItWorks";
import { SITE_DESCRIPTION } from "@/site/constants";

export const metadata: Metadata = {
  title: { absolute: "gagufit - 이 가구, 우리 방에 들어갈까?" },
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
