import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import ProductQrCard from "@/components/product-qr-card";

export default async function ProductQrPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const product = await prisma.product.findUnique({
    where: { id },
  });

  if (!product) notFound();

  const qrUrl = `${process.env.APP_URL}/qr/${product.qrCodeValue}`;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold">QR Produk</h2>
          <p className="text-sm text-slate-500">{product.name}</p>
        </div>

        <Link
          href="/admin/products"
          className="rounded-xl bg-slate-100 px-4 py-3 text-sm font-medium text-slate-700 hover:bg-slate-200"
        >
          Kembali
        </Link>
      </div>

      <ProductQrCard
        productName={product.name}
        qrValue={product.qrCodeValue}
        qrUrl={qrUrl}
      />
    </div>
  );
}
