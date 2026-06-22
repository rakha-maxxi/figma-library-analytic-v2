import { SiteHeader } from "@/components/landing/site-header";
import { Hero } from "@/components/landing/hero";
import { StatsStrip } from "@/components/landing/stats-strip";
import { Problem } from "@/components/landing/problem";
import { Features } from "@/components/landing/features";
import { HowItWorks } from "@/components/landing/how-it-works";
import { Personas } from "@/components/landing/personas";
import { Principles } from "@/components/landing/principles";
import { Scope } from "@/components/landing/scope";
import { Faq } from "@/components/landing/faq";
import { Cta } from "@/components/landing/cta";
import { SiteFooter } from "@/components/landing/site-footer";
import { SmoothAnchorScroll } from "@/components/landing/smooth-anchor-scroll";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SmoothAnchorScroll />
      <SiteHeader />
      <main className="flex-1">
        <Hero />
        <StatsStrip />
        <Problem />
        <Features />
        <HowItWorks />
        <Personas />
        <Principles />
        <Scope />
        <Faq />
        <Cta />
      </main>
      <SiteFooter />
    </div>
  );
}
