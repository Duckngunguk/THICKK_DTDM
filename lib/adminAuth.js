import { verifyToken } from './auth'
import prisma from './prisma'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'

export async function requireAdmin(req) {
  // 1) Try Authorization header JWT
  const auth = req.headers.get('authorization') || ''
  const [, token] = auth.split(' ')

  if (token) {
    const data = verifyToken(token)
    if (!data) throw new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 403 })
    const user = await prisma.user.findUnique({ where: { id: data.id } })
    if (!user || user.role !== 'ADMIN' || !user.isActive) throw new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 403 })
    return user
  }

  // 2) Try next-auth session (cookies)
  try {
    const session = await getServerSession(authOptions)
    if (session?.user?.email) {
      const user = await prisma.user.findUnique({ where: { email: session.user.email } })
      if (user && user.role === 'ADMIN' && user.isActive) return user
    }
  } catch (e) {
    // ignore and fallback
  }

  // 3) Non-production fallback to first admin (useful for local dev)
  if (process.env.NODE_ENV !== 'production') {
    const admin = await prisma.user.findFirst({ where: { role: 'ADMIN' } })
    if (admin) return admin
  }

  throw new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 403 })
}
