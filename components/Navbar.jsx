'use client'
import { Search, ShoppingCart, LogOut, User } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useSelector } from "react-redux";
import { useSession, signOut } from "next-auth/react";

const Navbar = () => {

    const router = useRouter();
    const { data: session } = useSession();

    const [search, setSearch] = useState('')
    const cartCount = useSelector(state => state.cart.total)

    const handleSearch = (e) => {
        e.preventDefault()
        router.push(`/shop?search=${search}`)
    }

    const handleLogout = async () => {
        await signOut({ redirect: false });
        router.push('/');
    }

    return (
        <nav className="relative bg-white">
            <div className="mx-6">
                <div className="flex items-center justify-between max-w-7xl mx-auto py-4  transition-all">

                    <Link href="/" className="relative text-4xl font-semibold text-slate-700">
                        <span className="text-green-600">go</span>cart<span className="text-green-600 text-5xl leading-0">.</span>
                        <p className="absolute text-xs font-semibold -top-1 -right-8 px-3 p-0.5 rounded-full flex items-center gap-2 text-white bg-green-500">
                            plus
                        </p>
                    </Link>

                    {/* Desktop Menu */}
                    <div className="hidden sm:flex items-center gap-4 lg:gap-8 text-slate-600">
                        <Link href="/">Trang chủ</Link>
                        <Link href="/shop">Cửa hàng</Link>
                        <Link href="/">Về chúng tôi</Link>
                        <Link href="/">Liên hệ</Link>

                        <form onSubmit={handleSearch} className="hidden xl:flex items-center w-xs text-sm gap-2 bg-slate-100 px-4 py-3 rounded-full">
                            <Search size={18} className="text-slate-600" />
                            <input className="w-full bg-transparent outline-none placeholder-slate-600" type="text" placeholder="Tìm kiếm sản phẩm" value={search} onChange={(e) => setSearch(e.target.value)} required />
                        </form>

                        {session ? (
                            <>
                                <Link href="/cart" className="relative flex items-center gap-2 text-slate-600">
                                    <ShoppingCart size={18} />
                                    Giỏ hàng
                                    <span className="absolute -top-1 left-3 text-[8px] text-white bg-slate-600 size-3.5 rounded-full">{cartCount}</span>
                                </Link>
                                <Link href="/profile" className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-600 hover:bg-slate-200 transition">
                                    <User size={18} />
                                </Link>
                                <button onClick={handleLogout} className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-600 hover:bg-red-100 transition">
                                    <LogOut size={18} />
                                </button>
                            </>
                        ) : (
                            <>
                                <button type="button" onClick={() => router.push('/login?redirect=/cart')} className="relative flex items-center gap-2 text-slate-600">
                                    <ShoppingCart size={18} />
                                    Giỏ hàng
                                    <span className="absolute -top-1 left-3 text-[8px] text-white bg-slate-600 size-3.5 rounded-full">{cartCount}</span>
                                </button>
                                <Link href="/login" className="px-8 py-2 bg-indigo-500 hover:bg-indigo-600 transition text-white rounded-full">
                                    Đăng nhập
                                </Link>
                            </>
                        )}

                    </div>

                    {/* Mobile User Button  */}
                    <div className="sm:hidden">
                        {session ? (
                            <button onClick={handleLogout} className="px-7 py-1.5 bg-red-500 hover:bg-red-600 text-sm transition text-white rounded-full">
                                Đăng xuất
                            </button>
                        ) : (
                            <Link href="/login" className="px-7 py-1.5 bg-indigo-500 hover:bg-indigo-600 text-sm transition text-white rounded-full">
                                Đăng nhập
                            </Link>
                        )}
                    </div>
                </div>
            </div>
            <hr className="border-gray-300" />
        </nav>
    )
}

export default Navbar