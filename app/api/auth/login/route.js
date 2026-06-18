import prisma from '@/lib/prisma'
import { comparePassword, signToken } from '@/lib/auth'

export async function POST(req) {
  try {
    const { email, password } = await req.json()
    if (!email || !password) return new Response(JSON.stringify({ error: 'Missing' }), { status: 400 })

    const user = await prisma.user.findUnique({ where: { email } })
    if (!user) return new Response(JSON.stringify({ error: 'Invalid credentials' }), { status: 401 })

    if (user.isActive === false) return new Response(JSON.stringify({ error: 'Tài khoản đã bị khóa' }), { status: 403 })

    const ok = await comparePassword(password, user.password)
    if (!ok) return new Response(JSON.stringify({ error: 'Invalid credentials' }), { status: 401 })

    const token = signToken(user)
    return new Response(JSON.stringify({ user: { id: user.id, email: user.email, role: user.role }, token }))
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 })
  }
}
