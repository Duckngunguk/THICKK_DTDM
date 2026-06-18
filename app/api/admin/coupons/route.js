import prisma from '@/lib/prisma'
import { requireAdmin } from '@/lib/adminAuth'

export async function GET(req) {
  try {
    await requireAdmin(req)
    const coupons = await prisma.coupon.findMany({ orderBy: { createdAt: 'desc' } })
    return new Response(JSON.stringify({ coupons }))
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message || err }), { status: err.status || 500 })
  }
}

export async function POST(req) {
  try {
    await requireAdmin(req)
    const body = await req.json()
    const { code, description, discount, forNewUser = false, forMember = false, isPublic = false, expiresAt } = body
    if (!code || !description || !discount || !expiresAt) return new Response(JSON.stringify({ error: 'Missing fields' }), { status: 400 })

    const exists = await prisma.coupon.findUnique({ where: { code } })
    if (exists) return new Response(JSON.stringify({ error: 'Coupon exists' }), { status: 400 })

    const created = await prisma.coupon.create({ data: {
      code,
      description,
      discount: parseFloat(discount),
      forNewUser: !!forNewUser,
      forMember: !!forMember,
      isPublic: !!isPublic,
      expiresAt: new Date(expiresAt)
    }})

    return new Response(JSON.stringify({ coupon: created }))
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message || err }), { status: err.status || 500 })
  }
}

export async function DELETE(req) {
  try {
    await requireAdmin(req)
    const body = await req.json()
    const { code } = body
    if (!code) return new Response(JSON.stringify({ error: 'Missing code' }), { status: 400 })
    await prisma.coupon.delete({ where: { code } })
    return new Response(JSON.stringify({ success: true }))
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message || err }), { status: err.status || 500 })
  }
}
