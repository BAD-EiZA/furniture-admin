import { prisma } from "@/lib/prisma";

export const DEFAULT_SITE_SETTING_ID = "default-site-setting";

export async function getSiteSetting() {
  let setting = await prisma.siteSetting.findUnique({
    where: { id: DEFAULT_SITE_SETTING_ID },
  });

  if (!setting) {
    setting = await prisma.siteSetting.create({
      data: {
        id: DEFAULT_SITE_SETTING_ID,
        companyName: "PT Hirona Inspirasi Nusantara",
        bankName: "BCA",
        bankAccountName: "PT Hirona Inspirasi Nusantara",
        bankAccountNumber: "1234567890",
        qrisImageUrl: "/images/qris-hirona.png",
        googleMapsEmbed:
          "https://www.google.com/maps?q=-0.5076625,117.0959844&z=17&output=embed",
        whatsappAdmin: "082318827890",
        whatsappMarketing: "083821359356",
        whatsappSales: "081310686611",
        whatsappOwner: "081324676667",
        instagramUrl: "https://instagram.com/hirona.homeware",
        facebookUrl: "https://facebook.com/hirona homeware",
        tiktokUrl: "https://tiktok.com/@hirona.Homeware",
        lineupTitle: "Lineup Produk",
        homepageHeadline:
          "Distributor alat rumah tangga dan perabot berkualitas untuk kebutuhan rumah, retailer, dan instansi di Kalimantan Timur.",
        homepageSubheadline:
          "PT Hirona Inspirasi Nusantara menyediakan berbagai kebutuhan rumah tangga modern dengan distribusi yang efisien, produk fungsional, dan pelayanan profesional.",
        featuredMode: "PRODUCT",
        featuredPromoTitle: "Promo terbaru Hirona",
        featuredPromoText:
          "Hubungi tim kami untuk mendapatkan penawaran terbaik untuk pembelian retail, reseller, maupun pengadaan barang.",
        featuredPromoBadge: "Promo",
      },
    });
  }

  return setting;
}
