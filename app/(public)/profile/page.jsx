'use client'

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import toast from "react-hot-toast";
import Link from "next/link";

export default function ProfilePage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [name, setName] = useState("");
    const [image, setImage] = useState("");
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmNewPassword, setConfirmNewPassword] = useState("");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (status === "authenticated" && session?.user) {
            setName(session.user.name || "");
            setImage(session.user.image || "");
        }

        if (status === "unauthenticated") {
            router.push("/login?redirect=/profile");
        }
    }, [status, session, router]);

        useEffect(() => {
            const fetchStore = async () => {
                try {
                    const res = await fetch('/api/store/me')
                    if (!res.ok) return
                    const data = await res.json()
                    if (data.store) {
                        // show small banner if application pending
                        // no need to set state beyond showing message
                        if (data.store.status === 'pending') {
                            toast('Bạn đã đăng ký làm cửa hàng. Đang chờ admin xét duyệt.', { icon: 'ℹ️' })
                        } else if (!data.store.isActive) {
                            toast('Hồ sơ cửa hàng chưa hoạt động.', { icon: 'ℹ️' })
                        }
                    }
                } catch (e) {
                    // ignore
                }
            }

            if (status === 'authenticated') fetchStore()
        }, [status])

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            if (newPassword || confirmNewPassword) {
                if (!currentPassword) {
                    throw new Error("Vui lòng nhập mật khẩu hiện tại để đổi mật khẩu");
                }
                if (newPassword !== confirmNewPassword) {
                    throw new Error("Mật khẩu mới và xác nhận không khớp");
                }
                if (newPassword.length < 6) {
                    throw new Error("Mật khẩu mới phải có ít nhất 6 ký tự");
                }
            }

            const response = await fetch("/api/profile", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name,
                    image,
                    currentPassword,
                    newPassword,
                    confirmNewPassword,
                }),
            });

            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.error || "Cập nhật thất bại");
            }

            toast.success("Cập nhật thông tin thành công");
            setCurrentPassword("");
            setNewPassword("");
            setConfirmNewPassword("");
        } catch (err) {
            toast.error(err.message || "Có lỗi xảy ra");
        } finally {
            setLoading(false);
        }
    };

    if (status === "loading") {
        return (
            <main className="min-h-[calc(100vh-6rem)] flex items-center justify-center bg-slate-50 py-16">
                <div className="rounded-3xl bg-white p-10 shadow-xl text-center text-slate-700">Đang tải thông tin...</div>
            </main>
        );
    }

    return (
        <main className="min-h-[calc(100vh-6rem)] bg-slate-50 py-16">
            <div className="mx-auto max-w-3xl rounded-[2rem] bg-white p-10 shadow-xl">
                <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-3xl font-semibold text-slate-800">Trang cá nhân</h1>
                        <p className="mt-2 text-sm text-slate-500">Cập nhật thông tin tài khoản và mật khẩu.</p>
                    </div>
                    <Link href="/" className="inline-flex items-center rounded-full bg-slate-100 px-5 py-2 text-sm font-medium text-slate-700 hover:bg-slate-200">
                        Về trang chủ
                    </Link>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid gap-6 sm:grid-cols-2">
                        <label className="block text-sm font-medium text-slate-700">
                            Email
                            <input
                                type="email"
                                value={session?.user?.email || ""}
                                disabled
                                className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-100 px-4 py-3 text-sm text-slate-900 outline-none"
                            />
                        </label>

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
                    </div>

                    <label className="block text-sm font-medium text-slate-700">
                        Ảnh đại diện (URL)
                        <input
                            type="url"
                            value={image}
                            onChange={(e) => setImage(e.target.value)}
                            disabled={loading}
                            className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 disabled:bg-slate-100"
                            placeholder="https://example.com/avatar.jpg"
                        />
                    </label>

                    <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6">
                        <p className="mb-4 text-sm font-semibold text-slate-700">Đổi mật khẩu</p>
                        <div className="grid gap-6 sm:grid-cols-3">
                            <label className="block text-sm font-medium text-slate-700">
                                Mật khẩu hiện tại
                                <input
                                    type="password"
                                    value={currentPassword}
                                    onChange={(e) => setCurrentPassword(e.target.value)}
                                    disabled={loading}
                                    className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 disabled:bg-slate-100"
                                    placeholder="Nhập mật khẩu hiện tại"
                                />
                            </label>
                            <label className="block text-sm font-medium text-slate-700">
                                Mật khẩu mới
                                <input
                                    type="password"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    disabled={loading}
                                    className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 disabled:bg-slate-100"
                                    placeholder="Tạo mật khẩu mới"
                                />
                            </label>
                            <label className="block text-sm font-medium text-slate-700">
                                Xác nhận mật khẩu
                                <input
                                    type="password"
                                    value={confirmNewPassword}
                                    onChange={(e) => setConfirmNewPassword(e.target.value)}
                                    disabled={loading}
                                    className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 disabled:bg-slate-100"
                                    placeholder="Nhập lại mật khẩu mới"
                                />
                            </label>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full rounded-2xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:bg-indigo-400"
                    >
                        {loading ? "Đang cập nhật..." : "Lưu thay đổi"}
                    </button>
                </form>
            </div>
        </main>
    );
}
