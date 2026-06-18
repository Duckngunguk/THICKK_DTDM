'use client'
import { useEffect, useState } from 'react'
import Loading from '@/components/Loading'
import StoreInfo from '@/components/admin/StoreInfo'

export default function AdminSellers() {
  const [loading, setLoading] = useState(true)
  const [stores, setStores] = useState([])

  const fetchStores = async () => {
    setLoading(true)
    const res = await fetch('/api/admin/stores')
    const data = await res.json()
    setStores(data.stores || [])
    setLoading(false)
  }

  const toggleActive = async (store) => {
    await fetch('/api/admin/stores', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ storeId: store.id, isActive: !store.isActive })
    })
    fetchStores()
  }

  const handleApprove = async (storeId, status) => {
    await fetch('/api/admin/stores', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ storeId, status })
    })
    fetchStores()
  }

  useEffect(() => { fetchStores() }, [])

  if (loading) return <Loading />

  return (
    <div className="text-slate-500 mb-28">
      <h1 className="text-2xl">Quản lý <span className="text-slate-800 font-medium">Người Bán</span></h1>

      {stores.length ? (
        <div className="flex flex-col gap-4 mt-4">
          {stores.map((store) => (
            <div key={store.id} className="bg-white border rounded-lg shadow-sm p-6 flex max-md:flex-col gap-4 md:items-end max-w-4xl" >
              <StoreInfo store={store} />

              <div className="flex gap-3 pt-2 flex-wrap">
                <button onClick={() => handleApprove(store.id, 'approved')} className="px-4 py-2 bg-green-600 text-white rounded">Duyệt</button>
                <button onClick={() => handleApprove(store.id, 'rejected')} className="px-4 py-2 bg-slate-500 text-white rounded">Từ chối</button>
                <label className="flex items-center gap-2">
                  Kích hoạt
                  <input type="checkbox" checked={store.isActive} onChange={() => toggleActive(store)} />
                </label>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex items-center justify-center h-80">
          <h1 className="text-3xl text-slate-400 font-medium">Không có cửa hàng nào</h1>
        </div>
      )}
    </div>
  )
}
