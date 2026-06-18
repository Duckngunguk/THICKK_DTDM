'use client'
import { useEffect, useState } from 'react'
import Loading from '@/components/Loading'

export default function AdminCategories() {
  const [loading, setLoading] = useState(true)
  const [categories, setCategories] = useState([])
  const [name, setName] = useState('')

  const fetchCategories = async () => {
    setLoading(true)
    const res = await fetch('/api/admin/categories')
    const data = await res.json()
    setCategories(data.categories || [])
    setLoading(false)
  }

  const handleAdd = async (e) => {
    e.preventDefault()
    await fetch('/api/admin/categories', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name }) })
    setName('')
    fetchCategories()
  }

  useEffect(() => { fetchCategories() }, [])

  if (loading) return <Loading />

  return (
    <div className="text-slate-500 mb-28">
      <h1 className="text-2xl">Manage <span className="text-slate-800 font-medium">Categories</span></h1>

      <form onSubmit={handleAdd} className="max-w-sm mt-4">
        <input className="w-full p-2 border border-slate-200 rounded" placeholder="Category name" value={name} onChange={(e)=>setName(e.target.value)} />
        <button className="mt-2 px-4 py-2 bg-slate-700 text-white rounded">Add</button>
      </form>

      <div className="mt-6">
        <ul className="divide-y divide-slate-200 max-w-md bg-white border rounded">
          {categories.map(c => (
            <li key={c.id} className="p-3">{c.name}</li>
          ))}
        </ul>
      </div>
    </div>
  )
}
