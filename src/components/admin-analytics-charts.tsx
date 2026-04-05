"use client";

import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    CartesianGrid,
} from "recharts";

type PaymentMethodChartItem = {
    name: string;
    orders: number;
    total: number;
};

type StatusChartItem = {
    name: string;
    value: number;
};

type StockChartItem = {
    name: string;
    value: number;
};

type Props = {
    paymentMethodData: PaymentMethodChartItem[];
    statusData: StatusChartItem[];
    stockData: StockChartItem[];
};

export default function AdminAnalyticsCharts({
    paymentMethodData,
    statusData,
    stockData,
}: Props) {
    const pieColors = ["#2563EB", "#059669", "#D97706", "#DC2626", "#7C3AED"];

    return (
        <div className="grid gap-6 xl:grid-cols-2">
            <div className="rounded-[28px] border border-slate-200/70 bg-white p-6 shadow-sm">
                <h2 className="text-lg font-semibold text-slate-950">
                    Omzet per Metode Pembayaran
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                    Perbandingan nominal order berdasarkan payment method.
                </p>

                <div className="mt-6 h-[320px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={paymentMethodData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip
                                formatter={(value: any, name: any) => {
                                    if (name === "total") {
                                        return [`Rp ${value.toLocaleString("id-ID")}`, "Omzet"];
                                    }
                                    return [value, "Order"];
                                }}
                            />
                            <Bar dataKey="total" radius={[8, 8, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            <div className="rounded-[28px] border border-slate-200/70 bg-white p-6 shadow-sm">
                <h2 className="text-lg font-semibold text-slate-950">
                    Status Order
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                    Distribusi status order saat ini.
                </p>

                <div className="mt-6 h-[320px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={statusData}
                                dataKey="value"
                                nameKey="name"
                                outerRadius={110}
                                innerRadius={60}
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

            <div className="rounded-[28px] border border-slate-200/70 bg-white p-6 shadow-sm xl:col-span-2">
                <h2 className="text-lg font-semibold text-slate-950">
                    Ready Qty vs PO Qty
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                    Perbandingan quantity siap kirim dan quantity pre-order.
                </p>

                <div className="mt-6 h-[320px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={stockData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip formatter={(value: any) => [value, "Qty"]} />
                            <Bar dataKey="value" radius={[8, 8, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
}