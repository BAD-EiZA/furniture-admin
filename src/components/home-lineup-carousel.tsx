"use client";

import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { useRef } from "react";

type LineupItem = {
  title: string;
  description: string;
  href: string;
  image?: string;
};

export default function HomeLineupCarousel({ items }: { items: LineupItem[] }) {
  const containerRef = useRef<HTMLDivElement | null>(null);

  function scrollByAmount(direction: "left" | "right") {
    const container = containerRef.current;
    if (!container) return;

    const amount = Math.min(container.clientWidth * 0.9, 900);

    container.scrollBy({
      left: direction === "left" ? -amount : amount,
      behavior: "smooth",
    });
  }

  return (
    <div className="relative">
      <div className="mb-5 flex items-center justify-between gap-4">
        <h2 className="text-2xl font-bold text-white sm:text-3xl">
          Lineup Produk
        </h2>

        <div className="hidden items-center gap-2 md:flex">
          <button
            type="button"
            onClick={() => scrollByAmount("left")}
            className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/15 bg-white/10 text-white backdrop-blur transition hover:bg-white/15"
            aria-label="Scroll lineup left"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>

          <button
            type="button"
            onClick={() => scrollByAmount("right")}
            className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/15 bg-white/10 text-white backdrop-blur transition hover:bg-white/15"
            aria-label="Scroll lineup right"
          >
            <ArrowRight className="h-5 w-5" />
          </button>
        </div>
      </div>

      <div
        ref={containerRef}
        className="flex snap-x snap-mandatory gap-4 overflow-x-auto pb-3 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden sm:gap-5"
      >
        {items.map((item) => (
          <Link
            key={item.title}
            href={item.href}
            className="group min-w-[220px] max-w-[220px] snap-start overflow-hidden rounded-[24px] border border-white/10 bg-white/95 p-3 shadow-xl transition hover:-translate-y-1 sm:min-w-[240px] sm:max-w-[240px]"
          >
            <div className="relative aspect-square overflow-hidden rounded-[18px] bg-slate-100">
              {item.image ? (
                <img
                  src={item.image}
                  alt={item.title}
                  className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                />
              ) : (
                <div className="flex h-full items-center justify-center text-sm text-slate-400">
                  No image
                </div>
              )}
            </div>

            <div className="px-2 pb-2 pt-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-base font-semibold text-slate-950 sm:text-lg">
                    {item.title}
                  </h3>
                  <p className="mt-1 line-clamp-2 text-xs text-slate-500 sm:text-sm">
                    {item.description}
                  </p>
                </div>

                <div className="mt-1 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-slate-200 text-slate-700 transition group-hover:border-[#125EA9] group-hover:text-[#125EA9]">
                  <ArrowRight className="h-4 w-4" />
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
