import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
// ➔ CÁCH FIX DÒNG 3: Dùng đường dẫn tuyệt đối Alias @/ của dự án GoCart
import { authOptions } from "@/app/api/auth/[...nextauth]/route"; 
// ➔ CÁCH FIX DÒNG 4: Khởi tạo lớp kết nối tránh lỗi undefined hệ thống
import prisma from '@/lib/prisma'

// 1. LẤY TOÀN BỘ ĐƠN HÀNG THUỘC VỀ STORE CỦA SELLER ĐANG ĐĂNG NHẬP
export async function GET() {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "STORE_OWNER") {
        return NextResponse.json({ error: "Từ chối quyền truy cập" }, { status: 403 });
    }

    const store = await prisma.store.findUnique({ where: { userId: session.user.id } });
    if (!store) {
        return NextResponse.json({ error: "Cửa hàng không tồn tại hoặc chưa thiết lập" }, { status: 404 });
    }

    const orders = await prisma.order.findMany({
        where: { storeId: store.id },
        include: {
            user: { select: { name: true, email: true } },
            orderItems: { include: { product: true } }
        },
        orderBy: { createdAt: "desc" }
    });

    return NextResponse.json(orders);
}

// 2. CẬP NHẬT TRẠNG THÁI ĐƠN HÀNG (XÁC NHẬN / GIAO HÀNG / HỦY ĐƠN)
export async function PUT(req) {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "STORE_OWNER") {
        return NextResponse.json({ error: "Từ chối quyền truy cập" }, { status: 403 });
    }

    try {
        const { orderId, status } = await req.json();
        const store = await prisma.store.findUnique({ where: { userId: session.user.id } });
        if (!store) {
            return NextResponse.json({ error: "Cửa hàng không tồn tại" }, { status: 404 });
        }

        const order = await prisma.order.findUnique({ where: { id: orderId } });
        if (!order || order.storeId !== store.id) {
            return NextResponse.json({ error: "Đơn hàng không hợp lệ hoặc không thuộc cửa hàng này" }, { status: 403 });
        }

        const updatedOrder = await prisma.order.update({
            where: { id: orderId },
            data: { status }
        });

        return NextResponse.json(updatedOrder);
    } catch (error) {
        console.error("Lỗi cập nhật đơn hàng:", error);
        return NextResponse.json({ error: "Lỗi cập nhật trạng thái đơn" }, { status: 500 });
    }
}