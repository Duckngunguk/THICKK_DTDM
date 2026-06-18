'use client'
import { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'

export default function SellerStatusPage() {
  const params = useSearchParams()
  const router = useRouter()
  const username = params.get('u') || params.get('username')
  const [loading, setLoading] = useState(false)
  const [store, setStore] = useState(null)
  const [error, setError] = useState(null)

  const fetchStatus = async () => {
    if (!username) return
    setLoading(true)
    try {
      const res = await fetch(`/api/store/status?u=${encodeURIComponent(username)}`)
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Không lấy được trạng thái')
      setStore(data.store)
      setError(null)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStatus()
    const id = setInterval(fetchStatus, 5000)
    return () => clearInterval(id)
  }, [username])

  if (!username) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="p-8 bg-white rounded shadow">Thiếu username cửa hàng trong URL.</div>
      </main>
    )
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-slate-50 py-12">
      <div className="max-w-lg w-full bg-white p-8 rounded-2xl shadow">
        <h2 className="text-2xl font-semibold mb-4">Trạng thái đăng ký cửa hàng</h2>
        <p className="text-sm text-slate-600 mb-4">Tài khoản: <strong>{username}</strong></p>

        {loading && <p>Đang kiểm tra...</p>}
        {error && <p className="text-red-500">Lỗi: {error}</p>}

        {store && (
          <div className="space-y-3">
            <p>Trạng thái: <strong>{store.status}</strong></p>
            <p>Hoạt động: <strong>{store.isActive ? 'Đã kích hoạt' : 'Chưa kích hoạt'}</strong></p>
            {!store.isActive && store.status === 'pending' && (
              <p className="text-sm text-slate-500">Hệ thống sẽ tự động cập nhật khi admin xét duyệt. Bạn có thể đăng nhập để theo dõi.</p>
            )}
            <div className="flex gap-2 mt-4">
              <Link href="/login" className="px-4 py-2 bg-indigo-600 text-white rounded">Đăng nhập</Link>
              <button onClick={fetchStatus} className="px-4 py-2 border rounded">Làm mới</button>
            </div>
          </div>
        )}

        {!store && !loading && !error && (
          <p className="text-sm text-slate-500">Không tìm thấy thông tin cửa hàng.</p>
        )}
      </div>
    </main>
  )
}
