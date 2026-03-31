import Link from "next/link";
import QRCode from "react-qr-code";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";

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
      <div>
        <h2 className="text-2xl font-bold">QR Produk</h2>
        <p className="text-sm text-slate-500">{product.name}</p>
      </div>

      <div className="max-w-md rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
        <div className="flex justify-center rounded-2xl bg-white p-4">
          <QRCode value={qrUrl} size={240} />
        </div>

        <div className="mt-4 space-y-2 text-sm">
          <p>
            <span className="font-medium">QR Value:</span> {product.qrCodeValue}
          </p>
          <p className="break-all">
            <span className="font-medium">QR URL:</span> {qrUrl}
          </p>
        </div>

        <div className="mt-6 flex gap-3">
          <Link
            href="/admin/products"
            className="rounded-xl bg-slate-100 px-4 py-3 text-sm font-medium text-slate-700 hover:bg-slate-200"
          >
            Kembali
          </Link>

          <a
            href={qrUrl}
            target="_blank"
            className="rounded-xl bg-blue-600 px-4 py-3 text-sm font-medium text-white hover:bg-blue-700"
          >
            Buka Link
          </a>
        </div>
      </div>
    </div>
  );
}
