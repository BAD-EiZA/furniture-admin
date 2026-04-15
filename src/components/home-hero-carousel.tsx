"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

import CartBadge from "@/components/cart-badge";
import HomeHeaderActions from "./home-header-actions";

type HeroSlide = {
  id: string;
  image: string;
};

type Props = {
  slides: HeroSlide[];
  headline: string;
  subheadline: string;
};

export default function HomeHeroCarousel({
  slides,
  headline,
  subheadline,
}: Props) {
  const safeSlides = useMemo(() => {
    if (slides.length > 0) return slides;

    return [
      {
        id: "fallback-1",
        image:
          "https://res.cloudinary.com/dvbkqu4lh/image/upload/q_auto/f_auto/v1775809996/hero_z54weq.jpg",
      },
      {
        id: "fallback-2",
        image:
          "https://res.cloudinary.com/dvbkqu4lh/image/upload/q_auto/f_auto/v1776009441/WhatsApp_Image_2026-04-12_at_22.54.17_spjz9v.jpg",
      },
    ];
  }, [slides]);

  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (safeSlides.length <= 1) return;

    const interval = window.setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % safeSlides.length);
    }, 10000);

    return () => window.clearInterval(interval);
  }, [safeSlides.length]);

  function goToSlide(index: number) {
    setCurrentIndex(index);
  }

  function goPrev() {
    setCurrentIndex((prev) => (prev === 0 ? safeSlides.length - 1 : prev - 1));
  }

  function goNext() {
    setCurrentIndex((prev) => (prev + 1) % safeSlides.length);
  }

  return (
    <>
      <div className="absolute inset-0">
        {safeSlides.map((slide, index) => {
          const active = index === currentIndex;

          return (
            <div
              key={slide.id}
              className={`absolute inset-0 transition-opacity duration-1000 ${
                active ? "opacity-100" : "opacity-0"
              }`}
            >
              <img
                src={slide.image}
                alt={`HIRONA hero ${index + 1}`}
                className="h-full w-full object-cover"
              />
            </div>
          );
        })}
      </div>

      <div className="absolute inset-0 bg-black/45" />
      <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-black/20 to-black/40" />

      <div className="relative z-10">
        <nav className="relative mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex min-w-0 items-center gap-3">
            <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-xl bg-white/95 shadow-sm sm:h-14 sm:w-14">
              <Image
                src="/images/hirona-logo.png"
                alt="Hirona Homeware Logo"
                fill
                className="object-contain p-1.5"
                priority
              />
            </div>

            <div className="min-w-0 flex items-center gap-1">
              <p className="whitespace-nowrap text-xs font-semibold tracking-[0.12em] text-white sm:text-sm">
                HIRONA
              </p>
              <p className="whitespace-nowrap text-xs font-semibold tracking-[0.12em] text-white sm:text-sm">
                HOMEWARE
              </p>
            </div>
          </div>

          <div className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-8 lg:flex">
            <Link
              href="/catalog"
              className="text-sm font-medium text-white/90 transition hover:text-white"
            >
              Katalog
            </Link>
            <Link
              href="/catalog?q=dapur"
              className="text-sm font-medium text-white/80 transition hover:text-white"
            >
              Dapur
            </Link>
            <Link
              href="/catalog?q=furnitur"
              className="text-sm font-medium text-white/80 transition hover:text-white"
            >
              Furnitur
            </Link>
            <Link
              href="/catalog?q=kebersihan"
              className="text-sm font-medium text-white/80 transition hover:text-white"
            >
              Kebersihan
            </Link>
          </div>

          <div className="relative z-10">
            <HomeHeaderActions />
          </div>
        </nav>

        <div className="mx-auto flex min-h-[620px] max-w-7xl flex-col items-center justify-center px-4 pb-28 pt-8 text-center sm:min-h-[700px] sm:px-6 sm:pb-36 lg:px-8">
          <div className="inline-flex items-center gap-3 rounded-full border border-white/15 bg-white/10 px-4 py-2.5 text-white/95 backdrop-blur sm:px-5 sm:py-3">
            <div className="relative h-6 w-6 overflow-hidden rounded-full bg-white/95 sm:h-7 sm:w-7">
              <Image
                src="/images/hirona-logo.png"
                alt="Hirona Logo"
                fill
                className="object-contain p-0.5"
                priority
              />
            </div>
            <span className="text-sm font-semibold tracking-wide sm:text-base">
              PT Hirona Inspirasi Nusantara
            </span>
          </div>

          <h1 className="mt-6 max-w-4xl text-3xl font-bold tracking-tight text-white sm:mt-8 sm:text-5xl lg:text-6xl">
            {headline}
          </h1>

          <p className="mt-5 max-w-2xl text-sm leading-7 text-white/75 sm:text-lg sm:leading-8">
            {subheadline}
          </p>

          <div className="mt-8 flex w-full max-w-md flex-col items-center justify-center gap-3 sm:mt-10 sm:max-w-none sm:flex-row sm:flex-wrap">
            <Link
              href="/catalog"
              className="inline-flex w-full items-center justify-center rounded-full bg-gradient-to-br from-[#0e3d6c] via-[#125EA9] to-[#2E4FAE] px-7 py-3.5 text-sm font-semibold text-white transition sm:w-auto"
            >
              Jelajahi Katalog
            </Link>

            <Link
              href="/checkout"
              className="inline-flex w-full items-center justify-center rounded-full border border-white/20 bg-white/10 px-7 py-3.5 text-sm font-semibold text-white backdrop-blur transition hover:bg-white/15 sm:w-auto"
            >
              Lihat Keranjang
            </Link>
          </div>

          {safeSlides.length > 1 ? (
            <>
              <div className="mt-8 flex items-center gap-2">
                {safeSlides.map((slide, index) => (
                  <button
                    key={slide.id}
                    type="button"
                    onClick={() => goToSlide(index)}
                    className={`h-2.5 rounded-full transition-all ${
                      index === currentIndex
                        ? "w-8 bg-white"
                        : "w-2.5 bg-white/40 hover:bg-white/60"
                    }`}
                    aria-label={`Pilih slide ${index + 1}`}
                  />
                ))}
              </div>

              <div className="mt-6 flex items-center gap-3">
                <button
                  type="button"
                  onClick={goPrev}
                  className="flex h-11 w-11 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white backdrop-blur transition hover:bg-white/15"
                  aria-label="Slide sebelumnya"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>

                <button
                  type="button"
                  onClick={goNext}
                  className="flex h-11 w-11 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white backdrop-blur transition hover:bg-white/15"
                  aria-label="Slide berikutnya"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </div>
            </>
          ) : null}
        </div>
      </div>
    </>
  );
}

