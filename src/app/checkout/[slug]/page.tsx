import { notFound } from "next/navigation";
import { CreditCard, ShieldCheck, Sparkles } from "lucide-react";
import { prisma } from "@/lib/prisma";
import CheckoutForm from "@/components/checkout-form";

export default async function CheckoutPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const [product, sales] = await Promise.all([
    prisma.product.findUnique({
      where: { slug },
      include: {
        medias: {
          orderBy: { sortOrder: "asc" },
          take: 1,
        },
      },
    }),
    prisma.user.findMany({
      where: {
        role: "SALES",
        isActive: true,
      },
      orderBy: {
        name: "asc",
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
      },
    }),
  ]);

  if (!product || !product.isActive) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.10),_transparent_28%),linear-gradient(to_bottom,_#f8fafc,_#ffffff)]">
      <section className="border-b border-slate-200/70 bg-white/70 backdrop-blur-xl">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-4 py-2 text-sm text-blue-700">
            <Sparkles className="h-4 w-4" />
            Secure checkout flow
          </div>

          <h1 className="mt-4 text-3xl font-bold tracking-tight text-slate-950">
            Checkout Produk
          </h1>
          <p className="mt-2 max-w-2xl text-slate-500">
            Lengkapi data diri, pilih sales, dan unggah bukti pembayaran untuk
            melanjutkan proses transaksi.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="space-y-6 lg:sticky lg:top-24 lg:self-start">
            <div className="overflow-hidden rounded-[30px] border border-slate-200/70 bg-white shadow-sm">
              <div className="aspect-[4/3] overflow-hidden bg-slate-100">
                {product.medias[0]?.type === "IMAGE" ? (
                  <img
                    src={product.medias[0].fileUrl}
                    alt={product.name}
                    className="h-full w-full object-cover"
                  />
                ) : product.medias[0]?.type === "VIDEO" ? (
                  <video
                    src={product.medias[0].fileUrl}
                    controls
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-slate-500">
                    Belum ada media
                  </div>
                )}
              </div>

              <div className="space-y-4 p-6">
                <div>
                  <p className="text-sm text-slate-500">Produk dipilih</p>
                  <h2 className="mt-2 text-2xl font-bold text-slate-950">
                    {product.name}
                  </h2>
                  <p className="mt-3 text-sm leading-7 text-slate-600">
                    {product.description}
                  </p>
                </div>

                <div className="rounded-2xl bg-slate-50 p-4">
                  <p className="text-sm text-slate-500">Harga</p>
                  <p className="mt-2 text-2xl font-bold text-blue-700">
                    Rp {Number(product.price).toLocaleString("id-ID")}
                  </p>
                </div>

                <div className="grid gap-3">
                  <div className="rounded-2xl border border-slate-200/70 bg-white p-4">
                    <div className="flex items-start gap-3">
                      <div className="rounded-xl bg-blue-100 p-2 text-blue-700">
                        <CreditCard className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="font-medium text-slate-900">
                          Upload bukti pembayaran
                        </p>
                        <p className="mt-1 text-sm text-slate-500">
                          Setelah pembayaran dilakukan, unggah bukti agar dapat
                          diverifikasi.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-slate-200/70 bg-white p-4">
                    <div className="flex items-start gap-3">
                      <div className="rounded-xl bg-emerald-100 p-2 text-emerald-700">
                        <ShieldCheck className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="font-medium text-slate-900">
                          Konfirmasi oleh sales
                        </p>
                        <p className="mt-1 text-sm text-slate-500">
                          Sales akan memverifikasi pembayaran sebelum invoice
                          dikirim manual melalui WhatsApp.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div>
            <CheckoutForm
              product={{
                id: product.id,
                name: product.name,
                price: Number(product.price),
                stock: product.stock,
              }}
              salesOptions={sales}
            />
          </div>
        </div>
      </section>
    </div>
  );
}
