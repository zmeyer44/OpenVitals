import Link from "next/link";
import { Logo } from "@/assets/app/images/logo";
import { GITHUB_URL, LINKEDIN_URL, X_URL } from "@/constants/app";
import { DashBadge } from "@/components/decorations/dot-badge";
const linkHrefs: Record<string, string> = {
  Privacy: "/privacy",
  Terms: "/terms",
  Integrations: "/features/integrations",
  GitHub: GITHUB_URL,
  Xtwitter: X_URL,
  LinkedIn: LINKEDIN_URL,
};

const columns = [
  {
    title: "Product",
    links: ["Integrations", "Labs", "Medications", "AI Chat", "Sharing"],
  },
  {
    title: "Resources",
    links: ["Documentation", "Plugin SDK", "API Reference", "Changelog"],
  },
  {
    title: "Company",
    links: ["About", "Open Source", "GitHub", "Blog"],
  },
  {
    title: "Legal",
    links: ["Privacy", "Terms", "Security"],
  },
];

export function Footer() {
  return (
    <footer className="px-6 md:px-10 pb-8">
      <div className="mx-auto max-w-[1280px] border border-neutral-200 bg-white rounded-xl">
        {/* Columns */}
        <div className="p-8 px-8 md:px-10 md:pt-10 pb-10 md:pb-14">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
            {columns.map((col) => (
              <div key={col.title}>
                <div className="font-mono text-[11px] font-bold text-neutral-900 mb-4">
                  {col.title}
                </div>
                <div className="space-y-2.5">
                  {col.links.map((l) => {
                    const href = linkHrefs[l];
                    const isExternal = href?.startsWith("http");
                    const className =
                      "font-display text-[13px] text-neutral-500 hover:text-neutral-900 cursor-pointer transition-colors";
                    return href ? (
                      <Link
                        key={l}
                        href={href}
                        target={isExternal ? "_blank" : undefined}
                        rel={isExternal ? "noopener noreferrer" : undefined}
                        className={`block ${className}`}
                      >
                        {l}
                      </Link>
                    ) : (
                      <div key={l} className={className}>
                        {l}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom row */}
        <div className="border-t border-neutral-200 px-8 md:px-10 py-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Logo className="size-5 text-neutral-900" />

            <a
              href={X_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="font-mono text-[11px] text-neutral-400 hover:text-neutral-900 transition-colors"
            >
              X (Twitter)
            </a>
            <a
              href={GITHUB_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="font-mono text-[11px] text-neutral-400 hover:text-neutral-900 transition-colors"
            >
              GitHub
            </a>
            <a
              href={LINKEDIN_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="font-mono text-[11px] text-neutral-400 hover:text-neutral-900 transition-colors"
            >
              LinkedIn
            </a>
          </div>
          <span className="font-mono text-[11px] text-neutral-400">
            {`@OpenVitals ${new Date().getFullYear()}. All rights reserved.`}
          </span>
        </div>
      </div>
    </footer>
  );
}
