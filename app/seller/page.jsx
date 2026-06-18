'use client'
import { useEffect, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { DollarSign, Package, AlertTriangle } from "lucide-react";

export default function SellerOverview() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch("/api/seller/analytics")
            .then(res => res.json())
            .then(data => { setData(data); setLoading(false); });
    }, []);

    if (loading) return <div className="p-8 text-center text-slate-500 text-sm">Đang tính toán doanh thu...</div>;

    return (
        <div className="p-8 space-y-8">
            <h1 className="text-2xl font-bold text-slate-800">Báo cáo Doanh thu & Cửa hàng</h1>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-2xl border border-slate-100 flex items-center gap-4">
                    <div className="p-4 bg-green-50 text-green-600 rounded-xl"><DollarSign size={24} /></div>
                    <div>
                        <p className="text-xs text-slate-400 font-semibold uppercase">Tổng doanh thu thực tế</p>
                        <p className="text-2xl font-bold text-slate-800">${data?.totalRevenue.toFixed(2)}</p>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-slate-100 flex items-center gap-4">
                    <div className="p-4 bg-amber-50 text-amber-600 rounded-xl"><AlertTriangle size={24} /></div>
                    <div>
                        <p className="text-xs text-slate-400 font-semibold uppercase">Cảnh báo hết hàng</p>
                        <p className="text-2xl font-bold text-slate-800">{data?.lowStockCount} sản phẩm</p>
                    </div>
                </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-100">
                <h3 className="text-sm font-bold text-slate-700 mb-6 uppercase tracking-wider">Biểu đồ dòng tiền theo ngày</h3>
                <div className="h-72">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={data?.chartData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f8fafc" />
                            <XAxis dataKey="date" stroke="#94a3b8" fontSize={12} />
                            <YAxis stroke="#94a3b8" fontSize={12} />
                            <Tooltip />
                            <Bar dataKey="revenue" fill="#6366f1" radius={[4, 4, 0, 0]} name="Doanh thu ($)" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
}