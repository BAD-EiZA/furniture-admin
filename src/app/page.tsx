import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  Sparkles,
  MapPin,
  Phone,
  Mail,
  MessageCircle,
  Store,
  ShieldCheck,
  PackageCheck,
  Handshake,
  Building2,
} from "lucide-react";

import { prisma } from "@/lib/prisma";
import { getSiteSetting } from "@/lib/site-settings";
import CartBadge from "@/components/cart-badge";
import {
  InstagramIcon,
  FacebookIcon,
  TikTokIcon,
} from "@/components/brand-social-icons";

function FeaturedCard({
  title,
  description,
  href,
  image,
}: {
  title: string;
  description: string;
  href: string;
  image?: string;
}) {
  return (
    <Link
      href={href}
      className="group min-w-[240px] max-w-[240px] overflow-hidden rounded-[28px] border border-white/10 bg-white/95 p-3 shadow-xl transition hover:-translate-y-1"
    >
      <div className="relative aspect-[1/1] overflow-hidden rounded-[22px] bg-slate-100">
        {image ? (
          <img
            src={image}
            alt={title}
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
            <h3 className="text-lg font-semibold text-slate-950">{title}</h3>
            <p className="mt-1 line-clamp-2 text-sm text-slate-500">
              {description}
            </p>
          </div>

          <div className="mt-1 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-slate-200 text-slate-700 transition group-hover:border-[#125EA9] group-hover:text-[#125EA9]">
            <ArrowRight className="h-4 w-4" />
          </div>
        </div>
      </div>
    </Link>
  );
}

export default async function HomePage() {
  const setting = await getSiteSetting();

  const featuredProductsRaw = await prisma.product.findMany({
    where: {
      isActive: true,
      isFeatured: true,
    },
    orderBy: {
      createdAt: "desc",
    },
    take: 5,
    include: {
      medias: {
        orderBy: { sortOrder: "asc" },
        take: 1,
      },
    },
  });

  const fallbackProducts = await prisma.product.findMany({
    where: {
      isActive: true,
    },
    orderBy: {
      createdAt: "desc",
    },
    take: 5,
    include: {
      medias: {
        orderBy: { sortOrder: "asc" },
        take: 1,
      },
    },
  });

  const featuredProducts =
    featuredProductsRaw.length > 0 ? featuredProductsRaw : fallbackProducts;

  const heroBackground =
    featuredProducts[0]?.medias?.[0]?.type === "IMAGE"
      ? featuredProducts[0].medias[0].fileUrl
      : null;

  const lineupCards = [
    {
      title: "Peralatan Dapur",
      description: "Alat masak, wadah penyimpanan, dan aksesoris dapur.",
      href: "/catalog?q=dapur",
      image:
        featuredProducts[0]?.medias?.[0]?.type === "IMAGE"
          ? featuredProducts[0].medias[0].fileUrl
          : undefined,
    },
    {
      title: "Perabot Plastik",
      description: "Rak, ember, lemari, dan wadah rumah tangga serbaguna.",
      href: "/catalog?q=plastik",
      image:
        featuredProducts[1]?.medias?.[0]?.type === "IMAGE"
          ? featuredProducts[1].medias[0].fileUrl
          : undefined,
    },
    {
      title: "Peralatan Kebersihan",
      description: "Sapu, pel, tempat sampah, dan kebutuhan sanitasi.",
      href: "/catalog?q=kebersihan",
      image:
        featuredProducts[2]?.medias?.[0]?.type === "IMAGE"
          ? featuredProducts[2].medias[0].fileUrl
          : undefined,
    },
    {
      title: "Home Decor & Furnitur",
      description: "Meja, kursi, storage, dan perabot untuk berbagai ruang.",
      href: "/catalog?q=furnitur",
      image:
        featuredProducts[3]?.medias?.[0]?.type === "IMAGE"
          ? featuredProducts[3].medias[0].fileUrl
          : undefined,
    },
    {
      title: "Produk Unggulan",
      description:
        "Pilihan produk populer untuk rumah, retailer, dan instansi.",
      href: "/catalog",
      image:
        featuredProducts[4]?.medias?.[0]?.type === "IMAGE"
          ? featuredProducts[4].medias[0].fileUrl
          : undefined,
    },
  ];

  return (
    <div className="min-h-screen bg-[#f7f8fb] text-slate-900">
      <section className="relative overflow-hidden bg-black text-white">
        {heroBackground ? (
          <div className="absolute inset-0">
            <img
              src={heroBackground}
              alt="HIRONA hero"
              className="h-full w-full object-cover opacity-30"
            />
          </div>
        ) : (
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(18,94,169,0.35),_transparent_28%),linear-gradient(to_bottom,_#10151d,_#000000)]" />
        )}

        <div className="absolute inset-0 bg-gradient-to-b from-black/55 via-black/45 to-black/90" />

        <div className="relative z-10">
          <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-5 sm:px-6 lg:px-8">
            <div className="flex items-center gap-3">
              <div className="relative h-12 w-12 overflow-hidden rounded-xl bg-white/95 shadow-sm sm:h-14 sm:w-14">
                <Image
                  src="/images/hirona-logo.png"
                  alt="Hirona Homeware Logo"
                  fill
                  className="object-contain p-1.5"
                  priority
                />
              </div>

              <div>
                <p className="text-sm font-semibold tracking-[0.2em] text-white">
                  HIRONA
                </p>
                <p className="text-xs text-white/60">HOMEWARE</p>
              </div>
            </div>

            <div className="hidden items-center gap-8 md:flex">
              <Link
                href="/catalog"
                className="text-sm text-white/90 hover:text-white"
              >
                Katalog
              </Link>
              <Link
                href="/catalog?q=dapur"
                className="text-sm text-white/70 hover:text-white"
              >
                Dapur
              </Link>
              <Link
                href="/catalog?q=furnitur"
                className="text-sm text-white/70 hover:text-white"
              >
                Furnitur
              </Link>
              <Link
                href="/catalog?q=kebersihan"
                className="text-sm text-white/70 hover:text-white"
              >
                Kebersihan
              </Link>
              <Link
                href="/login"
                className="text-sm text-white/70 hover:text-white"
              >
                Admin
              </Link>
            </div>

            <CartBadge />
          </nav>

          <div className="mx-auto flex min-h-[700px] max-w-7xl flex-col items-center justify-center px-4 pb-40 pt-12 text-center sm:px-6 lg:px-8">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm text-white/90 backdrop-blur">
              <Sparkles className="h-4 w-4" />
              PT Hirona Inspirasi Nusantara
            </div>

            <h1 className="mt-8 max-w-4xl text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl">
              {setting.homepageHeadline ||
                "Distributor alat rumah tangga dan perabot berkualitas untuk kebutuhan rumah, retailer, dan instansi di Kalimantan Timur."}
            </h1>

            <p className="mt-6 max-w-2xl text-base leading-8 text-white/75 sm:text-lg">
              {setting.homepageSubheadline ||
                "PT Hirona Inspirasi Nusantara menyediakan berbagai kebutuhan rumah tangga modern dengan distribusi yang efisien, produk fungsional, dan pelayanan profesional."}
            </p>

            <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
              <Link
                href="/catalog"
                className="inline-flex items-center rounded-full bg-[#ed1c24] px-7 py-3.5 text-sm font-semibold text-white transition hover:bg-[#d81820]"
              >
                Jelajahi Katalog
              </Link>

              <Link
                href="/checkout"
                className="inline-flex items-center rounded-full border border-white/20 bg-white/10 px-7 py-3.5 text-sm font-semibold text-white backdrop-blur transition hover:bg-white/15"
              >
                Lihat Keranjang
              </Link>
            </div>
          </div>
        </div>

        <div className="relative z-20 mx-auto -mt-24 max-w-7xl px-4 pb-12 sm:px-6 lg:px-8">
          <div className="rounded-t-[36px] bg-transparent">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-white">Lineup Produk</h2>
              <Link
                href="/catalog"
                className="text-sm font-medium text-white/80 hover:text-white"
              >
                Lihat semua
              </Link>
            </div>

            <div className="flex gap-5 overflow-x-auto pb-4 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
              {lineupCards.map((card) => (
                <FeaturedCard key={card.title} {...card} />
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-2">
          <div>
            <h2 className="text-3xl font-bold text-slate-950">
              Tentang PT Hirona Inspirasi Nusantara
            </h2>

            <p className="mt-5 leading-8 text-slate-600">
              PT Hirona Inspirasi Nusantara adalah perusahaan distributor yang
              berbasis di Samarinda, Kalimantan Timur. Kami memfokuskan diri
              pada penyediaan dan distribusi alat rumah tangga serta perabot
              berkualitas tinggi untuk memenuhi kebutuhan gaya hidup modern
              masyarakat.
            </p>

            <p className="mt-4 leading-8 text-slate-600">
              Dengan komitmen pada inovasi dan pelayanan prima, kami menjadi
              mitra terpercaya bagi pengecer, instansi, maupun rumah tangga di
              seluruh wilayah Kalimantan Timur.
            </p>
          </div>

          <div className="rounded-[32px] bg-gradient-to-br from-[#0e3d6c] via-[#125EA9] to-[#2E4FAE] p-8 text-white shadow-xl">
            <h3 className="text-xl font-semibold">Visi</h3>
            <p className="mt-3 leading-7 text-blue-100">
              Menjadi perusahaan distributor peralatan rumah tangga yang unggul,
              terpercaya, dan menjadi pilihan utama konsumen di Kalimantan Timur
              melalui produk inovatif dan distribusi yang efisien.
            </p>

            <h3 className="mt-6 text-xl font-semibold">Misi</h3>
            <ul className="mt-3 space-y-2 text-sm leading-7 text-blue-100">
              <li>• Menyediakan produk rumah tangga lengkap dan berkualitas</li>
              <li>• Membangun distribusi yang kuat dan tepat waktu</li>
              <li>• Memberikan pelayanan responsif dan profesional</li>
              <li>• Terus berinovasi mengikuti kebutuhan pasar</li>
            </ul>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="rounded-[32px] border border-slate-200 bg-white p-8 shadow-sm">
          <h2 className="text-2xl font-bold text-slate-950">
            Nilai-Nilai Perusahaan
          </h2>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {[
              {
                title: "Integritas",
                desc: "Menjalankan bisnis dengan kejujuran dan standar etika yang tinggi.",
                icon: ShieldCheck,
                color: "bg-[#eef4ff] text-[#125EA9]",
              },
              {
                title: "Kualitas",
                desc: "Hanya mendistribusikan produk yang telah melalui kontrol kualitas yang ketat.",
                icon: PackageCheck,
                color: "bg-[#fff7e8] text-[#C89B3C]",
              },
              {
                title: "Keandalan",
                desc: "Menjamin ketersediaan stok dan ketepatan waktu pengiriman.",
                icon: Building2,
                color: "bg-[#eef2ff] text-[#2E4FAE]",
              },
              {
                title: "Kemitraan",
                desc: "Tumbuh bersama mitra bisnis melalui kerja sama yang saling menguntungkan.",
                icon: Handshake,
                color: "bg-[#eef4ff] text-[#125EA9]",
              },
            ].map((item) => {
              const Icon = item.icon;

              return (
                <div key={item.title} className="rounded-2xl bg-slate-50 p-5">
                  <div className="flex items-start gap-3">
                    <div
                      className={`flex h-11 w-11 items-center justify-center rounded-2xl ${item.color}`}
                    >
                      <Icon className="h-5 w-5" />
                    </div>

                    <div>
                      <p className="font-semibold text-slate-900">
                        {item.title}
                      </p>
                      <p className="mt-1 text-sm leading-6 text-slate-500">
                        {item.desc}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-8 text-center">
          <h2 className="text-3xl font-bold text-slate-950">
            Informasi Kontak
          </h2>
          <p className="mt-3 text-slate-500">
            Hubungi kami untuk informasi produk, kerja sama reseller, maupun
            pengadaan barang.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
          <div className="space-y-6">
            <div className="rounded-[28px] border border-slate-200/70 bg-white p-6 shadow-sm">
              <div className="flex items-start gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#eef4ff] text-[#125EA9]">
                  <MapPin className="h-5 w-5" />
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-slate-950">
                    Alamat Kantor
                  </h3>
                  <p className="mt-3 text-sm leading-7 text-slate-600">
                    Jalan rapak Indah no 21 samping bengkel las sugi, kelurahan
                    Lok Bahu, kec. Sungai Kunjang, Samarinda, Kalimantan Timur,
                    Indonesia
                    <br />
                    <span className="font-medium text-[#C89B3C]">
                      Ruko cat kuning depan pohon mangga
                    </span>
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-[28px] border border-slate-200/70 bg-white p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-slate-950">
                Telepon & WhatsApp
              </h3>

              <div className="mt-5 space-y-3">
                <div className="flex items-start gap-3 rounded-2xl bg-slate-50 px-4 py-3">
                  <div className="mt-0.5 flex h-9 w-9 items-center justify-center rounded-xl bg-[#eef4ff] text-[#125EA9]">
                    <Phone className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="font-medium text-slate-900">Admin</p>
                    <p className="text-sm text-slate-500">
                      {setting.whatsappAdmin}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 rounded-2xl bg-slate-50 px-4 py-3">
                  <div className="mt-0.5 flex h-9 w-9 items-center justify-center rounded-xl bg-[#fff7e8] text-[#C89B3C]">
                    <MessageCircle className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="font-medium text-slate-900">Marketing</p>
                    <p className="text-sm text-slate-500">
                      {setting.whatsappMarketing}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 rounded-2xl bg-slate-50 px-4 py-3">
                  <div className="mt-0.5 flex h-9 w-9 items-center justify-center rounded-xl bg-[#eef2ff] text-[#2E4FAE]">
                    <Phone className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="font-medium text-slate-900">Sales</p>
                    <p className="text-sm text-slate-500">
                      {setting.whatsappSales}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 rounded-2xl bg-slate-50 px-4 py-3">
                  <div className="mt-0.5 flex h-9 w-9 items-center justify-center rounded-xl bg-red-50 text-red-600">
                    <Phone className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="font-medium text-slate-900">Owner</p>
                    <p className="text-sm text-slate-500">
                      {setting.whatsappOwner}
                    </p>
                    <p className="mt-1 text-xs text-slate-400">
                      Khusus saran, masukan, atau layanan pengaduan
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-[28px] border border-slate-200/70 bg-white p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-slate-950">
                Email & Media Sosial
              </h3>

              <div className="mt-5 space-y-3">
                <div className="flex items-start gap-3 rounded-2xl bg-slate-50 px-4 py-3">
                  <div className="mt-0.5 flex h-9 w-9 items-center justify-center rounded-xl bg-[#eef4ff] text-[#125EA9]">
                    <Mail className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="font-medium text-slate-900">Email</p>
                    <p className="text-sm text-slate-500">
                      hironasamarinda@gmail.com
                    </p>
                  </div>
                </div>

                <div className="rounded-2xl bg-slate-50 px-4 py-4">
                  <p className="mb-3 font-medium text-slate-900">
                    Media Sosial
                  </p>

                  <div className="flex flex-wrap gap-3">
                    {setting.tiktokUrl ? (
                      <a
                        href={setting.tiktokUrl}
                        target="_blank"
                        className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
                      >
                        <TikTokIcon className="h-4 w-4" />
                        TikTok
                      </a>
                    ) : null}

                    {setting.facebookUrl ? (
                      <a
                        href={setting.facebookUrl}
                        target="_blank"
                        className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
                      >
                        <FacebookIcon className="h-4 w-4" />
                        Facebook
                      </a>
                    ) : null}

                    {setting.instagramUrl ? (
                      <a
                        href={setting.instagramUrl}
                        target="_blank"
                        className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
                      >
                        <InstagramIcon className="h-4 w-4" />
                        Instagram
                      </a>
                    ) : null}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-[28px] border border-slate-200/70 bg-white p-4 shadow-sm">
            <div className="mb-4 flex items-center gap-3 px-2 pt-2">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#eef4ff] text-[#125EA9]">
                <MapPin className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-950">
                  Lokasi Google Maps
                </h3>
                <p className="text-sm text-slate-500">
                  Temukan lokasi toko HIRONA HOMEWARE dengan lebih mudah.
                </p>
              </div>
            </div>

            <div className="overflow-hidden rounded-[24px] border border-slate-200">
              <iframe
                src={
                  setting.googleMapsEmbed ||
                  "https://www.google.com/maps?q=-0.5076625,117.0959844&z=17&output=embed"
                }
                width="100%"
                height="500"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Lokasi HIRONA HOMEWARE"
              />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
