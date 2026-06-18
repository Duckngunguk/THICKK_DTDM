'use client'
import { useEffect, useState } from 'react'
import Loading from '@/components/Loading'

export default function AdminReports() {
  const [loading, setLoading] = useState(true)
  const [report, setReport] = useState(null)

  const fetchReport = async () => {
    setLoading(true)
    const res = await fetch('/api/admin/reports')
    const data = await res.json()
    setReport(data)
    setLoading(false)
  }

  useEffect(() => { fetchReport() }, [])

  if (loading) return <Loading />

  return (
    <div className="text-slate-500 mb-28">
      <h1 className="text-2xl">Reports</h1>

      <div className="mt-6 max-w-2xl">
        <div className="bg-white p-4 border rounded mb-4">
          <p className="text-sm text-slate-600">Total Revenue</p>
          <b className="text-2xl">{report?.totalRevenue || 0}</b>
        </div>

        <div className="bg-white p-4 border rounded">
          <p className="text-sm text-slate-600">Revenue by Day</p>
          <ul className="mt-2">
            {report?.byDay?.map(d => (
              <li key={d.date} className="text-sm py-1">{d.date}: {d.revenue}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}
