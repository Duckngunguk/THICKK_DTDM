import prisma from '@/lib/prisma'
import { requireAdmin } from '@/lib/adminAuth'

export async function GET(req) {
  try {
    await requireAdmin(req)
    const categories = await prisma.category.findMany({ orderBy: { createdAt: 'desc' } })
    return new Response(JSON.stringify({ categories }))
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message || err }), { status: err.status || 500 })
  }
}

export async function POST(req) {
  try {
    await requireAdmin(req)
    const { name } = await req.json()
    if (!name) return new Response(JSON.stringify({ error: 'Missing name' }), { status: 400 })
    const created = await prisma.category.create({ data: { name } })
    return new Response(JSON.stringify({ category: created }))
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message || err }), { status: err.status || 500 })
  }
}

export async function PUT(req) {
  try {
    await requireAdmin(req)
    const { id, name } = await req.json()
    if (!id || !name) return new Response(JSON.stringify({ error: 'Missing' }), { status: 400 })
    const updated = await prisma.category.update({ where: { id }, data: { name } })
    return new Response(JSON.stringify({ category: updated }))
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message || err }), { status: err.status || 500 })
  }
}

export async function DELETE(req) {
  try {
    await requireAdmin(req)
    const { id } = await req.json()
    if (!id) return new Response(JSON.stringify({ error: 'Missing id' }), { status: 400 })
    await prisma.category.delete({ where: { id } })
    return new Response(JSON.stringify({ success: true }))
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message || err }), { status: err.status || 500 })
  }
}
