import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import prisma from '@/lib/prisma'
import { nanoid } from "nanoid";
export async function POST(req) {
    try {
        const { name, email, password, storeName, storeUsername, storeEmail, storeContact, storeAddress, storeDescription, storeLogoUrl } = await req.json();

        // Kiểm tra dữ liệu đầu vào
        if (!name || !email || !password || !storeName || !storeUsername) {
            return NextResponse.json({ error: "Vui lòng nhập đầy đủ thông tin bắt buộc (bao gồm username cửa hàng)" }, { status: 400 });
        }

        // 1. Kiểm tra email hoặc username đã tồn tại chưa
        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            return NextResponse.json({ error: "Email này đã được sử dụng" }, { status: 400 });
        }
        const existingStore = await prisma.store.findUnique({ where: { username: storeUsername } });
        if (existingStore) {
            return NextResponse.json({ error: "Username cửa hàng đã được sử dụng, vui lòng chọn tên khác" }, { status: 400 });
        }

        // 2. Mã hóa mật khẩu
        const hashedPassword = await bcrypt.hash(password, 10);
        const userId = `user_${nanoid(10)}`; // Tạo ID vì trường id của User trong schema là chuỗi String

        // 3. Chạy Transaction tạo cả User và Store cùng lúc để tránh lỗi đồng bộ
        await prisma.$transaction(async (tx) => {
            const newUser = await tx.user.create({
                data: {
                    id: userId,
                    name,
                    email,
                    password: hashedPassword,
                    role: "STORE_OWNER", // Gán quyền chủ cửa hàng
                    image: "",
                    cart: {} // ensure required Json field is present
                }
            });

            await tx.store.create({
                data: {
                    userId: newUser.id,
                    name: storeName,
                    username: storeUsername,
                    description: storeDescription || "",
                    address: storeAddress || "",
                    status: 'pending',
                    isActive: false,
                    logo: storeLogoUrl || "",
                    email: storeEmail || newUser.email,
                    contact: storeContact || ""
                }
            });
        });

        return NextResponse.json({ message: "Đăng ký tài khoản người bán thành công!" }, { status: 201 });

    } catch (error) {
        console.error("Lỗi đăng ký Seller:", error);
        return NextResponse.json({ error: "Lỗi hệ thống, vui lòng thử lại sau" }, { status: 500 });
    }
}