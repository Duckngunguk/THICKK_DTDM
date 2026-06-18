'use client'
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Plus, Edit, Trash2 } from "lucide-react";

export default function SellerProducts() {
    const [products, setProducts] = useState([]);
    const [form, setForm] = useState({ id: "", name: "", description: "", mrp: "", price: "", category: "", stock: "" });
    const [isEditing, setIsEditing] = useState(false);

    useEffect(() => { loadProducts(); }, []);

    const loadProducts = async () => {
      try {
        const res = await fetch("/api/seller/products");
        const data = await res.json();

        if (!res.ok) {
            // Nếu có lỗi (403, 404, 500), quăng lỗi ra ngoài để hiển thị thông báo công khai
            throw new Error(data.error || "Không thể tải danh sách sản phẩm");
        }

        setProducts(data);
    } catch (error) {
        console.error("Lỗi kết nối API:", error);
        toast.error(error.message || "Lỗi hệ thống không thể đọc JSON");
    }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const url = isEditing ? `/api/seller/products/${form.id}` : "/api/seller/products";
        const method = isEditing ? "PUT" : "POST";

        const res = await fetch(url, {
            method,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(form)
        });

        if (res.ok) {
            toast.success(isEditing ? "Đã cập nhật sản phẩm!" : "Đã đăng bán sản phẩm mới!");
            setForm({ id: "", name: "", description: "", mrp: "", price: "", category: "", stock: "" });
            setIsEditing(false);
            loadProducts();
        }
    };

    const handleDelete = async (id) => {
        if (confirm("Bạn có chắc chắn muốn ngừng bán sản phẩm này?")) {
            const res = await fetch(`/api/seller/products/${id}`, { method: "DELETE" });
            if (res.ok) {
                toast.success("Đã ẩn sản phẩm khỏi gian hàng");
                loadProducts();
            }
        }
    };

    return (
        <div className="p-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-2xl border border-slate-100 h-fit">
                <h2 className="text-lg font-bold text-slate-800 mb-4">{isEditing ? "Sửa sản phẩm" : "Đăng sản phẩm mới"}</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <input type="text" required className="w-full border border-slate-200 p-3 rounded-xl text-sm" placeholder="Tên sản phẩm" value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
                    <textarea required className="w-full border border-slate-200 p-3 rounded-xl text-sm" placeholder="Mô tả..." rows={3} value={form.description} onChange={e => setForm({...form, description: e.target.value})} />
                    <div className="grid grid-cols-2 gap-4">
                        <input type="number" step="0.01" required className="w-full border border-slate-200 p-3 rounded-xl text-sm" placeholder="Giá niêm yết (MRP)" value={form.mrp} onChange={e => setForm({...form, mrp: e.target.value})} />
                        <input type="number" step="0.01" required className="w-full border border-slate-200 p-3 rounded-xl text-sm" placeholder="Giá bán thực tế" value={form.price} onChange={e => setForm({...form, price: e.target.value})} />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <input type="text" required className="w-full border border-slate-200 p-3 rounded-xl text-sm" placeholder="Danh mục" value={form.category} onChange={e => setForm({...form, category: e.target.value})} />
                        <input type="number" required className="w-full border border-slate-200 p-3 rounded-xl text-sm" placeholder="Số lượng kho" value={form.stock} onChange={e => setForm({...form, stock: e.target.value})} />
                    </div>
                    <button type="submit" className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl text-sm transition">
                        {isEditing ? "Lưu thay đổi" : "Đăng bán ngay"}
                    </button>
                </form>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-100 lg:col-span-2">
                <h2 className="text-lg font-bold text-slate-800 mb-4">Danh sách kho hàng số lượng</h2>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-slate-50 text-slate-500 uppercase text-xs font-bold">
                            <tr>
                                <th className="p-4">Sản phẩm</th>
                                <th className="p-4">Giá bán</th>
                                <th className="p-4">Tồn kho</th>
                                <th className="p-4 text-center">Hành động</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {products.map(p => (
                                <tr key={p.id} className="hover:bg-slate-50/50">
                                    <td className="p-4 font-semibold text-slate-800">{p.name}</td>
                                    <td className="p-4">${p.price}</td>
                                    <td className="p-4">
                                        <span className={`px-2 py-0.5 rounded-md font-bold text-xs ${p.stock < 5 ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>
                                            {p.stock} món
                                        </span>
                                    </td>
                                    <td className="p-4 flex justify-center gap-4">
                                        <button className="text-blue-600 hover:text-blue-800" onClick={() => { setIsEditing(true); setForm(p); }}><Edit size={16} /></button>
                                        <button className="text-red-600 hover:text-red-800" onClick={() => handleDelete(p.id)}><Trash2 size={16} /></button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}