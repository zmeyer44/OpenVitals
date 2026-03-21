'use client';

import { Search } from 'lucide-react';

export function NavSearch() {
  return (
    <div className="hidden lg:flex items-center">
      <div className="relative">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-neutral-400" />
        <input
          type="text"
          placeholder="Search..."
          className="w-44 pl-8 h-9 pr-3 py-1.5 text-[13px] bg-neutral-100 border-0 placeholder-neutral-400 focus:outline-none focus:ring-1 focus:ring-neutral-300 focus:bg-white transition-all"
        />
      </div>
    </div>
  );
}
