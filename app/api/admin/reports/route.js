import prisma from '@/lib/prisma'
import { requireAdmin } from '@/lib/adminAuth'

export async function GET(req) {
  try {
    await requireAdmin(req)

    const orders = await prisma.order.findMany({ select: { total: true, createdAt: true } })

    const totalRevenue = orders.reduce((s, o) => s + (o.total || 0), 0)
    const totalOrders = orders.length

    // Group by day (YYYY-MM-DD)
    const byDay = {}
    orders.forEach((o) => {
      const d = o.createdAt.toISOString().slice(0, 10)
      byDay[d] = (byDay[d] || 0) + (o.total || 0)
    })

    const byDayArray = Object.keys(byDay).sort().map((k) => ({ date: k, revenue: byDay[k] }))

    return new Response(JSON.stringify({ totalRevenue, totalOrders, byDay: byDayArray }))
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message || err }), { status: err.status || 500 })
  }
}
