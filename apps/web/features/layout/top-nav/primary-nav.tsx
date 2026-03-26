"use client";

import { useRef, useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";
import { navigation } from "./nav-config";
import { CornerCross, CornerEdge } from "@/components/decorations/corner-cross";

interface PrimaryNavProps {
  pathname: string;
}

export function PrimaryNav({ pathname }: PrimaryNavProps) {
  const navRef = useRef<HTMLDivElement>(null);
  const [highlightStyle, setHighlightStyle] = useState({ left: 0, width: 0 });

  const activeIndex = navigation.findIndex(
    (item) =>
      pathname === item.href ||
      (item.href !== "/" && pathname.startsWith(item.href)),
  );

  useEffect(() => {
    if (navRef.current && activeIndex !== -1) {
      const navItems = navRef.current.querySelectorAll("[data-nav-item]");
      const activeItem = navItems[activeIndex] as HTMLElement;
      if (activeItem) {
        setHighlightStyle({
          left: activeItem.offsetLeft,
          width: activeItem.offsetWidth,
        });
      }
    }
  }, [activeIndex, pathname]);

  return (
    <nav className="hidden md:flex items-center gap-1">
      <div
        ref={navRef}
        className="relative flex items-center p-0.5 border rounded bg-neutral-100"
      >
        {/* Animated highlight */}
        {activeIndex !== -1 && highlightStyle.width > 0 && (
          <motion.div
            className="absolute h-[30px] bg-accent-50"
            initial={false}
            animate={{
              left: highlightStyle.left,
              width: highlightStyle.width,
            }}
            transition={{
              type: "spring",
              stiffness: 500,
              damping: 35,
            }}
          >
            <div className="flex-1 relative h-[30px]">
              <CornerEdge location="*" />
            </div>
          </motion.div>
        )}

        {navigation.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.name}
              href={item.href}
              data-nav-item
              className={cn(
                "relative flex h-[30px] items-center gap-1.5 px-2.5 py-1 font-mono text-[11px] font-medium uppercase tracking-[0.04em] transition-colors z-10",
                isActive
                  ? "text-accent-500"
                  : "text-neutral-500 hover:text-neutral-900",
              )}
            >
              <item.icon className={cn("h-3.5 w-3.5")} />
              <span className="hidden lg:inline">{item.name}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
