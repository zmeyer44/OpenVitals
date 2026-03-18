"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Logo } from "@/assets/app/images/logo";

const navLinks = ["Features", "Docs", "Pricing", "Open Source"];

export function Nav() {
  const [mobileOpen, setMobileOpen] = useState(false);

  // Lock body scroll when mobile menu is open
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
      <header
        className="sticky top-0 z-50 border-b border-neutral-200/50"
        style={{
          backgroundColor: "rgba(250,249,247,0.88)",
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
        }}
      >
        <div className="mx-auto flex max-w-280 items-center justify-between px-6 h-12">
          {/* Left: logo + desktop nav */}
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center gap-2">
              <Logo className="size-6" />
              <span
                className="text-[14px] font-semibold text-neutral-900"
                style={{ fontFamily: "var(--font-display)" }}
              >
                OpenVitals
              </span>
            </Link>
            <nav className="hidden md:flex items-center gap-5">
              {navLinks.map((l) => (
                <span
                  key={l}
                  className="text-[13px] text-neutral-500 hover:text-neutral-800 cursor-pointer transition-colors"
                  style={{ fontFamily: "var(--font-body)" }}
                >
                  {l}
                </span>
              ))}
            </nav>
          </div>

          {/* Right: auth + hamburger */}
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="hidden sm:block text-[13px] text-neutral-600 hover:text-neutral-900 transition-colors"
              style={{ fontFamily: "var(--font-body)" }}
            >
              Sign in
            </Link>
            <Link
              href="/register"
              className="rounded-md bg-neutral-900 px-3 py-1.5 text-[12px] font-medium text-white hover:bg-neutral-800 transition-colors"
              style={{ fontFamily: "var(--font-body)" }}
            >
              Get started
            </Link>

            <button
              type="button"
              className="relative -mr-1 inline-flex size-8 cursor-pointer items-center justify-center md:hidden"
              aria-label="Open navigation"
              aria-expanded={mobileOpen}
              onClick={() => setMobileOpen(true)}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="1.25"
                stroke="currentColor"
                className="size-5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
                />
              </svg>
            </button>
          </div>
        </div>
      </header>

      {/* ── Mobile fullscreen menu ── */}
      <div
        className={cn(
          "fixed inset-0 z-100 bg-background transition-opacity duration-200 md:hidden",
          mobileOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none",
        )}
        role="navigation"
        aria-hidden={!mobileOpen}
      >
        {/* Close button — top-right, matching header height */}
        <div className="flex h-12 items-center justify-end px-6">
          <button
            type="button"
            className="relative -mr-1 inline-flex size-8 cursor-pointer items-center justify-center"
            aria-label="Close navigation"
            onClick={close}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="1.25"
              stroke="currentColor"
              className="size-5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Nav links — large, staggered */}
        <ul className="mt-6 flex flex-col px-6">
          {navLinks.map((label, i) => (
            <li
              key={label}
              className="transition-all duration-300"
              style={{
                opacity: mobileOpen ? 1 : 0,
                transform: mobileOpen ? "translateY(0)" : "translateY(8px)",
                transitionDelay: mobileOpen ? `${80 + i * 40}ms` : "0ms",
              }}
            >
              <span
                className="block cursor-pointer border-b border-neutral-200/60 py-4 text-[24px] font-medium tracking-[-0.01em] text-neutral-900 transition-colors hover:text-neutral-500"
                style={{ fontFamily: "var(--font-display)" }}
                onClick={close}
              >
                {label}
              </span>
            </li>
          ))}
        </ul>

        {/* Auth actions */}
        <div
          className="mt-2 flex items-center gap-4 px-6 pt-6 transition-all duration-300"
          style={{
            opacity: mobileOpen ? 1 : 0,
            transform: mobileOpen ? "translateY(0)" : "translateY(8px)",
            transitionDelay: mobileOpen
              ? `${80 + navLinks.length * 40}ms`
              : "0ms",
          }}
        >
          <Link
            href="/register"
            className="rounded-md bg-neutral-900 px-5 py-2.5 text-[14px] font-medium text-white hover:bg-neutral-800 transition-colors"
            style={{ fontFamily: "var(--font-body)" }}
            onClick={close}
          >
            Get started
          </Link>
          <Link
            href="/login"
            className="text-[14px] text-neutral-500 hover:text-neutral-900 transition-colors"
            style={{ fontFamily: "var(--font-body)" }}
            onClick={close}
          >
            Sign in
          </Link>
        </div>
      </div>
    </>
  );
}
