import prisma from '@/lib/prisma'
import { requireAdmin } from '@/lib/adminAuth'

export async function GET(req) {
  try {
    await requireAdmin(req)

    const users = await prisma.user.findMany({ select: { id: true, name: true, email: true, role: true, isActive: true } })
    return new Response(JSON.stringify({ users }))
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message || err }), { status: err.status || 500 })
  }
}

export async function PUT(req) {
  try {
    await requireAdmin(req)

    const body = await req.json()
    const { userId, role, isActive } = body

    if (!userId) return new Response(JSON.stringify({ error: 'Missing userId' }), { status: 400 })

    const data = {}
    if (role) data.role = role
    if (typeof isActive === 'boolean') data.isActive = isActive

    if (!Object.keys(data).length) return new Response(JSON.stringify({ error: 'Nothing to update' }), { status: 400 })

    const updated = await prisma.user.update({ where: { id: userId }, data })
    return new Response(JSON.stringify({ user: { id: updated.id, role: updated.role, isActive: updated.isActive } }))
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message || err }), { status: err.status || 500 })
  }
}
