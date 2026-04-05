"use client";

import {
    ResponsiveContainer,
    BarChart,
    Bar,
    PieChart,
    Pie,
    Cell,
    Tooltip,
    XAxis,
    YAxis,
    CartesianGrid,
} from "recharts";

type RevenueItem = {
    name: string;
    total: number;
};

type StatusItem = {
    name: string;
    value: number;
};

type PaymentMethodItem = {
    name: string;
    value: number;
};

type Props = {
    revenueData: RevenueItem[];
    statusData: StatusItem[];
    paymentMethodData: PaymentMethodItem[];
};

export default function AdminDashboardCharts({
    revenueData,
    statusData,
    paymentMethodData,
}: Props) {
    const pieColors = ["#2563EB", "#059669", "#D97706", "#DC2626", "#7C3AED"];

    return (
        <div className="grid gap-6 xl:grid-cols-3">
            <div className="rounded-[24px] border border-slate-200/70 bg-white/85 p-6 shadow-lg backdrop-blur xl:col-span-2">
                <h2 className="text-lg font-semibold text-slate-950">
                    Omzet per Metode Pembayaran
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                    Nilai omzet dari order berdasarkan metode pembayaran.
                </p>

                <div className="mt-6 h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={revenueData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip
                                formatter={(value: any) => [
                                    `Rp ${value.toLocaleString("id-ID")}`,
                                    "Omzet",
                                ]}
                            />
                            <Bar dataKey="total" radius={[8, 8, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            <div className="rounded-[24px] border border-slate-200/70 bg-white/85 p-6 shadow-lg backdrop-blur">
                <h2 className="text-lg font-semibold text-slate-950">
                    Status Order
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                    Distribusi status order saat ini.
                </p>

                <div className="mt-6 h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={statusData}
                                dataKey="value"
                                nameKey="name"
                                outerRadius={95}
                                innerRadius={55}
                                paddingAngle={3}
                            >
                                {statusData.map((_, index) => (
                                    <Cell
                                        key={index}
                                        fill={pieColors[index % pieColors.length]}
                                    />
                                ))}
                            </Pie>
                            <Tooltip formatter={(value: any) => [value, "Jumlah"]} />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>

            <div className="rounded-[24px] border border-slate-200/70 bg-white/85 p-6 shadow-lg backdrop-blur xl:col-span-3">
                <h2 className="text-lg font-semibold text-slate-950">
                    Jumlah Order per Metode Pembayaran
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                    Perbandingan jumlah order berdasarkan metode pembayaran.
                </p>

                <div className="mt-6 h-[280px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={paymentMethodData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip formatter={(value: any) => [value, "Order"]} />
                            <Bar dataKey="value" radius={[8, 8, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
}