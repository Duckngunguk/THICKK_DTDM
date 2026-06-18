import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { requireAdmin } from '@/lib/adminAuth'

export async function GET(req) {
  try {
    await requireAdmin(req)
    const url = new URL(req.url)
    const status = url.searchParams.get('status')

    const where = {}
    if (status) where.status = status

    const stores = await prisma.store.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: { user: true }
    })

    return NextResponse.json({ stores })
  } catch (err) {
    console.error('Admin get stores error:', err)
    return NextResponse.json({ error: err.message || 'server error' }, { status: 500 })
  }
}

export async function PUT(req) {
  try {
    await requireAdmin(req)
    const body = await req.json()
    const { storeId, status, isActive } = body
    if (!storeId) return NextResponse.json({ error: 'storeId required' }, { status: 400 })

    const data = {}
    if (typeof isActive === 'boolean') data.isActive = isActive
    if (typeof status === 'string') data.status = status

    // If admin approves, ensure isActive true
    if (status === 'approved') data.isActive = true

    if (!Object.keys(data).length) return NextResponse.json({ error: 'Nothing to update' }, { status: 400 })

    const updated = await prisma.store.update({ where: { id: storeId }, data })

    return NextResponse.json({ store: updated })
  } catch (err) {
    console.error('Admin update stores error:', err)
    return NextResponse.json({ error: err.message || 'server error' }, { status: 500 })
  }
}
