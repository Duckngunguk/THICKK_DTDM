'use client'
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getSession, signIn } from "next-auth/react";
import toast from "react-hot-toast";

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [redirect, setRedirect] = useState('/');

    const router = useRouter();

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const redirectParam = params.get('redirect');
        setRedirect(redirectParam || '/');
    }, []);

   const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
        const result = await signIn('credentials', {
            email,
            password,
            redirect: false,
        });

        console.log(result);

        if (result?.error) {
            toast.error(result.error);
            return;
        }

        toast.success('Đăng nhập thành công!');

        // Đợi NextAuth cập nhật session
        setTimeout(async () => {
            const session = await getSession();

            console.log(session);

            let destination = redirect || '/';

            if (session?.user?.role === 'ADMIN') {
                destination = '/admin';
            } else if (session?.user?.role === 'STORE_OWNER') {
                destination = '/seller';
            }

            router.push(destination);
            router.refresh();
        }, 500);

    } catch (error) {
        console.error(error);
        toast.error('Lỗi đăng nhập');
    } finally {
        setLoading(false);
    }
};

    return (
        <main className="min-h-[calc(100vh-6rem)] flex items-center justify-center bg-slate-50 py-16">
            <div className="w-full max-w-md rounded-[2rem] bg-white p-10 shadow-xl">
                <h1 className="text-3xl font-semibold text-slate-800">Đăng nhập</h1>
                <p className="mt-3 text-sm text-slate-500">Nhập email và mật khẩu để tiếp tục.</p>

                <form onSubmit={handleSubmit} className="mt-8 space-y-5">
                    <label className="block text-sm font-medium text-slate-700">
                        Email
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            disabled={loading}
                            className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 disabled:bg-slate-100"
                            placeholder="you@example.com"
                        />
                    </label>

                    <label className="block text-sm font-medium text-slate-700">
                        Mật khẩu
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            disabled={loading}
                            className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 disabled:bg-slate-100"
                            placeholder="Nhập mật khẩu"
                        />
                    </label>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full rounded-2xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:bg-indigo-400"
                    >
                        {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
                    </button>
                </form>

                <div className="mt-6 flex items-center justify-between text-sm text-slate-500">
                    <Link href="/signup" className="font-medium text-indigo-600 hover:text-indigo-700">
                        Chưa có tài khoản? Đăng ký
                    </Link>
                   
                    <button type="button" className="font-medium text-slate-600 hover:text-slate-900">
                        Quên mật khẩu?
                    </button>
                </div>
                    <div className="bg-slate-50 p-3 rounded-xl flex items-center justify-between">
                        <span className="text-xs text-slate-500">Bạn muốn kinh doanh?</span>
                        <Link href="/register/seller" className="font-semibold text-xs text-indigo-600 hover:underline">
                            Đăng ký Kênh Người Bán ➔
                        </Link>
                    </div>
            </div>
        </main>
    );
}
