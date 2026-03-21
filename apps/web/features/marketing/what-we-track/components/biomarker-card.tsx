"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Plus, Minus } from "lucide-react";
import { cn } from "@/lib/utils";
import type { MarketingBiomarker } from "../data";

interface BiomarkerCardProps {
  biomarker: MarketingBiomarker;
}

export function BiomarkerCard({ biomarker }: BiomarkerCardProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div
      className={cn(
        "group border bg-white transition-all duration-200 cursor-pointer",
        expanded
          ? "border-neutral-900"
          : "border-neutral-200 hover:border-neutral-900",
      )}
      onClick={() => setExpanded(!expanded)}
    >
      <div className="px-5 py-4">
        {/* Name + toggle */}
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="font-display text-[14px] font-medium text-neutral-900 leading-snug">
              {biomarker.name}
            </div>
            <div className="mt-1 font-display text-[12px] leading-[1.5] text-neutral-400 line-clamp-1">
              {biomarker.description}
            </div>
          </div>
          <div
            className={cn(
              "flex size-6 shrink-0 items-center justify-center transition-colors mt-0.5",
              expanded
                ? "bg-neutral-900 text-white"
                : "border border-neutral-200 text-neutral-400 group-hover:border-neutral-900 group-hover:text-neutral-900",
            )}
          >
            {expanded ? (
              <Minus className="size-3" strokeWidth={2} />
            ) : (
              <Plus className="size-3" strokeWidth={2} />
            )}
          </div>
        </div>

        {/* Tags */}
        <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
          {biomarker.unit && (
            <span className="border border-neutral-200 bg-neutral-50 px-2 py-0.5 font-mono text-[9px] font-bold uppercase tracking-[0.04em] text-neutral-500">
              {biomarker.unit}
            </span>
          )}
          {biomarker.referenceRangeText && (
            <span className="border border-neutral-200 bg-neutral-50 px-2 py-0.5 font-mono text-[9px] tracking-[0.02em] text-neutral-400">
              {biomarker.referenceRangeText}
            </span>
          )}
        </div>

        {/* Expanded */}
        <AnimatePresence initial={false}>
          {expanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.15, ease: "easeOut" }}
              className="overflow-hidden"
            >
              <div className="mt-4 border-t border-neutral-200 pt-4 space-y-3">
                {biomarker.aliases.length > 0 && (
                  <div>
                    <div className="mb-2 font-mono text-[9px] font-bold uppercase tracking-[0.08em] text-neutral-400">
                      Also known as
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {biomarker.aliases.map((alias) => (
                        <span
                          key={alias}
                          className="inline-block border border-neutral-200 px-2 py-0.5 font-mono text-[9px] text-neutral-500"
                        >
                          {alias}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                <div className="font-mono text-[9px] text-neutral-300 uppercase tracking-[0.04em]">
                  {biomarker.id}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
