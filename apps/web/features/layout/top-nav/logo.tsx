'use client';

import Link from 'next/link';
import { LogoWordmark } from '@/assets/app/images/logo';

export function Logo() {
  return (
    <Link href="/home" className="group">
      <LogoWordmark
        logoProps={{ className: "size-5.5 text-accent-500" }}
        workmarkProps={{ className: "hidden sm:inline text-[16px] tracking-tight" }}
      />
    </Link>
  );
}
