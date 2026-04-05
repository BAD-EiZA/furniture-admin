import { PrismaPg } from "@prisma/adapter-pg";
import {
  PrismaClient,
  UserRole,
  MediaType,
} from "../src/generated/prisma/client";

import bcrypt from "bcryptjs";
import { nanoid } from "nanoid";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});

const prisma = new PrismaClient({ adapter });

const productNames = [
  "Sofa Minimalis Oslo",
  "Meja Makan Sakura",
  "Kursi Santai Nordic",
  "Lemari Kayu Jati Verona",
  "Rak Buku Linden",
  "Meja Kerja Austin",
  "Tempat Tidur Aruna",
  "Nakas Sora",
  "Kabinet TV Elora",
  "Kursi Bar Haven",
  "Meja Tamu Luna",
  "Rak Sepatu Kyoto",
  "Lemari Pakaian Venice",
  "Buffet Cabinet Aurora",
  "Bangku Kayu Maple",
  "Sofa Bed Orion",
  "Credenza Milan",
  "Kursi Kantor Vento",
  "Meja Belajar Pixel",
  "Laci Serbaguna Arvo",
  "Rak Dinding Mokka",
  "Set Meja Kopi Terra",
  "Lemari Sudut Aspen",
  "Kursi Makan Marbel",
  "Meja Konsol Senja",
  "Kabinet Dapur Luma",
  "Sofa 3 Dudukan Nara",
  "Meja Samping Nova",
  "Dipan Klasik Arden",
  "Rak Display Hoku",
  "Lemari Anak Cielo",
  "Kursi Lipat Zen",
  "Meja Rias Belle",
  "Kabinet Serbaguna Kyra",
  "Rak Tanaman Verde",
  "Bangku Penyimpanan Sora",
  "Sofa Sudut Valencia",
  "Meja Pantry Nexo",
  "Kursi Teras Malibu",
  "Kabinet Arsip Atlas",
  "Meja Meeting Alto",
  "Rak Besi Urban",
  "Lemari Sliding Elio",
  "Tempat Tidur Bayi Nino",
  "Kursi Gaming Flux",
  "Meja Komputer Vertex",
  "Kabinet Kaca Ivory",
  "Rak TV Dune",
  "Sofa Modular Halo",
  "Meja Rapat Crest",
];

function slugify(text: string) {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-");
}

async function main() {
  await prisma.emailConfirmationToken.deleteMany();
  await prisma.invoice.deleteMany();
  await prisma.paymentProof.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.customer.deleteMany();
  await prisma.productMedia.deleteMany();
  await prisma.product.deleteMany();
  await prisma.user.deleteMany();

  const passwordHash = await bcrypt.hash("Admin123!", 10);

  const admins = Array.from({ length: 5 }).map((_, i) => ({
    name: `Admin ${i + 1}`,
    email: `admin${i + 1}@example.com`,
    phone: `0812000000${i + 1}`,
    passwordHash,
    role: i === 0 ? UserRole.SUPER_ADMIN : UserRole.ADMIN,
  }));

  const sales = Array.from({ length: 5 }).map((_, i) => ({
    name: `Sales ${i + 1}`,
    email: `sales${i + 1}@example.com`,
    phone: `0813000000${i + 1}`,
    passwordHash,
    role: UserRole.SALES,
  }));

  await prisma.user.createMany({
    data: [...admins, ...sales],
  });

  for (let i = 0; i < 50; i++) {
    const name = productNames[i];
    const slug = slugify(name);

    const product = await prisma.product.create({
      data: {
        name,
        slug,
        description: `Deskripsi ${name}. Cocok untuk rumah, kantor, dan showroom.`,
        price: (1200000 + i * 150000).toString(),
        stock: 10 + (i % 20),
        readyStock: 10 + (i % 20),
        allowPreOrder: true,
        qrCodeValue: `PRD-${nanoid(10)}`,
      },
    });

    await prisma.productTierPrice.createMany({
      data: [
        {
          productId: product.id,
          minQty: 1,
          price: (1200000 + i * 150000).toString(),
          label: "Retail",
        },
        {
          productId: product.id,
          minQty: 6,
          price: (1150000 + i * 145000).toString(),
          label: "Half Bulk",
        },
        {
          productId: product.id,
          minQty: 12,
          price: (1100000 + i * 140000).toString(),
          label: "Bulk",
        },
      ],
    });

    await prisma.productMedia.createMany({
      data: [
        {
          productId: product.id,
          type: MediaType.IMAGE,
          fileUrl: `https://placehold.co/1200x900?text=${encodeURIComponent(name + " 1")}`,
          sortOrder: 1,
        },
        {
          productId: product.id,
          type: MediaType.IMAGE,
          fileUrl: `https://placehold.co/1200x900?text=${encodeURIComponent(name + " 2")}`,
          sortOrder: 2,
        },
        {
          productId: product.id,
          type: MediaType.VIDEO,
          fileUrl: `https://example.com/videos/${slug}.mp4`,
          sortOrder: 3,
        },
      ],
    });
  }

  console.log("Seed selesai");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
