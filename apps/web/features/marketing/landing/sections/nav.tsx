"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Button } from "@/components/button";
import { Logo, LogoWordmark } from "@/assets/app/images/logo";
import { MenuIcon } from "@/assets/icons/menu";
import { XIcon } from "@/assets/icons/x";

const navLinks = [
  { label: "Features", href: "/features/integrations" },
  { label: "Docs", href: undefined },
  { label: "Pricing", href: undefined },
  { label: "Open Source", href: undefined },
] as const;

export function Nav() {
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  const close = useCallback(() => setMobileOpen(false), []);

  return (
    <>
      <header className="sticky top-0 z-50 bg-neutral-50">
        <div className="mx-auto flex max-w-[1280px] items-center justify-between px-6 md:px-10 h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 shrink-0">
            <LogoWordmark />
          </Link>

          {/* Center nav links */}
          <nav className="hidden md:flex items-center gap-7">
            {navLinks.map((l) =>
              l.href ? (
                <Link
                  key={l.label}
                  href={l.href}
                  className="group relative font-mono text-[12px] font-medium uppercase tracking-[0.06em] text-neutral-600 hover:text-accent-500 cursor-pointer transition-colors py-1"
                >
                  {l.label}
                  <span className="absolute bottom-0 left-0 h-px w-full origin-left scale-x-0 bg-accent-500 transition-transform duration-200 ease-out group-hover:scale-x-100" />
                </Link>
              ) : (
                <span
                  key={l.label}
                  className="group relative font-mono text-[12px] font-medium uppercase tracking-[0.06em] text-neutral-600 hover:text-accent-500 cursor-pointer transition-colors py-1"
                >
                  {l.label}
                  <span className="absolute bottom-0 left-0 h-px w-full origin-left scale-x-0 bg-accent-500 transition-transform duration-200 ease-out group-hover:scale-x-100" />
                </span>
              ),
            )}
          </nav>

          {/* Right: buttons + hamburger */}
          <div className="flex items-center gap-2 shrink-0">
            <Link href="/login" className="hidden sm:block">
              <Button text="Log in" variant="default" size="sm" />
            </Link>
            <Link href="/register" className="hidden sm:block">
              <Button text="Get started" variant="outline" size="sm" />
            </Link>

            <button
              type="button"
              className="relative -mr-1 inline-flex size-8 cursor-pointer items-center justify-center md:hidden"
              aria-label="Open navigation"
              aria-expanded={mobileOpen}
              onClick={() => setMobileOpen(true)}
            >
              <MenuIcon className="size-7" />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile fullscreen menu */}
      <div
        className={cn(
          "fixed inset-0 z-100 bg-neutral-50 transition-opacity duration-200 md:hidden",
          mobileOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none",
        )}
        role="navigation"
        aria-hidden={!mobileOpen}
      >
        <div className="flex h-16 items-center justify-end px-6">
          <button
            type="button"
            className="relative -mr-1 inline-flex size-8 cursor-pointer items-center justify-center"
            aria-label="Close navigation"
            onClick={close}
          >
            <XIcon className="size-7" />
          </button>
        </div>

        <ul className="mt-4 flex flex-col px-6">
          {navLinks.map((l, i) => (
            <li
              key={l.label}
              className="transition-all duration-300"
              style={{
                opacity: mobileOpen ? 1 : 0,
                transform: mobileOpen ? "translateY(0)" : "translateY(8px)",
                transitionDelay: mobileOpen ? `${80 + i * 40}ms` : "0ms",
              }}
            >
              {l.href ? (
                <Link
                  href={l.href}
                  className="block border-b border-neutral-200 py-4 font-mono text-[14px] font-bold uppercase tracking-[0.06em] text-neutral-900 hover:text-accent-500 transition-colors"
                  onClick={close}
                >
                  {l.label}
                </Link>
              ) : (
                <span
                  className="block cursor-pointer border-b border-neutral-200 py-4 font-mono text-[14px] font-bold uppercase tracking-[0.06em] text-neutral-900 hover:text-accent-500 transition-colors"
                  onClick={close}
                >
                  {l.label}
                </span>
              )}
            </li>
          ))}
        </ul>

        <div
          className="mt-4 flex items-center gap-3 px-6 pt-4 transition-all duration-300"
          style={{
            opacity: mobileOpen ? 1 : 0,
            transform: mobileOpen ? "translateY(0)" : "translateY(8px)",
            transitionDelay: mobileOpen
              ? `${80 + navLinks.length * 40}ms`
              : "0ms",
          }}
        >
          <Link href="/register" onClick={close}>
            <Button text="Get started" variant="default" size="sm" />
          </Link>
          <Link
            href="/login"
            className="font-mono text-[12px] font-bold uppercase tracking-[0.06em] text-neutral-500 hover:text-neutral-900 transition-colors"
            onClick={close}
          >
            Log in
          </Link>
        </div>
      </div>
    </>
  );
}
