import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from '@/lib/prisma'

export async function GET() {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "STORE_OWNER") {
        return NextResponse.json({ error: "Từ chối quyền truy cập" }, { status: 403 });
    }

    const store = await prisma.store.findUnique({ where: { userId: session.user.id } });

    // ➔ FIX 1: Thêm chốt chặn an toàn bảo vệ hệ thống không bị crash
    if (!store) {
        return NextResponse.json({ error: "Tài khoản chưa được thiết lập Cửa hàng" }, { status: 404 });
    }

    // Lấy tất cả item của các đơn hàng đã giao thành công (DELIVERED)
    // ➔ FIX 2: Thêm orderBy để dòng thời gian trên biểu đồ Recharts chuẩn từ cũ đến mới
    const deliveredOrders = await prisma.order.findMany({
        where: { storeId: store.id, status: "DELIVERED" },
        include: { orderItems: true },
        orderBy: { createdAt: "asc" } 
    });

    // 1. Tính tổng doanh thu
    let totalRevenue = 0;
    const revenueByDate = {};

    deliveredOrders.forEach(order => {
        const dateStr = new Date(order.createdAt).toLocaleDateString("vi-VN");
        let orderStoreTotal = 0;

        order.orderItems.forEach(item => {
            orderStoreTotal += item.price * item.quantity;
        });

        totalRevenue += orderStoreTotal;
        revenueByDate[dateStr] = (revenueByDate[dateStr] || 0) + orderStoreTotal;
    });

    // Định dạng cấu trúc mảng sạch cho Recharts
    const chartData = Object.keys(revenueByDate).map(date => ({
        date,
        revenue: revenueByDate[date]
    }));

    // 2. Thống kê sản phẩm sắp hết hàng (Kho hàng < 5 món)
    const lowStockProducts = await prisma.product.findMany({
        where: { storeId: store.id, stock: { lt: 5 }, isDeleted: false }
    });

    return NextResponse.json({
        totalRevenue,
        chartData,
        lowStockCount: lowStockProducts.length,
        lowStockProducts
    });
}
