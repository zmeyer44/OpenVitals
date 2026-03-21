'use client';

import { useRef, useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'motion/react';
import { cn } from '@/lib/utils';
import { allMobileNav } from './nav-config';

interface MobileNavProps {
  pathname: string;
  pendingCount: number;
}

export function MobileNav({ pathname, pendingCount }: MobileNavProps) {
  const navRef = useRef<HTMLDivElement>(null);
  const [highlightStyle, setHighlightStyle] = useState({ left: 0, width: 0 });

  const activeIndex = allMobileNav.findIndex(
    (item) =>
      pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href))
  );

  useEffect(() => {
    if (navRef.current && activeIndex !== -1) {
      const navItems = navRef.current.querySelectorAll('[data-nav-item]');
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
    <div className="md:hidden border-t border-neutral-100 bg-white">
      <nav
        ref={navRef}
        className="relative flex items-center gap-0.5 px-3 py-1.5 overflow-x-auto"
      >
        {/* Animated highlight for mobile */}
        {activeIndex !== -1 && highlightStyle.width > 0 && (
          <motion.div
            className="absolute h-[28px] bg-neutral-900 -z-0"
            initial={false}
            animate={{
              left: highlightStyle.left,
              width: highlightStyle.width,
            }}
            transition={{
              type: 'spring',
              stiffness: 500,
              damping: 35,
            }}
          />
        )}

        {allMobileNav.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== '/' && pathname.startsWith(item.href));
          const hasBadge = item.name === 'Approvals' && pendingCount > 0;
          return (
            <Link
              key={item.name}
              href={item.href}
              data-nav-item
              className={cn(
                'relative flex items-center gap-1 px-2.5 py-1 font-mono text-[11px] font-medium uppercase tracking-[0.04em] whitespace-nowrap transition-colors z-10',
                isActive ? 'text-white' : 'text-neutral-500'
              )}
            >
              <item.icon className="h-3.5 w-3.5" />
              {item.name}
              {hasBadge && (
                <span className="ml-1 px-1 py-0.5 text-[9px] font-semibold bg-amber-100 text-amber-700">
                  {pendingCount}
                </span>
              )}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
