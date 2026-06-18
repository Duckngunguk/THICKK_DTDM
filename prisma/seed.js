import prismaPkg from '@prisma/client'
import bcrypt from 'bcryptjs'
import dotenv from 'dotenv'
dotenv.config()

const { PrismaClient } = prismaPkg
const prisma = new PrismaClient()

async function main() {
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@example.com'
  const existing = await prisma.user.findUnique({ where: { email: adminEmail } })
  const hashed = await bcrypt.hash(process.env.ADMIN_PASSWORD || 'adminpass', 10)
  if (!existing) {
    await prisma.user.create({ data: { id: 'admin-1', name: 'Administrator', email: adminEmail, password: hashed, role: 'ADMIN', isActive: true, cart: {} } })
    console.log('Admin user created:', adminEmail)
  } else {
    console.log('Admin exists')
  }

  // Create sample categories if not present
  const categories = ['Electronics', 'Clothing', 'Home', 'Books']
  for (const c of categories) {
    const exists = await prisma.category.findUnique({ where: { name: c } })
    if (!exists) {
      await prisma.category.create({ data: { name: c } })
    }
  }
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
