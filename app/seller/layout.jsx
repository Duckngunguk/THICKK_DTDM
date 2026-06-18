'use client'
import Link from "next/link";
// Import thêm các icon cần thiết cho kho hàng và đơn hàng
import { LayoutDashboard, ShoppingBag, ClipboardList, LogOut } from "lucide-react"; 
import { signOut } from "next-auth/react";

export default function SellerLayout({ children }) {
    return (
        <div className="min-h-screen flex bg-slate-50 text-slate-800">
            {/* Sidebar cố định bên trái */}
            <aside className="w-64 bg-white border-r border-slate-200 flex flex-col justify-between p-6 fixed h-full z-10">
                <div className="space-y-8">
                    {/* Logo thương hiệu */}
                    <Link href="/seller" className="text-xl font-bold block text-slate-700">
                        <span className="text-green-600">go</span>cart <span className="text-xs bg-indigo-100 text-indigo-600 px-2 py-0.5 rounded-md">Seller</span>
                    </Link>
                    
                    {/* Hệ thống Menu Tính năng */}
                    <nav className="flex flex-col gap-1">
                        <div className="text-[10px] uppercase tracking-wider text-slate-400 font-bold px-3 mb-2">Bảng điều khiển</div>
                        
                        {/* 1. Xem doanh thu & Thống kê tổng quan */}
                        <Link href="/seller" className="flex items-center gap-3 p-3 text-slate-600 hover:bg-slate-50 rounded-xl text-sm font-medium transition">
                            <LayoutDashboard size={18} /> Doanh thu & Tổng quan
                        </Link>

                        {/* 2. Quản lý kho hàng (Đăng, Sửa, Xóa mềm sản phẩm) */}
                        <Link href="/seller/products" className="flex items-center gap-3 p-3 text-slate-600 hover:bg-slate-50 rounded-xl text-sm font-medium transition">
                            <ShoppingBag size={18} /> Kho hàng hóa (CRUD)
                        </Link>

                        {/* 3. Quản lý và Xác nhận đơn hàng đặt mua */}
                        <Link href="/seller/orders" className="flex items-center gap-3 p-3 text-slate-600 hover:bg-slate-50 rounded-xl text-sm font-medium transition">
                            <ClipboardList size={18} /> Đơn đặt hàng
                        </Link>
                    </nav>
                </div>

                {/* Nút đăng xuất tài khoản thoát kênh */}
                <button 
                    onClick={() => signOut({ callbackUrl: "/" })} 
                    className="flex items-center gap-3 p-3 w-full text-red-600 hover:bg-red-50 rounded-xl text-sm font-medium transition cursor-pointer"
                >
                    <LogOut size={18} /> Thoát Kênh người bán
                </button>
            </aside>

            {/* Nội dung hiển thị động bên phải (Trang con ứng với URL sẽ được render tại {children}) */}
            <main className="flex-1 ml-64 min-h-screen">
                {children}
            </main>
        </div>
    );
}