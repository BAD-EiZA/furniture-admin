import Link from "next/link";
import { unstable_noStore as noStore } from "next/cache";
import {
  MapPin,
  Phone,
  Mail,
  MessageCircle,
  ShieldCheck,
  PackageCheck,
  Handshake,
  Building2,
} from "lucide-react";

import { prisma } from "@/lib/prisma";
import { getSiteSetting } from "@/lib/site-settings";
import HomeLineupCarousel from "@/components/home-lineup-carousel";
import HomeHeroCarousel from "@/components/home-hero-carousel";
import {
  InstagramIcon,
  FacebookIcon,
  TikTokIcon,
} from "@/components/brand-social-icons";

function normalizeWhatsappNumber(phone?: string | null) {
  if (!phone) return "";

  const digits = phone.replace(/\D/g, "");

  if (!digits) return "";

  if (digits.startsWith("0")) {
    return `62${digits.slice(1)}`;
  }

  return digits;
}

function buildWhatsappLink(phone?: string | null, message?: string) {
  const normalized = normalizeWhatsappNumber(phone);

  if (!normalized) return "";

  if (!message?.trim()) {
    return `https://wa.me/${normalized}`;
  }

  return `https://wa.me/${normalized}?text=${encodeURIComponent(message)}`;
}

export default async function HomePage() {
  noStore();
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

  const heroSlides = [
    {
      id: "hero-default",
      image:
        "https://res.cloudinary.com/dvbkqu4lh/image/upload/v1776739788/quality_restoration_20260420172637199.jpg_wkqfre.jpg",
    },
    {
      id: "hero-2",
      image:
        "https://res.cloudinary.com/dvbkqu4lh/image/upload/q_auto/f_auto/v1776421143/Gemini_Generated_Image_woyv7xwoyv7xwoyv_z9cisa.png",
    },
  ];

  const lineupCards = [
    {
      title: featuredProducts[0]?.name,
      description: featuredProducts[0]?.description,
      href: `/catalog?q=${featuredProducts[0]?.name}`,
      image:
        featuredProducts[0]?.medias?.[0]?.type === "IMAGE"
          ? featuredProducts[0].medias[0].fileUrl
          : undefined,
    },
    {
      title: featuredProducts[1]?.name,
      description: featuredProducts[1]?.description,
      href: `/catalog?q=${featuredProducts[1]?.name}`,
      image:
        featuredProducts[1]?.medias?.[0]?.type === "IMAGE"
          ? featuredProducts[1].medias[0].fileUrl
          : undefined,
    },
    {
      title: featuredProducts[2]?.name,
      description: featuredProducts[2]?.description,
      href: `/catalog?q=${featuredProducts[2]?.name}`,
      image:
        featuredProducts[2]?.medias?.[0]?.type === "IMAGE"
          ? featuredProducts[2].medias[0].fileUrl
          : undefined,
    },
    {
      title: featuredProducts[3]?.name,
      description: featuredProducts[3]?.description,
      href: `/catalog?q=${featuredProducts[3]?.name}`,
      image:
        featuredProducts[3]?.medias?.[0]?.type === "IMAGE"
          ? featuredProducts[3].medias[0].fileUrl
          : undefined,
    },
    {
      title: featuredProducts[4]?.name,
      description: featuredProducts[4]?.description,
      href: `/catalog?q=${featuredProducts[4]?.name}`,
      image:
        featuredProducts[4]?.medias?.[0]?.type === "IMAGE"
          ? featuredProducts[4].medias[0].fileUrl
          : undefined,
    },
  ];

  const adminWhatsappHref = buildWhatsappLink(
    setting.whatsappAdmin,
    "Halo Admin Hirona, saya ingin bertanya mengenai produk Hirona Homeware.",
  );

  const marketingWhatsappHref = buildWhatsappLink(
    setting.whatsappMarketing,
    "Halo Marketing Hirona, saya ingin bertanya mengenai kerja sama atau informasi produk.",
  );

  const salesWhatsappHref = buildWhatsappLink(
    setting.whatsappSales,
    "Halo Sales Hirona, saya ingin bertanya mengenai pembelian produk.",
  );

  const ownerWhatsappHref = buildWhatsappLink(
    setting.whatsappOwner,
    "Halo Owner Hirona, saya ingin menyampaikan saran, masukan, atau pengaduan.",
  );

  return (
    <div className="min-h-screen bg-[#f7f8fb] text-slate-900">
      <section className="relative overflow-hidden bg-black text-white">
        <HomeHeroCarousel
          slides={heroSlides}
          headline={
            setting.homepageHeadline ||
            "Distributor alat rumah tangga dan perabot berkualitas untuk kebutuhan rumah, retailer, dan instansi di Kalimantan Timur."
          }
          subheadline={
            setting.homepageSubheadline ||
            "PT Hirona Inspirasi Nusantara menyediakan berbagai kebutuhan rumah tangga modern dengan distribusi yang efisien, produk fungsional, dan pelayanan profesional."
          }
        />

        <div className="relative z-20 mx-auto -mt-16 max-w-7xl px-4 pb-10 sm:-mt-20 sm:px-6 lg:px-8">
          <HomeLineupCarousel items={lineupCards} />
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-14 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-2 lg:gap-10">
          <div>
            <h2 className="text-2xl font-bold text-slate-950 sm:text-3xl">
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

          <div className="rounded-[28px] bg-gradient-to-br from-[#0e3d6c] via-[#125EA9] to-[#2E4FAE] p-6 text-white shadow-xl sm:rounded-[32px] sm:p-8">
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
        <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm sm:rounded-[32px] sm:p-8">
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
          <h2 className="text-2xl font-bold text-slate-950 sm:text-3xl">
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
                {adminWhatsappHref ? (
                  <a
                    href={adminWhatsappHref}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-start gap-3 rounded-2xl bg-slate-50 px-4 py-3 transition hover:bg-slate-100"
                  >
                    <div className="mt-0.5 flex h-9 w-9 items-center justify-center rounded-xl bg-[#eef4ff] text-[#125EA9]">
                      <Phone className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="font-medium text-slate-900">Admin</p>
                      <p className="text-sm text-slate-500">
                        {setting.whatsappAdmin}
                      </p>
                    </div>
                  </a>
                ) : (
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
                )}

                {marketingWhatsappHref ? (
                  <a
                    href={marketingWhatsappHref}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-start gap-3 rounded-2xl bg-slate-50 px-4 py-3 transition hover:bg-slate-100"
                  >
                    <div className="mt-0.5 flex h-9 w-9 items-center justify-center rounded-xl bg-[#fff7e8] text-[#C89B3C]">
                      <MessageCircle className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="font-medium text-slate-900">Marketing</p>
                      <p className="text-sm text-slate-500">
                        {setting.whatsappMarketing}
                      </p>
                    </div>
                  </a>
                ) : (
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
                )}

                {salesWhatsappHref ? (
                  <a
                    href={salesWhatsappHref}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-start gap-3 rounded-2xl bg-slate-50 px-4 py-3 transition hover:bg-slate-100"
                  >
                    <div className="mt-0.5 flex h-9 w-9 items-center justify-center rounded-xl bg-[#eef2ff] text-[#2E4FAE]">
                      <Phone className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="font-medium text-slate-900">Sales</p>
                      <p className="text-sm text-slate-500">
                        {setting.whatsappSales}
                      </p>
                    </div>
                  </a>
                ) : (
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
                )}

                {ownerWhatsappHref ? (
                  <a
                    href={ownerWhatsappHref}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-start gap-3 rounded-2xl bg-slate-50 px-4 py-3 transition hover:bg-slate-100"
                  >
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
                  </a>
                ) : (
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
                )}
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
                        rel="noreferrer"
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
                        rel="noreferrer"
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
                        rel="noreferrer"
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
