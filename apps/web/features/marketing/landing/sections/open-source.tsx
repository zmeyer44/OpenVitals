import { cn } from "@/lib/utils";
import { GITHUB_URL } from "@/constants/app";
import { DashBadge } from "@/components/decorations/dot-badge";

const cards = [
  {
    heading: "Your Data Stays Yours",
    desc: "Export anytime in standard formats. Self-host if you want. No lock-in, ever.",
    link: "Learn more about data ownership →",
  },
  {
    heading: "Community-Driven",
    desc: "Plugin ecosystem for custom parsers, views, and analyzers. Public roadmap, transparent development.",
    link: "Explore the plugin SDK →",
  },
  {
    heading: "Built by Engineers",
    desc: "TypeScript end-to-end, Postgres, Drizzle, tRPC. Read every line of code on GitHub.",
    link: "View on GitHub →",
  },
];

export function OpenSource() {
  return (
    <section className="bg-neutral-900">
      <div className="mx-auto max-w-[1280px] px-6 md:px-10">
        {/* ── Top: 3-column features ── */}
        <div className="grid grid-cols-1 md:grid-cols-3 border-b border-neutral-800 py-14 lg:py-20">
          {/* Feature columns */}
          {cards.map((c, i) => (
            <div
              key={c.heading}
              className={cn(
                "border-t md:border-t-0 md:border-l border-neutral-800 md:pl-8 pt-8 md:pt-0",
                i === 0 && "pr-8 pb-8 md:pb-0",
                i === 1 && "",
              )}
            >
              <h3 className="font-mono text-[13px] font-bold uppercase tracking-[0.06em] text-white mb-3">
                {c.heading}
              </h3>
              <p className="font-display text-[14px] text-neutral-500 leading-[1.6]">
                {c.desc}
              </p>
              <a
                href={
                  c.heading === "Built by Engineers" ? GITHUB_URL : "/register"
                }
                target={
                  c.heading === "Built by Engineers" ? "_blank" : undefined
                }
                rel={
                  c.heading === "Built by Engineers"
                    ? "noopener noreferrer"
                    : undefined
                }
                className="mt-4 inline-flex font-mono text-[11px] font-bold uppercase tracking-[0.06em] text-white hover:text-accent-400 transition-colors"
              >
                {c.link}
              </a>
            </div>
          ))}
        </div>

        {/* ── Bottom: large headline ── */}
        <div className="py-14 lg:py-20">
          <h2 className="font-display text-[32px] md:text-[44px] lg:text-[52px] font-medium tracking-[-0.03em] leading-[1.1] text-white max-w-3xl">
            Free to use. Free to
            <br />
            self-host. Free to fork.
          </h2>
        </div>
      </div>
    </section>
  );
}
