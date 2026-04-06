import Link from "next/link";
import {
  ArrowRight,
  Sparkles,
  Sofa,
  LampFloor,
  BriefcaseBusiness,
  MapPin,
  Phone,
} from "lucide-react";
import { prisma } from "@/lib/prisma";
import CartBadge from "@/components/cart-badge";
import Image from "next/image";

export default async function HomePage() {
  const featuredProducts = await prisma.product.findMany({
    where: {
      isActive: true,
    },
    orderBy: {
      createdAt: "desc",
    },
    take: 4,
    include: {
      medias: {
        orderBy: { sortOrder: "asc" },
        take: 1,
      },
    },
  });

  const stats = await prisma.product.aggregate({
    _count: {
      id: true,
    },
  });

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(18,94,169,0.14),_transparent_30%),linear-gradient(to_bottom,_#f8fbff,_#eef5ff)] text-slate-900">
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-1/2 top-0 h-72 w-72 -translate-x-1/2 rounded-full bg-[#125EA9]/20 blur-3xl" />
          <div className="absolute right-10 top-24 h-60 w-60 rounded-full bg-[#C89B3C]/12 blur-3xl" />
          <div className="absolute left-10 bottom-0 h-56 w-56 rounded-full bg-[#2E4FAE]/10 blur-3xl" />
        </div>

        <div className="relative mx-auto max-w-7xl px-4 pb-20 pt-10 sm:px-6 lg:px-8 lg:pb-28 lg:pt-16">
          <nav className="mb-10 z-50 flex items-center justify-between rounded-full border border-white/70 bg-white/80 px-4 py-3 shadow-sm backdrop-blur-xl">
            <div className="flex items-center gap-3">
              <div className="relative h-14 w-14 overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200">
                <Image
                  src="/images/hirona-logo.png"
                  alt="Hirona Homeware Logo"
                  fill
                  className="object-contain p-1.5"
                  priority
                />
              </div>

              <div>
                <p className="text-sm font-semibold text-slate-900">
                  HIRONA HOMEWARE
                </p>
                <p className="text-xs text-slate-500">
                  Kualitas terbaik harga terjangkau
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Link
                href="/catalog"
                className="rounded-full px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
              >
                Catalog
              </Link>

              <CartBadge />
            </div>
          </nav>

          <div className="grid items-center gap-10 lg:grid-cols-[1.08fr_0.92fr]">
            <div>
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#d9e7f6] bg-white/85 px-4 py-2 text-sm text-[#125EA9] shadow-sm backdrop-blur">
                <Sparkles className="h-4 w-4" />
                Premium homeware, furniture, dan perabotan pilihan
              </div>

              <h1 className="max-w-3xl text-4xl font-bold tracking-tight text-slate-950 sm:text-5xl lg:text-6xl">
                Furniture premium dan homeware elegan untuk rumah, kantor, dan
                ruang komersial.
              </h1>

              <p className="mt-6 max-w-2xl text-base leading-8 text-slate-600 sm:text-lg">
                HIRONA HOMEWARE menghadirkan koleksi furniture dan perabotan
                premium dengan kualitas terbaik dan harga terjangkau, mulai dari
                sofa, meja, kursi, rak, kabinet, hingga berbagai kebutuhan
                interior rumah dan usaha.
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  href="/catalog"
                  className="inline-flex items-center rounded-2xl bg-[#125EA9] px-6 py-3 text-sm font-medium text-white shadow-lg shadow-[#125EA9]/20 transition hover:bg-[#0f4f8f]"
                >
                  Jelajahi Katalog
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>

                <Link
                  href="/checkout"
                  className="inline-flex items-center rounded-2xl border border-slate-200 bg-white px-6 py-3 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50"
                >
                  Lihat Keranjang
                </Link>
              </div>

              <div className="mt-10 grid gap-4 sm:grid-cols-3">
                <div className="rounded-2xl border border-white/70 bg-white/85 p-5 shadow-sm backdrop-blur">
                  <p className="text-sm text-slate-500">Koleksi Produk</p>
                  <p className="mt-2 text-3xl font-bold text-[#125EA9]">
                    {stats._count.id}
                  </p>
                </div>

                <div className="rounded-2xl border border-white/70 bg-white/85 p-5 shadow-sm backdrop-blur">
                  <p className="text-sm text-slate-500">Kualitas</p>
                  <p className="mt-2 text-3xl font-bold text-[#C89B3C]">
                    Premium
                  </p>
                </div>

                <div className="rounded-2xl border border-white/70 bg-white/85 p-5 shadow-sm backdrop-blur">
                  <p className="text-sm text-slate-500">Shopping Flow</p>
                  <p className="mt-2 text-3xl font-bold text-[#2E4FAE]">QR</p>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="rounded-[28px] border border-white/70 bg-white/80 p-4 shadow-2xl backdrop-blur-xl">
                <div className="rounded-[24px] bg-gradient-to-br from-[#0e3d6c] via-[#125EA9] to-[#2E4FAE] p-6 text-white">
                  <div className="mb-8 flex items-center justify-between">
                    <div>
                      <p className="text-sm text-blue-100">
                        Featured Collection
                      </p>
                      <h2 className="mt-1 text-2xl font-semibold">
                        Hirona premium showcase
                      </h2>
                    </div>
                    <div className="rounded-2xl bg-white/10 px-3 py-2 text-xs">
                      Pilihan Unggulan
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    {featuredProducts.map((product) => (
                      <div
                        key={product.id}
                        className="overflow-hidden rounded-2xl border border-white/10 bg-white/5"
                      >
                        <div className="aspect-[4/3] bg-white/5">
                          {product.medias[0]?.type === "IMAGE" ? (
                            <img
                              src={product.medias[0].fileUrl}
                              alt={product.name}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="flex h-full items-center justify-center text-sm text-blue-100">
                              No image
                            </div>
                          )}
                        </div>

                        <div className="p-4">
                          <p className="line-clamp-1 font-medium">
                            {product.name}
                          </p>
                          <p className="mt-2 text-sm text-blue-100">
                            Rp {Number(product.price).toLocaleString("id-ID")}
                          </p>
                        </div>
                      </div>
                    ))}

                    {featuredProducts.length === 0 ? (
                      <div className="col-span-full rounded-2xl border border-dashed border-white/15 p-8 text-center text-sm text-blue-100">
                        Belum ada produk unggulan.
                      </div>
                    ) : null}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-8 sm:px-6 lg:px-8">
        <div className="mb-8 text-center">
          <h2 className="text-3xl font-bold tracking-tight text-slate-950">
            Apa yang kami jual
          </h2>
          <p className="mt-3 text-slate-500">
            Koleksi perabotan dan furniture premium untuk berbagai kebutuhan
            ruang.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <div className="rounded-[24px] border border-slate-200/70 bg-white/90 p-6 shadow-sm backdrop-blur">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#eef4ff] text-[#125EA9]">
              <Sofa className="h-5 w-5" />
            </div>
            <h3 className="text-lg font-semibold">
              Furniture ruang tamu & kamar
            </h3>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              Sofa, tempat tidur, nakas, lemari, kabinet, dan berbagai pilihan
              furnitur premium untuk menghadirkan ruang yang nyaman dan elegan.
            </p>
          </div>

          <div className="rounded-[24px] border border-slate-200/70 bg-white/90 p-6 shadow-sm backdrop-blur">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#fff7e8] text-[#C89B3C]">
              <LampFloor className="h-5 w-5" />
            </div>
            <h3 className="text-lg font-semibold">
              Perabotan interior premium
            </h3>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              Meja, kursi, rak, kabinet, dekoratif storage, dan aneka perabotan
              interior pilihan untuk rumah modern maupun ruang komersial.
            </p>
          </div>

          <div className="rounded-[24px] border border-slate-200/70 bg-white/90 p-6 shadow-sm backdrop-blur">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#eef2ff] text-[#2E4FAE]">
              <BriefcaseBusiness className="h-5 w-5" />
            </div>
            <h3 className="text-lg font-semibold">
              Furniture kantor & komersial
            </h3>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              Meja kerja, kursi kantor, kabinet arsip, meja meeting, dan
              berbagai furniture premium untuk kantor, showroom, dan ruang
              usaha.
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-8 pt-6 sm:px-6 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-[28px] border border-slate-200/70 bg-white/90 p-6 shadow-sm">
            <div className="flex items-start gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#eef4ff] text-[#125EA9]">
                <MapPin className="h-5 w-5" />
              </div>

              <div>
                <h3 className="text-xl font-semibold text-slate-950">
                  Alamat Toko
                </h3>
                <p className="mt-3 text-sm leading-7 text-slate-600">
                  Jalan rapak Indah no 21 samping bengkel las sugi, kelurahan
                  Lok Bahu, kec. Sungai Kunjang Samarinda. Kaltim
                  <br />
                  <span className="font-medium text-[#C89B3C]">
                    (Rumah cat kuning)
                  </span>
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-[28px] border border-slate-200/70 bg-white/90 p-6 shadow-sm">
            <div className="flex items-start gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#fff7e8] text-[#C89B3C]">
                <Phone className="h-5 w-5" />
              </div>

              <div className="w-full">
                <h3 className="text-xl font-semibold text-slate-950">
                  Contact Person
                </h3>

                <div className="mt-4 space-y-3 text-sm text-slate-600">
                  <div className="rounded-2xl bg-slate-50 px-4 py-3">
                    <p className="font-medium text-slate-900">
                      CP1: 082318827890
                    </p>
                    <p>Admin Hirona</p>
                  </div>

                  <div className="rounded-2xl bg-slate-50 px-4 py-3">
                    <p className="font-medium text-slate-900">
                      CP2: 081324676667
                    </p>
                    <p>Hengky</p>
                  </div>

                  <div className="rounded-2xl bg-slate-50 px-4 py-3">
                    <p className="font-medium text-slate-900">
                      CP3: 0838-2135-9356
                    </p>
                    <p>Marketing (Nanda)</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-20 pt-8 sm:px-6 lg:px-8">
        <div className="overflow-hidden rounded-[32px] border border-slate-200/70 bg-gradient-to-r from-[#0e3d6c] via-[#125EA9] to-[#2E4FAE] px-6 py-10 text-white shadow-2xl lg:px-10">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-2xl">
              <p className="text-sm uppercase tracking-[0.18em] text-blue-100">
                HIRONA HOMEWARE
              </p>
              <h2 className="mt-3 text-3xl font-bold tracking-tight">
                Kualitas terbaik, harga terjangkau, dan pilihan homeware yang
                elegan.
              </h2>
              <p className="mt-3 text-blue-100">
                Jelajahi berbagai pilihan furniture dan perabotan premium untuk
                rumah, kantor, maupun kebutuhan interior komersial Anda.
              </p>
            </div>

            <Link
              href="/catalog"
              className="inline-flex items-center justify-center rounded-2xl bg-white px-6 py-3 text-sm font-medium text-[#125EA9] transition hover:bg-slate-100"
            >
              Lihat Semua Produk
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
