'use client'
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

export default function SellerOrders() {
    const [orders, setOrders] = useState([]);

    useEffect(() => { loadOrders(); }, []);

    const loadOrders = () => {
        fetch("/api/seller/orders").then(res => res.json()).then(setOrders);
    };

    const handleUpdateStatus = async (orderId, newStatus) => {
        const res = await fetch("/api/seller/orders", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ orderId, status: newStatus })
        });
        if (res.ok) {
            toast.success("Đã cập nhật trạng thái đơn hàng!");
            loadOrders();
        }
    };

    return (
        <div className="p-8 space-y-6">
            <h1 className="text-2xl font-bold text-slate-800">Quản lý Đơn đặt hàng</h1>
            <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
                <table className="w-full text-sm text-left">
                    <thead className="bg-slate-50 text-slate-500 uppercase text-xs font-bold">
                        <tr>
                            <th className="p-4">Mã Đơn</th>
                            <th className="p-4">Khách hàng</th>
                            <th className="p-4">Sản phẩm mua</th>
                            <th className="p-4">Tổng tiền</th>
                            <th className="p-4">Trạng thái</th>
                            <th className="p-4 text-center">Xử lý</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {orders.map(order => (
                            <tr key={order.id} className="hover:bg-slate-50/50">
                                <td className="p-4 font-mono text-xs text-slate-400">#{order.id.substring(0, 8)}</td>
                                <td className="p-4 font-medium text-slate-800">{order.user.name}</td>
                                <td className="p-4 text-xs text-slate-500">
                                    {order.orderItems.map(item => `${item.product.name} (x${item.quantity})`).join(", ")}
                                </td>
                                <td className="p-4 font-bold text-slate-800">${order.total}</td>
                                <td className="p-4">
                                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${order.status === 'DELIVERED' ? 'bg-green-50 text-green-600' : 'bg-blue-50 text-blue-600'}`}>
                                        {order.status}
                                    </span>
                                </td>
                                <td className="p-4 text-center">
                                    <select 
                                        value={order.status} 
                                        className="border border-slate-200 p-2 rounded-xl text-xs bg-white outline-none"
                                        onChange={(e) => handleUpdateStatus(order.id, e.target.value)}
                                    >
                                        <option value="ORDER_PLACED">Chờ xác nhận</option>
                                        <option value="PROCESSING">Đang chuẩn bị hàng</option>
                                        <option value="SHIPPED">Đang giao hàng</option>
                                        <option value="DELIVERED">Đã giao thành công</option>
                                        <option value="CANCELLED">Hủy đơn</option>
                                    </select>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}