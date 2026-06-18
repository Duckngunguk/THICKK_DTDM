import prisma from '@/lib/prisma'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../../auth/[...nextauth]/route'

export async function GET(req) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 })

    const user = await prisma.user.findUnique({ where: { email: session.user.email } })
    if (!user) return new Response(JSON.stringify({ error: 'Not found' }), { status: 404 })

    const store = await prisma.store.findUnique({ where: { userId: user.id } })
    return new Response(JSON.stringify({ store }))
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 })
  }
}
