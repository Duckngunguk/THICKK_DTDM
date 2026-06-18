import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(req) {
  try {
    const url = new URL(req.url)
    const username = url.searchParams.get('username') || url.searchParams.get('u')
    if (!username) {
      return NextResponse.json({ error: 'username required' }, { status: 400 })
    }

    const store = await prisma.store.findUnique({ where: { username } })
    if (!store) return NextResponse.json({ error: 'not found' }, { status: 404 })

    return NextResponse.json({ store: { id: store.id, username: store.username, status: store.status, isActive: store.isActive } })
  } catch (err) {
    console.error('Store status error:', err)
    return NextResponse.json({ error: 'server error' }, { status: 500 })
  }
}
