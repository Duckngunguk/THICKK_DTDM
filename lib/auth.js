import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import prisma from './prisma'

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret'
const TOKEN_EXP = '7d'

export async function hashPassword(password) {
  return bcrypt.hash(password, 10)
}

export async function comparePassword(password, hash) {
  return bcrypt.compare(password, hash)
}

export function signToken(user) {
  const payload = { id: user.id, email: user.email, role: user.role }
  return jwt.sign(payload, JWT_SECRET, { expiresIn: TOKEN_EXP })
}

export function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET)
  } catch (e) {
    return null
  }
}

export async function getUserFromToken(token) {
  const data = verifyToken(token)
  if (!data) return null
  const user = await prisma.user.findUnique({ where: { id: data.id } })
  return user
}
