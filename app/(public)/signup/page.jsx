'use client'
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { signIn } from "next-auth/react";

export default function SignupPage() {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(false);

    const router = useRouter();

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (password !== confirmPassword) {
            toast.error('Mật khẩu xác nhận không khớp');
            return;
        }

        if (password.length < 6) {
            toast.error('Mật khẩu phải ít nhất 6 ký tự');
            return;
        }

        setLoading(true);

        try {
            // Signup
            const payload = { name, email, password, confirmPassword }

            const signupRes = await fetch('/api/auth/signup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            const resData = await signupRes.json()
            if (!signupRes.ok) {
                throw new Error(resData.error || 'Đăng ký thất bại');
            }

            if (resData.store) {
                toast.success('Đăng ký thành công! Hồ sơ cửa hàng đã được gửi, chờ admin duyệt.');
            } else {
                toast.success('Đăng ký thành công! Đang đăng nhập...');
            }

            // Auto login after signup
            const loginResult = await signIn('credentials', {
                email,
                password,
                redirect: false,
            });

            if (loginResult?.ok) {
                // if store application, redirect to profile where user can see status
                router.push(resData.store ? '/profile' : '/')
            } else {
                router.push('/login');
            }
        } catch (error) {
            toast.error(error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="min-h-[calc(100vh-6rem)] flex items-center justify-center bg-slate-50 py-16">
            <div className="w-full max-w-md rounded-[2rem] bg-white p-10 shadow-xl">
                <h1 className="text-3xl font-semibold text-slate-800">Đăng ký</h1>
                <p className="mt-3 text-sm text-slate-500">Tạo tài khoản mới để bắt đầu bán hàng hoặc mua sắm.</p>

                <form onSubmit={handleSubmit} className="mt-8 space-y-5">
                    <label className="block text-sm font-medium text-slate-700">
                        Họ và tên
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                            disabled={loading}
                            className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 disabled:bg-slate-100"
                            placeholder="Nguyễn Văn A"
                        />
                    </label>

                    {/* Removed becomeSeller checkbox; store registration moved to dedicated page */}

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
                            placeholder="Tạo mật khẩu"
                        />
                    </label>

                    <label className="block text-sm font-medium text-slate-700">
                        Xác nhận mật khẩu
                        <input
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                            disabled={loading}
                            className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 disabled:bg-slate-100"
                            placeholder="Nhập lại mật khẩu"
                        />
                    </label>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full rounded-2xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:bg-indigo-400"
                    >
                        {loading ? 'Đang đăng ký...' : 'Đăng ký'}
                    </button>
                </form>

                <p className="mt-6 text-center text-sm text-slate-500">
                    Đã có tài khoản?{' '}
                    <Link href="/login" className="font-medium text-indigo-600 hover:text-indigo-700">
                        Đăng nhập
                    </Link>
                </p>
            </div>
        </main>
    );
}
