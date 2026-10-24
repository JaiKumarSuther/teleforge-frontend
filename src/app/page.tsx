import { SiteHeader } from "@/components/landing/site-header";
import { Hero } from "@/components/landing/hero";
import { Closing, Faq, HowItWorks, Personas, Runtime, Showcase, SiteFooter } from "@/components/landing/sections";

export default function LandingPage() {
  return (
    <>
      <SiteHeader />
      <main id="main">
        <Hero />
        <Personas />
        <HowItWorks />
        <Showcase />
        <Runtime />
        <Faq />
        <Closing />
      </main>
      <SiteFooter />
    </>
  );
}
