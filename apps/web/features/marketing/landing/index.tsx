import { Nav } from "./sections/nav";
import { Hero } from "./sections/hero";
import { HowItWorks } from "./sections/how-it-works";
import { Ingestion } from "./sections/feature-ai-parsing";
import { Provenance } from "./sections/feature-provenance";
import { AiChat } from "./sections/feature-ai-chat";
import { Sharing } from "./sections/feature-sharing";
import { Medications } from "./sections/feature-medications";
import { OpenSource } from "./sections/open-source";
import { FinalCta } from "./sections/final-cta";
import { Footer } from "./sections/footer";
import { SectionReveal } from "./components/section-reveal";
import { TrustBar } from "./sections/trust-bar";
import { WhyUs } from "./sections/why-us";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-neutral-50">
      <Nav />
      <Hero />
      <TrustBar />
      <SectionReveal>
        <HowItWorks />
      </SectionReveal>
      <SectionReveal>
        <Ingestion />
      </SectionReveal>
      <SectionReveal>
        <Provenance />
      </SectionReveal>
      <SectionReveal>
        <AiChat />
      </SectionReveal>
      <SectionReveal>
        <Sharing />
      </SectionReveal>
      <SectionReveal>
        <Medications />
      </SectionReveal>
      <div className="bg-accent-50">
        <SectionReveal>
          <WhyUs />
        </SectionReveal>
        <FinalCta />
        <Footer />
      </div>
    </div>
  );
}
