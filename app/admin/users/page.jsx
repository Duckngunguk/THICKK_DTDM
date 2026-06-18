'use client'
import { useEffect, useState } from 'react'
import Loading from '@/components/Loading'

export default function AdminUsers() {
  const [loading, setLoading] = useState(true)
  const [users, setUsers] = useState([])

  const fetchUsers = async () => {
    setLoading(true)
    const res = await fetch('/api/admin/users', { credentials: 'include' })
    const data = await res.json()
    if (!res.ok) {
      console.error('Failed to fetch users', data)
      setUsers([])
    } else {
      setUsers(data.users || [])
    }
    setLoading(false)
  }

  const toggleActive = async (user) => {
    const res = await fetch('/api/admin/users', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ userId: user.id, isActive: !user.isActive })
    })
    const data = await res.json()
    if (!res.ok) console.error('Update user failed', data)
    fetchUsers()
  }

  useEffect(() => { fetchUsers() }, [])

  if (loading) return <Loading />

  return (
    <div className="text-slate-500 mb-32">
      <h1 className="text-2xl">Manage <span className="text-slate-800 font-medium">Users</span></h1>

      <div className="mt-6 overflow-x-auto rounded-lg border border-slate-200 max-w-4xl">
        <table className="min-w-full bg-white text-sm">
          <thead className="bg-slate-50">
            <tr>
              <th className="py-3 px-4 text-left font-semibold text-slate-600">Name</th>
              <th className="py-3 px-4 text-left font-semibold text-slate-600">Email</th>
              <th className="py-3 px-4 text-left font-semibold text-slate-600">Role</th>
              <th className="py-3 px-4 text-left font-semibold text-slate-600">Active</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {users.map(u => (
              <tr key={u.id} className="hover:bg-slate-50">
                <td className="py-3 px-4 font-medium text-slate-800">{u.name}</td>
                <td className="py-3 px-4 text-slate-800">{u.email}</td>
                <td className="py-3 px-4 text-slate-800">{u.role}</td>
                <td className="py-3 px-4 text-slate-800">
                  <input type="checkbox" checked={u.isActive} onChange={() => toggleActive(u)} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
