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

const HIRONA_BLUE_DARK = "#0d2f57";
const HIRONA_BLUE = "#125EA9";
const HIRONA_BLUE_MID = "#2E4FAE";
const HIRONA_GOLD = "#C89B3C";
const HIRONA_GREEN = "#1f7a55";
const HIRONA_RED = "#c24141";

export default function AdminDashboardCharts({
    revenueData,
    statusData,
    paymentMethodData,
}: Props) {
    const pieColors = [
        HIRONA_BLUE,
        HIRONA_RED,
        HIRONA_GOLD,
        HIRONA_BLUE_MID,
        HIRONA_GREEN,
    ];

    return (
        <div className="grid gap-6 xl:grid-cols-3">
            <div className="rounded-[24px] border border-[#e3ebf5] bg-white p-6 shadow-md xl:col-span-2">
                <h2 className="text-lg font-semibold text-slate-950">
                    Omzet per Metode Pembayaran
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                    Nilai omzet dari order berdasarkan metode pembayaran.
                </p>

                <div className="mt-6 h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={revenueData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e7eef7" />
                            <XAxis dataKey="name" stroke="#64748b" />
                            <YAxis stroke="#64748b" />
                            <Tooltip
                                formatter={(value: any) => [
                                    `Rp ${value.toLocaleString("id-ID")}`,
                                    "Omzet",
                                ]}
                                contentStyle={{
                                    borderRadius: 16,
                                    border: "1px solid #dbe5f0",
                                    boxShadow: "0 8px 24px rgba(15, 23, 42, 0.08)",
                                }}
                            />
                            <Bar
                                dataKey="total"
                                radius={[8, 8, 0, 0]}
                                fill={HIRONA_BLUE}
                            />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            <div className="rounded-[24px] border border-[#e3ebf5] bg-white p-6 shadow-md">
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
                            <Tooltip
                                formatter={(value: any) => [value, "Jumlah"]}
                                contentStyle={{
                                    borderRadius: 16,
                                    border: "1px solid #dbe5f0",
                                    boxShadow: "0 8px 24px rgba(15, 23, 42, 0.08)",
                                }}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>

            <div className="rounded-[24px] border border-[#e3ebf5] bg-white p-6 shadow-md xl:col-span-3">
                <h2 className="text-lg font-semibold text-slate-950">
                    Jumlah Order per Metode Pembayaran
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                    Perbandingan jumlah order berdasarkan metode pembayaran.
                </p>

                <div className="mt-6 h-[280px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={paymentMethodData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e7eef7" />
                            <XAxis dataKey="name" stroke="#64748b" />
                            <YAxis stroke="#64748b" />
                            <Tooltip
                                formatter={(value: any) => [value, "Order"]}
                                contentStyle={{
                                    borderRadius: 16,
                                    border: "1px solid #dbe5f0",
                                    boxShadow: "0 8px 24px rgba(15, 23, 42, 0.08)",
                                }}
                            />
                            <Bar
                                dataKey="value"
                                radius={[8, 8, 0, 0]}
                                fill={HIRONA_GOLD}
                            />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
}