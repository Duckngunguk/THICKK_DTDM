import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
// ➔ CÁCH FIX 1: Thay thế bằng đường dẫn tuyệt đối Alias @/
import { authOptions } from "@/app/api/auth/[...nextauth]/route"; 
// ➔ CÁCH FIX 2: Khởi tạo PrismaClient tránh lỗi undefined hệ thống
import prisma from '@/lib/prisma'

// 1. API SỬA SẢN PHẨM & CẬP NHẬT KHO HÀNG
export async function PUT(req, { params }) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || session.user.role !== "STORE_OWNER") {
            return NextResponse.json({ error: "Từ chối quyền truy cập" }, { status: 403 });
        }

        const { id } = await params; // Tiêu chuẩn Next.js 15 bắt buộc phải await params
        const body = await req.json();
        const { name, description, mrp, price, category, stock } = body;

        const updatedProduct = await prisma.product.update({
            where: { id },
            data: {
                name,
                description,
                mrp: parseFloat(mrp),
                price: parseFloat(price),
                category,
                stock: parseInt(stock),
                inStock: parseInt(stock) > 0
            }
        });

        return NextResponse.json(updatedProduct);
    } catch (error) {
        console.error("Lỗi cập nhật sản phẩm:", error);
        return NextResponse.json({ error: "Lỗi hệ thống khi cập nhật thông tin" }, { status: 500 });
    }
}

// 2. API XÓA MỀM SẢN PHẨM (SOFT DELETE)
export async function DELETE(req, { params }) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || session.user.role !== "STORE_OWNER") {
            return NextResponse.json({ error: "Từ chối quyền truy cập" }, { status: 403 });
        }

        const { id } = await params; // Tiêu chuẩn Next.js 15 bắt buộc phải await params

        // CHỌN CÁCH XÓA PHÙ HỢP VỚI DATABASE CỦA BẠN:
        
        // Cách A: Xóa mềm - Ẩn sản phẩm (Nếu file schema.prisma của bạn CÓ trường isDeleted)
        await prisma.product.update({
            where: { id },
            data: { isDeleted: true }
        });

        /* // Cách B: Xóa cứng - Xóa hoàn toàn khỏi DB (Bỏ ghi chú đoạn này nếu schema KHÔNG CÓ trường isDeleted)
        await prisma.product.delete({
            where: { id }
        });
        */

        return NextResponse.json({ message: "Xử lý xóa sản phẩm thành công" });
    } catch (error) {
        console.error("Lỗi xóa sản phẩm:", error);
        return NextResponse.json({ error: "Lỗi hệ thống khi thực hiện lệnh xóa" }, { status: 500 });
    }
}