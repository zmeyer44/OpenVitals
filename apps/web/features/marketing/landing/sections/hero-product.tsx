import { HeroMockup } from "../components/hero-mockup";

export function HeroProduct() {
  return (
    <section className="mx-auto max-w-[1120px] px-6 md:px-8 pt-10 pb-16">
      <div className="border border-neutral-200 bg-white">
        <HeroMockup />
      </div>
    </section>
  );
}
