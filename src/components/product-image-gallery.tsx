"use client";

import { useState, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight, X, ZoomIn } from "lucide-react";

type Media = {
  id: string;
  fileUrl: string;
  type: string;
};

type Props = {
  medias: Media[];
  productName: string;
};

export default function ProductImageGallery({ medias, productName }: Props) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  const activeMedia = medias[activeIndex];

  const prev = useCallback(() => {
    setActiveIndex((i) => (i === 0 ? medias.length - 1 : i - 1));
  }, [medias.length]);

  const next = useCallback(() => {
    setActiveIndex((i) => (i === medias.length - 1 ? 0 : i + 1));
  }, [medias.length]);

  // Keyboard navigation saat lightbox terbuka
  useEffect(() => {
    if (!lightboxOpen) return;

    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setLightboxOpen(false);
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    }

    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [lightboxOpen, prev, next]);

  return (
    <>
      {/* ── Gambar utama ── */}
      <div className="overflow-hidden rounded-[32px] border border-slate-200/70 bg-white shadow-sm">
        <div className="relative aspect-[4/3] bg-slate-100">
          {activeMedia?.type === "IMAGE" ? (
            <>
              <img
                src={activeMedia.fileUrl}
                alt={productName}
                className="h-full w-full cursor-zoom-in object-cover transition-opacity duration-200"
                onClick={() => setLightboxOpen(true)}
              />
              {/* tombol zoom */}
              <button
                type="button"
                onClick={() => setLightboxOpen(true)}
                className="absolute bottom-3 right-3 rounded-xl bg-white/80 p-2 text-slate-600 backdrop-blur-sm transition hover:bg-white hover:text-slate-900"
                aria-label="Perbesar gambar"
              >
                <ZoomIn className="h-4 w-4" />
              </button>
            </>
          ) : activeMedia?.type === "VIDEO" ? (
            <video
              src={activeMedia.fileUrl}
              controls
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-slate-500">
              No media
            </div>
          )}

          {/* Panah kiri/kanan jika lebih dari 1 media */}
          {medias.length > 1 && (
            <>
              <button
                type="button"
                onClick={prev}
                className="absolute left-3 top-1/2 -translate-y-1/2 rounded-xl bg-white/80 p-2 text-slate-700 backdrop-blur-sm transition hover:bg-white hover:shadow-md"
                aria-label="Sebelumnya"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                type="button"
                onClick={next}
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-xl bg-white/80 p-2 text-slate-700 backdrop-blur-sm transition hover:bg-white hover:shadow-md"
                aria-label="Selanjutnya"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </>
          )}

          {/* Indikator titik */}
          {medias.length > 1 && (
            <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5">
              {medias.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setActiveIndex(i)}
                  className={`h-1.5 rounded-full transition-all ${
                    i === activeIndex
                      ? "w-5 bg-[#125EA9]"
                      : "w-1.5 bg-slate-300 hover:bg-slate-400"
                  }`}
                  aria-label={`Gambar ${i + 1}`}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Thumbnail strip ── */}
      {medias.length > 1 && (
        <div className="grid grid-cols-4 gap-3 sm:grid-cols-4">
          {medias.map((media, i) => (
            <button
              key={media.id}
              type="button"
              onClick={() => setActiveIndex(i)}
              className={`overflow-hidden rounded-2xl border-2 bg-white shadow-sm transition ${
                i === activeIndex
                  ? "border-[#125EA9] ring-2 ring-[#125EA9]/20"
                  : "border-slate-200/70 hover:border-slate-300"
              }`}
              aria-label={`Pilih gambar ${i + 1}`}
            >
              <div className="aspect-[4/3] bg-slate-100">
                {media.type === "IMAGE" ? (
                  <img
                    src={media.fileUrl}
                    alt={`${productName} ${i + 1}`}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <video
                    src={media.fileUrl}
                    className="h-full w-full object-cover"
                    muted
                  />
                )}
              </div>
            </button>
          ))}
        </div>
      )}

      {/* ── Lightbox ── */}
      {lightboxOpen && activeMedia?.type === "IMAGE" && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm"
          onClick={() => setLightboxOpen(false)}
        >
          {/* Tutup */}
          <button
            type="button"
            onClick={() => setLightboxOpen(false)}
            className="absolute right-4 top-4 rounded-xl bg-white/10 p-2 text-white transition hover:bg-white/20"
            aria-label="Tutup"
          >
            <X className="h-6 w-6" />
          </button>

          {/* Gambar */}
          <img
            src={activeMedia.fileUrl}
            alt={productName}
            className="max-h-[90vh] max-w-[90vw] rounded-2xl object-contain shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />

          {/* Panah lightbox */}
          {medias.length > 1 && (
            <>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); prev(); }}
                className="absolute left-4 top-1/2 -translate-y-1/2 rounded-xl bg-white/10 p-3 text-white transition hover:bg-white/20"
                aria-label="Sebelumnya"
              >
                <ChevronLeft className="h-6 w-6" />
              </button>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); next(); }}
                className="absolute right-4 top-1/2 -translate-y-1/2 rounded-xl bg-white/10 p-3 text-white transition hover:bg-white/20"
                aria-label="Selanjutnya"
              >
                <ChevronRight className="h-6 w-6" />
              </button>
            </>
          )}

          {/* Counter */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-black/50 px-4 py-1.5 text-sm text-white backdrop-blur-sm">
            {activeIndex + 1} / {medias.length}
          </div>
        </div>
      )}
    </>
  );
}
