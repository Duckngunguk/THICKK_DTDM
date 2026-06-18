'use client'
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";

export default function RegisterSellerPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [uploadingLogo, setUploadingLogo] = useState(false);
    const [logoPreview, setLogoPreview] = useState(null);
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        storeName: "",
        storeUsername: "",
        storeEmail: "",
        storeContact: "",
        storeAddress: "",
        storeDescription: "",
        storeLogoUrl: ""
    });

    const validateUsername = (u) => {
        if (!u) return false
        // allow lowercase letters, numbers, hyphen and underscore, min 3
        return /^[a-z0-9_-]{3,}$/.test(u)
    }

    const uploadLogo = async (file) => {
        try {
            setUploadingLogo(true)
            const fd = new FormData()
            fd.append('file', file)

            const res = await fetch('/api/upload/logo', { method: 'POST', body: fd })

            const contentType = res.headers.get('content-type') || ''
            let data
            if (contentType.includes('application/json')) {
                data = await res.json()
            } else {
                // fallback: server returned HTML or plain text (e.g. error page)
                const text = await res.text()
                throw new Error(text || 'Upload failed')
            }

            if (!res.ok) throw new Error(data.error || 'Upload failed')
            setFormData(prev => ({ ...prev, storeLogoUrl: data.url }))
            setLogoPreview(data.url)
            return data.url
        } catch (err) {
            // If server returned HTML, err.message may contain HTML — show a friendly message
            const msg = (err && err.message) ? err.message : 'Upload lỗi'
            toast.error(msg.length > 200 ? 'Lỗi server khi upload. Kiểm tra console.' : msg)
            console.error('Upload error (client):', err)
            return null
        } finally {
            setUploadingLogo(false)
        }
    }

    const handleRegister = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            // client-side validation
            if (!formData.name || !formData.email || !formData.password || !formData.storeName || !formData.storeUsername) {
                throw new Error('Vui lòng điền đầy đủ các trường bắt buộc')
            }
            if (formData.password.length < 6) throw new Error('Mật khẩu phải có ít nhất 6 ký tự')
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
            if (!emailRegex.test(formData.email)) throw new Error('Email không hợp lệ')
            if (!validateUsername(formData.storeUsername)) throw new Error('Username cửa hàng không hợp lệ')

            const payload = {
                name: formData.name,
                email: formData.email,
                password: formData.password,
                storeName: formData.storeName,
                storeUsername: formData.storeUsername,
                storeEmail: formData.storeEmail,
                storeContact: formData.storeContact,
                storeAddress: formData.storeAddress,
                storeDescription: formData.storeDescription,
                storeLogoUrl: formData.storeLogoUrl
            }

            const res = await fetch("/api/auth/register-seller", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });

            const contentType = res.headers.get('content-type') || ''
            let data
            if (contentType.includes('application/json')) {
                data = await res.json()
            } else {
                const text = await res.text()
                console.error('Server returned non-JSON response:', text)
                throw new Error('Lỗi server: xem console để biết chi tiết')
            }

            if (!res.ok) {
                throw new Error(data.error || "Đăng ký thất bại");
            }

            toast.success("Đăng ký đối tác thành công! Chuyển sang trang chờ xét duyệt.");
            router.push(`/register/seller/status?u=${encodeURIComponent(formData.storeUsername)}`);
        } catch (error) {
            toast.error(error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-2xl shadow-xs">
                <div>
                    <h2 className="text-center text-3xl font-extrabold text-slate-800">
                        Đăng ký Kênh Người Bán
                    </h2>
                    <p className="mt-2 text-center text-sm text-slate-500">
                        Bắt đầu kinh doanh cùng <span className="text-green-600 font-bold">go</span>cart.
                    </p>
                </div>
                <form className="mt-8 space-y-4" onSubmit={handleRegister}>
                    <div className="grid grid-cols-1 gap-3">
                        <div className="flex flex-col gap-1">
                            <label className="text-sm font-medium text-slate-600">Tên người đại diện</label>
                            <input type="text" required className="border border-slate-200 p-3 rounded-xl outline-none" placeholder="Nguyễn Văn A" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                        </div>

                        <div className="flex flex-col gap-1">
                            <label className="text-sm font-medium text-slate-600">Email cá nhân</label>
                            <input type="email" required className="border border-slate-200 p-3 rounded-xl outline-none" placeholder="you@example.com" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                        </div>

                        <div className="flex flex-col gap-1">
                            <label className="text-sm font-medium text-slate-600">Tên Cửa hàng / Thương hiệu</label>
                            <input type="text" required className="border border-slate-200 p-3 rounded-xl outline-none" placeholder="Peony Memories Electronics" value={formData.storeName} onChange={e => setFormData({...formData, storeName: e.target.value})} />
                        </div>

                            <div className="flex flex-col gap-1">
                                <label className="text-sm font-medium text-slate-600">Tên đăng nhập cửa hàng (username)</label>
                                <input type="text" required className="border border-slate-200 p-3 rounded-xl outline-none" placeholder="username-cua-hang" value={formData.storeUsername} onChange={e => setFormData({...formData, storeUsername: e.target.value.toLowerCase()})} />
                                {!validateUsername(formData.storeUsername) && formData.storeUsername.length > 0 && (
                                    <p className="text-xs text-red-500">Username tối thiểu 3 kí tự, chỉ dùng chữ thường, số, - và _</p>
                                )}
                            </div>

                        <div className="flex flex-col gap-1">
                            <label className="text-sm font-medium text-slate-600">Email đăng ký</label>
                            <input type="email" required className="border border-slate-200 p-3 rounded-xl outline-none" placeholder="store@gmail.com" value={formData.storeEmail} onChange={e => setFormData({...formData, storeEmail: e.target.value})} />
                        </div>

                        <div className="flex flex-col gap-1">
                            <label className="text-sm font-medium text-slate-600">Số điện thoại liên hệ</label>
                            <input type="text" className="border border-slate-200 p-3 rounded-xl outline-none" placeholder="0123456789" value={formData.storeContact} onChange={e => setFormData({...formData, storeContact: e.target.value})} />
                        </div>

                        <div className="flex flex-col gap-1">
                            <label className="text-sm font-medium text-slate-600">Địa chỉ cửa hàng</label>
                            <input type="text" className="border border-slate-200 p-3 rounded-xl outline-none" placeholder="Địa chỉ kho / cửa hàng" value={formData.storeAddress} onChange={e => setFormData({...formData, storeAddress: e.target.value})} />
                        </div>

                        <div className="flex flex-col gap-1">
                            <label className="text-sm font-medium text-slate-600">Mô tả ngắn</label>
                            <textarea className="border border-slate-200 p-3 rounded-xl outline-none" placeholder="Giới thiệu ngắn về cửa hàng" value={formData.storeDescription} onChange={e => setFormData({...formData, storeDescription: e.target.value})} />
                        </div>

                        <div className="flex flex-col gap-1">
                            <label className="text-sm font-medium text-slate-600">Logo cửa hàng</label>
                            <input type="file" accept="image/*" className="" onChange={async (e)=>{
                                const f = e.target.files?.[0]
                                if (!f) return
                                const url = URL.createObjectURL(f)
                                setLogoPreview(url)
                                await uploadLogo(f)
                            }} />
                            {uploadingLogo && <p className="text-sm text-slate-500">Đang tải ảnh...</p>}
                            {logoPreview && (
                                <img src={logoPreview} alt="logo preview" className="w-28 h-28 object-contain mt-2 rounded" />
                            )}
                        </div>

                        <div className="flex flex-col gap-1">
                            <label className="text-sm font-medium text-slate-600">Mật khẩu</label>
                            <input type="password" required className="border border-slate-200 p-3 rounded-xl outline-none" placeholder="••••••••" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} />
                        </div>
                    </div>

                    <button type="submit" disabled={loading} className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold transition disabled:bg-slate-300">
                        {loading ? "Đang xử lý khởi tạo hệ thống..." : "Đăng ký mở cửa hàng"}
                    </button>
                </form>

                <p className="text-center text-sm text-slate-500 mt-4">
                    Bạn đã có tài khoản cửa hàng?{" "}
                    <Link href="/login" className="text-indigo-600 font-semibold hover:underline">
                        Đăng nhập ngay
                    </Link>
                </p>
            </div>
        </div>
    );
}