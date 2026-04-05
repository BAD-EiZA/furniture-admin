import { CreditCard, ShieldCheck, Sparkles, ShoppingCart } from "lucide-react";
import { prisma } from "@/lib/prisma";
import CartCheckoutForm from "@/components/cart-checkout-form";

export default async function CheckoutPage() {
    const sales = await prisma.user.findMany({
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
    });

    return (
        <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.10),_transparent_28%),linear-gradient(to_bottom,_#f8fafc,_#ffffff)]">
            <section className="border-b border-slate-200/70 bg-white/70 backdrop-blur-xl">
                <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
                    <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-4 py-2 text-sm text-blue-700">
                        <Sparkles className="h-4 w-4" />
                        Multi-product checkout
                    </div>

                    <h1 className="mt-4 text-3xl font-bold tracking-tight text-slate-950">
                        Checkout Keranjang
                    </h1>
                    <p className="mt-2 max-w-2xl text-slate-500">
                        Tinjau produk dalam keranjang, isi data diri satu kali, lalu selesaikan pesanan Anda.
                    </p>
                </div>
            </section>

            <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
                    <div className="space-y-6 lg:sticky lg:top-24 lg:self-start">
                        <div className="overflow-hidden rounded-[30px] border border-slate-200/70 bg-white shadow-sm">
                            <div className="space-y-4 p-6">
                                <div>
                                    <div className="mb-3 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-700">
                                        <ShoppingCart className="h-5 w-5" />
                                    </div>
                                    <h2 className="text-2xl font-bold text-slate-950">
                                        Ringkasan Checkout
                                    </h2>
                                    <p className="mt-3 text-sm leading-7 text-slate-600">
                                        Halaman ini mendukung pembelian beberapa produk sekaligus dalam satu checkout.
                                    </p>
                                </div>

                                <div className="grid gap-3">
                                    <div className="rounded-2xl border border-slate-200/70 bg-white p-4">
                                        <div className="flex items-start gap-3">
                                            <div className="rounded-xl bg-blue-100 p-2 text-blue-700">
                                                <CreditCard className="h-4 w-4" />
                                            </div>
                                            <div>
                                                <p className="font-medium text-slate-900">Metode pembayaran fleksibel</p>
                                                <p className="mt-1 text-sm text-slate-500">
                                                    Transfer mendapat potongan 1%, COD normal, dan Tempo menambah 3%.
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
                                                <p className="font-medium text-slate-900">Ready stock & PO otomatis</p>
                                                <p className="mt-1 text-sm text-slate-500">
                                                    Jika jumlah melebihi stok siap kirim, sisa item akan otomatis masuk pre-order.
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div>
                        <CartCheckoutForm salesOptions={sales} />
                    </div>
                </div>
            </section>
        </div>
    );
}