import prisma from '@/lib/prisma'

export async function GET(req, { params }) {
  try {
    const ratings = await prisma.rating.findMany({
      where: {
        productId: params.productId
      },
      include: {
        user: {
          select: {
            name: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return Response.json(ratings)

  } catch (error) {
    return Response.json(
      { error: error.message },
      { status: 500 }
    )
  }
}