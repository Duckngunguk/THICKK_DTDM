import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
// ➔ SỬA ĐƯỜNG DẪN TUYỆT ĐỐI ALIAS @/ CHỐNG LỖI TÌM MODULE
import { authOptions } from "@/app/api/auth/[...nextauth]/route"; 
// ➔ KHỞI TẠO PRISMACLIENT CHUẨN ĐỂ BIẾN PRISMA KHÔNG BỊ UNDEFINED
import prisma from '@/lib/prisma'

export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        if (!session || session.user.role !== "STORE_OWNER") {
            return NextResponse.json({ error: "Từ chối quyền truy cập" }, { status: 403 });
        }

        // Tìm StoreID của người dùng đang đăng nhập
        const store = await prisma.store.findUnique({ where: { userId: session.user.id } });
        if (!store) {
            return NextResponse.json({ error: "Cửa hàng chưa được thiết lập" }, { status: 404 });
        }

        // Lấy danh sách sản phẩm chưa bị xóa mềm của riêng cửa hàng này
        const products = await prisma.product.findMany({
            where: { storeId: store.id, isDeleted: false },
            orderBy: { createdAt: "desc" }
        });

        return NextResponse.json(products);
    } catch (error) {
        console.error("Lỗi nghiêm trọng tại GET products:", error);
        return NextResponse.json({ error: "Lỗi máy chủ nội bộ ngầm" }, { status: 500 });
    }
}
// Thêm/Cập nhật đoạn hàm POST này trong app/api/seller/products/route.js
export async function POST(req) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || session.user.role !== "STORE_OWNER") {
            return NextResponse.json({ error: "Từ chối quyền truy cập" }, { status: 403 });
        }

        // 1. Kiểm tra xem tài khoản này đã có Store thực tế chưa
        const store = await prisma.store.findUnique({ where: { userId: session.user.id } });
        if (!store) {
            return NextResponse.json({ 
                error: "Tài khoản test của bạn thiếu bản ghi Store. Vui lòng đăng ký tài khoản Seller mới để test!" 
            }, { status: 404 });
        }

        const body = await req.json();
        const { name, description, mrp, price, category, stock } = body;

        // 2. Chốt chặn kiểm tra dữ liệu đầu vào không được bỏ trống
        if (!name || !price || !stock) {
            return NextResponse.json({ error: "Vui lòng nhập đầy đủ Tên, Giá bán và Số lượng tồn kho" }, { status: 400 });
        }

        // 3. Tạo sản phẩm và ép kiểu an toàn tránh crash DB
        const newProduct = await prisma.product.create({
            data: {
                name,
                description: description || "",
                mrp: parseFloat(mrp) || parseFloat(price),
                price: parseFloat(price),
                images: "", // Tạm thời để rỗng vì form của bạn chưa có nút upload ảnh
                category: category || "Chưa phân loại",
                stock: parseInt(stock) || 0,
                inStock: parseInt(stock) > 0,
                storeId: store.id // Gắn trực tiếp ID cửa hàng tìm được
            }
        });

        return NextResponse.json(newProduct, { status: 201 });

    } catch (error) {
        console.error("Lỗi đăng sản phẩm:", error);
        return NextResponse.json({ error: "Lỗi hệ thống không thể tạo sản phẩm" }, { status: 500 });
    }
}