import { PrismaPg } from "@prisma/adapter-pg";
import {
  PrismaClient,
  UserRole,
  MediaType,
  StockHistoryType,
} from "../src/generated/prisma/client";

import bcrypt from "bcryptjs";
import { nanoid } from "nanoid";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});

const prisma = new PrismaClient({ adapter });

const DEFAULT_PASSWORD = "Hirona123!";

const furnitureCatalog = [
  "Meja Rapat Crest",
  "Sofa Modular Halo",
  "Rak TV Dune",
  "Kabinet Kaca Ivory",
  "Lemari Serbaguna Maple",
  "Meja Tamu Aurora",
  "Kursi Santai Pavo",
  "Rak Sudut Livia",
  "Meja Kerja Vento",
  "Lemari Arsip Norra",
  "Kabinet Dapur Elora",
  "Kursi Makan Solis",
  "Meja Makan Ardent",
  "Rak Buku Tivoli",
  "Tempat Tidur Cassa",
  "Nakas Luna",
  "Lemari Pakaian Bergen",
  "Meja Belajar Alto",
  "Rak Sepatu Verona",
  "Kursi Kantor Marlo",
  "Meja Kasir Nexus",
  "Kabinet Plastik Kora",
  "Rak Plastik Bento",
  "Laci Susun Fino",
  "Tempat Sampah Axis",
  "Rak Dapur Monza",
  "Troli Serbaguna Cosmo",
  "Kursi Lipat Terra",
  "Meja Lipat Pixel",
  "Kabinet Penyimpanan Huga",
  "Rak Display Rocco",
  "Meja Konsol Sierra",
  "Kursi Teras Palma",
  "Rak Handuk Cleo",
  "Lemari Serbaguna Prado",
  "Meja Samping Nova",
  "Bangku Minimalis Fira",
  "Rak Gudang Titan",
  "Kabinet File Lexa",
  "Kursi Tamu Reno",
  "Meja Tulis Vierra",
  "Rak Kosmetik Alya",
  "Kabinet TV Odessa",
  "Lemari Anak Kiko",
  "Meja Pantry Aster",
  "Rak Piring Zeno",
  "Kursi Cafe Miro",
  "Meja Cafe Riva",
  "Rak Tanaman Sora",
  "Kabinet Multi Fungsi Yuna",
];

function slugify(text: string) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}

function buildImageUrl(seed: string) {
  return `https://picsum.photos/seed/${seed}/1200/900`;
}

function randomDescription(name: string, index: number) {
  const descriptions = [
    `${name} dirancang untuk kebutuhan rumah tangga dan usaha dengan tampilan modern, kokoh, dan fungsional.`,
    `${name} cocok digunakan untuk rumah, toko, kantor, maupun kebutuhan display dengan material berkualitas dan desain praktis.`,
    `${name} menghadirkan kombinasi fungsi, kerapian, dan estetika untuk menunjang kebutuhan ruang sehari-hari.`,
    `${name} dibuat untuk memberikan solusi penyimpanan dan penggunaan yang efisien dengan desain yang mudah dipadukan.`,
    `${name} adalah pilihan tepat untuk kebutuhan perabot serbaguna dengan kualitas yang baik dan harga kompetitif.`,
  ];

  return descriptions[index % descriptions.length];
}

function generatePrice(index: number) {
  return 85000 + index * 17000;
}

function generateStock(index: number) {
  return 18 + (index % 17);
}

function generateReadyStock(index: number) {
  return 8 + (index % 11);
}

async function upsertUser(data: {
  name: string;
  email: string;
  phone?: string | null;
  role: UserRole;
  isActive?: boolean;
  passwordHash: string;
}) {
  return prisma.user.upsert({
    where: { email: data.email },
    update: {
      name: data.name,
      phone: data.phone ?? null,
      role: data.role,
      isActive: data.isActive ?? true,
      passwordHash: data.passwordHash,
    },
    create: {
      name: data.name,
      email: data.email,
      phone: data.phone ?? null,
      role: data.role,
      isActive: data.isActive ?? true,
      passwordHash: data.passwordHash,
    },
  });
}

async function main() {
  console.log("🌱 Seeding database...");

  const passwordHash = await bcrypt.hash(DEFAULT_PASSWORD, 10);

  /**
   * 1. SITE SETTINGS
   */
  await prisma.siteSetting.upsert({
    where: { id: "default-site-setting" },
    update: {},
    create: {
      id: "default-site-setting",
      companyName: "PT Hirona Inspirasi Nusantara",
      bankName: "BCA",
      bankAccountName: "PT Hirona Inspirasi Nusantara",
      bankAccountNumber: "1234567890",
      qrisImageUrl: "/images/qris-hirona.png",
      googleMapsEmbed:
        "https://www.google.com/maps?q=-0.5076625,117.0959844&z=17&output=embed",
      whatsappAdmin: "082318827890",
      whatsappMarketing: "083821359356",
      whatsappSales: "08812387498",
      whatsappOwner: "081324676667",
      instagramUrl: "https://instagram.com/hirona.homeware",
      facebookUrl: "https://facebook.com/hirona.homeware",
      tiktokUrl: "https://tiktok.com/@hirona.homeware",
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

  /**
   * 2. USERS
   */
  const users = [
    {
      name: "Super Admin Hirona",
      email: "superadmin@hirona.com",
      phone: "081111111111",
      role: UserRole.SUPER_ADMIN,
    },
    {
      name: "Admin Operasional Hirona",
      email: "admin@hirona.com",
      phone: "082222222222",
      role: UserRole.ADMIN,
    },
    {
      name: "Admin Gudang Hirona",
      email: "gudang@hirona.com",
      phone: "083333333333",
      role: UserRole.ADMIN,
    },
    {
      name: "Ramadhia",
      email: "ramadhia7@gmail.com",
      phone: "08812387498",
      role: UserRole.SALES,
    },
    {
      name: "Nanda",
      email: "marketing.sales@hirona.com",
      phone: "083821359356",
      role: UserRole.SALES,
    },
    {
      name: "Erwin Susanto",
      email: "erwin.sales@hirona.com",
      phone: "081310686611",
      role: UserRole.SALES,
    },
  ];

  for (const user of users) {
    await upsertUser({
      ...user,
      isActive: true,
      passwordHash,
    });
  }

  /**
   * 3. PRODUCTS + MEDIA + TIER PRICES + STOCK HISTORY
   */
  for (let i = 0; i < furnitureCatalog.length; i++) {
    const name = furnitureCatalog[i];
    const slug = slugify(name);
    const price = generatePrice(i + 1);
    const stock = generateStock(i + 1);
    const readyStock = generateReadyStock(i + 1);
    const isFeatured = i < 5;

    const existingProduct = await prisma.product.findUnique({
      where: { slug },
      include: {
        medias: true,
        tierPrices: true,
        stockHistories: true,
      },
    });

    if (existingProduct) {
      const updated = await prisma.product.update({
        where: { id: existingProduct.id },
        data: {
          name,
          description: randomDescription(name, i),
          price: price.toString(),
          stock,
          readyStock,
          allowPreOrder: true,
          pcsPerBal: 24,
          isActive: true,
          isFeatured,
        },
      });

      if (existingProduct.medias.length === 0) {
        await prisma.productMedia.createMany({
          data: [
            {
              productId: updated.id,
              type: MediaType.IMAGE,
              fileUrl: buildImageUrl(`${slug}-1`),
              sortOrder: 1,
            },
            {
              productId: updated.id,
              type: MediaType.IMAGE,
              fileUrl: buildImageUrl(`${slug}-2`),
              sortOrder: 2,
            },
          ],
        });
      }

      if (existingProduct.tierPrices.length === 0) {
        await prisma.productTierPrice.createMany({
          data: [
            {
              productId: updated.id,
              minQty: 12,
              price: (price * 0.95).toFixed(2),
              label: "Diskon 12 pcs 5%",
            },
            {
              productId: updated.id,
              minQty: 24,
              price: (price * 0.8).toFixed(2),
              label: "Diskon 1 Bal 20%",
            },
          ],
        });
      }

      const hasCreateHistory = existingProduct.stockHistories.some(
        (h) => h.type === StockHistoryType.PRODUCT_CREATE,
      );

      if (!hasCreateHistory) {
        await prisma.stockHistory.create({
          data: {
            productId: updated.id,
            type: StockHistoryType.PRODUCT_CREATE,
            stockBefore: 0,
            stockAfter: stock,
            readyBefore: 0,
            readyAfter: readyStock,
            changeAmount: stock,
            note: "Seed initial stock",
            actorName: "Seeder",
            actorRole: UserRole.SUPER_ADMIN,
          },
        });
      }

      continue;
    }

    const product = await prisma.product.create({
      data: {
        name,
        slug,
        description: randomDescription(name, i),
        price: price.toString(),
        stock,
        readyStock,
        allowPreOrder: true,
        pcsPerBal: 24,
        qrCodeValue: `HIRONA-${nanoid(10)}`,
        isActive: true,
        isFeatured,
      },
    });

    await prisma.productMedia.createMany({
      data: [
        {
          productId: product.id,
          type: MediaType.IMAGE,
          fileUrl: buildImageUrl(`${slug}-1`),
          sortOrder: 1,
        },
        {
          productId: product.id,
          type: MediaType.IMAGE,
          fileUrl: buildImageUrl(`${slug}-2`),
          sortOrder: 2,
        },
      ],
    });

    await prisma.productTierPrice.createMany({
      data: [
        {
          productId: product.id,
          minQty: 12,
          price: (price * 0.95).toFixed(2),
          label: "Diskon 12 pcs 5%",
        },
        {
          productId: product.id,
          minQty: 24,
          price: (price * 0.8).toFixed(2),
          label: "Diskon 1 Bal 20%",
        },
      ],
    });

    await prisma.stockHistory.create({
      data: {
        productId: product.id,
        type: StockHistoryType.PRODUCT_CREATE,
        stockBefore: 0,
        stockAfter: stock,
        readyBefore: 0,
        readyAfter: readyStock,
        changeAmount: stock,
        note: "Seed initial stock",
        actorName: "Seeder",
        actorRole: UserRole.SUPER_ADMIN,
      },
    });
  }

  console.log("✅ Seed selesai");
  console.log("🔐 Default password semua user:", DEFAULT_PASSWORD);
  console.log("👤 Sales utama:", "ramadhia7@gmail.com / 08812387498");
  console.log("📦 Total produk:", furnitureCatalog.length);
}

main()
  .catch((e) => {
    console.error("❌ Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
