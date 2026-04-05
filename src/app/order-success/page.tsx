import Link from "next/link";
import { CheckCircle2, FileText, ShoppingBag } from "lucide-react";

export default async function OrderSuccessPage({
    searchParams,
}: {
    searchParams: Promise<{ orderCode?: string }>;
}) {
    const params = await searchParams;
    const orderCode = params.orderCode || "";

    return (
        <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.10),_transparent_28%),linear-gradient(to_bottom,_#f8fafc,_#ffffff)]">
            <section className="mx-auto flex min-h-screen max-w-4xl items-center px-4 py-12 sm:px-6 lg:px-8">
                <div className="w-full rounded-[32px] border border-slate-200/70 bg-white/90 p-8 shadow-xl backdrop-blur">
                    <div className="mx-auto flex max-w-2xl flex-col items-center text-center">
                        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
                            <CheckCircle2 className="h-10 w-10" />
                        </div>

                        <h1 className="mt-6 text-3xl font-bold tracking-tight text-slate-950">
                            Pesanan Berhasil Dibuat
                        </h1>

                        <p className="mt-3 text-slate-500">
                            Pesanan Anda sudah masuk ke sistem. Simpan kode order berikut untuk
                            memantau status pesanan Anda.
                        </p>

                        <div className="mt-6 rounded-2xl bg-slate-950 px-6 py-5 text-white">
                            <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                                Order Code
                            </p>
                            <p className="mt-2 text-2xl font-bold">{orderCode || "-"}</p>
                        </div>

                        <div className="mt-8 grid w-full gap-3 sm:grid-cols-2">
                            <Link
                                href={orderCode ? `/status/${orderCode}` : "/catalog"}
                                className="inline-flex items-center justify-center rounded-2xl bg-blue-600 px-5 py-3.5 text-sm font-medium text-white shadow-lg shadow-blue-500/20 hover:bg-blue-700"
                            >
                                <FileText className="mr-2 h-4 w-4" />
                                Lihat Status Order
                            </Link>

                            <Link
                                href="/catalog"
                                className="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-white px-5 py-3.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
                            >
                                <ShoppingBag className="mr-2 h-4 w-4" />
                                Kembali ke Katalog
                            </Link>
                        </div>

                        <p className="mt-6 text-sm text-slate-400">
                            Jika Anda memilih transfer, sales akan memverifikasi pembayaran Anda
                            terlebih dahulu.
                        </p>
                    </div>
                </div>
            </section>
        </div>
    );
}