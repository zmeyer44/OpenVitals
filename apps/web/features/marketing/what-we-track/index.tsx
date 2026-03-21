"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Nav } from "@/features/marketing/landing/sections/nav";
import { Footer } from "@/features/marketing/landing/sections/footer";
import { CATEGORY_ORDER } from "./data";
import { Hero } from "./sections/hero";
import { CategoryNav } from "./sections/category-nav";
import { BiomarkerGrid, filterBiomarkers, groupByCategory } from "./sections/biomarker-grid";
import { Cta } from "./sections/cta";

export default function WhatWeTrackPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<string>(
    CATEGORY_ORDER[0],
  );
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    observerRef.current?.disconnect();

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            const cat = entry.target.id.replace("category-", "");
            setActiveCategory(cat);
            break;
          }
        }
      },
      { rootMargin: "-20% 0px -70% 0px" },
    );

    observerRef.current = observer;

    for (const cat of CATEGORY_ORDER) {
      const el = document.getElementById(`category-${cat}`);
      if (el) observer.observe(el);
    }

    return () => observer.disconnect();
  }, [searchQuery]);

  const handleCategoryClick = useCallback((category: string) => {
    const el = document.getElementById(`category-${category}`);
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  }, []);

  const filtered = filterBiomarkers(searchQuery);
  const byCategory = groupByCategory(filtered);
  const visibleCategories = CATEGORY_ORDER.filter((c) =>
    byCategory.has(c),
  ) as string[];

  return (
    <div className="min-h-screen bg-neutral-50">
      <Nav />
      <Hero />

      {/* Main content */}
      <section className="border-t border-neutral-200">
        <div className="mx-auto max-w-[1280px] px-6 md:px-10 py-12">
          {/* Mobile pill nav */}
          <div className="md:hidden">
            <CategoryNav
              variant="pills"
              activeCategory={activeCategory}
              onCategoryClick={handleCategoryClick}
              visibleCategories={visibleCategories}
            />
          </div>

          {/* Desktop: sidebar + grid */}
          <div className="md:grid md:grid-cols-[200px_1fr] md:gap-12">
            <div className="hidden md:block">
              <CategoryNav
                variant="sidebar"
                activeCategory={activeCategory}
                onCategoryClick={handleCategoryClick}
                visibleCategories={visibleCategories}
              />
            </div>

            <div className="mt-6 md:mt-0">
              <BiomarkerGrid
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
              />
            </div>
          </div>
        </div>
      </section>

      <Cta />
      <Footer />
    </div>
  );
}
